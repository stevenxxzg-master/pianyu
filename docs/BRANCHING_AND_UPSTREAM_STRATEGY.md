# PianYu Mastodon Branching and Upstream Strategy

## Why this document exists

PianYu is still close to upstream Mastodon, which makes now the right time to
choose a maintenance strategy that keeps future upgrades cheap.

The guiding principle is simple: keep the fork shallow, keep long-lived branches
few, and express customization through narrow seams instead of broad rewrites.

## Decision summary

1. `main` stays the only long-lived development branch.
2. We do not keep a second long-lived `custom-main` branch.
3. Official Mastodon is tracked via a dedicated read-only `upstream` remote.
4. Product work happens on short-lived topic branches and merges back quickly.
5. Upstream sync work happens on dedicated `upgrade/*` branches, never directly on `main`.
6. High-conflict directories should prefer wrappers, isolated entrypoints, feature flags, or configuration seams.

## Branch roles

| Ref                        | Role                              | Rules                                             |
| -------------------------- | --------------------------------- | ------------------------------------------------- |
| `upstream/main`            | Official Mastodon source of truth | Read-only remote-tracking ref. Never commit here. |
| `main`                     | PianYu integration branch         | Must stay deployable and close to upstream.       |
| `feature/<ticket>-<topic>` | Short-lived customization branch  | Start from `main`, merge quickly, then delete.    |
| `fix/<ticket>-<topic>`     | Short-lived bugfix branch         | Same lifecycle as `feature/*`.                    |
| `upgrade/<tag-or-date>`    | Short-lived upstream sync branch  | Created from `main` for each upstream sync pass.  |

## Why not keep a long-lived custom trunk

A permanent `custom-main` branch increases maintenance cost in two ways:

- upstream changes must be replayed across an ever-growing private diff
- reviewers lose the ability to distinguish product work from upstream catch-up

Because the repository is still near-upstream, the lower-risk strategy is to
keep `main` as the single long-lived integration branch and keep custom work
small and short-lived.

## Upstream sync policy

### Remote setup

Add the official Mastodon repository as `upstream` and keep it read-only.

```bash
git remote add upstream https://github.com/mastodon/mastodon.git
git fetch upstream --tags
git remote -v
```

Expected steady state:

- `origin` points to the PianYu fork
- `upstream` points to official Mastodon
- feature and upgrade work starts from local `main`, not directly from remote refs

### Sync cadence

- Weekly: fetch upstream and inspect drift.
- Every official release tag: run a structured upgrade pass.
- Security or protocol fixes: sync immediately.
- Before any large PianYu feature train: sync upstream first.

### Upgrade flow

1. Fetch `upstream` and tags.
2. Create `upgrade/<tag-or-date>` from `main`.
3. Inspect diffs in high-risk paths before merging.
4. Merge the target upstream ref into the `upgrade/*` branch.
5. Resolve conflicts by preserving upstream defaults whenever possible.
6. Re-apply PianYu behavior via wrappers, isolated files, or flags instead of broad patches.
7. Run targeted validation.
8. Merge the reviewed `upgrade/*` branch back into `main`.

Example command sequence:

```bash
git fetch origin main
git fetch upstream --tags
git switch main
git switch -c upgrade/<tag-or-date>
git merge --no-ff <upstream-ref>
```

Useful values for `<upstream-ref>`:

- `upstream/main` for early conflict scouting
- a release tag such as `v4.3.0`
- a stable branch such as `upstream/stable-4.2`

## High-risk paths and customization rules

| Path                                        | Risk      | Preferred approach                                                                    |
| ------------------------------------------- | --------- | ------------------------------------------------------------------------------------- |
| `app/javascript/mastodon/**`                | Very high | Prefer wrapper components, new entrypoints, or additive state wiring over deep edits. |
| `app/views/**`                              | High      | Prefer themes, custom CSS, and isolated partials over broad template rewrites.        |
| `app/controllers/**`                        | High      | Add thin controllers and move behavior into services when possible.                   |
| `app/models/**`                             | Very high | Avoid changing core model semantics or callbacks without a strong reason.             |
| `config/routes.rb`                          | High      | Prefer narrow route files under `config/routes/*.rb`.                                 |
| `db/migrate/**` and `db/schema.rb`          | Very high | Keep schema changes additive, forward-compatible, and reversible.                     |
| `config/locales/**`                         | High      | Prefer PianYu-owned keys/files instead of broad edits to upstream locale files.       |
| `config/initializers/**` and `config/*.yml` | Medium    | Good place for environment-driven behavior and integrations.                          |

## Prefer wrappers and feature flags when

- the change is branding, theme, layout, or copy related
- the feature is optional, tenant-specific, or experimental
- a new experience can live behind its own entrypoint or page
- an external integration can be wired through a new service or initializer
- rollout and rollback must be possible without deleting code

Current extension seams already in this repo include:

- `app/helpers/theme_helper.rb`
- `app/views/custom_css/show.css.erb`
- `config/initializers/3_omniauth.rb`
- `app/javascript/entrypoints/wrapstodon.tsx`
- `config/routes/*.rb`

Recommended flag carriers in this codebase:

- `ENV` read from initializers
- `Rails.configuration.x.*`
- site settings when operator control is required

## Direct deep patches are the exception

Allow a deep patch only when all of the following are true:

1. there is no realistic wrapper or additive alternative
2. the change is required for protocol correctness, security, or a non-negotiable product need
3. the touched files are recorded in upgrade notes before merge
4. the patch has a rollback plan and a future owner

## Customization decision matrix

| Change shape                                               | Default mechanism                                 | Notes                                                         |
| ---------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| Branding, copy, spacing, visual polish                     | theme variables, `custom.css`, wrapper component  | Avoid broad edits in `app/javascript/mastodon/**`.            |
| Optional page or standalone flow                           | dedicated entrypoint plus thin route/controller   | Prefer additive files over shared-page surgery.               |
| Tenant-specific or experimental behavior                   | feature flag plus additive service/wrapper        | Rollout and rollback should not require code deletion.        |
| Authentication or third-party integration                  | initializer + `ENV` + isolated service            | Keep provider logic out of shared request flow when possible. |
| Timeline, moderation, notification, or federation behavior | feature flag plus narrow service/controller patch | Treat as high-risk and justify deep edits.                    |
| Schema-backed capability                                   | additive migration plus feature flag              | Never repurpose upstream columns or tables.                   |
| Cross-cutting protocol/security fix                        | direct patch only if unavoidable                  | Document why wrapper/flag alternatives were insufficient.     |

## Review rule for future changes

Any PR touching one of the following paths should explain why a wrapper or
feature flag was insufficient:

- `app/javascript/mastodon/**`
- `app/controllers/**`
- `app/models/**`
- `config/routes.rb`
- `db/migrate/**`

If that explanation is weak, the change should be redesigned before merge.
