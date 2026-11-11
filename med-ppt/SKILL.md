---
name: med-ppt
description: 医学汇报 PPT 生成工作流，输出原生可编辑 .pptx。分三大类：文献汇报（组会、Journal Club、SCI 论文解读）、临床个案报告（病例分享、疑难病例讨论、MDT、CPC）、通用医学报告（临床研究开题/中期/结题/学会报告、指南解读、专题进展与治疗格局、教学课件、科室工作汇报）；汇报类型与 6 套视觉主题（含维克医学深色科技主题）或自由风格可任意组合；导出前先出 HTML 审阅页。医学编排层负责读文献或病历、按汇报类型规划每页、核对数字出处，再交给 ppt-master 引擎排版与导出；可调用 Codex 自带生图，或用户配置的 Qwen、Seedream 等生图 API（Kimi、WorkBuddy 中也可用），生成封面与机制示意图。当用户说"做组会汇报 PPT""把这篇文献做成 PPT""做病例汇报""疑难病例讨论 PPT""临床研究汇报""指南解读 PPT""治疗进展 PPT""教学课件"，或提到 med-ppt 时使用。
---

# med-ppt

医学汇报专用的编排层，自己不排版，排版、生图与 PPTX 导出全部交给 **ppt-master**（SVG → 原生 DrawingML）。本 Skill 负责三件 ppt-master 不懂的事：

1. **医学理解**：按汇报类型读文献/病历，产出逐页规划 `med_brief.md`。
2. **证据纪律**：原文 Figure、影像、病理只能原图嵌入；每个数字和关键文字主张都在 `facts.json` 登记出处。
3. **事后核对**：导出后用 `check_layout.py` 核对文字重叠，用 `check_facts.py` 核对 PPT 里的数字是否都有出处。

下文 `${MED_DIR}` 指本文件所在目录的绝对路径，`${PM_DIR}` 指 ppt-master 的 skill 目录（含其 `SKILL.md`）。

## 0. 环境检查（每次运行先做）

```bash
python3 "${MED_DIR}/scripts/locate_ppt_master.py"
```

输出 JSON，含 `ppt_master_dir`、`version`、`python`、`ok`、`problems`，以及生图配置 `image_backend`、`image_backend_key_set`、`pexels_key_set`（第 5 节使用；只报告有没有 Key，不含 Key 的值）。

- `ok: false` → 把 `problems` 原样告诉用户并停止；安装方法见 `${MED_DIR}/references/platforms.md`。不要自己去网上下载 ppt-master。
- `python` 字段给出应使用的解释器。若它不是 `python3`（例如是 `~/.agents/venvs/med-ppt/bin/python`），后续**所有** Python 命令（包括 ppt-master 流程里写作 `python3` 的命令）都改用这个解释器的绝对路径。
- `version_tested: false` 只是提醒：告诉用户当前 ppt-master 版本未经本 Skill 测试，继续执行。

记下 `ppt_master_dir` 作为 `${PM_DIR}`，交接时作为 ppt-master 的 `SKILL_DIR` 使用。

## 1. 前置问题（一次问完）

先读 `${MED_DIR}/references/report-types.md` 的"推荐类型的判断"与 `${MED_DIR}/references/themes.md`，浏览用户给的材料（文件名、标题、摘要或病历首页即可），再用**一个消息块**提问。已从用户请求中得知的项不再问；类型这一项总是要用户确认，即使已能判断，也写出推荐请用户回复"确认"。

```text
请先确认几件事：

1️⃣ 汇报类型（根据材料，我推荐：<大类 · 子类>，理由：<一句话>）
   ① 文献汇报：组会 / Journal Club / SCI 精读
   ② 临床个案报告：分享型（诊断已明确）/ 讨论型（先讨论、后揭晓诊断）
   ③ 通用医学报告：临床研究（开题/中期/结题/学会）/ 指南解读 / 专题进展与治疗格局 / 教学课件 / 科室工作汇报
2️⃣ 页数：大约多少页？
3️⃣ 场合与时长：如"课题组组会 15 分钟""全院疑难病例讨论 20 分钟"
4️⃣ 视觉主题：T1 临床蓝（默认）/ T2 深海军蓝期刊 / T3 森林绿临床人文 / T4 暖米书卷 / T5 黑白灰阶 / T6 维克医学（深色科技，维克学院讲座）/ T0 自由风格（按内容定配色）
5️⃣ 讲稿：是否需要每页中文讲稿？（默认需要）
```

