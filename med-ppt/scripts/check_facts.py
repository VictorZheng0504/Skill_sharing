#!/usr/bin/env python3
"""核对导出的 PPTX 中的数字与关键文字主张是否登记在 facts.json 里。

用法：
    check_facts.py --validate-only --facts facts.json
    check_facts.py --facts facts.json --pptx deck.pptx [--report report.md] [--no-notes]

退出码：0 通过；1 发现无出处数字或缺失的 must_show 数字/主张；2 输入文件有误。

数字按数值比较（0.70 == 0.7，4,744 == 4744），日期按年月日比较。正负号不参与比较。
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

DATE_FULL = re.compile(r"(?<!\d)(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})\s*日?")
DATE_MONTH = re.compile(r"(?<!\d)(\d{4})\s*年\s*(\d{1,2})\s*月")
# 2018.09、2018-09、2018/09：年份限定 19xx/20xx，避免把 1.56 之类的小数当成日期
DATE_MONTH_NUMERIC = re.compile(r"(?<![\d.])((?:19|20)\d{2})[-/.](0[1-9]|1[0-2])(?![\d.])")
# 文献内部定位与统计惯用语不是事实数字：Methods 2.1、Results 3.1–3.2、p. 3–4、第 5 页、95% CI
LOCATOR = re.compile(
    r"(?:Methods?|Results?|Discussion|Introduction|Conclusions?|Section|Supplement(?:ary)?|§)\s*\d+(?:\.\d+)*"
    r"(?:\s*[-–~]\s*\d+(?:\.\d+)*)?"
    r"|\bpp?\.\s*\d+(?:\s*[-–~、,]\s*\d+)*"
    r"|第\s*\d+\s*页"
    r"|95\s*%\s*(?:CI|置信区间)",
    re.I,
)
# 前面紧跟字母（可带连字符）的数字属于标识符，如 HbA1c、IL-6、SGLT2、COVID-19
NUMBER = re.compile(r"(?<![A-Za-z\d.])(?<![A-Za-z]-)\d+(?:,\d{3})*(?:\.\d+)?")
# 图表编号本身不是事实数字
FIGURE_REF = re.compile(
    r"(?:Fig(?:ure)?|Table|Tab|Supplementary|图|(?<!代|发|列|外|仪|报)表)\.?\s*[A-Za-z]?\d+[A-Za-z]?", re.I
)
PAGE_NUMBER = re.compile(r"^\s*(\d+)(?:\s*/\s*\d+)?\s*$")
# 讲稿常把数字写成汉字以便朗读（一点五六、十九点四六、二十七例），必须转成阿拉伯数字再核对
CN_DIGITS = {"零": 0, "〇": 0, "一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9}
CN_UNITS = {"十": 10, "百": 100, "千": 1000, "万": 10000}
CN_NUMBER = re.compile(r"(百分之)?([零〇一二两三四五六七八九十百千万]+)(?:点([零〇一二三四五六七八九]+))?(?=(.?))")


def cn_integer(chars: str) -> int:
    if not any(c in CN_UNITS for c in chars):
        # 二零二一 这类逐位读法
        return int("".join(str(CN_DIGITS[c]) for c in chars))
    total, section, digit = 0, 0, 0
    for c in chars:
        if c in CN_DIGITS:
            digit = CN_DIGITS[c]
        elif c == "万":
            total += (section + digit) * 10000
            section, digit = 0, 0
        else:
            section += (digit or 1) * CN_UNITS[c]
            digit = 0
    return total + section + digit


def convert_chinese_numbers(text: str) -> str:
    def repl(match: re.Match) -> str:
        percent, integer, fraction, following = match.groups()
        # 单个汉字多是普通用词（一周、两组、第一），只在小数、百分数或日期里才当数字
        if len(integer) < 2 and not fraction and not percent and following not in ("年", "月", "日"):
            return match.group(0)
        value = str(cn_integer(integer))
        if fraction:
            value += "." + "".join(str(CN_DIGITS[c]) for c in fraction)
        return value + ("%" if percent else "")

    return CN_NUMBER.sub(repl, text)


def normalize_number(raw: str) -> str:
    value = raw.replace(",", "")
    if "." in value:
        integer, fraction = value.split(".", 1)
        fraction = fraction.rstrip("0")
    else:
        integer, fraction = value, ""
    integer = integer.lstrip("0") or "0"
    return f"{integer}.{fraction}" if fraction else integer


def extract_numbers(text: str) -> list[tuple[str, str]]:
    """返回 [(比较用的键, 原文片段)]。"""
    text = convert_chinese_numbers(unicodedata.normalize("NFKC", text))
    found = []

    def take_date(match: re.Match, full: bool) -> str:
        parts = [match.group(1), f"{int(match.group(2)):02d}"]
        if full:
            parts.append(f"{int(match.group(3)):02d}")
        found.append(("D:" + "-".join(parts), match.group(0)))
        return " "

    text = DATE_FULL.sub(lambda m: take_date(m, True), text)
    text = DATE_MONTH.sub(lambda m: take_date(m, False), text)
    text = DATE_MONTH_NUMERIC.sub(lambda m: take_date(m, False), text)
    text = LOCATOR.sub(" ", text)
    text = FIGURE_REF.sub(" ", text)
    for match in NUMBER.finditer(text):
        found.append((normalize_number(match.group(0)), match.group(0)))
    return found


@dataclass
class Finding:
    slide: int
    where: str
    raw: str
    context: str


@dataclass
class Facts:
    allowed: set[str] = field(default_factory=set)
    must_show: list[dict] = field(default_factory=list)
    must_show_claims: list[dict] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def load_facts(path: Path) -> Facts:
    facts = Facts()
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        facts.errors.append(f"无法读取 {path}：{exc}")
        return facts

    items = data.get("facts") if isinstance(data, dict) else None
    if not isinstance(items, list) or not items:
        facts.errors.append("facts.json 顶层必须有非空的 facts 数组")
        return facts

    seen = set()
    for index, item in enumerate(items, 1):
        if not isinstance(item, dict):
            facts.errors.append(f"第 {index} 条不是对象")
            continue
        fid = item.get("id", f"#{index}")
        for key in ("id", "value", "label", "source"):
            if not str(item.get(key, "")).strip():
                facts.errors.append(f"{fid}：缺少字段 {key}")
        if fid in seen:
            facts.errors.append(f"{fid}：id 重复")
        seen.add(fid)
        kind = item.get("kind", "number")
        if kind not in ("number", "claim"):
            facts.errors.append(f"{fid}：kind 必须是 number 或 claim")
            continue
        if kind == "claim":
            raw_matches = item.get("match", item.get("value", ""))
            matches = raw_matches if isinstance(raw_matches, list) else [raw_matches]
            matches = [str(value).strip() for value in matches if str(value).strip()]
            if not matches:
                facts.errors.append(f"{fid}：claim 必须提供 value 或 match")
            slides = item.get("slides", [])
            if slides and (not isinstance(slides, list) or not all(isinstance(n, int) and n > 0 for n in slides)):
                facts.errors.append(f"{fid}：slides 必须是正整数数组")
                slides = []
            if item.get("must_show") is True:
                facts.must_show_claims.append({
                    "id": fid,
                    "value": item.get("value", ""),
                    "matches": matches,
                    "slides": slides,
                })
            continue
        numbers = extract_numbers(str(item.get("value", "")))
        if not numbers:
            facts.warnings.append(f"{fid}：value 中没有数字，核对时不起作用")
        facts.allowed.update(key for key, _ in numbers)
        if item.get("must_show") is True:
            facts.must_show.append({"id": fid, "value": item.get("value", ""), "keys": {k for k, _ in numbers}})

    for raw in data.get("allow", []) if isinstance(data, dict) else []:
        facts.allowed.update(key for key, _ in extract_numbers(str(raw)))
    return facts


def iter_shape_texts(shapes, where: str):
    """递归产出 (位置描述, 文本, 是否整框文本)。"""
    from pptx.shapes.group import GroupShape

    for shape in shapes:
        if isinstance(shape, GroupShape):
            yield from iter_shape_texts(shape.shapes, where)
            continue
        if getattr(shape, "has_text_frame", False) and shape.has_text_frame:
            yield where, shape.text_frame.text, True
        if getattr(shape, "has_table", False) and shape.has_table:
            for row in shape.table.rows:
                for cell in row.cells:
                    yield f"{where}·表格", cell.text, False
        if getattr(shape, "has_chart", False) and shape.has_chart:
            for plot in shape.chart.plots:
                for series in plot.series:
                    # .10g 去掉浮点误差尾巴（0.30000000000000004 → 0.3）
                    values = " ".join(format(v, ".10g") for v in series.values if v is not None)
                    yield f"{where}·图表 {series.name}", values, False


def normalize_claim_text(text: str) -> str:
    """忽略大小写、全半角与连续空白，但不做语义推断。"""
    return " ".join(unicodedata.normalize("NFKC", text).casefold().split())


def collect_findings(pptx_path: Path, facts: Facts, include_notes: bool):
    from pptx import Presentation

    presentation = Presentation(str(pptx_path))
    slide_count = len(presentation.slides)
    unsupported: list[Finding] = []
    present: set[str] = set()
    page_texts: dict[int, str] = {}

    for number, slide in enumerate(presentation.slides, 1):
        sources = list(iter_shape_texts(slide.shapes, "正文"))
        if include_notes and slide.has_notes_slide:
            sources.append(("讲稿", slide.notes_slide.notes_text_frame.text, False))
        page_texts[number] = normalize_claim_text("\n".join(text for _, text, _ in sources))
        for where, text, whole_frame in sources:
            page = PAGE_NUMBER.match(text) if whole_frame else None
            if page and int(page.group(1)) <= slide_count:
                continue
            for key, raw in extract_numbers(text):
                present.add(key)
                if key not in facts.allowed:
                    snippet = " ".join(text.split())
                    unsupported.append(Finding(number, where, raw, snippet[:80]))

    missing = [fact for fact in facts.must_show if not fact["keys"] <= present]
    missing_claims = []
    for claim in facts.must_show_claims:
        pages = claim["slides"] or list(page_texts)
        haystack = "\n".join(page_texts.get(page, "") for page in pages)
        if not any(normalize_claim_text(match) in haystack for match in claim["matches"]):
            missing_claims.append(claim)
    return unsupported, missing, missing_claims


def render_report(pptx_path: Path, unsupported: list[Finding], missing: list[dict],
                  missing_claims: list[dict], warnings: list[str]) -> str:
    lines = [f"# 数字核对报告：{pptx_path.name}", ""]
    status = "通过" if not unsupported and not missing and not missing_claims else "未通过"
    lines += [
        f"**结果**：{status}（无出处数字 {len(unsupported)} 处，缺失关键数字 {len(missing)} 条，"
        f"缺失关键主张 {len(missing_claims)} 条）",
        "",
    ]
    if unsupported:
        lines += ["## 无出处数字", "", "| 页 | 位置 | 数字 | 上下文 |", "|---|---|---|---|"]
        for f in unsupported:
            context = f.context.replace("|", "\\|")
            lines.append(f"| {f.slide} | {f.where} | {f.raw} | {context} |")
        lines.append("")
    if missing:
        lines += ["## 缺失的关键数字（must_show）", ""]
        lines += [f"- {fact['id']}：{fact['value']}" for fact in missing]
        lines.append("")
    if missing_claims:
        lines += ["## 缺失的关键文字主张（must_show）", ""]
        for claim in missing_claims:
            scope = f"（限第 {', '.join(map(str, claim['slides']))} 页）" if claim["slides"] else ""
            lines.append(f"- {claim['id']}：{claim['value']}{scope}")
        lines.append("")
    if warnings:
        lines += ["## facts.json 提示", ""] + [f"- {w}" for w in warnings] + [""]
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--facts", required=True, type=Path)
    parser.add_argument("--pptx", type=Path)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--no-notes", action="store_true", help="不核对讲稿中的数字")
    args = parser.parse_args(argv)

    facts = load_facts(args.facts)
    for warning in facts.warnings:
        print(f"[提示] {warning}")
    if facts.errors:
        for error in facts.errors:
            print(f"[错误] {error}")
        return 2
    if args.validate_only:
        print(
            f"facts.json 格式正确：{len(facts.allowed)} 个可用数值，"
            f"{len(facts.must_show)} 条 must_show 数字，{len(facts.must_show_claims)} 条 must_show 主张。"
        )
        return 0
    if not args.pptx or not args.pptx.is_file():
        print("[错误] 需要用 --pptx 指定存在的 .pptx 文件")
        return 2

    unsupported, missing, missing_claims = collect_findings(
        args.pptx, facts, include_notes=not args.no_notes
    )
    report = render_report(args.pptx, unsupported, missing, missing_claims, facts.warnings)
    if args.report:
        args.report.write_text(report, encoding="utf-8")
        print(f"报告已写入 {args.report}")
    print(report)
    return 0 if not unsupported and not missing and not missing_claims else 1


if __name__ == "__main__":
    sys.exit(main())
