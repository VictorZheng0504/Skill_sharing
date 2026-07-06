/**
 * vic-medical 布局压力测试:全部页面用容量上限内的"真实长内容",
 * 另有 2 页(P4/P15)故意轻微超限,模拟实际使用中模型塞字过多的情形。
 * 目的:验证固定字号+固定框高在长内容下是否溢出/元素相撞。
 */
const { createDeck } = require("/Users/victor/Desktop/Skill/Skill_sharing/ppt-studio/assets/deck_engine.js");

const d = createDeck("vic-medical", {
  title: "布局压力测试", author: "Victor",
  footer: "维克医学 · VIC MEDICAL", slogan: "AI, landed in medicine.",
});

// P1 cover:双行长标题 + 长副标题
d.S.cover({
  tag: "INTERNAL STRESS TEST 2026",
  kicker: "VIC MEDICAL ACADEMY · 临床科研方法学系列",
  title: [["大语言模型辅助临床科研全流程实操:", false, true], ["从选题立项到论文发表的完整路径", true]],
  subtitle: "面向临床医生与研究生的三小时工作坊——覆盖文献综述、数据清洗、统计分析与投稿回复信写作四大场景",
  speaker: "主讲:郑医生 · 维克医学创始人 · 2026 年 7 月",
});

// P2 divider:长标题(会折行)+ 4 段进度条(长标签)
d.S.sectionDivider({
  no: "01", page: "02",
  title: [["为什么传统的文献综述方法在 AI 时代", false, true], ["已经不再是效率最优解", true]],
  sub: "本章用三个真实案例说明:检索策略、筛选流程与证据整合的每一步都值得被重新设计",
  progress: [["01 · 文献综述的范式转移", true], ["02 · 数据清洗与质量控制", false], ["03 · 统计分析的人机协作", false], ["04 · 投稿与同行评议应对", false]],
});

// P3 contentRows:满 5 行,每行长要点名 + 长说明(上限内)
d.S.contentRows({
  kicker: "METHODOLOGY", title: "文献综述五步法:每一步的 AI 介入点与人工把关点", page: "03",
  rows: [
    ["01", "研究问题结构化拆解", "把临床疑问翻译成 PICO 框架,再由模型生成同义词扩展与 MeSH 主题词候选清单,人工逐条核对术语准确性"],
    ["02", "多数据库检索式构建", "PubMed、Embase、Cochrane 三库检索式分别适配,布尔逻辑由模型起草,检索灵敏度与特异度由人工抽样验证"],
    ["03", "题录去重与初筛", "基于标题摘要的双人独立筛选流程,模型作为第三名'评审'参与分歧仲裁,全程记录排除原因备查"],
    ["04", "全文精读与数据提取", "结构化提取表由模型预填,关键结局指标、效应量与偏倚风险条目必须由研究者对照原文逐项确认"],
    ["05", "证据整合与综述撰写", "模型负责初稿的语言组织与逻辑衔接,结论方向、证据强度分级与临床意义判断始终由人做最终决定"],
  ],
  footnote: "* 本页为容量上限测试:5 行 × 长说明文字",
});

// P4 contentRows 超限:6 行(文档规定 ≤5,模拟模型塞多了的情形)
d.S.contentRows({
  kicker: "OVER-CAPACITY", title: "超限测试:六行要点会发生什么", page: "04",
  rows: [
    ["01", "第一条要点", "这是一条中等长度的说明文字,用于观察六行状态下的行高压缩表现"],
    ["02", "第二条要点", "同上,继续观察行高与字号的关系是否仍然协调"],
    ["03", "第三条要点", "如果行高被压缩到临界值以下,左侧编号与右侧说明会开始拥挤"],
    ["04", "第四条要点", "卡片内边距是否还能维持视觉呼吸感是本行的观察重点"],
    ["05", "第五条要点", "倒数第二行,注意与页脚区域的安全距离"],
    ["06", "第六条要点", "最后一行,观察是否侵入页脚或footnote区域"],
  ],
});

