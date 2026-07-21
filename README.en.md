# Skill_sharing

[中文](README.md) | **English**

A personal collection of Claude Skills. Each subdirectory is a complete, self-contained skill that can be used independently.

## Catalog

| Skill | Summary | Docs |
|---|---|---|
| [find-doctor](find-doctor/) | Healthcare navigation for patients in Chinese cities: structured intake, multi-source verification, tiered doctor options, and an actionable visit checklist | [English](find-doctor/README.en.md) · [中文](find-doctor/README.md) |
| [ppt-studio](ppt-studio/) | 9-step human-in-the-loop workflow × 23 design themes × 15 layouts, generates editable .pptx | [English](ppt-studio/README.en.md) · [中文](ppt-studio/README.md) |

## Installation (general)

```bash
git clone https://github.com/VictorZheng0504/Skill_sharing.git
mkdir -p ~/.claude/skills
cp -r Skill_sharing/<skill-name> ~/.claude/skills/
```

Restart Claude Code and the skill will trigger on matching requests. See each skill's own README for detailed installation and usage.

## License

License terms, when provided, live in each skill directory (`ppt-studio` is MIT). `find-doctor` currently has no separate license included.
