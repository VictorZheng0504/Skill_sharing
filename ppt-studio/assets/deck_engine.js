/**
 * deck_engine.js — ppt-studio v2 通用版式引擎(版式 DNA 架构)
 * 依赖: pptxgenjs   ( npm i pptxgenjs )
 *
 * v2 核心变化:主题不再只是配色——每个主题携带一份「版式 DNA」:
 *   - themes.json 的 layout 块:header/list/footer/num/align/scale(内容页排版词汇)
 *   - deck_styles.js:每主题专属的 5 个 hero 构图(cover/divider/statement/closing/bigstat)
 *   任意两个主题并排,排版构图可辨识地不同,而不只是换色。
 *
 * 对外 API 与 v1 完全一致:
 *   const { createDeck, listThemes } = require("./deck_engine");
 *   const d = createDeck("mckinsey", { title, author, footer, slogan, source });
 *   d.S.cover({...}); d.S.contentRows({...}); ... await d.save("out.pptx");
 *
 * 约定:富文本标题 [[文字, 强调?, 换行?], ...];所有版式接受 page 与 notes;颜色不带 #。
 */
const pptxgen = require("pptxgenjs");
const path = require("path");
const THEMES = require(path.join(__dirname, "themes.json"));
const STYLES = require(path.join(__dirname, "deck_styles.js"));

const PW = 13.333, PH = 7.5, MX = 0.85, CW = PW - MX * 2;

