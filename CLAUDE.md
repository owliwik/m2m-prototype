@AGENTS.md
# M2M Prototype — 开发文档

## 项目背景

M2M（Mentor to Mentee）是北京四中在校生专属的升学知识与校友对接平台。连接正在申请海外大学的高中生与已就读的四中校友（大使）。内容不对外公开，仅限学校邮箱用户访问。

最初是给学校老师和学生展示产品形态、收集反馈的纯前端原型。目前已经过渡到一个有真实认证 + 数据库的早期 MVP 阶段，仍在补完整个 ask→approve→answer→publish 链路。

---

## 技术栈

- Next.js 16（App Router, Turbopack）
- Tailwind CSS（极简，搭配 inline styles）
- TypeScript
- Supabase：
  - Postgres + PostgREST 作为后端数据源
  - Supabase Auth（email/password 注册 + 6 位数字 OTP 邮箱验证）
  - 客户端 anon-key client：`app/lib/supabase.ts` 导出 `supabase`
  - 类型：`app/lib/database.types.ts`（由 `supabase gen types` 生成；手动维护过几列，比如 `requests.visibility` 和 `request_visibility` 枚举）
  - 环境变量：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`
- Resend SDK 已经在 `package.json`，但**目前没有任何代码在用** —— 留给后续邮件通知（admin/ambassador/student）
- SMTP：通过 Supabase 内置走 263 企业邮箱（`m2m@bhsfic.com`），已经在 Supabase Dashboard 配置好

---

## 关键架构

### 页面层级
- 所有页面都是 client component（`'use client'`），用 `useEffect` 从 Supabase 拉数据。即便不需要交互也不拆 server/client，因为登录态需要在客户端读。
- 老的假数据还留在 `app/data/index.ts`，但只有 landing page (`/`) 和部分类型/常量还在用它。其它页面已全部迁到 Supabase。

### 认证
- `/login` 和 `/signup` 在 `app/(auth)/` route group 下，共享一个分屏布局（左蓝色品牌区、右表单）。Nav 在这两条路径上不渲染。
- 注册流程是 3 步：name+email → password → 6 位 OTP。
  - Step 2 调 `supabase.auth.signUp({ email, password, options: { data: { name } } })` 触发 OTP 邮件
  - Step 3 调 `supabase.auth.verifyOtp({ email, token, type: 'signup' })` 验证
  - 验证成功后调 `POST /api/auth/sync-profile`（携带 JWT）把 `public.users` 行补上
- `/api/auth/sync-profile` 用 service role key，**幂等**（已存在就 no-op）。replaces 旧的 `/api/auth/register`。
- 受保护页面用 `useRequireAuth()` hook（`app/lib/auth.ts`）做 client-side gate；未登录会被 `router.replace('/login?redirect=<current path+query>')` 弹出。

### Supabase 配置（在 Dashboard 里手动设置，不在代码里）
- Authentication → Providers → Email → "Confirm email" 必须 **ON**
- Authentication → Sign In / Up → Email OTP Length = **6**
- Authentication → Email Templates → "Confirm signup" 用 `{{ .Token }}`（不是 `{{ .ConfirmationURL }}`），中文模板
- Project Settings → Auth → Rate Limits → "Rate limit for sending emails" 已经调大到 30/hour（默认 2 太严）

### RLS
- 所有 7 张表都开了 RLS。helper `public.is_admin()` 是 SECURITY DEFINER 函数。
- **关键 gotcha**：`users.id` 是 `text` 不是 `uuid`，而 `auth.uid()` 是 uuid。所有策略里的 `auth.uid()` 比较都要写成 `auth.uid()::text`。policies 里凡是 `auth.uid() = some_user_id_column` 都需要这个 cast。
- 完整 RLS SQL 见 memory note `setup_rls.md`。可重跑（用了 `DROP POLICY IF EXISTS`）。

### Schema 要点
- `ambassadors.id` ≡ `users.id`（1:1 FK，共享主键）
- `posts.author_id` → `users.id`（**不是** `ambassadors.id`）
- `users ↔ posts` 有两条 FK（`author_id` 和 `questioner_id`），所以 select 必须显式写 disambiguator：`user:users!ambassadors_id_fkey(*)` / `posts!posts_author_id_fkey(...)` 等
- `requests` 表有 `visibility` 列（`'public' | 'private'`），表达"答完是否公开"
- `request_status` 枚举：`pending | approved | rejected | done`
- `assignment_status`（在 `request_ambassadors`）：`sent | responded | declined`

---

## 当前路由

| Path | 说明 | Auth |
|---|---|---|
| `/` | Landing | 公开 |
| `/login` | 登录 | 公开 |
| `/signup` | 3-step 注册 + OTP | 公开 |
| `/feed` | 内容列表 | 必须登录 |
| `/feed/[id]` | 文章 / Note / Q&A 详情 | 必须登录 |
| `/ambassadors` | 大使目录 | 必须登录 |
| `/schools/[school]` | 学校页 | 必须登录 |
| `/ask` | 提问表单（写 `requests` + `request_ambassadors`） | 必须登录 |
| `/api/auth/sync-profile` | 同步 profile 行（service role） | JWT |

**尚未实现**：`/admin`（审核面板）、ambassador 答题页、`/me` 我的请求/通知页、所有邮件通知。详见 memory note `userstory_progress.md`。

---

## 设计要求

### 风格方向
**editorial + refined minimal，带有学院感底蕴**

这是北京四中（创立于1907年）旗下的平台。学校有深厚的历史积淀，校徽是复古盾形风格。设计应当体现这种有质感、认真的气质——像一个真正用心做的独立产品，而不是一个学生项目或科技创业公司。

### 配色系统

**严禁使用 Anthropic/Claude 的 UI 配色变量（--color-background-primary 等）。** 使用以下自定义配色系统：

```css
:root {
  /* 主色：来自学校官方色系 */
  --m2m-navy: #1F4388;        /* 深蓝，主要强调色 */
  --m2m-crimson: #A83131;     /* 深红，次要强调色 */
  --m2m-black: #000000;

  /* 背景层级（全部偏冷，严禁暖黄/米色） */
  --m2m-bg: #FFFFFF;
  --m2m-bg-subtle: #F7F8FA;   /* 极浅冷灰 */
  --m2m-bg-muted: #EEF0F4;    /* 浅冷灰 */

  /* 文字层级 */
  --m2m-text-primary: #0D0D0D;
  --m2m-text-secondary: #4A4F5A;
  --m2m-text-tertiary: #8A8F9A;
  --m2m-text-muted: #B0B5C0;

  /* 边框 */
  --m2m-border: #E2E5EA;
  --m2m-border-strong: #C8CDD6;
}
```

**色调要求：整体偏冷，绝对不要暖黄/米色。** 背景用纯白和冷灰系。

### 圆角规范

不要全方形（太尖锐），也不要全圆（显假和 AI 感）：
- 卡片：`border-radius: 10px`
- 按钮：`border-radius: 8px`
- 标签/pill：`border-radius: 6px`
- 输入框：`border-radius: 8px`
- 头像：`border-radius: 50%`
- 学校 logo 占位：`border-radius: 10px`

**严禁：** `border-radius: 0` 或 `border-radius: 9999px`

### 字体

- **标题/Wordmark：** Noto Serif SC（衬线，学院感）
- **正文：** Noto Sans SC
- **严禁：** 系统默认 sans-serif、Arial、Inter 用于中文

### 边框与层级

- 所有卡片：`1px solid var(--m2m-border)`
- hover 时：`1px solid var(--m2m-border-strong)`
- 无 box-shadow，用边框代替层级感

### 交互状态

每个可点击元素必须有精心设计的 hover state：
- 卡片 hover：边框颜色加深 + 背景轻微变冷灰
- 按钮 hover：背景色加深 10%
- 文字链接 hover：颜色变为 `--m2m-navy`
- 大使卡 footer "联系 →" hover：整行背景变为 `--m2m-bg-muted`，文字颜色变深

### 学校配色（偏冷，无暖黄）

学校配色既存在前端常量里，也存在 `schools.color_bg/color_fg` DB 列里。DB 是权威，但页面有 fallback。

| 学校 | 背景 | 文字 |
|---|---|---|
| CMU | #E8F0FC | #1F4388 |
| Duke | #E1F0EB | #0A4A35 |
| Penn | #EEEDFB | #3C3489 |
| Cornell | #FAF0E0 | #6B3A08 |
| NYU | #FAE8E8 | #7A2020 |
| Columbia | #EBF3E0 | #2A5010 |

### 内容类型标签配色

| 类型 | 背景 | 文字 |
|---|---|---|
| 文章 | #FAE8E8 | #A83131 |
| 问答 | #F5E0E0 | #8C2020 |
| Tips | #FAEEED | #993025 |
| 清单 | #F7E6E6 | #7A2828 |
| 推荐 | #F5E8E8 | #9C3030 |

---

## 注意事项

- 中文优先，所有 user-facing 文本是中文。
- 移动端响应式暂时不是优先级，先做好桌面端。
- 代码质量不是优先级，但 **auth、RLS、必要的输入校验不能省**。
- 不使用 git workflow：不开分支、不开 PR、直接改 main。详见 memory note `feedback_no_git_workflow.md`。
- 不喜欢维护 SQL trigger/function。可以接受一次性 SQL（schema 变更、RLS、enum）粘到 Supabase Dashboard，但避免会持续维护的 DB 逻辑（trigger、cron job 等）。
- 如果在 worktree 而不是 main 上启动（路径含 `.claude/worktrees/`），先提醒用户 —— 他们更愿意直接改 main。
- 任何时候不确定页面/页面间状态时，**优先看 memory notes 而不是猜测**：
  - `project_stack_migration.md` — Supabase 迁移背景
  - `feedback_client_component_architecture.md` — 为什么页面都是 client component
  - `feedback_no_git_workflow.md` — 不开 PR
  - `setup_supabase_auth.md` — auth/OTP 配置全貌
  - `setup_rls.md` — RLS policies + text/uuid cast 注意事项
  - `userstory_progress.md` — 用户故事 10 步走到哪一步了
