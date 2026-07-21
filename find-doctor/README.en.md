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

## Example output

The following **historical example** was generated on 2026-06-24 for a pituitary-tumor surgery scenario in Shanghai. It shows how the skill packages an intake summary, tiered options, and a next-step checklist into a saveable dashboard. It is only a demonstration of the output format and **is not a current clinician recommendation, diagnosis, or treatment advice**. Clinician details, appointments, prices, and care pathways may change; confirm them through official hospital channels and an in-person clinician before acting.

[Download the full example PDF](examples/pituitary-tumor-surgery/pituitary-tumor-surgery-example.pdf) · [Example notes](examples/pituitary-tumor-surgery/README.md)

| Intake summary and care-path reminder | Tiered recommendation card |
|---|---|
| ![Intake summary and care-path reminder](examples/pituitary-tumor-surgery/01-case-overview.png) | ![Tiered recommendation card](examples/pituitary-tumor-surgery/02-tiered-recommendation.png) |

![Action checklist](examples/pituitary-tumor-surgery/03-action-checklist.png)

## Safe use

Do not provide names, identity-card numbers, phone numbers, detailed addresses, or unredacted records. Employment and appointment information can change, so confirm through official hospital channels before booking. Do not use scalpers, paid appointment agents, or purported internal channels.

## License

No separate license is included in this directory. Unless applicable law states otherwise, do not treat the contents as open-source licensed.
