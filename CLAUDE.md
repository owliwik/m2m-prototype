@AGENTS.md
# M2M Prototype — 开发文档

## 项目背景

M2M（Mentor to Mentee）是北京四中在校生专属的升学知识与校友对接平台。连接正在申请海外大学的高中生与已就读的四中校友（大使）。内容不对外公开，仅限学校邮箱用户访问。

这是一个纯前端原型，使用假数据（hardcode），不需要真实数据库或登录系统。目的是给学校老师和学生展示产品形态，收集反馈。

---

## 技术栈

- Next.js 14（App Router）
- Tailwind CSS
- TypeScript
- 假数据直接写在组件或单独的 `data/` 目录里

不需要任何后端、数据库、或认证系统。

---

## 设计要求

### 风格方向
**editorial + refined minimal，带有学院感底蕴**

这是北京四中（创立于1907年）旗下的平台。学校有深厚的历史积淀，校徽是复古盾形风格。设计应当体现这种有质感、认真的气质——像一个真正用心做的独立产品，而不是一个学生项目或科技创业公司。

### 配色系统

**严禁使用Anthropic/Claude的UI配色变量（--color-background-primary等）。** 使用以下自定义配色系统：

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

不要全方形（太尖锐），也不要全圆（显假和AI感）：
- 卡片：`border-radius: 10px`
- 按钮：`border-radius: 8px`
- 标签/pill：`border-radius: 6px`
- 输入框：`border-radius: 8px`
- 头像：`border-radius: 50%`
- 学校logo占位：`border-radius: 10px`

**严禁：** `border-radius: 0` 或 `border-radius: 9999px`

### 字体

- **标题/Wordmark：** Noto Serif SC（衬线，学院感）
- **正文：** Noto Sans SC
- **严禁：** 系统默认sans-serif、Arial、Inter用于中文

### 边框与层级

- 所有卡片：`1px solid var(--m2m-border)`
- hover时：`1px solid var(--m2m-border-strong)`
- 无box-shadow，用边框代替层级感

### 交互状态

每个可点击元素必须有精心设计的hover state：
- 卡片hover：边框颜色加深 + 背景轻微变冷灰
- 按钮hover：背景色加深10%
- 文字链接hover：颜色变为 `--m2m-navy`
- 大使卡footer "联系 →" hover：整行背景变为`--m2m-bg-muted`，文字颜色变深

---

## 页面结构

共四个页面：

1. `/` — Landing page
2. `/feed` — Feed页
3. `/ambassadors` — 大使目录页
4. `/ask` — 提问/申请页

---

## 页面一：Landing Page（`/`）

### 导航栏
- 左：M2M（Noto Serif SC，wordmark感）
- 右：「浏览内容」文字按钮 + 「用学校邮箱登录」（`--m2m-navy`底色）

### Hero
- Eyebrow：北京四中 · 在校生专属
- 大标题：申请季，你需要一个真正了解你的人
- 副标题：M2M 连接正在申请的四中同学与已在海外就读的四中校友。不是中介，不是Reddit，是真正经历过同一段路的人告诉你他们最想让你知道的事。
- 两个按钮：「用学校邮箱注册」（navy主色）、「先看看内容」（描边）
- 小字：仅限 @bhsfic.com 学生邮箱 · 免费使用
- 统计数字（三格横排，有细边框分隔）：24位在校大使 / 12所覆盖院校 / 38篇原创内容

### 为什么是M2M（三栏）
- 有针对性的信息
- 没有商业利益
- 仅限四中学生

### 校友怎么说（2×2引用卡片）

### 怎么开始（三步）

### 底部CTA

---

## 页面二：Feed页（`/feed`）

### 顶部Hero（紧凑）
- 左：M2M + 「北京四中校友的第一手升学经验」
- 右：「浏览大使」次要 + 「联系大使」主要

### 筛选栏（sticky）
学校标签 + 分隔线 + 内容类型

### 内容卡片
- 学校标签 + 内容类型标签 + 置顶标签（可选）
- 标题
- 摘要（2行截断）
- 作者头像 + 姓名 + 届别 + 时间 + 浏览数

### 文章全文页排版要求（重要）
高级博客感，参考 Substack/Medium：
- 正文最大宽度680px，居中，左右充足留白
- 标题用Noto Serif SC，正文用Noto Sans SC，形成对比
- 行高1.85，段落间距1.5em
- 作者区域有设计感（头像+姓名+学校，有分隔线）
- 顶部有学校标签和内容类型标签
- 排版干净，大量留白，不要堆砌元素

