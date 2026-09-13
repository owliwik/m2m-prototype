# 决策记录

只追加，不修改。最新的在最下面。2026-09-13 之前的日期是大致的——这些条目是从旧 CLAUDE.md 和记忆笔记里整理出来的。

## [早期] — 从纯前端原型转为 Supabase 后端的 MVP
**决定：** 用 Supabase（Postgres + PostgREST + Auth）做后端；Next.js 应用仍是唯一前端。
**原因：** 需要真实的登录和数据持久化，才能让真正的学生和大使把完整的提问流程跑一遍。
**否掉的方案：** [如果找回 `project_stack_migration.md`，从里面补]

## [早期] — 所有页面都是 client component
**决定：** 每个页面都 `'use client'`，在 `useEffect` 里从 Supabase 拉数据；不拆 server/client。
**原因：** 登录态在客户端读；拆开只增加复杂度，当前阶段没有收益。
**何时重新考虑：** 需要 SEO 或首屏性能时，或者引入 server-side Supabase client 时。

## [早期] — 用 6 位邮箱 OTP，不用 magic link
**决定：** 注册时在应用内输入 6 位验证码，Supabase 模板用 `{{ .Token }}`。
**原因：** 和学校的 263 邮箱配合得更好，也避免点链接的各种问题。

## [早期] — `users.id` 是 `text`，不是 `uuid`
**决定：** 保留 `users.id` 为 `text`；所有 RLS 策略里写 `auth.uid()::text`。
**原因：** 原型阶段数据模型遗留下来的。改类型要动所有外键。
**代价：** 每条新策略都得记得加 cast。以后重建 schema 时再迁。

## [早期] — 不要长期维护的数据库逻辑
**决定：** 一次性 SQL（schema、RLS、枚举）可以；避免 trigger、cron job 这类要持续维护的 DB 逻辑。
**原因：** 团队小，没人想去调 Postgres 内部的问题。

## 2026-09-13 — 改用分支 + PR 流程
**决定：** 所有改动走分支和 PR，由人 review 后合并。原来"直接改 main"的规则作废。
**原因：** 多人协作即将开始；直接改 main 没有 review、没有 preview 部署，也没法保证 CLAUDE.md 不过期。
**附带：** `.claude/worktrees/` 已 gitignore；Claude Code 的本地记忆笔记不再是有效的事实来源——所有共享内容都在 `docs/`。

## 2026-09-13 — 每次数据库改动都是一个提交进仓库的 SQL 文件
**决定：** schema / RLS / 枚举的改动先写到 `docs/sql/`，再到 Supabase Dashboard 执行，最后重新生成类型。
**原因：** 只在 Dashboard 里改的东西，第二个协作者既复现不了也 review 不了。
