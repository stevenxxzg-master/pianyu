# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'About external redirects' do
  describe 'GET /about/status-page' do
    it 'redirects to the configured status page' do
      allow(Setting).to receive(:[]).and_call_original
      allow(Setting).to receive(:[]).with('status_page_url').and_return('https://status.example.test')

      get '/about/status-page'

      expect(response).to redirect_to('https://status.example.test')
    end

    it 'returns not found for an invalid configured status page URL' do
      allow(Setting).to receive(:[]).and_call_original
      allow(Setting).to receive(:[]).with('status_page_url').and_return('javascript:alert(1)')

      get '/about/status-page'

      expect(response).to have_http_status(404)
    end
  end

  describe 'GET /about/source-code' do
    it 'redirects to the configured source code URL' do
      allow(Mastodon::Version).to receive(:source_url).and_return('https://github.com/example/repo')

      get '/about/source-code'

      expect(response).to redirect_to('https://github.com/example/repo')
    end

    it 'returns not found for an invalid configured source URL' do
      allow(Mastodon::Version).to receive(:source_url).and_return('javascript:alert(1)')

      get '/about/source-code'

      expect(response).to have_http_status(404)
    end
  end
end
