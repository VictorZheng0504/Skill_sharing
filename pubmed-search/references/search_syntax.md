# PubMed 检索式语法速查

## 布尔运算（必须大写）

| 运算符 | 作用 | 示例 |
|--------|------|------|
| `AND` | 交集（更窄） | `CAR-T AND myasthenia gravis` |
| `OR` | 并集（更宽） | `CAR-T OR "chimeric antigen receptor"` |
| `NOT` | 排除 | `myasthenia NOT thymoma` |

优先级：`NOT` > `AND` > `OR`，用括号明确分组。

## 字段标签（限定检索范围）

| 标签 | 含义 | 示例 |
|------|------|------|
| `[tiab]` | 标题 + 摘要 | `CAR-T[tiab]` |
| `[Title]` / `[Title/Abstract]` | 仅标题 / 标题或摘要 | `myasthenia[Title]` |
| `[MeSH Terms]` | 主题词（最规范） | `"Receptors, Chimeric Antigen"[MeSH Terms]` |
| `[Author]` | 作者 | `Howard JF[Author]` |
| `[Journal]` | 期刊 | `Lancet Neurol[Journal]` |
| `[dp]` | 出版日期 | `2021:2026[dp]` |
| `[pt]` | 出版类型 | `clinical trial[pt]` |
| `[ad]` | 作者机构 | `"Mayo Clinic"[ad]` |

## 高频实用写法

```text
# 精确短语（加引号）
"myasthenia gravis"

# 截词通配符（* 匹配任意后缀）
therap*  → therapy / therapies / therapeutic

# 时间窗
2021:2026[dp]           # 近 5 年（含 2021 和 2026）
2024/01/01:2026/12/31[dp]

# 组合：规范 MeSH + 字段限定 + 时间窗
("Receptors, Chimeric Antigen"[MeSH Terms] OR "CAR-T"[tiab])
AND "Myasthenia Gravis"[MeSH Terms]
AND 2021:2026[dp]
```

## 检索策略两条路线

| 路线 | 特点 | 何时用 |
|------|------|--------|
| 宽召回（口语化 / 简易布尔） | 命中多、含噪音 | 领域扫盲、找线索 |
| 高精确（MeSH + 字段限定） | 命中少、核心文献 | 写综述、做 Meta、系统检索 |

- **验证检索式**：`suggest "你的检索式"` 看 PubMed 实际执行的术语翻译，确认没有漏掉
  同义词或误映射。
- **MeSH 词查询入口**：https://www.ncbi.nlm.nih.gov/mesh/
