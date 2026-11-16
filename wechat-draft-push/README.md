# wechat-draft-push：公众号排版 + 自动进草稿箱

把写好的文章排成公众号样式，一条命令推进公众号草稿箱。最后点"发表"这一步，还是你自己在手机上做。

- 只用 Python 自带的库，不用另装依赖。Mac 上已实测；Windows 尚未实测。
- 适合个人和企业公众号：个人主体订阅号能调草稿接口，但没有发布接口，所以只能进草稿箱。
- 必须在你自己的电脑上运行：公众号要求把调用接口的电脑 IP 加进白名单，云端的 IP 不固定。

## 安装

把整个 `wechat-draft-push` 文件夹放到你用的 AI 工具的 Skill 目录里：

- **Claude Code**：`~/.claude/skills/wechat-draft-push/`
- **Codex**：`~/.codex/skills/wechat-draft-push/`
- **WorkBuddy**：`~/.workbuddy/skills/wechat-draft-push/`，或者在对话里说"导入技能"，把文件夹里的 `SKILL.md` 拖进去【待实测】
- **豆包（电脑版办公模式）**：用本机模式，不要用云电脑【待实测】

`~` 是你的用户目录：Mac 上是 `/Users/你的用户名`，Windows 上是 `C:\Users\你的用户名`。文件夹名以 `.` 开头，默认是隐藏的。Mac 在访达里按 `Cmd + Shift + .` 显示，Windows 在资源管理器的「查看」里勾选「隐藏的项目」。

装好后对 AI 说：**"用 wechat-draft-push 帮我配置公众号推送"**，它会一步步带你做：

1. 生成配置文件，你自己填 AppID 和 AppSecret（不要发给 AI）。
2. 查微信看到的本机 IP，告诉你去哪里加白名单。
3. 推一篇示例文章到草稿箱，确认整条流程能跑通。

以后写完文章，说**"把这篇推到公众号草稿箱"**就行。想换风格，说**"用干货教程那套排"**或者**"所有模板都排一遍给我看"**。

## 文件说明

- `SKILL.md`：给 AI 看的操作说明
- `scripts/wechat.py`：主脚本（setup / ip / preview / push / templates）
- `scripts/templates/`：16 套排版模板 b～q，排版逻辑都在 `_engine.py`
- `references/模板语法.md`：文章怎么写才能排出这些样式（所有模板通用）
- `references/模板一览.md`：每套模板长什么样、适合什么文章、怎么换颜色
- `references/自制模板.md`：照着喜欢的公众号，让 AI 做一套自己的模板
- `examples/示例文章.md`：第一次用来测试的示例
- `展示图/`：16 套模板的效果拼图（两张，每张 8 套），可以直接拿去给别人看；模板有改动时，跑里面的 `生成展示图.py` 重新出图

配置文件放在 `~/.wechat-draft-push/.env`，不在这个文件夹里，所以把这个文件夹分享给别人不会带出你的密钥。
