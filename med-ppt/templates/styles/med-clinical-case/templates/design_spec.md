---
style_id: med-clinical-case
kind: style
summary: 临床个案报告方法：分享型按时间线还原诊疗经过并提炼学习要点；讨论型先呈现信息、展开鉴别诊断，揭晓后复盘思路。
keywords: [medical, case-report, difficult-case, differential-diagnosis, mdt]
---

# Medical Clinical Case — Style Specification

> Method and design defaults only. No project communication contract, brand identity, page structure, or SVG prototypes.

## I. Style Overview

| Property | Value |
|---|---|
| Style Name | 临床个案报告（分享型 / 讨论型） |
| Best Fit | 分享型：科室病例汇报、教学查房、住培/规培病例分享、学术会议病例报告、准备投稿的个案报道。讨论型：科室或全院疑难病例讨论、MDT 多学科会诊、临床病理讨论（CPC）、临床思维训练 |
| Reusable Intent | 分享型让听众跟随真实诊疗经过理解"这个病例为什么值得报告"，并带走一到三条可用于临床的要点；讨论型让参与者拿到与当时相同的信息后独立推理，揭晓后复盘关键转折 |
| Sources | med-ppt 自建 Style，2026-10-25；由个例报告与疑难病例讨论两个 Style 合并；参考 CARE 病例报告指南要素、临床病理讨论与 MDT 会诊的通行组织方式整理，非单一外部文档 |

## II. Communication Method

- **Preferred Mode**: custom
- **Mode References**: narrative, instructional, pyramid
- **Mode Behavior**: 子类由项目的汇报设定决定，全篇只用一种。**分享型**：narrative 按时间顺序讲述诊疗经过，instructional 在每个决策点说明依据并在结尾提炼要点；叙事服务于教学，不制造悬念式反转来掩盖信息。**讨论型**：narrative 负责"信息逐步呈现"，揭晓前听众只看到当时已知的信息；pyramid 负责鉴别诊断推理，每个候选诊断都列出支持点与不支持点并回指具体证据；讨论段与揭晓段在结构上分开，讨论段不得泄露最终诊断。
- **Argument Flow**: 分享型——一句话病例摘要与报告价值开场；按"主诉 → 现病史 → 既往史 → 体格检查"交代初始信息；以时间轴呈现病程、关键检查与治疗调整；给出最终诊断与依据；交代治疗结局与随访；文献复习比较本例与既往报道；提炼学习要点。讨论型——说明本次讨论要解决的具体问题；交代病史、体征与已完成的检查；归纳病例特点（关键阳性、重要阴性、未解释的矛盾）；展开鉴别诊断；提出讨论问题；揭晓最终诊断与确诊依据；复盘关键线索、误区与转折；以要点收束。只需讨论版本时，讨论问题后接下一步诊疗计划。
- **Page Message Discipline**: 每页对应一个时间段、一类检查、一个决策点或一个候选诊断。分享型与讨论型揭晓段的页标题写这一页揭示的发现（如"入院第 3 天血培养回报：金黄色葡萄球菌"）；讨论段的页标题写"这一页呈现了什么信息"，不写结论。关键影像或病理图与它支持的判断同页。
- **Claim Discipline**: 严格区分客观发现、当时的临床判断与事后回顾性分析；"未查"与"阴性"不混用；检验值带单位与参考范围并标明检测时间；疗效只写观察到的变化，不夸大单例结论的外推性。病例信息只能来自用户提供的病历资料，缺失项标注"资料未提供"，资料前后矛盾时两种写法都保留并交用户确认。"首例""罕见"等定性需有已核实的文献支持。文献只引用用户提供或已核实 PMID/DOI 的文献，没有时保留"待补充文献"占位。

## III. Page Role Vocabulary

| Role | Communication Job | Evidence Obligation | Composition Tendency |
|---|---|---|---|
| 病例摘要 | 分享型：一句话说明是谁、什么问题、为什么值得报告 | 年龄、性别、核心表现与报告价值 | 摘要句主导，信息极简 |
| 讨论目的 | 讨论型：说明今天要解决的问题 | 具体到一个诊断或治疗难点 | 问题句占主导 |
| 主诉与现病史 | 交代就诊原因与起病经过 | 时间、症状演变、院外诊治 | 小时间轴或分段要点 |
| 既往史与体格检查 | 提供鉴别所需的背景与体征 | 相关既往史、阳性与重要阴性体征 | 双栏，阳性体征突出 |
| 病程时间轴 | 让听众掌握全程节奏 | 关键时间点、检查、治疗、病情变化 | 横向时间轴，节点对齐；后续页复用并高亮当前段 |
| 关键检查 | 呈现推动诊断的证据 | 检验值带单位、参考范围、时间；影像与病理原图 | 原图主导，判读要点紧邻 |
| 动态变化 | 展示指标或影像随治疗的变化 | 同一指标的多次结果与时间 | 原生折线图或并列影像 |
| 病例特点 | 讨论型：把散乱信息归纳为推理起点 | 关键阳性、重要阴性、未解释的矛盾 | 编号列表，矛盾点单独标出 |
| 鉴别诊断 | 讨论型：系统评价各候选诊断 | 每个诊断的支持点、不支持点、待完善检查 | 对照表：行为诊断，列为支持/不支持/待查 |
| 讨论问题 | 讨论型：把焦点交给听众 | 基于病例特点中的矛盾或缺口 | 1–3 个问题，留白充足 |
| 诊断与依据 | 给出最终诊断并说明依据（讨论型称"诊断揭晓"） | 诊断标准逐条对应本例证据，或确诊依据 | 标准与证据左右对照；诊断名称突出 |
| 思路复盘 | 讨论型：回看关键线索与误区 | 指出转折点与可更早的步骤 | 回顾式时间轴，标出转折点 |
| 治疗与转归 | 交代治疗方案与结局 | 药物、剂量、疗程、疗效、不良反应、随访时间 | 时间轴或对照表 |
| 文献复习 | 定位本例在既往报道中的位置 | 引用文献的作者、期刊、年份、病例数 | 对比表：本例 vs 既往报道 |
| 学习要点 | 提炼可迁移的经验或教训 | 每条要点都能回指本例的具体经过 | 1–3 条，留白充足 |

