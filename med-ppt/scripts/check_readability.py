#!/usr/bin/env python3
"""检查 PPTX 的显式字号与页面文字密度。

默认门槛：正文建议不小于 18 pt，页脚不小于 9 pt，任何非页脚文字小于 12 pt 为阻塞问题。
建议门槛产生 warning，只有阻塞问题返回 1；--strict 使 warning 也返回 1。
只能检查 PPTX 中显式写入的字号；从母版继承且无显式字号的文字会计入未解析数量。
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path

from pptx import Presentation
from pptx.shapes.group import GroupShape


@dataclass
class Issue:
    slide: int
    level: str
    message: str


def walk_shapes(shapes):
    for shape in shapes:
        if isinstance(shape, GroupShape):
            yield from walk_shapes(shape.shapes)
        else:
            yield shape


def reading_units(text: str) -> int:
    """中日韩文按字计，其他文字按词计，用于跨语言的粗略密度门槛。"""
    cjk = len(re.findall(r"[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]", text))
    latin = len(re.findall(r"\b[A-Za-z0-9][A-Za-z0-9'_.+−-]*\b", text))
    return cjk + latin


def inspect(path: Path, body_min: float = 18.0, footer_min: float = 9.0,
            hard_min: float = 12.0, max_units: int = 90,
            max_text_boxes: int = 32) -> tuple[list[Issue], dict]:
    prs = Presentation(str(path))
    slide_h = prs.slide_height
    issues: list[Issue] = []
    unresolved = 0

    for slide_no, slide in enumerate(prs.slides, 1):
        all_text = []
        text_boxes = 0
        hard_small = []
        body_small = []
        footer_small = []
        for shape in walk_shapes(slide.shapes):
            if not getattr(shape, "has_text_frame", False) or not shape.text_frame.text.strip():
                continue
            text_boxes += 1
            all_text.append(shape.text_frame.text)
            is_footer = shape.top >= slide_h * 0.88
            seen_sizes = set()
            for paragraph in shape.text_frame.paragraphs:
                if not paragraph.runs:
                    unresolved += 1
                for run in paragraph.runs:
                    if run.font.size is None:
                        unresolved += 1
                        continue
                    seen_sizes.add(round(run.font.size.pt, 2))
            if not seen_sizes:
                continue
            minimum = min(seen_sizes)
            excerpt = " ".join(shape.text_frame.text.split())[:36]
            if not is_footer and minimum < hard_min:
                hard_small.append((minimum, excerpt))
            elif is_footer and minimum < footer_min:
                footer_small.append((minimum, excerpt))
            elif not is_footer and minimum < body_min:
                body_small.append((minimum, excerpt))

        if hard_small:
            minimum, excerpt = min(hard_small)
            issues.append(Issue(
                slide_no,
                "ERROR",
                f"{len(hard_small)} 个正文框小于 {hard_min:g} pt（最小 {minimum:g} pt；例：{excerpt}）",
            ))
        if body_small:
            minimum, excerpt = min(body_small)
            issues.append(Issue(
                slide_no,
                "WARNING",
                f"{len(body_small)} 个正文框小于建议 {body_min:g} pt（最小 {minimum:g} pt；例：{excerpt}）",
            ))
        if footer_small:
            minimum, excerpt = min(footer_small)
            issues.append(Issue(
                slide_no,
                "WARNING",
                f"{len(footer_small)} 个页脚框小于 {footer_min:g} pt（最小 {minimum:g} pt；例：{excerpt}）",
            ))

        units = reading_units("\n".join(all_text))
        if units > max_units:
            issues.append(Issue(slide_no, "WARNING", f"文字密度 {units} > 建议 {max_units} 阈值"))
        if text_boxes > max_text_boxes:
            issues.append(Issue(slide_no, "WARNING", f"文本框 {text_boxes} > 建议 {max_text_boxes} 个"))

    stats = {"slides": len(prs.slides), "unresolved_font_runs": unresolved}
    return issues, stats


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("pptx", type=Path)
    ap.add_argument("--body-min", type=float, default=18.0)
    ap.add_argument("--footer-min", type=float, default=9.0)
    ap.add_argument("--hard-min", type=float, default=12.0)
    ap.add_argument("--max-units", type=int, default=90)
    ap.add_argument("--max-text-boxes", type=int, default=32)
    ap.add_argument("--strict", action="store_true", help="warning 也以退出码 1 结束")
    args = ap.parse_args(argv)
    if not args.pptx.is_file():
        print(f"找不到文件：{args.pptx}", file=sys.stderr)
        return 2
    issues, stats = inspect(
        args.pptx,
        body_min=args.body_min,
        footer_min=args.footer_min,
        hard_min=args.hard_min,
        max_units=args.max_units,
        max_text_boxes=args.max_text_boxes,
    )
    for issue in issues:
        print(f"[{issue.level}] 第 {issue.slide} 页：{issue.message}")
    errors = sum(issue.level == "ERROR" for issue in issues)
    warnings = sum(issue.level == "WARNING" for issue in issues)
    print(
        f"可读性检查：{stats['slides']} 页，{errors} 个阻塞问题，{warnings} 个建议，"
        f"{stats['unresolved_font_runs']} 个文字 run 字号未解析"
    )
    return 1 if errors or (args.strict and warnings) else 0


if __name__ == "__main__":
    sys.exit(main())
