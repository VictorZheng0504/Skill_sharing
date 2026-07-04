/**
 * deck_styles.js — ppt-studio v2 每主题专属 hero 构图
 *
 * 每个主题一个模块,包含 5 个构图函数:cover / divider / statement / closing / bigstat。
 * 这是「每主题独立排版」的主战场:任意两个主题的封面构图不得雷同。
 * 所有函数签名 (ctx, o):ctx 是 deck_engine 传入的绘制工具箱,只引用令牌,不写死色值
 * (黑色描边 0A0A0A 等主题签名色除外,它们本身就是该主题令牌的一部分)。
 *
 * o 的通用字段:cover{kicker,tag,title(runs),titleSize,subtitle,speaker,notes}
 *   divider{no,kicker,title,sub,page,notes} statement{kicker,title,sub,quote,page,notes}
 *   closing{kicker,title,sub,cta,page,notes} bigstat{kicker,title,stat{value,unit,label,sub},bars,page,notes}
 */

/* eslint-disable no-unused-vars */

// ---------- 通用兜底(未实现专属构图的主题暂用;全部主题完成后仅防御性保留) ----------
const __fallback = {
  cover(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.tag) c.txt(s, o.tag, { x: c.PW - 4.8, y: 0.55, w: 3.95, h: 0.35, font: c.F.mono, fs: c.sc(10.5), ls: 2, color: p.t2, align: "right" });
    c.box(s, { x: c.MX, y: 2.95, w: 0.5, h: 0.045, fill: p.acF });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX + 0.62, y: 2.76, w: 8.5, h: 0.4, font: c.F.mono, fs: c.sc(13), ls: 3, color: p.ac });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 3.25, w: c.CW, h: 2.0, font: c.F.title, fs: o.titleSize || c.sc(50), bold: true, lh: (o.titleSize || c.sc(50)) * 1.12 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 5.35, w: 11, h: 0.6, fs: c.sc(19), color: p.t2 });
    c.lineH(s, c.MX, 6.62, c.CW, p.line, 1);
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.76, w: 7, h: 0.4, fs: c.sc(13.5), color: p.t2 });
    if (c.meta.slogan) c.txt(s, c.meta.slogan, { x: 6.5, y: 6.78, w: c.PW - 6.5 - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(10), color: p.t3, align: "right" });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  divider(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.no != null) c.txt(s, String(o.no), { x: c.MX - 0.06, y: 1.35, w: 5, h: 2.2, font: c.F.num, fs: c.sc(115), bold: true, color: p.ac });
    c.box(s, { x: c.MX, y: 4.0, w: 0.5, h: 0.045, fill: p.acF });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX + 0.62, y: 3.81, w: 9, h: 0.4, font: c.F.mono, fs: c.sc(12.5), ls: 3, color: p.ac });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 4.3, w: c.CW, h: 1.5, font: c.F.title, fs: o.titleSize || c.sc(42), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 5.85, w: 10.5, h: 0.7, fs: c.sc(15), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  statement(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 0.6, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(12), ls: 2.5, color: p.ac });
    if (o.quote !== false) c.txt(s, "“", { x: c.MX - 0.1, y: 1.65, w: 2, h: 1.4, font: c.F.num, fs: c.sc(105), bold: true, color: p.ac });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: o.quote === false ? 2.3 : 2.75, w: c.CW, h: 2.3, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true, lh: (o.titleSize || c.sc(38)) * 1.3 });
    if (o.sub) {
      c.box(s, { x: c.MX, y: 5.55, w: 0.55, h: 0.04, fill: p.acF });
      c.txt(s, o.sub, { x: c.MX, y: 5.75, w: 11.4, h: 0.6, fs: c.sc(16), color: p.t2 });
    }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  closing(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 1.7, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(12.5), ls: 3, color: p.ac, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.5, w: c.CW, h: 1.9, font: c.F.title, fs: o.titleSize || c.sc(42), bold: true, align: "center", lh: (o.titleSize || c.sc(42)) * 1.2 });
    if (o.sub) c.txt(s, o.sub, { x: 2.2, y: 4.6, w: c.PW - 4.4, h: 0.8, fs: c.sc(16), color: p.t2, align: "center" });
    if (o.cta) {
      const cw = Math.max(2.6, o.cta.length * 0.22 + 1);
      c.box(s, { x: (c.PW - cw) / 2, y: 5.6, w: cw, h: 0.62, fill: p.acF, round: c.R > 0 });
      c.txt(s, o.cta, { x: (c.PW - cw) / 2, y: 5.6, w: cw, h: 0.62, fs: c.sc(14), bold: true, color: p.bg, align: "center", valign: "middle" });
    }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  bigstat(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    const top = c.header(s, p, o);
    if (o.stat) {
      const rr = [{ text: String(o.stat.value), options: { color: p.ac } }];
      if (o.stat.unit) rr.push({ text: " " + o.stat.unit, options: { color: p.ac, fontSize: c.sc(26) } });
      c.txt(s, rr, { x: c.MX - 0.05, y: top + 0.3, w: 5.3, h: 1.9, font: c.F.num, fs: c.sc(84), bold: true });
      if (o.stat.label) c.txt(s, o.stat.label, { x: c.MX, y: top + 2.3, w: 5.2, h: 0.5, fs: c.sc(17), bold: true, color: p.t1 });
      if (o.stat.sub) c.txt(s, o.stat.sub, { x: c.MX, y: top + 2.85, w: 5.2, h: 0.9, fs: c.sc(12.5), color: p.t2 });
    }
    const bars = o.bars || [];
    if (bars.length) {
      const bx = 6.7, bw = c.PW - c.MX - bx, floor = c.PH - 1.3, maxH = floor - top - 0.5;
      const cw = Math.min(1.15, (bw - 0.3 * (bars.length - 1)) / bars.length);
      bars.forEach((b, i) => {
        const x = bx + i * (cw + 0.3), bh = Math.max(0.15, maxH * (b[1] / 100));
        c.box(s, { x, y: floor - bh, w: cw, h: bh, fill: b[2] ? p.acF : c.C.border });
        c.txt(s, b[0], { x: x - 0.15, y: floor + 0.08, w: cw + 0.3, h: 0.5, fs: c.sc(10), color: p.t2, align: "center" });
      });
    }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
};

