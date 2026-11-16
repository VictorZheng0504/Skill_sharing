"""模板 P：图解说明型。章节是「知识点 01」，题记变成「💡 一句话看懂」框，金句变成「划重点」框，有序列表是方块步骤号。适合说明文：讲清楚一个概念、一种病、一项政策、一个操作流程。

排版逻辑在 _engine.py，这里只选版式和配色；接口说明见 b.py，语法见 references/模板语法.md（和其他模板通用，稿子不用改）。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "图解说明型"
LAYOUT, PALETTE = "explain", "blue"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
