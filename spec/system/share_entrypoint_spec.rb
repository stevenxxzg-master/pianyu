# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Share page', :js, :streaming do
  include ProfileStories

  let(:email)               { 'test@example.com' }
  let(:password)            { 'password' }
  let(:confirmed_at)        { Time.zone.now }
  let(:finished_onboarding) { true }
  let(:status_text)         { 'This is a new status!' }

  before { as_a_logged_in_user }

  it 'returns to the home timeline with restrained feedback after posting' do
    visit share_path

    expect(page)
      .to have_css('.modal-layout__mastodon')
      .and have_css('div#mastodon-compose')
      .and have_css('.compose-form__submit')

    fill_in_form

    expect(page)
      .to have_current_path('/home')
      .and have_css('.column-header__title', text: frontend_translations('column.home'))
      .and have_css('.notification-bar', text: frontend_translations('compose.published.body'))
      .and have_no_css('.notification-bar__action')
  end

  def fill_in_form
    within('.compose-form') do
      fill_in frontend_translations('compose_form.placeholder'), with: status_text
      click_on frontend_translations('compose_form.publish')
    end
  end
end
