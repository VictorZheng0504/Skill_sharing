/**
 * build_hero.js — 为 18 个新增专属构图主题各生成 5 页 hero 走查 deck
 * 用法: node build_hero.js [themeId ...]  (缺省 = 全部 18 个)
 */
const { createDeck } = require("./deck_engine");

const NEW_THEMES = [
  "academic-navy", "minimal-gray", "research-defense", "clean-pro", "dashboard",
  "indigo-porcelain", "kraft-paper", "dune", "swiss-lemon", "swiss-orange",
  "nord", "terminal-green", "warm-academic", "soft-pastel", "neo-brutalism",
  "bauhaus", "keynote-light", "tokyo-night",
];

async function build(id) {
  const d = createDeck(id, {
    title: "版式走查 · " + id, author: "ppt-studio",
    footer: "PPT STUDIO", slogan: "v2 layout DNA", source: "ppt-studio 走查数据",
  });
  d.S.cover({
    kicker: "版式 DNA 走查", tag: "2026 · V2",
    title: [["让每个主题 ", false], ["长得不一样", true]],
    subtitle: "构图即身份:封面一眼认出主题",
    speaker: "Victor · 产品工程",
  });
  d.S.sectionDivider({
    no: 2, kicker: "SECTION", title: "构图的第二章",
    sub: "幕封页:编号形态与标题落位是主题签名", page: 2,
  });
  d.S.statement({
    kicker: "KEY MESSAGE",
    title: [["排版个性不靠换色,", false, true], ["靠", false], ["构图语言", true]],
    sub: "—— ppt-studio v2 设计原则", page: 3,
  });
  d.S.bigStat({
    kicker: "DATA", title: "关键指标一眼读", page: 4,
    stat: { value: "87", unit: "%", label: "主题识别率", sub: "盲测中受访者能凭构图认出主题" },
    bars: [["v1", 42], ["迭代", 65], ["v2", 87, true]],
  });
  d.S.closing({
    kicker: "THANKS", title: [["构图,是主题的", false], ["签名", true]],
    sub: "22 个主题 · 22 种版式人格", cta: "github.com/VictorZheng0504", page: 5,
  });
  await d.save("hero_" + id + ".pptx");
  console.log("OK", id);
}

(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : NEW_THEMES;
  for (const id of ids) await build(id);
})().catch(e => { console.error(e); process.exit(1); });
