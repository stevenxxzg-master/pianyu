# frozen_string_literal: true

class PublicPagesController < ApplicationController
  include WebAppControllerConcern

  skip_before_action :require_functional!

  def examples
    expires_in(15.seconds, public: true, stale_while_revalidate: 30.seconds, stale_if_error: 1.day) unless user_signed_in?
  end

  def help
    expires_in(15.seconds, public: true, stale_while_revalidate: 30.seconds, stale_if_error: 1.day) unless user_signed_in?
  end
end