## IV. Evidence & Data Expression

- **Argument Trace**: 每个诊断判断都能指向具体的检查结果或体征；每个治疗调整都能指向病情变化；讨论型每个候选诊断的支持与反对证据都指向具体条目，最终诊断的确诊依据单独列出。
- **Charts**: 实验室指标的动态变化用原生折线图，横轴为时间（入院第 N 天或日期），标注治疗事件；正常参考范围用浅色带标出。
- **Tables**: 检验结果用原生表格，含数值、单位、参考范围与检测时间，异常值配符号（↑ ↓）以便灰度识别。鉴别诊断表的支持/不支持/待查配符号（✓ ✗ ?）。文献复习对比表用原生表格。
- **Sources**: 文献每条引用给出作者、期刊、年份；诊断标准注明出处（指南名称与年份）。
- **Native Editability**: 时间轴、检验表、鉴别诊断表、对比表均为原生对象，便于会前补充或讨论中修改。

## V. Visual System Defaults

- **Preferred Visual Style**: custom
- **Visual Style References**: swiss-minimal, editorial, blueprint
- **Visual Style Behavior**: 温和、清晰的临床风格。swiss-minimal 负责网格与留白；editorial 负责让关键影像或病理图成为页面焦点；讨论型的鉴别诊断表与推理链借用 blueprint 的精确线条与对齐。主色负责框架，强调色只用于时间轴当前节点与关键决策点，警示色只用于危急值与最终诊断。讨论型的讨论段与揭晓段用两种章节色区分，全篇一致。
- **Composition**: 病程类页面以横向时间轴为骨架，全篇时间轴的位置与样式一致，让听众始终知道"现在讲到哪一天"；检查页以原图为中心，判读要点贴近原图；鉴别诊断页以对照表为中心，诊断按可能性排序；揭晓页诊断名称占主导。
- **Density**: 病史页精简为要点；检查页一页一类检查，补充结果放补充页；讨论问题页与揭晓页留白充足。
- **Decoration**: 细线、节点圆点、编号与状态符号为主；不使用卡通化人物、煽情配图或悬疑式装饰。
- **Color Behavior**: 异常升高/降低/正常、支持/不支持/待查各用固定颜色并配符号；时间轴节点颜色只编码事件类型。选用视觉主题时，状态色取主题的 positive / alert / accent，含义不变。
- **Typography Character**: 检验项目名称、单位格式统一；药物用通用名；疾病名称用规范中文名，首次出现附英文。

### Fallback Color Scheme

| Role | HEX | Purpose |
|---|---|---|
| Field | #FFFFFF | 页面底色 |
| Warm Surface | #F7F5F2 | 病史与要点模块底纹 |
| Navy | #1B3A5F | 标题与框架 |
| Clinical Blue | #3A78B5 | 时间轴主线、次级标题；讨论型讨论段章节色 |
| Reveal Teal | #0F6E6E | 讨论型揭晓段章节色 |
| Ink | #222B35 | 正文 |
| Muted | #6F7A86 | 时间、注释、出处 |
| Decision Orange | #D9822B | 当前节点、关键决策点、待查 |
| Support Green | #2E7D5B | 支持该诊断、恢复正常 |
| Critical Red | #C0392B | 危急值、不支持、最终诊断 |

### Fallback Typography

| Role | Primary | Fallback Tail | Character |
|---|---|---|---|
| Titles and body | Microsoft YaHei | PingFang SC, Arial | 中文无衬线；标题加粗 |
| Numerals and data | Arial | Helvetica | 等高数字，用于检验值与日期 |

## VI. Image & Icon Direction

- **Preferred Image Rendering**: custom
- **Image Rendering References**: flat, vector-illustration
- **Image Rendering Behavior**: 扁平矢量医学示意图，用于解剖定位、病理机制或疾病示意。flat 负责干净色块，vector-illustration 负责准确的解剖轮廓。背景白色或透明，不含任何文字、数字或伪文字。
- **Image Usage**: 患者影像、病理切片、心电图、检验报告截图是证据，只能原图嵌入，不得 AI 重画。AI 生成图片只用于封面、章节页与解剖/机制示意；讨论型讨论段的示意图不得暗示最终诊断。
- **Image Treatment**: 证据图保持原始宽高比，标注检查名称与时间；需要指示病灶时用原生箭头或圆圈叠加，不修改原图像素。患者信息的去标识化由汇报人自行决定。
- **Icon Treatment**: 少量使用，只用于标记时间轴上的事件类型（检查、用药、手术、转科）与状态符号，全篇一套家族。

## VII. Review Focus
<!-- visual-review-trigger: explicit-user-only -->
> Apply this section only after the user explicitly activates visual review. It never triggers that stage.

- 时间轴上的时间顺序与病历一致，没有错位。
- 检验值都带单位、参考范围与检测时间；"未查"与"阴性"没有混淆。
- 影像与病理为原图，病灶标注为叠加的原生对象。
- 客观发现、当时判断与回顾性分析在措辞上可区分。
- 讨论型：讨论段（含标题、讲稿、配图）没有泄露最终诊断；每个候选诊断同时列出支持与不支持点；两段章节色可区分。
- 学习要点都能回指本例的具体经过；文献引用信息完整，无编造。
