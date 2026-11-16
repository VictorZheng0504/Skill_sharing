"""模板 G：科技前沿型。PART 01 胶囊标签、虚线框金句，有产品感。适合科技资讯、AI 工具、产品评测、行业快讯。

排版逻辑在 _engine.py，这里只选版式和配色；接口说明见 b.py。语法见 references/模板语法.md。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "科技前沿型"
LAYOUT, PALETTE = "tag", "purple"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
