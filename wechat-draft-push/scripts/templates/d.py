"""模板 D：清新生活型。实心圆数字 + 浅绿圆角金句，圆润亲和。适合健康、生活方式、育儿、轻松科普。

排版逻辑在 _engine.py，这里只选版式和配色；接口说明见 b.py。语法见 references/模板语法.md。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "清新生活型"
LAYOUT, PALETTE = "circle", "green"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
