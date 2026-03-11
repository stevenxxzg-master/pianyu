# frozen_string_literal: true

require 'rails_helper'
require 'securerandom'

RSpec.describe 'Core smoke flows', :inline_jobs, :js, :smoke, :streaming do
  describe 'registration' do
    let(:registration_username) { 'smoke_register' }
    let(:registration_email) { 'smoke-register@example.com' }
    let(:registration_password) { 'Test.123.Pass' }

    it 'allows a new user to register' do
      ignore_js_error(%r{/api/v1/accounts/lookup\?acct=#{registration_username}})

      visit new_user_registration_path

      expect(page)
        .to have_title(I18n.t('auth.register'))

      travel_to 10.seconds.from_now do
        fill_in 'user_account_attributes_username', with: registration_username
        fill_in 'user_email', with: registration_email
        fill_in 'user_password', with: registration_password
        fill_in 'user_password_confirmation', with: registration_password
        check 'user_agreement'

        click_on I18n.t('auth.register')
      end

      expect(page)
        .to have_content(I18n.t('auth.setup.title'))

      expect(User.find_by!(email: registration_email).account.username)
        .to eq(registration_username)
    end
  end

  describe 'authenticated core flows' do
    let(:username)            { "smoke_bob_#{SecureRandom.hex(4)}" }
    let(:email)               { "#{username}@example.com" }
    let(:password)            { 'password' }
    let(:root_status_text)    { 'Smoke root status from the home timeline' }
    let(:reply_text)          { 'Smoke reply from the status detail page' }
    let(:notification_text)   { 'Smoke mention that should appear in notifications' }
    let(:registered_user) { create_approved_user(username:, email:, password:) }

    before do
      registered_user
      finish_onboarding_for(registered_user)
    end

    it 'lets a returning user log in, post from home, and reply from the status detail page' do
      log_in_through_ui
      visit_home_timeline

      publish_status(root_status_text, frontend_translations('compose_form.publish'))

      expect(page)
        .to have_css('.status__content__text', text: root_status_text)

      root_status = registered_user.account.statuses.find_by!(text: root_status_text)

      visit short_account_status_path(account_username: registered_user.account.username, id: root_status.id)

      expect(page)
        .to have_css('.status__content__text', text: root_status_text)

      click_button frontend_translations('status.reply')

      expect(page)
        .to have_css('.reply-indicator')

      publish_status(reply_text, frontend_translations('compose_form.reply'))

      expect(page)
        .to have_css('.status__content__text', text: reply_text)
    end

    it 'shows a mention notification in the notifications timeline' do
      log_in_through_ui

      mentioner = create_approved_user(
        username: "smoke_alice_#{SecureRandom.hex(4)}",
        email: "smoke-alice-#{SecureRandom.hex(4)}@example.com",
        password: 'password'
      )

      expect do
        PostStatusService.new.call(
          mentioner.account,
          text: "Hello @#{registered_user.account.username} #{notification_text}"
        )
      end.to change(registered_user.account.notifications, :count).by(1)

      visit '/notifications'

      expect(page)
        .to have_text(frontend_translations('column.notifications'))

      click_on frontend_translations('notifications.filter.mentions')

      expect(page)
        .to have_text(frontend_translations('notification.label.mention'))
        .and have_text(mentioner.account.username)
        .and have_text(notification_text)
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

    def log_in_through_ui
      visit new_user_session_path

      expect(page)
        .to have_title(I18n.t('auth.login'))

      fill_in 'user_email', with: email
      fill_in 'user_password', with: password
      click_on I18n.t('auth.login')

      expect(page)
        .to have_css('div.app-holder')
    end

    def visit_home_timeline
      visit '/home'

      expect(page)
        .to have_css('div.app-holder')
        .and have_css('form.compose-form')
    end

    def publish_status(text, submit_label)
      within('.compose-form') do
        fill_in frontend_translations('compose_form.placeholder'), with: text
        expect(page).to have_button(submit_label, disabled: false)
        click_button submit_label
      end
    end

    def frontend_translations(key)
      SystemHelpers::FRONTEND_TRANSLATIONS.fetch(key)
    end
  end
end
