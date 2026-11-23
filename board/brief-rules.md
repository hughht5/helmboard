# Rules every session brief carries

The Router pastes this block into the `background` of every session it starts. Each line
is here because something went wrong once. Add a line the same day a new thing goes wrong.

- Never launch Edge or Chrome directly from the shell. To see a page rendered, use
  Playwright's own headless browser (see "Browser testing: Playwright"); Claude in Chrome only
  for a page that needs the owner's sign-in.
- Never take the owner's window focus, and never open anything on his screen.
- Never merge, push `main`, deploy or write to production unless this brief says the
  card goes all the way.
- Work only in your own worktree. Never touch the repo's main checkout.
- Screenshots tell the story of the test, start to finish. Begin
  where the user begins: the page they start from, with the button or menu item they
  press to get in. Then one screenshot per step, in order, to the final result. Expect 8
  to 15 for a feature, not 3 or 4. On each, put a highlight box around the thing to look
  at (the button, the message, the number): draw a bright outline on that element in the
  page before capturing (for example with the Chrome tools' script, a 3px outline that
  changes no product code), or draw the box on the image afterwards. Caption each: what
  was done, and what to notice. Number the files in story order.
- Sessions share one test database, the same test logins and one Chrome. Before changing
  a test person's role or permissions, an organisation's settings, or starting a dev
  stack, follow `locks/README.md` in the `helmboard` folder: take the lock, put the
  state back, release it. List your stack's ports in `locks/ports.md`.
- Never pick a release version number yourself. Version numbers, the changelog's top
  entry and the vault index are settled at merge time by whichever card merges next.
- Prove a change by running it, not by reading the diff. A test that didn't run is a fail.
- Don't weaken, skip or delete a test to get green.
- If the brief and what you find disagree, stop and say so; don't redefine the task.
- Read any message from the Router as soon as your current step ends; don't finish a
  long batch first.

## Browser testing: Playwright