function listThemes() {
  return Object.entries(THEMES).map(([k, v]) => ({ id: k, label: v.label, scene: v.scene, persona: (v.layout || {}).persona }));
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function createDeck(themeName, meta = {}) {
  const T = THEMES[themeName];
  if (!T) throw new Error(`未知主题 "${themeName}"。可选: ${Object.keys(THEMES).join(", ")}`);
  const C = T.c, F = T.f, R = T.radius || 0, L = T.layout || {};

  const pres = new pptxgen();
  pres.defineLayout({ name: "W169", width: PW, height: PH });
  pres.layout = "W169";
  if (meta.author) pres.author = meta.author;
  if (meta.title) pres.title = meta.title;
  const FOOTER = meta.footer || "";

  const pal = hero => hero
    ? { bg: C.hero, t1: C.heroT1, t2: C.heroT2, t3: C.heroT2,
        ac: C.heroAccent, acF: C.heroAccentFill || C.heroAccent, line: C.heroLine }
    : { bg: C.bg, t1: C.t1, t2: C.t2, t3: C.t3,
        ac: C.accent, acF: C.accentFill || C.accent, line: C.border };

  const sc = n => Math.round(n * (L.scale || 1) * 10) / 10;
  const TRI = pres.shapes.TRIANGLE || pres.shapes.ISOCELES_TRIANGLE || "triangle";

  // ---------- 文本度量(防溢出的基础) ----------
  // 宽度估算(英寸):CJK 全角 ≈ 1em,其余 ≈ 0.55em;ls = charSpacing(pt/字符)
  const CJK_RE = /[⺀-鿿　-〿豈-﫿＀-￠]/;
  const estW = (t, fs, ls) => {
    const str = String(t == null ? "" : t);
    let w = 0;
    for (const ch of str) w += CJK_RE.test(ch) ? fs : fs * 0.55;
    return (w + (ls || 0) * str.length) / 72;
  };
  // 折行数估算:runs 数组按 breakLine 分组,字符串按 \n 分段,每段按框宽折行
  const estLines = (t, w, fs, ls) => {
    const groups = [];
    if (Array.isArray(t)) {
      let cur = "";
      t.forEach(r => { cur += r.text != null ? r.text : ""; if (r.options && r.options.breakLine) { groups.push(cur); cur = ""; } });
      groups.push(cur);
    } else String(t == null ? "" : t).split("\n").forEach(g => groups.push(g));
    return groups.reduce((n, g) => n + Math.max(1, Math.ceil(estW(g, fs, ls) / Math.max(w, 0.1))), 0);
  };

  // ---------- 绘制原语 ----------
  // txt 内置多行溢出自动缩字:折行数超出框高容量才触发(单行文本永不缩,
  // 保护幽灵编号等故意视觉溢出的装饰大字);下限 55% 防不可读;传 fit:false 可豁免。
  const txt = (s, t, o) => {
    let fs = o.fs || sc(14), lh = o.lh;
    if (o.fit !== false && o.w && o.h) {
      const fs0 = fs;
      const lineH = f => (o.lh ? o.lh * (f / fs0) : f * 1.2) / 72;
      let L = estLines(t, o.w, fs, o.ls);
      if (L > 1 && L * lineH(fs) > o.h + 0.02) {
        const min = fs0 * 0.55;
        while (fs > min && L * lineH(fs) > o.h + 0.02) {
          fs *= 0.93;
          L = estLines(t, o.w, fs, o.ls);
        }
        fs = Math.round(fs * 10) / 10;
        if (o.lh) lh = Math.round(o.lh * (fs / fs0) * 10) / 10;
      }
    }
    return s.addText(t, {
      x: o.x, y: o.y, w: o.w, h: o.h,
      fontFace: o.font || F.body, fontSize: fs, color: o.color,
      bold: o.bold, italic: o.italic, align: o.align, valign: o.valign,
      charSpacing: o.ls, lineSpacing: lh, rotate: o.rotate,
      margin: o.margin !== undefined ? o.margin : 0,
    });
  };
  const box = (s, o) => s.addShape(o.round ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    rectRadius: o.round ? (o.r != null ? o.r : (R || 0.06)) : undefined,
    fill: o.fill ? { color: o.fill, transparency: o.alpha } : { type: "none" },
    line: o.line ? { color: o.line, width: o.lw || 1, dashType: o.dash } : { type: "none" },
    rotate: o.rotate,
  });
  const oval = (s, o) => s.addShape(pres.shapes.OVAL, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: o.fill ? { color: o.fill } : { type: "none" },
    line: o.line ? { color: o.line, width: o.lw || 1 } : { type: "none" },
  });
  const tri = (s, o) => s.addShape(TRI, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: o.fill ? { color: o.fill } : { type: "none" }, line: { type: "none" }, rotate: o.rotate,
  });
  const lineH = (s, x, y, w, color, pt = 1, dash) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: pt, dashType: dash } });
  const lineV = (s, x, y, h, color, pt = 1, dash) => s.addShape(pres.shapes.LINE, { x, y, w: 0, h, line: { color, width: pt, dashType: dash } });

  const runs = (title, p) => typeof title === "string"
    ? [{ text: title, options: { color: p.t1 } }]
    : (title || []).map(r => ({ text: r[0], options: { color: r[1] ? p.ac : p.t1, breakLine: r[2] === true } }));

  function newSlide(hero) {
    const s = pres.addSlide();
    s.background = { color: pal(hero).bg };
    return s;
  }

  // 网格底纹:仅含 c.grid 令牌的主题启用(vic-medical 签名;40px≈0.556in,颜色已按低透明度预混进令牌)
  const gridBg = s => {
    if (!C.grid) return;
    const g = 0.556;
    for (let gx = g; gx < PW - 0.01; gx += g) lineV(s, gx, 0, PH, C.grid, 0.75);
    for (let gy = g; gy < PH - 0.01; gy += g) lineH(s, 0, gy, PW, C.grid, 0.75);
  };

  // ---------- 编号形态(num DNA) ----------
  // 在 (x,y) 处画第 i 项(从 0 起)的编号,占位约 size×size。返回横向占用宽度。
  function drawIndex(s, p, i, x, y, size = 0.44, given) {
    const n = given != null ? String(given) : String(i + 1).padStart(2, "0");
    const fsz = size * 46;
    switch (L.num) {
      case "none": return 0;
      case "dot":
        txt(s, (i + 1) + ".", { x, y, w: size + 0.1, h: size, font: F.num, fs: fsz * 0.8, bold: true, color: p.t2, valign: "middle" });
        return size + 0.12;
      case "serif":
        txt(s, n, { x, y, w: size + 0.25, h: size, font: F.num, fs: fsz, bold: true, color: p.ac, valign: "middle" });
        return size + 0.3;
      case "roman":
        txt(s, ROMAN[i] || n, { x, y, w: size + 0.3, h: size, font: F.num, fs: fsz * 0.72, italic: true, color: p.t3, valign: "middle" });
        return size + 0.32;
      case "mono":
        txt(s, n, { x, y, w: size + 0.2, h: size, font: F.mono, fs: fsz * 0.78, color: p.ac, valign: "middle" });
        return size + 0.24;
      case "bracket":
        txt(s, "[" + (i + 1) + "]", { x, y, w: size + 0.3, h: size, font: F.mono, fs: fsz * 0.7, color: p.ac, valign: "middle" });
        return size + 0.34;
      case "circle":
        oval(s, { x, y: y + 0.02, w: size, h: size, line: p.ac, lw: 1.4 });
        txt(s, String(i + 1), { x, y: y + 0.02, w: size, h: size, font: F.num, fs: fsz * 0.55, bold: true, color: p.ac, align: "center", valign: "middle" });
        return size + 0.18;
      case "sticker":
        box(s, { x: x + 0.05, y: y + 0.07, w: size, h: size, fill: "0A0A0A" });
        box(s, { x, y: y + 0.02, w: size, h: size, fill: p.acF, line: "0A0A0A", lw: 1.5 });
        txt(s, String(i + 1), { x, y: y + 0.02, w: size, h: size, fs: fsz * 0.6, bold: true, color: "0A0A0A", align: "center", valign: "middle" });
        return size + 0.22;
      case "big":
        txt(s, n, { x, y: y - 0.08, w: size + 0.5, h: size + 0.2, font: F.num, fs: fsz * 1.35, bold: true, color: p.acF, valign: "middle" });
        return size + 0.55;
      case "geo": {
        const kind = i % 3, cols = [C.accentFill || C.accent, C.accent2, C.warn];
        if (kind === 0) oval(s, { x, y: y + 0.02, w: size, h: size, fill: cols[0] });
        else if (kind === 1) box(s, { x, y: y + 0.02, w: size, h: size, fill: cols[1] });
        else tri(s, { x, y: y + 0.02, w: size, h: size, fill: cols[2] });
        txt(s, String(i + 1), { x, y: y + (kind === 2 ? 0.1 : 0.02), w: size, h: size, fs: fsz * 0.5, bold: true, color: kind === 2 ? "1A1A1A" : "FFFFFF", align: "center", valign: "middle" });
        return size + 0.2;
      }
      case "tabular":
        txt(s, n, { x, y, w: size + 0.15, h: size, font: F.num, fs: fsz * 0.75, bold: true, color: p.t3, valign: "middle" });
        return size + 0.2;
      default: // plain
        txt(s, n, { x, y, w: size + 0.15, h: size, font: F.num, fs: fsz * 0.85, bold: true, color: p.ac, valign: "middle" });
        return size + 0.22;
    }
  }

  // ---------- 条目容器(list DNA → 容器语言) ----------
  const CONTAINER_OF = {
    cards: "softCard", pillCards: "pillCard", shadowCards: "shadowBox",
    hairline: "ruleTop", leader: "ruleTop", circledHair: "ruleTop", dashedDots: "dashTop",
    circledDashed: "dashTop", rightNums: "ruleTop", paragraphs: "none",
    bareRows: "none", airyRows: "none", centerLines: "none", centerThin: "none",
    dataRows: "panel", lineNumbers: "panel", outputRows: "none", colorTicks: "panel",
    squareGrid: "panel", bigDots: "panel", stepTimeline: "panel", geoShapes: "panel",
    edgeCards: "edgeCard",
  };
  function itemBox(s, p, x, y, w, h, i) {
    switch (CONTAINER_OF[L.list] || "softCard") {
      case "softCard": box(s, { x, y, w, h, fill: C.surface, round: R > 0 }); break;
      case "pillCard": box(s, { x, y, w, h, fill: i % 2 ? C.bgSoft : C.surface, round: true, r: Math.min(0.16, h / 3) }); break;
      case "shadowBox":
        box(s, { x: x + 0.09, y: y + 0.09, w, h, fill: "0A0A0A" });
        box(s, { x, y, w, h, fill: C.bg, line: "0A0A0A", lw: 2 }); break;
      case "ruleTop": lineH(s, x, y, w, p.line, 1.4); break;
      case "dashTop": lineH(s, x, y, w, p.t3, 1.2, "dash"); break;
      case "panel": box(s, { x, y, w, h, fill: C.surface }); break;
      case "edgeCard":
        box(s, { x, y, w, h, fill: C.surface, round: R > 0 });
        box(s, { x, y: y + 0.04, w: 0.045, h: h - 0.08, fill: p.ac });
        break;
      case "none": default: break;
    }
  }

  // ---------- 页眉(header DNA)fn(s,p,o) → contentTop ----------
  const HEADERS = {
    thickThin(s, p, o) {
      if (o.kicker) txt(s, o.kicker, { x: MX, y: 0.5, w: CW, h: 0.32, font: F.num, fs: sc(12), ls: 3, color: p.t3 });
      txt(s, runs(o.title, p), { x: MX, y: 0.9, w: CW, h: 0.85, font: F.title, fs: o.titleSize || sc(32), bold: true });
      lineH(s, MX, 1.88, CW, p.ac, 2.4); lineH(s, MX, 1.95, CW, p.line, 0.8);
      return 2.3;
    },
    blackTick(s, p, o) {
      box(s, { x: MX, y: 0.6, w: 0.55, h: 0.09, fill: p.t1 });
      if (o.kicker) txt(s, o.kicker, { x: PW - 5.2, y: 0.55, w: 4.35, h: 0.3, font: F.mono, fs: sc(10.5), ls: 2, color: p.t3, align: "right" });
      txt(s, runs(o.title, p), { x: MX, y: 0.95, w: CW, h: 0.95, font: F.title, fs: o.titleSize || sc(36), bold: true });
      return 2.3;
    },
    sidebar(s, p, o) {
      box(s, { x: 0, y: 0, w: 0.3, h: PH, fill: p.acF });
      if (o.kicker) txt(s, o.kicker, { x: MX, y: 0.58, w: CW, h: 0.32, font: F.mono, fs: sc(12), ls: 2.5, color: p.ac });
      txt(s, runs(o.title, p), { x: MX, y: 0.98, w: CW, h: 0.9, font: F.title, fs: o.titleSize || sc(33), bold: true });
      return 2.2;
    },
    topbar(s, p, o) {
      if (o.kicker) txt(s, o.kicker, { x: MX, y: 0.26, w: 9, h: 0.3, font: F.body, fs: sc(11), ls: 2, color: p.t3 });
      if (o.page != null) txt(s, String(o.page), { x: PW - 1.6, y: 0.26, w: 0.75, h: 0.3, font: F.num, fs: sc(11), color: p.t3, align: "right" });
      lineH(s, MX, 0.62, CW, p.t1, 1.1);
      txt(s, runs(o.title, p), { x: MX, y: 0.82, w: CW, h: 1.3, font: F.title, fs: o.titleSize || sc(25), bold: true, lh: sc(25) * 1.25 });
      return 2.35;
    },
    pill(s, p, o) {
      if (o.kicker) {
        const w = Math.max(1.4, o.kicker.length * 0.16 + 0.5);
        box(s, { x: MX, y: 0.52, w, h: 0.38, fill: C.surface, round: true, r: 0.19 });
        txt(s, o.kicker, { x: MX, y: 0.52, w, h: 0.38, font: F.mono, fs: sc(10.5), ls: 1.5, color: p.ac, align: "center", valign: "middle" });
      }
      txt(s, runs(o.title, p), { x: MX, y: 1.05, w: CW, h: 0.9, font: F.title, fs: o.titleSize || sc(32), bold: true });
      return 2.25;
    },
    filters(s, p, o) {
      txt(s, runs(o.title, p), { x: MX, y: 0.55, w: 8.2, h: 0.75, font: F.title, fs: o.titleSize || sc(28), bold: true });
      const tags = (o.kicker || "").split("·").map(t0 => t0.trim()).filter(Boolean).slice(0, 3);
      let tx = PW - MX;
      tags.reverse().forEach(tag => {
        const w = Math.max(1.0, tag.length * 0.16 + 0.42); tx -= w + 0.18;
        box(s, { x: tx, y: 0.6, w, h: 0.36, fill: C.surface, line: p.line, lw: 1, round: true, r: 0.18 });
        txt(s, tag, { x: tx, y: 0.6, w, h: 0.36, font: F.mono, fs: sc(9.5), color: p.t2, align: "center", valign: "middle" });
      });
      lineH(s, MX, 1.35, CW, p.line, 1);
      return 1.75;
    },
    chrome(s, p, o) {
      txt(s, o.kicker || "", { x: MX, y: 0.32, w: 7, h: 0.3, font: F.mono, fs: sc(10), ls: 2.5, color: p.t2 });
      txt(s, (FOOTER || meta.title || ""), { x: PW - 5.5, y: 0.32, w: 5.5 - MX, h: 0.3, font: F.mono, fs: sc(10), ls: 2, color: p.t3, align: "right" });
      lineH(s, MX, 0.7, CW, p.t1, 1);
      txt(s, runs(o.title, p), { x: MX, y: 0.92, w: CW, h: 1.0, font: F.title, fs: o.titleSize || sc(34), bold: true });
      return 2.35;
    },
    rightAlign(s, p, o) {
      if (o.kicker) txt(s, o.kicker, { x: MX, y: 0.6, w: 5, h: 0.3, font: F.mono, fs: sc(10.5), ls: 2.5, color: p.t3 });
      txt(s, runs(o.title, p), { x: MX, y: 0.95, w: CW, h: 0.95, font: F.title, fs: o.titleSize || sc(33), bold: true, align: "right" });
      lineH(s, PW - MX - 3.2, 2.02, 3.2, p.ac, 2);
      return 2.35;
    },
    tape(s, p, o) {
      if (o.kicker) {
        const w = Math.max(2, o.kicker.length * 0.2 + 0.7);
        box(s, { x: MX - 0.12, y: 0.5, w, h: 0.44, fill: C.accent2, alpha: 62, rotate: -2 });
        txt(s, o.kicker, { x: MX, y: 0.52, w, h: 0.4, font: F.mono, fs: sc(11), ls: 2, color: p.t1, valign: "middle" });
      }
      txt(s, runs(o.title, p), { x: MX, y: 1.08, w: CW, h: 0.9, font: F.title, fs: o.titleSize || sc(32), bold: true });
      return 2.3;
    },
    thinRoman(s, p, o) {
      txt(s, ROMAN[(parseInt(o.page, 10) || 1) - 1] || "", { x: PW - 2.1, y: 0.5, w: 1.25, h: 0.5, font: F.num, fs: sc(20), italic: true, color: p.t3, align: "right" });
      txt(s, runs(o.title, p), { x: MX, y: 0.72, w: CW - 1.6, h: 1.1, font: F.title, fs: o.titleSize || sc(38), bold: false });
      lineH(s, MX, 2.05, CW, p.t1, 0.8);
      if (o.kicker) txt(s, o.kicker, { x: MX, y: 2.14, w: CW, h: 0.3, font: F.mono, fs: sc(9.5), ls: 3, color: p.t3 });
      return 2.6;
    },
    ghostNum(s, p, o) {
      txt(s, String(o.page || "01"), { x: MX - 0.15, y: 0.05, w: 4.5, h: 2.2, font: F.num, fs: sc(105), bold: true, color: "E4E4E0" });
      if (o.kicker) txt(s, o.kicker, { x: MX, y: 0.62, w: CW, h: 0.32, font: F.mono, fs: sc(11.5), ls: 3, color: p.ac });
      txt(s, runs(o.title, p), { x: MX, y: 1.1, w: CW, h: 1.0, font: F.title, fs: o.titleSize || sc(37), bold: true });
      return 2.45;
    },
    blockTag(s, p, o) {
      box(s, { x: MX, y: 1.02, w: 0.36, h: 0.36, fill: p.acF });
      if (o.kicker) txt(s, o.kicker, { x: MX, y: 0.55, w: CW, h: 0.3, font: F.mono, fs: sc(11), ls: 2.5, color: p.t2 });
      txt(s, runs(o.title, p), { x: MX + 0.55, y: 0.92, w: CW - 0.55, h: 0.85, font: F.title, fs: o.titleSize || sc(33), bold: true });
      return 2.3;
    },
    stepBand(s, p, o) {
      box(s, { x: 0, y: 0, w: PW, h: 0.14, fill: p.acF });
      if (o.kicker) txt(s, o.kicker, { x: MX, y: 0.5, w: CW, h: 0.32, font: F.mono, fs: sc(12), ls: 3, color: p.ac, bold: true });
      txt(s, runs(o.title, p), { x: MX, y: 0.95, w: CW, h: 0.9, font: F.title, fs: o.titleSize || sc(34), bold: true });
      return 2.3;
    },
    lineNo(s, p, o) {
      txt(s, String(o.page || "00"), { x: 0.18, y: 0.62, w: 0.5, h: 0.32, font: F.mono, fs: sc(11), color: p.t3, align: "right" });
      if (o.kicker) txt(s, "// " + o.kicker, { x: MX, y: 0.6, w: CW, h: 0.32, font: F.mono, fs: sc(12), ls: 1.5, color: C.accent2 });
      txt(s, runs(o.title, p), { x: MX, y: 1.0, w: CW, h: 0.9, font: F.title, fs: o.titleSize || sc(33), bold: true });
      return 2.25;
    },
    tridot(s, p, o) {
      [C.accent, C.accent2, C.good].forEach((c0, i) => oval(s, { x: MX + i * 0.24, y: 0.64, w: 0.14, h: 0.14, fill: c0 }));
      if (o.kicker) txt(s, o.kicker, { x: MX + 0.85, y: 0.56, w: CW - 0.85, h: 0.3, font: F.mono, fs: sc(11), ls: 2, color: p.t3 });
      txt(s, runs(o.title, p), { x: MX, y: 1.0, w: CW, h: 0.9, font: F.title, fs: o.titleSize || sc(33), bold: true });
      return 2.25;
    },
    prompt(s, p, o) {
      if (o.kicker) txt(s, [{ text: "$ ", options: { color: p.ac, bold: true } }, { text: o.kicker, options: { color: p.t2 } }],
        { x: MX, y: 0.52, w: CW, h: 0.32, font: F.mono, fs: sc(12.5) });
      txt(s, [{ text: "> ", options: { color: p.ac } }].concat(runs(o.title, p)),
        { x: MX, y: 0.95, w: CW, h: 0.85, font: F.title, fs: o.titleSize || sc(28), bold: true });
      box(s, { x: MX + 0.02, y: 1.85, w: 0.28, h: 0.1, fill: p.ac });
      return 2.35;
    },
    lecture(s, p, o) {
      if (o.kicker) {
        const w = Math.max(1.5, o.kicker.length * 0.2 + 0.55);
        box(s, { x: MX, y: 0.5, w, h: 0.42, line: p.ac, lw: 1.4 });
        txt(s, o.kicker, { x: MX, y: 0.5, w, h: 0.42, font: F.title, fs: sc(11.5), bold: true, color: p.ac, align: "center", valign: "middle" });
      }
      txt(s, runs(o.title, p), { x: MX, y: 1.08, w: CW, h: 0.9, font: F.title, fs: o.titleSize || sc(32), bold: true });
      lineH(s, MX, 2.12, CW, p.t3, 1.1, "dash");
      return 2.4;
    },
    dotTrail(s, p, o) {
      [0.16, 0.12, 0.09, 0.12, 0.16].forEach((d, i) => oval(s, { x: MX + i * 0.28, y: 0.66 - d / 2 + 0.08, w: d, h: d, fill: i % 2 ? C.accent2 : (C.accentFill || C.accent) }));
      if (o.kicker) txt(s, o.kicker, { x: MX + 1.7, y: 0.55, w: CW - 1.7, h: 0.3, fs: sc(11), ls: 1.5, color: p.t3 });
      txt(s, runs(o.title, p), { x: MX, y: 1.0, w: CW, h: 0.9, font: F.title, fs: o.titleSize || sc(32), bold: true });
      return 2.25;
    },
    boxed(s, p, o) {
      if (o.kicker) {
        const w = Math.max(1.6, o.kicker.length * 0.18 + 0.5);
        box(s, { x: MX + 0.06, y: 0.48, w, h: 0.36, fill: "0A0A0A" });
        box(s, { x: MX, y: 0.42, w, h: 0.36, fill: p.acF, line: "0A0A0A", lw: 1.6 });
        txt(s, o.kicker, { x: MX, y: 0.42, w, h: 0.36, font: F.mono, fs: sc(10), bold: true, color: "0A0A0A", align: "center", valign: "middle" });
      }
      box(s, { x: MX + 0.1, y: 1.15, w: CW, h: 0.92, fill: "0A0A0A" });
      box(s, { x: MX, y: 1.05, w: CW, h: 0.92, fill: C.bg, line: "0A0A0A", lw: 2.2 });
      txt(s, runs(o.title, p), { x: MX + 0.3, y: 1.05, w: CW - 0.6, h: 0.92, font: F.title, fs: o.titleSize || sc(29), bold: true, valign: "middle" });
      return 2.55;
    },
    geoLead(s, p, o) {
      const pg = parseInt(o.page, 10) || 1, kind = pg % 3, cols = [C.accentFill || C.accent, C.accent2, C.warn];
      if (kind === 0) oval(s, { x: MX, y: 0.92, w: 0.55, h: 0.55, fill: cols[0] });
      else if (kind === 1) box(s, { x: MX, y: 0.92, w: 0.55, h: 0.55, fill: cols[1] });
      else tri(s, { x: MX, y: 0.92, w: 0.58, h: 0.55, fill: cols[2] });
      if (o.kicker) txt(s, o.kicker, { x: MX, y: 0.5, w: CW, h: 0.3, font: F.mono, fs: sc(10.5), ls: 2.5, color: p.t2 });
      txt(s, runs(o.title, p), { x: MX + 0.8, y: 0.95, w: CW - 0.8, h: 0.85, font: F.title, fs: o.titleSize || sc(32), bold: true });
      return 2.35;
    },
    edgeTitle(s, p, o) {
      gridBg(s);
      if (o.kicker) txt(s, "// " + o.kicker, { x: MX, y: 0.44, w: CW, h: 0.3, font: F.mono, fs: sc(12), ls: 2, color: p.ac });
      box(s, { x: MX, y: 0.86, w: 0.055, h: 0.46, fill: p.ac });
      txt(s, runs(o.title, p), { x: MX + 0.24, y: 0.79, w: CW - 0.24, h: 0.62, font: F.title, fs: o.titleSize || sc(29), bold: true });
      return 1.62;
    },
    centerNone(s, p, o) {
      if (o.kicker) txt(s, o.kicker, { x: MX, y: 0.85, w: CW, h: 0.35, fs: sc(12), ls: 3, color: p.t3, align: "center" });
      txt(s, runs(o.title, p), { x: MX, y: 1.3, w: CW, h: 1.0, font: F.title, fs: o.titleSize || sc(34), bold: true, align: "center" });
      return 2.85;
    },
  };

  // ---------- 页脚(footer DNA) ----------
  const FOOTERS = {
    minimal(s, p, page) {
      if (FOOTER) txt(s, FOOTER, { x: MX, y: PH - 0.5, w: 7, h: 0.3, font: F.mono, fs: sc(10.5), ls: 1, color: p.t3 });
      if (page != null) txt(s, String(page), { x: PW - 1.5, y: PH - 0.5, w: 0.65, h: 0.3, font: F.mono, fs: sc(10.5), color: p.t3, align: "right" });
    },
    pageOnly(s, p, page) {
      if (page != null) txt(s, String(page), { x: PW - 1.4, y: PH - 0.52, w: 0.55, h: 0.3, font: F.num, fs: sc(11), color: p.t3, align: "right" });
    },
    centerPage(s, p, page) {
      if (page != null) txt(s, String(page), { x: PW / 2 - 1, y: PH - 0.52, w: 2, h: 0.3, font: F.num, fs: sc(11), color: p.t3, align: "center" });
    },
    source(s, p, page) {
      txt(s, "资料来源: " + (meta.source || FOOTER || "内部分析"), { x: MX, y: PH - 0.48, w: 9, h: 0.3, fs: sc(9.5), color: p.t3 });
    },
    folio(s, p, page) {
      if (page != null) txt(s, "— " + page + " —", { x: PW / 2 - 1.2, y: PH - 0.55, w: 2.4, h: 0.32, font: F.num, fs: sc(11), italic: true, color: p.t2, align: "center" });
    },
    folioRight(s, p, page) {
      if (page != null) txt(s, page + " ·", { x: PW - 2, y: PH - 0.55, w: 1.15, h: 0.32, font: F.num, fs: sc(11.5), italic: true, color: p.t2, align: "right" });
      if (FOOTER) txt(s, FOOTER, { x: MX, y: PH - 0.52, w: 6, h: 0.3, font: F.mono, fs: sc(9), ls: 1.5, color: p.t3 });
    },
    statusbar(s, p, page) {
      box(s, { x: 0, y: PH - 0.42, w: PW, h: 0.42, fill: C.surface });
      txt(s, FOOTER || "数据看板", { x: MX, y: PH - 0.42, w: 8, h: 0.42, font: F.mono, fs: sc(9.5), color: p.t2, valign: "middle" });
      if (page != null) txt(s, "第 " + page + " 页", { x: PW - 2.2, y: PH - 0.42, w: 1.35, h: 0.42, font: F.mono, fs: sc(9.5), color: p.t2, align: "right", valign: "middle" });
    },
    swissBlock(s, p, page) {
      if (page != null) {
        box(s, { x: PW - 1.05, y: PH - 0.75, w: 0.5, h: 0.44, fill: C.t1 });
        txt(s, String(page), { x: PW - 1.05, y: PH - 0.75, w: 0.5, h: 0.44, font: F.num, fs: sc(12), bold: true, color: C.bg, align: "center", valign: "middle" });
      }
      if (FOOTER) txt(s, FOOTER, { x: MX, y: PH - 0.52, w: 7, h: 0.3, font: F.mono, fs: sc(9.5), ls: 1.5, color: p.t3 });
    },
    accentRule(s, p, page) {
      box(s, { x: MX, y: PH - 0.5, w: 1.3, h: 0.09, fill: p.acF });
      if (page != null) txt(s, String(page), { x: PW - 1.5, y: PH - 0.55, w: 0.65, h: 0.3, font: F.num, fs: sc(11), bold: true, color: p.t1, align: "right" });
    },
    cornerBand(s, p, page) {
      box(s, { x: PW - 1.7, y: PH - 0.38, w: 1.7, h: 0.38, fill: p.acF });
      if (page != null) txt(s, String(page), { x: PW - 1.7, y: PH - 0.38, w: 1.55, h: 0.38, font: F.num, fs: sc(11), bold: true, color: "0A0A0A", align: "right", valign: "middle" });
    },
    statusline(s, p, page) {
      box(s, { x: 0, y: PH - 0.36, w: PW, h: 0.36, fill: C.bgSoft });
      txt(s, "◆ " + (FOOTER || "deck"), { x: MX, y: PH - 0.36, w: 7, h: 0.36, font: F.mono, fs: sc(9.5), color: C.accent2, valign: "middle" });
      if (page != null) txt(s, "Ln " + page, { x: PW - 1.9, y: PH - 0.36, w: 1.05, h: 0.36, font: F.mono, fs: sc(9.5), color: p.t3, align: "right", valign: "middle" });
    },
    tridotPage(s, p, page) {
      [C.accent, C.accent2, C.good].forEach((c0, i) => oval(s, { x: MX + i * 0.2, y: PH - 0.44, w: 0.1, h: 0.1, fill: c0 }));
      if (page != null) txt(s, String(page), { x: PW - 1.5, y: PH - 0.52, w: 0.65, h: 0.3, font: F.num, fs: sc(10.5), color: p.t3, align: "right" });
    },
    promptline(s, p, page) {
      txt(s, [{ text: (FOOTER || "user@deck") + ":~$ ", options: { color: p.t3 } }, { text: "▍", options: { color: p.ac } }],
        { x: MX, y: PH - 0.46, w: 8, h: 0.3, font: F.mono, fs: sc(10) });
      if (page != null) txt(s, String(page), { x: PW - 1.5, y: PH - 0.46, w: 0.65, h: 0.3, font: F.mono, fs: sc(10), color: p.t3, align: "right" });
    },
    roman(s, p, page) {
      const n = parseInt(page, 10);
      if (page != null) txt(s, n ? (ROMAN[n - 1] || page) : page, { x: PW - 2, y: PH - 0.55, w: 1.15, h: 0.32, font: F.num, fs: sc(12), italic: true, color: p.t2, align: "right" });
    },
    dotPage(s, p, page) {
      oval(s, { x: PW - 1.7, y: PH - 0.46, w: 0.12, h: 0.12, fill: C.accentFill || C.accent });
      if (page != null) txt(s, String(page), { x: PW - 1.5, y: PH - 0.52, w: 0.65, h: 0.3, font: F.num, fs: sc(10.5), color: p.t3, align: "right" });
    },
    boxedPage(s, p, page) {
      if (page != null) {
        box(s, { x: PW - 1.12, y: PH - 0.66, w: 0.52, h: 0.4, line: "0A0A0A", lw: 1.6, fill: C.bg });
        txt(s, String(page), { x: PW - 1.12, y: PH - 0.66, w: 0.52, h: 0.4, font: F.num, fs: sc(11), bold: true, color: p.t1, align: "center", valign: "middle" });
      }
    },
    geoPage(s, p, page) {
      oval(s, { x: MX, y: PH - 0.44, w: 0.12, h: 0.12, fill: C.accentFill || C.accent });
      box(s, { x: MX + 0.2, y: PH - 0.44, w: 0.12, h: 0.12, fill: C.accent2 });
      tri(s, { x: MX + 0.4, y: PH - 0.44, w: 0.13, h: 0.12, fill: C.warn });
      if (page != null) txt(s, String(page), { x: PW - 1.5, y: PH - 0.52, w: 0.65, h: 0.3, font: F.num, fs: sc(10.5), color: p.t3, align: "right" });
    },
    handout(s, p, page) {
      txt(s, (FOOTER ? FOOTER + " · " : "") + "讲义" + (page != null ? " · 第 " + page + " 页" : ""),
        { x: PW / 2 - 3, y: PH - 0.5, w: 6, h: 0.3, fs: sc(9.5), color: p.t3, align: "center" });
    },
    chapterLeft(s, p, page) {
      lineV(s, MX, PH - 0.62, 0.34, p.ac, 2);
      txt(s, FOOTER || "", { x: MX + 0.15, y: PH - 0.55, w: 6, h: 0.3, fs: sc(9.5), color: p.t3 });
      if (page != null) txt(s, String(page), { x: PW - 1.5, y: PH - 0.52, w: 0.65, h: 0.3, font: F.num, fs: sc(10.5), color: p.t3, align: "right" });
    },
    dotFolio(s, p, page) {
      if (page != null) txt(s, "· " + page + " ·", { x: PW / 2 - 1, y: PH - 0.55, w: 2, h: 0.3, font: F.num, fs: sc(11), color: p.t2, align: "center" });
    },
    none() {},
  };

  const header = (s, p, o) => (HEADERS[L.header] || HEADERS.blackTick)(s, p, o);
  const footer = (s, p, page) => (FOOTERS[L.footer] || FOOTERS.minimal)(s, p, page);

  // ---------- contentRows 的列表渲染(list DNA) ----------
  function renderRows(s, p, rows, top, bottom) {
    const style = L.list, avail = bottom - top;
    const n = rows.length || 1, gap = ["bareRows", "airyRows", "centerLines", "centerThin", "paragraphs"].includes(style) ? 0.12 : 0.18;
    const rh = Math.min(style === "airyRows" ? 0.95 : 1.05, (avail - gap * (n - 1)) / n);
    rows.forEach((r, i) => {
      const y = top + i * (rh + gap);
      if (style === "centerLines" || style === "centerThin") {
        txt(s, r[1], { x: MX, y, w: CW, h: rh * 0.55, fs: sc(style === "centerThin" ? 24 : 22), font: F.title, bold: style !== "centerThin", color: p.t1, align: "center", valign: "middle" });
        if (r[2]) txt(s, r[2], { x: MX + 1, y: y + rh * 0.55, w: CW - 2, h: rh * 0.45, fs: sc(12), color: p.t2, align: "center" });
        return;
      }
      if (style === "paragraphs") {
        txt(s, [{ text: r[1] + "  ", options: { bold: true, color: p.t1, fontFace: F.title } },
                { text: "—— " + (r[2] || ""), options: { color: p.t2 } }],
          { x: MX + 0.2, y, w: CW - 0.4, h: rh, fs: sc(15), valign: "middle", lh: sc(15) * 1.5 });
        if (i < n - 1) txt(s, "·", { x: PW / 2 - 0.2, y: y + rh - 0.04, w: 0.4, h: 0.22, fs: sc(12), color: p.t3, align: "center" });
        return;
      }
      if (style === "stepTimeline") {
        const bx = MX + 0.1;
        if (i < n - 1) lineV(s, bx + 0.3, y + rh / 2 + 0.32, gap + rh - 0.62 + rh / 2, p.line, 1.5);
        box(s, { x: bx, y: y + rh / 2 - 0.3, w: 0.6, h: 0.6, fill: p.acF });
        txt(s, String(r[0] != null ? r[0] : i + 1), { x: bx, y: y + rh / 2 - 0.3, w: 0.6, h: 0.6, font: F.num, fs: sc(18), bold: true, color: "0A0A0A", align: "center", valign: "middle" });
        txt(s, r[1], { x: bx + 0.85, y, w: 4.2, h: rh, fs: sc(16), bold: true, color: p.t1, valign: "middle" });
        if (r[2]) txt(s, r[2], { x: bx + 5.2, y, w: CW - 5.5, h: rh, fs: sc(12.5), color: p.t2, valign: "middle" });
        return;
      }
      if (style === "rightNums") {
        itemBox(s, p, MX, y, CW, rh, i);
        txt(s, r[1], { x: MX, y, w: CW - 1.4, h: rh * 0.62, fs: sc(16), bold: true, color: p.t1, align: "right", valign: "middle", font: F.title });
        drawIndex(s, p, i, PW - MX - 0.85, y + rh / 2 - 0.24, 0.48, r[0]);
        if (r[2]) txt(s, r[2], { x: MX, y: y + rh - 0.36, w: CW - 1.4, h: 0.3, fs: sc(11), color: p.t2, align: "right" });
        return;
      }
      // 常规左编号行
      itemBox(s, p, MX, y, CW, rh, i);
      let ix = MX + 0.24;
      if (style === "lineNumbers") { txt(s, String(i + 1).padStart(2, "0"), { x: MX + 0.18, y, w: 0.5, h: rh, font: F.mono, fs: sc(12), color: p.t3, valign: "middle" }); ix = MX + 0.85; }
      else if (style === "outputRows") { txt(s, "[" + (i + 1) + "]", { x: MX, y, w: 0.65, h: rh, font: F.mono, fs: sc(13), color: p.ac, valign: "middle" }); ix = MX + 0.8; if (i < n - 1) txt(s, "─".repeat(58), { x: MX, y: y + rh + gap / 2 - 0.1, w: CW, h: 0.18, font: F.mono, fs: sc(8), color: C.border }); }
      else if (style === "colorTicks") { box(s, { x: MX + 0.16, y: y + rh / 2 - 0.22, w: 0.09, h: 0.44, fill: [C.accent, C.accent2, C.good][i % 3], round: true, r: 0.04 }); ix = MX + 0.5; }
      else if (style === "squareGrid") { box(s, { x: MX + 0.2, y: y + rh / 2 - 0.11, w: 0.22, h: 0.22, fill: p.acF }); ix = MX + 0.66; }
      else if (style === "bigDots") { oval(s, { x: MX + 0.16, y: y + rh / 2 - 0.19, w: 0.38, h: 0.38, fill: p.acF }); txt(s, String(i + 1), { x: MX + 0.16, y: y + rh / 2 - 0.19, w: 0.38, h: 0.38, fs: sc(12), bold: true, color: "0A0A0A", align: "center", valign: "middle" }); ix = MX + 0.75; }
      else { ix = MX + 0.24 + drawIndex(s, p, i, MX + 0.24, y + rh / 2 - 0.24, 0.48, r[0]); }
      txt(s, r[1], { x: ix + 0.15, y, w: 4.4, h: rh, fs: sc(16), bold: true, color: p.t1, valign: "middle", font: style === "leader" ? F.title : F.body });
      if (style === "leader") lineH(s, MX + 5.3, y + rh / 2, CW - 5.3 - 4.55, p.t3, 1, "sysDot");
      if (r[2]) txt(s, r[2], { x: MX + CW - 4.45, y, w: 4.25, h: rh,
        fs: sc(12.5), color: p.t2, valign: "middle", align: style === "dataRows" ? "right" : "left",
        font: style === "dataRows" ? F.num : F.body });
    });
  }

  // ---------- ctx(传给 deck_styles 的构图工具箱) ----------
  const ctx = {
    pres, T, C, F, R, L, meta, themeName, PW, PH, MX, CW, FOOTER,
    pal, sc, txt, box, oval, tri, lineH, lineV, runs, drawIndex, itemBox, header, footer, newSlide, gridBg, ROMAN, estW, estLines,
  };
  const comp = STYLES[themeName] || {};
  const fb = STYLES.__fallback;
  const heroFn = name => o => (comp[name] || fb[name])(ctx, o || {});

  // ========================================================================
  const S = {};
  S.cover = heroFn("cover");
  S.sectionDivider = heroFn("divider");
  S.statement = heroFn("statement");
  S.closing = heroFn("closing");
  S.bigStat = heroFn("bigstat");

  // ---- toc 目录 ----
  S.toc = function (o) {
    const p = pal(false), s = newSlide(false);
    const top = header(s, p, o);
    const items = o.items || [];
    if (L.align === "center") {
      const rh = Math.min(0.72, (PH - top - 0.7) / Math.max(items.length, 1));
      items.forEach((it, i) => {
        txt(s, [{ text: String(it[0]) + "   ", options: { color: p.t3, fontFace: F.num } }, { text: it[1], options: { color: p.t1, bold: true } }],
          { x: MX, y: top + i * rh, w: CW, h: rh, fs: sc(19), align: "center", valign: "middle", font: F.title });
      });
    } else {
      const cols = items.length <= 4 ? 2 : 3, rows0 = Math.ceil(items.length / cols), gap = 0.3;
      const w = (CW - gap * (cols - 1)) / cols;
      const h = Math.min(1.7, ((PH - top - 0.75) - gap * (rows0 - 1)) / Math.max(rows0, 1));
      // 网格实际占高不足时轻度下移居中,避免下半页大片空白
      const yOff = Math.min(0.45, Math.max(0, (PH - top - 0.75 - rows0 * h - (rows0 - 1) * gap) / 2));
      items.forEach((it, i) => {
        const x = MX + (i % cols) * (w + gap), y = top + yOff + Math.floor(i / cols) * (h + gap);
        itemBox(s, p, x, y, w, h, i);
        drawIndex(s, p, i, x + 0.28, y + 0.2, 0.42, it[0]);
        txt(s, it[1], { x: x + 0.28, y: y + 0.72, w: w - 0.56, h: 0.5, fs: sc(15), bold: true, color: p.t1, font: F.title });
        if (it[2]) txt(s, it[2], { x: x + 0.28, y: y + 1.18, w: w - 0.56, h: Math.max(h - 1.3, 0.25), fs: sc(11), color: p.t2 });
      });
    }
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- contentRows 编号要点 ----
  S.contentRows = function (o) {
    const p = pal(false), s = newSlide(false);
    const top = header(s, p, o);
    renderRows(s, p, o.rows || [], top, PH - (o.footnote ? 1.1 : (["statusbar", "statusline"].includes(L.footer) ? 0.6 : 0.85)));
    if (o.footnote) txt(s, o.footnote, { x: MX, y: PH - 0.86, w: CW - 2, h: 0.28, fs: sc(11), italic: true, color: p.t3 });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- twoColumn 双栏 ----
  S.twoColumn = function (o) {
    const p = pal(false), s = newSlide(false);
    const top = header(s, p, o);
    const w = (CW - 0.4) / 2;
    // 面板高按内容收缩(下限 3.0),稀内容时不再拖出半页空箱
    const sideH = side => {
      if (!side) return 0;
      let ch = side.head ? 0.92 : 0.32;
      if (side.body) { const f = sc(side.mono ? 11.5 : 13); ch += estLines(side.body, w - 0.7, f) * f * 1.6 / 72; }
      if (side.items) ch += side.items.reduce((a, t0) => a + estLines(t0, w - 0.9, sc(13)) * sc(13) * 1.25 / 72 + 0.11, 0);
      return ch + 0.35;
    };
    const h = Math.min(PH - top - 0.85, Math.max(3.0, sideH(o.left), sideH(o.right)));
    [[o.left, MX], [o.right, MX + w + 0.4]].forEach(([side, x], si) => {
      if (!side) return;
      if (side.mono) {
        box(s, { x, y: top, w, h, fill: T.dark ? C.bgSoft : C.t1, round: R > 0, line: T.dark ? C.border : null });
      } else itemBox(s, p, x, top, w, h, si);
      const tc = side.mono ? { t1: T.dark ? C.t1 : C.bg, t2: T.dark ? C.t2 : C.bgSoft } : { t1: p.t1, t2: p.t2 };
      if (side.head) txt(s, side.head, { x: x + 0.35, y: top + 0.28, w: w - 0.7, h: 0.5, fs: sc(17), bold: true, color: tc.t1, font: F.title });
      const by = side.head ? top + 0.92 : top + 0.32;
      if (side.body) txt(s, side.body, { x: x + 0.35, y: by, w: w - 0.7, h: h - (by - top) - 0.3,
        font: side.mono ? F.mono : F.body, fs: sc(side.mono ? 11.5 : 13), color: tc.t2, valign: "top", lh: sc(side.mono ? 11.5 : 13) * 1.6 });
      if (side.items && side.items.length) {
        const rr = side.items.map(t0 => ({ text: t0, options: { bullet: { characterCode: "2013", indent: 14 }, breakLine: true, paraSpaceAfter: 8, color: tc.t2 } }));
        s.addText(rr, { x: x + 0.35, y: by, w: w - 0.7, h: h - (by - top) - 0.3, fontFace: F.body, fontSize: sc(13), valign: "top", margin: 0 });
      }
    });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- threeCards 卡组 ----
  S.threeCards = function (o) {
    const p = pal(false), s = newSlide(false);
    const top = header(s, p, o);
    const cards = o.cards || [], gap = 0.35, n = Math.max(cards.length, 1);
    const w = (CW - gap * (n - 1)) / n;
    // 卡高按最长内容估算(下限 2.4),不再固定撑满内容区
    const descH = cards.reduce((m, cd) => Math.max(m, cd.desc ? estLines(cd.desc, w - 0.6, sc(12)) * sc(12) * 1.6 / 72 : 0), 0);
    const h = Math.min(PH - top - 0.9, Math.max(2.4, 1.75 + descH + 0.3));
    cards.forEach((cd, i) => {
      const x = MX + i * (w + gap);
      itemBox(s, p, x, top, w, h, i);
      const cx = x + 0.3;
      drawIndex(s, p, i, cx, top + 0.26, 0.46, cd.no);
      txt(s, cd.head || "", { x: cx, y: top + 0.9, w: w - 0.6, h: 0.8, fs: sc(16), bold: true, color: p.t1, font: F.title });
      if (cd.desc) txt(s, cd.desc, { x: cx, y: top + 1.75, w: w - 0.6, h: Math.max(h - 2.1, 0.4), fs: sc(12), color: p.t2, valign: "top", lh: sc(12) * 1.6 });
    });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- comparison 对比 ----
  S.comparison = function (o) {
    const p = pal(false), s = newSlide(false);
    const top = header(s, p, o);
    const w = (CW - 0.4) / 2;
    const itemsH = side => side && side.items ? side.items.reduce((a, t0) => a + estLines(t0, w - 0.9, sc(13)) * sc(13) * 1.25 / 72 + 0.11, 0) : 0;
    const h = Math.min(PH - top - 0.85, Math.max(3.0, 1.25 + Math.max(itemsH(o.left), itemsH(o.right)) + 0.35));
    [[o.left, MX, o.left && o.left.bad ? C.bad : p.t3],
     [o.right, MX + w + 0.4, o.right && o.right.good ? C.good : p.ac]].forEach(([side, x, tagColor], si) => {
      if (!side) return;
      itemBox(s, p, x, top, w, h, si);
      box(s, { x, y: top, w, h: 0.06, fill: tagColor });
      if (side.tag) txt(s, side.tag, { x: x + 0.32, y: top + 0.24, w: w - 0.64, h: 0.3, font: F.mono, fs: sc(11), ls: 2, color: tagColor });
      if (side.head) txt(s, side.head, { x: x + 0.32, y: top + 0.6, w: w - 0.64, h: 0.5, fs: sc(18), bold: true, color: p.t1, font: F.title });
      const rr = (side.items || []).map(t0 => ({ text: t0, options: { bullet: { characterCode: "2013", indent: 14 }, breakLine: true, paraSpaceAfter: 8, color: p.t2 } }));
      if (rr.length) s.addText(rr, { x: x + 0.32, y: top + 1.25, w: w - 0.64, h: h - 1.6, fontFace: F.body, fontSize: sc(13), valign: "top", margin: 0 });
    });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- imageText 左文右图 ----
  S.imageText = function (o) {
    const p = pal(false), s = newSlide(false);
    const top = header(s, p, o);
    const textW = 6.0;
    if (o.lead) txt(s, o.lead, { x: MX, y: top + 0.05, w: textW, h: 1.8, fs: sc(14.5), color: p.t2, valign: "top", lh: sc(14.5) * 1.75 });
    if (o.callout) {
      const cy = PH - 2.65;
      box(s, { x: MX, y: cy, w: 0.05, h: 1.3, fill: p.acF });
      txt(s, o.callout.text || "", { x: MX + 0.25, y: cy, w: textW - 0.3, h: 0.95, font: F.title, fs: sc(14.5), italic: true, color: p.t1, valign: "top" });
      if (o.callout.source) txt(s, o.callout.source, { x: MX + 0.25, y: cy + 1.0, w: textW - 0.3, h: 0.32, font: F.mono, fs: sc(10), color: p.t3 });
    }
    const ix = MX + textW + 0.45, iw = PW - MX - ix, ih = PH - top - 1.3;
    if (o.image && o.image.path) {
      s.addImage({ path: o.image.path, x: ix, y: top, w: iw, h: ih, sizing: { type: "cover", w: iw, h: ih } });
    } else {
      box(s, { x: ix, y: top, w: iw, h: ih, fill: C.surface, line: p.line, round: R > 0 });
      txt(s, o.placeholder || "IMAGE", { x: ix, y: top, w: iw, h: ih, font: F.mono, fs: sc(12), ls: 2, color: p.t3, align: "center", valign: "middle" });
    }
    const cap = o.image && o.image.caption;
    if (cap) txt(s, cap, { x: ix, y: top + ih + 0.08, w: iw, h: 0.28, font: F.mono, fs: sc(9.5), ls: 1.5, color: p.t3 });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- kpiGrid ----
  S.kpiGrid = function (o) {
    const p = pal(false), s = newSlide(false);
    const top = header(s, p, o);
    const kpis = o.kpis || [], gap = 0.35, n = Math.max(kpis.length, 1);
    const w = (CW - gap * (n - 1)) / n, h = Math.min(3.2, PH - top - 1.0);
    const y0 = top + Math.max(0, (PH - 1.0 - top - h) / 2); // 卡片行在内容区垂直居中
    kpis.forEach((k, i) => {
      const x = MX + i * (w + gap);
      itemBox(s, p, x, y0, w, h, i);
      txt(s, k.label || "", { x: x + 0.28, y: y0 + 0.26, w: w - 0.56, h: 0.32, font: F.mono, fs: sc(10.5), ls: 1.5, color: p.t3 });
      const rr = [{ text: String(k.value), options: { color: p.t1 } }];
      if (k.unit) rr.push({ text: " " + k.unit, options: { color: p.t2, fontSize: sc(15) } });
      txt(s, rr, { x: x + 0.26, y: y0 + 0.75, w: w - 0.52, h: 1.15, font: F.num, fs: sc(38), bold: true });
      if (k.delta) {
        const dc = k.good === false ? C.bad : k.good ? C.good : p.t2;
        const ar = k.dir === "down" ? "↓ " : k.dir === "flat" ? "→ " : "↑ ";
        txt(s, ar + k.delta, { x: x + 0.28, y: y0 + h - 0.6, w: w - 0.56, h: 0.36, fs: sc(12.5), bold: true, color: dc });
      }
    });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- timeline ----
  S.timeline = function (o) {
    const p = pal(false), s = newSlide(false);
    const top = header(s, p, o);
    const nodes = o.nodes || [], n = Math.max(nodes.length, 1), step = CW / n;
    // 时间线整块(tag+节点+head+desc)在内容区垂直居中,不再挤在上 1/3
    const descH = Math.min(2.0, nodes.reduce((m, nd) => Math.max(m, nd.desc ? estLines(nd.desc, step - 0.3, sc(11)) * sc(11) * 1.55 / 72 : 0), 0));
    const lineY = top + 0.6 + Math.max(0, (PH - 0.85 - top - (1.45 + descH)) / 2);
    lineH(s, MX + step / 2, lineY, CW - step, p.line, 2);
    nodes.forEach((nd, i) => {
      const cxx = MX + i * step + step / 2;
      if (L.num === "geo") {
        const kind = i % 3, cols = [C.accentFill || C.accent, C.accent2, C.warn];
        if (kind === 0) oval(s, { x: cxx - 0.11, y: lineY - 0.11, w: 0.22, h: 0.22, fill: nd.done === false ? C.border : cols[0] });
        else if (kind === 1) box(s, { x: cxx - 0.11, y: lineY - 0.11, w: 0.22, h: 0.22, fill: nd.done === false ? C.border : cols[1] });
        else tri(s, { x: cxx - 0.12, y: lineY - 0.11, w: 0.24, h: 0.22, fill: nd.done === false ? C.border : cols[2] });
      } else if (CONTAINER_OF[L.list] === "shadowBox") {
        box(s, { x: cxx - 0.06, y: lineY - 0.06, w: 0.2, h: 0.2, fill: "0A0A0A" });
        box(s, { x: cxx - 0.11, y: lineY - 0.11, w: 0.2, h: 0.2, fill: nd.done === false ? C.bg : p.acF, line: "0A0A0A", lw: 1.4 });
      } else {
        oval(s, { x: cxx - 0.1, y: lineY - 0.1, w: 0.2, h: 0.2, fill: nd.done === false ? C.border : p.acF });
      }
      if (nd.tag) txt(s, nd.tag, { x: cxx - step / 2 + 0.1, y: lineY - 0.6, w: step - 0.2, h: 0.3, font: F.mono, fs: sc(10), ls: 1.5, color: p.ac, align: "center" });
      txt(s, nd.head || "", { x: cxx - step / 2 + 0.1, y: lineY + 0.28, w: step - 0.2, h: 0.52, fs: sc(14), bold: true, color: p.t1, align: "center", font: F.title });
      if (nd.desc) txt(s, nd.desc, { x: cxx - step / 2 + 0.15, y: lineY + 0.85, w: step - 0.3, h: 2.0, fs: sc(11), color: p.t2, align: "center", valign: "top", lh: sc(11) * 1.55 });
    });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- table ----
  S.table = function (o) {
    const p = pal(false), s = newSlide(false);
    const top = header(s, p, o);
    const hp = pal(true);
    const headers = (o.headers || []).map(t0 => ({ text: t0, options: {
      fontFace: F.body, fontSize: sc(12), bold: true, color: hp.t1, fill: { color: C.hero }, valign: "middle", margin: 6 } }));
    const numeric = t0 => /^[0-9#$¥€+\-.]/.test(String(t0).trim());
    const rows = (o.rows || []).map((r, ri) => r.map((cell, ci) => ({ text: String(cell), options: {
      fontFace: F.body, fontSize: sc(11.5), color: ci === 0 ? p.t1 : p.t2, bold: ci === 0,
      fill: { color: ri % 2 ? C.surface : C.bg }, valign: "middle", margin: 6,
      align: ci > 0 && numeric(cell) ? "right" : "left" } })));
    s.addTable([headers, ...rows], { x: MX, y: top + 0.05, w: CW, colW: o.colW,
      border: { type: "solid", pt: 0.5, color: C.border }, autoPage: false });
    if (o.source) {
      // 来源脚注挂在表格底部下方,不再钉死在页底;表高按各行最长单元格折行数估算
      const nc = Math.max((o.headers || []).length, 1);
      const rowH = r => Math.max(...r.map((cell, ci) => estLines(cell, (o.colW ? o.colW[ci] : CW / nc) - 0.17, sc(11.5)))) * sc(11.5) * 1.25 / 72 + 0.17;
      const tblH = 0.45 + (o.rows || []).reduce((a, r) => a + rowH(r), 0);
      txt(s, "来源: " + o.source, { x: MX, y: Math.min(PH - 0.8, top + 0.05 + tblH + 0.12), w: CW, h: 0.28, font: F.mono, fs: sc(9.5), color: p.t3 });
    }
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  // ---- processSteps ----
  S.processSteps = function (o) {
    const p = pal(false), s = newSlide(false);
    const top = header(s, p, o);
    const steps = o.steps || [], n = Math.max(steps.length, 1), aw = 0.42;
    const w = (CW - aw * (n - 1)) / n;
    // 卡高按最长步骤描述估算(下限 2.6),箭头随卡高中点自然跟随
    const descH = steps.reduce((m, st) => Math.max(m, st.desc ? estLines(st.desc, w - 0.52, sc(11)) * sc(11) * 1.55 / 72 : 0), 0);
    const h = Math.min(PH - top - 1.1, Math.max(2.6, 1.68 + descH + 0.3));
    steps.forEach((st, i) => {
      const x = MX + i * (w + aw);
      itemBox(s, p, x, top, w, h, i);
      drawIndex(s, p, i, x + 0.26, top + 0.24, 0.46);
      txt(s, st.head || "", { x: x + 0.26, y: top + 0.88, w: w - 0.52, h: 0.75, fs: sc(14.5), bold: true, color: p.t1, font: F.title });
      if (st.desc) txt(s, st.desc, { x: x + 0.26, y: top + 1.68, w: w - 0.52, h: Math.max(h - 2.0, 0.4), fs: sc(11), color: p.t2, valign: "top", lh: sc(11) * 1.55 });
      if (i < n - 1) txt(s, "→", { x: x + w - 0.05, y: top + h / 2 - 0.25, w: aw + 0.1, h: 0.5, fs: sc(17), bold: true, color: p.t3, align: "center", valign: "middle" });
    });
    footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  };

  return { pres, S, T, C, F, ctx, save: fileName => pres.writeFile({ fileName }) };
}

module.exports = { createDeck, listThemes, THEMES };
