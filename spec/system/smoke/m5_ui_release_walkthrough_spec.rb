# frozen_string_literal: true

require 'rails_helper'
require 'fileutils'
require 'securerandom'

RSpec.describe 'M5 UI release walkthrough', :js, :smoke, :streaming do
  let(:password) { 'password12345' }
  let(:status_text) { 'Walkthrough status for the modern UI release batch' }
  let(:username) { "m5_walkthrough_#{SecureRandom.hex(4)}" }
  let(:email) { "#{username}@example.com" }
  let(:registered_user) { create_approved_user(username:, email:, password:) }
  let(:route_screenshot_dir) { Rails.root.join('tmp', 'm5_ui_release_walkthrough') }
  let!(:walkthrough_status) do
    PostStatusService.new.call(registered_user.account, text: status_text)
  end

  before do
    registered_user
    finish_onboarding_for(registered_user)
    FileUtils.mkdir_p(route_screenshot_dir)
  end

  [
    { label: 'desktop', width: 1280, height: 960 },
    { label: 'mobile', width: 390, height: 844 },
  ].each do |viewport|
    context "when using #{viewport[:label]} width" do
      before do
        page.current_window.resize_to(viewport[:width], viewport[:height])
      end

      it 'covers the public shell, auth entry, and signed-in workspace routes' do
        assert_public_page(root_path, 'turns the public front door into a calm, modern invitation', viewport[:label], 'root')
        assert_public_page(about_path, 'Why this public space feels different', viewport[:label], 'about')
        assert_public_page(examples_path, 'The conversations Mastodon is best at hosting', viewport[:label], 'examples')
        assert_public_page(help_path, 'The shortest path from curiosity to confidence', viewport[:label], 'help')

        sign_in_and_capture(viewport[:label])
        assert_workspace_page('/explore', 'GUIDED DISCOVERY', viewport[:label], 'explore', '/explore/suggestions')
        assert_workspace_page('/favourites', 'SIGNALS THAT STUCK', viewport[:label], 'favourites')
        assert_workspace_page('/bookmarks', 'PERSONAL READING ROOM', viewport[:label], 'bookmarks')
        assert_workspace_page('/lists', 'CURATED STREAMS', viewport[:label], 'lists')
        assert_workspace_page('/conversations', 'PRIVATE CONTEXT', viewport[:label], 'private-mentions')

        visit account_path(registered_user.account.username)
        expect(page)
          .to have_title(/#{registered_user.account.username} \(@#{registered_user.account.username}@localhost(?::\d+)?\)/)
          .and have_content(status_text)
        capture_route(viewport[:label], 'profile')

        visit short_account_status_path(account_username: registered_user.account.username, id: walkthrough_status.id)
        expect(page)
          .to have_css('div.app-holder')
          .and have_content(status_text)
        capture_route(viewport[:label], 'status-detail')

        visit '/publish'
        expect(page)
          .to have_css('div.app-holder')
          .and have_css('form.compose-form')
        capture_route(viewport[:label], 'publish')
      end
    end
  end

  def create_approved_user(username:, email:, password:)
    Fabricate(
      :user,
      email: email,
      password: password,
      confirmed_at: Time.zone.now,
      account_attributes: { username: username }
    ).tap do |user|
      user.update_columns(approved: true)
    end
  end

  def finish_onboarding_for(user)
    Web::Setting.where(user: user).first_or_initialize(user: user)
      .update!(data: { introductionVersion: 2018_12_16_044202 })
  end

  def assert_public_page(path, text, viewport_label, route_name)
    visit path

    expect(page)
      .to have_css('body', class: 'public-page-body')
      .and have_content(text)

    capture_route(viewport_label, route_name)
  end

  def sign_in_and_capture(viewport_label)
    visit new_user_session_path

    expect(page)
      .to have_css('body', class: 'public-page-body')
      .and have_field('user_email')

    capture_route(viewport_label, 'sign-in')

    fill_in 'user_email', with: email
    fill_in 'user_password', with: password
    click_on I18n.t('auth.login')

    expect(page)
      .to have_css('div.app-holder')
      .and have_content('Your home timeline is empty! Follow more people to fill it up.')

    capture_route(viewport_label, 'home')
  end

  def assert_workspace_page(path, text, viewport_label, route_name, current_path = path)
    visit path
    expect(page).to have_current_path(current_path)
    expect(page)
      .to have_css('div.app-holder')
      .and have_content(text)

    capture_route(viewport_label, route_name)
  end

  def capture_route(viewport_label, route_name)
    page.driver.send(:browser).raw_screenshot(
      path: route_screenshot_dir.join("#{viewport_label}-#{route_name}.png").to_s
    )
  end
end
