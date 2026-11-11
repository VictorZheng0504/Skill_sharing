#!/usr/bin/env python3
"""把 ppt-master 项目的 svg_final/ 拼成一张 HTML 审阅页（含讲稿），供导出 PPTX 前审阅。

审阅页直接引用导出所用的同一批 SVG，用户在浏览器里看到的就是导出后的版面；
改一页只改 svg_output/ 一处，重新 finalize 后刷新即可。
"""

import argparse
import html
import sys
from pathlib import Path


def build(project: Path, title: str) -> str:
    svgs = sorted((project / "svg_final").glob("*.svg"))
    if not svgs:
        raise SystemExit(f"未找到 {project / 'svg_final'}/*.svg，请先运行 ppt-master 的 finalize_svg.py")
    notes_dir = project / "notes"
    parts = []
    for i, svg in enumerate(svgs, 1):
        note_file = notes_dir / f"{svg.stem}.md"
        note = note_file.read_text(encoding="utf-8").strip() if note_file.exists() else ""
        note_html = f'<details><summary>讲稿</summary><p>{html.escape(note)}</p></details>' if note else ""
        parts.append(
            f'<section id="p{i:02d}"><h2>{i:02d} / {len(svgs)} · {html.escape(svg.stem)}</h2>'
            f'<img src="svg_final/{html.escape(svg.name)}" loading="lazy" alt="{html.escape(svg.stem)}">'
            f"{note_html}</section>"
        )
    return f"""<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<style>
body{{background:#0D1117;color:#E6EDF3;font-family:"PingFang SC","Microsoft YaHei",sans-serif;margin:0 auto;padding:24px 16px;max-width:1280px}}
h1{{font-size:22px}} h2{{font-size:15px;color:#AEB3BA;font-family:Consolas,monospace;font-weight:normal;margin:32px 0 8px}}
img{{width:100%;display:block;border:1px solid #2A313B;background:#fff}}
details{{margin-top:8px;color:#AEB3BA;font-size:15px;line-height:1.7}} summary{{cursor:pointer;color:#2BB8F0}}
p{{white-space:pre-wrap;margin:6px 0 0}}
</style></head><body>
<h1>{html.escape(title)}（共 {len(svgs)} 页，审阅版 = 导出版）</h1>
{''.join(parts)}
</body></html>
"""


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("project", type=Path, help="ppt-master 项目目录（含 svg_final/）")
    ap.add_argument("--title", default="PPT 审阅")
    ap.add_argument("--out", type=Path, help="默认写到 <project>/review.html")
    args = ap.parse_args()
    out = args.out or args.project / "review.html"
    out.write_text(build(args.project, args.title), encoding="utf-8")
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
