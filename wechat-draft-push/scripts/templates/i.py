"""模板 I：极简黑白型。只有灰色小编号和黑色标题，没有色块，最大化留白。适合深度长文、评论、严肃话题，或者不想被样式抢戏的时候。

排版逻辑在 _engine.py，这里只选版式和配色；接口说明见 b.py。语法见 references/模板语法.md。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "极简黑白型"
LAYOUT, PALETTE = "minimal", "ink"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
