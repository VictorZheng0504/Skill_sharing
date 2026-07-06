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

// ======================================================================
// 共享 bigstat:大数字 + 竖条图。header DNA 已让各主题区分,这里统一实现,
// 由 opt 微调(numColor 数字色 / block 数字后色块 / roundBar 圆角条)。
// ======================================================================
function barStat(c, o, opt = {}) {
  const p = c.pal(false), s = c.newSlide(false);
  const top = c.header(s, p, o);
  const off = opt.block ? 0.42 : 0;
  if (o.stat) {
    if (opt.block) c.box(s, { x: c.MX - 0.1, y: top + 0.55, w: 2.0, h: 2.0, fill: opt.block === true ? p.acF : opt.block });
    const rr = [{ text: String(o.stat.value), options: { color: opt.numColor === "ac" ? p.ac : p.t1 } }];
    if (o.stat.unit) rr.push({ text: " " + o.stat.unit, options: { color: p.t2, fontSize: c.sc(24) } });
    c.txt(s, rr, { x: c.MX + off, y: top + 0.2, w: 5.4, h: 1.9, font: c.F.num, fs: c.sc(80), bold: true });
    if (o.stat.label) c.txt(s, o.stat.label, { x: c.MX + off, y: top + 2.2, w: 5.2, h: 0.5, font: c.F.title, fs: c.sc(17), bold: true, color: p.t1 });
    if (o.stat.sub) c.txt(s, o.stat.sub, { x: c.MX + off, y: top + 2.78, w: 5.2, h: 1.0, fs: c.sc(12.5), color: p.t2, lh: c.sc(12.5) * 1.55 });
  }
  const bars = o.bars || [];
  if (bars.length) {
    const bx = 6.9, bw = c.PW - c.MX - bx, floor = c.PH - 1.2, maxH = floor - top - 0.4;
    const cw = Math.min(1.05, (bw - 0.28 * (bars.length - 1)) / bars.length);
    bars.forEach((b, i) => {
      const x = bx + i * (cw + 0.28), bh = Math.max(0.15, maxH * (b[1] / 100));
      c.box(s, { x, y: floor - bh, w: cw, h: bh, fill: b[2] ? p.acF : c.C.border, round: c.R > 0 && opt.roundBar });
      c.txt(s, String(b[1]), { x, y: floor - bh - 0.32, w: cw, h: 0.3, font: c.F.num, fs: c.sc(10.5), bold: true, color: b[2] ? p.ac : p.t2, align: "center" });
      c.txt(s, b[0], { x: x - 0.12, y: floor + 0.08, w: cw + 0.24, h: 0.5, fs: c.sc(9.5), color: p.t2, align: "center" });
    });
  }
  c.footer(s, p, o.page);
  if (o.notes) s.addNotes(o.notes);
  return s;
}

// ======================================================================
// academic-navy — 学院书卷。深蓝书名页、粗细金色双线上下框、居中衬线。
// ======================================================================
const academicNavy = {
  cover(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.lineH(s, c.MX, 1.2, c.CW, p.ac, 2.6); c.lineH(s, c.MX, 1.3, c.CW, p.line, 0.9);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 1.6, w: c.CW, h: 0.4, font: c.F.num, fs: c.sc(13), ls: 4, color: p.ac, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: 1.3, y: 2.75, w: c.PW - 2.6, h: 1.9, font: c.F.title, fs: o.titleSize || c.sc(46), bold: true, align: "center", lh: (o.titleSize || c.sc(46)) * 1.2 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: 2, y: 4.8, w: c.PW - 4, h: 0.6, font: c.F.title, fs: c.sc(17), italic: true, color: p.t2, align: "center" });
    c.lineH(s, c.MX, 5.7, c.CW, p.line, 0.9); c.lineH(s, c.MX, 5.8, c.CW, p.ac, 2.6);
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.15, w: c.CW, h: 0.4, fs: c.sc(13.5), color: p.t2, align: "center" });
    if (o.tag) c.txt(s, o.tag, { x: c.MX, y: 6.6, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(10.5), ls: 2, color: p.t3, align: "center" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.no != null) c.txt(s, "第 " + o.no + " 部分", { x: c.MX, y: 2.5, w: c.CW, h: 0.5, font: c.F.num, fs: c.sc(15), ls: 3, color: p.ac, align: "center" });
    c.lineH(s, c.PW / 2 - 0.7, 3.28, 1.4, p.ac, 1.6);
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 3.55, w: c.CW, h: 1.3, font: c.F.title, fs: o.titleSize || c.sc(40), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2, y: 5.0, w: c.PW - 4, h: 0.6, fs: c.sc(14), color: p.t2, align: "center" });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.quote !== false) c.txt(s, "“", { x: c.PW / 2 - 0.9, y: 1.15, w: 1.8, h: 1.4, font: c.F.num, fs: c.sc(120), bold: true, color: p.ac, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: 1.4, y: o.quote === false ? 2.4 : 2.85, w: c.PW - 2.8, h: 2.2, font: c.F.title, fs: o.titleSize || c.sc(34), bold: true, align: "center", lh: (o.titleSize || c.sc(34)) * 1.4 });
    if (o.sub) {
      c.lineH(s, c.PW / 2 - 0.6, 5.4, 1.2, p.ac, 1.4);
      c.txt(s, o.sub, { x: 2, y: 5.6, w: c.PW - 4, h: 0.5, font: c.F.num, fs: c.sc(13), italic: true, color: p.t2, align: "center" });
    }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.lineH(s, c.PW / 2 - 1.5, 2.15, 3, p.ac, 2.4); c.lineH(s, c.PW / 2 - 1.5, 2.24, 3, p.line, 0.8);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.5, w: c.CW, h: 0.4, font: c.F.num, fs: c.sc(13), ls: 3, color: p.ac, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 3.1, w: c.CW, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(42), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.2, y: 4.65, w: c.PW - 4.4, h: 0.7, fs: c.sc(15), color: p.t2, align: "center" });
    if (o.cta) c.txt(s, o.cta, { x: c.MX, y: 5.5, w: c.CW, h: 0.45, font: c.F.num, fs: c.sc(14), italic: true, bold: true, color: p.ac, align: "center" });
    c.lineH(s, c.PW / 2 - 1.5, 6.2, 3, p.line, 0.8); c.lineH(s, c.PW / 2 - 1.5, 6.29, 3, p.ac, 2.4);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac" }); },
};

// ======================================================================
// minimal-gray — 留白至上。大片空白、黑色短粗方标、标题落在下三分、孤页码。
// ======================================================================
const minimalGray = {
  cover(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.box(s, { x: c.MX, y: 0.85, w: 0.5, h: 0.5, fill: p.t1 });
    if (o.tag) c.txt(s, o.tag, { x: c.PW - 5, y: 0.9, w: 5 - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(10.5), ls: 2, color: p.t3, align: "right" });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 3.4, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(12), ls: 5, color: p.t2 });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 3.85, w: c.CW, h: 1.8, font: c.F.title, fs: o.titleSize || c.sc(52), bold: true, lh: (o.titleSize || c.sc(52)) * 1.08 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 5.8, w: 9.5, h: 0.55, fs: c.sc(17), color: p.t2 });
    c.lineH(s, c.MX, 6.6, c.CW, p.line, 1);
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.75, w: 7, h: 0.35, fs: c.sc(12.5), color: p.t3 });
    if (c.meta.slogan) c.txt(s, c.meta.slogan, { x: 6.5, y: 6.75, w: c.PW - 6.5 - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(10), color: p.t3, align: "right" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.no != null) c.txt(s, String(o.no).padStart(2, "0"), { x: c.MX - 0.1, y: 1.0, w: 6, h: 3, font: c.F.num, fs: c.sc(150), bold: true, color: p.line });
    c.box(s, { x: c.MX, y: 4.45, w: 0.5, h: 0.09, fill: p.t1 });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 4.7, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(11), ls: 3, color: p.t2 });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 5.1, w: c.CW, h: 1.1, font: c.F.title, fs: o.titleSize || c.sc(40), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 6.25, w: 10, h: 0.5, fs: c.sc(14), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 1.5, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(11.5), ls: 4, color: p.t3 });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.3, w: c.CW, h: 2.6, font: c.F.title, fs: o.titleSize || c.sc(40), bold: true, lh: (o.titleSize || c.sc(40)) * 1.35 });
    if (o.sub) { c.box(s, { x: c.MX, y: 5.5, w: 0.5, h: 0.08, fill: p.t1 }); c.txt(s, o.sub, { x: c.MX, y: 5.7, w: 11, h: 0.6, fs: c.sc(16), color: p.t2 }); }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.box(s, { x: c.MX, y: 2.35, w: 0.5, h: 0.5, fill: p.ac });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX + 0.85, y: 2.45, w: c.CW - 0.85, h: 0.4, font: c.F.mono, fs: c.sc(12), ls: 3, color: p.t2, valign: "middle" });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 3.2, w: c.CW, h: 1.5, font: c.F.title, fs: o.titleSize || c.sc(44), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 4.9, w: 10.5, h: 0.6, fs: c.sc(16), color: p.t2 });
    if (o.cta) c.txt(s, o.cta, { x: c.MX, y: 5.75, w: c.CW, h: 0.45, font: c.F.mono, fs: c.sc(13), bold: true, color: p.ac });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o); },
};

