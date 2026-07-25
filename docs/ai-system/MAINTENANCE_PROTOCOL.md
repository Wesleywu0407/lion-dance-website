# Maintenance Protocol

## Files Weaker Models May Edit Freely

- `TASK_PROMPT_TEMPLATES.md` for adding new templates.
- `LETTER_TO_FUTURE_SESSIONS.md` for new handoff notes.
- Project-specific notes appended to the end of this file.

Freely means: edit only the relevant section and preserve existing useful rules.

## Files Requiring User Confirmation

- `CLAUDE.md`, because it affects all future sessions.
- `.claude/settings.local.json`, `.claude/launch.json`, deployment files, git config, or workflow files.
- Any file deletion.
- Any rule that changes permission, routing, billing, or destructive-command behavior.

## Mistake Recording

When an agent makes or finds a mistake, add a lesson learned using this format:

```text
Date:
Project:
Mistake:
Root cause:
Bad instruction that allowed it:
New rule:
Where this rule was added:
```

## Lessons Learned Location

Add lessons under `Lessons Learned` in this file unless the lesson is a prompt template. Prompt templates go in `TASK_PROMPT_TEMPLATES.md`.

## Compact Or Split Files

Compact when:
- A file exceeds 300 lines.
- Rules repeat across two files.
- A weak model may miss the action because the section is too long.

Split when:
- One file mixes routing, verification, and project-specific facts.
- A checklist grows beyond one screen per topic.

## Delete Stale Rules

Delete or update a rule when:
- It names a tool that no longer exists.
- It conflicts with current project commands.
- It duplicates a clearer rule elsewhere.

Before deleting, note the reason in the commit message or final response.

## Keep `CLAUDE.md` Short

- `CLAUDE.md` is an index, not a manual.
- Maximum 150 lines.
- Move long examples to `TASK_PROMPT_TEMPLATES.md`.
- Move quality rubrics to `JUDGMENT_CHECKLISTS.md`.
- Move routing logic to `MODEL_ROUTING_RULES.md`.

## Add Project-Specific Rules

Project-specific rules belong in `CLAUDE.md` only if every future session needs them.

Otherwise:
- UI rules go in `JUDGMENT_CHECKLISTS.md`.
- Reusable prompts go in `TASK_PROMPT_TEMPLATES.md`.
- Maintenance notes go here.

## Lessons Learned

Date: 2026-07-25

Project: liondancewebsite

Mistake: Agent initially audited another website on the same Desktop instead of the lion-dance website.

Root cause: The project was inferred from a nearby repository before confirming the user's reference to the lion-dance brand and the `101` homepage content.

Bad instruction that allowed it: "Find the active web project" without first matching the user's brand-specific clues against candidate repositories.

New rule: When multiple website repositories exist, search the user's distinctive terms and confirm the matching project before starting a visual audit or edits.

Where this rule was added: `docs/ai-system/MAINTENANCE_PROTOCOL.md`.
