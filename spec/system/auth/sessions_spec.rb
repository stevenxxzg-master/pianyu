# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Auth Sessions' do
  it 'renders login inside the shared public auth shell' do
    visit new_user_session_path

    expect(page)
      .to have_css('body', class: 'public-page-body')
      .and have_css('.public-auth')
      .and have_content('One visual language from the very first visit')
  end
end
