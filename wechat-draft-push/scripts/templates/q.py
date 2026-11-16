"""模板 Q：名片介绍型。章节是浅色标题条「01 /」，题记变成深色「简介」横幅，金句是「★ 亮点」框，列表排成一行一项的参数表。适合介绍文：机构、团队、产品、课程、人物介绍。

排版逻辑在 _engine.py，这里只选版式和配色；接口说明见 b.py，语法见 references/模板语法.md（和其他模板通用，稿子不用改）。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "名片介绍型"
LAYOUT, PALETTE = "profile", "navy"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
