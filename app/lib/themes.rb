# frozen_string_literal: true

require 'singleton'
require 'yaml'

class Themes
  include Singleton

  THEME_COLORS = PianyuBranding::THEME_COLORS

  def initialize
    @conf = YAML.load_file(Rails.root.join('config', 'themes.yml'))
  end

  def names
    @conf.keys
  end
end
