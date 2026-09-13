# 技术决策

已定的决策记在这里，按时间追加，不改旧条目；推翻旧决策时新写一条并注明「取代 #N」。没有新理由就不要重新讨论。

格式：

```
## N. 标题
- 日期：YYYY-MM-DD
- 决定：……
- 原因：……
```

> 本文件在文档迁移时建立，下面几条是从新旧 `CLAUDE.md` 里已有的约定摘出来的，日期未知的标为「早期」。

---

## 1. 所有页面都是 client component
- 日期：早期
- 决定：页面一律 `'use client'`，在 `useEffect` 里从 Supabase 拉数据；即便不需要交互也不拆 server / client component。
- 原因：登录态（Supabase session）在浏览器端读取，页面需要在客户端拿到当前用户后再查数据；统一成一种写法，维护成本最低。

## 2. 避免需要长期维护的数据库逻辑
- 日期：早期
- 决定：schema 变更、RLS、enum 这类一次性 SQL 可以；trigger、cron job 等需要持续维护的 DB 逻辑尽量不用，业务逻辑放在 route handler 里。
- 原因：DB 里的逻辑不在代码里、难以发现和调试，维护者不愿意长期维护。

## 3. 改用分支 + PR 协作（取代早期「直接改 main」）
- 日期：2026-09-13
- 决定：不再直接改 `main`。所有改动从 `main` 开分支、开 PR，维护者 review 后合并。流程见 `docs/WORKFLOW.md`。
- 原因：团队从一个人扩展到多人，其中有非技术背景、不用 AI 工具的协作者；直接改 main 会互相覆盖，也没有地方检查改动。

## 4. 数据库变更必须先以 SQL 文件进仓库
- 日期：2026-09-13
- 决定：schema / RLS / enum 变更先写成 SQL 提交到 `docs/sql/`，再到 Supabase Dashboard 执行；禁止只在 Dashboard 里改。只由维护者执行。
- 原因：多人协作后，只存在于 Dashboard 或个人记忆里的数据库状态别人看不到，也无法 review 或复现。
