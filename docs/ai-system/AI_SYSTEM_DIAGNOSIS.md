# AI System Diagnosis

Environment Audit Summary

1. Confirmed:
   - Project root: `/Users/wumingjuan/Desktop/liondancewebsite`.
   - Static website using HTML, CSS, JavaScript, images, and `.glb` assets.
   - `.claude/` exists with `settings.local.json` and `launch.json`.
   - Local preview command exists in `.claude/launch.json`: `python3 -m http.server 8123`.
   - No existing `CLAUDE.md`, `AGENTS.md`, README, or docs directory was found during audit.
   - Git worktree already had modified files: `contact.html`, `css/sections/contact.css`, `script.js`.
2. Assumed:
   - Future agents should optimize for small, safe edits to this static website unless the user says otherwise.
   - Visual checks matter because this project is a public-facing UI/UX website.
3. Could not verify:
   - Available model names, pricing, billing, or effort settings: `UNCONFIRMED -- verify in usage dashboard or provider docs.`
   - Available subagents and MCP servers outside the current tool list: `UNCONFIRMED -- check current session tools.`
   - Deployment target and production build process: `UNCONFIRMED -- user must fill in.`
4. Immediate risks:
   - Existing user edits may be overwritten if an agent uses broad git restore/reset commands.
   - Large image folders can waste context if scanned without a targeted reason.
   - UI changes can look correct in code but fail on mobile viewport.
5. Files I will create:
   - `AI_SYSTEM_DIAGNOSIS.md`
   - `CLAUDE.md`
   - `MODEL_ROUTING_RULES.md`
   - `JUDGMENT_CHECKLISTS.md`
   - `TASK_PROMPT_TEMPLATES.md`
   - `MAINTENANCE_PROTOCOL.md`
   - `LETTER_TO_FUTURE_SESSIONS.md`

## Top Token Leaks

1. Reading whole image, asset, or generated folders.
   - Fix: Run `rg` or `find` with file-type filters first. Read only files that match the user request.
2. Pasting huge command output into chat.
   - Fix: Save long output to a local file and summarize the top findings, paths, and line numbers.
3. Re-reading unchanged files after every edit.
   - Fix: Use `git diff -- <files>` and targeted `sed -n` windows around changed lines.

Bad instruction: "Check the whole project and improve it."

Improved instruction: "Inspect only `contact.html`, `css/sections/contact.css`, and `script.js`; make the FAQ collapsible; verify mobile width 375px; report changed files and tests."

## Top Focus-Loss Risks

1. Mixing website content edits with global AI-system rules.
   - Fix: Put AI operating rules in Markdown files at project root, not inside website HTML/CSS.
2. Starting with broad refactors before understanding current style.
   - Fix: Read nearby code and copy local naming, spacing, and CSS structure.
3. Treating every improvement idea as in scope.
   - Fix: Write "out of scope" notes in the final response instead of editing unrelated files.

## Top File and Code Safety Risks

1. Overwriting user changes in a dirty worktree.
   - Fix: Run `git status --short` before editing. Do not revert files unless the user explicitly asks.
2. Editing binary images or generated assets without need.
   - Fix: Avoid image rewrites unless the task is asset-specific.
3. Using destructive git commands.
   - Fix: Never use `git reset --hard`, `git checkout --`, or broad delete commands without explicit confirmation.

## Top Quality Failure Modes

1. UI works on desktop but breaks on mobile.
   - Fix: Verify at `375x667` or another requested mobile viewport.
2. Accessibility is added only visually.
   - Fix: Use semantic HTML controls where possible, then verify keyboard/tap behavior.
3. Facts or SEO claims are guessed.
   - Fix: Mark uncertain claims as `UNCONFIRMED` or ask the user for source material.

