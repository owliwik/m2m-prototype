@AGENTS.md

# M2M Prototype — 开发文档

> 本文件是 Claude Code 和其他编码代理的项目说明，也是团队的事实来源之一。
> 凡是改动了命令、目录结构、环境变量、数据库 schema 或部署方式的 PR，必须在同一个 PR 里更新本文件。
> 最后核对：2026-09-13（已对照代码和 `package.json`）。标有 ⚠ 的条目只能在 Vercel / Supabase Dashboard 里确认，见 `docs/STATUS.md`。

## 开始任何工作前先读

- `docs/STATUS.md` — 当前进度、进行中的事、下一步
- `docs/WORKFLOW.md` — 团队协作流程（分支 / PR / 文档更新规则）
- `docs/DECISIONS.md` — 已定的技术决策，不要重新讨论
- `docs/DESIGN.md` — 设计规范（配色、圆角、字体、交互状态）

**不要引用任何 "memory note"。** 早期开发时 Claude Code 的本地记忆文件（`setup_rls.md`、`userstory_progress.md` 等）不在仓库里，其他协作者看不到。相关内容已经或正在迁入 `docs/`。如果发现某个知识只存在于记忆里，把它写进 `docs/` 再用。

---

## 项目背景

M2M（Mentor to Mentee）是北京四中在校生专属的升学知识与校友对接平台，连接正在申请海外大学的高中生与已就读的四中校友（大使）。内容不对外公开，仅限学校邮箱用户访问。

最初是纯前端原型；目前是有真实认证 + 数据库的早期 MVP。ask → approve → answer → publish 主链路已经打通（见下文「提问链路」），还缺学生侧的「我的提问」页等外围功能。

---

## 技术栈

- Next.js 16（App Router, Turbopack）、React 19、TypeScript
- Tailwind CSS v4（极简，搭配 inline styles）
- Supabase（`@supabase/supabase-js`）
  - Postgres + PostgREST 作为后端数据源
  - Supabase Auth（email/password 注册 + 6 位数字 OTP 邮箱验证）
  - 浏览器端 anon-key client：`app/lib/supabase.ts` 导出 `supabase`，受 RLS 约束
  - 服务端 service-role client：`app/lib/serverSupabase.ts` 导出 `admin`（绕过 RLS），以及 `getAuthedUser(req)` / `requireAdmin(req)`——从 `Authorization: Bearer <JWT>` 头校验用户。只在 `app/api/**` route handler 里用。
  - 类型：`app/lib/database.types.ts`（由 `supabase gen types` 生成；手动补过 `requests.visibility` 和 `request_visibility` 枚举——重新生成前确认这些列已在数据库里，否则会被覆盖掉）
  - `@supabase/ssr` 在 `package.json` 里但**代码里没有任何地方在用**（没有 cookie-based server client）。
- 邮件
  - **Supabase Auth 邮件**（注册 OTP）：Supabase 内置发送，SMTP 在 Supabase Dashboard 配成 263 企业邮箱（`m2m@bhsfic.com`）。
  - **业务通知邮件**：`nodemailer`，封装在 `app/lib/email.ts` 的 `sendEmail()`，直连 263 SMTP，读下面的 `SMTP_*` 环境变量。发送是 best-effort：失败只 `console.error`，不影响接口返回。插值用户内容时必须用同文件的 `escapeHtml()`。
  - 旧文档写的 Resend 已经不在依赖里，不要再用。

---

## 常用命令

```
npm install
npm run dev      # http://localhost:3000
npm run lint     # eslint
npm run build    # PR 前必须通过
```

目前没有测试套件。PR 合并前的最低要求：`lint` 和 `build` 都通过，并在本地手动过一遍改动涉及的页面。

---

## 环境变量

| 变量 | 用途 | 暴露给浏览器 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | 是 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key，受 RLS 约束 | 是 |
| `SUPABASE_SERVICE_ROLE_KEY` | 仅 route handler 用（`app/lib/serverSupabase.ts`），绕过 RLS | **绝对不能** |
| `NEXT_PUBLIC_APP_URL` | 通知邮件里链接的站点根地址；未设置时回退到 `http://localhost:3000` | 是 |
| `SMTP_HOST` / `SMTP_PORT` | 263 SMTP 服务器；端口默认 465（隐式 TLS） | 否 |
| `SMTP_USER` / `SMTP_PASS` | SMTP 账号；三项（HOST/USER/PASS）缺任何一项，`sendEmail()` 直接返回失败，不发信 | 否 |
| `EMAIL_FROM` / `EMAIL_FROM_NAME` | 发件地址（默认 = `SMTP_USER`，263 要求一致）/ 发件人名（默认 `M2M`） | 否 |

本地写在 `.env.local`（已 gitignore）。生产/预览环境的值在 Vercel 项目设置里。值找维护者要，不要写进任何会提交的文件，也不要粘到聊天里。

---

## 部署

