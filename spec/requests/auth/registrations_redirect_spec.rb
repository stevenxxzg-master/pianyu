# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Auth registration redirects' do
  describe 'GET /auth/sign_up/redirect' do
    it 'redirects to the external SSO sign-up URL when configured' do
      ClimateControl.modify SSO_ACCOUNT_SIGN_UP: 'https://accounts.example.test/sign-up' do
        get '/auth/sign_up/redirect'

        expect(response).to redirect_to('https://accounts.example.test/sign-up')
      end
    end

    it 'redirects to the local registration path when no external URL is configured' do
      ClimateControl.modify SSO_ACCOUNT_SIGN_UP: nil do
        get '/auth/sign_up/redirect'

        expect(response).to redirect_to('/auth/sign_up')
      end
    end

    it 'returns not found for an invalid configured SSO sign-up URL' do
      ClimateControl.modify SSO_ACCOUNT_SIGN_UP: 'javascript:alert(1)' do
        get '/auth/sign_up/redirect'

        expect(response).to have_http_status(404)
      end
    end
  end
end
