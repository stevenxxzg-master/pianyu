# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'M5 redesigned mobile flow', :inline_jobs, :js, :streaming do
  include ProfileStories

  let(:email)               { 'test@example.com' }
  let(:password)            { 'password' }
  let(:confirmed_at)        { Time.zone.now }
  let(:finished_onboarding) { true }
  let(:status_text)         { 'Mobile M5 regression coverage status' }

  let(:alice) do
    Fabricate(
      :user,
      email: 'alice.mobile@example.com',
      password: 'password',
      confirmed_at: Time.zone.now,
      account: Fabricate(
        :account,
        username: 'alice',
        display_name: 'Alice QA',
        avatar: attachment_fixture('avatar.gif'),
        header: attachment_fixture('attachment.jpg')
      )
    )
  end

  it 'covers a mobile publish and search path through the redesigned shell' do
    sign_in_on_mobile
    publish_mobile_status
    open_mobile_navigation_item('Notifications', '/notifications')
    open_mobile_navigation_item('Search', '/explore')
    search_for_account('alice')
    open_alice_profile

    expect(page).to have_css('.account__header')
  end

  private

  def sign_in_on_mobile
    alice
    as_a_registered_user

    visit new_user_session_path
    page.current_window.resize_to(390, 844)

    fill_in_auth_details(email, password)

    expect(page)
      .to have_css('.columns-area--mobile')
      .and have_css("a.ui__navigation-bar__item[aria-label='New Post']")
  end

  def publish_mobile_status
    find("a.ui__navigation-bar__item[aria-label='New Post']").click

    expect(page).to have_current_path('/publish', ignore_query: true)

    within('.compose-form') do
      fill_in frontend_translations('compose_form.placeholder'), with: status_text
      click_on frontend_translations('compose_form.publish')
    end

    expect(page).to have_css('.status__content__text', text: status_text)
  end

  def open_mobile_navigation_item(label, path)
    find("a.ui__navigation-bar__item[aria-label='#{label}']").click

    expect(page).to have_current_path(path, ignore_query: true)
  end

  def search_for_account(query)
    within('.explore__search-header') do
      field = find('input.search__input')
      field.fill_in with: query
      field.send_keys(:enter)
    end

    expect(page).to have_current_path('/search', ignore_query: true)
  end

  def open_alice_profile
    click_link nil, href: '/@alice', match: :first

    expect(page).to have_current_path(%r{\A/(?:@alice|users/alice)\z})
  end
end
