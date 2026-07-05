# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 这是什么

ppt-studio 是一个 **Claude Skill**(不是普通应用):`SKILL.md` 是给 Claude 读的 9 步 Human-in-the-loop 工作流说明,`assets/` 是这个工作流实际调用的 PPT 生成引擎。它输出可在 PowerPoint 编辑的 `.pptx`,唯一运行时依赖是 `pptxgenjs`。

本目录是 `Skill_sharing` 合集仓库的一个子目录,自身是完整独立的 skill。

## 生成 PPT 与验证(核心开发循环)

引擎不能直接在本目录 `require("pptxgenjs")`(依赖不在这里)。两种运行方式:

```bash
# 方式 A:复制到装了 pptxgenjs 的工作目录
cp assets/deck_engine.js assets/deck_styles.js assets/themes.json <workdir>/
cd <workdir> && npm i pptxgenjs && node build.js

# 方式 B:用 NODE_PATH 指向已装 pptxgenjs 的 node_modules
NODE_PATH=/path/to/node_modules node build.js
```

**视觉验证链路**(本仓库唯一可行的目检方式,已反复验证):

```bash
# node 生成 .pptx → PowerPoint(AppleScript)转 PDF → Read 工具读 PDF 逐页目检
osascript -e 'tell application "Microsoft PowerPoint"
  open POSIX file "/abs/path/deck.pptx"
  save presentation "deck.pptx" in (POSIX file "/abs/path/deck.pdf") as save as PDF
  close presentation "deck.pptx" saving no
end tell'
```

验证要点(踩过的坑):
- **PNG 导出在沙盒下不工作**,只能导 PDF;然后用 Read 工具直接读 PDF 页做视觉检查。
- 传给 PowerPoint 的文件**必须在用户目录**(如 `~/Desktop/...`),不能在 `/tmp` 或沙盒 scratchpad,否则 AppleScript 打不开。
- 主题预览缩略图用 `qlmanage -t -s 800 -o <outdir> file.pdf` 从 PDF 提取。

## 架构:版式 DNA(v2 的核心,理解全库的关键)

设计目标:**每个主题有自己可辨识的排版构图,而不只是换颜色**。任意两个主题的封面并排,构图应明显不同。

三个文件分工:

- **`assets/themes.json`** — 每个主题一条记录,含 `c`(颜色令牌)、`f`(字体)、`radius`,以及 **`layout` 块(版式 DNA)**:`header` / `list` / `footer` / `num` / `align` / `scale` / `persona`。这些字段是字符串"词汇",指向 deck_engine 里的具体渲染实现。改一个主题的排版个性 = 改它的 `layout` 值,不碰代码。

- **`assets/deck_engine.js`** — 分三层:
  1. **绘制原语**:`txt / box / oval / tri / lineH / lineV`(封装 pptxgenjs,统一按 `sc()` 缩放)。
  2. **DNA 词汇层**:`HEADERS{}`(6+ 种页眉,返回内容区 top 值)、`FOOTERS{}`(十余种页脚)、`CONTAINER_OF` + `itemBox`(列表容器语言)、`drawIndex`(编号形态:serif/circle/sticker/geo…)、`renderRows`(按 `L.list` 渲染要点)。`createDeck(theme)` 读该主题的 `layout` 值,从这些字典里选实现。
  3. **10 个内容版式函数**(`S.toc / contentRows / twoColumn / threeCards / comparison / imageText / kpiGrid / timeline / table / processSteps`),它们只调 DNA 词汇层,不写死构图。

- **`assets/deck_styles.js`** — **5 个高识别度 hero 版式的每主题专属构图**(`cover / divider / statement / closing / bigstat`)。这是排版个性的主战场:每主题一个模块,导出对象按主题 id 索引。未实现专属构图的主题回落到 `__fallback`(通用 hero,可用但不出彩)。`createDeck` 里 `S.cover = heroFn("cover")` 等把这 5 个绑定到专属或 fallback 实现。

**当前状态**:22 个主题的 DNA 令牌与专属构图已全部完成(22/22),`__fallback` 仅作防御性保留。18 个后补主题的 bigstat 共用 `barStat()` 基座(header DNA 已保证页间差异,少数主题用 opt 微调),5 个 hero 版式已逐主题生成走查 deck 并经 PDF 目检通过。

## 铁律

- **版式函数与 deck_styles 里绝不出现 themes.json 之外的色值**(黑色描边 `0A0A0A` 等主题签名色除外,它们是该主题令牌的一部分)。所有颜色走 `pal()` 返回的 `p.t1/t2/t3/ac/acF` 或 `C.*` 令牌。
- **对外 API 稳定**:`S.cover / contentRows / ...` 的函数签名跨 v1/v2 保持一致,`SKILL.md` 工作流依赖它。新增排版能力时不改签名。
- 富文本标题统一用 runs 数组 `[[文字, 是否强调色?, 是否换行?], ...]`,经 `runs()` 转 pptxgenjs 格式。
- 颜色字符串**不带 `#`**(pptxgenjs 要求)。

## 加新主题

1. 在 `themes.json` 加一条:`c` 令牌(自查正文对比度 ≥ 4.5:1)、`f`、`layout` DNA。
2. 若要专属排版,在 `deck_styles.js` 加模块并在导出对象注册主题 id;否则自动走 fallback。
3. 生成走查 deck → 转 PDF → 与已有主题对照,确认构图不雷同。
4. 同步 `references/theme-gallery.md`、`README.md` 预览图。

## 分支约定

- `main`:已发布的稳定版,README/预览图与代码自洽。
- 功能分支(如 `v2-layout-dna`):进行中的工作。**文档与预览图同步更新、走查通过后才合并回 main**,避免公开仓库出现"文档说 N 个主题、代码是 M 个"的矛盾。
