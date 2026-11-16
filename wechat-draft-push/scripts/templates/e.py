"""模板 E：国风雅致型。章节标题居中「— 01 —」，题记上下细线，◇◆◇ 分隔，对称有仪式感；默认赭石棕。适合传统文化、节气节日、诗词、机构纪念文章。

排版逻辑在 _engine.py，这里只选版式和配色；接口说明见 b.py。语法见 references/模板语法.md。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "国风雅致型"
LAYOUT, PALETTE = "center", "brown"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
