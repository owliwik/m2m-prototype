# docs/sql

数据库 schema 和 RLS 的 SQL 放在这里。规则见根目录 `CLAUDE.md` 的「数据库变更规则」。

## 还缺什么

**schema 和 RLS 还没有导出进仓库**，目前只存在于 Supabase 项目本身。整理本目录时本机没装 Supabase CLI，所以没法自动导出。需要维护者补上：

- `schema.sql`：当前 `public` schema（7 张表 `users`、`ambassadors`、`schools`、`posts`、`comments`、`requests`、`request_ambassadors`，以及枚举 `request_status`、`assignment_status`、`request_visibility`、`user_role`）
- `rls.sql`：所有 RLS 策略和 `public.is_admin()` helper，要能重复执行（`DROP POLICY IF EXISTS ...`）

## 怎么导出

**方式一：Supabase CLI（推荐）**

```
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db dump --schema public > docs/sql/schema.sql
```

`db dump` 默认会带上 RLS 策略和函数。如果想把 RLS 单独放进 `rls.sql`，从 dump 里把 `CREATE POLICY`、`ALTER TABLE ... ENABLE ROW LEVEL SECURITY` 和 `is_admin()` 拆出来。

**方式二：Supabase Dashboard**

- Schema：Database → Tables，或在 SQL Editor 里查 `information_schema`；Dashboard 没有一键导出 DDL，建议还是用 CLI。
- RLS：Authentication → Policies，逐表复制；或在 SQL Editor 运行 `select * from pg_policies where schemaname = 'public';`，按结果整理成 `CREATE POLICY` 语句。

导出后删掉本文件「还缺什么」一节，并去掉 `docs/STATUS.md` 里对应的待办。
