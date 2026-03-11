# M5 现代化 UI 发布验收报告

## 验收基线

- 验收日期：2026-03-11
- 验收对象：M5 现代化 UI 集成分支（公共页、认证页、登录后工作区与发布验收脚本）
- 判定原则：只以当前仓库内已落地的脚本、测试、Storybook 基线和本次本地验证结果为准
- 总结论：**可进入人工审查（Review Ready），发布前性能验收仍有显式风险项**

本次 MAS-82 的目标不是直接优化所有性能指标，而是把现代化 UI 批次需要的质量门、验收命令、视觉/响应式证据与发布验收报告补齐到仓库中。当前分支已经具备：可重复运行的组件/交互测试、Storybook 视觉与可访问性门禁、桌面/移动端 walkthrough、以及可生成结构化结果的发布性能基线脚本。唯一仍然为 `FAIL` 的自动门禁来自发布性能基线中的两项运行时观察值，需要在真正放行发布前继续追踪，但不会阻止该批次作为独立审查对象推进。

## 验收明细

| 验收项                                  | 结论 | 证据                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 说明                                                                                                                                                                                                           |
| --------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 组件级与关键交互回归                    | 通过 | `app/javascript/mastodon/features/compose/critical_paths.test.tsx`、`app/javascript/mastodon/features/explore/index.test.tsx`、`app/javascript/mastodon/features/navigation_panel/index.test.tsx`；`mise exec ruby@3.4.8 node@24.14 yarn@4.12.0 -- yarn test:js run app/javascript/mastodon/features/compose/critical_paths.test.tsx app/javascript/mastodon/features/explore/index.test.tsx app/javascript/mastodon/features/navigation_panel/index.test.tsx` | 明确锁定了现代化 UI 中最容易回退的 compose、探索页和工作区导航行为                                                                                                                                             |
| JS 总质量门                             | 通过 | `package.json`、`.github/workflows/test-js.yml`；`CI=1 mise exec ruby@3.4.8 node@24.14 yarn@4.12.0 -- yarn test`                                                                                                                                                                                                                                                                                                                                               | `yarn test` 现在会串行执行 lint、typecheck、legacy Vitest 与 Storybook Vitest，确保 CI 不再漏掉 Storybook 回归                                                                                                 |
| Storybook 视觉 / 可访问性 / 响应式基线  | 通过 | `.storybook/preview.tsx`、`.storybook/modes.ts`、`app/javascript/mastodon/components/workspace_page/workspace_page.stories.tsx`；`CI=1 mise exec ruby@3.4.8 node@24.14 yarn@4.12.0 -- yarn test:storybook`                                                                                                                                                                                                                                                     | Storybook a11y 已从 `todo` 升级为 `error`；`WorkspacePage` stories 提供桌面 `1280x960` 与移动端 `390x844` 两套模式，作为现代化 shell 的视觉与响应式基线                                                        |
| 公共页 / 认证页 / 个人主页基础验收      | 通过 | `spec/system/public_pages_spec.rb`、`spec/system/about_spec.rb`、`spec/system/log_in_spec.rb`、`spec/system/profile_spec.rb`；`mise exec ruby@3.4.8 node@24.14 yarn@4.12.0 -- bundle exec rspec spec/system/public_pages_spec.rb spec/system/about_spec.rb spec/system/log_in_spec.rb spec/system/profile_spec.rb`                                                                                                                                             | 覆盖 `/`、`/about`、`/examples`、`/help`、`/auth/sign_in` 与 profile 基础路径                                                                                                                                  |
| 登录后工作区 walkthrough（桌面 / 移动） | 通过 | `spec/system/smoke/m5_ui_release_walkthrough_spec.rb`、`bin/test-m5-ui-release-walkthrough`；`mise exec ruby@3.4.8 node@24.14 yarn@4.12.0 -- ruby bin/test-m5-ui-release-walkthrough`                                                                                                                                                                                                                                                                          | 一条命令验证桌面与移动端下的 `/home`、`/publish`、`/explore`、`/favourites`、`/bookmarks`、`/lists`、`/conversations`、profile 与 status detail，并把截图写入 `tmp/m5_ui_release_walkthrough/`                 |
| 核心运行时 smoke                        | 通过 | `spec/system/smoke/core_flows_spec.rb`、`bin/test-system-smoke`；`CI=1 mise exec ruby@3.4.8 node@24.14 -- bundle exec ruby bin/test-system-smoke`                                                                                                                                                                                                                                                                                                              | 证明注册、登录、首页发帖、状态详情回复、通知提及等链路可在现代化 UI 集成分支稳定跑通                                                                                                                           |
| 发布性能基线                            | 风险 | `docs/RELEASE_PERFORMANCE_BASELINE.md`、`spec/performance/release_performance_baseline_spec.rb`、`bin/collect_release_performance_baseline`；`mise exec ruby@3.4.8 node@24.14 -- ruby bin/collect_release_performance_baseline`                                                                                                                                                                                                                                | 脚本现已能真实执行 `5 examples` 并产出 `tmp/release_performance_baseline/results.json` / `summary.md`；本次总状态为 `FAIL`，因为 `web_cpu_percent=81.5%` 超阈值、`streaming_clients_steady_state=false` 未回稳 |

