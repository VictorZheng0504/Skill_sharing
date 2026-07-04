/**
 * deck_engine.js — ppt-studio 通用版式引擎
 * 依赖: pptxgenjs   ( npm i pptxgenjs )
 *
 * 设计原则(借鉴 html-ppt-skill 的令牌架构):
 *   - themes.json 里每个主题是一组语义化设计令牌(颜色/字体/圆角)
 *   - 版式函数只引用令牌,绝不写死色值 → 主题 × 版式自由组合
 *   - hero 页(封面/幕封/金句/收束)与内容页用不同底色,天然形成明暗节奏
 *
 * 用法:
 *   const { createDeck, listThemes } = require("./deck_engine");
 *   const d = createDeck("swiss-ikb", { title:"...", author:"...", footer:"页脚品牌语" });
 *   d.S.cover({ kicker:"KEYNOTE 2026", title:[["把想法",false],["讲清楚",true]],
 *               subtitle:"副标题", speaker:"主讲:某某", tag:"内部分享", notes:"口播…" });
 *   d.S.contentRows({ kicker:"方法", title:"三个步骤", rows:[["01","要点","说明"]], page:"02" });
 *   await d.save("out.pptx");
 *
 * 约定:
 *   - 富文本标题参数 title/lines 用 runs 数组: [[文字, 是否强调色, 是否换行], ...]
 *   - 所有版式接受 page(页码字符串,null 不显示)和 notes(演讲者备注)
 *   - 颜色一律不带 # 号(pptxgenjs 要求)
 */
const pptxgen = require("pptxgenjs");
const path = require("path");
const THEMES = require(path.join(__dirname, "themes.json"));

const PW = 13.333, PH = 7.5;   // 16:9 画布(inch)
const MX = 0.85;               // 左右边距
const CW = PW - MX * 2;        // 内容区宽度

function listThemes() {
  return Object.entries(THEMES).map(([k, v]) => ({ id: k, label: v.label, scene: v.scene }));
}

