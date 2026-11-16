#!/usr/bin/env python3
"""重新生成模板展示图：每张拼 8 套模板，用同一篇示例文章排版。

    python3 生成展示图.py                  # 生成 4 列的 PNG 拼图，放在本文件夹（覆盖旧图）
    python3 生成展示图.py --jpg 某个文件夹   # 另外生成 2 列竖版 JPG（1MB 以内），适合放进公众号文章

模板有增减时不用改这里：套数、分组、文件名都按 scripts/templates/ 里的模板自动算。
新加的模板记得在下面 SCENE 里补一句"适合什么文章"。

需要 Node.js 和 Playwright（截图用）：npm install playwright && npx playwright install chromium
"""
from __future__ import annotations

import argparse
import html
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILL = HERE.parent
sys.dont_write_bytecode = True  # 不在 Skill 目录里留 __pycache__
sys.path.insert(0, str(SKILL / "scripts"))
import wechat  # noqa: E402

PER_IMAGE = 8
SCENE = {
    "b": "观点 · 复盘 · 经验分享", "c": "教程 · 操作指南 · 科普干货", "d": "健康 · 生活方式 · 育儿",
    "e": "传统文化 · 节日 · 诗词", "f": "个人成长 · 读书笔记", "g": "科技资讯 · AI 工具 · 评测",
    "h": "公司号 · 行业报告 · 通知", "i": "深度长文 · 评论 · 严肃话题", "j": "情感 · 故事 · 人物访谈",
    "k": "人物 · 品牌故事 · 生活方式", "l": "随笔 · 读书 · 旅行记录", "m": "研究解读 · 文献 · 专业内容",
    "n": "活动预告 · 产品发布 · 招募", "o": "好物推荐 · 清单 · 攻略", "p": "说明文 · 概念 / 流程讲解",
    "q": "介绍文 · 机构 / 产品 / 人物",
}

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{width:%(page)dpx;background:linear-gradient(160deg,#eef1f6 0%%,#f7f5f2 100%%);
 font-family:-apple-system,"PingFang SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif;color:#1f2329;padding:56px 48px 44px}
header{margin-bottom:40px}
h1{font-size:%(h1)dpx;font-weight:800;letter-spacing:2px}
h1 small{font-size:24px;font-weight:600;color:#8a8f99;margin-left:14px;letter-spacing:1px}
.sub{margin-top:14px;font-size:%(sub)dpx;color:#5b616e;letter-spacing:1px}
.sub b{color:#1f2329}
.grid{display:grid;grid-template-columns:repeat(%(cols)d,372px);gap:32px 24px}
.tile{background:#fff;border-radius:18px;box-shadow:0 6px 24px rgba(30,40,60,.08);overflow:hidden}
.head{padding:16px 18px 14px;border-bottom:1px solid #f0f1f3}
.row{display:flex;align-items:center;gap:10px}
.letter{width:34px;height:34px;border-radius:9px;background:#1f2329;color:#fff;font-size:19px;font-weight:800;
 display:flex;align-items:center;justify-content:center}
.name{font-size:21px;font-weight:700;letter-spacing:1px}
.def{font-size:13px;font-weight:700;color:#fff;background:#0b7d8a;border-radius:20px;padding:3px 10px;letter-spacing:1px}
.scene{margin-top:9px;font-size:15px;color:#7a808c;letter-spacing:.5px}
.screen{position:relative;height:640px;overflow:hidden;padding:20px 16px 0}
.screen h2{font-size:19px;line-height:1.45;font-weight:700;color:#222;margin-bottom:6px}
.screen .meta{font-size:13px;color:#9a9a9a;margin-bottom:16px}
.screen .content{font-size:15px;color:#333;word-wrap:break-word}
.screen .content p{margin:0}
.screen .content .list-paddingleft-1{padding-left:1.2em}
.screen:after{content:"";position:absolute;left:0;right:0;bottom:0;height:120px;
 background:linear-gradient(rgba(255,255,255,0),#fff 85%%)}
footer{margin-top:34px;font-size:17px;color:#8a8f99;text-align:center;letter-spacing:1px}
"""


def page_html(group: list[str], k: int, total: int, count: int, meta: dict, body: str, cols: int) -> str:
    palettes = len(getattr(sys.modules.get("_engine"), "PALETTES", {})) or 10
    tiles = []
    for n in group:
        tpl = wechat.load_template(n)
        frag = wechat.compile_html(meta, body, {}, n)
        badge = '<span class="def">默认</span>' if n == wechat.DEFAULT_TEMPLATE else ''
        scene = f'<div class="scene">适合：{SCENE[n]}</div>' if n in SCENE else ''
        tiles.append(
            f'<div class="tile"><div class="head"><div class="row"><span class="letter">{n.upper()}</span>'
            f'<span class="name">{html.escape(getattr(tpl, "NAME", n))}</span>{badge}</div>{scene}</div>'
            f'<div class="screen"><h2>{html.escape(meta["title"])}</h2><div class="meta">示例文章</div>'
            f'<div class="content">{frag}</div></div></div>')
    wide = cols >= 4
    css = CSS % dict(page=cols * 372 + (cols - 1) * 24 + 96, cols=cols, h1=46 if wide else 38, sub=22 if wide else 20)
    return (f'<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>{css}</style></head><body>'
            f'<header><h1>{count} 套公众号排版模板<small>{k} / {total}</small></h1>'
            f'<p class="sub">同一篇文章 · <b>一键换风格</b> · 每套还能换 <b>{palettes} 种配色</b></p></header>'
            f'<div class="grid">{"".join(tiles)}</div>'
            f'<footer>示例：同一篇文章分别用 {group[0].upper()}～{group[-1].upper()} 模板排版的效果</footer>'
            f'</body></html>')


def main() -> None:
    ap = argparse.ArgumentParser(description="重新生成模板展示图")
    ap.add_argument("--jpg", type=Path, help="另外生成 2 列竖版 JPG 到这个文件夹（给公众号文章用）")
    args = ap.parse_args()
    if not shutil.which("node"):
        sys.exit("[停止] 没找到 Node.js。截图要用 Node.js 和 Playwright，见本文件开头的说明")

    meta, body = wechat.parse_article(HERE / "示例文章.md")
    names = wechat.template_names()
    groups = [names[i:i + PER_IMAGE] for i in range(0, len(names), PER_IMAGE)]
    jobs = []
    with tempfile.TemporaryDirectory() as tmp:
        for k, group in enumerate(groups, 1):
            label = f"{group[0].upper()}-{group[-1].upper()}"
            src = Path(tmp) / f"g{k}.html"
            src.write_text(page_html(group, k, len(groups), len(names), meta, body, 4), encoding="utf-8")
            jobs.append(dict(html=str(src), out=str(HERE / f"模板展示-{k}（{label}）.png"),
                             width=4 * 372 + 3 * 24 + 96, scale=2, type="png", maxBytes=0))
            if args.jpg:
                args.jpg.mkdir(parents=True, exist_ok=True)
                src2 = Path(tmp) / f"g{k}-2col.html"
                src2.write_text(page_html(group, k, len(groups), len(names), meta, body, 2), encoding="utf-8")
                jobs.append(dict(html=str(src2), out=str(args.jpg.resolve() / f"模板展示-{k}.jpg"),
                                 width=2 * 372 + 24 + 96, scale=1.5, type="jpeg", maxBytes=950_000))
        job_file = Path(tmp) / "jobs.json"
        job_file.write_text(json.dumps(jobs, ensure_ascii=False), encoding="utf-8")
        result = subprocess.run(["node", str(HERE / "截图.js"), str(job_file)])
        if result.returncode:
            sys.exit("[停止] 截图失败。没装 Playwright 的话：npm install playwright && npx playwright install chromium")
    print(f"完成：{len(names)} 套模板，{len(groups)} 张图")


if __name__ == "__main__":
    main()
