"""模板 C：干货教程型。左侧青色竖条 + 01 编号，层级一眼看清，居左排列。适合教程、操作指南、医学科普、清单式干货。

排版逻辑在 _engine.py，这里只选版式和配色；接口说明见 b.py。语法见 references/模板语法.md。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "干货教程型"
LAYOUT, PALETTE = "bar", "teal"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
