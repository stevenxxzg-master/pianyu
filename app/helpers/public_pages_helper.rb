# frozen_string_literal: true

module PublicPagesHelper
  def public_brand_name
    site_title.presence || 'PianYu'
  end

  def public_marketing_description
    instance_presenter.description.presence || t('public_pages.shared.description', site: public_brand_name)
  end

  def public_sign_up_label
    if closed_registrations?
      t('public_pages.shared.actions.find_server')
    elsif approved_registrations?
      t('public_pages.shared.actions.apply')
    else
      t('public_pages.shared.actions.sign_up')
    end
  end

  def public_nav_link(label_key, path, html_options = {})
    classes = ['public-header__nav-link', html_options[:class], current_page?(path) && 'is-active'].compact.join(' ')
    link_to t(label_key), path, html_options.merge(class: classes)
  end


  def public_copy(item, key)
    item[key.to_s] || item[key.to_sym]
  end

  def public_metrics
    [
      { value: friendly_number_to_human(instance_presenter.user_count), label: t('public_pages.shared.stats.members') },
      { value: friendly_number_to_human(instance_presenter.status_count), label: t('public_pages.shared.stats.posts') },
      { value: friendly_number_to_human(instance_presenter.domain_count), label: t('public_pages.shared.stats.servers') },
    ]
  end

  def public_extended_description_html
    description = ExtendedDescription.current
    return if description.text.blank?

    public_markdown_content(description.text)
  end

  def public_markdown_content(text)
    markdown(format(text, domain: site_hostname))
  end

  def public_rules
    Rule.ordered.includes(:translations).map { |rule| rule.translation_for(I18n.locale) }
  end
end