## Walkthrough 覆盖矩阵

| 路径 / 场景                                             | 自动化证据                                                                                                                                                        | 结果 |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `/`、`/about`、`/examples`、`/help`                     | `spec/system/public_pages_spec.rb`、`spec/system/about_spec.rb`、`spec/system/smoke/m5_ui_release_walkthrough_spec.rb`                                            | 通过 |
| `/auth/sign_in`                                         | `spec/system/log_in_spec.rb`、`spec/system/smoke/m5_ui_release_walkthrough_spec.rb`                                                                               | 通过 |
| `/home`、`/publish`                                     | `spec/system/smoke/core_flows_spec.rb`、`spec/system/smoke/m5_ui_release_walkthrough_spec.rb`                                                                     | 通过 |
| `/explore`                                              | `app/javascript/mastodon/features/explore/index.test.tsx`、`spec/system/smoke/m5_ui_release_walkthrough_spec.rb`                                                  | 通过 |
| `/favourites`、`/bookmarks`、`/lists`、`/conversations` | `spec/system/smoke/m5_ui_release_walkthrough_spec.rb`、`app/javascript/mastodon/features/navigation_panel/index.test.tsx`                                         | 通过 |
| profile / status detail                                 | `spec/system/profile_spec.rb`、`spec/system/smoke/core_flows_spec.rb`、`spec/system/smoke/m5_ui_release_walkthrough_spec.rb`                                      | 通过 |
| compose-related entry points                            | `app/javascript/mastodon/features/compose/critical_paths.test.tsx`、`spec/system/smoke/core_flows_spec.rb`、`spec/system/smoke/m5_ui_release_walkthrough_spec.rb` | 通过 |

## 本次执行的验证

- `mise trust && mise install` → `all tools are installed`
- `git fetch origin main` → `origin/main` 仍为 `eb848d0`，集成分支继续在其之上工作
- `mise exec ruby@3.4.8 node@24.14 yarn@4.12.0 -- yarn test:js run app/javascript/mastodon/features/compose/critical_paths.test.tsx app/javascript/mastodon/features/explore/index.test.tsx app/javascript/mastodon/features/navigation_panel/index.test.tsx` → 通过
- `CI=1 mise exec ruby@3.4.8 node@24.14 yarn@4.12.0 -- yarn test:storybook` → 通过
- `CI=1 mise exec ruby@3.4.8 node@24.14 yarn@4.12.0 -- yarn test` → 通过
- `mise exec ruby@3.4.8 node@24.14 yarn@4.12.0 -- bundle exec rspec spec/system/public_pages_spec.rb spec/system/about_spec.rb spec/system/log_in_spec.rb spec/system/profile_spec.rb` → `11 examples, 0 failures`
- `CI=1 mise exec ruby@3.4.8 node@24.14 -- bundle exec ruby bin/test-system-smoke` → `3 examples, 0 failures`
- `mise exec ruby@3.4.8 node@24.14 yarn@4.12.0 -- ruby bin/test-m5-ui-release-walkthrough` → `2 examples, 0 failures`
- `mise exec ruby@3.4.8 node@24.14 -- ruby bin/collect_release_performance_baseline` → `5 examples, 0 failures`，并生成 `tmp/release_performance_baseline/results.json` / `summary.md`，总体状态 `FAIL`

## 发布风险与结论

1. `tmp/release_performance_baseline/results.json` 记录到首页样本的 `web_cpu_percent=81.5%`，高于文档阈值 `70%`。
2. 同一份基线报告记录到通知流的 `streaming_clients_steady_state=false`，说明 websocket clients/channels 在采样结束后没有回到初始稳态。
3. 以上两项已经被仓库内脚本稳定地暴露和归档，因此属于“可见、可复现、可继续跟踪”的发布风险，而不是“缺失验收能力”的风险。

结论上，MAS-82 已经把 M5 现代化 UI 所需的质量门和发布验收证据补齐到可审查状态：reviewer 可以直接运行仓库命令复验公共页、认证页、工作区、Storybook、Smoke 和性能基线。若要给出严格的“可直接放行发布”结论，则还需要继续处理性能基线中的两项失败指标。
