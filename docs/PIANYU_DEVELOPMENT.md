# PianYu Mastodon development quickstart

Use this document for the supported clone-to-login flow on a fresh developer
machine. It covers the repo-pinned runtimes, local services, environment
defaults, bootstrap commands, and the seeded owner login used in development.

## 1. Start in the repo root

Clone the PianYu repository, then `cd` into the checkout before running the
rest of these commands.

## 2. Install the pinned runtimes

This repo pins the recommended toolchain in `.ruby-version` and `.nvmrc`.
PianYu works with any Ruby `>= 3.2.0, < 3.5.0` and Node `>= 20`, but the pinned
versions are the supported path for local setup.

If you use [`mise`](https://mise.jdx.dev/), install the exact versions from the
repo root:

```shell
mise trust
mise install "ruby@$(cat .ruby-version)" "node@$(tr -d '\n' < .nvmrc).0"
```

Run all setup commands through `mise exec` unless you already activated the
same Ruby and Node versions in your shell:

```shell
mise exec "ruby@$(cat .ruby-version)" "node@$(tr -d '\n' < .nvmrc).0" -- ruby -v
mise exec "ruby@$(cat .ruby-version)" "node@$(tr -d '\n' < .nvmrc).0" -- node -v
```

## 3. Install local services and native dependencies

On macOS, install the dependencies required by the current bundle and Rails boot
path:

```shell
brew install postgresql@16 redis libidn pkgconf vips ffmpeg
brew services start postgresql@16
brew services start redis
```

If PostgreSQL reports that your local role does not exist, create a matching
superuser for your macOS username and re-run setup:

```shell
createuser -s "$(whoami)"
```

## 4. Environment defaults

The repo already includes `.env.development` with the Active Record encryption
keys needed for local boot. You can usually leave it as-is.

The host-side defaults are:

- `LOCAL_DOMAIN=localhost:3000`
- PostgreSQL over the local socket unless you set `DB_HOST`, `DB_USER`,
  `DB_PASS`, or `DB_PORT`
- Redis at `localhost:6379`
- Streaming at `ws://localhost:4000`
- Vite dev server at `localhost:3036`

Only export overrides when your local machine needs something different. For
example, if another app already uses the default ports:

```shell
export PORT=3100
export STREAMING_PORT=4100
export VITE_RUBY_PORT=3136
export LOCAL_DOMAIN=localhost:3100
export STREAMING_API_BASE_URL=ws://localhost:4100
export VITE_DEV_SERVER_PUBLIC=localhost:3136
```

## 5. Bootstrap the app

Run the full bootstrap once after cloning or whenever you need to rebuild the
local environment from scratch:

```shell
mise exec "ruby@$(cat .ruby-version)" "node@$(tr -d '\n' < .nvmrc).0" -- bin/setup
```

`bin/setup` installs the required Bundler version from `Gemfile.lock`, installs
Ruby gems and Yarn packages, prepares the development database, and clears old
logs/tempfiles.

## 6. Start PianYu locally

Start the full development stack with:

```shell
mise exec "ruby@$(cat .ruby-version)" "node@$(tr -d '\n' < .nvmrc).0" -- bin/dev
```

`bin/dev` exports the local defaults, verifies the required Bundler version,
checks that gems and Yarn packages are installed, and then launches the web,
Sidekiq, streaming, and Vite processes. If `overmind` or `foreman` are not
installed, it falls back to the built-in Procfile runner instead of trying to
download extra tooling during first boot.

## 7. Open the app and sign in

Once `bin/dev` is healthy, open:

- `http://localhost:3000` when using the defaults
- `http://localhost:<PORT>` when you exported alternate ports

The development seed creates an owner account automatically. Sign in at
`/auth/sign_in` with:

- Email: `admin@localhost`
- Password: `mastodonadmin`

If you changed `LOCAL_DOMAIN`, the seed uses `admin@<LOCAL_DOMAIN without the
port>` instead.

## 8. Day-2 update flow

After pulling new changes, refresh the checkout with:

```shell
git pull --ff-only
mise exec "ruby@$(cat .ruby-version)" "node@$(tr -d '\n' < .nvmrc).0" -- bin/update
```

Then start the app again with `bin/dev`.

## 9. Troubleshooting

- `Bundler ... is not installed for the active Ruby`: rerun `bin/setup` with the
  repo-pinned Ruby.
- `Ruby gems are missing` or `JavaScript dependencies are missing`: rerun
  `bin/setup` before starting `bin/dev`.
- `libidn` build failures on Apple Silicon: make sure `brew install libidn
pkgconf` completed successfully, then rerun `bin/setup`.
- `role "<your user>" does not exist`: create the PostgreSQL role with
  `createuser -s "$(whoami)"`.
- Port conflicts on `3000`, `4000`, or `3036`: export the alternate-port block
  from [Environment defaults](#4-environment-defaults) before running `bin/dev`.

## 10. Container alternative

If you prefer running the app inside the repo dev container instead of on the
host, use:

```shell
docker compose -f .devcontainer/compose.yaml up -d
docker compose -f .devcontainer/compose.yaml exec app bin/setup
docker compose -f .devcontainer/compose.yaml exec app bin/dev
```

The same seeded owner login works inside the container flow.