// ======================================================================
// research-defense — 论文边栏。左侧竖色带贯穿全页、内容整体缩进、圆圈编号。
// ======================================================================
const BW_RD = 0.55;
const researchDefense = {
  cover(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.box(s, { x: 0, y: 0, w: BW_RD, h: c.PH, fill: p.ac }); c.box(s, { x: BW_RD, y: 0, w: 0.1, h: c.PH, fill: c.C.accent2 });
    const LX = BW_RD + 0.75;
    if (o.kicker) c.txt(s, o.kicker, { x: LX, y: 2.0, w: c.PW - LX - c.MX, h: 0.4, font: c.F.mono, fs: c.sc(12.5), ls: 2, color: c.C.accent2 });
    c.txt(s, c.runs(o.title, p), { x: LX - 0.03, y: 2.55, w: c.PW - LX - 0.6, h: 2.0, font: c.F.title, fs: o.titleSize || c.sc(44), bold: true, lh: (o.titleSize || c.sc(44)) * 1.16 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: LX, y: 4.75, w: c.PW - LX - 1, h: 0.6, font: c.F.title, fs: c.sc(17), italic: true, color: p.t2 });
    c.lineH(s, LX, 5.7, c.PW - LX - c.MX, p.line, 1);
    if (o.speaker) c.txt(s, o.speaker, { x: LX, y: 5.9, w: 8, h: 0.4, fs: c.sc(13.5), color: p.t2 });
    if (o.tag) c.txt(s, o.tag, { x: LX, y: 6.4, w: 8, h: 0.35, font: c.F.mono, fs: c.sc(10.5), ls: 1.5, color: p.t3 });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.box(s, { x: 0, y: 0, w: BW_RD, h: c.PH, fill: p.ac }); c.box(s, { x: BW_RD, y: 0, w: 0.1, h: c.PH, fill: c.C.accent2 });
    const LX = BW_RD + 0.75;
    if (o.no != null) { c.oval(s, { x: LX, y: 2.3, w: 1.3, h: 1.3, line: c.C.accent2, lw: 2 }); c.txt(s, String(o.no), { x: LX, y: 2.3, w: 1.3, h: 1.3, font: c.F.num, fs: c.sc(52), bold: true, color: c.C.accent2, align: "center", valign: "middle" }); }
    if (o.kicker) c.txt(s, o.kicker, { x: LX, y: 3.85, w: 8, h: 0.35, font: c.F.mono, fs: c.sc(11.5), ls: 2, color: p.t3 });
    c.txt(s, c.runs(o.title, p), { x: LX - 0.03, y: 4.25, w: c.PW - LX - c.MX, h: 1.1, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: LX, y: 5.45, w: c.PW - LX - 1, h: 0.6, fs: c.sc(14), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.box(s, { x: 0, y: 0, w: BW_RD, h: c.PH, fill: p.ac }); c.box(s, { x: BW_RD, y: 0, w: 0.1, h: c.PH, fill: c.C.accent2 });
    const LX = BW_RD + 0.75;
    c.lineV(s, LX, 2.4, 2.0, c.C.accent2, 3);
    c.txt(s, c.runs(o.title, p), { x: LX + 0.35, y: 2.35, w: c.PW - LX - 1.2, h: 2.2, font: c.F.title, fs: o.titleSize || c.sc(30), bold: true, lh: (o.titleSize || c.sc(30)) * 1.4 });
    if (o.sub) c.txt(s, o.sub, { x: LX + 0.35, y: 4.9, w: c.PW - LX - 1.5, h: 0.6, fs: c.sc(14), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.box(s, { x: 0, y: 0, w: BW_RD, h: c.PH, fill: p.ac }); c.box(s, { x: BW_RD, y: 0, w: 0.1, h: c.PH, fill: c.C.accent2 });
    const LX = BW_RD + 0.75;
    if (o.kicker) c.txt(s, o.kicker, { x: LX, y: 2.3, w: 8, h: 0.4, font: c.F.mono, fs: c.sc(12), ls: 2, color: c.C.accent2 });
    c.txt(s, c.runs(o.title, p), { x: LX - 0.03, y: 2.9, w: c.PW - LX - c.MX, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(40), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: LX, y: 4.5, w: c.PW - LX - 1, h: 0.7, fs: c.sc(15), color: p.t2 });
    if (o.cta) { c.box(s, { x: LX, y: 5.5, w: 0.05, h: 0.5, fill: c.C.accent2 }); c.txt(s, o.cta, { x: LX + 0.25, y: 5.5, w: 8, h: 0.5, fs: c.sc(14), bold: true, color: p.t1, valign: "middle" }); }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac" }); },
};

// ======================================================================
// clean-pro — 现代产品。蓝底 hero 上叠白色圆角卡承载标题、胶囊标签。
// ======================================================================
const cleanPro = {
  cover(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.tag) { const w = Math.max(1.6, o.tag.length * 0.14 + 0.5); c.box(s, { x: c.MX, y: 0.7, w, h: 0.42, fill: c.C.heroAccent, round: true, r: 0.21 }); c.txt(s, o.tag, { x: c.MX, y: 0.7, w, h: 0.42, font: c.F.mono, fs: c.sc(10.5), ls: 1, color: c.C.hero, align: "center", valign: "middle" }); }
    const cx = c.MX, cy = 1.55, cw = c.CW, ch = 4.55;
    c.box(s, { x: cx, y: cy, w: cw, h: ch, fill: c.C.bg, round: true, r: 0.16 });
    const px = cx + 0.7, tp = { t1: c.C.t1, ac: c.C.accent };
    if (o.kicker) c.txt(s, o.kicker, { x: px, y: cy + 0.6, w: cw - 1.4, h: 0.4, font: c.F.mono, fs: c.sc(12), ls: 1.5, color: c.C.accent });
    c.txt(s, c.runs(o.title, tp), { x: px, y: cy + 1.15, w: cw - 1.4, h: 1.9, font: c.F.title, fs: o.titleSize || c.sc(44), bold: true, lh: (o.titleSize || c.sc(44)) * 1.14 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: px, y: cy + 3.2, w: cw - 1.4, h: 0.7, fs: c.sc(17), color: c.C.t2 });
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.5, w: 8, h: 0.4, fs: c.sc(13), color: p.t2 });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.no != null) { c.box(s, { x: c.MX, y: 2.6, w: 1.4, h: 1.4, fill: c.C.heroAccent, round: true, r: 0.2 }); c.txt(s, String(o.no), { x: c.MX, y: 2.6, w: 1.4, h: 1.4, font: c.F.num, fs: c.sc(60), bold: true, color: c.C.hero, align: "center", valign: "middle" }); }
    const LX = c.MX + 1.95;
    if (o.kicker) c.txt(s, o.kicker, { x: LX, y: 2.7, w: 8, h: 0.35, font: c.F.mono, fs: c.sc(12), ls: 2, color: p.ac });
    c.txt(s, c.runs(o.title, p), { x: LX, y: 3.1, w: c.PW - LX - c.MX, h: 1.1, font: c.F.title, fs: o.titleSize || c.sc(40), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: LX, y: 4.25, w: c.PW - LX - 1, h: 0.6, fs: c.sc(15), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.box(s, { x: c.MX, y: 2.0, w: 0.6, h: 0.09, fill: p.ac });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.35, w: c.CW - 0.5, h: 2.4, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true, lh: (o.titleSize || c.sc(38)) * 1.3 });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 5.3, w: 11, h: 0.6, fs: c.sc(16), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.1, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(12.5), ls: 3, color: p.ac, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.8, w: c.CW, h: 1.5, font: c.F.title, fs: o.titleSize || c.sc(44), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.2, y: 4.5, w: c.PW - 4.4, h: 0.7, fs: c.sc(16), color: p.t2, align: "center" });
    if (o.cta) { const cw = Math.max(2.8, o.cta.length * 0.2 + 1.2); c.box(s, { x: (c.PW - cw) / 2, y: 5.5, w: cw, h: 0.64, fill: c.C.heroAccent, round: true, r: 0.32 }); c.txt(s, o.cta, { x: (c.PW - cw) / 2, y: 5.5, w: cw, h: 0.64, fs: c.sc(14.5), bold: true, color: c.C.hero, align: "center", valign: "middle" }); }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac", roundBar: true }); },
};

// ======================================================================
// dashboard — BI 界面。深底 hero、右上筛选胶囊、抽象柱状图形、LIVE 状态。
// ======================================================================
const dashboardT = {
  cover(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    const tags = (o.tag || "").split("·").map(t => t.trim()).filter(Boolean).slice(0, 3); let tx = c.PW - c.MX;
    tags.reverse().forEach(tg => { const w = Math.max(1.0, tg.length * 0.15 + 0.4); tx -= w + 0.18; c.box(s, { x: tx, y: 0.62, w, h: 0.4, fill: c.C.surface, line: c.C.heroLine, lw: 1, round: true, r: 0.2 }); c.txt(s, tg, { x: tx, y: 0.62, w, h: 0.4, font: c.F.mono, fs: c.sc(9.5), color: p.t2, align: "center", valign: "middle" }); });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 0.66, w: 6, h: 0.35, font: c.F.mono, fs: c.sc(11.5), ls: 2, color: p.ac, valign: "middle" });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 1.85, w: c.CW, h: 1.7, font: c.F.title, fs: o.titleSize || c.sc(46), bold: true, lh: (o.titleSize || c.sc(46)) * 1.1 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 3.65, w: 10, h: 0.5, fs: c.sc(16), color: p.t2 });
    const bx = c.MX, by = 6.35, colH = [0.7, 1.15, 0.5, 0.95, 1.35, 0.8], cw = 0.5, gap = 0.28;
    colH.forEach((h, i) => c.box(s, { x: bx + i * (cw + gap), y: by - h, w: cw, h, fill: i === 4 ? p.ac : c.C.heroLine }));
    if (o.speaker) c.txt(s, o.speaker, { x: 6.0, y: 6.02, w: 4, h: 0.4, fs: c.sc(13), color: p.t2, align: "right" });
    c.oval(s, { x: c.PW - c.MX - 1.55, y: 6.18, w: 0.14, h: 0.14, fill: c.C.good });
    c.txt(s, "LIVE", { x: c.PW - c.MX - 1.32, y: 6.1, w: 1.32, h: 0.3, font: c.F.mono, fs: c.sc(10), ls: 2, color: c.C.good });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.lineH(s, c.MX, 1.35, c.CW, c.C.heroLine, 1);
    if (o.no != null) c.txt(s, "0" + o.no + " /", { x: c.MX, y: 2.4, w: 5, h: 1.6, font: c.F.num, fs: c.sc(96), bold: true, color: p.ac });
    const LX = c.MX + 3.4;
    if (o.kicker) c.txt(s, o.kicker, { x: LX, y: 2.85, w: c.PW - LX - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(11.5), ls: 2, color: p.t2 });
    c.txt(s, c.runs(o.title, p), { x: LX, y: 3.25, w: c.PW - LX - c.MX, h: 1.1, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: LX, y: 4.4, w: c.PW - LX - c.MX, h: 0.6, fs: c.sc(14), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.box(s, { x: c.MX, y: 2.0, w: 0.5, h: 0.5, fill: p.ac });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.75, w: c.CW, h: 2.2, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true, lh: (o.titleSize || c.sc(38)) * 1.28 });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 5.4, w: 11, h: 0.6, font: c.F.mono, fs: c.sc(14), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.2, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(12), ls: 3, color: p.ac, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.9, w: c.CW, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(42), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.2, y: 4.5, w: c.PW - 4.4, h: 0.7, fs: c.sc(16), color: p.t2, align: "center" });
    if (o.cta) c.txt(s, o.cta, { x: c.MX, y: 5.5, w: c.CW, h: 0.45, font: c.F.mono, fs: c.sc(14), bold: true, color: p.ac, align: "center" });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac" }); },
};

