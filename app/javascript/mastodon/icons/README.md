# PianYu Icon System

This folder is the shared icon entrypoint for MAS-86.

## Visual rules

- Codex-inspired direction: compact glyphs, softened corners, and explicit default/active/disabled states.
- Size scale: navigation/settings/action icons render at 20px, status icons at 18px, and empty-state icons at 24px.
- Surface treatment: migrated navigation and action affordances should use the `icon--pianyu*` classes together with the `column-link--pianyu` and `icon-button--pianyu` shell styles so hover/active states feel consistent.

## Entry points

- React: import `PianyuIcon`, `getPianyuIcon`, or the `iconName` props wired into migrated components.
- Rails: use `pianyu_icon(...)` from `ApplicationHelper` for migrated server-rendered navigation.

## Migration boundary

- Prefer this entrypoint for navigation, settings, action, status, and empty-state work.
- Existing direct `@/material-icons/...svg?react` imports remain legacy until a surface is intentionally migrated.
- Existing brand logos stay on `mastodon/components/logo` for now; they are outside this incremental rollout.
