# PianYu visual system

This document defines the MAS-77 source of truth for the PianYu (片语) visual foundation.

## Direction

- Light-first, restrained, and editorial.
- Calm over noisy: the interface should reduce pressure, not manufacture urgency.
- Attention flow comes first: emphasis is reserved for composition, active states, and personal context.
- Surfaces should feel airy and tactile, using paper-toned backgrounds, ink-blue accents, soft borders, and generous whitespace.

## Product tone

- Speak quietly: prefer guidance and context over alerts and spectacle.
- Show confidence through spacing, typography, and hierarchy instead of heavy decoration.
- Keep recommendation signals weak by default; use the brand accent sparingly.

## Design principles

1. One palette, many surfaces. New M5 work should consume semantic tokens instead of inventing local constants.
2. Typography carries hierarchy. Body copy stays neutral; display moments use a more editorial serif voice.
3. Containers breathe. Page gutters, form widths, and cards align to shared container and spacing scales.
4. Motion reassures. Use short ease transitions and one emphasis curve; avoid busy micro-animations.
5. Brand assets are generated, not hand-copied. Edit the source package and regenerate derivatives.

## Token entrypoints

- Theme palette: `app/javascript/styles/mastodon/theme/_base.scss`
- Semantic light tokens: `app/javascript/styles/mastodon/theme/_light.scss`
- Semantic dark tokens: `app/javascript/styles/mastodon/theme/_dark.scss`
- Shared foundation scales: `app/javascript/styles/mastodon/foundation.scss`
- Global consumption entrypoint: `app/javascript/styles/common.scss`

## Containers and hierarchy

- `--container-auth`: centered auth/public shell width.
- `--container-form`: shared form column width.
- `--page-gutter`: viewport-aware horizontal breathing room.
- `--radius-*`, `--space-*`, and `--shadow-*`: default card, field, and shell primitives.

## Icon system

Inspired by Codex app for mac, the default icon language should feel precise and calm:

- Use rounded geometry on a 20/24px grid.
- Keep icons optically centered and slightly roomy inside their hit areas.
- Prefer outline or single-tone icons for resting states.
- Reserve filled/brand-accent treatments for active, selected, or primary moments.
- Pair icons with soft hover surfaces instead of loud badges.

Shared icon sizing and hit-area tokens live in `app/javascript/styles/mastodon/foundation.scss` and feed the global `.icon` / `.icon-button` styles in `app/javascript/styles/mastodon/components.scss`.

## Brand assets

Checked-in source assets live in `app/javascript/brand/pianyu/`.

- `logo.svg`: default colored mark.
- `logo-symbol-icon.svg`: inline currentColor symbol for shared icon rendering.
- `logo-symbol-wordmark.svg`: inline currentColor symbol for shared wordmark rendering.
- `app-icon.svg`: app icon and touch icon source.

Ruby-side brand constants live in `app/lib/pianyu_branding.rb`.
React-side brand constants live in `app/javascript/brand/index.ts`.

## Asset generation

After editing any source brand asset, regenerate derived assets:

```bash
mise exec ruby@3.4.8 node@24.14.0 -- bundle exec rake branding:generate
```

This refreshes:

- `app/javascript/icons/*`
- `app/javascript/images/mailer/logo.png`
- `app/javascript/images/mailer/wordmark.png`
- `lib/assets/wordmark.dark.png`
- `lib/assets/wordmark.light.png`
- `public/badge.png`