// P5 threeCards:4 卡 + 长卡名 + 长描述
d.S.threeCards({
  kicker: "SCENARIOS", title: "四个高频临床科研场景的落地要点", page: "05",
  cards: [
    { no: "A", head: "回顾性队列研究的数据治理", desc: "电子病历导出的原始数据往往存在缺失、异常值与编码不一致三类问题。先由模型生成数据字典与清洗脚本草稿,再由研究者在脱敏样本上逐列验证清洗规则,最后全量执行并留存清洗日志。" },
    { no: "B", head: "随机对照试验的方案撰写", desc: "试验方案的核心是样本量估算与随机化方案。模型可以快速生成多组参数假设下的样本量敏感性分析,但检验水准、把握度与脱落率的取值必须引用同领域已发表试验作为依据。" },
    { no: "C", head: "诊断准确性研究的报告规范", desc: "STARD 清单共 30 个条目,模型可逐条比对稿件并标注缺失项。特别注意金标准的定义、纳入流程图与不确定结果的处理这三处最容易被审稿人质疑的位置。" },
    { no: "D", head: "meta 分析的统计实现", desc: "异质性检验、亚组分析与发表偏倚评估的 R 代码可由模型生成,但模型选择(固定效应 vs 随机效应)的判断依据需要写入方法学部分,并在敏感性分析中交代。" },
  ],
});

// P6 toc:6 项 + 描述
d.S.toc({
  kicker: "CONTENTS", title: "今天的六个模块", page: "06",
  items: [
    ["01", "文献综述的范式转移", "从人工检索到人机协作的完整流程再造"],
    ["02", "数据清洗与质量控制", "电子病历数据的三类典型问题与对策"],
    ["03", "统计分析的人机协作", "代码生成、结果解读与方法学写作"],
    ["04", "论文写作的效率工具链", "从大纲到投稿信的全流程模板"],
    ["05", "同行评议应对策略", "审稿意见的分类处理与回复信写作"],
    ["06", "科研诚信与 AI 使用边界", "期刊政策、署名规范与披露要求"],
  ],
});

// P7 twoColumn:左长条目 + 右 mono 长代码
d.S.twoColumn({
  kicker: "HANDS-ON", title: "数据清洗:先立规则,再写代码", page: "07",
  left: { head: "清洗规则(人定)", items: [
    "缺失率超过 30% 的变量整列剔除并在方法学部分披露",
    "连续变量采用温莎化处理,截断点取 1% 与 99% 分位数",
    "分类变量的罕见水平(<5%)合并为'其他'类目",
    "时间变量统一转换为 ISO 8601 格式并校验逻辑先后",
    "所有清洗步骤写入日志,原始数据只读不改",
  ]},
  right: { head: "执行脚本(机写)", mono: true, body: "df <- read_csv('emr_export.csv')\nmiss_rate <- colMeans(is.na(df))\ndf <- df[, miss_rate <= 0.30]\nnum_cols <- sapply(df, is.numeric)\ndf[num_cols] <- lapply(df[num_cols],\n  \\(x) winsorize(x, probs = c(.01, .99)))\nwrite_csv(df, 'emr_clean.csv')\nlog_step('winsorize', Sys.time())" },
});

// P8 comparison:每侧 6 条(上限)
d.S.comparison({
  kicker: "BEFORE / AFTER", title: "传统流程 vs 人机协作流程", page: "08",
  left: { tag: "传统流程", head: "平均 6-8 周", bad: true, items: [
    "手工构建检索式,单库检索后人工去重",
    "双人逐篇筛选题录,分歧靠第三人仲裁",
    "数据提取表用 Excel 手填,错漏难追溯",
    "统计分析外包或自学,周期不可控",
    "初稿语言反复打磨,母语润色额外付费",
    "回复信逐条手写,格式规范靠经验",
  ]},
  right: { tag: "人机协作", head: "平均 2-3 周", good: true, items: [
    "模型起草检索式,人工抽样验证灵敏度",
    "模型作为第三评审参与分歧仲裁并留痕",
    "结构化提取表预填 + 人工对照原文确认",
    "分析代码即时生成,人负责模型选择",
    "语言组织交给模型,科学判断留给人",
    "回复信按审稿人分组起草,当天可返",
  ]},
});

// P9 timeline:6 节点 + 长描述
d.S.timeline({
  kicker: "ROADMAP", title: "从零到投稿的十二周计划", page: "09",
  nodes: [
    { tag: "W1-2", head: "选题立项", desc: "PICO 拆解与可行性评估,预注册研究方案" },
    { tag: "W3-4", head: "文献综述", desc: "三库检索与双人筛选,完成证据地图初稿" },
    { tag: "W5-7", head: "数据治理", desc: "清洗规则评审、脚本执行与质量报告归档" },
    { tag: "W8-9", head: "统计分析", desc: "主分析与敏感性分析,图表按期刊规范输出" },
    { tag: "W10-11", head: "论文撰写", desc: "IMRaD 结构逐节成稿,内部预审两轮" },
    { tag: "W12", head: "投稿", desc: "期刊匹配、格式适配与投稿信定稿", done: false },
  ],
});

