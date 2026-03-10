# frozen_string_literal: true

# Shared frontend assets
Rails.application.config.assets.paths << Rails.root.join('app', 'javascript')

# SVG icons
Rails.application.config.assets.paths << Rails.root.join('app', 'javascript', 'images')

# Material Design icons
Rails.application.config.assets.paths << Rails.root.join('app', 'javascript', 'material-icons')
