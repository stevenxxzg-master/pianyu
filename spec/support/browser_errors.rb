# frozen_string_literal: true

module BrowserErrorsHelpers
  def ignore_js_error(error)
    @ignored_js_errors_for_spec << error
  end

  def error_message(error)
    error.keys.map { |key| "#{key.to_s.titleize}: #{error[key]}" }.join("\n")
  end

  def js_error_match_targets(error)
    [
      error[:text],
      error[:page],
      error.dig(:location, 'url'),
      error.dig(:location, :url),
    ].compact
  end

  def js_error_ignored?(pattern, error)
    js_error_match_targets(error).any? do |target|
      pattern.is_a?(Regexp) ? pattern.match?(target) : pattern.to_s == target
    end
  end
end

RSpec.configure do |config|
  config.include BrowserErrorsHelpers, :js, type: :system

  config.before(:each, :js, type: :system) do |example|
    @ignored_js_errors_for_spec = []

    example.metadata[:js_console_messages] ||= []
    Capybara.current_session.driver.with_playwright_page do |page|
      page.on('console', lambda { |msg|
        example.metadata[:js_console_messages] << { type: msg.type, text: msg.text, location: msg.location, page: msg.page.url }
      })
    end
  end

  config.after(:each, :js, type: :system) do |example|
    # Classes of intermittent ignorable errors
    ignored_errors = [
      /Error while trying to use the following icon from the Manifest/, # https://github.com/mastodon/mastodon/pull/30793
      /Manifest: Line: 1, column: 1, Syntax error/, # Similar parsing/interruption issue as above
    ].concat(@ignored_js_errors_for_spec)

    errors = example.metadata[:js_console_messages].reject do |msg|
      ignored_errors.any? { |pattern| js_error_ignored?(pattern, msg) }
    end

    if errors.present?
      aggregate_failures 'browser errrors' do
        errors.each do |error|
          expect(error[:type]).to_not eq('error'), error_message(error)
          next unless error[:type] == 'warning'

          warn 'WARN: browser warning'
          warn error[:text]
        end
      end
    end
  end
end
