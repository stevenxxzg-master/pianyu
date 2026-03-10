# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Privacy policy page' do
  it 'renders the branded privacy page shell' do
    visit privacy_policy_path

    expect(page)
      .to have_css('body', class: 'public-page-body')
      .and have_content('How data, consent, and visibility are handled')
      .and have_content('Last updated')
  end
end
