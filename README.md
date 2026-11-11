# Skill_sharing

**中文** | [English](README.en.md)

个人 Claude Skill 分享合集。每个子目录是一个独立完整的 skill,可单独取用。

## 目录

| Skill | 简介 | 文档 |
|---|---|---|
| [find-doctor](find-doctor/) | 面向普通患者的中国城市就医导航：结构化问诊、多源验证、分层医生推荐与可执行就诊清单 | [README](find-doctor/README.md) · [English](find-doctor/README.en.md) |
| [ppt-studio](ppt-studio/) | 9 步 Human-in-the-loop 工作流 × 23 设计主题 × 15 版式,生成可编辑的 .pptx | [README](ppt-studio/README.md) · [English](ppt-studio/README.en.md) |
| [med-ppt](med-ppt/) | 医学汇报 PPT(文献汇报 / 病例报告 / 通用医学报告),逐页规划 + 数字出处核对,依赖 ppt-master 排版导出 | [SKILL.md](med-ppt/SKILL.md) · [平台安装](med-ppt/references/platforms.md) |
| [pubmed-search](pubmed-search/) | 通过 NCBI 官方 API 检索 PubMed、校验 PMID 真伪、生成 Methods 检索报告段 | [SKILL.md](pubmed-search/SKILL.md) |
| [wechat-draft-push](wechat-draft-push/) | 文章排版成公众号样式并推进草稿箱(只进草稿箱,不发布) | [README](wechat-draft-push/README.md) |

## 安装(通用)

```bash
git clone https://github.com/VictorZheng0504/Skill_sharing.git
mkdir -p ~/.claude/skills
cp -r Skill_sharing/<skill-name> ~/.claude/skills/
```

重启 Claude Code 即可触发对应 skill。各 skill 的详细安装与使用说明见其目录内 README。

## License

各 skill 的许可条款以其目录内的文件为准（`ppt-studio` 为 MIT）。`find-doctor` 当前未附独立许可证。 med-ppt 依赖第三方 ppt-master(MIT),需另行安装,见 med-ppt/references/platforms.md。
