"""模板 K：时尚杂志型。章节上方一条粗黑线 + CHAPTER 01，字间距宽、行距 2 倍、留白大，金句上下黑线居中衬线字，文末 — END —。适合深度人物、品牌故事、生活方式长文。

和 b 完全不同的一套：正文字色、字间距、对齐、列表都单独设计。排版逻辑在 _engine.py，这里只选版式和配色；
接口说明见 b.py，语法见 references/模板语法.md（和其他模板通用，稿子不用改）。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "时尚杂志型"
LAYOUT, PALETTE = "magazine", "brown"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
