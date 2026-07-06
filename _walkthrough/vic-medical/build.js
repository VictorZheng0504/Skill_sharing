// vic-medical 主题走查 deck:5 hero + 内容版式抽样,含红线 tone 变体
const path = require("path");
const { createDeck } = require(path.join(__dirname, "../../ppt-studio/assets/deck_engine.js"));

(async () => {
  const d = createDeck("vic-medical", {
    title: "AI 辅助科研制图",
    author: "Victor · 维克医学",
    footer: "维克医学 · AI, landed in medicine.",
    slogan: "AI, landed in medicine.",
  });
  const S = d.S;

  S.cover({
    kicker: "AI, LANDED IN MEDICINE",
    tag: "讲座 · 2026",
    title: [["AI 辅助科研制图", false, true], ["从想法到", false], ["期刊级图表", true]],
    subtitle: "维克医学 · 讲座 v1 · 2026",
    speaker: "主讲:Victor · 维克医学",
  });

  const prog = [["01 · 机制图绘制", true], ["02 · 数据可视化", false], ["03 · 合规红线", false]];
  S.sectionDivider({
    no: 1,
    title: [["机制图绘制", false, true], ["从想法到期刊图", true]],
    sub: "工具:BioRender · 约 25 分钟",
    progress: prog,
    page: "05",
  });

  S.contentRows({
    kicker: "PART 01 · 机制图绘制",
    title: "场景一:指令型提示词",
    rows: [
      ["01", "提示词", "清晰描述结构、比例、配色,把 AI 当作听话的绘图助手"],
      ["02", "适用场景", "已有明确构图,需要快速产出标准示意图时最省时"],
      ["03", "要点", "每页最多 3–4 个要点;关键词统一用青色粗体"],
      ["04", "验证", "生成后逐项核对解剖结构与标注,不确定的回查文献"],
    ],
    page: "06",
  });

  S.threeCards({
    kicker: "PART 02 · 数据可视化",
    title: "三种主流工具对比",
    cards: [
      { no: "01", head: "BioRender", desc: "机制示意图,素材库丰富,期刊接受度高。" },
      { no: "02", head: "GraphPad", desc: "统计图首选,主流期刊默认样式。" },
      { no: "03", head: "Python", desc: "高度定制,可复现,适合复杂多面板图。" },
    ],
    page: "14",
  });

  S.statement({
    kicker: "核心观点",
    title: [["AI 不替你画图,", false, true], ["它替你把", false], ["想法变成初稿", true]],
    sub: "初稿之后的每一步核对,仍然是研究者的责任。",
    page: "18",
  });

  S.bigStat({
    kicker: "PART 02 · 数据可视化",
    title: "改用版式引擎后的效率",
    stat: { value: "6", unit: "倍", label: "单图产出速度", sub: "从平均 3 小时/图 降到 30 分钟/图(内部 12 图样本)" },
    bars: [["手绘", 100, false], ["模板", 62, false], ["AI 初稿", 28, true], ["AI+引擎", 17, true]],
    page: "22",
  });

  S.sectionDivider({
    no: 3,
    tone: "bad",
    title: [["合规红线", false, true], ["不能碰的三件事", true]],
    sub: "重点:学术诚信 · 约 15 分钟",
    progress: [["01 · 机制图绘制", false], ["02 · 数据可视化", false], ["03 · 合规红线", true]],
    page: "31",
  });

  S.toc({
    kicker: "AGENDA",
    title: "今天讲什么",
    items: [["01", "机制图绘制", "BioRender · 25 分钟"], ["02", "数据可视化", "GraphPad/Python · 30 分钟"], ["03", "合规红线", "学术诚信 · 15 分钟"]],
    page: "02",
  });

  S.closing({
    kicker: "THANKS",
    title: [["把 AI 真正", false], ["落进医学", true]],
    sub: "课件与提示词模板会后发群,欢迎带着自己的图来问。",
    cta: "vic-medical.com",
    page: "32",
  });

  await d.save(path.join(__dirname, "vic-medical-walkthrough.pptx"));
  console.log("OK: vic-medical-walkthrough.pptx");
})().catch(e => { console.error(e); process.exit(1); });
