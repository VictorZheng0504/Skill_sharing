---
style_id: med-journal-club
kind: style
summary: 医学文献精读与组会汇报方法：从临床问题出发，经研究设计与结果，落到证据质量与对本科室实践的启示。
keywords: [medical, journal-club, literature-review, evidence-based-medicine, lab-meeting]
---

# Medical Journal Club — Style Specification

> Method and design defaults only. No project communication contract, brand identity, page structure, or SVG prototypes.

## I. Style Overview

| Property | Value |
|---|---|
| Style Name | 医学文献汇报（组会 / Journal Club） |
| Best Fit | 课题组组会文献汇报、科室 Journal Club、研究生文献精读、SCI 论文解读、指南或共识解读 |
| Reusable Intent | 让懂行的听众在有限时间内判断：这篇文献回答了什么临床问题、证据有多可靠、结论能否用于我们的患者 |
| Sources | med-ppt 自建 Style，2026-10-25；依据循证医学文献评价通行做法（PICO、CONSORT/STROBE 报告规范、GRADE 证据分级思路）整理，非单一外部文档 |

## II. Communication Method

- **Preferred Mode**: custom
- **Mode References**: instructional, pyramid
- **Mode Behavior**: 按临床读者期待的顺序展开——临床问题、研究设计、主要结果、证据质量、对实践的启示。instructional 负责"先让听众看懂研究是怎么做的"，pyramid 负责每页结论都能追溯到具体数据。时间紧时压缩方法细节，但不能跳过证据质量评价直接给结论。
- **Argument Flow**: 先用一个真实临床情境或未解决的问题引出研究动机；用 PICO（人群、干预/暴露、对照、结局）把研究问题说清；交代研究类型、样本、随访与主要终点；按"主要终点 → 次要终点 → 亚组/敏感性分析 → 安全性"呈现结果；再独立评价偏倚风险、外推性与局限；最后回到开头的临床问题，说明本研究改变或不改变什么。
- **Page Message Discipline**: 每页只承载一个发现、一个方法要素或一个比较；页标题写这一页确立的结论（如"达格列净使心衰住院风险降低 30%"），而不是栏目名（如"结果"）。原文 Figure 与它支持的结论放在同一页。
- **Claim Discipline**: 严格区分原文作者的结论、汇报人的解读与推测，措辞上可辨。效应量必须连同 95% 置信区间报告，不只报 P 值；相对风险与绝对风险差同时给出时，优先让听众看到绝对差与 NNT/NNH。观察性研究不得写成因果结论；亚组结果标注为探索性。所有数字、作者、期刊、年份只能来自原文，缺失时留空并标注"原文未报告"，不得编造。

## III. Page Role Vocabulary

| Role | Communication Job | Evidence Obligation | Composition Tendency |
|---|---|---|---|
| 文献信息 | 交代题目、期刊、年份、作者与研究注册号 | 与原文一字不差；DOI 或 PMID 可查 | 题目突出，期刊与年份次级，避免伪造机构 Logo |
| 临床问题 | 说明为什么这个问题重要、仍未解决 | 用指南空白、既往研究矛盾或真实病例说明缺口 | 一页一个问题，问题句占主导 |
| PICO 与研究设计 | 让听众判断研究是否回答了这个问题 | 人群纳排标准、干预与对照、主要终点、研究类型与随访时长 | 结构化四格或一张研究设计流程图 |
| 研究流程 | 交代样本如何筛选、分组与失访 | 按 CONSORT 或 STROBE 流程图给出各环节人数 | 原文流程图优先；否则用原生流程图重绘人数 |
| 基线特征 | 判断组间可比性与人群代表性 | 关键基线变量与组间差异 | 精简原生表格，只保留与结论相关的变量 |
| 主要结果 | 呈现主要终点的真实观察 | 效应量 + 95% CI + P 值，注明分析集（ITT/PP） | 原文 Figure 主导，一句话结论紧邻图 |
| 次要与亚组结果 | 补充主要结论的稳健性与适用人群 | 标注预设或事后分析；交互 P 值 | 森林图优先，逐行对齐 |
| 安全性 | 交代获益的代价 | 不良事件发生率与组间差异 | 对比表或并列条形 |
| 证据评价 | 独立判断证据可靠性 | 偏倚风险、样本量、随访、外推性、利益冲突 | 优缺点分栏，局限占一整页而非一行 |
| 临床启示 | 回到开头的问题，说明能否用于本科室患者 | 区分"原文结论"和"我们的判断" | 与临床问题页呼应，收束全篇 |
| 讨论问题 | 为组会讨论留出口 | 问题须基于本文证据缺口 | 2–3 个问题，留白充足 |
| 补充材料 | 应对提问 | 完整参数、补充表、敏感性分析 | 允许高密度，便于检索 |

## IV. Evidence & Data Expression

