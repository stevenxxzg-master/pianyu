# Design tokens

## Source of truth

- Foundation tokens live in `app/javascript/styles/mastodon/theme/_base.scss`.
- Color-scheme tokens live in `app/javascript/styles/mastodon/theme/_light.scss` and `app/javascript/styles/mastodon/theme/_dark.scss`.
- `app/javascript/styles/mastodon/theme/index.scss` mounts those tokens onto `html`, so every legacy stylesheet and CSS module reads the same variables.

## Token groups

- Typography: `--font-family-*`, `--font-weight-*`, `--text-size-*`, `--text-line-*`
- Spacing and size: `--space-*`, `--control-height-md`, `--container-*`, `--panel-*`, `--column-*`
- Shape and motion: `--radius-*`, `--motion-duration-*`, `--motion-ease-*`
- Surfaces and elevation: `--surface-*`, `--surface-border*`, `--shadow-*`
- Layering: `--z-index-*`

## Consumption rules

- SCSS should consume tokens with `var(--token-name)` instead of introducing new px, radius, shadow, or z-index literals for reusable UI.
- Prefer semantic surface tokens (`--surface-panel`, `--surface-card`, `--surface-field`, `--surface-popout`, `--surface-modal`) over raw color tokens when styling containers.
- Prefer semantic border and elevation tokens (`--surface-border`, `--surface-border-raised`, `--shadow-raised`, `--shadow-floating`, `--shadow-overlay`) for cards, forms, and overlays.
- Component-local CSS modules follow the same rule set; see `app/javascript/mastodon/components/form_fields/*.module.scss` and `app/javascript/mastodon/components/mini_card/styles.module.css` for examples.
- Component logic that needs numeric layout values should read the CSS variable from `document.documentElement` instead of hardcoding a duplicate constant; see `app/javascript/mastodon/features/navigation_panel/index.tsx`.

## Layering contract

- `--z-index-underlay` < `--z-index-base` < `--z-index-raised` < `--z-index-sticky` < `--z-index-navigation` < `--z-index-inline-alert` < `--z-index-drawer` < `--z-index-upload` < `--z-index-modal` < `--z-index-popout`
- Popouts stay above modal content shells, while drawer scrims and upload overlays stay below modal roots.