- 推荐依据 report-types.md 的判断表；材料混合、无法判断时，在 1️⃣ 里列两个候选请用户选。
- 选③临床研究时，阶段（开题/中期/结题/学会）也在同一条消息里问。
- 页数必须是一个具体数字；用户给区间时请他定一个数。
- 主题可附一句推荐（如答辩推荐 T2、打印讲义推荐 T5）；用户不选即 T1。主题与类型独立，任意组合。
- 不问字体与生图开关：字体由主题决定、在 ppt-master 确认环节可改；生图按第 5 节平台规则自动决定。

## 2. 建立工作目录

在用户当前工作目录下建立 `med-ppt-runs/<简短英文名>_<YYYYMMDD>/`，下文称 `${RUN}`。原始材料保持原位，不复制进 `${RUN}`。

## 3. 医学上游（本 Skill 的核心）

按顺序读取：

```text
Read ${MED_DIR}/references/report-types.md     # 三类汇报的页面骨架
Read ${MED_DIR}/references/brief-schema.md     # med_brief.md 与 facts.json 的格式
Read ${MED_DIR}/references/evidence-rules.md   # 医学证据与图片规则
```

1. **转换来源**：PDF/DOCX 等先用 ppt-master 的转换器转成 Markdown（转换结果放在源文件旁，后续 ppt-master 会直接复用）：
   ```bash
   python3 "${PM_DIR}/scripts/source_to_md.py" <源文件或目录...>
   ```
2. **通读**转换后的 Markdown 与用户给的图片，建立 Figure 清单：每张图的文件路径、原文图号、内容、准备放在哪一页。
3. **写 `${RUN}/med_brief.md`**：按 report-types.md 中对应大类与子类的骨架，结合页数增删页面，逐页写结论式标题、要点、证据绑定、出处、讲稿草稿和 AI 配图需求。
4. **写 `${RUN}/facts.json`**：brief 中出现的每个数字（样本量、效应量、置信区间、P 值、检验值、日期、剂量……）都登记一条；研究设计、获批身份、抗体亚型、给药途径、指南推荐强度等关键文字主张以 `kind: "claim"` 登记。每条都写明原文位置；原文没有的数字或主张不得出现在 brief 中。
5. **校验格式**：
   ```bash
   python3 "${MED_DIR}/scripts/check_facts.py" --validate-only --facts "${RUN}/facts.json"
   ```

⛔ **阻塞点：大纲确认**。把页面清单（页码 + 结论式标题 + 证据来源）以表格形式给用户看，并列出原文缺失、需要用户补充的信息。在同一条消息末尾告诉用户：

```text
确认大纲后，ppt-master 的沟通设定与模板选择将按这份大纲自动填写，之后只在视觉与制作方案处再请你确认一次。如果想逐项确认沟通设定，请在回复里说明。
```

等用户明确确认或修改后再继续。用户确认大纲且未要求逐项确认，即视为把 ppt-master Stage 1 委托给本 Skill（第 4 节）。

## 4. 交接给 ppt-master

