# ppt-studio

[中文](README.md) | **English**

> A Claude Skill: a 9-step human-in-the-loop workflow × 23 design themes × 15 layouts, generating `.pptx` files you can keep editing in PowerPoint.

**Core belief: a good deck doesn't start with writing slides — it starts with aligning on the goal.** A one-shot generated deck looks convenient, but if the style, the goal, or a single fact is off, everything downstream gets redone. So this skill splits the process into 9 fixed steps and pauses at every key checkpoint to wait for your confirmation.

## Features

- **23 themes × 15 layouts, freely combinable** — a theme is just a set of design tokens (colors / fonts / radius); layout functions only reference tokens and never hard-code a color, so any combination stays coherent
- **Layout DNA: every theme has its own signature composition** — the five hero layouts (cover / section divider / statement / closing / big-stat) are designed per theme; put any two themes side by side and the compositions are recognizably different, not just recolored
- **9-step HITL workflow** — audience interview → outline review → fact check → page planning → theme decision → style preview → spec-lock → one-shot generation → per-page QA
- **spec-lock execution lock** — once the style is approved it's written to a single source of truth, re-read before each page of a long deck to prevent context-drift style regressions
- **Light/dark rhythm** — each theme's hero pages (cover / divider / statement / closing) use a different background from content pages, giving the deck a natural breathing pattern
- **Real .pptx output** — built on [pptxgenjs](https://github.com/gitbrent/PptxGenJS); keep editing in PowerPoint / Keynote / WPS, speaker notes included
- **No heavy dependencies** — the engine depends on exactly one npm package, pptxgenjs
- **Overflow-safe engine** — the text primitive auto-shrinks multi-line overflow (single-line display type is never touched), and cards/timelines/KPI blocks adapt their height and vertical position to actual content

## Theme previews (23 themes · 8 scenarios)

| | | | |
|---|---|---|---|
| ![academic-navy](docs/previews/academic-navy.png) Academic Navy | ![minimal-gray](docs/previews/minimal-gray.png) Minimal Gray | ![research-defense](docs/previews/research-defense.png) Research Defense | ![mckinsey](docs/previews/mckinsey.png) McKinsey Blue-Gray |
| ![clean-pro](docs/previews/clean-pro.png) Clean Pro | ![dashboard](docs/previews/dashboard.png) Data Dashboard | ![magazine-ink](docs/previews/magazine-ink.png) Magazine · Ink Classic | ![indigo-porcelain](docs/previews/indigo-porcelain.png) Magazine · Indigo Porcelain |
| ![kraft-paper](docs/previews/kraft-paper.png) Magazine · Kraft Paper | ![dune](docs/previews/dune.png) Magazine · Dune | ![swiss-ikb](docs/previews/swiss-ikb.png) Swiss · Klein Blue | ![swiss-lemon](docs/previews/swiss-lemon.png) Swiss · Lemon |
| ![swiss-orange](docs/previews/swiss-orange.png) Swiss · Safety Orange | ![tokyo-night](docs/previews/tokyo-night.png) Tokyo Night | ![nord](docs/previews/nord.png) Nord | ![terminal-green](docs/previews/terminal-green.png) Terminal Green |
| ![warm-academic](docs/previews/warm-academic.png) Warm Academic | ![soft-pastel](docs/previews/soft-pastel.png) Soft Pastel | ![neo-brutalism](docs/previews/neo-brutalism.png) Neo-Brutalism | ![bauhaus](docs/previews/bauhaus.png) Bauhaus |
| ![keynote-dark](docs/previews/keynote-dark.png) Keynote · Night | ![keynote-light](docs/previews/keynote-light.png) Keynote · Morning | ![vic-medical](docs/previews/vic-medical.png) Vic Medical | |

Full palettes, fonts, use cases, and the recommendation matrix for every theme: [references/theme-gallery.md](references/theme-gallery.md) (Chinese).

## The 15 layouts

`cover` · `toc` · `sectionDivider` · `statement` · `contentRows` · `twoColumn` · `threeCards` · `comparison` · `imageText` · `kpiGrid` · `bigStat` · `timeline` · `table` · `processSteps` · `closing`

Parameter signatures and capacity limits: [references/layout-catalog.md](references/layout-catalog.md) (Chinese).

---

## Installation

### Prerequisites

- [Claude Code](https://claude.com/claude-code) or any Claude client that supports Skills (Claude Desktop / Cowork)
- Node.js ≥ 18 (used by the engine to generate .pptx)

### Option 1: as a Claude Code personal skill (recommended)

This project lives in the `ppt-studio/` subdirectory of the collection repo [VictorZheng0504/Skill_sharing](https://github.com/VictorZheng0504/Skill_sharing):

```bash
git clone https://github.com/VictorZheng0504/Skill_sharing.git
mkdir -p ~/.claude/skills
cp -r Skill_sharing/ppt-studio ~/.claude/skills/
```

Restart Claude Code, then say something like "make me a deck" to trigger it.

### Option 2: project-level skill

Put it under a project's `.claude/skills/` directory to scope it to that project:

```bash
cp -r ppt-studio <your-project>/.claude/skills/
```

### Option 3: package as a .skill file

Clients that support `.skill` import (e.g. Claude Desktop) can import a packaged file directly:

```bash
cd ppt-studio/.. && zip -r ppt-studio.skill ppt-studio -x "*.git*" "*docs/previews*" "*.DS_Store"
```

### Engine runtime (first generation)

When generating a deck, the skill installs its single dependency in the working directory:

```bash
npm i pptxgenjs
```

No PowerPoint required — generation is pure Node.js and the output is a standard OOXML `.pptx` file.

### A note on language

The skill's workflow documents (`SKILL.md`, `references/`) are written in Chinese — they are read by Claude, not by you, and Claude handles them fine regardless of your conversation language. You can use the entire workflow in English: just talk to Claude in English and the generated deck follows your content language.

---

## Quick start

### With Claude (full 9-step workflow)

Give Claude your outline and say "turn this outline into a deck". It will:

1. Ask one structured questionnaire covering **audience / duration / goal / medium**
2. Polish the outline (before/after diff) → wait for your OK
3. List high-risk facts → ask whether to verify online
4. Present a **page plan** (layout + key message per page) → wait for your OK
5. Recommend 1 theme + 2 alternates out of 23 → you choose
6. Generate a 2-page style preview → cheap to change direction if you don't like it
7. Write the spec-lock, generate all pages in one pass with per-page QA
8. Deliver the .pptx + a QA summary

### Direct engine use (skip the workflow)

```js
const { createDeck, listThemes } = require("./assets/deck_engine");

const d = createDeck("swiss-ikb", {
  title: "My Talk", author: "Your Name",
  footer: "Footer brand line", slogan: "Small print on the cover",
});

d.S.cover({
  kicker: "KEYNOTE 2026",
  title: [["Make ideas", false], [" land", true]],   // true = accent color
  subtitle: "One-line subtitle", speaker: "Speaker: Someone",
});
d.S.contentRows({
  kicker: "METHOD", title: "Three steps",
  rows: [["01", "Align the goal", "audience, duration, goal, medium"],
         ["02", "Lock the style", "spec-lock freezes decisions"],
         ["03", "Generate page by page", "QA check on every page"]],
  page: "02", notes: "Speaker notes for this page",
});
d.S.closing({ kicker: "THANKS", title: [["Thank you", false]], cta: "github.com/VictorZheng0504/Skill_sharing" });

d.save("my-deck.pptx");
```

```bash
npm i pptxgenjs && node build.js
```

---

## Directory structure

```
ppt-studio/
├── SKILL.md                        # The 9-step workflow doc (read by Claude)
├── references/
│   ├── interview-template.md       # Step 1 interview questionnaire
│   ├── theme-gallery.md            # 23-theme gallery + scenario matrix + font notes
│   ├── layout-catalog.md           # 15-layout catalog + signatures + capacity limits
│   ├── spec-lock-template.md       # Execution-lock template and rules
│   └── qa-checklist.md             # Per-page QA checklist
├── assets/
│   ├── deck_engine.js              # Layout engine (single dependency: pptxgenjs)
│   └── themes.json                 # 23 sets of design tokens
└── docs/previews/                  # Theme preview images (for this README)
```

## Fonts

Most themes prefer open-source fonts. **Missing fonts fall back to system fonts without errors**, at some visual cost:

| Font | Affected themes | Download |
|---|---|---|
| Noto Serif SC / Noto Sans SC | academic & magazine families | [Google Fonts](https://fonts.google.com/noto/specimen/Noto+Serif+SC) |
| Inter | Swiss family, minimal, dashboard | [rsms.me/inter](https://rsms.me/inter/) |
| JetBrains Mono | dark themes, terminal-green | [jetbrains.com/mono](https://www.jetbrains.com/lp/mono/) |
| Playfair Display | magazine display type | [Google Fonts](https://fonts.google.com/specimen/Playfair+Display) |

Zero-install safe picks: `mckinsey` / `clean-pro` / `warm-academic`. Before presenting on another machine, verify fonts there.

## FAQ

**Q: Can I customize colors?**
Single-value hex edits are not supported by design — the 23 palettes are tuned as complete sets, and changing one value easily breaks readability. For brand customization, copy a theme's token set in `assets/themes.json`, modify it as a whole, and check contrast yourself (body text ≥ 4.5:1).

**Q: Can dark themes be printed?**
Not recommended — dark backgrounds waste ink and print with poor contrast. For handouts, regenerate with a light theme (switching themes = changing one parameter).

**Q: Why .pptx instead of HTML slides?**
Editability — you can keep fine-tuning in PowerPoint after generation. The trade-off is giving up CSS animations and gradient text; the engine translates layout skeletons + palettes + type hierarchy.

**Q: What if I change my mind about the theme mid-generation?**
Edit `theme_id` in the spec-lock and rerun the build script — not a single line of layout or content code changes.

## Credits

The template system and workflow design stand on the shoulders of four open-source projects. Sincere thanks to their authors:

| Project | Author | License | What we learned from it |
|---|---|---|---|
| [ppt-master](https://github.com/hugohe3/ppt-master) | [@hugohe3](https://github.com/hugohe3) | MIT | The spec-lock "single source of truth" execution lock; re-reading the spec before each page to prevent style drift in long decks; decoupling brand from layout |
| [guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill) | [@op7418](https://github.com/op7418) | AGPL-3.0 | The "preset palettes only" philosophy (no custom hex); the hero/content light-dark rhythm rule; color inspiration for the magazine and Swiss palettes |
| [html-ppt-skill](https://github.com/lewislulu/html-ppt-skill) | [@lewislulu](https://github.com/lewislulu) | MIT | The core architectural inspiration — "one set of semantic design tokens + N themes that only override token values + layouts that only reference tokens"; scenario-based theme organization; tokyo-night / nord picks |
| [codex-ppt-skill](https://github.com/ningzimu/codex-ppt-skill) | [@ningzimu](https://github.com/ningzimu) | MIT | Multi-gate human-in-the-loop workflow design; using an approved sample page as the style anchor for the full deck; organizing styles by use case rather than color |

Also thanks to [PptxGenJS](https://github.com/gitbrent/PptxGenJS) (MIT) — the engine's only runtime dependency.

**Independent implementation statement**: the engine (`assets/deck_engine.js`) was written from scratch against the public pptxgenjs API; SKILL.md and all documents are original writing. No code, templates, or documentation text was copied from the projects above. From guizang-ppt-skill (AGPL-3.0) only color values and design ideas were referenced, which does not constitute a derivative work. If any of the authors above feel the attribution is inappropriate, please open an issue.

## License

[MIT](LICENSE)
