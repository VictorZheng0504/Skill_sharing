"""模板 O：卡片种草型。灰色页面上每一章是一张白卡片，标题像话题 #1，金句是整块主色白字，列表用圆形数字。适合好物推荐、清单合集、攻略、门店/课程介绍。

和 b 完全不同的一套：正文字色、字间距、对齐、列表都单独设计。排版逻辑在 _engine.py，这里只选版式和配色；
接口说明见 b.py，语法见 references/模板语法.md（和其他模板通用，稿子不用改）。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "卡片种草型"
LAYOUT, PALETTE = "cards", "red"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