// ======================================================================
// indigo-porcelain — 画册对开。一切右对齐、大号衬线数字靠右、非对称版面。
// ======================================================================
const indigoPorcelain = {
  cover(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.tag) c.txt(s, o.tag, { x: c.MX, y: 0.7, w: 5, h: 0.35, font: c.F.mono, fs: c.sc(10.5), ls: 2, color: p.t3 });
    c.txt(s, (c.FOOTER || "").toUpperCase(), { x: c.PW - 6, y: 0.7, w: 6 - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(10.5), ls: 3, color: p.t2, align: "right" });
    c.lineH(s, c.MX, 1.15, c.CW, p.t1, 1);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.2, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(11.5), ls: 3, color: c.C.accent2, align: "right" });
    c.txt(s, c.runs(o.title, p), { x: 2.5, y: 2.7, w: c.CW - 1.65, h: 2.2, font: c.F.title, fs: o.titleSize || c.sc(50), bold: true, align: "right", lh: (o.titleSize || c.sc(50)) * 1.14 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: 4, y: 5.05, w: c.CW - 3.15, h: 0.6, font: c.F.title, fs: c.sc(16), italic: true, color: p.t2, align: "right" });
    c.lineH(s, c.MX, 6.45, c.CW, p.t1, 0.8);
    if (o.speaker) c.txt(s, o.speaker, { x: c.PW - 6, y: 6.6, w: 6 - c.MX, h: 0.35, fs: c.sc(12), color: p.t2, align: "right" });
    c.txt(s, "— 01", { x: c.MX, y: 6.6, w: 2, h: 0.32, font: c.F.num, fs: c.sc(11), italic: true, color: p.t3 });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.no != null) c.txt(s, String(o.no).padStart(2, "0"), { x: c.PW - 4 - c.MX, y: 1.3, w: 4, h: 2.3, font: c.F.num, fs: c.sc(120), bold: true, color: p.t1, align: "right" });
    c.lineH(s, c.PW - c.MX - 3.5, 3.8, 3.5, c.C.accent2, 2);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 3.95, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(11), ls: 2, color: p.t3, align: "right" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 4.35, w: c.CW, h: 1.1, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true, align: "right" });
    if (o.sub) c.txt(s, o.sub, { x: 4, y: 5.55, w: c.CW - 3.15, h: 0.6, fs: c.sc(14), color: p.t2, align: "right" });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.quote !== false) c.txt(s, "”", { x: c.PW - 2.4, y: 1.0, w: 1.6, h: 1.4, font: c.F.num, fs: c.sc(115), bold: true, color: c.C.accent2, align: "right" });
    c.txt(s, c.runs(o.title, p), { x: 2.0, y: 2.6, w: c.CW - 1.15, h: 2.3, font: c.F.title, fs: o.titleSize || c.sc(34), bold: false, italic: true, align: "right", lh: (o.titleSize || c.sc(34)) * 1.42 });
    if (o.sub) { c.lineH(s, c.PW - c.MX - 1.2, 5.45, 1.2, c.C.accent2, 1.4); c.txt(s, o.sub, { x: 4, y: 5.6, w: c.CW - 3.15, h: 0.5, font: c.F.mono, fs: c.sc(11), ls: 1.5, color: p.t2, align: "right" }); }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.lineH(s, c.PW - c.MX - 3, 1.9, 3, p.t1, 0.8);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.15, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(10.5), ls: 4, color: p.t2, align: "right" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.7, w: c.CW, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(40), bold: true, align: "right" });
    if (o.sub) c.txt(s, o.sub, { x: 4, y: 4.35, w: c.CW - 3.15, h: 0.6, font: c.F.title, fs: c.sc(14), italic: true, color: p.t2, align: "right" });
    if (o.cta) c.txt(s, o.cta, { x: c.MX, y: 5.2, w: c.CW, h: 0.45, font: c.F.mono, fs: c.sc(12), ls: 2, color: c.C.accent2, align: "right" });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o); },
};

// ======================================================================
// kraft-paper — 手账剪贴。斜贴胶带压 kicker、虚线分隔、圆圈编号、圆点 folio。
// ======================================================================
const kraftPaper = {
  cover(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.kicker) { const w = Math.max(2.4, o.kicker.length * 0.2 + 0.8); c.box(s, { x: c.MX, y: 1.3, w, h: 0.5, fill: c.C.accent2, alpha: 55, rotate: -3 }); c.txt(s, o.kicker, { x: c.MX + 0.1, y: 1.32, w, h: 0.46, font: c.F.mono, fs: c.sc(11.5), ls: 1.5, color: p.t1, valign: "middle" }); }
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.3, w: c.CW, h: 2.0, font: c.F.title, fs: o.titleSize || c.sc(48), bold: true, lh: (o.titleSize || c.sc(48)) * 1.14 });
    c.lineH(s, c.MX, 4.7, c.CW, p.t3, 1.3, "dash");
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 4.95, w: 10.5, h: 0.7, font: c.F.title, fs: c.sc(17), italic: true, color: p.t2 });
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.5, w: 8, h: 0.4, fs: c.sc(13), color: p.t2 });
    if (o.tag) c.txt(s, o.tag, { x: c.PW - 5, y: 6.5, w: 5 - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(10), color: p.t3, align: "right" });
    c.txt(s, "· 01 ·", { x: c.PW / 2 - 1, y: 6.9, w: 2, h: 0.3, font: c.F.num, fs: c.sc(11), color: p.t2, align: "center" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.no != null) { c.oval(s, { x: c.MX, y: 2.5, w: 1.3, h: 1.3, line: c.C.accent2, lw: 2 }); c.txt(s, String(o.no), { x: c.MX, y: 2.5, w: 1.3, h: 1.3, font: c.F.num, fs: c.sc(52), bold: true, color: c.C.accent2, align: "center", valign: "middle" }); }
    const LX = c.MX + 1.95;
    if (o.kicker) { const w = Math.max(1.8, o.kicker.length * 0.2 + 0.6); c.box(s, { x: LX, y: 2.65, w, h: 0.44, fill: c.C.accent2, alpha: 55, rotate: -2 }); c.txt(s, o.kicker, { x: LX + 0.1, y: 2.67, w, h: 0.4, font: c.F.mono, fs: c.sc(11), color: p.t1, valign: "middle" }); }
    c.txt(s, c.runs(o.title, p), { x: LX - 0.03, y: 3.25, w: c.PW - LX - c.MX, h: 1.1, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: LX, y: 4.4, w: c.PW - LX - 1, h: 0.6, font: c.F.title, fs: c.sc(14), italic: true, color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.quote !== false) c.txt(s, "“", { x: c.PW / 2 - 0.8, y: 1.05, w: 1.6, h: 1.3, font: c.F.num, fs: c.sc(105), bold: true, color: c.C.accent2, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: 1.5, y: 2.6, w: c.PW - 3, h: 2.2, font: c.F.title, fs: o.titleSize || c.sc(33), bold: false, italic: true, align: "center", lh: (o.titleSize || c.sc(33)) * 1.42 });
    c.lineH(s, c.PW / 2 - 1.3, 5.35, 2.6, p.t3, 1.2, "dash");
    if (o.sub) c.txt(s, o.sub, { x: 2.5, y: 5.55, w: c.PW - 5, h: 0.5, font: c.F.mono, fs: c.sc(11), ls: 1.5, color: p.t2, align: "center" });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.lineH(s, c.PW / 2 - 1.5, 2.2, 3, p.t3, 1.2, "dash");
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.4, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(10.5), ls: 3, color: p.t2, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 3.0, w: c.CW, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(40), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.2, y: 4.6, w: c.PW - 4.4, h: 0.6, font: c.F.title, fs: c.sc(14), italic: true, color: p.t2, align: "center" });
    if (o.cta) c.txt(s, o.cta, { x: c.MX, y: 5.4, w: c.CW, h: 0.45, font: c.F.mono, fs: c.sc(12), ls: 1, color: c.C.accent2, align: "center" });
    c.lineH(s, c.PW / 2 - 1.5, 6.15, 3, p.t3, 1.2, "dash");
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac" }); },
};