- 平台：Vercel，项目 `m2m-prototype`；生产域名 `m2m.bhsfic.net`（Vercel 默认域名 `m2m-prototype.vercel.app`）。仓库里没有 `vercel.json`，全部用 Vercel 默认配置。
- ⚠ 待在 Vercel 确认并写明：`main` 是否自动部署到生产；PR 分支是否生成 preview deployment；preview 环境是否配齐上面的环境变量、是否共用生产 Supabase 项目（如果是，测试数据会进生产库，测试邮件也会真的发出去）。

---

## 关键架构

### 页面层级

- 所有页面都是 client component（`'use client'`），用 `useEffect` 从 Supabase 拉数据。即便不需要交互也不拆 server/client，因为登录态需要在客户端读。原因见 `docs/DECISIONS.md`。
- 老的假数据还留在 `app/data/index.ts`，只有 landing page（`app/page.tsx`）还在 import 它（`ambassadors`、`schoolColors`）。其它页面已迁到 Supabase。

### 数据读写的分工

- **读**：页面直接用浏览器端 `supabase` client 查，靠 RLS 控制可见范围。
- **写（提问链路）**：页面 `fetch('/api/...')` 并带上 `Authorization: Bearer <access_token>`，route handler 用 service-role client 写库。
- 因为 service role 绕过 RLS，**route handler 里必须自己做鉴权和校验**：`getAuthedUser` / `requireAdmin`、确认当前用户就是被分配的大使、状态机检查（`status` 不对返回 409）。新增写接口时照这个模式来。

### 认证与角色

- `/login` 和 `/signup` 在 `app/(auth)/` route group 下，共享分屏布局（左蓝色品牌区、右表单）。Nav 在这两条路径上不渲染。
- 注册 3 步：name+email → password → 6 位 OTP。
  - Step 2：`supabase.auth.signUp({ email, password, options: { data: { name } } })` 触发 OTP 邮件
  - Step 3：`supabase.auth.verifyOtp({ email, token, type: 'signup' })`
  - 验证成功后 `POST /api/auth/sync-profile`（携带 JWT）补 `public.users` 行
- `/api/auth/sync-profile` 用 service role key，**幂等**（已存在则 no-op）。替代了旧的 `/api/auth/register`。
- 受保护页面用 `useRequireAuth()`（`app/lib/auth.ts`）做 client-side gate；未登录会 `router.replace('/login?redirect=<current path+query>')`。
- 角色在 `public.users.role`（枚举 `user_role`：`student | ambassador | admin`）。`/admin` 要求 `admin`，`/my/inbox*` 要求 `ambassador`，不符合则 `router.replace('/')`；Nav 按角色显示「审核」「收件箱」入口。页面端的角色检查只是 UX，真正的权限在 route handler（`requireAdmin`）和 RLS。

### 提问链路

1. 学生在 `/ask` 提交 → `POST /api/requests`：校验（问题 ≥ 30 字、必须选学校和至少一位大使），写 `requests`（`status = pending`）+ 每位大使一行 `request_ambassadors`（`status = sent`），给所有 admin 发邮件。
2. 管理员在 `/admin` 看 pending 列表 → `POST /api/requests/[id]/approve` 或 `/reject`（仅 `pending` 可操作）。通过后给被分配的大使发邮件，链接到 `/my/inbox/[id]`；驳回目前**不**通知学生。
3. 大使在 `/my/inbox/[id]` 回答 → `POST /api/requests/[id]/answer`：确认是被分配的大使、回答 ≥ 20 字；用 `update ... where status = 'approved'` 原子地把请求置为 `done`（多位大使抢答时只有一个成功，其余 409），然后插入 `posts`（`kind = 'qa'`，继承 `visibility` 和 `is_anonymous`），把该大使的分配行置为 `responded`，给学生发邮件链接到 `/feed/[postId]`。
4. 发布：`/feed` 列表只查 `visibility = 'public'` 的 post；私下问答的可见范围靠 RLS。

### Supabase Dashboard 手动配置（不在代码里）

- Authentication → Providers → Email → "Confirm email" 必须 **ON**
- Authentication → Sign In / Up → Email OTP Length = **6**
- Authentication → Email Templates → "Confirm signup" 用 `{{ .Token }}`（不是 `{{ .ConfirmationURL }}`），中文模板
- Project Settings → Auth → Rate Limits → "Rate limit for sending emails" 调到 30/hour（默认 2 太严）

### RLS

- 所有 7 张表都开了 RLS。helper `public.is_admin()` 是 SECURITY DEFINER 函数。
- **关键 gotcha**：`users.id` 是 `text` 不是 `uuid`，而 `auth.uid()` 是 uuid。所有策略里的比较都要写成 `auth.uid()::text`。
- RLS SQL 还没有导出进仓库，目标位置是 `docs/sql/rls.sql`（可重跑，用 `DROP POLICY IF EXISTS`）。导出方法见 `docs/sql/README.md`。

