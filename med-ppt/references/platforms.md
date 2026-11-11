# 平台安装与差异

med-ppt 依赖 ppt-master（MIT，https://github.com/hugohe3/ppt-master ，已测试版本 6.7.x）。两个 Skill 都是标准 `SKILL.md` 文件夹，可同时被多个平台使用。

## 推荐安装（macOS / Linux）

在 med-ppt 源码仓库根目录运行：

```bash
./install.sh
```

它会：

1. 把 ppt-master v6.7.3 克隆到 `~/.agents/src/ppt-master`（已存在则跳过）。
2. 在 `~/.agents/venvs/med-ppt` 建虚拟环境并安装 ppt-master 的依赖。
3. 把两个 Skill 软链接到 `~/.agents/skills/`（Codex 与 Kimi Code 都扫描这个目录）。
4. 检测到 `~/.workbuddy` 时，再**复制**到 `~/.workbuddy/skills/`（WorkBuddy 曾把指向桌面目录的软链接当作异常清理掉；更新 Skill 后需重新运行）。

## 各平台扫描目录

| 平台 | 用户级 Skill 目录 | 备注 |
|---|---|---|
| Codex | `~/.agents/skills/`（旧版也读 `~/.codex/skills/`） | 官方文档说明支持软链接 |
| Kimi Code | `~/.agents/skills/` 或 `~/.kimi-code/skills/` | 官方文档未说明是否跟随软链接；不识别时用 `./install.sh --copy` |
| WorkBuddy | `~/.workbuddy/skills/` | 放入后需重启 WorkBuddy；install.sh 对它总是复制 |

## 平台差异

| 能力 | Codex | Kimi Code | WorkBuddy |
|---|---|---|---|
| AI 生图 | 自带（GPT Image，`host-native`）；配置了 API 时优先用 API | 配置了 API 时用 API，否则输出提示词 | 配置了 API 时用 API，否则输出提示词 |
| 照片搜图 | 配置了 Pexels Key 时可用 | 同左 | 同左 |
| ppt-master 确认界面 | 支持 | 支持（以对话确认为准） | 支持（以对话确认为准） |
| 推荐模型 | 默认即可 | 大上下文模型（ppt-master 文档较多） | 大上下文模型 |

## Python 环境

`scripts/locate_ppt_master.py` 会依次检查：环境变量 `MED_PPT_PYTHON`、`~/.agents/venvs/med-ppt/bin/python`、当前 `python3`，选第一个能导入 `pptx` 的解释器，并在输出的 `python` 字段给出。

## 手动指定 ppt-master 位置

ppt-master 不在默认位置时，设置环境变量：

```bash
export MED_PPT_MASTER_DIR=/path/to/ppt-master/skills/ppt-master
```

## 生图与搜图 API（Kimi、WorkBuddy 等没有自带生图的平台）

生图和搜图都由 ppt-master 的脚本完成（`image_gen.py`、`image_search.py`），med-ppt 只判断用哪个。配置写在**用户级文件** `~/.ppt-master/.env`，不要放进 Skill 文件夹或任何仓库：

```bash
mkdir -p ~/.ppt-master && touch ~/.ppt-master/.env && chmod 600 ~/.ppt-master/.env
```

文件内容示例（把 `<...>` 换成自己的 Key）：

```text
IMAGE_BACKEND=qwen
QWEN_API_KEY=<阿里云百炼 API Key>
# 中国大陆的百炼 Key 需要这一行；国际站 Key 删掉它
QWEN_BASE_URL=https://dashscope.aliyuncs.com
PEXELS_API_KEY=<Pexels API Key>
```

- 其他后端：火山引擎 Seedream 用 `IMAGE_BACKEND=volcengine` + `ARK_API_KEY`；完整列表运行 `python3 <ppt-master>/scripts/image_gen.py --list-backends`。每个后端只支持 ppt-master 指定的模型版本（如 Qwen 为 `qwen-image-2.0-pro`，Seedream 为 4.5）。
- 运行 `python3 med-ppt/scripts/locate_ppt_master.py`，看到 `image_backend` 与 `image_backend_key_set: true` 即配置成功。
- ppt-master 按"当前目录 `.env` → Skill 目录 → 仓库根目录 → `~/.ppt-master/.env`"取第一个存在的文件。工作目录里另有 `.env` 时，它会挡住用户级配置。
- 生图按张计费，一份汇报通常 2–4 张，价格以各平台为准；Pexels 免费，照片按 Pexels 许可使用、无需署名。
- 分享 Skill 时，每个人用自己的 Key；不要把 `.env` 打进压缩包或发给别人。
