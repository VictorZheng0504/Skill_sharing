---
brand_id: med-theme-forest-green
kind: brand
summary: 森林绿临床人文：森林绿与暖白、衬线标题，温和的人文临床风格
primary_color: "#2F5F4A"
---

# 森林绿临床人文 — Brand Specification

> Identity-only preset. No SVG page roster — pages are composed freely under these constraints.

## I. Brand Overview

| Property | Value |
|---|---|
| Brand Name | 森林绿临床人文（med-ppt 视觉主题） |
| Use Cases | 病例分享、护理与康复、患者教育、人文与教学类汇报 |
| Tone | 温和、自然、人文关怀 |
| Sources | 配色参考 yixueAIganhuo-PPT（snowmanzhuang，非商业许可）017 号风格的色系，按原生 PPT 的对比度要求重新取值，非原值照搬；2026-10-25 |

## II. Color Scheme

| Role | HEX | Provenance | Purpose |
|---|---|---|---|
| primary | `#2F5F4A` | approx | 标题、框架 |
| primary-deep | `#18382D` | approx | 章节编号、深色强调块 |
| secondary | `#3E7C63` | approx | 试验组、时间轴主线 |
| accent | `#E2B93B` | approx | 细线、当前节点底色；不作字色 |
| alert | `#8B2E2E` | approx | 危急值、关键结论、不支持 |
| positive | `#3E7C63` | approx | 支持、恢复正常 |
| bg | `#FFFFFF` | approx | 页面底色 |
| surface | `#F7F4EA` | approx | 暖白模块底纹 |
| surface-alt | `#D8E4DC` | approx | 鼠尾草绿标签底 |
| text | `#1E2A24` | approx | 正文 |
| muted | `#6E7A72` | approx | 注释、出处、对照组 |

- 大面积留白；绿色只用于标题、框架与少量色块，不做整页底色。
- 封面与章节页可配水彩边缘背景图（见 med-ppt 的 themes.md），内容页不加纹理。
- 这是视觉主题，不是机构标识；颜色只编码角色（框架、分组、状态），不作装饰。
- 状态色同时配符号（↑ ↓ ✓ ✗ ?），灰度打印下仍可区分。

## III. Typography

| Role | Family | Weight |
|---|---|---|
| title | `SimSun, Georgia` | bold |
| body | `Microsoft YaHei, Arial` | regular |
| data | `Arial` | regular |

> 标题用宋体以取得书卷/人文气质；SimSun 为 Windows 自带，macOS 上 PowerPoint 会回退到系统宋体。需要更好的衬线效果时，可在 Stage 2 换成本机已安装的思源宋体（Source Han Serif SC）。

## IV. Logo

- File: none
- 主题不带任何机构 Logo；用户提供医院或学校 Logo 时，按用户要求放置。

## V. Voice & Tone

- Formality: professional-academic
- Person: 我们 / 本研究 / 本例（中文）
- Emoji: avoid
- Abbreviations: spell-out-first-use（医学缩写首次出现写全称）

## VI. Icon Style

- Preference: linear
- 单色线性医学图标，一套家族贯穿全篇。