// ======================================================================
// dune — 极简画册。超细大字横贯、罗马数字、地平线色带、轻盈居中。
// ======================================================================
const duneT = {
  cover(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.tag) c.txt(s, o.tag, { x: c.MX, y: 0.7, w: 8, h: 0.35, font: c.F.mono, fs: c.sc(10.5), ls: 2, color: p.t3 });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 1.6, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(11.5), ls: 5, color: c.C.accent2 });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.3, w: c.CW, h: 2.0, font: c.F.title, fs: o.titleSize || c.sc(58), bold: false, lh: (o.titleSize || c.sc(58)) * 1.08 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 4.5, w: 10.5, h: 0.6, font: c.F.title, fs: c.sc(17), italic: true, color: p.t2 });
    c.box(s, { x: 0, y: 5.8, w: c.PW, h: 0.5, fill: c.C.bgSoft }); c.lineH(s, 0, 5.8, c.PW, c.C.accent2, 1.2);
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.6, w: 8, h: 0.4, fs: c.sc(13), color: p.t2 });
    c.txt(s, "I", { x: c.PW - 2, y: 6.5, w: 1.15, h: 0.5, font: c.F.num, fs: c.sc(24), italic: true, color: p.t3, align: "right" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.txt(s, c.ROMAN[(o.no || 1) - 1] || String(o.no), { x: c.MX - 0.05, y: 1.5, w: c.CW, h: 2.4, font: c.F.num, fs: c.sc(130), bold: false, italic: true, color: p.t1, align: "center" });
    c.lineH(s, c.PW / 2 - 0.9, 4.2, 1.8, c.C.accent2, 1);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 4.4, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(10.5), ls: 4, color: p.t3, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 4.8, w: c.CW, h: 1.0, font: c.F.title, fs: o.titleSize || c.sc(34), bold: false, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.5, y: 5.9, w: c.PW - 5, h: 0.5, font: c.F.title, fs: c.sc(13.5), italic: true, color: p.t2, align: "center" });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.txt(s, c.runs(o.title, p), { x: 1.2, y: 2.4, w: c.PW - 2.4, h: 2.6, font: c.F.title, fs: o.titleSize || c.sc(36), bold: false, align: "center", valign: "middle", lh: (o.titleSize || c.sc(36)) * 1.35 });
    if (o.sub) { c.lineH(s, c.PW / 2 - 0.7, 5.4, 1.4, c.C.accent2, 1); c.txt(s, o.sub, { x: 2.5, y: 5.6, w: c.PW - 5, h: 0.5, font: c.F.mono, fs: c.sc(11), ls: 2, color: p.t2, align: "center" }); }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.3, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(11), ls: 4, color: p.t3, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.95, w: c.CW, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(42), bold: false, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.2, y: 4.5, w: c.PW - 4.4, h: 0.6, font: c.F.title, fs: c.sc(15), italic: true, color: p.t2, align: "center" });
    if (o.cta) c.txt(s, o.cta, { x: c.MX, y: 5.35, w: c.CW, h: 0.45, font: c.F.mono, fs: c.sc(12), ls: 2, color: c.C.accent2, align: "center" });
    c.box(s, { x: 0, y: 6.3, w: c.PW, h: 0.04, fill: c.C.accent2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o); },
};

// ======================================================================
// swiss-lemon — 半版色块。左侧黄色竖版封面、实心方块、大编号方块。
// ======================================================================
const swissLemon = {
  cover(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    const PWID = 4.4; c.box(s, { x: 0, y: 0, w: PWID, h: c.PH, fill: c.C.accentFill });
    c.box(s, { x: 0.7, y: 0.8, w: 0.7, h: 0.7, fill: p.t1 });
    if (c.FOOTER) c.txt(s, c.FOOTER.toUpperCase(), { x: 0.7, y: 5.85, w: PWID - 1.2, h: 0.35, font: c.F.mono, fs: c.sc(10), ls: 2, color: p.t1 });
    if (o.tag) c.txt(s, o.tag, { x: 0.7, y: 6.25, w: PWID - 1.2, h: 0.4, font: c.F.mono, fs: c.sc(11), ls: 2, color: p.t1 });
    const LX = PWID + 0.7;
    if (o.kicker) c.txt(s, o.kicker, { x: LX, y: 1.9, w: c.PW - LX - c.MX, h: 0.4, font: c.F.mono, fs: c.sc(12), ls: 3, color: p.t2 });
    c.box(s, { x: LX, y: 2.55, w: 0.45, h: 0.45, fill: c.C.accentFill });
    c.txt(s, c.runs(o.title, p), { x: LX, y: 3.2, w: c.PW - LX - c.MX, h: 2.0, font: c.F.title, fs: o.titleSize || c.sc(44), bold: true, lh: (o.titleSize || c.sc(44)) * 1.08 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: LX, y: 5.35, w: c.PW - LX - 0.6, h: 0.6, fs: c.sc(16), color: p.t2 });
    if (o.speaker) c.txt(s, o.speaker, { x: LX, y: 6.5, w: 8, h: 0.4, fs: c.sc(13), color: p.t1 });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.no != null) { c.box(s, { x: c.MX, y: 2.2, w: 2.6, h: 2.6, fill: c.C.accentFill }); c.txt(s, String(o.no), { x: c.MX, y: 2.2, w: 2.6, h: 2.6, font: c.F.num, fs: c.sc(120), bold: true, color: p.t1, align: "center", valign: "middle" }); }
    const LX = c.MX + 3.2;
    if (o.kicker) c.txt(s, o.kicker, { x: LX, y: 2.5, w: c.PW - LX - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(11.5), ls: 2, color: p.t2 });
    c.txt(s, c.runs(o.title, p), { x: LX, y: 2.95, w: c.PW - LX - c.MX, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(40), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: LX, y: 4.5, w: c.PW - LX - c.MX, h: 0.6, fs: c.sc(14), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.04, y: 1.6, w: c.CW + 0.2, h: 3.2, font: c.F.title, fs: o.titleSize || c.sc(50), bold: true, lh: (o.titleSize || c.sc(50)) * 1.1 });
    c.box(s, { x: c.MX, y: 5.35, w: 2.2, h: 0.22, fill: c.C.accentFill });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 5.85, w: 11, h: 0.55, fs: c.sc(15), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.box(s, { x: 0, y: 0, w: c.PW, h: 1.1, fill: c.C.accentFill });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.3, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(12), ls: 3, color: p.t2 });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.95, w: c.CW, h: 1.5, font: c.F.title, fs: o.titleSize || c.sc(46), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 4.65, w: 10.5, h: 0.6, fs: c.sc(16), color: p.t2 });
    if (o.cta) { const cw = Math.max(2.8, o.cta.length * 0.2 + 1); c.box(s, { x: c.MX, y: 5.5, w: cw, h: 0.62, fill: c.C.accentFill }); c.txt(s, o.cta, { x: c.MX, y: 5.5, w: cw, h: 0.62, font: c.F.mono, fs: c.sc(13), bold: true, color: p.t1, align: "center", valign: "middle" }); }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { block: true }); },
};

// ======================================================================
// swiss-orange — 警示条纹。上下橙色警示带、STEP 大编号、工程感。
// ======================================================================
const swissOrange = {
  cover(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.box(s, { x: 0, y: 0, w: c.PW, h: 0.7, fill: c.C.accentFill }); c.lineH(s, 0, 0.7, c.PW, p.t1, 1.5);
    c.box(s, { x: 0, y: c.PH - 0.7, w: c.PW, h: 0.7, fill: c.C.accentFill }); c.lineH(s, 0, c.PH - 0.7, c.PW, p.t1, 1.5);
    if (o.tag) c.txt(s, o.tag, { x: c.MX, y: 0.15, w: 8, h: 0.4, font: c.F.mono, fs: c.sc(11), ls: 2, bold: true, color: p.t1, valign: "middle" });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.3, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(13), ls: 3, bold: true, color: c.C.accent });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.9, w: c.CW, h: 2.0, font: c.F.title, fs: o.titleSize || c.sc(50), bold: true, lh: (o.titleSize || c.sc(50)) * 1.06 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 5.0, w: 10.5, h: 0.6, fs: c.sc(17), color: p.t2 });
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: c.PH - 0.62, w: 8, h: 0.4, font: c.F.mono, fs: c.sc(11), color: p.t1, valign: "middle" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.box(s, { x: 0, y: 0, w: c.PW, h: 0.18, fill: c.C.accentFill }); c.box(s, { x: 0, y: c.PH - 0.18, w: c.PW, h: 0.18, fill: c.C.accentFill });
    if (o.no != null) { c.txt(s, "STEP", { x: c.MX, y: 2.1, w: 3, h: 0.4, font: c.F.mono, fs: c.sc(14), ls: 3, bold: true, color: c.C.accent }); c.txt(s, String(o.no).padStart(2, "0"), { x: c.MX - 0.08, y: 2.4, w: 4, h: 2.2, font: c.F.num, fs: c.sc(140), bold: true, color: p.t1 }); }
    const LX = 4.5;
    if (o.kicker) c.txt(s, o.kicker, { x: LX, y: 2.9, w: c.PW - LX - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(11.5), ls: 2, color: p.t2 });
    c.txt(s, c.runs(o.title, p), { x: LX, y: 3.3, w: c.PW - LX - c.MX, h: 1.2, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: LX, y: 4.55, w: c.PW - LX - c.MX, h: 0.6, fs: c.sc(14), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.box(s, { x: 0, y: 1.5, w: 0.22, h: 2.8, fill: c.C.accentFill });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 1.6, w: c.CW - 0.5, h: 2.6, font: c.F.title, fs: o.titleSize || c.sc(40), bold: true, lh: (o.titleSize || c.sc(40)) * 1.28 });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 5.0, w: 11, h: 0.6, font: c.F.mono, fs: c.sc(14), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.box(s, { x: 0, y: 0, w: c.PW, h: 0.5, fill: c.C.accentFill }); c.box(s, { x: 0, y: c.PH - 0.5, w: c.PW, h: 0.5, fill: c.C.accentFill });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.2, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(12.5), ls: 3, bold: true, color: c.C.accent, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.85, w: c.CW, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(42), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.2, y: 4.5, w: c.PW - 4.4, h: 0.6, fs: c.sc(16), color: p.t2, align: "center" });
    if (o.cta) { const cw = Math.max(2.8, o.cta.length * 0.2 + 1); c.box(s, { x: (c.PW - cw) / 2, y: 5.4, w: cw, h: 0.6, fill: c.C.accentFill }); c.txt(s, o.cta, { x: (c.PW - cw) / 2, y: 5.4, w: cw, h: 0.6, font: c.F.mono, fs: c.sc(13), bold: true, color: p.t1, align: "center", valign: "middle" }); }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac" }); },
};

