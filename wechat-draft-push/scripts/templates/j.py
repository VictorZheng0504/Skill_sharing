"""模板 J：温柔叙事型。圆点编号 + 粉色引号题记 + 居中金句，柔和低调。适合情感、故事、人物访谈、女性向内容。

排版逻辑在 _engine.py，这里只选版式和配色；接口说明见 b.py。语法见 references/模板语法.md。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "温柔叙事型"
LAYOUT, PALETTE = "circle", "pink"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
