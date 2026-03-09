# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'API Web Push Subscriptions' do
  let(:create_payload) do
    {
      subscription: {
        endpoint: 'https://fcm.googleapis.com/fcm/send/fiuH06a27qE:APA91bHnSiGcLwdaxdyqVXNDR9w1NlztsHb6lyt5WDKOC_Z_Q8BlFxQoR8tWFSXUIDdkyw0EdvxTu63iqamSaqVSevW5LfoFwojws8XYDXv_NRRLH6vo2CdgiN4jgHv5VLt2A8ah6lUX',
        keys: {
          p256dh: 'BEm_a0bdPDhf0SOsrnB2-ategf1hHoCnpXgQsFj5JCkcoMrMt2WHoPfEYOYPzOIs9mZE8ZUaD7VA5vouy0kEkr8=',
          auth: 'eH_C8rq2raXqlcBVDa1gLg==',
        },
        standard: standard,
      },
    }
  end

  let(:alerts_payload) do
    {
      data: {
        policy: 'all',

        alerts: {
          follow: true,
          follow_request: false,
          favourite: false,
          reblog: true,
          mention: false,
          poll: true,
          status: false,
          quote: true,
        },
      },
    }
  end
  let(:standard) { '1' }

  describe 'DELETE /api/web/push_subscriptions/:id' do
    subject { delete api_web_push_subscription_path(token) }

    context 'when the subscription exists' do
      let!(:web_push_subscription) do
        Fabricate(:web_push_subscription)
      end
      let(:token) do
        web_push_subscription.generate_token_for(:unsubscribe)
      end

      it 'deletes the subscription' do
        expect { subject }
          .to change(Web::PushSubscription, :count).by(-1)

        expect(response).to have_http_status(200)
      end
    end

    context 'when the subscription does not exist' do
      let(:web_push_subscription) do
        Fabricate(:web_push_subscription)
      end
      let(:token) do
        web_push_subscription.generate_token_for(:unsubscribe)
      end

      before do
        token # memoize before destroying the record
        web_push_subscription.destroy!
      end

      it 'does nothing' do
        subject

        expect(response).to have_http_status(200)
      end
    end

    context 'when the token is invalid' do
      let(:token) { 'invalid--invalid' }

      it 'does nothing' do
        subject

        expect(response).to have_http_status(200)
      end
    end
  end

  describe 'POST /api/web/push_subscriptions' do
    let(:user) { Fabricate :user }
    let(:session_user_agent) { 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
    let(:session_activation) { Fabricate(:session_activation, user:, user_agent: session_user_agent) }
    let(:signed_session_id) do
      ActionDispatch::Cookies::CookieJar.build(ActionDispatch::TestRequest.create, {}).tap do |cookie_jar|
        cookie_jar.signed['_session_id'] = session_activation.session_id
      end['_session_id']
    end

    before do
      sign_in(user)
      cookies['_session_id'] = signed_session_id
    end

    it 'gracefully handles invalid nested params' do
      post api_web_push_subscriptions_path, params: { subscription: 'invalid' }

      expect(response)
        .to have_http_status(400)
    end

    it 'saves push subscriptions with valid params' do
      post api_web_push_subscriptions_path, params: create_payload
      expect(response)
        .to have_http_status(200)

      expect(created_push_subscription)
        .to have_attributes(
          endpoint: eq(create_payload[:subscription][:endpoint]),
          key_p256dh: eq(create_payload[:subscription][:keys][:p256dh]),
          key_auth: eq(create_payload[:subscription][:keys][:auth])
        )
        .and be_standard
      expect(session_activation.reload.web_push_subscription)
        .to eq(created_push_subscription)
    end

    context 'with a mobile session' do
      let(:session_user_agent) { 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X)' }

      it 'defaults to prioritized alert types only' do
        post api_web_push_subscriptions_path, params: create_payload

        expect(response)
          .to have_http_status(200)

        expect(created_push_subscription.data)
          .to eq(
            'policy' => 'all',
            'alerts' => Notification::TYPES.index_with { |type| %w(follow follow_request mention).include?(type.to_s) }.deep_stringify_keys
          )

        expect(response.parsed_body)
          .to include(
            'policy' => 'all',
            'alerts' => Notification::TYPES.index_with { |type| %w(follow follow_request mention).include?(type.to_s) }.deep_stringify_keys
          )
      end
    end

    context 'with a desktop session' do
      it 'keeps default alerts disabled' do
        post api_web_push_subscriptions_path, params: create_payload

        expect(response)
          .to have_http_status(200)

        expect(created_push_subscription.data)
          .to eq(
            'policy' => 'all',
            'alerts' => Notification::TYPES.index_with(false).deep_stringify_keys
          )
      end
    end

    context 'when standard is provided as false value' do
      let(:standard) { '0' }

      it 'saves push subscription with standard as false' do
        post api_web_push_subscriptions_path, params: create_payload

        expect(created_push_subscription)
          .to_not be_standard
      end
    end

    context 'with a user who has a session with a prior subscription' do
      let(:prior_subscription) { Fabricate(:web_push_subscription, user:) }

      before do
        session_activation.update!(web_push_subscription: prior_subscription)
      end

      it 'destroys prior subscription when creating new one' do
        post api_web_push_subscriptions_path, params: create_payload

        expect(response)
          .to have_http_status(200)
        expect { prior_subscription.reload }
          .to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with initial data' do
      it 'saves alert settings' do
        post api_web_push_subscriptions_path, params: create_payload.merge(alerts_payload)

        expect(response)
          .to have_http_status(200)

        expect(created_push_subscription.data['policy'])
          .to eq 'all'

        alert_types.each do |type|
          expect(created_push_subscription.data['alerts'][type])
            .to eq(alerts_payload[:data][:alerts][type.to_sym].to_s)
        end
      end
    end
  end

  describe 'PUT /api/web/push_subscriptions/:id' do
    before { sign_in user }

    let(:user) { Fabricate(:user) }
    let(:subscription) { Fabricate(:web_push_subscription, user: user) }

    it 'gracefully handles invalid nested params' do
      put api_web_push_subscription_path(subscription), params: { data: 'invalid' }

      expect(response)
        .to have_http_status(400)
    end

    it 'changes existing alert settings' do
      # Create record this way to correctly associate a `SessionActivation`
      # during full POST->create cycle
      post api_web_push_subscriptions_path params: create_payload
      expect(response)
        .to have_http_status(200)

      put api_web_push_subscription_path(created_push_subscription), params: alerts_payload
      expect(created_push_subscription.data['policy'])
        .to eq 'all'
      alert_types.each do |type|
        expect(created_push_subscription.data['alerts'][type])
          .to eq(alerts_payload[:data][:alerts][type.to_sym].to_s)
      end
    end

    context 'when using other user subscription' do
      let(:subscription) { Fabricate(:web_push_subscription) }

      it 'does not change settings' do
        put api_web_push_subscription_path(subscription), params: alerts_payload

        expect(response)
          .to have_http_status(404)
      end
    end
  end

  def created_push_subscription
    Web::PushSubscription
      .find_by(endpoint: create_payload[:subscription][:endpoint])
  end

  def alert_types
    Notification::LEGACY_TYPE_CLASS_MAP.values.map(&:to_s)
  end
end