// ======================================================================
// nord — 极光横带。三色渐层横带签名、标题旁三色圆点、深色。
// ======================================================================
const nordT = {
  cover(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    const seg = c.CW / 3, by = 1.5;
    c.box(s, { x: c.MX, y: by, w: seg, h: 0.16, fill: c.C.accent }); c.box(s, { x: c.MX + seg, y: by, w: seg, h: 0.16, fill: c.C.accent2 }); c.box(s, { x: c.MX + 2 * seg, y: by, w: seg, h: 0.16, fill: c.C.good });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.1, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(12), ls: 3, color: p.ac });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.7, w: c.CW, h: 2.0, font: c.F.title, fs: o.titleSize || c.sc(48), bold: true, lh: (o.titleSize || c.sc(48)) * 1.1 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 4.85, w: 10.5, h: 0.6, fs: c.sc(17), color: p.t2 });
    c.lineH(s, c.MX, 6.5, c.CW, c.C.heroLine, 1);
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.65, w: 8, h: 0.35, fs: c.sc(12.5), color: p.t2 });
    if (o.tag) c.txt(s, o.tag, { x: c.PW - 5, y: 0.7, w: 5 - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(10.5), ls: 2, color: p.t3, align: "right" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    [c.C.accent, c.C.accent2, c.C.good].forEach((c0, i) => c.oval(s, { x: c.MX + i * 0.3, y: 2.3, w: 0.2, h: 0.2, fill: c0 }));
    if (o.no != null) c.txt(s, String(o.no).padStart(2, "0"), { x: c.MX - 0.05, y: 2.75, w: 5, h: 1.6, font: c.F.num, fs: c.sc(96), bold: true, color: p.ac });
    const LX = c.MX + 3.2;
    if (o.kicker) c.txt(s, o.kicker, { x: LX, y: 3.05, w: c.PW - LX - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(11.5), ls: 2, color: p.t2 });
    c.txt(s, c.runs(o.title, p), { x: LX, y: 3.45, w: c.PW - LX - c.MX, h: 1.1, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: LX, y: 4.6, w: c.PW - LX - c.MX, h: 0.6, fs: c.sc(14), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    [c.C.accent, c.C.accent2, c.C.good].forEach((c0, i) => c.oval(s, { x: c.MX + i * 0.3, y: 1.7, w: 0.2, h: 0.2, fill: c0 }));
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.4, w: c.CW, h: 2.4, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true, lh: (o.titleSize || c.sc(38)) * 1.3 });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 5.3, w: 11, h: 0.6, fs: c.sc(16), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    const seg = 1.0; [c.C.accent, c.C.accent2, c.C.good].forEach((c0, i) => c.box(s, { x: (c.PW - seg * 3) / 2 + i * seg, y: 2.1, w: seg, h: 0.14, fill: c0 }));
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.5, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(12), ls: 3, color: p.ac, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 3.15, w: c.CW, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(42), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.2, y: 4.75, w: c.PW - 4.4, h: 0.6, fs: c.sc(16), color: p.t2, align: "center" });
    if (o.cta) c.txt(s, o.cta, { x: c.MX, y: 5.6, w: c.CW, h: 0.45, font: c.F.mono, fs: c.sc(14), bold: true, color: p.ac, align: "center" });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac" }); },
};

// ======================================================================
// terminal-green — 终端会话。$ 提示符、命令 kicker、ASCII 横线、光标块。
// ======================================================================
const RULE = "─".repeat(52);
const terminalGreen = {
  cover(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.txt(s, [{ text: "$ ", options: { color: p.ac, bold: true } }, { text: o.kicker || "whoami", options: { color: p.t2 } }], { x: c.MX, y: 1.6, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(14) });
    c.txt(s, RULE, { x: c.MX, y: 2.1, w: c.CW, h: 0.25, font: c.F.mono, fs: c.sc(10), color: c.C.heroLine });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.6, w: c.CW, h: 2.0, font: c.F.title, fs: o.titleSize || c.sc(44), bold: true, lh: (o.titleSize || c.sc(44)) * 1.12 });
    if (o.subtitle) c.txt(s, [{ text: "# ", options: { color: p.t3 } }, { text: o.subtitle, options: { color: p.t2 } }], { x: c.MX, y: 4.7, w: 10.5, h: 0.6, font: c.F.mono, fs: c.sc(14) });
    c.txt(s, RULE, { x: c.MX, y: 5.55, w: c.CW, h: 0.25, font: c.F.mono, fs: c.sc(10), color: c.C.heroLine });
    if (o.speaker) c.txt(s, [{ text: "$ ", options: { color: p.ac } }, { text: o.speaker, options: { color: p.t2 } }], { x: c.MX, y: 5.85, w: 9, h: 0.4, font: c.F.mono, fs: c.sc(12) });
    c.box(s, { x: c.MX + 0.02, y: 6.4, w: 0.22, h: 0.34, fill: p.ac });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.no != null) c.txt(s, "[" + String(o.no).padStart(2, "0") + "]", { x: c.MX - 0.05, y: 2.2, w: 5, h: 1.4, font: c.F.mono, fs: c.sc(90), bold: true, color: c.C.heroLine });
    c.txt(s, [{ text: "$ ", options: { color: p.ac, bold: true } }, { text: o.kicker || "cd ./section", options: { color: p.t2 } }], { x: c.MX, y: 3.8, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(12.5) });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 4.25, w: c.CW, h: 1.1, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true });
    if (o.sub) c.txt(s, [{ text: "# ", options: { color: p.t3 } }, { text: o.sub, options: { color: p.t2 } }], { x: c.MX, y: 5.4, w: c.CW, h: 0.5, font: c.F.mono, fs: c.sc(13) });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.txt(s, [{ text: "> echo ", options: { color: p.t3 } }], { x: c.MX, y: 1.7, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(14) });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.5, w: c.CW, h: 2.4, font: c.F.title, fs: o.titleSize || c.sc(34), bold: true, lh: (o.titleSize || c.sc(34)) * 1.35 });
    if (o.sub) c.txt(s, [{ text: "// ", options: { color: p.t3 } }, { text: o.sub, options: { color: p.t2 } }], { x: c.MX, y: 5.4, w: 11, h: 0.5, font: c.F.mono, fs: c.sc(13) });
    c.box(s, { x: c.MX + 0.02, y: 5.95, w: 0.22, h: 0.32, fill: p.ac });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.txt(s, RULE, { x: c.MX, y: 2.1, w: c.CW, h: 0.25, font: c.F.mono, fs: c.sc(10), color: c.C.heroLine });
    if (o.kicker) c.txt(s, [{ text: "$ ", options: { color: p.ac, bold: true } }, { text: o.kicker, options: { color: p.t2 } }], { x: c.MX, y: 2.5, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(13) });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 3.1, w: c.CW, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(40), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 4.7, w: 10.5, h: 0.6, font: c.F.mono, fs: c.sc(14), color: p.t2 });
    if (o.cta) c.txt(s, [{ text: "> ", options: { color: p.ac } }, { text: o.cta, options: { color: p.ac, bold: true } }], { x: c.MX, y: 5.55, w: c.CW, h: 0.45, font: c.F.mono, fs: c.sc(14) });
    c.box(s, { x: c.MX + 0.02, y: 6.15, w: 0.22, h: 0.32, fill: p.ac });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac" }); },
};

// ======================================================================
// warm-academic — 讲义课堂。「第 N 讲」描边框、标题下虚线、圆圈序号。
// ======================================================================
const warmAcademic = {
  cover(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.kicker) { const w = Math.max(2, o.kicker.length * 0.22 + 0.6); c.box(s, { x: c.MX, y: 1.6, w, h: 0.5, line: p.ac, lw: 1.5 }); c.txt(s, o.kicker, { x: c.MX, y: 1.6, w, h: 0.5, font: c.F.title, fs: c.sc(13), bold: true, color: p.ac, align: "center", valign: "middle" }); }
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.5, w: c.CW, h: 2.0, font: c.F.title, fs: o.titleSize || c.sc(46), bold: true, lh: (o.titleSize || c.sc(46)) * 1.14 });
    c.lineH(s, c.MX, 4.65, c.CW, p.t3, 1.3, "dash");
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 4.9, w: 10.5, h: 0.7, font: c.F.title, fs: c.sc(17), italic: true, color: p.t2 });
    c.lineH(s, c.MX, 6.45, c.CW, p.line, 1);
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.6, w: 8, h: 0.35, fs: c.sc(12.5), color: p.t2 });
    if (o.tag) c.txt(s, o.tag, { x: c.PW - 5, y: 6.6, w: 5 - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(10), color: p.t3, align: "right" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.no != null) { c.oval(s, { x: c.MX, y: 2.5, w: 1.4, h: 1.4, fill: p.ac }); c.txt(s, String(o.no), { x: c.MX, y: 2.5, w: 1.4, h: 1.4, font: c.F.num, fs: c.sc(56), bold: true, color: c.C.bg, align: "center", valign: "middle" }); }
    const LX = c.MX + 2.0;
    if (o.kicker) c.txt(s, o.kicker, { x: LX, y: 2.6, w: 8, h: 0.4, font: c.F.title, fs: c.sc(13), bold: true, color: p.ac });
    c.txt(s, c.runs(o.title, p), { x: LX, y: 3.05, w: c.PW - LX - c.MX, h: 1.1, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true });
    c.lineH(s, LX, 4.2, c.PW - LX - c.MX, p.t3, 1.2, "dash");
    if (o.sub) c.txt(s, o.sub, { x: LX, y: 4.4, w: c.PW - LX - c.MX, h: 0.6, fs: c.sc(14), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.quote !== false) c.txt(s, "“", { x: c.MX - 0.1, y: 1.3, w: 2, h: 1.4, font: c.F.num, fs: c.sc(105), bold: true, color: p.ac });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: o.quote === false ? 2.2 : 2.7, w: c.CW, h: 2.3, font: c.F.title, fs: o.titleSize || c.sc(36), bold: true, lh: (o.titleSize || c.sc(36)) * 1.35 });
    c.lineH(s, c.MX, 5.55, c.CW, p.t3, 1.2, "dash");
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 5.75, w: 11.4, h: 0.6, fs: c.sc(15), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.1, w: c.CW, h: 0.4, font: c.F.title, fs: c.sc(13), bold: true, color: p.ac, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.75, w: c.CW, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(42), bold: true, align: "center" });
    c.lineH(s, c.PW / 2 - 1.5, 4.35, 3, p.t3, 1.2, "dash");
    if (o.sub) c.txt(s, o.sub, { x: 2.2, y: 4.55, w: c.PW - 4.4, h: 0.7, fs: c.sc(15), color: p.t2, align: "center" });
    if (o.cta) c.txt(s, o.cta, { x: c.MX, y: 5.5, w: c.CW, h: 0.45, font: c.F.title, fs: c.sc(14), bold: true, color: p.ac, align: "center" });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac" }); },
};