// ======================================================================
// mckinsey — 咨询报告。全部页面浅底,没有色块 hero;克制到近乎苛刻。
// 封面 = 纯白题名页;bigstat = 「图表页」(结论标题 + 横向条图 + 来源行)。
// ======================================================================
const mckinsey = {
  cover(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.lineH(s, c.MX, 0.62, c.CW, p.t1, 1.1);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 0.26, w: 9, h: 0.3, fs: c.sc(11), ls: 2, color: p.t3 });
    if (o.tag) c.txt(s, o.tag, { x: c.PW - 5, y: 0.26, w: 5 - c.MX, h: 0.3, fs: c.sc(11), color: p.t3, align: "right" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.5, w: c.CW - 1.5, h: 1.9, font: c.F.title, fs: o.titleSize || c.sc(37), bold: true, lh: (o.titleSize || c.sc(37)) * 1.28 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 4.5, w: c.CW - 2.5, h: 0.75, fs: c.sc(16), color: p.t2, lh: c.sc(16) * 1.5 });
    c.lineH(s, c.MX, 6.55, c.CW, p.line, 1);
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.72, w: 7.5, h: 0.35, fs: c.sc(12), color: p.t2 });
    c.txt(s, c.meta.slogan || "仅供内部讨论 · 机密", { x: 7.5, y: 6.72, w: c.PW - 7.5 - c.MX, h: 0.35, fs: c.sc(10), color: p.t3, align: "right" });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  divider(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.lineH(s, c.MX, 0.62, c.CW, p.t1, 1.1);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 0.26, w: 9, h: 0.3, fs: c.sc(11), ls: 2, color: p.t3 });
    if (o.page != null) c.txt(s, String(o.page), { x: c.PW - 1.6, y: 0.26, w: 0.75, h: 0.3, font: c.F.num, fs: c.sc(11), color: p.t3, align: "right" });
    if (o.no != null) c.txt(s, String(o.no), { x: c.MX, y: 2.3, w: 2.6, h: 1.9, font: c.F.num, fs: c.sc(92), bold: false, color: p.line });
    c.lineV(s, 3.6, 2.55, 1.5, p.ac, 2.2);
    c.txt(s, c.runs(o.title, p), { x: 3.95, y: 2.6, w: c.PW - 3.95 - c.MX, h: 0.95, font: c.F.title, fs: o.titleSize || c.sc(30), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: 3.95, y: 3.55, w: c.PW - 3.95 - c.MX - 0.5, h: 0.55, fs: c.sc(13.5), color: p.t2 });
    c.txt(s, "资料来源: " + (c.meta.source || c.FOOTER || "内部分析"), { x: c.MX, y: c.PH - 0.48, w: 9, h: 0.3, fs: c.sc(9.5), color: p.t3 });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  statement(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.lineH(s, c.MX, 0.62, c.CW, p.t1, 1.1);
    c.txt(s, o.kicker || "关键讯息", { x: c.MX, y: 0.26, w: 9, h: 0.3, fs: c.sc(11), ls: 2, color: p.t3 });
    if (o.page != null) c.txt(s, String(o.page), { x: c.PW - 1.6, y: 0.26, w: 0.75, h: 0.3, font: c.F.num, fs: c.sc(11), color: p.t3, align: "right" });
    c.lineV(s, c.MX, 2.5, 2.1, p.ac, 3);
    c.txt(s, c.runs(o.title, p), { x: c.MX + 0.45, y: 2.45, w: c.CW - 1.6, h: 2.2, font: c.F.title, fs: o.titleSize || c.sc(29), bold: true, lh: (o.titleSize || c.sc(29)) * 1.4 });
    if (o.sub) c.txt(s, o.sub, { x: c.MX + 0.45, y: 5.0, w: c.CW - 2, h: 0.7, fs: c.sc(13.5), color: p.t2, lh: c.sc(13.5) * 1.5 });
    c.txt(s, "资料来源: " + (c.meta.source || c.FOOTER || "内部分析"), { x: c.MX, y: c.PH - 0.48, w: 9, h: 0.3, fs: c.sc(9.5), color: p.t3 });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  closing(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.lineH(s, c.MX, 0.62, c.CW, p.t1, 1.1);
    c.txt(s, o.kicker || "总结与下一步", { x: c.MX, y: 0.26, w: 9, h: 0.3, fs: c.sc(11), ls: 2, color: p.t3 });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.35, w: c.CW - 1.5, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(30), bold: true, lh: (o.titleSize || c.sc(30)) * 1.3 });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 4.05, w: c.CW - 2.5, h: 0.8, fs: c.sc(14), color: p.t2, lh: c.sc(14) * 1.55 });
    if (o.cta) c.txt(s, [{ text: "下一步  ", options: { bold: true, color: p.ac } }, { text: o.cta, options: { color: p.t1 } }],
      { x: c.MX, y: 5.3, w: c.CW - 1.5, h: 0.5, fs: c.sc(14.5) });
    c.lineH(s, c.MX, 6.55, c.CW, p.line, 1);
    c.txt(s, "资料来源: " + (c.meta.source || c.FOOTER || "内部分析"), { x: c.MX, y: 6.72, w: 9, h: 0.3, fs: c.sc(9.5), color: p.t3 });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  bigstat(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    const top = c.header(s, p, o);   // topbar:结论式标题
    if (o.stat) {
      const rr = [{ text: String(o.stat.value), options: { color: p.t1 } }];
      if (o.stat.unit) rr.push({ text: " " + o.stat.unit, options: { color: p.t2, fontSize: c.sc(20) } });
      c.txt(s, rr, { x: c.MX, y: top + 0.25, w: 3.6, h: 1.25, font: c.F.num, fs: c.sc(52), bold: true });
      if (o.stat.label) c.txt(s, o.stat.label, { x: c.MX, y: top + 1.55, w: 3.5, h: 0.5, fs: c.sc(13.5), bold: true, color: p.t1 });
      if (o.stat.sub) c.txt(s, o.stat.sub, { x: c.MX, y: top + 2.1, w: 3.5, h: 1.5, fs: c.sc(11.5), color: p.t2, lh: c.sc(11.5) * 1.55 });
    }
    // 麦肯锡式横向条图
    const bars = o.bars || [];
    if (bars.length) {
      const bx = 5.0, bw = c.PW - c.MX - bx - 1.0, byTop = top + 0.25;
      const bh = Math.min(0.52, (c.PH - byTop - 1.15 - 0.22 * (bars.length - 1)) / bars.length);
      bars.forEach((b, i) => {
        const y = byTop + i * (bh + 0.22);
        c.txt(s, b[0], { x: bx - 1.55, y, w: 1.4, h: bh, fs: c.sc(11), color: p.t2, align: "right", valign: "middle" });
        c.box(s, { x: bx, y: y + bh * 0.14, w: bw * (b[1] / 100), h: bh * 0.72, fill: b[2] ? p.ac : c.C.border });
        c.txt(s, String(b[1]), { x: bx + bw * (b[1] / 100) + 0.08, y, w: 0.8, h: bh, font: c.F.num, fs: c.sc(11), bold: !!b[2], color: b[2] ? p.ac : p.t2, valign: "middle" });
      });
    }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
};

