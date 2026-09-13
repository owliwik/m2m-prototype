# 项目状态

更新：2026-09-13，[维护者]

## 现在在哪
- 早期 MVP 已部署在 Vercel（m2m.bhsfic.net）：真实的 Supabase 认证（邮箱 + 6 位 OTP），7 张表全部开了 RLS，feed / 大使目录 / 学校页都从 Supabase 读数据。
- ask → approve → answer → publish 主链路已经打通：学生提问（`/ask`）→ 管理员审核（`/admin`）→ 大使回答（`/my/inbox`）→ 生成 Q&A post；每一步都有 nodemailer 邮件通知（admin / 大使 / 学生）。细节见 `CLAUDE.md`「提问链路」。
- Landing page 还在用 `app/data/index.ts` 里的假数据。
- 团队从一个人扩展到多人。2026-09-13 起引入协作流程、文档和数据库改动规则（见 `WORKFLOW.md`）；在此之前是单人开发、直接改 main。

## 进行中
- 文档迁移（PR `docs: team workflow and doc migration`）：新版 `CLAUDE.md`、`docs/` 下的协作文档、`docs/DESIGN.md`；README 换成中文介绍；`.claude/worktrees` 移出仓库；新增 `/wrap-up` 命令。`CLAUDE.md` 里代码层面的 ⚠ 已全部对照代码核实。负责人：[维护者]。
- 把原来 Claude Code 记忆笔记（`setup_rls.md`、`setup_supabase_auth.md`、`userstory_progress.md`、`project_stack_migration.md`）里还没进仓库的内容整理进 `docs/`。
- `docs/DECISIONS.md` 目前只有从新旧 `CLAUDE.md` 里摘出的几条，维护者手里如果有完整版，直接替换。

## 需要在 Dashboard 里确认的事（代码里查不到）
- [ ] **Vercel**：`main` 是否自动部署到生产？PR 分支有没有 preview deployment（`WORKFLOW.md` 第 7 步依赖它）？
- [ ] **Vercel**：Production 和 Preview 环境是否都配了 `CLAUDE.md` 环境变量表里的全部变量？特别是 `NEXT_PUBLIC_APP_URL`（没配的话通知邮件里的链接会指向 `localhost:3000`）和 `SMTP_*`（没配的话通知邮件静默不发，只在日志里报错）。
- [ ] **Vercel / Supabase**：Preview 是否共用生产 Supabase 项目？如果是，预览里的测试提问会写进生产库并真的给 admin / 大使发邮件。
- [ ] **Supabase**：导出 schema 和 RLS 到 `docs/sql/schema.sql`、`docs/sql/rls.sql`（本机没装 Supabase CLI，未能自动导出；步骤见 `docs/sql/README.md`）。
- [ ] **Supabase**：确认 `posts` 的 RLS 让 `visibility = 'private'` 的问答只对提问学生、回答大使和 admin 可见——`/feed` 列表在代码里过滤了，但 `/feed/[id]` 和学校页完全靠 RLS。
- [ ] **Supabase**：记下 project ref，填进 `CLAUDE.md` 的 `gen types` 命令说明（或告知维护者本人知道即可）。

## 接下来
- 学生侧「我的提问 / 通知」页（旧文档里叫 `/me`，目前不存在）
- 驳回请求时通知学生（`/api/requests/[id]/reject` 现在不发邮件）
- 大使拒答：`assignment_status = 'declined'` 已在枚举里，但没有写入路径
- Landing page 改为从 Supabase 读数据，之后删除 `app/data/index.ts`
- `@supabase/ssr` 没有被任何代码使用：决定删掉依赖，还是改用它做 cookie-based 认证（记进 `DECISIONS.md`）
- GitHub：给 `main` 开分支保护，开启合并后自动删除分支（见 `WORKFLOW.md` 第六部分）

## 已知问题
- 产品是校内使用的，但仓库目前是公开的——加协作者之前先决定要不要转私有。
- 没有测试；自动检查只有 `lint` + `build`。
- 通知邮件是 best-effort：发送失败不会重试，也不会提示用户，只能在 Vercel 日志里看到。
