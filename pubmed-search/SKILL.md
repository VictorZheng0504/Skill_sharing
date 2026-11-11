---
name: pubmed-search
description: |
  通过 NCBI E-utilities 官方 API 检索 PubMed 文献，最低限度减少 AI 幻觉。
  能力：(1) 检索 PubMed（esearch + esummary），返回真实 PMID / 期刊 / 年份 / 标题 / DOI；
  (2) 批量校验 PMID 真伪，防止 AI 编造文献；
  (3) 自动留档检索式，生成论文 Methods 检索报告段（中英双语）；
  (4) 查看 PubMed 术语映射，辅助优化检索式。
  触发词：查文献、检索 PubMed、PubMed 检索、文献检索、验 PMID、校验 PMID、PMID 真伪、
  参考文献校验、查证文献、生成检索报告、论文 Methods 检索段、文献检索式。
version: 1.0.0
agent_created: true
---

# PubMed 检索技能（防幻觉版）

把 PubMed 官方 API 封装成一个命令，让 AI 检索文献时**每一个 PMID、DOI、期刊都来自
NCBI 官方数据库**，而不是模型凭空生成。核心目标是：**文献存在性幻觉 → 归零**。

## 何时使用

- 用户要求"查某主题的文献 / 检索 PubMed / 找论文"
- 用户给了参考文献列表，要求核对 PMID / DOI 是否真实
- 写论文需要生成 Methods 部分的检索报告段
- 不确定检索式是否准确，想看看 PubMed 如何理解它

## 调用方式

脚本为零第三方依赖的 Python（标准库即可），兼容 Python 3.8+。

```bash
# 检索（返回真实 PMID + 元数据，并自动留档）
python3 scripts/pubmed.py search "CAR-T myasthenia gravis" -n 10

# 批量校验 PMID 真伪
python3 scripts/pubmed.py verify 42727567 99999999 37977704

# 生成论文 Methods 检索报告段（中英双语；不带参数则用最近一次检索）
python3 scripts/pubmed.py methods "CAR-T myasthenia gravis"

# 查看 PubMed 对检索式的术语映射（辅助优化）
python3 scripts/pubmed.py suggest "CAR-T myasthenia gravis"

# 查看检索历史留档
python3 scripts/pubmed.py log -n 10
```

> 直接用系统的 `python3`（3.8+）即可，只依赖标准库。若在 WorkBuddy 里运行，也可用它自带的受管 Python。

## 子命令速查

| 命令 | 作用 | 关键参数 |
|------|------|----------|
| `search` | 检索 + 显示 + 自动留档 | `-n` 返回条数（默认 10） |
| `verify` | 批量验 PMID 真伪 | 多个 PMID 空格分隔 |
| `methods` | 生成论文检索报告段 | 可选检索式；缺省用最近一次 |
| `suggest` | 查看 PubMed 术语翻译 | 检索式 |
| `log` | 查看检索历史 | `-n` 条数 |

## 环境变量（可选）

留空也能正常使用（限速 3 req/s）。填入后可提速到 10 req/s：

```bash
export NCBI_EMAIL="你的邮箱"
export NCBI_API_KEY="你的API key"   # 免费申请：https://www.ncbi.nlm.nih.gov/account/
```

## 重要注意事项

1. **API key 是个人凭证，不要共享、不要写进脚本提交到公开仓库。** 分发给他人时保持
   环境变量留空，让使用者填自己的。
2. **限速**：脚本内置 0.35 秒间隔 + 3 次指数退避重试，符合 NCBI 的 3 req/s 要求。
   大规模批量抓取请自行放慢或改用 ftp / EDirect。
3. **留档位置**：`~/.workbuddy/pubmed/history.jsonl`，用于检索式复现与论文方法学描述。
4. **检索式准确性由用户负责**：本技能解决"文献存在性"幻觉，但"检索式是否覆盖全面"
   仍需领域判断；可用 `suggest` 检查 PubMed 的术语映射是否与意图一致。

## 使用示例

用户：帮我查近三年 CAR-T 治疗重症肌无力的文献，并验证这些 PMID 是否真实。

AI 动作：
1. `search "CAR-T myasthenia gravis AND 2021:2026[dp]" -n 10`
2. 对返回的 PMID 列表，`verify <PMID...>` 复核真伪
3. 引用前把每篇 DOI 贴回 pubmed.ncbi.nlm.nih.gov 供用户点击核对
