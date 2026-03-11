# frozen_string_literal: true

class AboutController < ApplicationController
  include SafeRedirectConcern
  include WebAppControllerConcern

  skip_before_action :require_functional!

  def show
    expires_in(15.seconds, public: true, stale_while_revalidate: 30.seconds, stale_if_error: 1.day) unless user_signed_in?
  end

  def status_page
    redirect_to_safe_resource(Setting.status_page_url)
  end

  def source_code
    redirect_to_safe_resource(Mastodon::Version.source_url)
  end
end
