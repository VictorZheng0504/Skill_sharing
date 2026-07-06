/** 跨主题回归:mckinsey + swiss-ikb 各 5 页(cover/contentRows/threeCards/timeline/kpiGrid),
 *  验证引擎级 fit 与垂直自适应不破坏老主题正常密度下的观感。 */
const { createDeck, listThemes } = require("/Users/victor/Desktop/Skill/Skill_sharing/ppt-studio/assets/deck_engine.js");

function build(theme, file) {
  const d = createDeck(theme, { title: "回归测试", author: "Victor", footer: "REGRESSION" });
  d.S.cover({ kicker: "KEYNOTE 2026", title: [["把想法", false], ["讲清楚", true]], subtitle: "一句话副标题", speaker: "主讲:某某" });
  d.S.contentRows({ kicker: "方法", title: "三个步骤", page: "02", rows: [
    ["01", "对齐目标", "受众、时长、目标、用途"],
    ["02", "锁定风格", "spec-lock 固化决策"],
    ["03", "逐页生成", "每页 QA 自检"]] });
  d.S.threeCards({ kicker: "支柱", title: "三个支柱", page: "03", cards: [
    { no: "A", head: "主题与版式分离", desc: "版式函数只引用令牌,任意搭配不破相" },
    { no: "B", head: "版式 DNA", desc: "每个主题有专属构图,不只是换色" },
    { no: "C", head: "HITL 流程", desc: "九步固定流程,关键节点等确认" }] });
  d.S.timeline({ kicker: "计划", title: "四周计划", page: "04", nodes: [
    { tag: "W1", head: "访谈", desc: "对齐受众与目标" },
    { tag: "W2", head: "规划", desc: "页面清单与版式" },
    { tag: "W3", head: "生成", desc: "spec-lock 一次成稿" },
    { tag: "W4", head: "交付", desc: "QA 后交付", done: false }] });
  d.S.kpiGrid({ kicker: "指标", title: "两个指标", page: "05", kpis: [
    { label: "REVENUE", value: "1,248", unit: "K", delta: "38% YoY", dir: "up", good: true },
    { label: "CHURN", value: "2.1", unit: "%", delta: "0.4 pt", dir: "down", good: true }] });
  return d.save(file);
}

(async () => {
  await build("mckinsey", "/Users/victor/Desktop/Skill/Skill_sharing/_walkthrough/vic-medical/regress-mckinsey.pptx");
  await build("swiss-ikb", "/Users/victor/Desktop/Skill/Skill_sharing/_walkthrough/vic-medical/regress-swiss-ikb.pptx");
  // 全 23 主题 headless smoke:每主题跑全部 15 版式
  for (const t of listThemes()) {
    const d = createDeck(t.id, { title: "smoke", footer: "SMOKE" });
    d.S.cover({ kicker: "K", title: [["标题", false]], subtitle: "副标题" });
    d.S.toc({ title: "目录", items: [["01", "一"], ["02", "二"], ["03", "三"], ["04", "四"]] });
    d.S.sectionDivider({ no: "01", title: [["章节", false]] });
    d.S.statement({ kicker: "K", title: [["金句", false]] });
    d.S.contentRows({ title: "要点", rows: [["01", "甲", "说明"], ["02", "乙", "说明"]] });
    d.S.twoColumn({ title: "双栏", left: { head: "左", items: ["一", "二"] }, right: { head: "右", mono: true, body: "code" } });
    d.S.threeCards({ title: "三卡", cards: [{ no: "A", head: "甲", desc: "d" }, { no: "B", head: "乙", desc: "d" }, { no: "C", head: "丙", desc: "d" }] });
    d.S.comparison({ title: "对比", left: { tag: "L", head: "左", bad: true, items: ["一"] }, right: { tag: "R", head: "右", good: true, items: ["一"] } });
    d.S.imageText({ title: "图文", lead: "引导", placeholder: "IMG" });
    d.S.kpiGrid({ title: "KPI", kpis: [{ label: "A", value: "1" }, { label: "B", value: "2" }] });
    d.S.bigStat({ title: "大数字", stat: { value: "83", unit: "%", label: "指标" }, bars: [["Q1", 40], ["Q2", 100, true]] });
    d.S.timeline({ title: "时间线", nodes: [{ tag: "T1", head: "一" }, { tag: "T2", head: "二" }, { tag: "T3", head: "三" }] });
    d.S.table({ title: "表", headers: ["a", "b"], rows: [["1", "2"], ["3", "4"]], source: "src" });
    d.S.processSteps({ title: "步骤", steps: [{ head: "一", desc: "d" }, { head: "二", desc: "d" }, { head: "三", desc: "d" }] });
    d.S.closing({ kicker: "K", title: [["谢谢", false]], cta: "example.com" });
    await d.save("/private/tmp/claude-501/-Users-victor-Desktop-Skill-PPT-skill/d9803c34-f183-46b4-ab75-36fd266a3e3d/scratchpad/smoke-" + t.id + ".pptx");
  }
  console.log("SMOKE-OK 23 themes");
})();
