# frozen_string_literal: true

module BrandingHelper
  def logo_as_symbol(version = :icon)
    case version
    when :icon
      _logo_as_symbol_icon
    when :wordmark
      _logo_as_symbol_wordmark
    end
  end

  def _logo_as_symbol_wordmark
    content_tag(
      :svg,
      tag.use(href: "##{PianyuBranding::WORDMARK_SYMBOL_ID}"),
      viewBox: PianyuBranding::WORDMARK_VIEWBOX,
      class: 'logo logo--wordmark',
      role: 'img',
      'aria-label': PianyuBranding::NAME,
    )
  end

  def _logo_as_symbol_icon
    content_tag(
      :svg,
      tag.use(href: "##{PianyuBranding::ICON_SYMBOL_ID}"),
      viewBox: PianyuBranding::ICON_VIEWBOX,
      class: 'logo logo--icon',
      role: 'img',
      'aria-label': PianyuBranding::NAME,
    )
  end

  def render_logo
    image_tag(
      frontend_asset_path(PianyuBranding::LOGO_ASSET_PATH),
      alt: PianyuBranding::NAME,
      class: 'logo logo--icon'
    )
  end
end
