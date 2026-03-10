# frozen_string_literal: true

module PianyuBranding
  NAME = 'PianYu'
  MASK_ICON_COLOR = '#2f5a78'
  ICON_SYMBOL_ID = 'pianyu-symbol-icon'
  WORDMARK_SYMBOL_ID = 'pianyu-symbol-wordmark'
  ICON_VIEWBOX = '0 0 80 80'
  WORDMARK_VIEWBOX = '0 0 282 72'

  LOGO_ASSET_PATH = 'brand/pianyu/logo.svg'
  ICON_SYMBOL_ASSET_PATH = 'brand/pianyu/logo-symbol-icon.svg'
  WORDMARK_SYMBOL_ASSET_PATH = 'brand/pianyu/logo-symbol-wordmark.svg'
  APP_ICON_ASSET_PATH = 'brand/pianyu/app-icon.svg'

  THEME_COLORS = {
    light: '#fcfaf6',
    dark: '#171b20',
  }.freeze

  module_function

  def favicon_asset_path(size)
    "icons/favicon-#{size}x#{size}.png"
  end

  def apple_touch_icon_asset_path(size)
    "icons/apple-touch-icon-#{size}x#{size}.png"
  end

  def android_icon_asset_path(size)
    "icons/android-chrome-#{size}x#{size}.png"
  end

  def mailer_logo_asset_path
    'images/mailer/logo.png'
  end

  def mailer_wordmark_asset_path
    'images/mailer/wordmark.png'
  end
end
