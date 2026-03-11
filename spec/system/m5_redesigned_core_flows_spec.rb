# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'M5 redesigned core flows', :inline_jobs, :js, :streaming do
  include ProfileStories

  let(:email)               { 'test@example.com' }
  let(:password)            { 'password' }
  let(:confirmed_at)        { Time.zone.now }
  let(:finished_onboarding) { true }
  let(:status_text)         { 'M5 redesigned flow regression coverage status' }

  let(:alice) do
    Fabricate(
      :user,
      email: 'alice@example.com',
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

  it 'covers login, home, posting, notifications, detail, profile, and search' do
    sign_in_to_redesigned_home
    status = publish_status!

    create_favourite_notification!(status)
    open_notifications
    open_favourited_status(status)
    open_bob_profile
    expect(page).to have_title("bob (@bob@#{local_domain_uri.host})")

    search_for_account('alice')
    open_alice_profile
    expect(page).to have_title(/Alice QA \(@alice@#{Regexp.escape(local_domain_uri.host)}\)/)
  end

  private

  def sign_in_to_redesigned_home
    alice
    as_a_registered_user

    visit new_user_session_path

    expect(page).to have_title(I18n.t('auth.login'))

    fill_in_auth_details(email, password)

    expect(page)
      .to have_css('.app-holder')
      .and have_css('form.compose-form')
      .and have_css('.navigation-panel')
  end

  def publish_status!
    within('.compose-form') do
      fill_in frontend_translations('compose_form.placeholder'), with: status_text
      click_on frontend_translations('compose_form.publish')
    end

    expect(page).to have_css('.status__content__text', text: status_text)

    Status.find_by!(account: bob.account, text: status_text)
  end

  def create_favourite_notification!(status)
    FavouriteService.new.call(alice.account, status)
  end

  def open_notifications
    within('.navigation-panel__menu') do
      click_link 'Notifications'
    end

    expect(page).to have_current_path('/notifications', ignore_query: true)

    within('.notification__filter-bar') do
      click_button 'All'
    end

    expect(page)
      .to have_content('Alice QA')
      .and have_content('favorited your post')
  end

  def open_favourited_status(status)
    find('.notification-group__embedded-status', text: status_text).click

    expect(page)
      .to have_current_path(
        short_account_status_path(account_username: bob.account.username, id: status.id),
        ignore_query: true
      )
      .and have_css('.detailed-status', text: status_text)
  end

  def open_bob_profile
    click_link nil, href: '/@bob', match: :first

    expect(page).to have_current_path(%r{\A/(?:@bob|users/bob)\z})
  end

  def search_for_account(query)
    within('.compose-panel') do
      field = find('input.search__input')
      field.fill_in with: query
      field.send_keys(:enter)
    end

    expect(page)
      .to have_current_path('/search', ignore_query: true)
      .and have_content('Profiles')
  end

  def open_alice_profile
    click_link nil, href: '/@alice', match: :first

    expect(page).to have_current_path(%r{\A/(?:@alice|users/alice)\z})
  end
end
