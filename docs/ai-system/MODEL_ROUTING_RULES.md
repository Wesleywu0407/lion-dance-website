# Model Routing Rules

Model names, pricing, billing behavior, and effort controls are `UNCONFIRMED -- verify in usage dashboard or provider docs.`

Use these roles by capability, not by brand name.

## Core Principle

The commander agent does not do bulk work. The commander chooses scope, delegates repeatable work, checks conclusions, and protects files.

## Cheap Model

Use for:
- Repetitive formatting after the pattern is solved.
- Listing files from a narrow directory.
- Applying the same small CSS/HTML change across known files.

Do not use for:
- Final judgment on UI quality.
- Unverified factual claims.
- Risky git operations.

Rule: If the cheap model fails once, either narrow the task or escalate.

## Normal Model

Use for:
- Ordinary code edits.
- Small debugging tasks.
- Implementing a clearly scoped UI change.
- Drafting project docs from confirmed facts.

Rule: If the normal model fails the same subtask twice, escalate with the full failure trace.

## High-End Model

Use for:
- System design and rule creation.
- Ambiguous architecture decisions.
- High-risk refactors.
- UX judgment where tradeoffs matter.
- Deciding what should be delegated.

Do not use for:
- Bulk file reading.
- Repetitive rewriting.
- Long asset inventory.

## Fresh-Context Reviewer

Use when:
- The implementing agent may be biased by its own work.
- The change affects public UI, SEO, data pipelines, reports, or safety.
- The task has gone through more than one retry loop.

Reviewer output must include:
- Findings only.
- File paths and line numbers.
- Severity.
- Missing tests or verification gaps.

## Subagent

Use for:
- Bulk search.
- Reading many files.
- Independent QA.
- Comparing variants.

Delegation prompt must include:
- Goal.
- Motivation.
- Files allowed to inspect.
- Files not allowed to edit.
- Acceptance criteria.
- Report format.

Subagent report format:

```text
Conclusion:
Evidence:
Files and lines:
Risks:
Recommended next action:
```

Subagents must return conclusions, file paths, and line numbers. They must not paste long raw output into main chat.

## Human/User Confirmation

Ask the user before:
- Deleting files.
- Reverting user edits.
- Running destructive git commands.
- Changing deployment, DNS, payment, account, or production settings.
- Inventing missing business facts.
- Making a broad redesign when the user requested a narrow fix.

## Retry Limits

- Same issue maximum two retry loops.
- After two loops, stop and change strategy.
- If the pattern is solved, downgrade to cheap model for batch application.
- Validation must not be performed only by the same agent that created the work.

## Long Output Rule

If output is longer than 100 lines:
- Save it to a file.
- Summarize the result in chat.
- Include path to the saved file.