// ======================================================================
// soft-pastel — 圆润气泡。背景漂浮大圆、彩点串、圆角、紫底 hero。
// ======================================================================
const softPastel = {
  cover(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.oval(s, { x: c.PW - 3.2, y: -1.0, w: 3.6, h: 3.6, fill: c.C.heroLine });
    c.oval(s, { x: c.PW - 1.7, y: 4.6, w: 2.5, h: 2.5, fill: c.C.heroAccent });
    c.oval(s, { x: -0.9, y: 5.3, w: 2.3, h: 2.3, fill: c.C.heroLine });
    [0.16, 0.12, 0.1, 0.13, 0.17].forEach((d, i) => c.oval(s, { x: c.MX + i * 0.32, y: 1.72, w: d, h: d, fill: i % 2 ? c.C.heroAccent : p.t2 }));
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX + 1.95, y: 1.62, w: c.CW - 1.95, h: 0.35, font: c.F.mono, fs: c.sc(11.5), ls: 1.5, color: p.t2 });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.5, w: c.CW - 2.3, h: 2.0, font: c.F.title, fs: o.titleSize || c.sc(48), bold: true, lh: (o.titleSize || c.sc(48)) * 1.12 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 4.7, w: 9, h: 0.6, fs: c.sc(17), color: p.t2 });
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.6, w: 8, h: 0.4, fs: c.sc(13), color: p.t2 });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.oval(s, { x: c.PW - 2.6, y: -0.8, w: 3.2, h: 3.2, fill: c.C.heroLine });
    if (o.no != null) { c.oval(s, { x: c.MX, y: 2.5, w: 1.5, h: 1.5, fill: c.C.heroAccent }); c.txt(s, String(o.no), { x: c.MX, y: 2.5, w: 1.5, h: 1.5, font: c.F.num, fs: c.sc(60), bold: true, color: c.C.hero, align: "center", valign: "middle" }); }
    const LX = c.MX + 2.1;
    if (o.kicker) c.txt(s, o.kicker, { x: LX, y: 2.65, w: c.PW - LX - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(11.5), ls: 1.5, color: p.t2 });
    c.txt(s, c.runs(o.title, p), { x: LX, y: 3.1, w: c.PW - LX - c.MX, h: 1.1, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: LX, y: 4.25, w: c.PW - LX - c.MX, h: 0.6, fs: c.sc(14), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.oval(s, { x: -1.0, y: -1.0, w: 3.2, h: 3.2, fill: c.C.heroLine });
    c.oval(s, { x: c.PW - 2.2, y: c.PH - 2.2, w: 3.2, h: 3.2, fill: c.C.heroLine });
    c.txt(s, c.runs(o.title, p), { x: 1.3, y: 2.3, w: c.PW - 2.6, h: 2.6, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true, align: "center", valign: "middle", lh: (o.titleSize || c.sc(38)) * 1.3 });
    if (o.sub) c.txt(s, o.sub, { x: 2.5, y: 5.3, w: c.PW - 5, h: 0.5, fs: c.sc(14), color: p.t2, align: "center" });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.oval(s, { x: c.PW / 2 - 1.6, y: -1.3, w: 3.2, h: 3.2, fill: c.C.heroLine });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.2, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(12), ls: 2, color: p.t2, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.85, w: c.CW, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(42), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.2, y: 4.5, w: c.PW - 4.4, h: 0.7, fs: c.sc(16), color: p.t2, align: "center" });
    if (o.cta) { const cw = Math.max(2.8, o.cta.length * 0.2 + 1.2); c.box(s, { x: (c.PW - cw) / 2, y: 5.45, w: cw, h: 0.64, fill: c.C.heroAccent, round: true, r: 0.32 }); c.txt(s, o.cta, { x: (c.PW - cw) / 2, y: 5.45, w: cw, h: 0.64, fs: c.sc(14.5), bold: true, color: c.C.hero, align: "center", valign: "middle" }); }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac", roundBar: true }); },
};

// ======================================================================
// neo-brutalism — 粗野宣言。黑色偏移阴影盒、贴纸标签、超粗描边、标题装盒。
// ======================================================================
const BK = "0A0A0A";
const neoBrutalism = {
  cover(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.kicker) { const w = Math.max(2, o.kicker.length * 0.2 + 0.6); c.box(s, { x: c.MX + 0.08, y: 1.15, w, h: 0.5, fill: BK }); c.box(s, { x: c.MX, y: 1.05, w, h: 0.5, fill: c.C.accentFill, line: BK, lw: 2 }); c.txt(s, o.kicker, { x: c.MX, y: 1.05, w, h: 0.5, font: c.F.mono, fs: c.sc(11.5), bold: true, color: BK, align: "center", valign: "middle" }); }
    const by = 2.1, bh = 2.6; c.box(s, { x: c.MX + 0.14, y: by + 0.14, w: c.CW, h: bh, fill: BK }); c.box(s, { x: c.MX, y: by, w: c.CW, h: bh, fill: c.C.bg, line: BK, lw: 2.5 });
    c.txt(s, c.runs(o.title, p), { x: c.MX + 0.4, y: by + 0.3, w: c.CW - 0.8, h: bh - 0.6, font: c.F.title, fs: o.titleSize || c.sc(48), bold: true, valign: "middle", lh: (o.titleSize || c.sc(48)) * 1.06 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 5.05, w: 10.5, h: 0.6, fs: c.sc(17), bold: true, color: p.t2 });
    if (o.speaker) { const w = Math.max(2.5, o.speaker.length * 0.14 + 0.6); c.box(s, { x: c.MX, y: 6.35, w, h: 0.5, fill: c.C.accentFill, line: BK, lw: 2 }); c.txt(s, o.speaker, { x: c.MX, y: 6.35, w, h: 0.5, font: c.F.mono, fs: c.sc(11), bold: true, color: BK, align: "center", valign: "middle" }); }
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.no != null) { c.box(s, { x: c.MX + 0.12, y: 2.42, w: 2.2, h: 2.2, fill: BK }); c.box(s, { x: c.MX, y: 2.3, w: 2.2, h: 2.2, fill: c.C.accentFill, line: BK, lw: 2.5 }); c.txt(s, String(o.no), { x: c.MX, y: 2.3, w: 2.2, h: 2.2, font: c.F.num, fs: c.sc(100), bold: true, color: BK, align: "center", valign: "middle" }); }
    const LX = c.MX + 2.9;
    if (o.kicker) c.txt(s, o.kicker, { x: LX, y: 2.6, w: c.PW - LX - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(11.5), ls: 1.5, bold: true, color: p.t2 });
    c.txt(s, c.runs(o.title, p), { x: LX, y: 3.05, w: c.PW - LX - c.MX, h: 1.3, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: LX, y: 4.45, w: c.PW - LX - c.MX, h: 0.6, fs: c.sc(14), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    const by = 2.1, bh = 3.0; c.box(s, { x: c.MX + 0.16, y: by + 0.16, w: c.CW, h: bh, fill: BK }); c.box(s, { x: c.MX, y: by, w: c.CW, h: bh, fill: c.C.accentFill, line: BK, lw: 2.5 });
    c.txt(s, c.runs(o.title, { t1: BK, ac: BK }), { x: c.MX + 0.5, y: by + 0.35, w: c.CW - 1, h: bh - 0.7, font: c.F.title, fs: o.titleSize || c.sc(36), bold: true, valign: "middle", lh: (o.titleSize || c.sc(36)) * 1.25 });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 5.55, w: 11, h: 0.6, fs: c.sc(15), bold: true, color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 1.9, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(12), ls: 2, bold: true, color: p.t2, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.55, w: c.CW, h: 1.6, font: c.F.title, fs: o.titleSize || c.sc(48), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.2, y: 4.4, w: c.PW - 4.4, h: 0.6, fs: c.sc(16), bold: true, color: p.t2, align: "center" });
    if (o.cta) { const cw = Math.max(3, o.cta.length * 0.22 + 1.2); c.box(s, { x: (c.PW - cw) / 2 + 0.1, y: 5.45, w: cw, h: 0.66, fill: BK }); c.box(s, { x: (c.PW - cw) / 2, y: 5.35, w: cw, h: 0.66, fill: c.C.accentFill, line: BK, lw: 2.2 }); c.txt(s, o.cta, { x: (c.PW - cw) / 2, y: 5.35, w: cw, h: 0.66, font: c.F.mono, fs: c.sc(14), bold: true, color: BK, align: "center", valign: "middle" }); }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac" }); },
};

