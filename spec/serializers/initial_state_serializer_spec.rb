# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InitialStateSerializer do
  let(:serialization) { serialized_record_json(record, described_class) }
  let(:record) { InitialStatePresenter.new(settings: {}, text: '') }

  describe 'meta' do
    it 'exports quiet-community topic feed defaults' do
      expect(serialization['meta']).to include(
        'local_topic_feed_access' => 'authenticated',
        'remote_topic_feed_access' => 'authenticated'
      )
    end
  end
end
