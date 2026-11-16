"""模板 H：商务报告型。整条藏青色块章节标题、白字，稳重正式。适合公司号、行业报告、机构通知、投资分析。

排版逻辑在 _engine.py，这里只选版式和配色；接口说明见 b.py。语法见 references/模板语法.md。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "商务报告型"
LAYOUT, PALETTE = "card", "navy"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
