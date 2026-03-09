# frozen_string_literal: true

require 'rails_helper'
require 'tmpdir'

RSpec.describe ReleasePerformanceBaseline::Collector do
  around do |example|
    Dir.mktmpdir('release-performance-baseline') do |dir|
      previous_output_dir = ENV.fetch('RELEASE_PERFORMANCE_BASELINE_OUTPUT_DIR', nil)
      ENV['RELEASE_PERFORMANCE_BASELINE_OUTPUT_DIR'] = dir
      example.run
    ensure
      ENV['RELEASE_PERFORMANCE_BASELINE_OUTPUT_DIR'] = previous_output_dir
    end
  end

  let(:profile) do
    {
      flows: {
        homepage_load: {
          label: 'Homepage load',
          evidence: ['spec/system/home_spec.rb'],
          metrics: {
            homepage_request_ms: {
              label: 'GET / max observed',
              unit: 'ms',
              operator: '<=',
              threshold: 800,
              missing: 'fail',
            },
            web_health_ok: {
              label: '/health green',
              unit: 'boolean',
              operator: '==',
              threshold: true,
              missing: 'fail',
            },
          },
        },
        notifications: {
          label: 'Notifications',
          evidence: ['spec/requests/api/v2/notifications_spec.rb'],
          metrics: {
            notification_delivery_ms: {
              label: 'Notification delivery',
              unit: 'ms',
              operator: '<=',
              threshold: 5000,
              missing: 'risk',
            },
          },
        },
      },
    }.deep_symbolize_keys
  end

  it 'writes ordered JSON and markdown artifacts with statuses and runtime evidence' do
    collector = described_class.new(profile: profile)

    collector.record(
      :notifications,
      observed: { notification_delivery_ms: nil },
      evidence: { notification_event: 'update' },
      notes: ['streaming sample missing in this fixture']
    )
    collector.record(
      :homepage_load,
      observed: { homepage_request_ms: 725.4, web_health_ok: true },
      evidence: { health_response_code: 200, homepage_response_codes: [200] },
      notes: ['healthy sample']
    )

    collector.flush!

    results = JSON.parse(ReleasePerformanceBaseline.output_dir.join('results.json').read)
    summary = ReleasePerformanceBaseline.output_dir.join('summary.md').read

    expect(results.fetch('overall_status')).to eq('risk')
    expect(results.fetch('flows').keys).to eq(%w(homepage_load notifications))
    expect(summary).to include('| GET / max observed | `725.4 ms` | <= `800.0 ms` | PASS |')
    expect(summary).to include('| Notification delivery | `missing` | <= `5000.0 ms` | RISK |')
    expect(summary).to include('### Runtime Evidence')
    expect(summary).to include('health response code: `200`')
    expect(summary).to include('homepage response codes: `[200]`')
  end
end
