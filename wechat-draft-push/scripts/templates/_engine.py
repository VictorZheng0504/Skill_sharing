"""内置模板共用的排版引擎（文件名以 _ 开头，不会被当成模板列出来）。

一套模板 = 一种「版式」+ 一种「配色」：
    版式管章节标题、题记、金句、分隔线、文末信息卡长什么样（LAYOUTS）
    配色管主色、浅底、荧光笔这些颜色（PALETTES）
所以除了直接用 b、c、d……，还能写 `e+blue` 这种组合：用 e 的版式，换成蓝色。

文章语法所有内置模板都一样，见 references/模板语法.md。
"""
from __future__ import annotations

import re
from types import SimpleNamespace
from typing import Callable, Dict, List, Tuple


class TemplateError(Exception):
    pass


# 微信编辑器会剥掉 <style> 和 class 选择器，所以样式全部内联；字号统一不超过 16px
FONT = ('font-size: 15px;font-family: mp-quote, -apple-system-font, '
        'BlinkMacSystemFont, &quot;Helvetica Neue&quot;, &quot;PingFang SC&quot;, '
        '&quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei UI&quot;, '
        '&quot;Microsoft YaHei&quot;, Arial, sans-serif;')
FF = FONT.replace('font-size: 15px;', '')  # 只要字体、不定字号
CODE_FONT = 'font-family: Menlo, Monaco, Consolas, &quot;Courier New&quot;, monospace;'

# ---------------------------------------------------------------- 配色
# primary 主色（章节号、强调）  light 浅色块  highlight 荧光笔
# line 细线 / 虚线框            soft 极浅底色（卡片、占位框背景）
PALETTES: Dict[str, dict] = {
    'blue':   dict(cn='蓝', primary='rgb(15, 75, 235)', light='#DCE5FC', highlight='#cddbff',
                   line='#1876EC', soft='#f4faff'),
    'navy':   dict(cn='藏青', primary='#1f3a5f', light='#dde4ee', highlight='#cfd9e8',
                   line='#3a5a85', soft='#f4f6fa'),
    'green':  dict(cn='绿', primary='#108c5a', light='#dcf3e8', highlight='#c4ecd8',
                   line='#17a96e', soft='#f2fbf6'),
    'red':    dict(cn='红', primary='#b8322a', light='#f8e1de', highlight='#f6cfca',
                   line='#d2463b', soft='#fdf5f4'),
    'orange': dict(cn='橙', primary='#c75a14', light='#fde8d7', highlight='#fbd9bd',
                   line='#ec7a2c', soft='#fff8f2'),
    'purple': dict(cn='紫', primary='#6a3fc9', light='#ebe3fb', highlight='#ddd0fa',
                   line='#7d55db', soft='#f8f5ff'),
    'teal':   dict(cn='青', primary='#0b7d8a', light='#d9f1f4', highlight='#c3e9ee',
                   line='#1aa3b3', soft='#f1fafb'),
    'brown':  dict(cn='棕', primary='#8a5a3c', light='#f1e6dc', highlight='#ead8c8',
                   line='#a06e4c', soft='#faf6f2'),
    'pink':   dict(cn='粉', primary='#c43d6e', light='#fbe3ec', highlight='#f9d0de',
                   line='#e0628e', soft='#fff6f9'),
    'yellow': dict(cn='黄', primary='#9a6b00', light='#fff1c2', highlight='#ffe58a',
                   line='#e0a800', soft='#fffbf0'),
    'ink':    dict(cn='黑', primary='#222222', light='#eeeeee', highlight='#e3e3e3',
                   line='#555555', soft='#f7f7f7'),
}
_PALETTE_ALIAS = {p['cn']: k for k, p in PALETTES.items()}


def palette(name: str) -> dict:
    key = _PALETTE_ALIAS.get(name.strip(), name.strip().lower())
    if key not in PALETTES:
        names = '、'.join(f'{k}（{p["cn"]}）' for k, p in PALETTES.items())
        raise TemplateError(f'没有配色 {name}，可用的有：{names}')
    return PALETTES[key]


# ---------------------------------------------------------------- 解析用的正则

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
        raise TemplateError('稿子不符合排版语法（见 references/模板语法.md）：\n' + '\n'.join(errors))


# ---------------------------------------------------------------- 各版式共用的部件

def _esc(text: str) -> str:
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def inline(text: str, strong: str = '') -> str:
    """段内 **加粗** 和 `行内代码`。strong 给加粗另配样式（比如换成主色），不给就是普通加粗。"""
    out = []
    open_tag = f'<strong style="{strong}">' if strong else '<strong>'
    for part in re.split(r'(\*\*[^*]+?\*\*|`[^`]+?`)', text):
        if not part:
            continue
        if part.startswith('**') and part.endswith('**'):
            out.append(f'{open_tag}<span leaf="">{part[2:-2]}</span></strong>')
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
            f'<strong><span leaf="" style="font-size: 16px;color: #222222;letter-spacing: 1px;{FF}">'
            f'{text}</span></strong></p>\n')


