"""模板 F：暖心笔记型。标题下一道橙色粗下划线 + 荧光笔金句，暖色积极。适合个人成长、读书笔记、经验分享。

排版逻辑在 _engine.py，这里只选版式和配色；接口说明见 b.py。语法见 references/模板语法.md。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "暖心笔记型"
LAYOUT, PALETTE = "underline", "orange"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
