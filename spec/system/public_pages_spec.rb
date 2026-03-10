# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Public pages' do
  it 'renders the landing page for signed-out visitors' do
    visit root_path

    expect(page)
      .to have_css('body', class: 'public-page-body')
      .and have_content('turns the public front door into a calm, modern invitation')
      .and have_link('Examples', href: examples_path)
  end

  it 'renders the examples page inside the shared public shell' do
    visit examples_path

    expect(page)
      .to have_css('body', class: 'public-page-body')
      .and have_content('The conversations Mastodon is best at hosting')
      .and have_link('Help', href: help_path)
  end

  it 'renders the help page inside the shared public shell' do
    visit help_path

    expect(page)
      .to have_css('body', class: 'public-page-body')
      .and have_content('The shortest path from curiosity to confidence')
      .and have_content('Do I need an account to read the public pages?')
  end
end