### Schema 要点

- 7 张表：`users`、`ambassadors`、`schools`、`posts`、`comments`、`requests`、`request_ambassadors`
- `ambassadors.id` ≡ `users.id`（1:1 FK，共享主键）
- `posts.author_id` → `users.id`（**不是** `ambassadors.id`）
- `users ↔ posts` 有两条 FK（`author_id` 和 `questioner_id`），select 必须显式写 disambiguator：`user:users!ambassadors_id_fkey(*)`、`posts!posts_author_id_fkey(...)`、`student:users!requests_student_id_fkey(...)` 等
- `requests.visibility` 和 `posts.visibility`：枚举 `request_visibility`（`'public' | 'private'`），表达"答完是否公开"
- `request_status` 枚举：`pending | approved | rejected | done`
- `assignment_status`（在 `request_ambassadors`）：`sent | responded | declined`（`declined` 目前没有任何代码写入）
- `user_role` 枚举：`student | ambassador | admin`
- 完整 schema 还没有导出进仓库，目标位置是 `docs/sql/schema.sql`，导出方法见 `docs/sql/README.md`。

### 数据库变更规则（团队协作后必须遵守）

1. 任何 schema / RLS / enum 变更先写成 SQL 文件提交到 `docs/sql/`（或后续改用 `supabase/migrations/`），再粘到 Dashboard 执行。**禁止只在 Dashboard 里改。**
2. 执行后重新生成类型（Supabase CLI 不需要全局安装，用 `npx`；第一次要先 `npx supabase login`）：
   ```
   npx supabase gen types typescript --project-id <project-ref> --schema public > app/lib/database.types.ts
   ```
   `<project-ref>` 是 Supabase 项目 URL `https://<project-ref>.supabase.co` 里的那一段。
3. 偏好一次性 SQL；避免需要长期维护的 DB 逻辑（trigger、cron job 等）。见 `docs/DECISIONS.md`。

---

## 当前路由

已对照 `app/` 目录核对（2026-09-13）。

| Path | 说明 | Auth |
|---|---|---|
| `/` | Landing（仍用 `app/data` 假数据） | 公开 |
| `/login` | 登录 | 公开 |
| `/signup` | 3-step 注册 + OTP | 公开 |
| `/feed` | 内容列表（只显示 public post） | 必须登录 |
| `/feed/[id]` | 文章 / Note / Q&A 详情 | 必须登录 |
| `/ambassadors` | 大使目录 | 必须登录 |
| `/schools/[school]` | 学校页 | 必须登录 |
| `/ask` | 提问表单（调 `POST /api/requests`） | 必须登录 |
| `/admin` | 审核面板：pending 请求，通过 / 驳回 | `admin` |
| `/my/inbox` | 大使收件箱：待回答 / 已完成 | `ambassador` |
| `/my/inbox/[id]` | 大使查看并回答某个请求 | `ambassador`（且被分配） |
| `POST /api/auth/sync-profile` | 同步 profile 行（service role，幂等） | JWT |
| `POST /api/requests` | 创建请求 + 分配 + 通知 admin | JWT |
| `POST /api/requests/[id]/approve` | 通过 + 通知大使 | JWT + `admin` |
| `POST /api/requests/[id]/reject` | 驳回（不发邮件） | JWT + `admin` |
| `POST /api/requests/[id]/answer` | 回答 → 生成 Q&A post + 通知学生 | JWT + 被分配的大使 |

**尚未实现**：学生侧「我的提问 / 通知」页（旧文档里的 `/me`，目前没有这个路由）、大使拒答（`declined`）、驳回时通知学生。进度见 `docs/STATUS.md`。

---

## 设计规范

完整规范见 `docs/DESIGN.md`，通过下面这行引入，不要在本文件里重复。

@docs/DESIGN.md

---

## 工作方式

- 中文优先，所有 user-facing 文本是中文。
- 先做好桌面端；移动端响应式暂不是优先级。
- 代码质量不是第一优先级，但 **auth、RLS、必要的输入校验不能省**。
- **Git：从 `main` 开分支，开 PR，人工 review 后合并。**（旧规则"不开分支、直接改 main"自 2026-09-13 起废除，原因见 `docs/DECISIONS.md`。）分支名随意，`名字-做什么` 即可，不强制前缀。
- 协作者里有非技术背景的人，也不一定用 AI 工具或本地环境。lint、build、文档更新、数据库改动都是维护者在合并前负责的事，不要在 PR review 里要求协作者做这些。
- 不要在 `.claude/worktrees/` 里工作后把 worktree 目录提交进仓库；该目录已 gitignore。
- 不确定页面或页面间状态时，先看 `docs/` 和代码，不要猜；仍不确定就问。
- 每次工作结束前更新 `docs/STATUS.md`，哪怕只有一行（Claude Code 里可以用 `/wrap-up`）。
