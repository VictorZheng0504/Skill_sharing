# Step 5.5 · spec-lock(执行锁,借鉴 ppt-master)

## 是什么、为什么

spec-lock 是**风格与结构决策的单一真值源**。Step 5 用户选定主题、Step 6 预演通过后,把所有已敲定的决策写进 `outputs/spec-lock.md`。此后:

- **Step 7 每生成一页之前,重读一遍 spec-lock**——不是靠记忆,是真的重读。长 deck 生成中上下文会被压缩,记忆会漂移,spec-lock 不会
- 生成中任何与 spec-lock 冲突的"临时想法"(换个颜色、加个新版式、改字号)一律以 spec-lock 为准;确要变更,先改 spec-lock 并告知用户,再继续
- QA(Step 8)逐项对照 spec-lock 检查

## 模板

```markdown
# spec-lock — [主题名称] · [日期]

## 决策来源
- brief: outputs/ppt-brief.md(Step 1)
- 页面清单: Step 4 确认版
- 主题: Step 5 用户选定 / Step 6 预演通过

## 主题
- theme_id: clean-pro          ← createDeck 的第一个参数,唯一真值
- 禁止事项: 不引入 themes.json 之外的任何颜色;不改字号;不新增版式函数

## deck 元数据(createDeck 第二参数)
- title: "..."
- author: "..."
- footer: "..."                ← 页脚品牌语,null 则不显示
- slogan: "..."                ← 封面右下角,可省

## 全局约束(来自 brief)
- 语言: 中文
- 演讲者备注: 每页必填 / 不需要
- 文字密度上限: ≤80 字/页(现场演讲)
- 页码: 从第 2 页起显示,格式 "02"

## 页面映射(逐页生成的执行清单)
| 页 | 版式 | 核心信息(这页要让观众记住什么) | 备注 |
|---|---|---|---|
| P01 | cover | ... | 标题强调词: "..." |
| P02 | toc | ... | 6 项 |
| P03 | sectionDivider | ... | no:"01" |
| P04 | contentRows | ... | 4 行 |
| ... | ... | ... | ... |
| P12 | closing | ... | cta: "..." |

## 节奏检查(hero 页分布)
- hero 页: P01, P03, P07(statement), P12 → 无连续 3 页以上纯内容 ✓
```

## 使用规则

1. **写入时机**:Step 6 预演通过后、Step 7 开始前。预演阶段的微调(比如标题字号)也要回写进来
2. **每页重读**:Step 7 生成 P05 之前,重读 spec-lock 的"主题/全局约束/P05 行"。发现即将写的代码与之冲突 → 以 spec-lock 为准
3. **变更流程**:用户中途要求改风格 → 更新 spec-lock → 已生成的页面按新 lock 重生成 → 再继续。不允许"新页面用新风格,旧页面不管"
4. **交付时**:spec-lock 随 QA 总结一起放在 outputs/,作为这份 deck 的"设计档案",下次修改直接从它续起
