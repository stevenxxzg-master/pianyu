# frozen_string_literal: true

module BrandingHelper
  BRAND_NAME_PRIMARY = '片语'
  BRAND_NAME_SECONDARY = 'PianYu'
  BRAND_ACCESSIBLE_NAME = %(#{BRAND_NAME_PRIMARY} #{BRAND_NAME_SECONDARY}).freeze
  BRAND_META_DESCRIPTION = '片语 PianYu is a calm social space for thoughtful posts, slower conversation, and low-pressure discovery.'
  BRAND_SHORT_NAME = BRAND_NAME_PRIMARY
  BRAND_MASK_ICON_COLOR = '#29425d'
  BRAND_THEME_COLOR = '#f4efe6'
  BRAND_BACKGROUND_COLOR = '#ece3d6'

  def logo_as_symbol(version = :icon)
    case version
    when :icon
      logo_svg('logo-symbol-icon', '0 0 72 72', 'logo logo--icon')
    when :wordmark
      logo_svg('logo-symbol-wordmark', '0 0 300 72', 'logo logo--wordmark')
    end
  end

  def render_logo
    image_tag(frontend_asset_path('images/logo.svg'), alt: brand_accessible_name, class: 'logo logo--icon')
  end

  def brand_accessible_name
    BRAND_ACCESSIBLE_NAME
  end

  def brand_meta_description
    BRAND_META_DESCRIPTION
  end

  def brand_short_name
    BRAND_SHORT_NAME
  end

  def brand_mask_icon_color
    BRAND_MASK_ICON_COLOR
  end

  def brand_theme_color
    BRAND_THEME_COLOR
  end

  def brand_background_color
    BRAND_BACKGROUND_COLOR
  end

  private

  def logo_svg(symbol_id, view_box, class_name)
    content_tag(
      :svg,
      safe_join([content_tag(:title, brand_accessible_name), tag.use(href: "##{symbol_id}")]),
      viewBox: view_box,
      class: class_name,
      role: 'img'
    )
  end
end