// P10 table:8 行(上限)
d.S.table({
  kicker: "EVIDENCE", title: "六个常用 AI 工具在科研场景的适配度评估", page: "10",
  headers: ["工具/模型", "文献综述", "数据分析", "论文写作", "合规风险提示"],
  rows: [
    ["Claude", "检索式与筛选仲裁均可", "代码生成质量高", "长文逻辑连贯", "注意披露使用范围"],
    ["ChatGPT", "综述提纲能力强", "代码可用需验证", "语言润色出色", "幻觉引用需逐条核对"],
    ["Elicit", "专为文献设计", "不适用", "不适用", "覆盖库有限"],
    ["Consensus", "证据方向速览", "不适用", "不适用", "不能替代系统检索"],
    ["ResearchRabbit", "引文网络可视化", "不适用", "不适用", "无"],
    ["Scite", "引用立场分析", "不适用", "辅助引用核查", "订阅费用较高"],
    ["Copilot", "不适用", "IDE 内补全顺手", "不适用", "代码许可证争议"],
    ["NotebookLM", "私有文献库问答", "不适用", "辅助素材整理", "上传数据需脱敏"],
  ],
  source: "维克医学内部评估,2026 年 6 月",
});

// P11 statement:三行长金句
d.S.statement({
  kicker: "CORE BELIEF", page: "11",
  title: [["AI 不会取代医生做研究,", false, true], ["但会用 AI 的研究者,", false, true], ["正在取代不会用的。", true]],
  sub: "工具的差距是暂时的,工作流的差距是复利的——这正是我们今天要解决的问题",
});

// P12 processSteps:5 步(上限)+ 长描述
d.S.processSteps({
  kicker: "WORKFLOW", title: "审稿意见回复的五步标准流程", page: "12",
  steps: [
    { head: "意见分类", desc: "把所有意见按'必须改/可商榷/误解澄清'三类标注优先级" },
    { head: "逐条起草", desc: "每条意见先写行动项再写回复文字,改动处标注页码行号" },
    { head: "补充分析", desc: "需要新数据或新分析的意见单独立项,评估工作量与时限" },
    { head: "交叉审阅", desc: "回复信与修改稿由未参与起草的合作者对照审阅一遍" },
    { head: "格式定稿", desc: "按期刊要求整理修订模式文档、干净版与逐条回复信" },
  ],
});

// P13 kpiGrid:4 卡 + 长标签
d.S.kpiGrid({
  kicker: "OUTCOMES", title: "工作坊往期学员的三个月随访数据", page: "13",
  kpis: [
    { label: "文献综述平均耗时下降", value: "62", unit: "%", delta: "vs 传统流程", dir: "down", good: true },
    { label: "三个月内完成投稿比例", value: "41", unit: "%", delta: "12 pt vs 对照", dir: "up", good: true },
    { label: "методология相关退稿率", value: "9.3", unit: "%", delta: "5.1 pt", dir: "down", good: true },
    { label: "学员净推荐值 NPS", value: "+67", unit: "", delta: "上期 +58", dir: "up", good: true },
  ],
});

// P14 红线 divider(tone)长标题
d.S.sectionDivider({
  no: "04", page: "14", tone: "bad",
  kicker: "RED LINES",
  title: [["三条不可逾越的红线:", false, true], ["数据安全、科研诚信与患者隐私", false]],
  sub: "任何效率提升都不能以违反期刊政策或泄露患者数据为代价",
  progress: [["01 · 文献综述的范式转移", false], ["02 · 数据清洗与质量控制", false], ["03 · 统计分析的人机协作", false], ["04 · 投稿与同行评议应对", true]],
});

// P15 closing:长 CTA(超限测试:CTA 文字很长)
d.S.closing({
  kicker: "THANKS", page: "15",
  title: [["把今天学到的流程,", false, true], ["用在你下一篇论文上", true]],
  sub: "课件、清洗脚本模板与回复信模板已上传学员群,三个月内可预约一对一答疑",
  cta: "vicmedical.com/workshop · 微信 VICMED2026",
});

d.save("/Users/victor/Desktop/Skill/Skill_sharing/_walkthrough/vic-medical/stress-test.pptx")
  .then(() => console.log("OK stress-test.pptx"));