// ======================================================================
// keynote-dark — 发布会夜幕。全居中、每页一句超大字、页面近乎全空。
// ======================================================================
const keynoteDark = {
  cover(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.35, w: c.CW, h: 0.4, fs: c.sc(13), ls: 4, color: p.t2, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: 0.5, y: 2.95, w: c.PW - 1, h: 1.7, font: c.F.title, fs: o.titleSize || c.sc(52), bold: true, align: "center", lh: (o.titleSize || c.sc(52)) * 1.1 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: 2, y: 4.85, w: c.PW - 4, h: 0.55, fs: c.sc(15), color: p.t2, align: "center" });
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.75, w: c.CW, h: 0.35, fs: c.sc(11), color: p.t3, align: "center" });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  divider(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.no != null) c.txt(s, String(o.no), { x: c.MX, y: 2.35, w: c.CW, h: 0.5, font: c.F.num, fs: c.sc(15), ls: 5, color: p.t3, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: 0.5, y: 3.0, w: c.PW - 1, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(44), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.5, y: 4.55, w: c.PW - 5, h: 0.5, fs: c.sc(13.5), color: p.t2, align: "center" });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  statement(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.txt(s, c.runs(o.title, p), { x: 0.6, y: 2.4, w: c.PW - 1.2, h: 2.7, font: c.F.title, fs: o.titleSize || c.sc(46), bold: true, align: "center", valign: "middle", lh: (o.titleSize || c.sc(46)) * 1.15 });
    if (o.sub) c.txt(s, o.sub, { x: 2.5, y: 5.35, w: c.PW - 5, h: 0.55, fs: c.sc(14), color: p.t2, align: "center" });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  closing(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.txt(s, c.runs(o.title, p), { x: 0.6, y: 2.75, w: c.PW - 1.2, h: 1.5, font: c.F.title, fs: o.titleSize || c.sc(48), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.5, y: 4.45, w: c.PW - 5, h: 0.55, fs: c.sc(14), color: p.t2, align: "center" });
    if (o.cta) c.txt(s, o.cta, { x: c.MX, y: 5.35, w: c.CW, h: 0.45, fs: c.sc(15), bold: true, color: p.ac, align: "center" });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  bigstat(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 1.25, w: c.CW, h: 0.4, fs: c.sc(12), ls: 3, color: p.t3, align: "center" });
    const rr = [{ text: String(o.stat ? o.stat.value : ""), options: { color: p.t1 } }];
    if (o.stat && o.stat.unit) rr.push({ text: o.stat.unit, options: { color: p.t2, fontSize: c.sc(40) } });
    c.txt(s, rr, { x: 0.5, y: 2.15, w: c.PW - 1, h: 2.5, font: c.F.num, fs: c.sc(120), bold: true, align: "center", valign: "middle" });
    if (o.stat && o.stat.label) c.txt(s, o.stat.label, { x: 2, y: 4.9, w: c.PW - 4, h: 0.55, fs: c.sc(17), bold: true, color: p.t1, align: "center" });
    if (o.stat && o.stat.sub) c.txt(s, o.stat.sub, { x: 2.5, y: 5.5, w: c.PW - 5, h: 0.5, fs: c.sc(12.5), color: p.t2, align: "center" });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
};