function createDeck(themeName, meta = {}) {
  const T = THEMES[themeName];
  if (!T) throw new Error(`未知主题 "${themeName}"。可选: ${Object.keys(THEMES).join(", ")}`);
  const C = T.c, F = T.f, R = T.radius || 0;

  const pres = new pptxgen();
  pres.defineLayout({ name: "W169", width: PW, height: PH });
  pres.layout = "W169";
  if (meta.author) pres.author = meta.author;
  if (meta.title) pres.title = meta.title;
  const FOOTER = meta.footer || "";

  // 当前页调色板:hero 页用深/品牌底,内容页用浅底
  // ac  = 文字强调色(必须满足对比度)  acF = 装饰强调色(色条/节点/按钮,可用高饱和色)
  const pal = hero => hero
    ? { bg: C.hero, t1: C.heroT1, t2: C.heroT2, t3: C.heroT2,
        ac: C.heroAccent, acF: C.heroAccentFill || C.heroAccent, line: C.heroLine }
    : { bg: C.bg,   t1: C.t1,    t2: C.t2,    t3: C.t3,
        ac: C.accent, acF: C.accentFill || C.accent, line: C.border };

  // ---------- 公用零件 ----------
  function newSlide(hero) {
    const s = pres.addSlide();
    s.background = { color: pal(hero).bg };
    return s;
  }
  function kicker(s, p, text, y = 0.6) {
    if (!text) return;
    s.addText(text.toUpperCase() === text ? text : text, {
      x: MX, y, w: CW, h: 0.35, fontFace: F.mono, fontSize: 12.5,
      charSpacing: 2.5, color: p.ac, margin: 0,
    });
  }
  function header(s, p, o, tsize = 34) {
    kicker(s, p, o.kicker);
    if (o.title != null) {
      const runs = toRuns(o.title, p);
      s.addText(runs, { x: MX - 0.02, y: 0.98, w: CW, h: 0.95, fontFace: F.title,
        fontSize: o.titleSize || tsize, bold: true, color: p.t1, margin: 0 });
    }
  }
  function footer(s, p, page) {
    if (FOOTER) s.addText(FOOTER, { x: MX, y: PH - 0.5, w: 7, h: 0.3,
      fontFace: F.mono, fontSize: 10.5, charSpacing: 1, color: p.t3 });
    if (page != null) s.addText(String(page), { x: PW - 1.5, y: PH - 0.5, w: 0.65, h: 0.3,
      fontFace: F.mono, fontSize: 10.5, color: p.t3, align: "right" });
  }
  function accentBar(s, x, y, w, h, color) {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color } });
  }
  function card(s, x, y, w, h, opts = {}) {
    const lc = opts.lineColor || C.cardLine; // cardLine 令牌:新粗野等描边风格用
    s.addShape(R > 0 ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, {
      x, y, w, h, rectRadius: R > 0 ? R : undefined,
      fill: { color: opts.fill || C.surface },
      line: lc ? { color: lc, width: opts.lineWidth || C.cardLineW || 1 } : { type: "none" },
    });
  }
  // title 参数 → pptxgenjs 富文本 runs。接受字符串或 [[text, accent?, break?], ...]
  function toRuns(title, p) {
    if (typeof title === "string") return [{ text: title, options: { color: p.t1 } }];
    return title.map(r => ({ text: r[0], options: { color: r[1] ? p.ac : p.t1, breakLine: r[2] === true } }));
  }

  // ========================================================================
  const S = {};

  // ---- 版式 1 · cover 封面(hero 底) ----
  // { kicker, title(runs), titleSize?, subtitle, speaker, tag, notes }
  S.cover = function (o) {
    const p = pal(true);
    const s = newSlide(true);
    if (o.tag) s.addText(o.tag, { x: PW - 4.8, y: 0.55, w: 3.95, h: 0.35,
      fontFace: F.mono, fontSize: 10.5, charSpacing: 2, color: p.t2, align: "right" });
    accentBar(s, MX, 2.95, 0.5, 0.045, p.acF);
    if (o.kicker) s.addText(o.kicker, { x: MX + 0.62, y: 2.76, w: 8.5, h: 0.4,
      fontFace: F.mono, fontSize: 13, charSpacing: 3, color: p.ac, margin: 0 });
    s.addText(o.title ? o.title.map(r => ({ text: r[0], options: { color: r[1] ? p.ac : p.t1, breakLine: r[2] === true } })) : [],
      { x: MX - 0.03, y: 3.25, w: CW, h: 2.0, fontFace: F.title,
        fontSize: o.titleSize || 52, bold: true, margin: 0, lineSpacing: (o.titleSize || 52) * 1.12 });
    if (o.subtitle) s.addText(o.subtitle, { x: MX, y: 5.35, w: 11, h: 0.6,
      fontFace: F.body, fontSize: 20, color: p.t2 });
    s.addShape(pres.shapes.LINE, { x: MX, y: 6.62, w: CW, h: 0, line: { color: p.line, width: 1 } });
    if (o.speaker) s.addText(o.speaker, { x: MX, y: 6.76, w: 7, h: 0.4,
      fontFace: F.body, fontSize: 14, color: p.t2 });
    if (meta.slogan) s.addText(meta.slogan, { x: 6.5, y: 6.78, w: PW - 6.5 - MX, h: 0.35,
      fontFace: F.mono, fontSize: 10.5, color: p.t3, align: "right" });
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 5 · contentRows 编号要点列表(≤5 行) ----
  // { kicker, title, rows:[[no, head, desc]], footnote, page, notes }
  S.contentRows = function (o) {
    const p = pal(false);
    const s = newSlide(false);
    header(s, p, o);
    const rows = o.rows || [];
    const top = 2.15, avail = PH - top - 0.85;
    const gap = 0.18, rh = Math.min(1.05, (avail - gap * (rows.length - 1)) / rows.length);
    rows.forEach((r, i) => {
      const y = top + i * (rh + gap);
      card(s, MX, y, CW, rh);
      accentBar(s, MX, y, 0.05, rh, p.acF);
      s.addText(String(r[0]), { x: MX + 0.28, y, w: 0.95, h: rh, fontFace: F.num,
        fontSize: 22, bold: true, color: p.ac, valign: "middle", margin: 0 });
      s.addText(r[1], { x: MX + 1.3, y, w: 3.9, h: rh, fontFace: F.body,
        fontSize: 16, bold: true, color: p.t1, valign: "middle", margin: 0 });
      if (r[2]) s.addText(r[2], { x: MX + 5.35, y, w: CW - 5.55, h: rh, fontFace: F.body,
        fontSize: 13, color: p.t2, valign: "middle", margin: 0 });
    });
    if (o.footnote) s.addText(o.footnote, { x: MX, y: PH - 0.88, w: CW, h: 0.3,
      fontFace: F.body, fontSize: 12, italic: true, color: p.t3 });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 8 · comparison 对比双面板(Before/After) ----
  // { kicker, title, left:{tag,head,items[],bad?}, right:{tag,head,items[],good?}, page, notes }
  S.comparison = function (o) {
    const p = pal(false);
    const s = newSlide(false);
    header(s, p, o);
    const top = 2.15, h = PH - top - 0.85, w = (CW - 0.4) / 2;
    [[o.left, MX, o.left && o.left.bad ? C.bad : p.t3],
     [o.right, MX + w + 0.4, o.right && o.right.good ? C.good : p.ac]].forEach(([side, x, tagColor]) => {
      if (!side) return;
      card(s, x, top, w, h);
      accentBar(s, x, top, w, 0.055, tagColor);
      if (side.tag) s.addText(side.tag, { x: x + 0.35, y: top + 0.28, w: w - 0.7, h: 0.32,
        fontFace: F.mono, fontSize: 11.5, charSpacing: 2, color: tagColor, margin: 0 });
      if (side.head) s.addText(side.head, { x: x + 0.35, y: top + 0.66, w: w - 0.7, h: 0.55,
        fontFace: F.body, fontSize: 19, bold: true, color: p.t1, margin: 0 });
      const items = (side.items || []).map((t, i) => ({
        text: t, options: { bullet: { characterCode: "2013", indent: 14 }, breakLine: true,
          paraSpaceAfter: 8, color: p.t2 } }));
      if (items.length) s.addText(items, { x: x + 0.35, y: top + 1.35, w: w - 0.7, h: h - 1.7,
        fontFace: F.body, fontSize: 13.5, valign: "top", margin: 0 });
    });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 11 · bigStat 大数字 + 柱状(KPI Tower) ----
  // { kicker, title, stat:{value, unit, label, sub}, bars:[[label, 0-100, highlight?]], page, notes }
  S.bigStat = function (o) {
    const p = pal(false);
    const s = newSlide(false);
    header(s, p, o);
    const top = 2.3;
    if (o.stat) {
      const runs = [{ text: String(o.stat.value), options: { color: p.ac } }];
      if (o.stat.unit) runs.push({ text: " " + o.stat.unit, options: { color: p.ac, fontSize: 28 } });
      s.addText(runs, { x: MX - 0.05, y: top + 0.35, w: 5.3, h: 1.9, fontFace: F.num,
        fontSize: 88, bold: true, margin: 0 });
      if (o.stat.label) s.addText(o.stat.label, { x: MX, y: top + 2.35, w: 5.2, h: 0.5,
        fontFace: F.body, fontSize: 18, bold: true, color: p.t1, margin: 0 });
      if (o.stat.sub) s.addText(o.stat.sub, { x: MX, y: top + 2.9, w: 5.2, h: 0.9,
        fontFace: F.body, fontSize: 13, color: p.t2, margin: 0 });
    }
    const bars = o.bars || [];
    if (bars.length) {
      const bx = 6.7, bw = PW - MX - bx, floor = PH - 1.35, maxH = floor - top - 0.55;
      const cw = Math.min(1.15, (bw - 0.3 * (bars.length - 1)) / bars.length);
      bars.forEach((b, i) => {
        const x = bx + i * (cw + 0.3);
        const bh = Math.max(0.15, maxH * (b[1] / 100));
        s.addShape(pres.shapes.RECTANGLE, { x, y: floor - bh, w: cw, h: bh,
          fill: { color: b[2] ? p.acF : C.border } });
        s.addText(b[0], { x: x - 0.15, y: floor + 0.08, w: cw + 0.3, h: 0.55,
          fontFace: F.body, fontSize: 10.5, color: p.t2, align: "center", margin: 0 });
      });
    }
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 2 · toc 目录(2×3 编号卡片) ----
  // { kicker, title, items:[[no, head, sub?]], page, notes }
  S.toc = function (o) {
    const p = pal(false);
    const s = newSlide(false);
    header(s, p, o);
    const items = o.items || [];
    const cols = items.length <= 4 ? 2 : 3, rows = Math.ceil(items.length / cols);
    const top = 2.25, gap = 0.3;
    const w = (CW - gap * (cols - 1)) / cols;
    const h = Math.min(1.7, ((PH - top - 0.85) - gap * (rows - 1)) / rows);
    items.forEach((it, i) => {
      const x = MX + (i % cols) * (w + gap), y = top + Math.floor(i / cols) * (h + gap);
      card(s, x, y, w, h);
      s.addText(String(it[0]), { x: x + 0.3, y: y + 0.22, w: 1.2, h: 0.5,
        fontFace: F.num, fontSize: 20, bold: true, color: p.ac, margin: 0 });
      s.addText(it[1], { x: x + 0.3, y: y + 0.72, w: w - 0.6, h: 0.5,
        fontFace: F.body, fontSize: 15.5, bold: true, color: p.t1, margin: 0 });
      if (it[2]) s.addText(it[2], { x: x + 0.3, y: y + 1.2, w: w - 0.6, h: h - 1.32,
        fontFace: F.body, fontSize: 11.5, color: p.t2, margin: 0 });
    });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 3 · sectionDivider 章节幕封(hero 底) ----
  // { no:"02", kicker, title(runs), sub, page, notes }
  S.sectionDivider = function (o) {
    const p = pal(true);
    const s = newSlide(true);
    if (o.no != null) s.addText(String(o.no), { x: MX - 0.06, y: 1.35, w: 5, h: 2.2,
      fontFace: F.num, fontSize: 120, bold: true, color: p.ac, margin: 0 });
    accentBar(s, MX, 4.0, 0.5, 0.045, p.acF);
    if (o.kicker) s.addText(o.kicker, { x: MX + 0.62, y: 3.81, w: 9, h: 0.4,
      fontFace: F.mono, fontSize: 13, charSpacing: 3, color: p.ac, margin: 0 });
    s.addText(toRuns(o.title || "", p), { x: MX - 0.03, y: 4.3, w: CW, h: 1.5,
      fontFace: F.title, fontSize: o.titleSize || 44, bold: true, color: p.t1,
      margin: 0, lineSpacing: (o.titleSize || 44) * 1.15 });
    if (o.sub) s.addText(o.sub, { x: MX, y: 5.85, w: 10.5, h: 0.7,
      fontFace: F.body, fontSize: 16, color: p.t2 });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 4 · statement 金句/大字陈述(hero 底) ----
  // { kicker, title(runs), sub, quote?:false, page, notes }
  S.statement = function (o) {
    const p = pal(true);
    const s = newSlide(true);
    kicker(s, p, o.kicker);
    if (o.quote !== false) s.addText("“", { x: MX - 0.1, y: 1.65, w: 2, h: 1.4,
      fontFace: F.num, fontSize: 110, bold: true, color: p.ac, margin: 0 });
    s.addText(toRuns(o.title || "", p), { x: MX, y: o.quote === false ? 2.3 : 2.75, w: CW, h: 2.3,
      fontFace: F.title, fontSize: o.titleSize || 40, bold: true, color: p.t1,
      margin: 0, lineSpacing: (o.titleSize || 40) * 1.3 });
    if (o.sub) {
      accentBar(s, MX, 5.55, 0.55, 0.04, p.acF);
      s.addText(o.sub, { x: MX, y: 5.75, w: 11.4, h: 0.6, fontFace: F.body,
        fontSize: 17, color: p.t2 });
    }
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 6 · twoColumn 双栏(概念 ⟷ 示例) ----
  // { kicker, title, left/right: { head, body?, items?[], mono? }, page, notes }
  S.twoColumn = function (o) {
    const p = pal(false);
    const s = newSlide(false);
    header(s, p, o);
    const top = 2.15, h = PH - top - 0.85, w = (CW - 0.4) / 2;
    [[o.left, MX], [o.right, MX + w + 0.4]].forEach(([side, x]) => {
      if (!side) return;
      card(s, x, top, w, h, side.mono ? { fill: C.t1 } : {});
      const tc = side.mono ? { t1: C.bg, t2: C.bgSoft } : { t1: p.t1, t2: p.t2 };
      if (side.head) s.addText(side.head, { x: x + 0.35, y: top + 0.3, w: w - 0.7, h: 0.5,
        fontFace: F.body, fontSize: 18, bold: true, color: side.mono ? tc.t1 : p.t1, margin: 0 });
      const bodyY = side.head ? top + 0.95 : top + 0.35;
      if (side.body) s.addText(side.body, { x: x + 0.35, y: bodyY, w: w - 0.7, h: h - (bodyY - top) - 0.35,
        fontFace: side.mono ? F.mono : F.body, fontSize: side.mono ? 12 : 13.5,
        color: tc.t2, valign: "top", margin: 0, lineSpacing: side.mono ? 19 : 22 });
      if (side.items && side.items.length) {
        const runs = side.items.map(t => ({ text: t, options: {
          bullet: { characterCode: "2013", indent: 14 }, breakLine: true, paraSpaceAfter: 8, color: tc.t2 } }));
        s.addText(runs, { x: x + 0.35, y: bodyY, w: w - 0.7, h: h - (bodyY - top) - 0.35,
          fontFace: F.body, fontSize: 13.5, valign: "top", margin: 0 });
      }
    });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 7 · threeCards 三卡并列 ----
  // { kicker, title, cards:[{no?, head, desc}], page, notes }
  S.threeCards = function (o) {
    const p = pal(false);
    const s = newSlide(false);
    header(s, p, o);
    const cards = o.cards || [];
    const top = 2.25, gap = 0.35, n = Math.max(cards.length, 1);
    const w = (CW - gap * (n - 1)) / n, h = PH - top - 0.9;
    cards.forEach((cd, i) => {
      const x = MX + i * (w + gap);
      card(s, x, top, w, h);
      accentBar(s, x, top, w, 0.055, p.acF);
      if (cd.no != null) s.addText(String(cd.no), { x: x + 0.32, y: top + 0.32, w: w - 0.64, h: 0.55,
        fontFace: F.num, fontSize: 26, bold: true, color: p.ac, margin: 0 });
      s.addText(cd.head || "", { x: x + 0.32, y: top + (cd.no != null ? 0.95 : 0.35), w: w - 0.64, h: 0.85,
        fontFace: F.body, fontSize: 17, bold: true, color: p.t1, margin: 0 });
      if (cd.desc) s.addText(cd.desc, { x: x + 0.32, y: top + (cd.no != null ? 1.85 : 1.25), w: w - 0.64,
        h: h - (cd.no != null ? 2.2 : 1.6),
        fontFace: F.body, fontSize: 12.5, color: p.t2, valign: "top", margin: 0, lineSpacing: 20 });
    });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 9 · imageText 左文右图 ----
  // { kicker, title, lead, callout:{text, source}, image:{path, caption} | placeholder:"文字", page, notes }
  S.imageText = function (o) {
    const p = pal(false);
    const s = newSlide(false);
    header(s, p, o);
    const top = 2.2, textW = 6.0;
    if (o.lead) s.addText(o.lead, { x: MX, y: top + 0.1, w: textW, h: 1.8,
      fontFace: F.body, fontSize: 15.5, color: p.t2, valign: "top", margin: 0, lineSpacing: 26 });
    if (o.callout) {
      const cy = PH - 2.7;
      accentBar(s, MX, cy, 0.045, 1.35, p.acF);
      s.addText(o.callout.text || "", { x: MX + 0.25, y: cy, w: textW - 0.3, h: 1.0,
        fontFace: F.title, fontSize: 15, italic: true, color: p.t1, valign: "top", margin: 0 });
      if (o.callout.source) s.addText(o.callout.source, { x: MX + 0.25, y: cy + 1.02, w: textW - 0.3, h: 0.35,
        fontFace: F.mono, fontSize: 10.5, color: p.t3, margin: 0 });
    }
    const ix = MX + textW + 0.45, iw = PW - MX - ix, ih = PH - top - 1.35;
    if (o.image && o.image.path) {
      s.addImage({ path: o.image.path, x: ix, y: top, w: iw, h: ih, sizing: { type: "cover", w: iw, h: ih } });
    } else {
      card(s, ix, top, iw, ih, { fill: C.surface, lineColor: C.border });
      s.addText(o.placeholder || "IMAGE", { x: ix, y: top, w: iw, h: ih,
        fontFace: F.mono, fontSize: 13, charSpacing: 2, color: p.t3, align: "center", valign: "middle" });
    }
    const cap = o.image && o.image.caption;
    if (cap) s.addText(cap, { x: ix, y: top + ih + 0.08, w: iw, h: 0.3,
      fontFace: F.mono, fontSize: 10, charSpacing: 1.5, color: p.t3, margin: 0 });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 10 · kpiGrid KPI 卡片(2-4 个) ----
  // { kicker, title, kpis:[{label, value, unit?, delta?, dir?:"up"|"down"|"flat", good?:bool}], page, notes }
  S.kpiGrid = function (o) {
    const p = pal(false);
    const s = newSlide(false);
    header(s, p, o);
    const kpis = o.kpis || [];
    const top = 2.5, gap = 0.35, n = Math.max(kpis.length, 1);
    const w = (CW - gap * (n - 1)) / n, h = Math.min(3.3, PH - top - 1.05);
    kpis.forEach((k, i) => {
      const x = MX + i * (w + gap);
      card(s, x, top, w, h);
      s.addText(k.label || "", { x: x + 0.3, y: top + 0.3, w: w - 0.6, h: 0.35,
        fontFace: F.mono, fontSize: 11, charSpacing: 1.5, color: p.t3, margin: 0 });
      const runs = [{ text: String(k.value), options: { color: p.t1 } }];
      if (k.unit) runs.push({ text: " " + k.unit, options: { color: p.t2, fontSize: 16 } });
      s.addText(runs, { x: x + 0.28, y: top + 0.85, w: w - 0.56, h: 1.15,
        fontFace: F.num, fontSize: 40, bold: true, margin: 0 });
      if (k.delta) {
        const dirColor = k.good === false ? C.bad : k.good ? C.good : p.t2;
        const arrow = k.dir === "down" ? "↓ " : k.dir === "flat" ? "→ " : "↑ ";
        s.addText(arrow + k.delta, { x: x + 0.3, y: top + h - 0.65, w: w - 0.6, h: 0.4,
          fontFace: F.body, fontSize: 13, bold: true, color: dirColor, margin: 0 });
      }
    });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 12 · timeline 横向时间线(3-6 节点) ----
  // { kicker, title, nodes:[{tag, head, desc, done?}], page, notes }
  S.timeline = function (o) {
    const p = pal(false);
    const s = newSlide(false);
    header(s, p, o);
    const nodes = o.nodes || [];
    const n = Math.max(nodes.length, 1);
    const lineY = 3.35, step = CW / n;
    s.addShape(pres.shapes.LINE, { x: MX, y: lineY, w: CW - step + step / 2, h: 0,
      line: { color: C.border, width: 2 } });
    nodes.forEach((nd, i) => {
      const cx = MX + i * step + step / 2;
      s.addShape(pres.shapes.OVAL, { x: cx - 0.09, y: lineY - 0.09, w: 0.18, h: 0.18,
        fill: { color: nd.done === false ? C.border : p.acF } });
      if (nd.tag) s.addText(nd.tag, { x: cx - step / 2 + 0.1, y: lineY - 0.62, w: step - 0.2, h: 0.32,
        fontFace: F.mono, fontSize: 10.5, charSpacing: 1.5, color: p.ac, align: "center", margin: 0 });
      s.addText(nd.head || "", { x: cx - step / 2 + 0.1, y: lineY + 0.28, w: step - 0.2, h: 0.55,
        fontFace: F.body, fontSize: 14.5, bold: true, color: p.t1, align: "center", margin: 0 });
      if (nd.desc) s.addText(nd.desc, { x: cx - step / 2 + 0.15, y: lineY + 0.9, w: step - 0.3, h: 2.2,
        fontFace: F.body, fontSize: 11.5, color: p.t2, align: "center", valign: "top", margin: 0, lineSpacing: 18 });
    });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 13 · table 数据表格 ----
  // { kicker, title, headers:[], rows:[[]], source, page, notes, colW?:[] }
  S.table = function (o) {
    const p = pal(false);
    const s = newSlide(false);
    header(s, p, o);
    const headers = (o.headers || []).map(t => ({ text: t, options: {
      fontFace: F.body, fontSize: 12.5, bold: true, color: pal(true).t1, fill: { color: C.hero },
      valign: "middle", margin: 6 } }));
    // 数字/代码类单元格右对齐,文本左对齐
    const numeric = t => /^[0-9#$¥€+\-.]/.test(String(t).trim());
    const rows = (o.rows || []).map((r, ri) => r.map((cell, ci) => ({ text: String(cell), options: {
      fontFace: F.body, fontSize: 12, color: ci === 0 ? p.t1 : p.t2, bold: ci === 0,
      fill: { color: ri % 2 ? C.surface : C.bg }, valign: "middle", margin: 6,
      align: ci > 0 && numeric(cell) ? "right" : "left" } })));
    s.addTable([headers, ...rows], {
      x: MX, y: 2.25, w: CW, colW: o.colW,
      border: { type: "solid", pt: 0.5, color: C.border }, autoPage: false,
    });
    if (o.source) s.addText("来源: " + o.source, { x: MX, y: PH - 0.88, w: CW, h: 0.3,
      fontFace: F.mono, fontSize: 10, color: p.t3, margin: 0 });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 14 · processSteps 编号步骤卡(3-5 步,带箭头) ----
  // { kicker, title, steps:[{head, desc}], page, notes }
  S.processSteps = function (o) {
    const p = pal(false);
    const s = newSlide(false);
    header(s, p, o);
    const steps = o.steps || [];
    const top = 2.5, n = Math.max(steps.length, 1), arrowW = 0.42;
    const w = (CW - arrowW * (n - 1)) / n, h = PH - top - 1.2;
    steps.forEach((st, i) => {
      const x = MX + i * (w + arrowW);
      card(s, x, top, w, h);
      accentBar(s, x, top, w, 0.055, p.acF);
      s.addText(String(i + 1).padStart(2, "0"), { x: x + 0.28, y: top + 0.3, w: w - 0.56, h: 0.55,
        fontFace: F.num, fontSize: 24, bold: true, color: p.ac, margin: 0 });
      s.addText(st.head || "", { x: x + 0.28, y: top + 0.95, w: w - 0.56, h: 0.8,
        fontFace: F.body, fontSize: 15, bold: true, color: p.t1, margin: 0 });
      if (st.desc) s.addText(st.desc, { x: x + 0.28, y: top + 1.8, w: w - 0.56, h: h - 2.15,
        fontFace: F.body, fontSize: 11.5, color: p.t2, valign: "top", margin: 0, lineSpacing: 18 });
      if (i < n - 1) s.addText("→", { x: x + w - 0.04, y: top + h / 2 - 0.25, w: arrowW + 0.08, h: 0.5,
        fontFace: F.body, fontSize: 18, bold: true, color: p.t3, align: "center", valign: "middle", margin: 0 });
    });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- 版式 15 · closing 收束页(hero 底) ----
  // { kicker, title(runs), sub, cta, page, notes }
  S.closing = function (o) {
    const p = pal(true);
    const s = newSlide(true);
    if (o.kicker) s.addText(o.kicker, { x: MX, y: 1.7, w: CW, h: 0.4, fontFace: F.mono,
      fontSize: 13, charSpacing: 3, color: p.ac, align: "center", margin: 0 });
    s.addText(o.title ? o.title.map(r => ({ text: r[0], options: { color: r[1] ? p.ac : p.t1, breakLine: r[2] === true } })) : [],
      { x: MX, y: 2.5, w: CW, h: 1.9, fontFace: F.title, fontSize: o.titleSize || 44,
        bold: true, align: "center", margin: 0, lineSpacing: (o.titleSize || 44) * 1.2 });
    if (o.sub) s.addText(o.sub, { x: 2.2, y: 4.6, w: PW - 4.4, h: 0.8, fontFace: F.body,
      fontSize: 17, color: p.t2, align: "center" });
    if (o.cta) {
      const cw2 = Math.max(2.6, o.cta.length * 0.22 + 1);
      card(s, (PW - cw2) / 2, 5.6, cw2, 0.62, { fill: p.acF });
      s.addText(o.cta, { x: (PW - cw2) / 2, y: 5.6, w: cw2, h: 0.62, fontFace: F.body,
        fontSize: 15, bold: true, color: p.bg, align: "center", valign: "middle", margin: 0 });
    }
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  return {
    pres, S, T, C, F,
    save: fileName => pres.writeFile({ fileName }),
  };
}

module.exports = { createDeck, listThemes, THEMES };
