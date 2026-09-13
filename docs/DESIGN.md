# 设计规范

> 原样迁自旧版 `CLAUDE.md`（commit e7836bd）的「设计要求」一节。`CLAUDE.md` 通过 `@docs/DESIGN.md` 引入本文件。

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