---

## 页面三：大使目录页（`/ambassadors`）

### 筛选栏

### 大使网格（两列）

卡片结构：
1. **头部**（可点击）：52px圆形头像 + 姓名（16px 500）+ 学校tag + 专业届别 + 一句话简介
2. **内容预览**（2条，可独立点击）：类型标签 + 标题（1行截断）
3. **Footer**（`--m2m-bg-subtle`底色，hover变`--m2m-bg-muted`）：左「X篇内容」+ 右「联系 →」

### 学校配色（偏冷，无暖黄）
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
| 文章 | #E8F0FC | #1F4388 |
| 问答 | #E1F0EB | #0A4A35 |
| Tips | #FAF0E0 | #6B3A08 |
| 清单 | #EEEDFB | #3C3489 |
| 推荐 | #FAE8E8 | #7A2020 |

---

## 页面四：提问页（`/ask`）

### 第一步：你想了解什么？

院校和大使**平级**，两张全宽卡片竖向叠放，视觉权重相近，用细微设计区分：

**院校卡片（`--m2m-bg-subtle`底色）：**
- 小标签：目标院校（uppercase，11px）
- 横向排列：学校logo占位（52px圆角方形，用学校主色填充首字母）+ 右侧
  - 中文校名（17px，500）
  - 英文校名（12px，`--m2m-text-tertiary`）
  - 简介（12px，如"宾夕法尼亚州匹兹堡 · 私立研究型大学"）
- Footer：右侧「换一所院校」下划线链接

**大使卡片（白底）：**
- 小标签：大使（uppercase，11px）
- 横向排列：44px圆形头像 + 右侧
  - 姓名（15px，500）
  - 学校tag + 专业届别
  - 一句话简介（12px）
- Footer：右侧「换一位大使」下划线链接

区分方式：院校卡灰底+方形logo，大使卡白底+圆形头像。不要用颜色或加粗边框过度区分。

### 第二步：你想问什么？

- 问题描述（必填）：textarea，50字下限，实时计数，到50字变navy色
- 偏好沟通方式：文字回复 / 视频通话 / 电话
- 预计时长：15分钟 / 30分钟 / 不确定

### 第三步：验证身份

- 邮箱输入 + 发送验证码
- 提交按钮默认disabled，验证后激活（变navy填充色）
- 提交成功原地替换，显示对勾+说明文字
- 不说"已发送给大使"

---

## 假数据

### 大使列表

```typescript
const ambassadors = [
  { name: "张明远", school: "CMU", dept: "计算机科学", year: "2024届", bio: "专注CS申请文书和CMU校园生活", posts: 6 },
  { name: "李晓彤", school: "Duke", dept: "经济", year: "2023届", bio: "聊Duke校园生活和文理学院选课逻辑", posts: 5 },
  { name: "陈思远", school: "Penn", dept: "Wharton 商科", year: "2023届", bio: "商科选校和申请策略，同时拿过Wharton和Stern", posts: 4 },
  { name: "王子轩", school: "Cornell", dept: "机械工程", year: "2024届", bio: "理工申请和Cornell工程课程压力", posts: 3 },
  { name: "赵雨欣", school: "NYU", dept: "电影制作", year: "2023届", bio: "艺术类申请和作品集准备", posts: 2 },
  { name: "刘雨桐", school: "Columbia", dept: "社会学", year: "2024届", bio: "哥大城市生活和文社科申请思路", posts: 2 },
]
```

### 内容列表（Feed用）

```typescript
const posts = [
  { title: "从四中到CMU SCS：我的文书到底写了什么", school: "CMU", type: "申请文书", author: "张明远", views: 1200, days: 3, pinned: true },
  { title: "Duke第一年：我最后悔没提前知道的五件事", school: "Duke", type: "校园生活", author: "李晓彤", views: 876, days: 7 },
  { title: "Wharton vs. 其他商科：从四中学生的角度怎么选", school: "Penn", type: "选校建议", author: "陈思远", views: 654, days: 14 },
  { title: "Cornell工程的课程压力：真实的一个学期是什么样的", school: "Cornell", type: "学术", author: "王子轩", views: 431, days: 21 },
]
```

---

## 注意事项

- 所有内容中文优先
- 不需要实现真实的筛选逻辑，点击标签有视觉反馈即可
- 不需要真实的表单提交，模拟流程即可
- 移动端响应式暂时不是优先级，先做好桌面端
- 代码质量不是优先级，原型清晰可用即可