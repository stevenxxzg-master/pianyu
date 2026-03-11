# frozen_string_literal: true

require 'fileutils'
require 'json'
require 'net/http'
require 'open3'
require 'pathname'
require 'time'
require 'yaml'

module ReleasePerformanceBaseline
  class << self
    def profile
      @profile ||= begin
        document = Rails.root.join('docs', 'RELEASE_PERFORMANCE_BASELINE.md').read
        match = document.match(/## Automation data\n.*?```yaml\n(?<yaml>.*?)```/m)
        raise 'Automation data block missing from docs/RELEASE_PERFORMANCE_BASELINE.md' unless match

        YAML.safe_load(match[:yaml], permitted_classes: [], aliases: false).deep_symbolize_keys
      end
    end

    def collector
      @collector ||= Collector.new(profile: profile)
    end

    def output_dir
      Pathname.new(ENV.fetch('RELEASE_PERFORMANCE_BASELINE_OUTPUT_DIR', Rails.root.join('tmp', 'release_performance_baseline').to_s))
    end
  end

  class Collector
    def initialize(profile:)
      @profile = profile
      @flows = {}
    end

    def record(flow_key, observed:, evidence: {}, notes: [])
      config = @profile.fetch(:flows).fetch(flow_key)
      metrics = evaluate_metrics(config.fetch(:metrics), observed)
      @flows[flow_key] = {
        key: flow_key,
        label: config.fetch(:label),
        evidence: Array(config[:evidence]),
        observed: observed,
        metrics: metrics,
        status: overall_status(metrics),
        notes: Array(notes).compact,
        runtime_evidence: evidence,
      }
    end

    def overall_status_for_run
      statuses = ordered_flows.values.map { |flow| flow.fetch(:status) }
      return 'fail' if statuses.include?('fail')
      return 'risk' if statuses.include?('risk')

      'pass'
    end

    def flush!
      output_dir = ReleasePerformanceBaseline.output_dir
      FileUtils.rm_rf(output_dir)
      FileUtils.mkdir_p(output_dir)

      payload = {
        generated_at: Time.now.utc.iso8601,
        overall_status: overall_status_for_run,
        flows: ordered_flows,
      }

      output_dir.join('results.json').write(JSON.pretty_generate(payload))
      output_dir.join('summary.md').write(render_summary(payload))
    end

    private

    def evaluate_metrics(metric_config, observed)
      metric_config.to_h do |metric_key, config|
        actual = observed[metric_key]
        status = metric_status(actual, config)

        [metric_key, config.merge(actual: actual, status: status)]
      end
    end

    def metric_status(actual, config)
      return config.fetch(:missing, 'risk').to_s if actual.nil?

      passed = case config.fetch(:operator)
               when '<='
                 actual <= config.fetch(:threshold)
               when '<'
                 actual < config.fetch(:threshold)
               when '=='
                 actual == config.fetch(:threshold)
               else
                 raise "Unsupported operator: #{config.fetch(:operator)}"
               end

      passed ? 'pass' : 'fail'
    end

    def overall_status(metrics)
      statuses = metrics.values.map { |metric| metric.fetch(:status) }
      return 'fail' if statuses.include?('fail')
      return 'risk' if statuses.include?('risk')

      'pass'
    end

    def render_summary(payload)
      lines = []
      lines << '# Release Performance Baseline Summary'
      lines <<
        "\n- Generated at: `#{payload.fetch(:generated_at)}`\n- Overall status: `#{payload.fetch(:overall_status).upcase}`"

      payload.fetch(:flows).each_value do |flow|
        lines << "\n## #{flow.fetch(:label)}"
        lines << "\n- Flow status: `#{flow.fetch(:status).upcase}`"
        lines << "- Evidence anchors: #{flow.fetch(:evidence).map { |path| "`#{path}`" }.join(', ')}"
        lines << "\n| Metric | Observed | Threshold | Status |"
        lines << '| --- | --- | --- | --- |'

        flow.fetch(:metrics).each_value do |metric|
          lines << [
            metric.fetch(:label),
            format_value(metric[:actual], metric.fetch(:unit)),
            "#{metric.fetch(:operator)} #{format_value(metric.fetch(:threshold), metric.fetch(:unit))}",
            metric.fetch(:status).upcase,
          ].join(' | ').prepend('| ').concat(' |')
        end

        if flow.fetch(:runtime_evidence).any?
          lines << "\n### Runtime Evidence"
          flow.fetch(:runtime_evidence).each do |key, value|
            lines << "- #{humanize_key(key)}: #{format_runtime_evidence(value)}"
          end
        end

        next unless flow.fetch(:notes).any?

        lines << "\n### Notes"
        flow.fetch(:notes).each do |note|
          lines << "- #{note}"
        end
      end

      "#{lines.join("\n")}\n"
    end

    def format_value(value, unit)
      return '`missing`' if value.nil?

      case unit
      when 'bytes'
        format('`%.2f MiB`', value.to_f / 1024 / 1024)
      when 'ms'
        format('`%.1f ms`', value.to_f)
      when 'percent'
        format('`%.1f%%`', value.to_f)
      when 'ratio'
        format('`%.3f`', value.to_f)
      when 'boolean'
        value ? '`true`' : '`false`'
      else
        "`#{value}`"
      end
    end

    def ordered_flows
      @profile.fetch(:flows).each_key.with_object({}) do |flow_key, ordered|
        flow = @flows[flow_key]
        ordered[flow_key] = flow if flow
      end
    end

    def humanize_key(key)
      key.to_s.tr('_', ' ')
    end

    def format_runtime_evidence(value)
      case value
      when Array, Hash
        "`#{JSON.generate(value)}`"
      when TrueClass, FalseClass, NilClass
        "`#{value.inspect}`"
      else
        "`#{value}`"
      end
    end
  end

  module Helpers
    private

    def record_baseline(flow_key, observed:, evidence: {}, notes: [])
      ReleasePerformanceBaseline.collector.record(flow_key, observed: observed, evidence: evidence, notes: notes)
    end

    def flush_baseline_results!
      ReleasePerformanceBaseline.collector.flush!
    end

    def iterations_for(key)
      ReleasePerformanceBaseline.profile.fetch(:iterations).fetch(key)
    end

    def app_uri(path)
      URI.join(Capybara.app_host, path)
    end

    def json_response(method, path, token:, form: nil)
      uri = app_uri(path)
      request = build_request(method, uri, token: token, form: form)
      started_at = monotonic_ms
      response = Net::HTTP.start(uri.host, uri.port) { |http| http.request(request) }
      elapsed = monotonic_ms - started_at

      [response, elapsed]
    end

    def plain_response(path)
      uri = app_uri(path)
      request = Net::HTTP::Get.new(uri)
      started_at = monotonic_ms
      response = Net::HTTP.start(uri.host, uri.port) { |http| http.request(request) }

      [response, monotonic_ms - started_at]
    end

    def build_request(method, uri, token:, form: nil)
      request = case method.to_s.downcase
                when 'get'
                  Net::HTTP::Get.new(uri)
                when 'post'
                  Net::HTTP::Post.new(uri)
                else
                  raise "Unsupported HTTP method: #{method}"
                end
      request['Authorization'] = "Bearer #{token.token}"
      request['Content-Type'] = 'application/x-www-form-urlencoded' if form.present?
      request.set_form_data(form) if form.present?
      request
    end

    def monotonic_ms
      Process.clock_gettime(Process::CLOCK_MONOTONIC, :float_millisecond)
    end

    def process_cpu_percent(start_cpu, start_wall)
      end_cpu = Process.clock_gettime(Process::CLOCK_PROCESS_CPUTIME_ID, :float_second)
      end_wall = monotonic_ms
      wall_seconds = (end_wall - start_wall) / 1000.0
      return 0.0 if wall_seconds <= 0

      ((end_cpu - start_cpu) / wall_seconds) * 100
    end

    def process_rss_bytes(pid = Process.pid)
      rss_kb = Open3.capture2('ps', '-o', 'rss=', '-p', pid.to_s).first.to_i
      rss_kb * 1024
    end

    def navigation_entry
      entry = page.evaluate_script(<<~JS)
        (() => {
          const [navigation] = performance.getEntriesByType('navigation').slice(-1);
          return navigation ? navigation.toJSON() : null;
        })();
      JS

      entry&.deep_symbolize_keys
    end

    def scrape_streaming_metrics
      response = Net::HTTP.get_response(URI("http://#{STREAMING_HOST}:#{STREAMING_PORT}/metrics"))
      parse_prometheus_metrics(response.body)
    end

    def scrape_streaming_health
      Net::HTTP.get_response(URI("http://#{STREAMING_HOST}:#{STREAMING_PORT}/api/v1/streaming/health"))
    end

    def parse_prometheus_metrics(body)
      body.each_line.with_object({}) do |line, acc|
        next if line.start_with?('#') || line.strip.empty?

        match = line.match(/\A(?<name>[a-zA-Z_:][a-zA-Z0-9_:]*)(?<labels>\{[^}]+\})?\s+(?<value>-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*\z/)
        next unless match

        labels = parse_prometheus_labels(match[:labels])
        acc[[match[:name], labels]] = match[:value].to_f
      end
    end

    def parse_prometheus_labels(raw_labels)
      return {} if raw_labels.blank?

      raw_labels.delete_prefix('{').delete_suffix('}').split(',').to_h do |entry|
        key, value = entry.split('=', 2)
        [key, value.delete_prefix('"').delete_suffix('"')]
      end
    end

    def metric_value(metrics, name, labels = {})
      metrics[[name, labels]]
    end

    def redis_stats
      redis.info('stats').merge(redis.info('memory'))
    end

    def wait_until(timeout: 10)
      deadline = Process.clock_gettime(Process::CLOCK_MONOTONIC) + timeout
      loop do
        result = yield
        return result if result
        raise Timeout::Error, 'Timed out waiting for condition' if Process.clock_gettime(Process::CLOCK_MONOTONIC) >= deadline

        sleep 0.1
      end
    end

    def signed_out_homepage_sample
      response, response_ms = plain_response('/')
      visit root_path
      expect(page).to have_css('body', class: 'public-page-body')
      expect(page).to have_css('.public-page--landing')
      nav = navigation_entry

      {
        response_ms: response_ms,
        app_shell_ms: nav&.fetch(:domComplete, nil) || nav&.fetch(:duration, nil),
        response_code: response.code.to_i,
      }
    end

    def signed_in_homepage_sample(_user)
      start_wall = monotonic_ms
      start_cpu = Process.clock_gettime(Process::CLOCK_PROCESS_CPUTIME_ID, :float_second)
      visit root_path
      expect(page).to have_css('div.app-holder')
      expect(page).to have_css('form.compose-form')
      nav = navigation_entry
      response_ms = (nav.fetch(:responseEnd) - nav.fetch(:requestStart) if nav&.fetch(:responseEnd, nil) && nav.fetch(:requestStart, nil))

      {
        response_ms: response_ms,
        app_shell_ms: nav&.fetch(:domComplete, nil) || nav&.fetch(:duration, nil) || (monotonic_ms - start_wall),
        response_code: nav&.fetch(:responseStatus, nil),
        web_cpu_percent: process_cpu_percent(start_cpu, start_wall),
        web_rss_bytes: process_rss_bytes,
      }
    end

    def timeline_statuses_for(account, count: 9)
      Array.new(count) { |index| PostStatusService.new.call(account, text: "Timeline sample #{index}-#{SecureRandom.hex(4)}") }
    end

    def capture_notifications_probe(actor_user:, seed_status:, token:)
      streaming_before = scrape_streaming_metrics
      streaming_health = scrape_streaming_health
      streaming_client.authenticate(token.token)
      streaming_client.connect
      streaming_client.subscribe('user:notification')

      delivery_started = monotonic_ms
      ReblogService.new.call(actor_user.account, seed_status)
      message = streaming_client.wait_for_message
      delivery_ms = monotonic_ms - delivery_started

      notifications_response, notifications_api_ms = json_response('get', '/api/v2/notifications', token: token)
      drain_started = monotonic_ms
      Sidekiq::Worker.drain_all
      drain_ms = monotonic_ms - drain_started
      streaming_client.close
      streaming_after = scrape_streaming_metrics

      {
        before_clients: metric_value(streaming_before, 'connected_clients', { 'type' => 'websocket' }).to_i,
        after_clients: metric_value(streaming_after, 'connected_clients', { 'type' => 'websocket' }).to_i,
        before_channels: metric_value(streaming_before, 'connected_channels', { 'type' => 'websocket', 'channel' => 'user:notification' }).to_i,
        after_channels: metric_value(streaming_after, 'connected_channels', { 'type' => 'websocket', 'channel' => 'user:notification' }).to_i,
        delivery_ms: delivery_ms,
        drain_ms: drain_ms,
        message: message,
        notifications_api_ms: notifications_api_ms,
        notifications_response: notifications_response,
        streaming_after: streaming_after,
        streaming_health: streaming_health,
      }
    end

    def capture_timeline_api_probe(token:)
      first_page_response, = json_response('get', '/api/v1/timelines/home?limit=20', token: token)
      first_page = Oj.load(first_page_response.body)
      max_id = first_page.last&.fetch('id')
      pagination_response, timeline_pagination_ms = json_response('get', "/api/v1/timelines/home?limit=20&max_id=#{max_id}", token: token)

      {
        first_page: first_page,
        first_page_response: first_page_response,
        pagination_response: pagination_response,
        timeline_pagination_ms: timeline_pagination_ms,
      }
    end

    def capture_timeline_render_probe
      visit root_path
      expect(page).to have_css('div.app-holder')

      initial_count = page.all('[role="feed"] .status__content__text', minimum: 1).count
      load_more_clicked = page.evaluate_script(<<~JS)
        (() => {
          const button = document.querySelector('button.load-more');
          if (!button) {
            return false;
          }

          button.click();
          return true;
        })()
      JS

      append_render_ms = nil
      if load_more_clicked
        render_started = monotonic_ms
        begin
          wait_until(timeout: 5) { page.all('[role="feed"] .status__content__text').count > initial_count }
          append_render_ms = monotonic_ms - render_started
        rescue Timeout::Error
          append_render_ms = nil
        end
      end

      {
        append_render_ms: append_render_ms,
        final_count: page.all('[role="feed"] .status__content__text').count,
        initial_count: initial_count,
        load_more_clicked: load_more_clicked,
      }
    end

    def scheduled_job_lag_ms
      now = Time.current.to_f
      Sidekiq::ScheduledSet.new.map { |job| [(now - job.at.to_f) * 1000.0, 0].max }.max
    end
  end
end

RSpec.configure do |config|
  config.include ReleasePerformanceBaseline::Helpers, :release_performance_baseline

  config.after(:suite) do
    next unless RSpec.world.filtered_examples.values.flatten.any? { |example| example.metadata[:release_performance_baseline] }

    ReleasePerformanceBaseline.collector.flush!
  end
end
