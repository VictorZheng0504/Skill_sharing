# Skill_sharing

[中文](README.md) | **English**

A personal collection of Claude Skills. Each subdirectory is a complete, self-contained skill that can be used independently.

## Catalog

| Skill | Summary | Docs |
|---|---|---|
| [ppt-studio](ppt-studio/) | 9-step human-in-the-loop workflow × 23 design themes × 15 layouts, generates editable .pptx | [English](ppt-studio/README.en.md) · [中文](ppt-studio/README.md) |

## Installation (general)

```bash
git clone https://github.com/VictorZheng0504/Skill_sharing.git
mkdir -p ~/.claude/skills
cp -r Skill_sharing/<skill-name> ~/.claude/skills/
```

Restart Claude Code and the skill will trigger on matching requests. See each skill's own README for detailed installation and usage.

## License

Each skill ships its own license inside its directory (ppt-studio is MIT).
