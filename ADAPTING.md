# Adapting Helmboard to GitLab, or to no remote

For an AI. The user asked you to "adapt Helmboard to GitLab" or "to work without a remote". Helmboard was written for GitHub. This lists every GitHub assumption I found, by job, with a replacement for each. It is untested. Where something is unclear, it says so.

Work on the user's installed copy (skills in `~/.claude/skills`, hooks in `~/.claude/hooks`, the board folder `~/helmboard`), not this repo. Tell the user what you changed and keep the old text so they can undo it.

Two modes:
- **GitLab**: swap `gh` for `glab`, PR for MR, GitHub Actions for GitLab CI.
- **No remote**: no PRs and no CI. Each card is a branch in its own worktree. Tests run locally. The merge lane fast-forwards local `main` and never pushes.

## (a) Open a change for review

- **`skill/helmboard-start/SKILL.md`, "Shipping" (bullet "Work reaches `main` only through a PR with passing CI").**
  - Today: every change reaches `main` through a PR.
  - GitLab: "merge request (MR)". Sessions open it with `glab mr create`.
  - Local-only: no review object. The card's branch, pushed nowhere, is the record. Say "Work reaches `main` only through the merge lane, after the tester has passed and tests are green."
- **Same file, parallel-cards bullet** (`gh pr view --json files`).
  - Today: lists the files a PR touches, to spot overlaps between cards.
  - GitLab: `glab mr view <n> --output json` (whether it lists files is unclear), or `git diff --name-only origin/main...<branch>`.
  - Local-only: `git diff --name-only main...<branch>`.
- **`board/lane/README.md`, step 4 ("Push the branch (`--force-with-lease`)").**
  - Today: the lane pushes the rebased card branch so the PR updates.
  - GitLab: same push. The MR updates by itself.
  - Local-only: delete the push. The rebased branch stays local.
- **`board/brief-rules.md`, two rules.**
  - "Before any push after a rebase: `git status` must be clean". The GitHub detail ("GitHub closed the PR for good") does not apply to GitLab or local. Keep the rule on GitLab; drop it for local-only.
  - "update and run [e2e specs] before the PR". Read "before the MR" or "before queueing".
