# Unattended Linear Session Template

Use this template when launching an unattended Codex session for a Linear ticket
in this repository.

## Required sandbox

- `sandbox_mode: workspace-write`
- `approval_policy: never`
- `writable_roots` must include:
  - `<repo>`
  - `<repo>/.git`

Keep the scope minimal: only the checked-out repository and its own `.git`
directory should be writable.

## Bootstrap sequence

1. Run `bin/codex-git-permission-check` before any code edits.
2. Run `git pull --ff-only` and record the source/result/HEAD in the Linear
   workpad.
3. If either command fails with `Operation not permitted` inside `.git`, treat
   it as an external sandbox blocker and do not continue to branch/commit/push.
4. Only after the checks pass, create the ticket branch, implement the change,
   validate it, push it, and attach the PR URL back to Linear.

## Expected publish flow

- `git pull --ff-only`
- `git switch -c <ticket-branch>`
- implement + validate
- `git commit`
- `git push`
- attach PR URL to the Linear issue
