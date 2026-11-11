---
brand_id: med-theme-vic-medical
kind: brand
summary: 维克医学：近黑底、信号青单一强调、紫色次级区分的深色科技调；维克学院/「当AI撞向医学」讲座专用
primary_color: "#2BB8F0"
---

# 维克医学 — Brand Specification

> Identity-only preset. No SVG page roster — pages are composed freely under these constraints.

## I. Brand Overview

| Property | Value |
|---|---|
| Brand Name | 维克医学（维克学院 / 「当AI撞向医学」） |
| Use Cases | 维克学院 AI 医学讲座、面向临床医生与科研人员的培训课、公众号/视频号配套课件 |
| Tone | 冷静、技术感、证据优先；像在看一台调好的仪器，而不是发布会 |
| Sources | 用户提供的维克医学视觉规范；2026-11-06《AI 在周围神经病研究中的应用》50 页讲座实际取值并经用户认可 |

## II. Color Scheme

| Role | HEX | Provenance | Purpose |
|---|---|---|---|
| primary | `#2BB8F0` | user | 信号青：唯一主强调色；标题竖条、kicker、关键数字、当前项 |
| secondary | `#A371F7` | user | 紫：次级区分（第二组、第二类工具），不与青争主次 |
| positive | `#3FB950` | user | 支持、通过、✓ |
| warning | `#D29922` | user | 注意、探索性、⚠ |
| alert | `#F85149` | user | 不支持、漏诊、✗ |
| bg | `#0D1117` | user | 页面底色（近黑） |
| surface | `#161B22` | user | 卡片底色 |
| surface-deep | `#10151D` | user | 嵌套模块、代码/文件摘录底色 |
| border | `#2A313B` | user | 卡片 1 px 描边、分隔线 |
| grid | `#121C27` | user | 背景 64 px 细网格线 |
| text | `#E6EDF3` | user | 正文、标题 |
| text-secondary | `#AEB3BA` | user | 次要文字、图注 |
| muted | `#7A8088` | user | 出处、页码、对照组 |

- 每页只用一种主强调（信号青）；紫色只做第二组区分，不同时大面积出现。
- 不用大面积发光、霓虹渐变或玻璃拟态；渐变只允许做压在图片上的黑色遮罩（scrim），保证叠字可读。
- 状态色同时配符号（✓ ✗ ⚠ ? ↑ ↓），色弱与灰度打印仍可区分。
- 白底的文献原图、截图放进 `#161B22` 或白色圆角卡框里嵌入，不反色、不调色。

## III. Typography

| Role | Family | Weight |
|---|---|---|
| title | `"Microsoft YaHei", Arial, "PingFang SC", sans-serif` | bold |
| body | `"Microsoft YaHei", Arial, "PingFang SC", sans-serif` | regular |
| code / data / kicker | `Consolas, "Space Mono", monospace` | regular / bold |

- 品牌原字体是 Noto Sans SC + Space Mono；导出 PPTX 时改用 Windows 与 macOS Office 都自带的微软雅黑 + Consolas，避免讲台电脑缺字体。用户确认讲台电脑装了 Noto Sans SC / Space Mono 时才换回。
- 投影字号：正文 24，标题 40，副标题 30，引导语 28，注释 18，出处/页脚/kicker 16；**页面上任何文字不小于 16**。
- 大号数字（96）、章节编号（56）、封面标题（64）、分节页幽灵编号（240，`#161B22` 一类低对比色）需在 spec_lock 的 typography 中登记为独立角色。

## IV. Logo

- File: `../images/vic-mark.svg`
- Usage: 封面左上角品牌组合与致谢页。封面组合 = Logo（约 60 px 高）+ 右侧两行字「维克医学」（32，粗体，#E6EDF3）/「VIC MEDICAL」（16，等宽，#AEB3BA，letter-spacing 6），封面其他位置不重复 Logo；致谢页 Logo 居中约 120 px 高。内容页不放 Logo。
- 这是讲者本人的个人品牌标识，不代表任何医院、学校或企业；不与机构 Logo 并排暗示合作关系。

## V. Voice & Tone

- Formality: professional-conversational（讲座口吻，结论先行）
- Person: 我们 / 你（中文）
- Emoji: avoid（状态用 ✓ ✗ ⚠ 等符号，不用表情）
- Abbreviations: spell-out-first-use（医学与 AI 缩写首次出现写全称或一句白话解释）
- 页面左上角 kicker 用等宽字体写 `// 部分 · 小节 · 出处`，作为导航；标题是一句结论，不是名词。
- 对外内容不写讲者的雇主或药企身份；门诊、查房等一线临床场景不写成"我亲历"。

## VI. Icon Style

- Preference: linear
- `tabler-outline`，stroke-width 2，单色（青、灰或状态色），全篇一个家族；图标只在说明角色、状态或关系时出现。
