# Development

## Overview

Before starting local development, read the [CONTRIBUTING] guide to understand
what changes are desirable and what general processes to use.

## PianYu quickstart

For the supported PianYu clone-to-login workflow, start with
[PIANYU_DEVELOPMENT](PIANYU_DEVELOPMENT.md). It covers the repo-pinned Ruby and
Node versions, Homebrew dependencies, environment defaults, `bin/setup`,
`bin/dev`, the seeded owner login, port overrides, and the day-2 `bin/update`
flow. The rest of this file keeps the broader upstream environment notes.

## Environments

The following instructions will guide you through the process of setting up a local development instance of Mastodon on your computer.

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

- Install Vagrant and Virtualbox
- Install the `vagrant-hostsupdater` plugin:
  `vagrant plugin install vagrant-hostsupdater`
- Run `vagrant up`
- Run `vagrant ssh -c "cd /vagrant && bin/dev"`
- Open `http://mastodon.local` in your browser

### macOS

For native macOS development on this fork, use
[PIANYU_DEVELOPMENT](PIANYU_DEVELOPMENT.md). That quickstart is the maintained
path and documents the current `mise`-based runtime activation, Homebrew
packages, env defaults, `bin/setup`, `bin/dev`, and local login flow.

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

Use the same seeded owner credentials documented in
[PIANYU_DEVELOPMENT](PIANYU_DEVELOPMENT.md) after the app boots.

### Dev Containers

Within IDEs that support the [Development Containers] specification, start the
"PianYu Mastodon on local machine" container from the editor. The necessary
`docker compose` commands to build and setup the container should run
automatically. For **Visual Studio Code** this requires installing the [Dev
Container extension].

### GitHub Codespaces

[GitHub Codespaces] provides a web-based version of VS Code and a cloud hosted
development environment configured with the software needed for this project.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)][codespace]

- Click the button to create a new codespace, and confirm the options
- Wait for the environment to build (takes a few minutes)
- When the editor is ready, run `bin/dev` in the terminal
- Wait for an _Open in Browser_ prompt. This will open PianYu Mastodon
- On the _Ports_ tab "stream" setting change _Port visibility_ → _Public_

## Next steps

- Once you have successfully set up a development environment, it will usually be available on http://localhost:3000 unless you choose alternate local ports.
- Log in as the default admin user with the username `admin@localhost` (or `admin@<LOCAL_DOMAIN without the port>` when overriding `LOCAL_DOMAIN`) and the password `mastodonadmin`.
- Check out the [Mastodon docs] for tips on working with emails in development (you'll need this when creating new user accounts) as well as a list of useful commands for testing and updating your dev instance.
- Use `bin/update` after pulling new changes to refresh gems, JavaScript packages, and the development database.
- You can optionally populate your database with sample data by running `bin/rails dev:populate_sample_data`. This will create a `@showcase_account` account with various types of contents.

[codespace]: https://codespaces.new/mastodon/mastodon?quickstart=1&devcontainer_path=.devcontainer%2Fcodespaces%2Fdevcontainer.json
[CONTRIBUTING]: ../CONTRIBUTING.md
[Dev Container extension]: https://containers.dev/supporting#dev-containers
[Development Containers]: https://containers.dev/supporting
[Docker]: https://docs.docker.com
[GitHub Codespaces]: https://docs.github.com/en/codespaces
[Homebrew]: https://brew.sh
[Mastodon docs]: https://docs.joinmastodon.org/dev/setup/#working-with-emails-in-development
