# Project AI Rules

This file is the short router for future Claude/Codex-style agents. Keep it under 150 lines. Put detailed rules in the linked files.

## Project

- Root: `/Users/wumingjuan/Desktop/liondancewebsite`
- Type: static public website for Taiwan Nanxian lion/dragon dance services.
- Main files: `*.html`, `css/`, `script.js`, `images/`, `assets/`, `models/`.
- Local preview: `python3 -m http.server 8123` from project root.

## Read First

1. `docs/ai-system/AI_SYSTEM_DIAGNOSIS.md`
2. `docs/ai-system/MODEL_ROUTING_RULES.md`
3. `docs/ai-system/JUDGMENT_CHECKLISTS.md`
4. `docs/ai-system/TASK_PROMPT_TEMPLATES.md`
5. `docs/ai-system/MAINTENANCE_PROTOCOL.md`
6. `docs/ai-system/LETTER_TO_FUTURE_SESSIONS.md`
7. `docs/SITE_STRUCTURE.md`

## Before Editing Files

- Run `git status --short`.
- Identify exact files needed for the task.
- Read nearby code before editing.
- Preserve user changes in dirty files.
- Do not use destructive git commands unless the user explicitly asks.
- Use targeted edits. Do not reformat unrelated files.

## Website UI Rules

- Match existing visual language, typography, spacing, and CSS file organization.
- Mobile layout matters. Verify common mobile width before reporting done.
- Use semantic HTML controls before custom JavaScript when possible.
- For UI changes, verify behavior and layout, not only syntax.
- Do not add marketing-style sections unless the user asks.

## When To Ask The User

- Ask before deleting files, overwriting user edits, changing deployment settings, or making large unrelated refactors.
- Ask when required content, source facts, brand claims, pricing, legal claims, or event details are missing.
- Ask if the same blocking condition occurs twice after narrowing the task.

## When To Delegate Or Escalate

- Delegate bulk search, repetitive line checks, or large file inventory.
- Escalate when a small model fails the same subtask once, or a normal model fails the same subtask twice.
- Use a fresh-context reviewer for important UI, SEO, data, or report work.
- See `docs/ai-system/MODEL_ROUTING_RULES.md` for exact routing rules.

## Reporting Back

- Lead with what changed.
- List files changed with paths.
- Mention verification performed.
- Mention anything not verified.
- Keep the final answer concise and useful.
