# Unattended Codex Workflow

This repository supports unattended Codex implementation sessions, but the
publish flow only works when the active checkout's `.git` directory is writable
in addition to the working tree.

## Required sandbox posture

Grant the smallest write surface that still allows the repository's local git
metadata to update:

```text
sandbox_mode: workspace-write
approval_policy: never
writable_roots:
  - <repo>
  - <repo>/.git
```

Do not broaden write access to unrelated repositories or parent directories.

## Why `.git` write access is required

- `git pull --ff-only` updates `.git/FETCH_HEAD`
- branch creation writes `.git/refs/heads/*.lock`
- `git commit` writes `.git/index.lock`, objects, and refs
- `git push` updates local remote-tracking refs after the remote accepts the push

When the sandbox omits `<repo>/.git`, the failure mode is usually one of these:

- `error: cannot open '.git/FETCH_HEAD': Operation not permitted`
- `fatal: cannot lock ref ... .lock: Operation not permitted`

## Startup checklist

Run these steps before editing code in an unattended session:

1. `bin/codex-git-permission-check`
2. `git pull --ff-only`
3. Record the pull source, result, and resulting `HEAD` in the Linear workpad
4. Only then create the ticket branch and start implementation

If step 1 or 2 fails because `.git` is not writable, treat that as a sandbox
blocker. The session can still prepare a patch, but it cannot satisfy commit,
push, or PR-linking acceptance criteria until the sandbox is relaunched with the
required `.git` write access.

## Validation bar

Use the following evidence before marking an unattended ticket ready for review:

- `bin/codex-git-permission-check` passes
- `git pull --ff-only` passes
- branch creation works on the real ticket branch
- the ticket completes `git commit`, `git push`, and PR attachment back to Linear

The session template in `.codex/unattended-linear-session.md` mirrors these
requirements so they can be applied consistently at session start.