// ======================================================================
// bauhaus — 构成主义。红圆蓝方黄三角拼贴、编号嵌几何形、红底 hero。
// ======================================================================
const bauhausT = {
  cover(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.oval(s, { x: c.PW - 3.0, y: 0.7, w: 1.5, h: 1.5, fill: c.C.heroAccent });
    c.box(s, { x: c.PW - 1.75, y: 1.55, w: 1.35, h: 1.35, fill: c.C.accent2 });
    c.tri(s, { x: c.PW - 3.5, y: 1.95, w: 1.5, h: 1.35, fill: c.C.heroT1 });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.0, w: 7, h: 0.4, font: c.F.mono, fs: c.sc(12.5), ls: 3, color: c.C.heroAccent });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.6, w: 8.3, h: 2.4, font: c.F.title, fs: o.titleSize || c.sc(50), bold: true, lh: (o.titleSize || c.sc(50)) * 1.06 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 5.25, w: 9, h: 0.6, fs: c.sc(17), color: p.t2 });
    c.oval(s, { x: c.MX, y: 6.5, w: 0.3, h: 0.3, fill: c.C.heroAccent }); c.box(s, { x: c.MX + 0.5, y: 6.5, w: 0.3, h: 0.3, fill: c.C.accent2 }); c.tri(s, { x: c.MX + 1.0, y: 6.5, w: 0.33, h: 0.3, fill: c.C.heroT1 });
    if (o.speaker) c.txt(s, o.speaker, { x: c.PW - 6, y: 6.5, w: 6 - c.MX, h: 0.35, fs: c.sc(12.5), color: p.t2, align: "right" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    const kind = (o.no || 1) % 3;
    if (o.no != null) {
      if (kind === 1) c.oval(s, { x: c.MX, y: 2.4, w: 2.4, h: 2.4, fill: c.C.heroAccent });
      else if (kind === 2) c.box(s, { x: c.MX, y: 2.4, w: 2.4, h: 2.4, fill: c.C.accent2 });
      else c.tri(s, { x: c.MX, y: 2.4, w: 2.5, h: 2.4, fill: c.C.heroT1 });
      c.txt(s, String(o.no), { x: c.MX, y: kind === 0 ? 3.0 : 2.4, w: 2.5, h: 2.4, font: c.F.num, fs: c.sc(60), bold: true, color: kind === 2 ? c.C.heroT1 : c.C.t1, align: "center", valign: "middle" });
    }
    const LX = c.MX + 3.0;
    if (o.kicker) c.txt(s, o.kicker, { x: LX, y: 2.7, w: c.PW - LX - c.MX, h: 0.35, font: c.F.mono, fs: c.sc(11.5), ls: 2, color: c.C.heroAccent });
    c.txt(s, c.runs(o.title, p), { x: LX, y: 3.15, w: c.PW - LX - c.MX, h: 1.3, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: LX, y: 4.55, w: c.PW - LX - c.MX, h: 0.6, fs: c.sc(14), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.oval(s, { x: c.MX, y: 1.5, w: 0.5, h: 0.5, fill: c.C.heroAccent }); c.box(s, { x: c.MX + 0.7, y: 1.5, w: 0.5, h: 0.5, fill: c.C.accent2 });
    c.txt(s, c.runs(o.title, p), { x: c.MX - 0.03, y: 2.4, w: c.CW, h: 2.4, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true, lh: (o.titleSize || c.sc(38)) * 1.3 });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 5.3, w: 11, h: 0.6, fs: c.sc(16), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.oval(s, { x: c.PW / 2 - 1.55, y: 1.5, w: 0.7, h: 0.7, fill: c.C.heroAccent }); c.box(s, { x: c.PW / 2 - 0.35, y: 1.5, w: 0.7, h: 0.7, fill: c.C.accent2 }); c.tri(s, { x: c.PW / 2 + 0.85, y: 1.5, w: 0.75, h: 0.7, fill: c.C.heroT1 });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.55, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(12), ls: 3, color: c.C.heroAccent, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 3.2, w: c.CW, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(42), bold: true, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.2, y: 4.8, w: c.PW - 4.4, h: 0.6, fs: c.sc(16), color: p.t2, align: "center" });
    if (o.cta) c.txt(s, o.cta, { x: c.MX, y: 5.65, w: c.CW, h: 0.45, font: c.F.mono, fs: c.sc(14), bold: true, color: c.C.heroAccent, align: "center" });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac" }); },
};

// ======================================================================
// keynote-light — 发布会晨光。白底、全居中、超大细字、极简至无。
// ======================================================================
const keynoteLight = {
  cover(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.35, w: c.CW, h: 0.4, fs: c.sc(13), ls: 4, color: p.t3, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: 0.5, y: 2.95, w: c.PW - 1, h: 1.7, font: c.F.title, fs: o.titleSize || c.sc(52), bold: false, align: "center", lh: (o.titleSize || c.sc(52)) * 1.1 });
    if (o.subtitle) c.txt(s, o.subtitle, { x: 2, y: 4.85, w: c.PW - 4, h: 0.55, fs: c.sc(15), color: p.t2, align: "center" });
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 6.75, w: c.CW, h: 0.35, fs: c.sc(11), color: p.t3, align: "center" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.no != null) c.txt(s, String(o.no).padStart(2, "0"), { x: c.MX, y: 2.35, w: c.CW, h: 0.5, font: c.F.num, fs: c.sc(15), ls: 5, color: p.t3, align: "center" });
    c.txt(s, c.runs(o.title, p), { x: 0.5, y: 3.0, w: c.PW - 1, h: 1.4, font: c.F.title, fs: o.titleSize || c.sc(44), bold: false, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.5, y: 4.55, w: c.PW - 5, h: 0.5, fs: c.sc(13.5), color: p.t2, align: "center" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.txt(s, c.runs(o.title, p), { x: 0.6, y: 2.4, w: c.PW - 1.2, h: 2.7, font: c.F.title, fs: o.titleSize || c.sc(46), bold: false, align: "center", valign: "middle", lh: (o.titleSize || c.sc(46)) * 1.15 });
    if (o.sub) c.txt(s, o.sub, { x: 2.5, y: 5.35, w: c.PW - 5, h: 0.55, fs: c.sc(14), color: p.t2, align: "center" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    c.txt(s, c.runs(o.title, p), { x: 0.6, y: 2.75, w: c.PW - 1.2, h: 1.5, font: c.F.title, fs: o.titleSize || c.sc(48), bold: false, align: "center" });
    if (o.sub) c.txt(s, o.sub, { x: 2.5, y: 4.45, w: c.PW - 5, h: 0.55, fs: c.sc(14), color: p.t2, align: "center" });
    if (o.cta) c.txt(s, o.cta, { x: c.MX, y: 5.35, w: c.CW, h: 0.45, fs: c.sc(15), bold: true, color: p.ac, align: "center" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) {
    const p = c.pal(false), s = c.newSlide(false);
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 1.25, w: c.CW, h: 0.4, fs: c.sc(12), ls: 3, color: p.t3, align: "center" });
    const rr = [{ text: String(o.stat ? o.stat.value : ""), options: { color: p.t1 } }];
    if (o.stat && o.stat.unit) rr.push({ text: o.stat.unit, options: { color: p.t2, fontSize: c.sc(40) } });
    c.txt(s, rr, { x: 0.5, y: 2.15, w: c.PW - 1, h: 2.5, font: c.F.num, fs: c.sc(120), bold: true, align: "center", valign: "middle" });
    if (o.stat && o.stat.label) c.txt(s, o.stat.label, { x: 2, y: 4.9, w: c.PW - 4, h: 0.55, fs: c.sc(17), bold: true, color: p.t1, align: "center" });
    if (o.stat && o.stat.sub) c.txt(s, o.stat.sub, { x: 2.5, y: 5.5, w: c.PW - 5, h: 0.5, fs: c.sc(12.5), color: p.t2, align: "center" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
};

// ======================================================================
// tokyo-night — 代码编辑器。窗口标题栏三圆点、行号列、// 注释、状态栏。
// ======================================================================
const tokyoNight = {
  cover(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.box(s, { x: 0, y: 0, w: c.PW, h: 0.5, fill: c.C.surface });
    c.oval(s, { x: 0.35, y: 0.18, w: 0.15, h: 0.15, fill: c.C.bad }); c.oval(s, { x: 0.6, y: 0.18, w: 0.15, h: 0.15, fill: c.C.warn }); c.oval(s, { x: 0.85, y: 0.18, w: 0.15, h: 0.15, fill: c.C.good });
    c.txt(s, (c.FOOTER || "deck") + ".md", { x: c.PW / 2 - 2, y: 0, w: 4, h: 0.5, font: c.F.mono, fs: c.sc(10.5), color: p.t3, align: "center", valign: "middle" });
    c.box(s, { x: 0, y: 0.5, w: 0.72, h: c.PH - 0.5, fill: c.C.surface }); c.lineV(s, 0.72, 0.5, c.PH - 0.5, c.C.border, 1);
    for (let i = 0; i < 9; i++) c.txt(s, String(i + 1), { x: 0, y: 1.45 + i * 0.55, w: 0.55, h: 0.4, font: c.F.mono, fs: c.sc(10), color: c.C.heroLine, align: "right" });
    const LX = 1.15;
    if (o.kicker) c.txt(s, "// " + o.kicker, { x: LX, y: 1.5, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(13), color: c.C.accent2 });
    c.txt(s, c.runs(o.title, p), { x: LX, y: 2.3, w: c.PW - LX - c.MX, h: 2.0, font: c.F.title, fs: o.titleSize || c.sc(46), bold: true, lh: (o.titleSize || c.sc(46)) * 1.1 });
    if (o.subtitle) c.txt(s, [{ text: "const goal = ", options: { color: c.C.accent2 } }, { text: '"' + o.subtitle + '"', options: { color: c.C.good } }], { x: LX, y: 4.5, w: c.PW - LX - c.MX, h: 0.6, font: c.F.mono, fs: c.sc(13) });
    if (o.speaker) c.txt(s, "// " + o.speaker, { x: LX, y: 5.5, w: 9, h: 0.4, font: c.F.mono, fs: c.sc(11.5), color: p.t3 });
    c.box(s, { x: 0, y: c.PH - 0.4, w: c.PW, h: 0.4, fill: c.C.accent });
    c.txt(s, "● main", { x: c.MX, y: c.PH - 0.4, w: 4, h: 0.4, font: c.F.mono, fs: c.sc(9.5), color: c.C.bg, valign: "middle" });
    c.txt(s, "UTF-8 · Markdown", { x: c.PW - 4, y: c.PH - 0.4, w: 4 - c.MX, h: 0.4, font: c.F.mono, fs: c.sc(9.5), color: c.C.bg, align: "right", valign: "middle" });
    if (o.notes) s.addNotes(o.notes); return s;
  },
  divider(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.box(s, { x: 0, y: 0.5, w: 0.72, h: c.PH - 0.5, fill: c.C.surface }); c.lineV(s, 0.72, 0.5, c.PH - 0.5, c.C.border, 1);
    if (o.no != null) c.txt(s, "## 0" + o.no, { x: 1.15, y: 2.2, w: 6, h: 1.4, font: c.F.mono, fs: c.sc(64), bold: true, color: c.C.heroLine });
    if (o.kicker) c.txt(s, "// " + o.kicker, { x: 1.15, y: 3.75, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(12), color: c.C.accent2 });
    c.txt(s, c.runs(o.title, p), { x: 1.15, y: 4.2, w: c.PW - 1.15 - c.MX, h: 1.1, font: c.F.title, fs: o.titleSize || c.sc(38), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: 1.15, y: 5.35, w: c.PW - 1.15 - c.MX, h: 0.6, font: c.F.mono, fs: c.sc(13), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  statement(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.txt(s, "/*", { x: c.MX, y: 1.6, w: 2, h: 0.5, font: c.F.mono, fs: c.sc(22), color: c.C.accent2 });
    c.txt(s, c.runs(o.title, p), { x: c.MX + 0.4, y: 2.4, w: c.CW - 0.8, h: 2.3, font: c.F.title, fs: o.titleSize || c.sc(34), bold: true, lh: (o.titleSize || c.sc(34)) * 1.35 });
    if (o.sub) c.txt(s, o.sub, { x: c.MX + 0.4, y: 5.1, w: 11, h: 0.5, font: c.F.mono, fs: c.sc(13), color: p.t2 });
    c.txt(s, "*/", { x: c.MX, y: 5.7, w: 2, h: 0.5, font: c.F.mono, fs: c.sc(22), color: c.C.accent2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  closing(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    if (o.kicker) c.txt(s, "// " + o.kicker, { x: c.MX, y: 2.3, w: c.CW, h: 0.4, font: c.F.mono, fs: c.sc(13), color: c.C.accent2 });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.95, w: c.CW, h: 1.3, font: c.F.title, fs: o.titleSize || c.sc(40), bold: true });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 4.35, w: 10.5, h: 0.6, font: c.F.mono, fs: c.sc(14), color: p.t2 });
    if (o.cta) c.txt(s, [{ text: "return ", options: { color: c.C.accent2 } }, { text: o.cta, options: { color: p.ac, bold: true } }, { text: ";", options: { color: p.t3 } }], { x: c.MX, y: 5.3, w: c.CW, h: 0.45, font: c.F.mono, fs: c.sc(15) });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes); return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac" }); },
};

// ======================================================================
// vic-medical — 维克医学。深色网格底纹、// 注释 kicker、信号青;
// 分节页 = 幽灵大编号 + 青色 PART chip + 左竖条 + 底部进度条。
// divider 扩展字段(可选):progress = [[标签, 当前节?], ...];tone = "bad"|"warn" 整页换强调色(合规红线页)。
// ======================================================================
const vicMedical = {
  cover(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.gridBg(s);
    if (o.tag) c.txt(s, o.tag, { x: c.PW - 4.8, y: 0.5, w: 3.95, h: 0.32, font: c.F.mono, fs: c.sc(10), ls: 2, color: p.t3, align: "right" });
    if (o.kicker) c.txt(s, o.kicker, { x: c.MX, y: 2.08, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(14), ls: 4, color: p.ac });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.55, w: c.CW, h: 2.25, font: c.F.title, fs: o.titleSize || c.sc(56), bold: true, lh: (o.titleSize || c.sc(56)) * 1.22 });
    c.box(s, { x: c.MX, y: 4.72, w: 1.11, h: 0.055, fill: p.ac });
    if (o.subtitle) c.txt(s, o.subtitle, { x: c.MX, y: 5.02, w: 11, h: 0.82, fs: c.sc(19), color: p.t2 });
    if (o.speaker) c.txt(s, o.speaker, { x: c.MX, y: 5.98, w: 9, h: 0.4, fs: c.sc(14), color: p.t3 });
    c.footer(s, p, null);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  divider(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.gridBg(s);
    const AC = (o.tone && c.C[o.tone]) || p.ac;
    const no2 = o.no != null ? String(o.no).padStart(2, "0") : null;
    if (no2) c.txt(s, no2, { x: c.PW - 5.75, y: 0.62, w: 5.6, h: 4.1, font: c.F.mono, fs: c.sc(275), bold: true, color: o.tone ? c.C.border : c.C.ghost, align: "right" });
    c.box(s, { x: c.MX, y: 0.58, w: 1.5, h: 0.42, fill: AC });
    c.txt(s, no2 ? "PART " + no2 : (o.kicker || "PART"), { x: c.MX, y: 0.58, w: 1.5, h: 0.42, font: c.F.mono, fs: c.sc(13), bold: true, ls: 2, color: c.C.bg, align: "center", valign: "middle" });
    c.box(s, { x: c.MX, y: 2.39, w: 0.07, h: 2.0, fill: AC });
    c.txt(s, c.runs(o.title, p), { x: c.MX + 0.33, y: 2.32, w: c.CW - 0.4, h: 1.85, font: c.F.title, fs: o.titleSize || c.sc(44), bold: true, lh: (o.titleSize || c.sc(44)) * 1.3 });
    if (o.sub) c.txt(s, o.sub, { x: c.MX + 0.33, y: 4.85, w: c.CW - 0.4, h: 0.5, fs: c.sc(18), color: p.t2 });
    const prog = o.progress || [];
    if (prog.length) {
      const gap = 0.28, w = (c.CW - gap * (prog.length - 1)) / prog.length;
      prog.forEach((seg, i) => {
        const x = c.MX + i * (w + gap), on = seg[1] === true;
        c.box(s, { x, y: 6.11, w, h: 0.055, fill: on ? AC : c.C.border });
        c.txt(s, seg[0], { x, y: 6.26, w, h: 0.32, fs: c.sc(13), bold: on, color: on ? p.t1 : p.t3 });
      });
    }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  statement(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.gridBg(s);
    if (o.kicker) c.txt(s, "// " + o.kicker, { x: c.MX, y: 0.6, w: c.CW, h: 0.32, font: c.F.mono, fs: c.sc(13), ls: 2, color: p.ac });
    c.box(s, { x: c.MX, y: 1.75, w: c.CW, h: 3.55, fill: c.C.surface, round: c.R > 0 });
    c.box(s, { x: c.MX, y: 1.79, w: 0.06, h: 3.47, fill: p.ac });
    c.txt(s, c.runs(o.title, p), { x: c.MX + 0.55, y: 2.1, w: c.CW - 1.1, h: 2.2, font: c.F.title, fs: o.titleSize || c.sc(34), bold: true, lh: (o.titleSize || c.sc(34)) * 1.4 });
    if (o.sub) c.txt(s, o.sub, { x: c.MX + 0.55, y: 4.55, w: c.CW - 1.1, h: 0.5, fs: c.sc(15), color: p.t2 });
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  closing(c, o) {
    const p = c.pal(true), s = c.newSlide(true);
    c.gridBg(s);
    if (o.kicker) c.txt(s, "// " + o.kicker, { x: c.MX, y: 1.85, w: c.CW, h: 0.35, font: c.F.mono, fs: c.sc(13), ls: 3, color: p.ac });
    c.txt(s, c.runs(o.title, p), { x: c.MX, y: 2.45, w: c.CW, h: 1.7, font: c.F.title, fs: o.titleSize || c.sc(44), bold: true, lh: (o.titleSize || c.sc(44)) * 1.22 });
    c.box(s, { x: c.MX, y: 4.35, w: 1.11, h: 0.055, fill: p.ac });
    if (o.sub) c.txt(s, o.sub, { x: c.MX, y: 4.62, w: 10.5, h: 0.5, fs: c.sc(16), color: p.t2 });
    if (o.cta) {
      // chip 宽度用真实文本宽度估算(mono 中英混排下按字符数一刀切会宽出一倍)
      const cw = Math.min(c.CW, Math.max(2.0, c.estW(o.cta, c.sc(13), 2) * 1.1 + 0.6));
      c.box(s, { x: c.MX, y: 5.45, w: cw, h: 0.5, fill: p.ac });
      c.txt(s, o.cta, { x: c.MX, y: 5.45, w: cw, h: 0.5, font: c.F.mono, fs: c.sc(13), bold: true, ls: 2, color: c.C.bg, align: "center", valign: "middle" });
    }
    c.footer(s, p, o.page);
    if (o.notes) s.addNotes(o.notes);
    return s;
  },
  bigstat(c, o) { return barStat(c, o, { numColor: "ac" }); },
};

module.exports = {
  __fallback,
  "mckinsey": mckinsey,
  "keynote-dark": keynoteDark,
  "magazine-ink": magazineInk,
  "swiss-ikb": swissIkb,
  "academic-navy": academicNavy,
  "minimal-gray": minimalGray,
  "research-defense": researchDefense,
  "clean-pro": cleanPro,
  "dashboard": dashboardT,
  "indigo-porcelain": indigoPorcelain,
  "kraft-paper": kraftPaper,
  "dune": duneT,
  "swiss-lemon": swissLemon,
  "swiss-orange": swissOrange,
  "nord": nordT,
  "terminal-green": terminalGreen,
  "warm-academic": warmAcademic,
  "soft-pastel": softPastel,
  "neo-brutalism": neoBrutalism,
  "bauhaus": bauhausT,
  "keynote-light": keynoteLight,
  "tokyo-night": tokyoNight,
  "vic-medical": vicMedical,
};