def image_placeholder(desc: str, idx: int, P: dict) -> str:
    return (f'<section style="margin: 16px 0;padding: 24px 12px;border: 2px dashed {P["line"]};background: {P["soft"]};'
            f'text-align: center;border-radius: 4px;"><p style="margin: 0;font-size: 14px;color: {P["line"]};'
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
        # 纯文本用 <span leaf> 直接包；有加粗或行内代码才拆段
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


def clean_title(title: str) -> str:
    # 稿子里写「## 一、标题」，自动去掉中文序号，由版式自己出编号
    cleaned = CN_NUM_RE.sub('', title).strip()
    return re.sub(r'^[^一-鿿a-zA-Z0-9（(\[【"“]+', '', cleaned).strip()


def _title_span(t: str, color: str = '#222222', extra: str = '') -> str:
    return f'<span leaf="" style="font-size: 16px;font-weight: bold;color: {color};{extra}">{t}</span>'


# ---------------------------------------------------------------- 章节标题 (标题, 序号, 配色)

def sec_badge(t, i, P):  # 浅底方块 01（模板 b）
    return (f'<section style="margin: 28px 0 14px;line-height: 1.6em;">'
            f'<span style="display: inline-block;background: {P["light"]};color: {P["primary"]};font-size: 13px;'
            f'font-weight: bold;padding: 3px 10px;border-radius: 4px;margin-right: 10px;letter-spacing: 1px;'
            f'vertical-align: middle;"><span leaf="">{i:02d}</span></span>'
            f'{_title_span(t, extra="vertical-align: middle;")}</section>\n')


def sec_bar(t, i, P):  # 左侧粗竖条
    return (f'<section style="margin: 28px 0 14px;padding: 2px 0 2px 10px;border-left: 4px solid {P["primary"]};'
            f'line-height: 1.6em;"><span leaf="" style="font-size: 14px;font-weight: bold;color: {P["primary"]};'
            f'margin-right: 8px;">{i:02d}</span>{_title_span(t)}</section>\n')


def sec_circle(t, i, P):  # 实心圆数字
    return (f'<section style="margin: 28px 0 14px;line-height: 1.6em;">'
            f'<span style="display: inline-block;width: 24px;height: 24px;line-height: 24px;border-radius: 50%;'
            f'background: {P["primary"]};color: #ffffff;font-size: 13px;font-weight: bold;text-align: center;'
            f'margin-right: 10px;vertical-align: middle;"><span leaf="">{i}</span></span>'
            f'{_title_span(t, extra="vertical-align: middle;")}</section>\n')


def sec_center(t, i, P):  # 居中：上面一行「— 01 —」，下面标题
    return (f'<section style="margin: 32px 0 16px;text-align: center;">'
            f'<p style="margin: 0;line-height: 1.6em;"><span leaf="" style="font-size: 13px;color: {P["primary"]};'
            f'letter-spacing: 3px;">— {i:02d} —</span></p>'
            f'<p style="margin: 4px 0 0;line-height: 1.6em;">{_title_span(t, extra="letter-spacing: 1px;")}</p>'
            f'</section>\n')


def sec_underline(t, i, P):  # 灰色底线 + 一段主色粗下划线
    return (f'<section style="margin: 28px 0 14px;border-bottom: 1px solid #eeeeee;line-height: 1.6em;">'
            f'<span style="display: inline-block;padding-bottom: 6px;border-bottom: 2px solid {P["primary"]};">'
            f'{_title_span(f"{i:02d}", P["primary"], "margin-right: 8px;")}{_title_span(t)}</span></section>\n')


def sec_tag(t, i, P):  # 胶囊标签 PART 01，标题另起一行
    return (f'<section style="margin: 30px 0 14px;line-height: 1.6em;">'
            f'<p style="margin: 0;"><span style="display: inline-block;background: {P["primary"]};color: #ffffff;'
            f'font-size: 12px;font-weight: bold;letter-spacing: 1px;padding: 2px 10px;border-radius: 10px;">'
            f'<span leaf="">PART {i:02d}</span></span></p>'
            f'<p style="margin: 6px 0 0;">{_title_span(t)}</p></section>\n')


def sec_card(t, i, P):  # 整条主色色块，白字
    return (f'<section style="margin: 28px 0 14px;padding: 8px 14px;background: {P["primary"]};border-radius: 6px;'
            f'line-height: 1.6em;">{_title_span(f"{i:02d}", P["light"], "margin-right: 10px;")}'
            f'{_title_span(t, "#ffffff")}</section>\n')


def sec_minimal(t, i, P):  # 灰色小编号 + 主色标题，没有色块
    return (f'<section style="margin: 32px 0 14px;line-height: 1.6em;">'
            f'<p style="margin: 0;"><span leaf="" style="font-size: 13px;color: #aaaaaa;letter-spacing: 2px;">'
            f'{i:02d}</span></p><p style="margin: 2px 0 0;">{_title_span(t, P["primary"])}</p></section>\n')


# ---------------------------------------------------------------- 题记 > (文字, 配色)

def _quote_p(text: str, color: str = '#666666', extra: str = '') -> str:
    return (f'<p style="margin: 0;font-size: 14px;color: {color};line-height: 1.75em;{extra}{FF}">'
            f'<span leaf="">{text}</span></p>')


def quote_gray(text, P):  # 灰底居中斜体（模板 b）
    return (f'<section style="margin: 12px auto 20px;padding: 12px 18px;background: #f7f7f7;border-radius: 6px;'
            f'text-align: center;">{_quote_p(text, extra="font-style: italic;")}</section>\n')


def quote_leftbar(text, P):  # 浅底 + 左细线
    return (f'<section style="margin: 12px 0 20px;padding: 10px 14px;background: {P["soft"]};'
            f'border-left: 3px solid {P["line"]};">{_quote_p(text, "#555555")}</section>\n')


def quote_marks(text, P):  # 居中，前后主色引号
    mark = f'<span leaf="" style="color: {P["primary"]};font-weight: bold;">%s</span>'
    return (f'<section style="margin: 12px auto 20px;padding: 4px 18px;text-align: center;">'
            f'<p style="margin: 0;font-size: 14px;color: #666666;line-height: 1.75em;{FF}">'
            f'{mark % "“ "}<span leaf="">{text}</span>{mark % " ”"}</p></section>\n')


def quote_lines(text, P):  # 居中，上下两条细线
    return (f'<section style="margin: 16px auto 22px;padding: 10px 8px;border-top: 1px solid {P["line"]};'
            f'border-bottom: 1px solid {P["line"]};text-align: center;">'
            f'{_quote_p(text, extra="letter-spacing: 1px;")}</section>\n')


def quote_soft(text, P):  # 圆角浅底卡片
    return (f'<section style="margin: 12px 0 20px;padding: 12px 16px;background: {P["soft"]};border-radius: 8px;">'
            f'{_quote_p(text, "#555555")}</section>\n')


def quote_plain(text, P):  # 只有一条灰色左线
    return (f'<section style="margin: 12px 0 20px;padding-left: 12px;border-left: 2px solid #dddddd;">'
            f'{_quote_p(text, "#888888", "font-style: italic;")}</section>\n')


# ---------------------------------------------------------------- 金句 >>
# 每种版式给一个外框样式和正文风格：highlight 荧光笔 / color 主色字 / plain 深色字
# >> 「原话」 的角括号写法，各版式都用主色角括号

def pullquote(paras: List[str], P: dict, wrap: str, mode: str) -> str:
    paras = [p.replace('**', '') for p in paras]
    bracket = paras[0].startswith('「') and paras[-1].endswith('」')
    rows = []
    for k, para in enumerate(paras):
        margin = 'margin: 0;' if k == 0 else 'margin: 8px 0 0;'
        if bracket:
            body = para[1:] if k == 0 else para
            body = body[:-1] if k == len(paras) - 1 else body
            mark = f'<span leaf="" style="font-size: 16px;color: {P["primary"]};{FF}">%s</span>'
            rows.append(f'<p style="{margin}line-height: 1.75em;"><strong>{mark % "「" if k == 0 else ""}'
                        f'<span style="font-size: 15px;color: #1a1a1a;{FF}">{inline(body)}</span>'
                        f'{mark % "」" if k == len(paras) - 1 else ""}</strong></p>\n')
        elif mode == 'highlight':
            hl = P['highlight']
            rows.append(f'<p style="{margin}line-height: 1.75em;"><strong><span style="font-size: 15px;color: #1a1a1a;'
                        f'padding: 0 2px;background: linear-gradient(transparent 50%, {hl} 50%, {hl} 90%, '
                        f'transparent 90%);{FF}">{inline(para)}</span></strong></p>\n')
        else:
            color = P['primary'] if mode == 'color' else '#1a1a1a'
            rows.append(f'<p style="{margin}line-height: 1.75em;"><strong><span style="font-size: 15px;'
                        f'color: {color};{FF}">{inline(para)}</span></strong></p>\n')
    if wrap == 'b':  # 模板 b 的原样式：没有外框，角括号时左右留一点空
        wrap = 'margin: 20px 0;' + ('padding: 0 4px;' if bracket else '')
    return f'<section style="{wrap.format(**P)}">\n' + ''.join(rows) + '</section>\n'


# ---------------------------------------------------------------- 分隔线 --- (配色)

def div_line(P):  # 灰色细线（模板 b）
    return '<section style="margin: 18px auto;width: 30%;border-top: 1px solid #eeeeee;"><span leaf=""><br></span></section>\n'


def div_short(P):  # 居中一小段主色粗线
    return (f'<section style="margin: 20px auto;width: 40px;border-top: 2px solid {P["primary"]};">'
            f'<span leaf=""><br></span></section>\n')


def _div_text(text: str, color: str, size: int, spacing: int) -> str:
    return (f'<p style="margin: 20px 0;text-align: center;line-height: 1em;"><span leaf="" style="font-size: {size}px;'
            f'color: {color};letter-spacing: {spacing}px;">{text}</span></p>\n')


def div_dots(P):
    return _div_text('• • •', P['primary'], 14, 4)


def div_diamond(P):
    return _div_text('◇ ◆ ◇', P['line'], 12, 4)


def div_stars(P):
    return _div_text('*  *  *', '#bbbbbb', 14, 2)


# ---------------------------------------------------------------- 文末信息卡 (几行文字, 配色)

def _rows(lines: List[str]) -> str:
    return ''.join(f'<p style="{"margin: 0;" if i == 0 else "margin: 6px 0 0;"}width: 100%;">'
                   f'<span leaf="">{line}</span></p>' for i, line in enumerate(lines))


def foot_box(lines, P):  # 主色细框 + 白底卡（模板 b）
    return ('<section style="margin-top: 32px;width: 100%;padding: 0px 12px;">'
            f'<section style="width: 100%;border: 1px solid {P["line"]};padding: 8px;background-color: {P["soft"]};">'
            '<section style="width: 100%;background: rgba(255, 255, 255, 0.8);padding: 12px;font-size: 14px;'
            f'color: #333333;line-height: 24px;">{_rows(lines)}</section></section></section>\n')


def foot_topline(lines, P):  # 上方一条主色线
    return (f'<section style="margin-top: 36px;padding-top: 14px;border-top: 1px solid {P["line"]};font-size: 14px;'
            f'color: #666666;line-height: 24px;">{_rows(lines)}</section>\n')


def foot_soft(lines, P):  # 圆角浅底
    return (f'<section style="margin-top: 32px;padding: 14px 16px;background: {P["soft"]};border-radius: 8px;'
            f'font-size: 14px;color: #333333;line-height: 24px;">{_rows(lines)}</section>\n')


def foot_center(lines, P):  # 居中灰字
    return (f'<section style="margin-top: 36px;text-align: center;font-size: 13px;color: #999999;'
            f'line-height: 22px;">{_rows(lines)}</section>\n')


# ---------------------------------------------------------------- 版式

LAYOUTS: Dict[str, dict] = {
    'b':         dict(cn='方块编号', section=sec_badge, quote=quote_gray, divider=div_line, footer=foot_box,
                      pq=('b', 'highlight')),
    'bar':       dict(cn='左竖条', section=sec_bar, quote=quote_leftbar, divider=div_short, footer=foot_topline,
                      pq=('margin: 20px 0;padding: 12px 16px;background: {soft};border-left: 4px solid {primary};',
                          'plain')),
    'circle':    dict(cn='圆点编号', section=sec_circle, quote=quote_marks, divider=div_dots, footer=foot_soft,
                      pq=('margin: 20px 0;padding: 14px 18px;background: {soft};border-radius: 12px;'
                          'text-align: center;', 'color')),
    'center':    dict(cn='居中对称', section=sec_center, quote=quote_lines, divider=div_diamond, footer=foot_center,
                      pq=('margin: 24px 0;padding: 4px 8px;text-align: center;', 'color')),
    'underline': dict(cn='下划线', section=sec_underline, quote=quote_leftbar, divider=div_short, footer=foot_box,
                      pq=('margin: 20px 0;', 'highlight')),
    'tag':       dict(cn='胶囊标签', section=sec_tag, quote=quote_soft, divider=div_dots, footer=foot_soft,
                      pq=('margin: 20px 0;padding: 12px 16px;border: 1px dashed {line};border-radius: 6px;',
                          'color')),
    'card':      dict(cn='色块卡片', section=sec_card, quote=quote_soft, divider=div_short, footer=foot_soft,
                      pq=('margin: 20px 0;padding: 14px 16px;background: {light};border-radius: 8px;', 'plain')),
    'minimal':   dict(cn='极简', section=sec_minimal, quote=quote_plain, divider=div_stars, footer=foot_center,
                      pq=('margin: 24px 0;padding: 0 8px;text-align: center;', 'plain')),
}


# ================================================================ 和 b 完全不同的五套（k～o）
# 这五套连正文都重新设计：字色、字间距、行距、对齐、首行缩进、列表符号各不相同。
# 数值参考公众号排版的常见建议：正文深灰 #3f3f3f / #595959 不用纯黑，字间距 1px 左右，
# 行距 1.75～2，长文两端对齐，注释 13px；居中对齐只适合短句多的活动、产品介绍类文章。

SERIF = ('font-family: Georgia, &quot;Songti SC&quot;, &quot;STSong&quot;, &quot;SimSun&quot;, '
         '&quot;Noto Serif CJK SC&quot;, serif;')


def body_style(color='#3f3f3f', ls='1px', lh='1.75em', align='justify', indent=False, gap='16px',
               ff=FF, strong=''):
    """一套正文规则。strong 是加粗的样式，可以写 {primary} {highlight} 之类的配色占位。"""
    return dict(color=color, ls=ls, lh=lh, align=align, indent=indent, gap=gap, ff=ff, strong=strong)


def _font(B, size=15, color=None):
    return f'font-size: {size}px;color: {color or B["color"]};letter-spacing: {B["ls"]};{B["ff"]}'


def make_para(B):
    def para(text, P):
        s = text.strip()
        style = (f'margin: 0 0 {B["gap"]};line-height: {B["lh"]};text-align: {B["align"]};'
                 + ('text-indent: 2em;' if B['indent'] else ''))
        if s.startswith('**') and s.endswith('**') and '**' not in s[2:-2]:
            return f'<p style="{style}"><strong><span leaf="" style="{_font(B)}">{s[2:-2]}</span></strong></p>\n'
        return f'<p style="{style}"><span style="{_font(B)}">{inline(s, B["strong"].format(**P))}</span></p>\n'
    return para


def make_list(B, ul_mark, ol_mark, center=False):
    """列表不用 <ol>/<ul>（微信里圆点样式改不了），每条一段，自己画序号；第二行起和文字对齐。"""
    def lst(items, ordered, P):
        rows = []
        strong = B['strong'].format(**P)
        for n, (title, desc) in enumerate(items, 1):
            mark = ol_mark(n, P) if ordered else ul_mark(P)
            if center:
                rows.append(f'<p style="margin: 0 0 6px;line-height: {B["lh"]};text-align: center;">{mark}'
                            f'<span style="{_font(B)}">{inline(title, strong)}</span></p>\n')
                pad = 'text-align: center;'
            else:
                mark = (f'<span style="display: inline-block;width: 1.8em;text-indent: 0;">{mark}</span>')
                rows.append(f'<p style="margin: 0 0 6px;line-height: {B["lh"]};padding-left: 1.8em;'
                            f'text-indent: -1.8em;">{mark}<span style="{_font(B)}">{inline(title, strong)}</span></p>\n')
                pad = 'padding-left: 1.8em;'
            if desc:
                rows.append(f'<p style="margin: -2px 0 10px;line-height: 1.75em;{pad}">'
                            f'<span style="{_font(B, 14, "#7f7f7f")}">{inline(desc, strong)}</span></p>\n')
        return f'<section style="margin: 4px 0 {B["gap"]};">\n' + ''.join(rows) + '</section>\n'
    return lst


def _mark(text, color, size=14, bold=True, extra=''):
    return (f'<span leaf="" style="font-size: {size}px;color: {color};{"font-weight: bold;" if bold else ""}'
            f'{extra}">{text}</span>')


def pq_rows(paras, text_style, mark_color, lh='1.8em'):
    """自定义金句的正文：普通写法整句加粗；「原话」写法前后加主色角括号。"""
    paras = [p.replace('**', '') for p in paras]
    bracket = paras[0].startswith('「') and paras[-1].endswith('」')
    rows = []
    for k, para in enumerate(paras):
        body = para
        if bracket:
            body = body[1:] if k == 0 else body
            body = body[:-1] if k == len(paras) - 1 else body
        left = _mark('「', mark_color, 16) if bracket and k == 0 else ''
        right = _mark('」', mark_color, 16) if bracket and k == len(paras) - 1 else ''
        rows.append(f'<p style="margin: {"0" if k == 0 else "8px 0 0"};line-height: {lh};"><strong>{left}'
                    f'<span style="{text_style}">{inline(body)}</span>{right}</strong></p>\n')
    return ''.join(rows)


# ---------------------------------------------------------------- k 时尚杂志：粗黑线 + CHAPTER，留白大，字距宽

K_BODY = body_style(color='#3f3f3f', ls='1.2px', lh='2em', gap='20px', strong='color: #111111;')


def k_section(t, i, P):
    return (f'<section style="margin: 40px 0 20px;padding-top: 10px;border-top: 2px solid #111111;">'
            f'<p style="margin: 0;line-height: 1.6em;">{_mark(f"CHAPTER {i:02d}", P["primary"], 12, True, "letter-spacing: 3px;")}</p>'
            f'<p style="margin: 6px 0 0;line-height: 1.6em;">'
            f'<span leaf="" style="font-size: 16px;font-weight: bold;color: #111111;letter-spacing: 2px;">{t}</span></p>'
            f'</section>\n')


def k_quote(text, P):
    return (f'<section style="margin: 8px 0 28px;">'
            f'<p style="margin: 0;line-height: 1.9em;"><span leaf="" style="font-size: 14px;color: #7f7f7f;'
            f'letter-spacing: 1.5px;font-style: italic;{SERIF}">{text}</span></p>'
            f'<section style="margin-top: 10px;width: 28px;border-top: 2px solid {P["primary"]};">'
            f'<span leaf=""><br></span></section></section>\n')


def k_pq(paras, P):
    return (f'<section style="margin: 32px 6px;padding: 18px 6px;border-top: 1px solid #111111;'
            f'border-bottom: 1px solid #111111;text-align: center;">\n'
            + pq_rows(paras, f'font-size: 16px;color: #111111;letter-spacing: 1.5px;{SERIF}', P['primary'], '1.9em')
            + '</section>\n')


def k_divider(P):
    return _div_text('§', '#a5a5a5', 14, 0)


def k_footer(lines, P):
    rows = ''.join(f'<p style="margin: 4px 0 0;">{_mark(l, "#7f7f7f", 13, False, "letter-spacing: 1px;")}</p>'
                   for l in lines)
    return (f'<section style="margin-top: 44px;text-align: center;line-height: 22px;">'
            f'<p style="margin: 0 0 10px;">{_mark("— END —", "#111111", 12, True, "letter-spacing: 4px;")}</p>'
            f'{rows}</section>\n')


# ---------------------------------------------------------------- l 文艺手账：米色纸面、马克笔标题、便签金句

L_BODY = body_style(color='#4a4a4a', ls='1px', lh='1.9em', align='left', gap='16px',
                    strong='background: linear-gradient(transparent 60%, {highlight} 60%);')


def l_page(P):
    return f'<section style="padding: 20px 16px 24px;background: {P["soft"]};border-radius: 12px;">\n'


def l_section(t, i, P):
    return (f'<section style="margin: 30px 0 14px;line-height: 1.6em;">'
            f'{_mark(f"No.{i}", P["primary"], 13, True, "margin-right: 8px;letter-spacing: 1px;")}'
            f'<span style="display: inline-block;padding: 0 6px;background: linear-gradient(transparent 45%, '
            f'{P["highlight"]} 45%, {P["highlight"]} 92%, transparent 92%);">'
            f'<span leaf="" style="font-size: 16px;font-weight: bold;color: #333333;letter-spacing: 1px;">{t}</span>'
            f'</span></section>\n')


def l_quote(text, P):
    return (f'<section style="margin: 6px 0 22px;padding: 12px 14px;background: #ffffff;'
            f'border: 1px dashed {P["line"]};border-radius: 8px;">'
            f'<p style="margin: 0;line-height: 1.85em;">{_mark("✎ ", P["primary"], 14, False)}'
            f'<span leaf="" style="font-size: 14px;color: #7f7f7f;letter-spacing: 1px;">{text}</span></p></section>\n')


def l_pq(paras, P):
    return (f'<section style="margin: 24px 12px;padding: 14px 16px;background: {P["light"]};border-radius: 3px;'
            f'box-shadow: 3px 3px 0 {P["highlight"]};">\n'
            + pq_rows(paras, f'font-size: 15px;color: #333333;letter-spacing: 1px;{FF}', P['primary'])
            + '</section>\n')


def l_divider(P):
    return _div_text('～ ～ ～', P['line'], 14, 2)


def l_footer(lines, P):
    rows = ''.join(f'<p style="margin: 4px 0 0;">{_mark(l, "#7f7f7f", 13, False, "letter-spacing: 1px;")}</p>'
                   for l in lines)
    return (f'<section style="margin-top: 32px;padding-top: 14px;border-top: 1px dashed {P["line"]};'
            f'text-align: center;line-height: 22px;">{rows}</section>\n')


# ---------------------------------------------------------------- m 严谨报告：衬线字、首行缩进、两端对齐、提要 / 要点框

M_BODY = body_style(color='#333333', ls='0.5px', lh='1.85em', indent=True, gap='12px', ff=SERIF,
                    strong='color: {primary};')


def m_section(t, i, P):
    return (f'<section style="margin: 30px 0 14px;padding-bottom: 6px;border-bottom: 1px solid #dddddd;'
            f'line-height: 1.6em;"><span leaf="" style="font-size: 16px;font-weight: bold;color: {P["primary"]};'
            f'{SERIF}">{i}　{t}</span></section>\n')


def m_quote(text, P):
    return (f'<section style="margin: 6px 0 24px;padding: 12px 14px;border: 1px solid #dddddd;background: #fafafa;">'
            f'<p style="margin: 0 0 4px;">{_mark("提　要", P["primary"], 13, True, "letter-spacing: 2px;")}</p>'
            f'<p style="margin: 0;line-height: 1.8em;text-align: justify;"><span leaf="" style="font-size: 14px;'
            f'color: #595959;{SERIF}">{text}</span></p></section>\n')


def m_pq(paras, P):
    return (f'<section style="margin: 20px 0;border: 1px solid {P["line"]};">'
            f'<p style="margin: 0;padding: 3px 12px;background: {P["primary"]};">'
            f'{_mark("要　点", "#ffffff", 12, True, "letter-spacing: 2px;")}</p>'
            f'<section style="padding: 10px 14px;">\n'
            + pq_rows(paras, f'font-size: 15px;color: #222222;{SERIF}', P['primary'])
            + '</section></section>\n')


def m_divider(P):
    return '<section style="margin: 20px 0;border-top: 1px solid #dddddd;"><span leaf=""><br></span></section>\n'


def m_footer(lines, P):
    rows = ''.join(f'<p style="margin: 4px 0 0;">{_mark(l, "#595959", 13, False, SERIF)}</p>' for l in lines)
    return (f'<section style="margin-top: 36px;padding-top: 10px;border-top: 3px double #a5a5a5;'
            f'line-height: 22px;">{rows}</section>\n')


# ---------------------------------------------------------------- n 居中活动：全文居中、胶囊标题、短句节奏

N_BODY = body_style(color='#3f3f3f', ls='1px', lh='2em', align='center', gap='18px', strong='color: {primary};')


def n_section(t, i, P):
    return (f'<section style="margin: 36px 0 18px;text-align: center;line-height: 1.6em;">'
            f'<p style="margin: 0 0 6px;">{_mark(f"· {i:02d} ·", P["primary"], 12, True, "letter-spacing: 3px;")}</p>'
            f'<span style="display: inline-block;padding: 6px 22px;background: {P["primary"]};border-radius: 20px;">'
            f'<span leaf="" style="font-size: 16px;font-weight: bold;color: #ffffff;letter-spacing: 2px;">{t}</span>'
            f'</span></section>\n')


def n_quote(text, P):
    return (f'<section style="margin: 8px 0 26px;text-align: center;">'
            f'<p style="margin: 0;line-height: 1.9em;"><span leaf="" style="font-size: 14px;color: #7f7f7f;'
            f'letter-spacing: 1.5px;">{text}</span></p>'
            f'<p style="margin: 8px 0 0;">{_mark("▼", P["line"], 10, False)}</p></section>\n')


def n_pq(paras, P):
    return (f'<section style="margin: 24px 0;padding: 16px 12px;background: {P["light"]};border-radius: 14px;'
            f'text-align: center;">\n'
            + pq_rows(paras, f'font-size: 16px;color: #222222;letter-spacing: 1px;{FF}', P['primary'])
            + '</section>\n')


def n_divider(P):
    return _div_text('✦', P['primary'], 12, 0)


def n_footer(lines, P):
    rows = ''.join(f'<p style="margin: 4px 0 0;">{_mark(l, "#595959", 13, False, "letter-spacing: 1px;")}</p>'
                   for l in lines)
    return (f'<section style="margin-top: 36px;padding: 14px 12px;border: 1px dashed {P["line"]};border-radius: 14px;'
            f'text-align: center;line-height: 22px;">{rows}</section>\n')


# ---------------------------------------------------------------- o 卡片种草：灰底页面，每章一张白卡片，话题式标题

O_BODY = body_style(color='#333333', ls='0.5px', lh='1.8em', align='left', gap='12px', strong='color: {primary};')


def o_page(P):
    return '<section style="padding: 12px 10px;background: #f4f4f6;border-radius: 14px;">\n'


def o_chapter(P):
    return ('<section style="margin: 12px 0;padding: 16px 14px 6px;background: #ffffff;border-radius: 12px;'
            'box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);">\n')


def o_section(t, i, P):
    return (f'<p style="margin: 0 0 12px;line-height: 1.6em;">{_mark(f"#{i} ", P["primary"], 16)}'
            f'<span leaf="" style="font-size: 16px;font-weight: bold;color: #222222;">{t}</span></p>\n')


def o_quote(text, P):
    return (f'<section style="margin: 6px 0 14px;padding: 4px 10px;text-align: center;">'
            f'<p style="margin: 0;line-height: 1.85em;"><span leaf="" style="font-size: 14px;color: #7f7f7f;">'
            f'{text}</span></p></section>\n')


def o_pq(paras, P):
    return (f'<section style="margin: 14px 0;padding: 12px 14px;background: {P["primary"]};border-radius: 10px;">\n'
            + pq_rows(paras, f'font-size: 15px;color: #ffffff;{FF}', P['light'])
            + '</section>\n')


def o_divider(P):
    return '<section style="margin: 14px 0;border-top: 1px dashed #e5e5e5;"><span leaf=""><br></span></section>\n'


def o_footer(lines, P):
    rows = ''.join(f'<p style="margin: 2px 0 0;">{_mark(l, "#7f7f7f", 13, False)}</p>' for l in lines)
    return (f'<section style="margin-top: 12px;padding: 12px 14px;background: #ffffff;border-radius: 12px;'
            f'text-align: center;line-height: 22px;">{rows}</section>\n')


def _circle_num(n, P):
    return (f'<span style="display: inline-block;width: 18px;height: 18px;line-height: 18px;border-radius: 50%;'
            f'background: {P["light"]};text-align: center;">{_mark(n, P["primary"], 12)}</span>')


LAYOUTS.update({
    'magazine': dict(cn='时尚杂志', section=k_section, quote=k_quote, pq=k_pq, divider=k_divider, footer=k_footer,
                     para=make_para(K_BODY),
                     list=make_list(K_BODY, lambda P: _mark('—', P['primary']),
                                    lambda n, P: _mark(f'{n:02d}', P['primary'], 13))),
    'journal':  dict(cn='文艺手账', section=l_section, quote=l_quote, pq=l_pq, divider=l_divider, footer=l_footer,
                     para=make_para(L_BODY), page=(l_page, '</section>\n'),
                     list=make_list(L_BODY, lambda P: _mark('✓', P['primary']),
                                    lambda n, P: _mark(chr(0x2460 + n - 1) if n <= 20 else f'{n}.', P['primary'], 15))),
    'report':   dict(cn='严谨报告', section=m_section, quote=m_quote, pq=m_pq, divider=m_divider, footer=m_footer,
                     para=make_para(M_BODY),
                     list=make_list(M_BODY, lambda P: _mark('○', P['primary'], 12, False),
                                    lambda n, P: _mark(f'({n})', P['primary'], 14, False, SERIF))),
    'event':    dict(cn='居中活动', section=n_section, quote=n_quote, pq=n_pq, divider=n_divider, footer=n_footer,
                     para=make_para(N_BODY),
                     list=make_list(N_BODY, lambda P: _mark('✓ ', P['primary']),
                                    lambda n, P: _mark(f'{n}. ', P['primary']), center=True)),
    'cards':    dict(cn='卡片种草', section=o_section, quote=o_quote, pq=o_pq, divider=o_divider, footer=o_footer,
                     para=make_para(O_BODY), page=(o_page, '</section>\n'), chapter=(o_chapter, '</section>\n'),
                     list=make_list(O_BODY, lambda P: _mark('●', P['primary'], 10),
                                    lambda n, P: _circle_num(n, P))),
})


# ---------------------------------------------------------------- 解析

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


def render_with(md: str, footer_lines: List[str], layout: str, palette_name: str) -> str:
    L, P = LAYOUTS[layout], palette(palette_name)
    lint(md)
    lines = md.splitlines()
    out, i, sec, img_idx = [], 0, 0, 0
    para_fn = L.get('para') or (lambda text, P: paragraph(text))
    list_fn = L.get('list') or (lambda items, ordered, P: listing(items, ordered))
    chapter = L.get('chapter')  # (开头函数, 结尾 HTML)：把每一章整个包起来，做卡片、时间线这类效果
    if L.get('page'):           # (开头函数, 结尾 HTML)：整篇文章外面再包一层，做底色、页边留白
        out.append(L['page'][0](P))
    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            i += 1
            continue
        if H1_RE.match(line):
            out.append(h1(H1_RE.match(line).group(1)))
        elif H2_RE.match(line):
            sec += 1
            if chapter:
                out.append((chapter[1] if sec > 1 else '') + chapter[0](P))
            out.append(L['section'](clean_title(H2_RE.match(line).group(1)), sec, P))
        elif PQ_RE.match(line):
            paras, i = _collect_pullquote(lines, i)
            if paras:
                pq = L['pq']
                out.append(pq(paras, P) if callable(pq) else pullquote(paras, P, *pq))
            continue
        elif BQ_RE.match(line):
            quote = []
            while i < len(lines) and BQ_RE.match(lines[i].rstrip()) and not PQ_RE.match(lines[i].rstrip()):
                quote.append(BQ_RE.match(lines[i].rstrip()).group(1).strip())
                i += 1
            out.append(L['quote'](' '.join(quote).strip(), P))
            continue
        elif HR_RE.match(line):
            out.append(L['divider'](P))
        elif IMG_HOLD_RE.match(line):
            img_idx += 1
            out.append(image_placeholder(IMG_HOLD_RE.match(line).group(1).strip(), img_idx, P))
        elif IMG_RE.match(line):
            m = IMG_RE.match(line)
            out.append(image(m.group(1).strip(), m.group(2).strip()))
        elif OL_RE.match(line) or UL_RE.match(line):
            ordered = bool(OL_RE.match(line))
            items, i = _collect_list(lines, i, ordered)
            out.append(list_fn(items, ordered, P))
            continue
        else:
            para = [line]
            i += 1
            while i < len(lines) and lines[i].strip() and not _starts_block(lines[i].rstrip()):
                para.append(lines[i].rstrip())
                i += 1
            out.append(para_fn(' '.join(s.strip() for s in para), P))
            continue
        i += 1
    if chapter and sec:
        out.append(chapter[1])
    if footer_lines:  # 文末信息卡：没配就不出
        out.append(L['footer'](footer_lines, P))
    if L.get('page'):
        out.append(L['page'][1])
    return ''.join(out)


# ---------------------------------------------------------------- 给模板文件用的

def build(layout: str, palette_name: str) -> Callable[[str, List[str]], str]:
    """返回模板要提供的 render(md, footer_lines)。"""
    if layout not in LAYOUTS:
        raise TemplateError(f'没有版式 {layout}，可用的有：{"、".join(LAYOUTS)}')
    palette(palette_name)  # 配色名不对就早点报错
    return lambda md, footer_lines: render_with(md, footer_lines, layout, palette_name)


def variant(name: str, layout: str, palette_name: str) -> SimpleNamespace:
    """「模板+配色」组合：版式不变，换一套颜色。wechat.py 遇到 `e+blue` 这种写法时调用。"""
    P = palette(palette_name)
    return SimpleNamespace(NAME=f'{name}（{P["cn"]}色）', LAYOUT=layout, PALETTE=palette_name,
                           TemplateError=TemplateError, render=build(layout, palette_name))
