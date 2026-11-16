"""模板 M：严谨报告型。衬线字体、首行缩进两格、两端对齐，章节用「1　标题」加细底线，题记是「提要」框，金句是「要点」框。适合研究解读、文献综述、政策分析、医学专业内容。

和 b 完全不同的一套：正文字色、字间距、对齐、列表都单独设计。排版逻辑在 _engine.py，这里只选版式和配色；
接口说明见 b.py，语法见 references/模板语法.md（和其他模板通用，稿子不用改）。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "严谨报告型"
LAYOUT, PALETTE = "report", "navy"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
