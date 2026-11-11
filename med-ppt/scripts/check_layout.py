#!/usr/bin/env python3
"""检查导出 PPTX 中文字框之间的重叠与越界，以及页面上不该出现的内部用语。

ppt-master 把 SVG 的每行文字导出为不换行（wrap=none）的文本框，框宽是导出时估算的文字宽度。
两个文本框的矩形相交，在 PowerPoint 中通常就是文字压在一起；这比渲染预览更可靠，因为预览渲染器的
字体度量与 PowerPoint 不同。只比较文字与文字、文字与页面边界，不比较文字与形状（卡片、条形上的
文字多为有意叠放）。

内部用语：交接给 ppt-master 的约束常被原样写进页脚（"按要求嵌入""按用户确认采用"），或写出未经核实的
声明（"已去标识化"）。这类用语靠文字约束拦不住，所以在这里按词表扫描正文、表格与讲稿。

用法：python3 check_layout.py <deck.pptx> [--tolerance 2]
退出码：0 未发现问题；1 发现重叠、越界或内部用语；2 输入错误。
"""

import argparse
import re
import sys
from pathlib import Path

from pptx import Presentation
from pptx.shapes.group import GroupShape

PX = 914400 / 96  # EMU per px
INTERNAL_TERMS = re.compile(
    r"paper\.md|host-native|\bSVG\b|svg_final|med_brief|facts\.json|\.(?:md|docx|xlsx)\b"
    r"|med-(?:theme|journal|clinical|general)-[a-z-]+|(?:Brand|Style) ?工作区|视觉主题"
    r"|按要求|按用户确认|用户确认|已去标识化|已脱敏|已获.{0,4}知情同意|不承载数据|仅呈现资料|仅表述观察",
    re.I,
)


def text_boxes(shapes):
    for shape in shapes:
        if isinstance(shape, GroupShape):
            yield from text_boxes(shape.shapes)
        elif shape.has_text_frame and shape.text_frame.text.strip() and shape.width and shape.height:
            yield shape


def rect(shape):
    x, y = shape.left / PX, shape.top / PX
    return x, y, x + shape.width / PX, y + shape.height / PX


def overlap(a, b, tol):
    w = min(a[2], b[2]) - max(a[0], b[0])
    h = min(a[3], b[3]) - max(a[1], b[1])
    # 上下相邻的两行因行距常有几像素相交，不算重叠；同一行的文字相交时 h 接近整行高度
    min_h = min(a[3] - a[1], b[3] - b[1])
    return (w, h) if w > tol and h > max(tol, 0.5 * min_h) else None


def find_issues(path, tol):
    prs = Presentation(path)
    slide_w, slide_h = prs.slide_width / PX, prs.slide_height / PX
    issues = []
    for no, slide in enumerate(prs.slides, 1):
        boxes = [(shape, rect(shape)) for shape in text_boxes(slide.shapes)]
        for shape, r in boxes:
            if r[0] < -tol or r[1] < -tol or r[2] > slide_w + tol or r[3] > slide_h + tol:
                issues.append((no, "越界", shape.text_frame.text, ""))
        for i, (a, ra) in enumerate(boxes):
            for b, rb in boxes[i + 1:]:
                hit = overlap(ra, rb, tol)
                if hit:
                    issues.append((no, f"重叠 {hit[0]:.0f}×{hit[1]:.0f}px", a.text_frame.text, b.text_frame.text))
        texts = [shape.text_frame.text for shape, _ in boxes]
        texts += [cell.text for shape in slide.shapes if getattr(shape, "has_table", False) and shape.has_table
                  for row in shape.table.rows for cell in row.cells]
        if slide.has_notes_slide:
            texts.append(slide.notes_slide.notes_text_frame.text)
        for text in texts:
            for match in INTERNAL_TERMS.finditer(text):
                issues.append((no, f"内部用语「{match.group()}」", text, ""))
    return issues


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("pptx", type=Path)
    ap.add_argument("--tolerance", type=float, default=2.0, help="忽略小于该像素的相交（默认 2）")
    args = ap.parse_args(argv)
    if not args.pptx.is_file():
        print(f"找不到文件：{args.pptx}", file=sys.stderr)
        return 2
    issues = find_issues(args.pptx, args.tolerance)
    for no, kind, a, b in issues:
        clip = lambda s: s.replace("\n", " ")[:30]
        print(f"第 {no} 页 {kind}：「{clip(a)}」" + (f" ↔ 「{clip(b)}」" if b else ""))
    print(f"共 {len(issues)} 处" if issues else "未发现文字重叠、越界或内部用语")
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())