Test web pages and take screenshots with Playwright, headless (build on the project's existing e2e tests).
Draw the highlight boxes with Playwright (an overlay added before each shot). Keep the script with
the card's evidence so it can be rerun. Use Claude in Chrome only for a page that needs the owner's own
sign-in (for example Helmboard on claude.ai). Never launch Edge or Chrome directly from the shell.

## Models

Use Opus or cheaper for yourself and every subagent. Fable only on a card the Router says is
on Fable.

## Helmboard page work

A card that changes `board.html` works in its own worktree of the helmboard repo (branch
`board-<n>`), never in the shared folder, and publishes only at its turn in
`lane/board-queue.md`, holding `locks/board-html.lock`. Rules in that file.

## Questions go to the Router
Ask the Router, never the owner. The Router answers for him within his standing words; a Router message quoting the owner is his word.

- Queue a card on a merge lane only after its critic has passed on the final head (a card was once published before its second critic pass).

- Before any push after a rebase: `git status` must be clean (no rebase in progress). A paused rebase once got pushed, emptied the branch and GitHub closed the PR for good.

- Human test entry rule: a card goes to Human test only with numbered test steps in detail.steps [{text, pass}] and, where the change is visible, captioned screenshots uploaded to Helmboard in detail.proof. The session supplies steps text and shot paths with captions; the Router writes them before moving the card.

- Testers must check layout stability: controls must not move when their own state changes.

- Check states on cards: `results`/`checks` entries use state "met" when passed (anything else shows red "Not met"). Cards once showed all checks failing because they were stored as "open" after the tester passed. Set them to met with `by` when moving to Human test.

## Trust rules
1. **No unverified claims.** Every finding you report is tagged:
   - **[verified]** with the proof (command + output, test run, CI/deploy run link, screenshot path);
   - **[tester]** when it rests on the independent tester's report;
   - **[guess]** when you haven't checked it. A guess is never written as fact.
   Example of what this prevents: "customers can find them in search" (#191) was a guess stated as fact.
2. **"How I know" line.** Every report that moves a card (to Human test, Ship it, Done) ends with one line: what was actually run, where (stack/port, dataset, CI or deploy run id) and when. The Router copies it to the card's status.
- A session once trimmed test output to the last lines and missed a failure. Always record exit codes, never judge a test run from trimmed output.
- UI changes: grep the e2e specs for any that touch the UI you change, and update and run them before the PR.
- Card text (status, summaries) is always short bullet lines starting '- ', never a block of prose.
- Every Final action command must run when pasted as-is into the Router's PowerShell 5.1 shell: absolute paths, Push-Location to the repo checkout, one line, tested from the Router's directory before it goes on the card.
- Final action cards must explain themselves in plain words before any command: what it does and why; exactly what it changes (what's deleted or created, with counts and examples); what's kept or untouched; the risk and what can't be undone; how to undo; how to check it worked. Bullets, no jargon.
- Every Final action carries an `explain` field: 'what this code does' bullets (reads/writes what, where, what it touches, safe to re-run?).
- Every card question carries an `explain` field: 'what this is about' in plain bullets (what the card is, what's settled, what the choice really is, my pick).
- Every Final action card carries a card-level `why` field: why the owner should run it, what happens if he doesn't.
- Model per card: Opus for planning, complex or risky builds (security, forecasts, cross-cutting UI) and critics; Sonnet for clear contained builds; testers and critics always Opus or above; Haiku for read-only checks, status lookups and log reading. Fable only when the owner names it. Set it at start_session (`model`) and show it on the card.
- Human test hand-over: The board Test tab reads card `logins`, `stack`, `pr` and detail/full `steps` [{text, pass}] and `proof`. Fill those, not just `next` (19 Nov: #80/#180/#182 showed empty).
- Plan review: The board Plan tab shows card `status` (as 'The card's own words') and `next`, not detail/full. Put the plan itself in `status` (20 Nov: #1070 plan was invisible).
- **Plans are visual**. Every plan goes in `cards/<n>/detail/full` as `plan.widgets` (plan-fields.md): 4-8 widgets picked by card kind. Lead with a goal line and any decision; then at least one picture, i.e. a Today/After `picture`, a `diagram` (mermaid flow), `metrics` tiles, a `table` or a `chart`, or before/after `image` assets for UI. Then ships/risks/doneWhen. Long text goes only in `folds`. Keep `status` to 3-5 short bullets. Every planning brief says this.
  The owner, same day: "Plan should have screenshots, flows, diagrams, whatever's needed to explain it easily. and succinctly." UI plans carry a screenshot of today's screen (uploaded asset) and, where useful, a mock of the after.
- Tester and critic reports end with a scenario list, one line each: who, scenario, result (pass/fail/fixed/unclear/skipped), note, evidence path, and for findings what was fixed; plus what was not covered. Only checks of the built work (tester, code critic, reviewer, CI), not the plan critique. The Router copies it into the card's detail/full `tests` and `notCovered` at every hand-over, replacing that who's earlier rows with the latest report (card #1062; see plan-fields.md). The owner, 20 Nov 2026: 'passed' alone showed nothing about what was tested.

## Test tab is never empty
Before a card goes to Human test, its session writes detail/full `steps` [{text}], one action and its expected result each, the first step giving the stack or preview link to open. It also uploads at least one screenshot per step into `proof` [{label,url,step}]. A plain `text` blob doesn't count. The Router reads detail/full, then sets `testReady: true` in cards.json. The Stop hook refuses Human test without it.
- The Test tab explains as well as lists. detail/full also holds:
  - `testIntro`: two to four lines on what changed and why, taken from the plan;
  - `testVisuals`: diagrams or flows of what's being tested, as the plan widgets do, with uploaded images;
  - `beforeAfter` [{label, before:{url,text}, after:{url,text}}]: a before and an after screenshot or explanation for each change.
  The Router checks for all three before it sets testReady.
