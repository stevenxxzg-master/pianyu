# frozen_string_literal: true

module SafeRedirectConcern
  extend ActiveSupport::Concern

  private

  def redirect_to_safe_resource(url)
    parsed_url = Addressable::URI.parse(url.to_s)

    if safe_external_redirect?(parsed_url)
      redirect_to parsed_url.to_s, allow_other_host: true
    elsif safe_internal_redirect?(parsed_url)
      redirect_to parsed_url.to_s, allow_other_host: false
    else
      raise ActiveRecord::RecordNotFound
    end
  rescue Addressable::URI::InvalidURIError, TypeError
    raise ActiveRecord::RecordNotFound
  end

  def safe_external_redirect?(parsed_url)
    parsed_url.present? && parsed_url.host.present? && %w(http https).include?(parsed_url.scheme)
  end

  def safe_internal_redirect?(parsed_url)
    parsed_url.present? && parsed_url.relative? && parsed_url.scheme.nil? && parsed_url.host.nil? && parsed_url.path.present? && parsed_url.path.starts_with?('/')
  end
end