// ======================================================================
// magazine-ink — 电子杂志。封面是浅色刊头版(注意:不是深色 hero!),
// 幕封是巨大衬线章号,金句是居中拉引,收束是 colophon 版权页。
// ======================================================================
const magazineInk = {
  cover(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.txt(s, (c.FOOTER || "JOURNAL").toUpperCase(), { x: c.MX, y: 0.42, w: 8, h: 0.35, font: c.F.mono, fs: c.sc(11), ls: 4, color: p.t1 });
    if (o.tag) c.txt(s, o.tag, { x: c.PW - 5, y: 0.42, w: 5 - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(10), ls: 2, color: p.t2, align: "right" });
    c.lineH(s, c.MX, 0.92, c.CW, p.t1, 2.4);
    c.lineH(s, c.MX, 1.0, c.CW, p.t1, 0.8);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 1.7, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(11), ls: 3, color: c.C.accent2 });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.35, w: c.CW, h: 2.3, font: c.F.title, fs: o.titleSize || c.sc(50), bold: true, lh: (o.titleSize || c.sc(50)) * 1.15 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 4.9, w: c.CW - 2, h: 0.6, font: c.F.title, fs: c.sc(16), italic: true, color: p.t2 });
    c.lineH(s, c.MX, 6.5, c.CW, p.t1, 0.8);
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.66, w: 7, h: 0.35, fs: c.sc(12), color: p.t2 });
    c.txt(s, "— 01 —", { x: c.PW / 2 - 1, y: 7.02, w: 2, h: 0.3, font: c.F.num, fs: c.sc(10.5), italic: true, color: p.t3, align: "center" });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  divider(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.txt(s, "· CHAPTER ·", { x: c.MX, y: 1.35, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(10), ls: 5, color: p.t3, align: "center" });
    if (o.no != null) c.txt(s, String(o.no), { x: c.MX, y: 1.7, w: c.CW, h: 2.2, font: c.F.num, fs: c.sc(96), bold: true, color: p.t1, align: "center" });
    c.lineH(s, c.PW / 2 - 0.6, 4.15, 1.2, p.t1, 1.4);
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 4.4, w: c.CW, h: 0.95, font: c.F.title, fs: o.titleSize || c.sc(32), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.5, y: 5.45, w: c.PW - 5, h: 0.55, font: c.F.title, fs: c.sc(13.5), italic: true, color: p.t2, align: "center" });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  statement(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.txt(s, "“", { x: c.PW / 2 - 0.8, y: 0.85, w: 1.6, h: 1.3, font: c.F.num, fs: c.sc(110), bold: true, color: p.ac, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: 1.3, y: 2.4, w: c.PW - 2.6, h: 2.3, font: c.F.title, fs: o.titleSize || c.sc(34), bold: false, italic: true, align: "center", lh: (o.titleSize || c.sc(34)) * 1.5 });
    if (o.sub) {
      c.lineH(s, c.PW / 2 - 0.5, 5.25, 1, p.ac, 1.2);
      c.txt(s, o.sub, { x: 2.5, y: 5.45, w: c.PW - 5, h: 0.5, font: c.F.mono, fs: c.sc(11), ls: 2, color: p.t2, align: "center" });
    }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  closing(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.lineH(s, c.PW / 2 - 1.5, 1.75, 3, p.t1, 0.8);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.0, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(10.5), ls: 4, color: p.t2, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.6, w: c.CW, h: 1.5, font: c.F.title, fs: o.titleSize || c.sc(40), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.2, y: 4.3, w: c.PW - 4.4, h: 0.6, font: c.F.title, fs: c.sc(14), italic: true, color: p.t2, align: "center" });
    if (o.cta) c.txt(s, o.cta, { x: c.MX, y: 5.15, w: c.CW, h: 0.45, font: c.F.mono, fs: c.sc(12), ls: 2, color: p.t1, align: "center" });
    c.lineH(s, c.PW / 2 - 1.5, 5.95, 3, p.t1, 2.2);
    c.lineH(s, c.PW / 2 - 1.5, 6.03, 3, p.t1, 0.8);
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  bigstat(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    const top = c.header(s, p, o);
    if (o.stat) {
      const rr = [{ text: String(o.stat.value), options: { color: p.t1 } }];
      if (o.stat.unit) rr.push({ text: o.stat.unit, options: { color: p.t2, fontSize: c.sc(30) } });
      c.txt(s, rr, { x: c.MX - 0.05, y: top + 0.15, w: 5.6, h: 2.2, font: c.F.num, fs: c.sc(96), bold: true });
      c.lineH(s, c.MX, top + 2.5, 5.2, p.t1, 1);
      if (o.stat.label) c.txt(s, o.stat.label, { x: c.MX, y: top + 2.65, w: 5.2, h: 0.5, font: c.F.title, fs: c.sc(16), bold: true, color: p.t1 });
      if (o.stat.sub) c.txt(s, o.stat.sub, { x: c.MX, y: top + 3.2, w: 5.2, h: 0.85, fs: c.sc(12), color: p.t2, lh: c.sc(12) * 1.6 });
    }
    // 杂志式细横条
    const bars = o.bars || [];
    if (bars.length) {
      const bx = 7.0, bw = c.PW - c.MX - bx - 0.7, byTop = top + 0.3;
      const bh = Math.min(0.7, (c.PH - byTop - 1.0 - 0.3 * (bars.length - 1)) / bars.length);
      bars.forEach((b, i) => {
        const y = byTop + i * (bh + 0.3);
        c.txt(s, b[0], { x: bx, y, w: bw, h: 0.28, font: c.F.mono, fs: c.sc(9.5), ls: 1.5, color: p.t2 });
        c.lineH(s, bx, y + 0.42, bw, c.C.border, 4);
        c.lineH(s, bx, y + 0.42, bw * (b[1] / 100), b[2] ? c.C.accent2 : p.t1, 4);
      });
    }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
};

