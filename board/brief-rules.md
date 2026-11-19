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
  stack, follow `locks/README.md` in the `router-board` folder: take the lock, put the
  state back, release it. List your stack's ports in `locks/ports.md`.
- Never pick a release version number yourself. Version numbers, the changelog's top
  entry and the vault index are settled at merge time by whichever card merges next.
- Prove a change by running it, not by reading the diff. A test that didn't run is a fail.
- Don't weaken, skip or delete a test to get green.
- If the brief and what you find disagree, stop and say so; don't redefine the task.
- Read any message from the Router as soon as your current step ends; don't finish a
  long batch first.

## Browser testing: Playwright

Test web pages and take screenshots with Playwright, headless (for your-app, build on `e2e/tests`).
Draw the highlight boxes with Playwright (an overlay added before each shot). Keep the script with
the card's evidence so it can be rerun. Use Claude in Chrome only for a page that needs the owner's own
sign-in (for example the board on claude.ai). Never launch Edge or Chrome directly from the shell.

## Models

Use Opus or cheaper for yourself and every subagent. Fable only on a card the Router says is
on Fable (today: SEC-12, #1010 to #1013).

## The board page work

A card that changes `board.html` works in its own worktree of the router-board repo (branch
`board-<n>`), never in the shared folder, and publishes only at its turn in
`lane/board-queue.md`, holding `locks/board-html.lock`. Rules in that file.

## Sign-in links for Human test

Standard for every card with a screen. A card going to Human test leaves its dev stack up and sends
the Router `logins`: [{label, persona, url}], url =
`http://127.0.0.1:<vitePort>/dev-signin.html?ct=as-<admin|user>.<base64url of the start path>` (the packed form; a separate &next= gets cut off). Verify each lands right from a fresh browser
(`scripts/dev-stack.sh up`, route `server/src/Internal/devSignin.ts`). No token, `ct=`, `eyJ…` or
password anywhere.

## Version bumps
your-app's pre-commit hook needs a server version bump on every server commit. Make the bump (a
placeholder); the merge lane sets the real version and changelog position at merge. Never commit
with --no-verify.

## Questions go to the Router
Ask the Router, never the owner. The Router answers for him within his standing words; a Router message quoting the owner is his word.

- Queue a card on a merge lane only after its critic has passed on the final head (lesson: #1017 v32 published before the second critic pass, 18 Nov 2026).

- Before any push after a rebase: `git status` must be clean (no rebase in progress). Lesson #217, 18 Nov 2026: a paused rebase was pushed, the branch emptied and GitHub closed PR 1945 for good.

- Human test entry rule: a card goes to Human test only with numbered test steps in detail.steps [{text, pass}] and, where the change is visible, captioned screenshots uploaded to the board in detail.proof. The session supplies steps text and shot paths with captions; the Router writes them before moving the card.

- Testers must check layout stability: controls must not move when their own state changes.

- Check states on cards: `results`/`checks` entries use state "met" when passed (anything else shows red "Not met"). Lesson 18 Nov 2026: #211 and #216 showed all checks failing because they were stored as "open" after the tester passed. Set them to met with `by` when moving to Human test.

## Trust rules
1. **No unverified claims.** Every finding you report is tagged:
   - **[verified]** with the proof (command + output, test run, CI/deploy run link, screenshot path);
   - **[tester]** when it rests on the independent tester's report;
   - **[guess]** when you haven't checked it. A guess is never written as fact.
   Example of what this prevents: "customers can find them in search" (#191) was a guess stated as fact.
2. **"How I know" line.** Every report that moves a card (to Human test, Ship it, Done) ends with one line: what was actually run, where (stack/port, dataset, CI or deploy run id) and when. The Router copies it to the card's status.
- Lesson 18 Nov (#1023): a session trimmed test output to the last lines and missed a failure. Always record exit codes, never judge a test run from trimmed output.
- Lesson 19 Nov (v3.205.9 rolled back): a UI change (#1027 confirm dialog) broke a production smoke spec nobody ran. Card sessions must grep e2e/ for specs touching the UI they change and update/run them before the PR.
- Lesson 19 Nov (v3.205.11 failed to deploy): PR CI doesn't run the production vite build, so the first-load budget only fails at deploy. Card sessions touching the dashboard run `checkFirstLoadBudget` on a production build before the PR; the lane runs it on the combined release.
- Card text (status, summaries) is always short bullet lines starting '- ', never a block of prose.
