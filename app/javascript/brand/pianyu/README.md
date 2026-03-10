# PianYu brand assets

This directory is the checked-in source of truth for the MAS-77 brand package.

- `logo.svg`: colored mark used by default HTML/image entrypoints.
- `logo-symbol-icon.svg`: currentColor SVG symbol for inline icon usage.
- `logo-symbol-wordmark.svg`: currentColor SVG symbol for inline wordmark usage.
- `app-icon.svg`: high-resolution source for app icons and touch icons.

Regenerate derived PNG assets after editing these files:

```bash
mise exec ruby@3.4.8 node@24.14.0 -- bundle exec rake branding:generate
```
