"""模板 B：反思思辨型。章节号用浅蓝底蓝字 [01] 方块，行高疏朗。适合观点、复盘、经验分享。

改编自「当AI撞向医学」的排版器 wechat-article-v2 v3.2 模板 B，去掉了原账号的名片和署名。
排版逻辑在 _engine.py，这里只选版式和配色。语法见 references/模板语法.md。

模板接口（自己加模板时照着写，见 references/自制模板.md）：
    NAME = "显示名"
    render(md: str, footer_lines: list[str]) -> str   # 返回公众号正文 HTML 片段；不合语法时抛 TemplateError
    recolor(配色名) -> 模板                            # 选填：支持「b+green」这种换配色组合
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _engine import TemplateError, build, variant  # noqa: E402,F401

NAME = "反思思辨型"
LAYOUT, PALETTE = "b", "blue"
render = build(LAYOUT, PALETTE)


def recolor(palette: str):
    return variant(NAME, LAYOUT, palette)
