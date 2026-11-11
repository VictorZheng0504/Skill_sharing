#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PubMed E-utilities 一体化工具：检索 + 留档 + 验伪 + 论文 Methods 段生成。

零第三方依赖，仅用 Python 标准库，兼容 Python 3.8+。

子命令：
  search   "检索式" -n N      检索 PubMed，显示结果并自动留档
  verify   PMID [PMID ...]    批量校验 PMID 真伪（防止 AI 编造文献）
  methods  ["检索式"]         生成论文 Methods 检索报告段（中英双语）
  suggest  "检索式"           查看 PubMed 对该检索式的术语映射（辅助优化检索式）
  log     [-n N]              查看检索历史留档

环境变量（可选，留空也能用）：
  NCBI_EMAIL    你的邮箱（NCBI 推荐填写，便于官方联系）
  NCBI_API_KEY  API key（免费申请，限速从 3 提到 10 req/s）

留档位置：~/.workbuddy/pubmed/history.jsonl
"""
import os
import sys
import json
import time
import datetime
import urllib.parse
import urllib.request

BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
TOOL = "workbuddy-pubmed-skill"
EMAIL = os.environ.get("NCBI_EMAIL", "")
API_KEY = os.environ.get("NCBI_API_KEY", "")
MIN_INTERVAL = 0.35          # NCBI 限速 3 req/s，留安全余量
HIST_DIR = os.path.expanduser("~/.workbuddy/pubmed")
HIST_FILE = os.path.join(HIST_DIR, "history.jsonl")
_last_call = [0.0]


# ---------- 基础设施：限速 / 重试 / 请求 ----------

def _throttle():
    gap = time.time() - _last_call[0]
    if gap < MIN_INTERVAL:
        time.sleep(MIN_INTERVAL - gap)
    _last_call[0] = time.time()


def _get(endpoint, params):
    params.setdefault("tool", TOOL)
    if EMAIL:
        params["email"] = EMAIL
    if API_KEY:
        params["api_key"] = API_KEY
    url = BASE + endpoint + "?" + urllib.parse.urlencode(params)
    for attempt in range(3):
        _throttle()
        try:
            with urllib.request.urlopen(url, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception:
            if attempt == 2:
                raise
            time.sleep(1.5 ** (attempt + 1))


# ---------- 核心 API ----------

def search(query, n=10, sort="relevance"):
    """返回 (PMID 列表, 全库命中总数, PubMed 术语翻译)。"""
    data = _get("esearch.fcgi", {
        "db": "pubmed", "term": query,
        "retmax": n, "retmode": "json", "sort": sort,
    })
    res = data["esearchresult"]
    return res.get("idlist", []), int(res.get("count", 0)), res.get("querytranslation", "")


def summary(pmids):
    return _get("esummary.fcgi", {
        "db": "pubmed", "id": ",".join(pmids), "retmode": "json",
    }).get("result", {})


def doi_of(rec):
    for a in rec.get("articleids", []):
        if a.get("idtype") == "doi":
            return a.get("value", "-")
    return "-"


def _record(query, count, pmids):
    """追加一条检索留档。"""
    os.makedirs(HIST_DIR, exist_ok=True)
    entry = {
        "date": datetime.date.today().isoformat(),
        "query": query,
        "count": count,
        "pmids": pmids,
    }
    with open(HIST_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def _load_history():
    if not os.path.exists(HIST_FILE):
        return []
    rows = []
    with open(HIST_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    rows.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    return rows


# ---------- 子命令 ----------

def cmd_search(query, n):
    pmids, total, translation = search(query, n)
    _record(query, total, pmids)
    print(f"检索式：{query}")
    print(f"PubMed 术语映射：{translation}")
    print(f"全库命中 {total} 篇；本页取回 {len(pmids)} 篇\n")
    if not pmids:
        print("（无结果）")
        return
    res = summary(pmids)
    for p in pmids:
        rec = res.get(p, {})
        if "error" in rec:
            print(f"  PMID {p}   [无效：{rec['error']}]")
            continue
        print(f"  PMID {p}   [{rec.get('pubdate', '?')}]  {rec.get('source', '?')}")
        print(f"    {rec.get('title', '(无标题)')}")
        print(f"    DOI: {doi_of(rec)}\n")
    print(f"（本次检索已留档到 {HIST_FILE}，可用 log 查看、methods 生成论文检索段）")


def cmd_verify(pmids):
    print("PMID 真伪校验（防止 AI 编造文献）：\n")
    res = summary(pmids)
    valid = set(res.get("uids", []))
    ok = bad = 0
    for p in pmids:
        if p in valid and "error" not in res.get(p, {}):
            print(f"  [真] {p}  {res[p].get('title', '')[:64]}")
            ok += 1
        else:
            print(f"  [假] {p}  该 PMID 在 PubMed 不存在")
            bad += 1
    print(f"\n真实 {ok} 条 / 可疑 {bad} 条")


def cmd_suggest(query):
    _, _, translation = search(query, 0)
    print(f"原始检索式：{query}\n")
    print(f"PubMed 实际执行的翻译：\n  {translation}\n")
    print("提示：若翻译与你的意图不符（比如漏了 MeSH 同义词），可改用规范检索式提升精度。")


def cmd_methods(query=None):
    if query:
        _, total, _ = search(query, 0)
        date = datetime.date.today().isoformat()
    else:
        rows = _load_history()
        if not rows:
            print("无留档。先运行 search，或手动指定：methods \"检索式\"")
            return
        last = rows[-1]
        query, total, date = last["query"], last["count"], last["date"]
    en = (f'PubMed was searched on {date} via the NCBI E-utilities API '
          f'(esearch/esummary) using the query: "{query}". '
          f'The search returned {total} records.')
    zh = (f'于 {date} 通过 NCBI E-utilities API（esearch/esummary）检索 PubMed 数据库，'
          f'检索式为「{query}」，共命中 {total} 篇文献。')
    print("===== 论文 Methods 检索报告段 =====\n")
    print("[English]\n" + en + "\n")
    print("[中文]\n" + zh + "\n")


def cmd_log(n=10):
    rows = _load_history()
    if not rows:
        print("暂无留档。运行 search 后这里会记录检索历史。")
        return
    for r in rows[-n:]:
        print(f"  {r['date']}  「{r['query']}」  命中 {r['count']} 篇  "
              f"PMID 样例 {r['pmids'][:3]}")
    print(f"\n共 {len(rows)} 条留档，完整文件：{HIST_FILE}")


# ---------- 入口 ----------

def _usage():
    print(__doc__)


def main(argv):
    if len(argv) < 1:
        _usage()
        return 1
    cmd, args = argv[0], argv[1:]
    if cmd == "search":
        n = 10
        if "-n" in args:
            i = args.index("-n")
            n = int(args[i + 1])
            args = args[:i] + args[i + 2:]
        if not args:
            _usage()
            return 1
        cmd_search(" ".join(args), n)
    elif cmd == "verify":
        if not args:
            _usage()
            return 1
        cmd_verify(args)
    elif cmd == "suggest":
        if not args:
            _usage()
            return 1
        cmd_suggest(" ".join(args))
    elif cmd == "methods":
        cmd_methods(" ".join(args) if args else None)
    elif cmd == "log":
        n = 10
        if "-n" in args:
            i = args.index("-n")
            n = int(args[i + 1])
        cmd_log(n)
    else:
        _usage()
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
