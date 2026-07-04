# Step 5 · 主题库(20 个主题 × 7 大场景)

所有主题定义在 `assets/themes.json`,是**同一套语义令牌的不同取值**:
`bg / surface / border / t1-t3(文字三级) / accent(文字强调,对比度达标) / accentFill(装饰强调,可高饱和) / good / warn / bad / hero*(hero 页专用)`。
版式函数只引用令牌 → 任何主题 × 任何版式都能直接组合。

**只允许从这 20 套预设里选**,不接受自定义 hex——配色是成套调过对比度的,单改一个值很容易破坏可读性(此规则借鉴 guizang-ppt-skill 的"预设制")。如确需品牌定制,复制一份现有主题改全套令牌,并重跑对比度检查。

---

## 主题总览

### 学术 / 科研

| id | 名称 | 关键色 | 气质 |
|---|---|---|---|
| `academic-navy` | 经典深蓝 | 深学术蓝 #1F3A5F + 暖金 #C9A227 | 严肃可信,学术会议保底选择 |
| `minimal-gray` | 极简灰白 | 近黑 #0C0D10 + 单点蓝 #0F62FE | 大量留白,适合代码/公式 |
| `research-defense` | 科研答辩 | 石板蓝 #334155 + 青 #0F766E | 证据导向,答辩专用 |

### 商务 / 咨询

| id | 名称 | 关键色 | 气质 |
|---|---|---|---|
| `mckinsey` | 麦肯锡蓝灰 | 墨蓝灰 #243447 + 发丝线灰 | 理性克制,董事会级 |
| `clean-pro` | 清爽专业 | 专业蓝 #2563EB + 琥珀 #F59E0B | 通用汇报,信息密度友好 |
| `dashboard` | 数据仪表盘 | 数据蓝 #1976D2 + 紫 #8B5CF6 | KPI/BI 场景,数字表现力强 |

### 杂志 / 人文(衬线标题 + 纸感底色)

| id | 名称 | 关键色 | 气质 |
|---|---|---|---|
| `magazine-ink` | 墨水经典 | 墨黑 #0A0A0B + 纸色 #F1EFEA | 电子杂志感,叙事默认 |
| `indigo-porcelain` | 靛蓝瓷 | 靛蓝 #0A1F3D + 瓷白 | 科技叙事 |
| `kraft-paper` | 牛皮纸 | 深棕 #2A1E13 + 牛皮纸 #EEDFC7 | 人文/手作 |
| `dune` | 沙丘 | 沙色 #F0E6D2 + 暖棕 | 艺术/摄影 |

### 瑞士 / 设计(Inter 无衬线 + 直角 + 高饱和 hero)

| id | 名称 | 关键色 | 气质 |
|---|---|---|---|
| `swiss-ikb` | 克莱因蓝 | IKB #002FA7 + 柠檬黄点缀 | 路演/发布,视觉冲击最强 |
| `swiss-lemon` | 柠檬黄 | #FFD500 黄 hero 黑字 | 年轻活力 |
| `swiss-orange` | 安全橙 | #FF6B35 + 墨黑 hero | 工业/工程 |

### 深色 / 科技(`dark: true`,投影偏亮环境慎用,不适合打印)

| id | 名称 | 关键色 | 气质 |
|---|---|---|---|
| `tokyo-night` | 东京夜 | #1A1B26 + 天蓝/紫罗兰 | 开发者分享首选 |
| `nord` | 北欧冷蓝 | #2E3440 + 冰蓝 #88C0D0 | 冷静克制的深色 |
| `terminal-green` | 绿屏终端 | 近黑 + 荧光绿 #2EE86C,标题即等宽字体 | 极客/CLI 主题 |

### 教学 / 轻松

| id | 名称 | 关键色 | 气质 |
|---|---|---|---|
| `warm-academic` | 暖色学术 | 暖棕 #7B3F00 + 米色底 | 教学/科普,亲和 |
| `soft-pastel` | 柔和粉彩 | 紫 #6B4EE6 + 粉 #FF5C8A,大圆角 | 团队活动/轻松分享 |

### 大胆 / 宣言

| id | 名称 | 关键色 | 气质 |
|---|---|---|---|
| `neo-brutalism` | 新粗野 | 奶油底 + 2pt 黑描边卡片 + 明黄 | 先锋/个性表达 |
| `bauhaus` | 包豪斯 | 红 #D02F23 hero + 红蓝黄三原色 | 设计史/美学课 |

---

## 场景推荐矩阵(Step 5 推荐时引用)

| Step 1 访谈命中 | 主推 | 备选 |
|---|---|---|
| 学术会议、临床/科研汇报 | `academic-navy` | `research-defense`、`minimal-gray` |
| 毕业/项目答辩 | `research-defense` | `academic-navy`、`clean-pro` |
| 含大量代码/算法/公式 | `minimal-gray` | `tokyo-night`、`nord` |
| 工作汇报、述职、复盘 | `clean-pro` | `mckinsey`、`minimal-gray` |
| 战略汇报、给高管/董事会 | `mckinsey` | `clean-pro`、`academic-navy` |
| KPI/运营/数据评审 | `dashboard` | `clean-pro`、`swiss-ikb` |
| 融资路演、产品/品牌发布 | `swiss-ikb` | `mckinsey`、`neo-brutalism` |
| 个人故事、内容分享、发布会叙事 | `magazine-ink` | `indigo-porcelain`、`dune` |
| 技术分享、开发者大会 | `tokyo-night` | `nord`、`minimal-gray`、`terminal-green` |
| 教学课件、培训、科普 | `warm-academic` | `soft-pastel`、`clean-pro` |
| 设计/美学/创意主题 | `bauhaus` | `neo-brutalism`、`swiss-lemon`、`dune` |
| 不确定 | `clean-pro`(商务)/ `academic-navy`(学术) | — |

推荐时必须写明理由,并引用 Step 1 的 brief(例:"受众是投资人 + 目标是说服决策,swiss-ikb 的高冲击 hero 页和克制的内容页最匹配")。

---

## 明暗节奏(借鉴 guizang 的节奏规则)

每个主题的 hero 页(cover / sectionDivider / statement / closing)与内容页底色不同,天然形成节奏。Step 4 规划页面时遵守:

- 每 3-4 页正文后插 1 个 hero 页(幕封/金句)换气
- ❌ 禁止 8 页以上的 deck 中间没有任何 hero 页
- ❌ 禁止连续 2 个 hero 页(封面+目录相邻除外)

---

## 字体安装说明

各主题的理想字体非系统预装,**未安装时 PowerPoint 自动回退,不会报错**,但观感有损。放映前在放映机器上确认:

| 字体 | 使用主题 | 回退效果 |
|---|---|---|
| Noto Serif SC(思源宋体) | 学术系、杂志系标题 | 回退宋体/系统默认,损失小 |
| Noto Sans SC(思源黑体) | 大多数主题正文 | 回退雅黑/苹方,损失很小 |
| Inter | 瑞士系、极简系、dashboard | 回退 Helvetica/Arial,损失小 |
| JetBrains Mono | 瑞士系/深色系 mono、terminal-green 标题 | 回退 Courier,terminal-green 损失明显 |
| Playfair Display | 杂志系英文大数字 | 回退 Georgia,损失中等 |
| IBM Plex Mono / Consolas | kicker/页脚 | 回退任意等宽,损失小 |

需要零安装的保险组合:`mckinsey` / `clean-pro` / `warm-academic`(核心观感靠雅黑/苹方即可撑住)。
