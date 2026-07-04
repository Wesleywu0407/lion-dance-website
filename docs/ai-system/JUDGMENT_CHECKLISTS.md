# Judgment Checklists

Each item has a rule, positive example, negative example, and verification method.

## 1. When To Upgrade Model

- Rule: Upgrade when the task requires judgment, ambiguous tradeoffs, or a failed retry.
- Positive example: "The mobile FAQ layout technically works, but the visual rhythm is unclear; ask a stronger reviewer."
- Negative example: "Use the strongest model to rename repeated CSS classes."
- Verification: Write the exact decision that needs judgment.

## 2. When A Task Is Truly Complete

- Rule: Complete means code changed, behavior verified, and residual risk reported.
- Positive example: "FAQ starts closed, expands on tap, and was tested at 375x667."
- Negative example: "I edited CSS, so it is done."
- Verification: Show changed files plus one test or visual check.

## 3. When To Stop And Ask The User

- Rule: Ask when missing information would cause factual, destructive, or irreversible changes.
- Positive example: "Ask before deleting old gallery images."
- Negative example: "Guess the company pricing package."
- Verification: Identify what decision cannot be safely inferred.

## 4. When Retries Mean Strategy Is Wrong

- Rule: After two failed attempts on the same issue, stop retrying the same method.
- Positive example: "CSS selector failed twice; inspect DOM and choose semantic markup."
- Negative example: "Keep adding `!important` until it looks okay."
- Verification: Record failed attempts and the new strategy.

## 5. How To Verify Quality

- Rule: Verify the user-visible outcome, not only syntax.
- Positive example: "Open local page, test mobile viewport, click the control."
- Negative example: "No syntax errors, therefore layout is good."
- Verification: Use a browser, screenshot, DOM check, or targeted command.

## 6. How To Avoid Over-Editing

- Rule: Edit only files needed for the requested outcome.
- Positive example: "FAQ request touches contact markup, contact CSS, and shared JS only."
- Negative example: "Redesign the homepage while fixing contact FAQ."
- Verification: Explain why each touched file was necessary.

## 7. How To Avoid Breaking Existing Code

- Rule: Preserve local patterns and check dependencies before renaming or removing.
- Positive example: "Search for `.contact-faq-item` before changing CSS."
- Negative example: "Delete class names because they seem unused."
- Verification: Run `rg` for selectors, functions, and IDs before removing.

## 8. How To Review Research/Report Quality

- Rule: Separate evidence, inference, and recommendation.
- Positive example: "Source says X; I infer Y; recommendation is Z."
- Negative example: "Market will grow because it feels likely."
- Verification: Each factual claim has a source or `UNCONFIRMED`.

## 9. How To Review UI/UX Quality

- Rule: Check hierarchy, interaction state, accessibility, responsive fit, and task flow.
- Positive example: "Question rows are scannable; answers stay hidden until tapped; plus/minus state is clear."
- Negative example: "It looks pretty on desktop only."
- Verification: Test at mobile and desktop widths; inspect focus and tap targets.

## 10. How To Handle Uncertain Facts

- Rule: Do not present uncertain facts as known.
- Positive example: "`UNCONFIRMED -- verify in provider docs.`"
- Negative example: "This model is cheaper" without checking current pricing.
- Verification: Mark source, date, or uncertainty.

