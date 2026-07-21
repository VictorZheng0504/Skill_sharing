# Healthcare Navigation Assistant

[中文](README.md)

A public-information healthcare navigation workflow for patients without personal medical connections. It helps identify suitable clinicians or specialists in Beijing, Shanghai, Guangzhou, Shenzhen, Chengdu, Wuhan, and Changsha through structured intake, verification, tiered options, and an actionable visit plan.

> This is an information-navigation tool, not medical diagnosis or treatment advice. It cannot replace an in-person clinician. For emergencies, contact local emergency services or go to the nearest emergency department.

## What it does

- Collects essential clinical, treatment-history, location, urgency, and budget constraints in manageable groups
- Searches multiple public sources and independently cross-checks candidate clinicians to reduce identity, department, and employment-status errors
- Scores options dynamically by condition and constraints, then presents primary, backup, and practical alternatives
- Provides booking routes, expected booking difficulty, records to bring, suggested visit questions, and anti-scalper warnings
- Packages results into a saveable HTML dashboard for ongoing follow-up

## Installation

From the repository root:

```bash
mkdir -p ~/.claude/skills
cp -r find-doctor ~/.claude/skills/
```

Restart Claude Code. The skill can then trigger on requests such as finding a doctor, choosing a department for a condition, or identifying specialists in a city.

## Contents

- [SKILL.md](SKILL.md): workflow, privacy rules, verification requirements, and output format
- [reference.md](reference.md): triage, source priority, scoring weights, key hospitals, and warning signs
- [artifact-template.html](artifact-template.html): saveable HTML dashboard template for recommendations

## Safe use

Do not provide names, identity-card numbers, phone numbers, detailed addresses, or unredacted records. Employment and appointment information can change, so confirm through official hospital channels before booking. Do not use scalpers, paid appointment agents, or purported internal channels.

## License

No separate license is included in this directory. Unless applicable law states otherwise, do not treat the contents as open-source licensed.
