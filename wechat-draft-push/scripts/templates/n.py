"""模板 N：居中活动型。全文居中、短句节奏，章节标题是主色胶囊，金句是大圆角色块，文末虚线信息框。适合活动预告、产品发布、招募通知、节日祝福。正文要短句，长段落居中会难读。

和 b 完全不同的一套：正文字色、字间距、对齐、列表都单独设计。排版逻辑在 _engine.py，这里只选版式和配色；
接口说明见 b.py，语法见 references/模板语法.md（和其他模板通用，稿子不用改）。
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "居中活动型"
LAYOUT, PALETTE = "event", "orange"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