1. 读取 `${PM_DIR}/SKILL.md`，并严格按它的 Mandatory Load Order 执行（包括运行它的 `attribution_guard.py`）。从这一步起，排版与导出的流程规则以 ppt-master 为准；本 Skill 只补充下面列出的医学约束。
2. 以如下请求进入 ppt-master 的 **Generate PPTX** 路线（把尖括号替换为实际值）：

   ```text
   用这些材料生成 PPT：<原始材料路径...> 和 ${RUN}/med_brief.md。
   模板使用 Style 工作区：${MED_DIR}/templates/styles/<style_id>/
   <T1–T6 时加上：>同时使用 Brand 工作区：${MED_DIR}/templates/brands/<brand_id>/（视觉主题，配色与字体以它为准）
   <T6 时再加上 themes.md"T6 维克医学的页面框架"一节代码块里的整段话>
   <T0 时改为 themes.md"自由风格"一节的两句话>
   汇报子类：<如"临床个案 · 讨论型""通用 · 专题进展与治疗格局">，Style 中只按该子类的方法执行。
   med_brief.md 是已经由用户确认的逐页规划：页数、页序、每页结论式标题与证据绑定按它执行，不要重新规划内容结构；
   原文 Figure、影像、病理图只能作为原图嵌入，禁止 AI 重画；所有数字只能使用 med_brief.md 中出现的数值。
   图片分工：原图负责证据，放大到撑满所在区域，旁边或下方写解释；需要比较的数字用原生图表（chart 模板）；AI 插画只负责比喻和氛围，图中不带任何字，字由版式排；软件或文件演示用真实截图或真实文件摘录，不用 AI 假截图。
   所有 SVG 通过 final 质量检查并运行 finalize_svg.py 之后先停下，不要运行 svg_to_pptx.py；等用户审阅 HTML 版确认后再导出。
   页面上的出处写原文位置（如"原文 Table 2，p. 5"），不得出现 paper.md、host-native、SVG 等文件名或工具术语。
   以上约束是写给你的，不要把约束或处理过程写到页面和页脚上（如"按要求嵌入""按用户确认采用""已去标识化"）。
   图形与文字标签不得重叠，标签与它所属的条形或数据点对齐。导出的每行文字是不换行的文本框：长句拆成多行，同一行相邻标签之间留出间距，卡片内的文字不得超出卡片宽度。
   AI 图片获取方式：<api（<image_backend>）/ host-native / 不使用 AI 图片，按第 5 节决定>；使用 AI 图片时规划封面主视觉 1 张 + 机制示意图至少 1 张。
   <主题有纹理背景且使用 AI 图片时加上 themes.md"纹理背景"一节的那段话>
   <pexels_key_set 为 true 时加上：>封面与章节页可用 Pexels 搜图（Acquire Via: web），只用于场景照片，不用于任何证据或数据页。
   讲稿：<开启/关闭>。
   ppt-master 项目建在 ${RUN} 下（project_manager.py init 时加 --dir "${RUN}"）。
   确认在对话中进行，不打开确认网页。
   <默认加上这一句：>用户已委托 Stage 1：沟通契约按 med_brief.md 的"汇报设定"与"核心信息"决定，模板模式选用上述 Style（及 Brand）；完成并安装后直接给出 Stage 2 完整方案供用户确认。
   ```

   用户在大纲确认时要求逐项确认沟通设定的，删去最后一句，Stage 1 照常在对话中确认。

3. Stage 2（完整方案）始终由用户确认：AI Image Acquisition Path 按第 5 节填写。
4. 用户在本 Skill 开头明确说"快速模式"时，改走 ppt-master 的 Quick（不再有 Stage 1/2 确认），其余约束不变。
5. **先审阅、后导出**。SVG finalize 完成后生成审阅页：

   ```bash
   python3 "${MED_DIR}/scripts/make_review.py" <ppt-master 项目目录> --title "<讲题> 审阅"
   ```

   ⛔ **阻塞点：HTML 审阅**。把 `<项目目录>/review.html` 交给用户（逐页大图 + 可展开讲稿）。审阅页直接引用导出所用的 `svg_final/`，看到的就是导出后的版面；用户提修改时只改 `svg_output/` 对应页，重新跑 final 质量检查与 `finalize_svg.py`、再生成审阅页，不维护第二份 HTML。用户明确确认后，才运行 ppt-master 的 `svg_to_pptx.py` 导出。快速模式也不跳过这一步，除非用户明确说"不用审阅"。
6. ppt-master 导出完成后，记下它报告的 `.pptx` 路径。

## 5. 生图规则（按可用能力）

按第 0 节的输出依次判断，取第一个满足的：

| 条件 | AI Image Acquisition Path | 说明 |
|---|---|---|
| 用户点名某个生图模型（如"用 Qwen 生图"） | `api`，`IMAGE_BACKEND` 为该后端 | 该后端没有 Key 时告诉用户按 `references/platforms.md` 配置，不要改用别的后端 |
| `image_backend` 非空且 `image_backend_key_set: true` | `api` | 通过 ppt-master 的 `image_gen.py` 调用用户配置的 API（Qwen、Seedream 等），任何平台都能用；按张计费 |
| 能看到宿主自带的图片生成工具（如 Codex） | `host-native` | 不需要 API Key |
| 以上都不满足 | 不使用 AI 图片 | 需要配图的位置改用原生形状、图标或原文 Figure；把配图提示词写入 `${RUN}/image_prompts_for_later.md` |

