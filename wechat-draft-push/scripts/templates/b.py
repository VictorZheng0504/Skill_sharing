"""模板 B：反思思辨型。章节号用浅蓝底蓝字 [01] 方块，行高疏朗。

改编自「当AI撞向医学」的排版器 wechat-article-v2 v3.2 模板 B，去掉了原账号的名片和署名。
语法见 references/template_b_syntax.md。

模板接口（自己加模板时照着写，见 references/自制模板.md）：
    NAME = "显示名"
    render(md: str, footer_lines: list[str]) -> str   # 返回公众号正文 HTML 片段；不合语法时抛 TemplateError
"""
from __future__ import annotations

import re
from typing import List, Tuple

NAME = "反思思辨型"


class TemplateError(Exception):
    pass


# 微信编辑器会剥掉 <style> 和 class 选择器，所以样式全部内联；字号统一不超过 16px
FONT = ('font-size: 15px;font-family: mp-quote, -apple-system-font, '
        'BlinkMacSystemFont, &quot;Helvetica Neue&quot;, &quot;PingFang SC&quot;, '
        '&quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei UI&quot;, '
        '&quot;Microsoft YaHei&quot;, Arial, sans-serif;')
FONT_FAMILY_ONLY = FONT.replace('font-size: 15px;', '')
CODE_FONT = 'font-family: Menlo, Monaco, Consolas, &quot;Courier New&quot;, monospace;'
COLOR_BLUE = 'rgb(15, 75, 235)'
BADGE_BG = '#DCE5FC'
HIGHLIGHT = '#cddbff'

H1_RE = re.compile(r'^#\s+(.+?)\s*$')
H2_RE = re.compile(r'^##\s+(.+?)\s*$')
OL_RE = re.compile(r'^(\d+)\.\s+(.+?)\s*$')
UL_RE = re.compile(r'^[-*]\s+(.+?)\s*$')
IMG_HOLD_RE = re.compile(r'^\[图片占位[：:]\s*(.+?)\]\s*$')
IMG_RE = re.compile(r'^\[图片[：:]\s*(\S+?)\s*\|\s*(.+?)\]\s*$')
PQ_RE = re.compile(r'^>>(?:\s(.*)|)$')
BQ_RE = re.compile(r'^>\s*(.*)$')
HR_RE = re.compile(r'^---+\s*$')
CN_NUM_RE = re.compile(r'^[一二三四五六七八九十百千万]+[、.\s]\s*')


def lint(text: str) -> None:
    errors = []
    for i, line in enumerate(text.splitlines(), 1):
        s = line.strip()
        if s.startswith('### '):
            errors.append(f'  第 {i} 行：不支持 ### 三级标题，改成 **加粗段** → {s[:30]}')
        elif s.startswith('```'):
            errors.append(f'  第 {i} 行：不支持代码块，短命令用 `行内代码` → {s[:30]}')
        elif s.startswith('|') and s.endswith('|') and '|' in s[1:-1]:
            errors.append(f'  第 {i} 行：不支持表格，改成列表')
    if errors:
        raise TemplateError('稿子不符合模板 B 语法：\n' + '\n'.join(errors))


def _esc(text: str) -> str:
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def inline(text: str) -> str:
    """段内 **加粗** 和 `行内代码`。"""
    out = []
    for part in re.split(r'(\*\*[^*]+?\*\*|`[^`]+?`)', text):
        if not part:
            continue
        if part.startswith('**') and part.endswith('**'):
            out.append(f'<strong><span leaf="">{part[2:-2]}</span></strong>')
        elif part.startswith('`') and part.endswith('`') and len(part) > 2:
            out.append(f'<span style="background: #f2f2f2;padding: 2px 6px;border-radius: 3px;'
                       f'font-size: 14px;color: #333333;word-break: break-all;{CODE_FONT}">'
                       f'<span leaf="">{_esc(part[1:-1])}</span></span>')
        else:
            out.append(f'<span leaf="">{part}</span>')
    return ''.join(out)


def paragraph(text: str) -> str:
    text = text.strip()
    s = text
    if s.startswith('**') and s.endswith('**') and '**' not in s[2:-2]:
        return (f'<p style="margin-bottom: 12px;line-height: 1.85em;">'
                f'<strong><span leaf="" style="{FONT}">{s[2:-2]}</span></strong></p>\n')
    if '**' not in text and '`' not in text:
        return f'<p style="margin-bottom: 12px;line-height: 1.85em;"><span leaf="" style="{FONT}">{text}</span></p>\n'
    return f'<p style="margin-bottom: 12px;line-height: 1.85em;"><span style="{FONT}">{inline(text)}</span></p>\n'


