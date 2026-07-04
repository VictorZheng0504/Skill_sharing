# Step 4/7 · 版式目录(deck_engine.js 的 15 个版式函数)

调用方式:

```js
const { createDeck } = require("./deck_engine");
const d = createDeck("clean-pro", {
  title: "文档元数据标题", author: "作者",
  footer: "页脚左侧品牌语",      // 可选,每个内容页显示
  slogan: "封面右下角小字",       // 可选
});
d.S.cover({ ... });
await d.save("outputs/deck.pptx");
```

**通用约定**
- 富文本标题(`title` 标 runs 处)格式:`[[文字, 是否强调色, 是否换行], ...]`,如 `[["把想法", false], ["讲清楚", true]]`
- 所有版式接受 `page`(页码字符串,如 `"04"`;`null` 不显示)与 `notes`(演讲者备注)
- **hero 版式**(cover/sectionDivider/statement/closing)自动用 hero 底色,与内容页形成明暗节奏

---

## 页面类型 → 版式映射(Step 4 规划时用)

| 页面类型 | 版式 | 容量限制 |
|---|---|---|
| 封面 | `cover` | 标题 ≤ 2 行 |
| 目录 | `toc` | 4-6 项 |
| 章节幕封 | `sectionDivider` | — |
| 金句/痛点/过渡 | `statement` | 标题 ≤ 2 行 |
| 正文要点/方法步骤 | `contentRows` | **≤ 5 行** |
| 概念⟷示例、文字+代码 | `twoColumn` | 每栏 ≤ 6 条 |
| 三要点/三场景 | `threeCards` | 恰好 2-4 卡 |
| Before/After、优缺点 | `comparison` | 每侧 ≤ 6 条 |
| 图片配文字 | `imageText` | lead ≤ 3 行 |
| 多指标概览 | `kpiGrid` | 2-4 个 KPI |
| 单一关键数据 | `bigStat` | 柱 2-6 根 |
| 里程碑/计划 | `timeline` | **3-6 节点** |
| 明细数据 | `table` | ≤ 8 行(超出拆页) |
| 流程/步骤 | `processSteps` | **3-5 步** |
| 结尾/致谢/CTA | `closing` | — |

---

## 参数签名速查

```js
// 1 cover — 封面
d.S.cover({ kicker:"KEYNOTE 2026", tag:"右上角小标",
  title:[["主标题",false],["强调部分",true]], titleSize:52,   // 长标题传小一点(44)
  subtitle:"一句话副标题", speaker:"主讲:某某", notes:"口播" });

// 2 toc — 目录(4 项 2 列,5-6 项 3 列)
d.S.toc({ kicker:"CONTENTS", title:"目录",
  items:[["01","章节名","一句话说明(可省)"], ...], page:"02" });

// 3 sectionDivider — 章节幕封
d.S.sectionDivider({ no:"02", kicker:"PART TWO",
  title:[["章节标题",false]], sub:"本章一句话", page:"05" });

// 4 statement — 金句(quote:false 隐藏引号)
d.S.statement({ kicker:"核心信念",
  title:[["第一行,",false,true],["强调的第二行",true]], sub:"补充说明", page:"06" });

// 5 contentRows — 编号要点(≤5 行)
d.S.contentRows({ kicker:"方法", title:"页标题",
  rows:[["01","要点名","右侧说明(可省)"], ...],
  footnote:"* 脚注(可省)", page:"07" });

// 6 twoColumn — 双栏;mono:true 该栏变代码面板
d.S.twoColumn({ kicker:"模式", title:"页标题",
  left:{ head:"概念", items:["条目1","条目2"] },
  right:{ head:"示例", mono:true, body:"code line 1\ncode line 2" }, page:"08" });

// 7 threeCards — 2-4 卡并列
d.S.threeCards({ kicker:"三个支柱", title:"页标题",
  cards:[{ no:"A", head:"卡标题", desc:"卡描述" }, ...], page:"09" });

// 8 comparison — 对比(bad/good 控制语义色条)
d.S.comparison({ kicker:"对比", title:"页标题",
  left:{ tag:"BEFORE", head:"左侧", bad:true, items:["…"] },
  right:{ tag:"AFTER", head:"右侧", good:true, items:["…"] }, page:"10" });

// 9 imageText — 左文右图;无图传 placeholder 占位
d.S.imageText({ kicker:"案例", title:"页标题", lead:"引导段落",
  callout:{ text:"“引述”", source:"— 来源" },
  image:{ path:"images/x.png", caption:"图注 · 来源" },  // 或 placeholder:"占位文字"
  page:"11" });

// 10 kpiGrid — 2-4 个 KPI 卡
d.S.kpiGrid({ kicker:"指标", title:"页标题", kpis:[
  { label:"REVENUE", value:"1,248", unit:"K", delta:"38% YoY", dir:"up", good:true },
  { label:"CHURN",   value:"2.1",   unit:"%", delta:"0.4 pt", dir:"down", good:true }], page:"12" });

// 11 bigStat — 左大数字 + 右柱状(0-100 相对高度,第三位 true = 强调柱)
d.S.bigStat({ kicker:"数据", title:"页标题",
  stat:{ value:"83", unit:"%", label:"指标名", sub:"两行以内的解释" },
  bars:[["Q1",40],["Q2",55],["Q3",70],["Q4",100,true]], page:"13" });

// 12 timeline — 横向时间线(3-6 节点;done:false = 灰色未完成)
d.S.timeline({ kicker:"计划", title:"页标题", nodes:[
  { tag:"W1", head:"节点名", desc:"说明" }, ..., { tag:"W4", head:"未来", desc:"…", done:false }], page:"14" });

// 13 table — 表格(数字/代码自动右对齐;colW 传英寸数组可控列宽)
d.S.table({ kicker:"明细", title:"页标题",
  headers:["列1","列2","列3"], rows:[["行首加粗","文本","123"], ...],
  source:"数据来源", colW:[3,4,4.63], page:"15" });

// 14 processSteps — 步骤卡(3-5 步,自动编号+箭头)
d.S.processSteps({ kicker:"流程", title:"页标题",
  steps:[{ head:"步骤名", desc:"说明" }, ...], page:"16" });

// 15 closing — 收束页
d.S.closing({ kicker:"THANKS", title:[["结束语",false],["强调",true]],
  sub:"一句话收尾", cta:"链接或行动号召(可省)", page:"17" });
```

---

## 使用纪律

1. **不要绕过版式函数手写坐标**——需要新版式时先看现有 15 个能否组合表达,确实不够再仿照现有函数风格新增(只引用令牌,不写死色值)
2. **容量超限就拆页或换版式**,不要缩字号硬塞(contentRows 超 5 行 → 拆两页或换 toc;table 超 8 行 → 拆页)
3. 图片一律走 `imageText` 的 `image.path`,并填 `caption`(QA 要求所有图有图注)
4. 演讲场景每页都要传 `notes`(Step 1 访谈若选了"需要演讲者备注")
