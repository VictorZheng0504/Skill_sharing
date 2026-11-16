"""模板 L：文艺手账型。整篇米黄纸面底色，马克笔划过的章节标题，虚线便签题记、带投影的便签金句，列表用 ✓ 和 ①②。适合随笔、读书、旅行、生活记录。

和 b 完全不同的一套：正文字色、字间距、对齐、列表都单独设计。排版逻辑在 _engine.py，这里只选版式和配色；
接口说明见 b.py，语法见 references/模板语法.md（和其他模板通用，稿子不用改）。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "文艺手账型"
LAYOUT, PALETTE = "journal", "yellow"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