def h1(text: str) -> str:
    return (f'<p style="margin-bottom: 8px;line-height: 1.6em;text-align: center;">'
            f'<strong><span leaf="" style="font-size: 16px;color: #222222;letter-spacing: 1px;{FONT_FAMILY_ONLY}">'
            f'{text}</span></strong></p>\n')


def section_title(title: str, idx: int) -> str:
    # 稿子里写「## 一、标题」，自动去掉中文序号，换成 01、02 方块
    cleaned = CN_NUM_RE.sub('', title).strip()
    cleaned = re.sub(r'^[^一-鿿a-zA-Z0-9（(\[【"“]+', '', cleaned).strip()
    return (f'<section style="margin: 28px 0 14px;line-height: 1.6em;">'
            f'<span style="display: inline-block;background: {BADGE_BG};color: {COLOR_BLUE};font-size: 13px;'
            f'font-weight: bold;padding: 3px 10px;border-radius: 4px;margin-right: 10px;letter-spacing: 1px;'
            f'vertical-align: middle;"><span leaf="">{idx:02d}</span></span>'
            f'<span leaf="" style="font-size: 16px;font-weight: bold;color: #222222;vertical-align: middle;">'
            f'{cleaned}</span></section>\n')


def blockquote(text: str) -> str:
    return (f'<section style="margin: 12px auto 20px;padding: 12px 18px;background: #f7f7f7;border-radius: 6px;'
            f'text-align: center;"><p style="margin: 0;font-size: 14px;color: #666666;line-height: 1.75em;'
            f'font-style: italic;{FONT_FAMILY_ONLY}"><span leaf="">{text}</span></p></section>\n')


def divider() -> str:
    return '<section style="margin: 18px auto;width: 30%;border-top: 1px solid #eeeeee;"><span leaf=""><br></span></section>\n'


def pullquote(paras: List[str]) -> str:
    """`>> 文字` 荧光笔式；`>> 「文字」` 角括号式。金句本身加粗，句内 ** 去掉。"""
    paras = [p.replace('**', '') for p in paras]
    bracket = paras[0].startswith('「') and paras[-1].endswith('」')
    rows = []
    for k, para in enumerate(paras):
        margin = 'margin: 0;' if k == 0 else 'margin: 8px 0 0;'
        if bracket:
            body = para[1:] if k == 0 else para
            body = body[:-1] if k == len(paras) - 1 else body
            mark = f'<span leaf="" style="font-size: 16px;color: {COLOR_BLUE};{FONT_FAMILY_ONLY}">%s</span>'
            rows.append(f'<p style="{margin}line-height: 1.75em;"><strong>{mark % "「" if k == 0 else ""}'
                        f'<span style="font-size: 15px;color: #1a1a1a;{FONT_FAMILY_ONLY}">{inline(body)}</span>'
                        f'{mark % "」" if k == len(paras) - 1 else ""}</strong></p>\n')
        else:
            rows.append(f'<p style="{margin}line-height: 1.75em;"><strong><span style="font-size: 15px;color: #1a1a1a;'
                        f'padding: 0 2px;background: linear-gradient(transparent 50%, {HIGHLIGHT} 50%, {HIGHLIGHT} 90%, '
                        f'transparent 90%);{FONT_FAMILY_ONLY}">{inline(para)}</span></strong></p>\n')
    pad = 'padding: 0 4px;' if bracket else ''
    return f'<section style="margin: 20px 0;{pad}">\n' + ''.join(rows) + '</section>\n'


def image_placeholder(desc: str, idx: int) -> str:
    return (f'<section style="margin: 16px 0;padding: 24px 12px;border: 2px dashed #1876EC;background: #f4faff;'
            f'text-align: center;border-radius: 4px;"><p style="margin: 0;font-size: 14px;color: #1876EC;'
            f'font-weight: bold;line-height: 1.6;"><span leaf="">📷 图片 {idx} · 请在此处上传</span></p>'
            f'<p style="margin: 6px 0 0;font-size: 13px;color: #666;line-height: 1.6;"><span leaf="">{desc}</span></p>'
            f'</section>\n')


def image(url: str, alt: str) -> str:
    return (f'<section style="text-align: center;" nodeleaf=""><img class="rich_pages wxw-img" data-s="300,640" '
            f'type="block" src="{url}" alt="{alt}"></section>\n')


