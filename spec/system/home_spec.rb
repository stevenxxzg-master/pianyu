# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Home page' do
  context 'when signed in' do
    before { sign_in Fabricate(:user) }

    it 'visits the homepage and renders the web app' do
      visit root_path

      expect(page)
        .to have_css('noscript', text: /Mastodon/)
        .and have_css('body', class: 'app-body')
    end
  end

  context 'when not signed in' do
    it 'renders the branded landing page regardless of legacy landing-page settings' do
      Setting.landing_page = 'trends'

      visit root_path

      expect(page)
        .to have_current_path(root_path)
        .and have_css('body', class: 'public-page-body')
        .and have_content('turns the public front door into a calm, modern invitation')
    end
  end
end
