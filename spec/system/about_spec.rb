# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'About page' do
  it 'renders the branded public about shell' do
    visit about_path

    expect(page)
      .to have_css('body', class: 'public-page-body')
      .and have_content('Why this public space feels different')
      .and have_link('Examples', href: examples_path)
  end
end