- **`board/board.html`, `prOf()` and the card's "PR" link** (the `/pull/` URL building and the `"PR #" + n` link).
  - Today: the card's `pr` field becomes a link to `https://github.com/<repo>/pull/<n>`.
  - GitLab: the URL is `https://gitlab.com/<repo>/-/merge_requests/<n>` (or the user's own host). Change the URL build, the `/pull/` regexes and the `github.com` text stripping. The label can stay "PR" or become "MR".
  - Local-only: store the branch name in `pr` as plain text. `prOf()` already shows a non-URL value as text. No code change.
- **Card field `pr`** (SKILL.md "Update the card at every change ... PR"; the `cards/<n>/detail/full` fields). Same meaning on every setup: whatever points to the card's change.

## (b) Read its tests and CI

- **`board/lane/README.md`, step 4 ("Wait for the PR's checks").**
  - Today: the lane waits for the PR's CI checks. A red check that is the card's own means `held`.
  - GitLab: `glab ci status` (add `--live` to wait) or `glab mr view <n>`.
  - Local-only: run the card's tests and the full test list yourself, and record the exit code. Red means `held`.
- **Same file, step 5, and the sections "Merge the next card once production is live" and "Prepare the next card during the deploy".**
  - Today: watch the Deploy workflow to the end, and its "Deploy to Cloud Run" step. Cancel a queued run with `gh run cancel`. The `deploy-main` concurrency group is a GitHub Actions setting.
  - GitLab: watch the pipeline (`glab ci status`, `glab ci view`). Cancel with `glab ci cancel`. Use `resource_group` in `.gitlab-ci.yml` for the one-at-a-time rule.
  - Local-only: there is no deploy run. Skip these sections, or replace "deploy" with the user's own local deploy script, if any. What the user wants here is unclear: ask.
- **`SKILL.md`: the "All the way" bullet, and "A session's report is not proof. Check the diff, PR and CI yourself".**
  - GitLab: read CI with `glab ci status`.
  - Local-only: run the tests again yourself and read the diff with `git diff main...<branch>`.
- **`board/check-prompt.md`, part A** ("each Router card against what its session, PR, CI and deploy actually show"). Same swap. Local-only: drop PR, CI and deploy; check the branch and the test result.
- **`board/brief-rules.md`, "Trust rules".** Proof can be a "CI/deploy run link" and the "How I know" line names a "CI or deploy run id". GitLab: a pipeline link or id. Local-only: the command and its exit code.
- **Not a GitHub assumption:** the board page's "checks" (`checks`/`results` on a card, `checksBlock` in `board.html`) are the tester's done-when checks. Leave them alone.

## (c) Merge to main and deploy

- **`board/lane/README.md`, step 1** (`git fetch origin`, rebase onto `origin/main`).
  - GitLab: unchanged, if the remote is `origin` and the branch `main`.
  - Local-only: skip the fetch. Rebase onto local `main`.
- **Same file, step 5** (merge the PR, "a merge commit, as the repo does").
  - GitLab: `glab mr merge <n>` (a merge commit is the usual default; check the project's merge method).
  - Local-only: in the lane's own worktree, rebase the card branch onto `main` and run the tests. Then in the main checkout, `git merge --ff-only <branch>`. No push. Mark `merged <sha>` as before.
- **Same file, the smoke-guard revert** ("Revert that card's merge on main with a revert commit through a PR. Never force-push main").
  - GitLab: `git revert` on a branch, then `glab mr create` and `glab mr merge`.
  - Local-only: `git revert -m 1 <sha>` straight on local `main` (nothing to force-push).
- **`board/lane/README.md`, "What the lane never does"** ("Push to `main` directly"). Local-only: change to "Never rewrite `main`'s history". The lane now commits to `main` locally.
- **`hooks/router-merge-guard.js`** (PreToolUse; reads `board/lane/guard.json`).
  - Today: refuses `gh pr merge`, `gh api .../pulls/<n>/merge`, `git push ... main|master` and `git push --all` for the Router and its sessions, except lanes.
  - GitLab: add rules for `glab mr merge` and `glab api .../merge_requests/<n>/merge`. Keep the `git push` rules.
  - Local-only: the `git push` rules no longer matter. The risk is now a local merge, so consider rules for `git merge` while on `main`, and `git branch -f main`. The hook matches text only (the file says so), so test any rule. This is my suggestion, not something the hook does today.
  - Reword the deny message ("merge a pull request or push to main") to match.
- **`SKILL.md`, "Shipping" ("The block", and the "Work reaches `main`" bullet) and `board/lane/board-queue.md`** (the board-page lane: "rebases onto the latest `main` ... merges its branch into `main`"). Same swaps. `board-queue.md` mentions no remote or PR; whether the board folder's own repo pushes anywhere is unclear: check its remote.
- **Deploy.** "Deploy by the repo's own script or CI job" (`SKILL.md`), and the Cloud Run, `runTests.ts`, vault index and changelog lines in `lane/README.md` step 2, are examples from one repo. They are not GitHub-specific. Keep or remove to suit the user's repo.
- **Queue line format** (`lane/README.md`: `- [state] #<card> | PR <n> | branch <name> | ...`). GitLab: `MR <n>`. Local-only: drop it. `hooks/router-cards-check.js` appears to read only the state and card number, not the PR. Re-check after editing.

## (d) Link issues

- **`board/board.html`, issue chip** (the `issueOf()` link, title "GitHub issue #n").
  - Today: a card's `issue` field becomes a link to the GitHub issue.
  - GitLab: build `https://gitlab.com/<repo>/-/issues/<n>` and change the title text. I did not read `issueOf()` closely: open it and check its URL logic.
  - Local-only: store text, or drop the field. The chip only shows for an `https://` link, so plain text just does not show.
- **`SKILL.md`** ("the plan on the issue" in the brief; `issue` in the detail fields). GitLab: a GitLab issue, same idea. Local-only: put the plan in the card's detail row (see `board/plan-fields.md`) or a file in the board folder.
- **"Closes #n".** Appears only as sample text in `board/plan-fields.md`. No hook or skill acts on it. GitLab also accepts it in an MR description. Local-only: drop it.

## (e) Anything else

- **`INSTALL.md`, steps 1 and 2.** It installs `GitHub.cli`, asks the user to run `gh auth login`, and clones from GitHub (or downloads the zip).
  - GitLab: install `glab` (check the winget id) and ask the user to run `glab auth login` themselves.
  - Local-only: skip the CLI. Helmboard itself still comes from GitHub: use the zip.
  - Never enter a token or sign in for the user.
- **`README.md`, Requirements** ("GitHub's `gh` signed in"). Change to match.
- **Branch name.** Several places say `main`. If the user's default branch differs, change the lane, the hook and the prompts. (The hook already also blocks `master` pushes.)
- **Other prompts** (`lessons.md`, `standing.md`, `handover.md`): I found no `gh`, GitHub or PR text there. Search again after editing.
- **Search to finish:** `grep -rniE 'gh |github|pull|\bPR\b|origin|CI\b|push|issue|Closes' ~/.claude/skills ~/.claude/hooks ~/helmboard`.

## After adapting

Test by taking one dummy card all the way:
- [ ] Make a throwaway card ("add one line to a scratch file") on a scratch repo.
- [ ] It builds in its own worktree and branch.
- [ ] The card shows its change (MR link, or branch name for local-only) and the board page does not break.
- [ ] Tests and CI (or local tests) run and the result reaches the card.
- [ ] Ship it: the lane merges (MR merged, or a fast-forward on local `main`) and marks it `live` or `merged`.
- [ ] The merge guard still refuses a Router session merging by hand.
- [ ] The card reaches Deploy complete. Tell the user what passed and what you could not check.