def listing(items: List[Tuple[str, str]], ordered: bool) -> str:
    tag = 'ol' if ordered else 'ul'
    out = [f'<{tag} class="list-paddingleft-1">\n']
    def cell(text: str, tag: str, style: str = '') -> str:
        # 纯文本用 <span leaf> 直接包，和原排版器输出一致；有加粗或行内代码才拆段
        if text.startswith('**') and text.endswith('**') and '**' not in text[2:-2] and '`' not in text:
            inner = f'<strong style="{FONT}"><span leaf="">{text[2:-2]}</span></strong>'
        elif '**' in text or '`' in text:
            inner = f'<span style="{FONT}">{inline(text)}</span>'
        else:
            inner = f'<span leaf="" style="{FONT}">{text}</span>'
        return f'<{tag} style="{style}">{inner}</{tag}>' if tag else inner

    for title, desc in items:
        out.append(f'<li>{cell(title, "")}')
        if desc:
            out.append(cell(desc, 'section', 'margin-bottom: 8px;line-height: 1.75em;'))
        out.append('</li>\n')
    out.append(f'</{tag}>\n')
    return ''.join(out)


def footer(lines: List[str]) -> str:
    """文末信息卡：几行文字（如「文字 · 张三」「出品 · 某某公众号」），不配就不出。"""
    if not lines:
        return ''
    rows = ''.join(f'<p style="{"margin: 0;" if i == 0 else "margin: 6px 0 0;"}width: 100%;">'
                   f'<span leaf="">{line}</span></p>' for i, line in enumerate(lines))
    return ('<section style="margin-top: 32px;width: 100%;padding: 0px 12px;">'
            '<section style="width: 100%;border: 1px solid #1876EC;padding: 8px;background-color: rgb(244 250 255);">'
            '<section style="width: 100%;background: rgba(255, 255, 255, 0.8);padding: 12px;font-size: 14px;'
            f'color: #333333;line-height: 24px;">{rows}</section></section></section>\n')


def _collect_list(lines, start, ordered):
    item_re = OL_RE if ordered else UL_RE
    items, i = [], start
    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            if i + 1 < len(lines) and not lines[i + 1].strip():
                break
            i += 1
            continue
        m = item_re.match(line)
        if not m:
            if line.startswith(('   ', '\t')) and items:  # 缩进行并进上一条
                t, d = items[-1]
                items[-1] = (t, (d + ' ' + line.strip()).strip())
                i += 1
                continue
            break
        items.append(((m.group(2) if ordered else m.group(1)).strip(), ''))
        i += 1
    return items, i


def _collect_pullquote(lines, start):
    paras, cur, i = [], [], start
    while i < len(lines):
        m = PQ_RE.match(lines[i].rstrip())
        if not m:
            break
        content = (m.group(1) or '').strip()
        if content:
            cur.append(content)
        elif cur:  # 单独一行 >> 表示卡内换段
            paras.append(' '.join(cur))
            cur = []
        i += 1
    if cur:
        paras.append(' '.join(cur))
    return paras, i


def _starts_block(line: str) -> bool:
    return any(r.match(line) for r in (H1_RE, H2_RE, OL_RE, UL_RE, IMG_HOLD_RE, IMG_RE, BQ_RE, HR_RE))


def render(md: str, footer_lines: List[str]) -> str:
    lint(md)
    lines = md.splitlines()
    out, i, sec, img_idx = [], 0, 0, 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            i += 1
            continue
        if H1_RE.match(line):
            out.append(h1(H1_RE.match(line).group(1)))
        elif H2_RE.match(line):
            sec += 1
            out.append(section_title(H2_RE.match(line).group(1), sec))
        elif PQ_RE.match(line):
            paras, i = _collect_pullquote(lines, i)
            if paras:
                out.append(pullquote(paras))
            continue
        elif BQ_RE.match(line):
            quote = []
            while i < len(lines) and BQ_RE.match(lines[i].rstrip()) and not PQ_RE.match(lines[i].rstrip()):
                quote.append(BQ_RE.match(lines[i].rstrip()).group(1).strip())
                i += 1
            out.append(blockquote(' '.join(quote).strip()))
            continue
        elif HR_RE.match(line):
            out.append(divider())
        elif IMG_HOLD_RE.match(line):
            img_idx += 1
            out.append(image_placeholder(IMG_HOLD_RE.match(line).group(1).strip(), img_idx))
        elif IMG_RE.match(line):
            m = IMG_RE.match(line)
            out.append(image(m.group(1).strip(), m.group(2).strip()))
        elif OL_RE.match(line) or UL_RE.match(line):
            ordered = bool(OL_RE.match(line))
            items, i = _collect_list(lines, i, ordered)
            out.append(listing(items, ordered))
            continue
        else:
            para = [line]
            i += 1
            while i < len(lines) and lines[i].strip() and not _starts_block(lines[i].rstrip()):
                para.append(lines[i].rstrip())
                i += 1
            out.append(paragraph(' '.join(s.strip() for s in para)))
            continue
        i += 1
    out.append(footer(footer_lines))
    return ''.join(out)
