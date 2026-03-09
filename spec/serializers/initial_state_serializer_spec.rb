# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InitialStateSerializer do
  subject(:serialization) { serialized_record_json(presenter, described_class) }

  describe '#meta' do
    context 'without a current account' do
      let(:presenter) { InitialStatePresenter.new }

      it 'serializes the quiet-community defaults' do
        expect(serialization['meta']).to include(
          'profile_directory' => false,
          'landing_page' => 'about',
          'trends_enabled' => false,
          'local_live_feed_access' => 'authenticated',
          'remote_live_feed_access' => 'authenticated'
        )
      end
    end

    context 'with a current account' do
      let(:user) { Fabricate(:user) }
      let(:presenter) { InitialStatePresenter.new(current_account: user.account) }

      it 'keeps trend entry points hidden when trends are disabled instance-wide' do
        expect(serialization['meta']).to include(
          'me' => user.account_id.to_s,
          'show_trends' => false,
          'landing_page' => 'about',
          'trends_enabled' => false,
          'local_live_feed_access' => 'authenticated',
          'remote_live_feed_access' => 'authenticated'
        )
      end
    end
  end
end
