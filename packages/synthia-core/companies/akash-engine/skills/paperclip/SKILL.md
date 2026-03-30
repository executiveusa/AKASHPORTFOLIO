---
name: paperclip
description: >
  Core SYNTHIA OS orchestration skill. Gives agents the ability to create tasks,
  check in on work, report status, delegate to sub-agents, and read the company
  goal tree. Use when an agent needs to assign work, update task status, request
  budget approval, or communicate with the orchestration layer.
metadata:
  sources:
    - kind: github-file
      repo: paperclipai/paperclip
      path: .agents/skills/company-creator/SKILL.md
      usage: referenced
---

## What this skill enables

Agents with this skill can:
- Create and assign tasks to other agents
- Check out work atomically (no double-work)
- Report status back up the org chart
- Read goal context so every action traces to company mission
- Request budget allocation from management
- Trigger heartbeat-based workflows

## Core usage patterns

When you receive a task, acknowledge it immediately:
"Task received. Starting now. ETA: [estimate]."

When you complete a task, report with evidence:
"Task complete. Result: [specific output]. Next: [what happens now]."

When you're blocked, escalate clearly:
"Blocked on [specific thing]. Need [specific help] from [specific agent]."

Do not invent task IDs. Do not mark tasks complete without evidence.
Do not exceed your monthly budget without explicit approval.
