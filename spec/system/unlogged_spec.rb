# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'UnloggedBrowsing', :js, :streaming do
  subject { page }

  before do
    visit root_path
  end

  it 'loads the branded landing page' do
    expect(subject)
      .to have_css('body', class: 'public-page-body')
      .and have_css('.public-page--landing')
      .and have_link(I18n.t('public_pages.shared.actions.sign_in'))
  end
end
