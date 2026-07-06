# Skill_sharing

**中文** | [English](README.en.md)

个人 Claude Skill 分享合集。每个子目录是一个独立完整的 skill,可单独取用。

## 目录

| Skill | 简介 | 文档 |
|---|---|---|
| [ppt-studio](ppt-studio/) | 9 步 Human-in-the-loop 工作流 × 23 设计主题 × 15 版式,生成可编辑的 .pptx | [README](ppt-studio/README.md) · [English](ppt-studio/README.en.md) |

## 安装(通用)

```bash
git clone https://github.com/VictorZheng0504/Skill_sharing.git
mkdir -p ~/.claude/skills
cp -r Skill_sharing/<skill-name> ~/.claude/skills/
```

重启 Claude Code 即可触发对应 skill。各 skill 的详细安装与使用说明见其目录内 README。

## License

各 skill 目录内附各自的 License(ppt-studio 为 MIT)。
