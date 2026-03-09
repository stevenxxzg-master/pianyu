# frozen_string_literal: true

require 'rails_helper'

RSpec.describe REST::InstanceSerializer do
  let(:serialization) { serialized_record_json(record, described_class) }
  let(:record) { InstancePresenter.new }

  describe 'usage' do
    it 'returns recent usage data' do
      expect(serialization['usage']).to eq({ 'users' => { 'active_month' => 0 } })
    end
  end

  describe 'configuration' do
    it 'returns the VAPID public key' do
      expect(serialization['configuration']['vapid']).to eq({
        'public_key' => Rails.configuration.x.vapid.public_key,
      })
    end

    it 'returns the max pinned statuses limit' do
      expect(serialization.deep_symbolize_keys)
        .to include(
          configuration: include(
            accounts: include(max_pinned_statuses: StatusPinValidator::PIN_LIMIT)
          )
        )
    end

    it 'returns quiet-community topic feed access defaults' do
      expect(serialization['configuration']['timelines_access']).to include(
        'hashtag_feeds' => {
          'local' => 'authenticated',
          'remote' => 'authenticated',
        },
        'trending_link_feeds' => {
          'local' => 'authenticated',
          'remote' => 'authenticated',
        }
      )
    end
  end
end