- **Argument Trace**: 每个结论都能追溯到原文的具体表、图或段落，在页脚标注出处（如"原文 Fig. 2A""Table 3"）。链条断开时在页面上说明，不用讲稿去弥补。
- **Charts**: 原文 Figure 是证据，优先以原图嵌入并保持原始宽高比；需要重绘时只用原文报告的数值。生存曲线保留风险人数表与删失标记；森林图保留无效线、点估计与置信区间；坐标轴不截断，对数刻度显式标注。
- **Tables**: 基线表、结局表用原生可编辑表格；数字精度与原文一致，单位统一；不随意加粗"获胜"行，加粗时注明比较基础。
- **Sources**: 每页标注本页数据的原文位置；引用其他文献时给出作者、期刊、年份。仅报告原文给出的利益冲突与资助信息。
- **Native Editability**: 汇报中直接承载数据的表格与简单图表用原生对象，便于会前修正数字；原文结果图作为证据图片导入，不手工重画。

## V. Visual System Defaults

- **Preferred Visual Style**: custom
- **Visual Style References**: swiss-minimal, editorial
- **Visual Style Behavior**: 中国三甲医院学术汇报的克制风格。swiss-minimal 负责严格网格、左对齐标题与充足留白；editorial 负责证据图与结论句的主次关系。白色或极浅灰底，深海军蓝负责标题、页眉与模块框，医学蓝作辅助层级；红色只用于关键结论、统计学显著结果与风险提示，不作装饰。容器为细线圆角矩形，无投影、无渐变、无 3D。
- **Composition**: 每页围绕一张证据图或一个结论组织；结论句位置在全篇保持稳定，让听众知道往哪看。顶部为结论式标题，主体为证据区，底部为出处与一句话要点。
- **Density**: 组会听众接受细节但不接受杂乱。结果页只放支撑一个结论的内容；全部亚组、补充表移到补充材料页。问题页、启示页要留白。
- **Decoration**: 几乎为零。细分隔线、模块标题色条、页码即可；不加装饰性医疗图标阵列、不加无意义的科技光效。
- **Color Behavior**: 版式框架用主色（默认蓝色系）；数据图中的颜色编码一个变量（如试验组/对照组），全篇映射固定；试验组与对照组的颜色在每张图里保持一致，并在灰度打印下仍可区分。选用视觉主题时，试验组取主题的 secondary，对照组取 muted，关键结论取 alert。
- **Typography Character**: 默认中文无衬线字体（视觉主题指定衬线标题时以主题为准），标题粗、正文常规；英文与数字用清晰无衬线体；基因名、物种名按学科惯例用斜体；统计符号（HR、OR、95% CI、P）格式统一。

### Fallback Color Scheme

| Role | HEX | Purpose |
|---|---|---|
| Field | #FFFFFF | 页面底色 |
| Surface | #F3F6FA | 证据盒、分组区域背景 |
| Navy | #12305A | 标题、页眉、主要模块框 |
| Medical Blue | #2F6FB3 | 次级标题、强调线、流程框 |
| Ink | #1F2933 | 正文文字 |
| Muted | #6B7785 | 出处、注释、页码 |
| Key Red | #C0392B | 关键结论、显著结果、风险提示 |
| Highlight | #E8A33D | 当前章节或流程高亮，少量使用 |

### Fallback Typography

| Role | Primary | Fallback Tail | Character |
|---|---|---|---|
| Titles and body | Microsoft YaHei | PingFang SC, Arial | 中文无衬线；标题加粗，正文常规 |
| Numerals and data | Arial | Helvetica | 等高数字，用于表格、坐标轴、统计量 |

## VI. Image & Icon Direction

- **Preferred Image Rendering**: custom
- **Image Rendering References**: flat, vector-illustration
- **Image Rendering Behavior**: 科研插图风格的扁平矢量示意图，用于机制、通路、器官或研究设计示意。flat 负责干净的色块与无透视构图，vector-illustration 负责清晰的轮廓与准确的解剖或分子形态。按医学对象使用自然协调的多色，背景为白色或透明，不含任何文字、标签、数字或伪文字，标签一律由幻灯片原生文本添加。
- **Image Usage**: 原文 Figure、影像、病理图是证据，只能原图嵌入，不得用 AI 重画或"美化"。AI 生成图片只用于封面主视觉、章节页和机制示意图，且不承载任何数据。
- **Image Treatment**: 证据图除声明的裁剪外不做修饰，保持原始宽高比，标注图号与出处；显微图保留比例尺。AI 示意图在页面上与证据图在视觉上可区分（如示意图无边框、证据图带细框与出处）。
- **Icon Treatment**: 少量使用，只用于标记反复出现的概念（如人群、干预、结局），全篇一套图标家族、映射固定；图标不代替数量。

## VII. Review Focus
<!-- visual-review-trigger: explicit-user-only -->
> Apply this section only after the user explicitly activates visual review. It never triggers that stage.

- 每个结果页的标题是可被同页证据核对的结论句。
- 所有效应量都带 95% 置信区间，相对与绝对效应不混淆。
- 原文 Figure 保持原始宽高比，未被重画，页脚有出处。
- 试验组与对照组的配色在全篇一致，灰度下可区分。
- 原文结论、汇报人解读与推测在措辞上可区分。
- 局限与证据评价占独立页面。
- 作者、期刊、年份、样本量与原文一致，无编造信息。