// ======================================================================
// swiss-ikb — 满幅克莱因蓝。巨大字号、flush-left、黄色方块签名。
// ======================================================================
const swissIkb = {
  cover(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.box(s, { x: c.MX, y: 0.7, w: 0.62, h: 0.62, fill: p.ac });
    if (o.tag) c.txt(s, o.tag, { x: c.PW - 5, y: 0.72, w: 5 - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(10.5), ls: 2, color: p.t2, align: "right" });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.15, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(12.5), ls: 4, color: p.t2 });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.04, y: 2.65, w: c.CW + 0.3, h: 2.9, font: c.F.title, fs: o.titleSize || c.sc(62), bold: true, lh: (o.titleSize || c.sc(62)) * 1.04 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 5.75, w: 10.5, h: 0.55, fs: c.sc(16), color: p.t2 });
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.78, w: 8, h: 0.35, fs: c.sc(12), color: p.t1 });
    c.box(s, { x: c.PW - 1.05, y: c.PH - 0.75, w: 0.5, h: 0.44, fill: p.ac });
    c.txt(s, "01", { x: c.PW - 1.05, y: c.PH - 0.75, w: 0.5, h: 0.44, font: c.F.num, fs: c.sc(12), bold: true, color: c.C.hero, align: "center", valign: "middle" });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  divider(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.no != null) c.txt(s, String(o.no), { x: c.MX - 0.12, y: 0.55, w: 7, h: 3.4, font: c.F.num, fs: c.sc(175), bold: true, color: p.t1 });
    c.box(s, { x: c.MX, y: 4.55, w: 1.1, h: 0.14, fill: p.ac });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 4.85, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(11.5), ls: 4, color: p.t2 });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 5.3, w: c.CW, h: 1.1, font: c.F.title, fs: o.titleSize || c.sc(40), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 6.5, w: 10.5, h: 0.5, fs: c.sc(13), color: p.t2 });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  statement(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.04, y: 1.5, w: c.CW + 0.2, h: 3.4, font: c.F.title, fs: o.titleSize || c.sc(54), bold: true, lh: (o.titleSize || c.sc(54)) * 1.08 });
    c.box(s, { x: c.MX, y: 5.35, w: 2.2, h: 0.2, fill: p.ac });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 5.85, w: 11, h: 0.55, fs: c.sc(15), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  closing(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.box(s, { x: 0, y: 0, w: 4.3, h: c.PH, fill: p.ac });
    c.txt(s, "→", { x: 0.5, y: 2.9, w: 3.3, h: 1.6, fs: c.sc(96), bold: true, color: c.C.hero, align: "center", valign: "middle" });
    c.txt(s, c.runs(o.title, p), { x: 4.9, y: 2.3, w: c.PW - 4.9 - 0.7, h: 1.9, font: c.F.title, fs: o.titleSize || c.sc(46), bold: true, lh: (o.titleSize || c.sc(46)) * 1.1 });
    if (o.sub) c.txt(s, o.sub, { x: 4.9, y: 4.45, w: c.PW - 4.9 - 0.9, h: 0.6, fs: c.sc(14), color: p.t2 });
    if (o.cta) c.txt(s, o.cta, { x: 4.9, y: 5.35, w: c.PW - 4.9 - 0.9, h: 0.45, font: c.F.mono, fs: c.sc(13), bold: true, color: p.ac });
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  bigstat(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    const top = c.header(s, p, o);
    if (o.stat) {
      c.box(s, { x: c.MX - 0.15, y: top + 0.55, w: 2.2, h: 2.2, fill: c.C.hero });
      const rr = [{ text: String(o.stat.value), options: { color: p.t1 } }];
      if (o.stat.unit) rr.push({ text: o.stat.unit, options: { color: p.t2, fontSize: c.sc(30) } });
      c.txt(s, rr, { x: c.MX + 0.45, y: top + 0.05, w: 5.4, h: 2.3, font: c.F.num, fs: c.sc(100), bold: true });
      if (o.stat.label) c.txt(s, o.stat.label, { x: c.MX + 0.45, y: top + 2.45, w: 5, h: 0.5, fs: c.sc(16), bold: true, color: p.t1 });
      if (o.stat.sub) c.txt(s, o.stat.sub, { x: c.MX + 0.45, y: top + 3.0, w: 5, h: 0.9, fs: c.sc(12), color: p.t2, lh: c.sc(12) * 1.55 });
    }
    const bars = o.bars || [];
    if (bars.length) {
      const bx = 7.4, bw = c.PW - c.MX - bx, floor = c.PH - 1.25, maxH = floor - top - 0.3;
      const cw = Math.min(1.0, (bw - 0.22 * (bars.length - 1)) / bars.length);
      bars.forEach((b, i) => {
        const x = bx + i * (cw + 0.22), bh = Math.max(0.15, maxH * (b[1] / 100));
        c.box(s, { x, y: floor - bh, w: cw, h: bh, fill: b[2] ? c.C.accent : c.C.border });
        c.txt(s, String(b[1]), { x, y: floor - bh - 0.34, w: cw, h: 0.3, font: c.F.num, fs: c.sc(11), bold: true, color: b[2] ? c.C.accent : p.t2, align: "center" });
        c.txt(s, b[0], { x: x - 0.1, y: floor + 0.08, w: cw + 0.2, h: 0.3, fs: c.sc(9.5), color: p.t2, align: "center" });
      });
    }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
};

module.exports = {
  __fallback,
  "mckinsey": mckinsey,
  "keynote-dark": keynoteDark,
  "magazine-ink": magazineInk,
  "swiss-ikb": swissIkb,
};
