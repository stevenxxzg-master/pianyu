# Release Performance Baseline

This document defines the minimum pre-release performance and capacity baseline
for a small-community Mastodon deployment.

Use it as a release gate before promoting a build. It is a stability floor, not
an exhaustive load test.

## Scope

The release gate covers the flows called out in `MAS-40`:

- Homepage load
- Post publish
- Notifications
- Timeline scrolling
- Background job latency

## Baseline assumptions

- Topology matches the default single-node service split in `docker-compose.yml`:
  `web`, `streaming`, `sidekiq`, `postgres`, and `redis`
- The release candidate already passes the existing smoke coverage in
  `.github/workflows/test-ruby.yml`
- Health and metrics are available where possible:
  - `GET /health`
  - `GET /api/v1/streaming/health`
  - `GET /metrics` on the streaming service
  - Prometheus exporter / Sidekiq dashboard / container metrics on the Rails side
- The validation workload is a smoke-level small-community check:
  - Visit the signed-out homepage
  - Visit the signed-in homepage
  - Publish one new post
  - Trigger at least one notification-producing action
  - Load at least three home timeline pages / gaps
  - Wait for background jobs created by the smoke run to drain
- No one-off maintenance work is running during the check, such as large imports,
  backfills, or federation catch-up

If the environment differs materially from these assumptions, keep the same flow
coverage and tighten or relax thresholds in a follow-up ticket instead of doing
it ad hoc during release.

## Measurement rules

- Prefer p95 over at least 10 repetitions for HTTP timings when the environment
  allows repeated checks
- If only a single release candidate window is available, treat the maximum
  observed value during the smoke run as the gate value
- Record both the user-visible timing and the matching server-side signal when
  available
- Treat the fallback evidence column as acceptable only when the primary runtime
  signal is unavailable for the current environment

## Release gate

| Flow               | Measurement method                                                                                                           | Acceptable response-time baseline                                                                                                                               | Resource / capacity guardrail                                                                                                                      | Primary evidence                                                            | Fallback evidence                                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage load      | Signed-out and signed-in visits to `/`; capture browser timing or reverse-proxy/app timing and confirm the app shell renders | `GET /` p95 `<= 800 ms`; first visible app shell or redirect completion `<= 2.5 s`; no `5xx` responses                                                          | Web CPU stays `< 70%`; web RSS stays `< 1.2 GiB`; health endpoint stays green                                                                      | Browser network timing, app logs, `/health`, `docker stats` or host metrics | Green `spec/system/home_spec.rb` plus healthy `web` container                                                                                                                                               |
| Post publish       | Publish from the compose form or `POST /api/v1/statuses`, then confirm the post appears on the author's home timeline        | Status create request p95 `<= 1.0 s`; authored post becomes visible `<= 3 s`; follow-up async work drains `<= 30 s`                                             | Web CPU stays `< 70%`; Sidekiq queue latency stays `<= 30 s`; Redis reports no evictions during the run                                            | Browser network timing, Sidekiq dashboard/exporter, Redis metrics/logs      | Green `spec/system/new_statuses_spec.rb`, `spec/services/post_status_service_spec.rb`, and `spec/services/fan_out_on_write_service_spec.rb`                                                                 |
| Notifications      | Trigger a follow / favourite / reply and watch `user:notification` or `/api/v2/notifications`                                | Notifications API p95 `<= 1.0 s`; streaming or web notification arrives `<= 5 s`; notification merge/unfilter work drains `<= 60 s`                             | Streaming RSS stays `< 512 MiB`; `pg_pool_waiting_queries` remains `0`; connected-client/channel gauges return to steady state after the smoke run | Streaming `/metrics`, request timing, streaming logs                        | Green `spec/system/streaming/channel_subscriptions_spec.rb`, `spec/requests/api/v2/notifications_spec.rb`, `spec/services/notify_service_spec.rb`, and `spec/workers/unfilter_notifications_worker_spec.rb` |
| Timeline scrolling | Load the home timeline, then paginate or load gaps at least three times                                                      | Each timeline pagination request p95 `<= 1.0 s`; appended items render `<= 2.0 s`; no `429`, timeout, or `5xx` responses across three consecutive loads         | Postgres waiting clients stay at `0`; web RSS stays `< 1.2 GiB`; Redis/pubsub error count does not increase                                        | Browser network timing, app logs, DB pool metrics                           | Green `spec/requests/api/v1/timelines/home_spec.rb` and the runtime behavior of `app/javascript/mastodon/components/scrollable_list/index.jsx`                                                              |
| Background jobs    | After publish + notification smoke, watch Sidekiq queues until idle                                                          | Default, push, and mailer queue latency each stay `<= 30 s`; scheduled jobs run within `60 s` of due time; retry / dead counts do not grow during the smoke run | Sidekiq RSS stays `< 1.0 GiB`; Redis memory stays `< 70%` of the configured limit; Postgres pool wait count stays at `0`                           | Sidekiq dashboard/exporter, Redis metrics, `docker stats` or host metrics   | Green `spec/workers/feed_insert_worker_spec.rb`, `spec/workers/push_update_worker_spec.rb`, and `spec/services/fan_out_on_write_service_spec.rb`                                                            |

## Evidence map

Use the following repository-native checks to anchor release validation when
runtime instrumentation is limited:

- Homepage: `spec/system/home_spec.rb`
- Post publish: `spec/system/new_statuses_spec.rb`
- Notifications / streaming delivery:
  `spec/system/streaming/channel_subscriptions_spec.rb`
- Home timeline API behavior: `spec/requests/api/v1/timelines/home_spec.rb`
- Notifications API behavior: `spec/requests/api/v2/notifications_spec.rb`
- Post creation + fan-out services:
  `spec/services/post_status_service_spec.rb`,
  `spec/services/fan_out_on_write_service_spec.rb`,
  `spec/services/notify_service_spec.rb`
- Background workers:
  `spec/workers/feed_insert_worker_spec.rb`,
  `spec/workers/push_update_worker_spec.rb`,
  `spec/workers/unfilter_notifications_worker_spec.rb`
- Rails-side queue metrics wiring:
  `config/initializers/sidekiq.rb`,
  `config/initializers/prometheus_exporter.rb`
- Streaming-side metrics wiring:
  `streaming/index.js`, `streaming/metrics.js`

## Suggested pre-release commands

Run these commands when a compatible Ruby and Node toolchain is available:

```shell
bin/rspec spec/system/home_spec.rb spec/system/new_statuses_spec.rb spec/system/streaming/channel_subscriptions_spec.rb

bin/rspec spec/requests/api/v1/timelines/home_spec.rb spec/requests/api/v2/notifications_spec.rb spec/services/post_status_service_spec.rb spec/services/fan_out_on_write_service_spec.rb spec/services/notify_service_spec.rb spec/workers/feed_insert_worker_spec.rb spec/workers/push_update_worker_spec.rb spec/workers/unfilter_notifications_worker_spec.rb
```

If the full local Ruby toolchain is not available, use the latest green
`test-ruby.yml` run for the current branch as fallback evidence and pair it with
runtime smoke measurements from the release candidate environment.
