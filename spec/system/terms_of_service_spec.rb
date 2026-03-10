# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Terms of Service page' do
  it 'renders the branded terms shell even without published terms' do
    visit terms_of_service_path

    expect(page)
      .to have_css('body', class: 'public-page-body')
      .and have_content('The shared agreement for participating in Mastodon')
      .and have_content('No published terms of service are available yet.')
  end
end
