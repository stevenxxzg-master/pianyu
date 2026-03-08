# Development

## Overview

Before starting local development, read the [CONTRIBUTING] guide to understand
what changes are desirable and what general processes to use.

For long-term fork maintenance and upgrade planning, also read the [Branching and Upstream Strategy](BRANCHING_AND_UPSTREAM_STRATEGY.md) guide.

## Environments

The following instructions will guide you through the process of setting up a local development instance of Mastodon on your computer.

Before the first boot, copy the shared local environment template:

```shell
cp .env.example .env
```

If you skip this step, `bin/setup` and `bin/dev` will create `.env` from
`.env.example` when you are running a native local checkout without managed env
overrides already exported.

Native local checkouts usually mean the macOS/Linux flows below where you run
PostgreSQL and Redis yourself on `localhost`. Managed environments such as
Vagrant, Docker/Dev Containers, and GitHub Codespaces already inject the app,
database, and Redis settings they need, so they normally do not need a repo-
local `.env` bootstrap.

This `.env` file is the shared source for `bin/dev`, Foreman/Overmind, and the
streaming server. The checked-in defaults assume:

- the web app runs at `http://localhost:3000`
- the Vite dev server runs at `localhost:3036`
- PostgreSQL is available on `localhost:5432`
- Redis is available on `localhost:6379`
- Elasticsearch is disabled unless you explicitly enable it

Adjust the copied values when your local services differ.

There are instructions for these environments:

- [Vagrant](#vagrant)
- [macOS](#macos)
- [Linux](#linux)
- [Docker](#docker)
- [Dev Containers](#dev-containers)
- [GitHub Codespaces](#github-codespaces)

Once completed, continue with the [Next steps](#next-steps) section below.

### Vagrant

A **Vagrant** configuration is included for development purposes. To use it,
complete the following steps:

This is a managed environment: provisioning exports the shared settings from
`.env.vagrant`, so you typically do not need to create a separate repo-local
`.env` unless you are intentionally overriding those defaults.

- Install Vagrant and Virtualbox
- Install the `vagrant-hostsupdater` plugin:
  `vagrant plugin install vagrant-hostsupdater`
- Run `vagrant up`
- Run `vagrant ssh -c "cd /vagrant && bin/dev"`
- Open `http://mastodon.local` in your browser

### macOS

To set up **macOS** for native development, complete the following steps:

- Install [Homebrew] and run:
  `brew install postgresql@14 redis libidn nvm vips`
  to install the required project dependencies
- Use a Ruby version manager to activate the ruby in `.ruby-version` and run
  `nvm use` to activate the node version from `.nvmrc`
- Start the database services by running `brew services start postgresql` and
  `brew services start redis`
- Run `bin/setup`, which defaults `RAILS_ENV` to `development`, installs the required ruby gems and node
  packages and prepare the database for local development

  (Note: If you are on Apple Silicon and get an error related to `libidn`, you should be able to fix this by running `gem install idn-ruby -- --with-idn-dir=$(brew --prefix libidn)`, then re-running the command above.)

- Finally, run the `bin/dev` script which will launch services via `overmind`
  (if installed) or `foreman`

### Linux

The Mastodon documentation has a [guide on installing Mastodon from source](https://docs.joinmastodon.org/dev/setup/#manual) on Linux.

### Docker

For production hosting and deployment with **Docker**, use the `Dockerfile` and
`docker-compose.yml` in the project root directory.

For local development, install and launch [Docker], and run:

```shell
docker compose -f .devcontainer/compose.yaml up -d
docker compose -f .devcontainer/compose.yaml exec app bin/setup
docker compose -f .devcontainer/compose.yaml exec app bin/dev
```

This compose-based flow is also managed: `.devcontainer/compose.yaml` injects
the service hostnames and search defaults for you, so the usual `.env.example`
copy step is optional unless you want extra local overrides inside the app
container.

### Dev Containers

Within IDEs that support the [Development Containers] specification, start the
"Mastodon on local machine" container from the editor. The necessary `docker
compose` commands to build and setup the container should run automatically. For
**Visual Studio Code** this requires installing the [Dev Container extension].

Like the Docker flow above, Dev Containers provide the key environment
variables through compose/devcontainer config, so they normally do not need a
checked-out `.env` file.

### GitHub Codespaces

[GitHub Codespaces] provides a web-based version of VS Code and a cloud hosted
development environment configured with the software needed for this project.

Codespaces is likewise a managed environment: the devcontainer configuration
pre-populates the instance-specific host and service settings it needs.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)][codespace]

- Click the button to create a new codespace, and confirm the options
- Wait for the environment to build (takes a few minutes)
- When the editor is ready, run `bin/dev` in the terminal
- Wait for an _Open in Browser_ prompt. This will open Mastodon
- On the _Ports_ tab "stream" setting change _Port visibility_ → _Public_

## Next steps

- Once you have successfully set up a development environment, it will be available on http://localhost:3000
- Log in as the default admin user with the username `admin@mastodon.local` or `admin@localhost` (depending on your setup) and the password `mastodonadmin`.
- Check out the [Mastodon docs] for tips on working with emails in development (you'll need this when creating new user accounts) as well as a list of useful commands for testing and updating your dev instance.
- Run `bin/ci-baseline` to mirror the GitHub baseline checks locally once dependencies and services are ready.
- You can optionally populate your database with sample data by running `bin/rails dev:populate_sample_data`. This will create a `@showcase_account` account with various types of contents.

[codespace]: https://codespaces.new/mastodon/mastodon?quickstart=1&devcontainer_path=.devcontainer%2Fcodespaces%2Fdevcontainer.json
[CONTRIBUTING]: ../CONTRIBUTING.md
[Dev Container extension]: https://containers.dev/supporting#dev-containers
[Development Containers]: https://containers.dev/supporting
[Docker]: https://docs.docker.com
[GitHub Codespaces]: https://docs.github.com/en/codespaces
[Homebrew]: https://brew.sh
[Mastodon docs]: https://docs.joinmastodon.org/dev/setup/#working-with-emails-in-development
