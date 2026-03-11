# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BrowserErrorsHelpers do
  subject(:helper) do
    Class.new do
      include BrowserErrorsHelpers
    end.new
  end

  describe '#js_error_ignored?' do
    let(:error) do
      {
        type: 'error',
        text: 'Failed to load resource: the server responded with a status of 404 (Not Found)',
        location: {
          'url' => 'http://localhost:3000/api/v1/accounts/lookup?acct=smoke_register',
          'lineNumber' => 0,
          'columnNumber' => 0,
        },
        page: 'http://localhost:3000/auth/sign_up',
      }
    end

    it 'matches against the console message text' do
      expect(helper.js_error_ignored?(/Failed to load resource/, error)).to be(true)
    end

    it 'matches against the request URL in the console location payload' do
      expect(helper.js_error_ignored?(%r{/api/v1/accounts/lookup\?acct=smoke_register}, error)).to be(true)
    end

    it 'does not ignore unrelated errors' do
      expect(helper.js_error_ignored?(%r{/api/v1/accounts/lookup\?acct=someone_else}, error)).to be(false)
    end
  end
end
