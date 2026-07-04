# Task Prompt Templates

Copy one template into a future session and fill the bracketed fields.

## 1. Search / Research Task

Context: [project/topic]
Goal: Find [specific answer].
Constraints: Use primary or official sources when possible. Mark uncertain facts as `UNCONFIRMED`.
Files allowed to touch: none unless asked.
Files not allowed to touch: all project files.
Acceptance criteria: Provide concise findings with source links and dates.
Verification steps: Cross-check at least two sources for unstable claims.
Report format: Summary, evidence, uncertainty, next action.

## 2. Code Implementation Task

Context: [repo path and feature]
Goal: Implement [specific behavior].
Constraints: Match existing code style. Keep edits scoped.
Files allowed to touch: [paths].
Files not allowed to touch: [paths].
Acceptance criteria: [observable behavior].
Verification steps: Run [tests/commands/browser checks].
Report format: Changed files, verification, risks.

## 3. Refactor Task

Context: [code area].
Goal: Refactor [target] without changing behavior.
Constraints: No unrelated formatting. Preserve public APIs.
Files allowed to touch: [paths].
Files not allowed to touch: [paths].
Acceptance criteria: Same behavior, clearer structure, tests pass.
Verification steps: Search for all call sites; run existing tests.
Report format: Before/after summary, files changed, tests.

## 4. Debugging Task

Context: [bug report and environment].
Goal: Find root cause and fix.
Constraints: Reproduce first if possible. Do not guess.
Files allowed to touch: [paths].
Files not allowed to touch: [paths].
Acceptance criteria: Bug no longer reproduces.
Verification steps: Show reproduction command/check before and after.
Report format: Root cause, fix, verification, residual risk.

## 5. Report Review Task

Context: [report path/topic].
Goal: Review for logic, evidence, structure, and clarity.
Constraints: Separate facts from recommendations.
Files allowed to touch: [paths or none].
Files not allowed to touch: [paths].
Acceptance criteria: Actionable findings with severity.
Verification steps: Check claims against sources or mark `UNCONFIRMED`.
Report format: Findings first, then summary.

## 6. UI/UX Critique Task

Context: [page/screen].
Goal: Critique and improve [workflow].
Constraints: Prioritize user task success, mobile fit, accessibility, and existing design language.
Files allowed to touch: [paths].
Files not allowed to touch: [paths].
Acceptance criteria: Clearer hierarchy and verified interaction.
Verification steps: Screenshot or browser check at mobile and desktop widths.
Report format: Issues, changes, verification.

## 7. Data Pipeline / Dashboard Task

Context: [pipeline/dashboard].
Goal: Build or fix [specific metric/view].
Constraints: Preserve source data. Do not silently drop rows.
Files allowed to touch: [paths].
Files not allowed to touch: [paths].
Acceptance criteria: Correct data, clear visualization, reproducible run.
Verification steps: Row counts, schema checks, sample calculations.
Report format: Data sources, transformations, validation, output path.

## 8. Git Safety / Repo Audit Task

Context: [repo path].
Goal: Audit current state without changing files.
Constraints: Read-only unless explicitly approved.
Files allowed to touch: none.
Files not allowed to touch: all files.
Acceptance criteria: Identify dirty files, branches, risks, and safe next command.
Verification steps: `git status --short`, branch info, recent commits.
Report format: Current state, risks, recommended next steps.

## 9. Fresh-Context Review Task

Context: Another agent changed [files].
Goal: Review for bugs, regressions, and missing verification.
Constraints: Do not rewrite unless asked. Findings first.
Files allowed to touch: none unless approved.
Files not allowed to touch: all files.
Acceptance criteria: Each finding has path, line, severity, and rationale.
Verification steps: Inspect diff and run targeted checks if available.
Report format: Findings, questions, test gaps, summary.