- 选定 `api` 或 `host-native` 后，Stage 2 默认规划封面主视觉 1 张 + 机制示意图至少 1 张；ppt-master 提议"不使用 AI 图片"时，向用户指出这与默认不同，由用户决定。
- `api` 调用失败（网络被沙箱拦截、Key 无效、额度不足）时，把错误原样告诉用户，并按 ppt-master 的失败处理询问用户；不要静默改为不生图。
- `pexels_key_set: true` 时，封面、章节页可用 Pexels 照片（ppt-master 的 `image_search.py`，Pexels 许可无需署名）；患者影像、病理等证据图仍只能用原图。
- 不得在命令行、页面、讲稿或报告中打印 Key 的值。

无论用哪种方式，AI 图片只用于封面、章节页、机制或解剖示意图与教学比喻插画，不承载任何数据，提示词中写明"图中不含任何文字、数字或标签"；需要的字由版式用原生文本排。软件界面与文件演示不用 AI 图（见 evidence-rules.md 图片分工）。

## 6. 导出后核对

**版面核对**（不依赖渲染，必做）：

```bash
python3 "${MED_DIR}/scripts/check_layout.py" <导出的.pptx>
```

它按 PPTX 中文本框的实际位置找出文字与文字相交、文字超出页面的地方，并扫描页面和讲稿中的内部用语（文件名、工具术语、"按要求""已去标识化"之类的过程说明或未核实声明）。退出码 1 时逐条回到 ppt-master 修正对应页面（拆行、缩短、加间距、调整位置，或把页脚改成只写来源位置），重新导出后再运行，直到退出码为 0。

**可读性核对**（必做）：

```bash
python3 "${MED_DIR}/scripts/check_readability.py" <导出的.pptx>
```

小于硬下限的正文为阻塞问题，必须修正。warning 表示字号、文字密度或文本框数量接近投影阅读上限；逐页查看后修正，或在最终报告中说明保留理由。`--strict` 可用于让 warning 也阻断导出。

**最终 PPTX 渲染检查**（LibreOffice 可用时必做）：

```bash
python3 "${MED_DIR}/scripts/render_pptx.py" <导出的.pptx> --outdir "${RUN}/preview-pptx"
```

逐页查看 `preview-pptx/slide-*.png`，重点找字体替换、断行变化、文字压图、标签错位、低对比度和留白失衡。LibreOffice 不可用时，再查看 ppt-master 项目的 `svg_final/`，并在最终报告中明确写"未做最终 PPTX 渲染检查"。LibreOffice 的字体度量仍可能与 Microsoft PowerPoint 不同；高要求会议稿仍建议用 PowerPoint 人工快速过一遍。

发现问题回到 ppt-master 修正对应页面并重新导出，再做下面的数字核对。

**数字与关键主张核对**：

```bash
python3 "${MED_DIR}/scripts/check_facts.py" --facts "${RUN}/facts.json" --pptx <导出的.pptx> --report "${RUN}/facts_report.md"
```

- 退出码 0：所有数字都有出处，`must_show` 的关键数字与文字主张都已出现。
- 退出码 1：报告中列出"无出处数字"、"缺失的关键数字"和"缺失的关键文字主张"。逐条处理：确属 PPT 排版错误的，回到 ppt-master 修正对应页面并重新导出；属于合理的派生数字（如由 HR 0.70 换算的"降低 30%"）的，补登到 facts.json 并标注 `"source": "derived: ..."`，再重新核对。不得为了通过核对而删除 facts.json 中的条目。

## 7. 最终报告

用中文向用户报告：

- 导出的 `.pptx` 路径（以及 ppt-master 生成的其他版本）
- 版面、可读性、最终 PPTX 渲染与证据核对结果（通过，或剩余问题清单）
- 实际使用的 Style、子类、视觉主题与生图方式（api 时写明后端与张数）；未生成的配图提示词文件路径（如有）
- brief 中标注为"原文未报告/资料未提供"、需要用户自行补充的信息

## 参考文件

- `references/report-types.md`：三类汇报的类型判断、子类页面骨架与对应 Style
- `references/themes.md`：6 套视觉主题、自由风格、纹理背景与 T6 维克医学页面框架
- `scripts/make_review.py`：导出前的 HTML 审阅页（与 PPTX 同源）
- `references/brief-schema.md`：`med_brief.md` 与 `facts.json` 格式
- `references/evidence-rules.md`：医学证据、数字与图片规则
- `references/platforms.md`：Codex / Kimi Code / WorkBuddy 安装与差异
- `templates/styles/*/templates/design_spec.md`：交给 ppt-master 的三个医学 Style 工作区
- `templates/brands/*/templates/design_spec.md`：6 个视觉主题 Brand 工作区
