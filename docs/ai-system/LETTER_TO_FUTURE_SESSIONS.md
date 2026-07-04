# Letter To Future Sessions

## Three Things The User Did Not Ask For But Future Models Must Know

1. The project is a visual public website. A code-only check is not enough for UI work; verify mobile layout and interaction.
2. The worktree may be dirty. Preserve user edits and inspect `git status --short` before touching files.
3. The image folders are large. Do not scan assets unless the request is image-specific.

## Most Likely Ways This System Will Degrade

1. `CLAUDE.md` becomes a dumping ground for long rules.
2. Future agents add vague advice instead of concrete checks.
3. Model names, pricing, or tool behavior become outdated.
4. Website-specific rules get mixed with global AI-routing rules.

## How To Prevent Degradation

1. Keep `CLAUDE.md` under 150 lines.
2. Add examples and verification methods for every new rule.
3. Mark model/provider facts as `UNCONFIRMED` unless verified from current official docs.
4. Put project-specific notes in the file that matches their type.

## Lowest-Confidence Files

1. `MODEL_ROUTING_RULES.md`
   - Reason: current model names, prices, and billing behavior were not verifiable locally.
2. `TASK_PROMPT_TEMPLATES.md`
   - Reason: templates are generic and should be refined after real future use.
3. `MAINTENANCE_PROTOCOL.md`
   - Reason: actual future workflow may differ depending on available agents and tools.

## Improve In The Next High-End Model Session

1. Verify current model options, billing, and effort controls from official provider docs or dashboard.
2. Add deployment-specific rules after the hosting target is confirmed.
3. Add project-specific visual QA standards with screenshot examples.
4. Review whether `.claude/settings.local.json` permissions are still appropriate.

## Do Not Waste Expensive Model Time On

1. Bulk asset inventory.
2. Repetitive HTML/CSS formatting.
3. Long raw command-output reading.
4. Batch application after a pattern is already solved.
5. Guessing facts that the user can provide faster.

## Unfinished Items

No required file is intentionally unfinished.

