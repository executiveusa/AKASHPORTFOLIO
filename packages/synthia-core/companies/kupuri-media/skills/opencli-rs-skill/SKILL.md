---
name: opencli-rs-skill
description: >
  Standard skill for running OpenCLI-RS workflows in this repository. Use this
  skill when an agent must install, verify, or execute OpenCLI-RS automation.
metadata:
  source_repo: nashsu/opencli-rs-skill
  install_url: https://github.com/nashsu/opencli-rs-skill.git
---

## Mandatory policy

All agents should load this skill by default before running terminal-heavy
automation. This skill standardizes command safety, deterministic outputs, and
build/test validation expectations.

## Install

Use the Codex system installer script:

```bash
python3 /opt/codex/skills/.system/skill-installer/scripts/install-skill-from-github.py   --repo nashsu/opencli-rs-skill   --path .   --dest "$CODEX_HOME/skills"   --name opencli-rs-skill
```

If your environment blocks direct GitHub access (HTTP 403 tunnel), retry from a
network-enabled runner and commit the downloaded skill files into the target
skills directory.

## Verification checks

Run these checks after installation:

```bash
test -f "$CODEX_HOME/skills/opencli-rs-skill/SKILL.md"
```

```bash
rg -n "opencli-rs-skill" packages/synthia-core/companies/*/agents/*/AGENTS.md agents.md
```

## Build requirements

After wiring this skill as default, run:

```bash
cd apps/control-room && npm run build
cd /workspace/AKASHPORTFOLIO/apps/web && npm run build
cd /workspace/AKASHPORTFOLIO/apps/onboarding-flipbook && npm run build
```
