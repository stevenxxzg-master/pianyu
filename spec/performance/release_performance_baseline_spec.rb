# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Release performance baseline', :js, :release_performance_baseline, :streaming, type: :system do
  include ProfileStories

  let(:password) { 'password12345' }
  let(:user) do
    Fabricate(
      :user,
      email: email,
      password: password,
      confirmed_at: Time.zone.now,
      account: Fabricate(:account, username: 'baseline_owner')
    )
  end
  let(:actor_user) { Fabricate(:user, email: 'actor@example.com', password: password, confirmed_at: Time.zone.now, account: Fabricate(:account, username: 'baseline_actor')) }
  let(:token) { Fabricate(:accessible_access_token, resource_owner_id: user.id, scopes: 'read write follow push') }
  let(:actor_token) { Fabricate(:accessible_access_token, resource_owner_id: actor_user.id, scopes: 'read write follow push') }

  before do
    Web::Setting.where(user: user).first_or_initialize(user: user).update!(data: { introductionVersion: 2018_12_16_044202 })
    Web::Setting.where(user: actor_user).first_or_initialize(user: actor_user).update!(data: { introductionVersion: 2018_12_16_044202 })
  end

  it 'captures homepage baseline metrics' do
    samples = []

    iterations_for(:homepage).times do
      Capybara.reset_sessions!
      samples << signed_out_homepage_sample
    end

    visit new_user_session_path
    fill_in_auth_details(email, password)
    expect(page).to have_css('div.app-holder')

    iterations_for(:homepage).times do
      samples << signed_in_homepage_sample(user)
    end

    health_response, health_response_ms = plain_response('/health')
    response_codes = samples.map { |sample| sample.fetch(:response_code) }.uniq

    record_baseline(
      :homepage_load,
      observed: {
        homepage_request_ms: samples.map { |sample| sample.fetch(:response_ms) }.max,
        homepage_app_shell_ms: samples.filter_map { |sample| sample.fetch(:app_shell_ms) }.max,
        web_cpu_percent: samples.filter_map { |sample| sample[:web_cpu_percent] }.max,
        web_rss_bytes: samples.filter_map { |sample| sample[:web_rss_bytes] }.max,
        web_health_ok: health_response.is_a?(Net::HTTPSuccess),
      },
      evidence: {
        homepage_response_codes: response_codes,
        homepage_sample_count: samples.size,
        health_response_code: health_response.code.to_i,
        health_response_ms: health_response_ms.round(1),
      },
      notes: [
        "Homepage response codes observed: #{response_codes.join(', ')}",
      ]
    )
  end

  it 'captures publish baseline metrics', :inline_jobs do
    user.account.follow!(actor_user.account)

    redis_before = redis_stats['evicted_keys'].to_i
    start_wall = monotonic_ms
    start_cpu = Process.clock_gettime(Process::CLOCK_PROCESS_CPUTIME_ID, :float_second)
    response, create_ms = json_response('post', '/api/v1/statuses', token: token, form: { status: "Baseline publish #{SecureRandom.hex(4)}" })
    body = Oj.load(response.body)
    status_id = body.fetch('id')

    visible_started = monotonic_ms
    wait_until(timeout: 5) do
      timeline_response, = json_response('get', '/api/v1/timelines/home', token: token)
      timeline = Oj.load(timeline_response.body)
      timeline.any? { |status| status['id'] == status_id }
    end
    visible_ms = monotonic_ms - visible_started

    drain_started = monotonic_ms
    Sidekiq::Worker.drain_all
    async_drain_ms = monotonic_ms - drain_started

    record_baseline(
      :post_publish,
      observed: {
        status_create_ms: create_ms,
        status_visible_ms: visible_ms,
        async_drain_ms: async_drain_ms,
        publish_web_cpu_percent: process_cpu_percent(start_cpu, start_wall),
        redis_evictions_delta: redis_stats['evicted_keys'].to_i - redis_before,
      },
      evidence: {
        status_create_response_code: response.code.to_i,
        created_status_id: status_id,
        redis_evictions_before: redis_before,
        redis_evictions_after: redis_stats['evicted_keys'].to_i,
      },
      notes: [
        "Status create response code: #{response.code}",
      ]
    )

    expect(ReleasePerformanceBaseline.collector.overall_status_for_run).to be_in(%w(pass risk fail))
  end

  it 'captures notifications baseline metrics', :inline_jobs do
    user.account.follow!(actor_user.account)
    seed_status = PostStatusService.new.call(user.account, text: "Notification baseline #{SecureRandom.hex(4)}")
    probe = capture_notifications_probe(actor_user: actor_user, seed_status: seed_status, token: token)

    record_baseline(
      :notifications,
      observed: {
        notifications_api_ms: probe.fetch(:notifications_api_ms),
        notification_delivery_ms: probe.fetch(:delivery_ms),
        notification_drain_ms: probe.fetch(:drain_ms),
        streaming_rss_bytes: metric_value(probe.fetch(:streaming_after), 'process_resident_memory_bytes'),
        pg_pool_waiting_queries: metric_value(probe.fetch(:streaming_after), 'pg_pool_waiting_queries')&.to_i,
        streaming_clients_steady_state: probe.fetch(:before_clients) == probe.fetch(:after_clients) && probe.fetch(:before_channels) == probe.fetch(:after_channels),
      },
      evidence: {
        notifications_response_code: probe.fetch(:notifications_response).code.to_i,
        streaming_health_code: probe.fetch(:streaming_health).code.to_i,
        notification_event: probe.fetch(:message).fetch(:event),
        websocket_clients_before: probe.fetch(:before_clients),
        websocket_clients_after: probe.fetch(:after_clients),
        websocket_channels_before: probe.fetch(:before_channels),
        websocket_channels_after: probe.fetch(:after_channels),
      },
      notes: [
        "Streaming health status: #{probe.fetch(:streaming_health).code}",
        "Streaming notification event: #{probe.fetch(:message).fetch(:event)}",
        "Notifications API status: #{probe.fetch(:notifications_response).code}",
      ]
    )

    expect(ReleasePerformanceBaseline.collector.overall_status_for_run).to be_in(%w(pass risk fail))
  end

  it 'captures timeline scrolling baseline metrics', :inline_jobs do
    timeline_author = Fabricate(:account, username: 'timeline_author')
    user.account.follow!(timeline_author)
    timeline_statuses_for(timeline_author, count: 100)
    api_probe = capture_timeline_api_probe(token: token)

    sign_in(user, scope: :user)
    render_probe = capture_timeline_render_probe
    metrics_after = scrape_streaming_metrics

    record_baseline(
      :timeline_scrolling,
      observed: {
        timeline_pagination_ms: api_probe.fetch(:timeline_pagination_ms),
        timeline_append_render_ms: render_probe.fetch(:append_render_ms),
        timeline_http_ok: api_probe.fetch(:first_page_response).code.to_i < 429 && api_probe.fetch(:pagination_response).code.to_i < 429,
        timeline_pg_waiting_queries: metric_value(metrics_after, 'pg_pool_waiting_queries')&.to_i,
        timeline_web_rss_bytes: process_rss_bytes,
      },
      evidence: {
        initial_status_count: render_probe.fetch(:initial_count),
        final_status_count: render_probe.fetch(:final_count),
        load_more_button_clicked: render_probe.fetch(:load_more_clicked),
        timeline_first_page_status: api_probe.fetch(:first_page_response).code.to_i,
        timeline_pagination_status: api_probe.fetch(:pagination_response).code.to_i,
        timeline_first_page_count: api_probe.fetch(:first_page).size,
      },
      notes: [
        "Timeline first page count: #{api_probe.fetch(:first_page).size}",
        "Load more button clicked: #{render_probe.fetch(:load_more_clicked)}",
      ]
    )

    expect(ReleasePerformanceBaseline.collector.overall_status_for_run).to be_in(%w(pass risk fail))
  end

  it 'captures background job baseline metrics' do
    actor_user.account.follow!(user.account)
    redis_info_before = redis_stats
    retry_before = Sidekiq::RetrySet.new.size
    dead_before = Sidekiq::DeadSet.new.size
    scheduled_lag_ms = scheduled_job_lag_ms

    status = PostStatusService.new.call(user.account, text: "Background baseline #{SecureRandom.hex(4)}")
    FavouriteService.new.call(actor_user.account, status)

    queued_before = Sidekiq::Worker.jobs.size
    drain_started = monotonic_ms
    Sidekiq::Worker.drain_all
    background_drain_ms = monotonic_ms - drain_started
    queued_after = Sidekiq::Worker.jobs.size

    redis_info_after = redis_stats
    redis_memory_limit = redis_info_after['maxmemory'].to_i
    redis_memory_ratio = (redis_info_after['used_memory'].to_f / redis_memory_limit if redis_memory_limit.positive?)

    record_baseline(
      :background_jobs,
      observed: {
        background_drain_ms: background_drain_ms,
        scheduled_job_lag_ms: scheduled_lag_ms,
        retry_dead_growth: (Sidekiq::RetrySet.new.size - retry_before) + (Sidekiq::DeadSet.new.size - dead_before),
        sidekiq_rss_bytes: process_rss_bytes,
        redis_memory_limit_ratio: redis_memory_ratio,
        background_pg_waiting_queries: metric_value(scrape_streaming_metrics, 'pg_pool_waiting_queries')&.to_i,
      },
      evidence: {
        queued_jobs_before: queued_before,
        queued_jobs_after: queued_after,
        retry_set_before: retry_before,
        retry_set_after: Sidekiq::RetrySet.new.size,
        dead_set_before: dead_before,
        dead_set_after: Sidekiq::DeadSet.new.size,
        redis_evicted_keys_delta: redis_info_after['evicted_keys'].to_i - redis_info_before['evicted_keys'].to_i,
      },
      notes: [
        "Queued jobs before drain: #{queued_before}",
        "Queued jobs after drain: #{queued_after}",
        "Redis evicted keys delta: #{redis_info_after['evicted_keys'].to_i - redis_info_before['evicted_keys'].to_i}",
      ]
    )

    expect(ReleasePerformanceBaseline.collector.overall_status_for_run).to be_in(%w(pass risk fail))
  end
end
