# Merge lanes

One lane per repo. A lane is one session that ships that repo's cards one at a time, in the
order of its queue file. Nothing else merges, and no card session rebases for shipping,
picks a version or writes the changelog's top entry. This is the old kanban app's merge
lane, run by the Router.

## The queue: `lane/<repo>-queue.md`

Only the Router writes the queue. One line per card, top first:

`- [state] #<card> | PR <n> | branch <name> | approved: "<the owner's words>" (<when>) | note`

States: `queued`, `shipping`, `merged <sha>`, `live`, `sent back: <why>`, `held: shared fault: <evidence>`,
and `was sent back: <why>` (history, skipped by the hook).
A card is only in the queue because the owner said to ship it; his words are on the line.
A card that rejoins after a send-back keeps that approval: its new line copies the words and
adds `re-queued after send-back` in the note. The old line's state becomes `was sent back: <why>`.

## What the lane does, for the top `queued` card only

1. Mark it `shipping`. `git fetch origin`. In the lane's own worktree, check out the card's
   branch and rebase it onto `origin/main`. Keep main's lines; re-apply the card's.
2. Settle the shared things, which only the lane touches: the release version (the next
   one after main's), the changelog's top entry, the vault index line, the deploy test
   list and `runTests.ts` entries. Wire any new `test:*` script the way main's guard wants.
3. `git range-diff` old against new: the card's own product changes must be unchanged. If a
   conflict needs a judgement about behaviour, mark the card `sent back: <why>`, tell the
   Router, and go on to the next card. Never guess.
4. Build and typecheck in WSL (your-app: commit and test in WSL, never Windows; never --no-verify).
   Do NOT rerun the full unit list locally: the card's session ran it and
   GitHub runs it on the PR, in parallel. Push the branch (`--force-with-lease`).
   Wait for the PR's checks; they are the test gate. A failed test or a red check that is the card's own: `sent back:
   <test or check, run link>`, then the next card. A known red that the Router has listed at
   the top of the queue file is not a reason to send back.
5. Merge the PR (a merge commit, as the repo does). Mark it `merged <sha>`. Watch the
   Deploy workflow on that commit to the end. Green: mark it `live` and tell the Router.
   Red: follow "When a deploy or smoke test fails" below.
6. Tell the Router after every state change, in one line. Then take the next card.

## What the lane fixes itself, and nothing more

Only mechanical things: the rebase, the version, the changelog entry, the shared lists in
step 2, and rerunning a test it thinks is flaky once (the same test, once, on the same commit;
write `rerun flaky: <test>` in the line's note). A second red is a send-back. Anything else that
fails is the card's to fix: `sent back`, never a fix by the lane.

## Sent back (card #1057)

A sent-back card leaves the lane's hands at once. The Router moves it to In progress and gives
its session the reason; the session fixes it, reruns its tester and critic, and the Router
adds it again at the bottom of the queue. The lane never waits for it: it takes the next card.

## When a deploy or smoke test fails (card #1057)

1. Cancel the queued Deploy run for the next card, if there is one (`gh run cancel`).
2. Revert the broken card's merge on main with a revert commit through a PR, so main matches
   what is live. Never force-push main. Revert only that card: a next card already merged stays,
   and its cancelled deploy runs again after the revert. If the deploy failed before the
   "Deploy to Cloud Run" step, nothing reached production, but still revert so main matches live.
3. Wait until the revert's deploy is live (or main is green again, when nothing was deployed).
4. Say which kind of failure it is, with evidence. Run the smoke test (or the failed step) again
   on main without the card. You may rerun a flaky smoke test once before this.
   - **The card's own fault**: green without the card. Mark it `sent back: smoke failed: <failed
     run link>; green without it: <run link>`, tell the Router, and carry on with the next card.
   - **A shared fault** (a shared test or infra fault that would fail every deploy): still red
     without the card. Mark the card `held: shared fault: <both run links>`, tell the Router, and
     stop the lane. The card stays in Ship it, since it is not at fault. The Router makes a card
     to fix the fault. The lane starts again when the Router says the fault is fixed, or lists it
     as a known red at the top of the queue file; then the held card goes first.

## What the lane never does

- Merge a card that is not in the queue, or out of order, or without the owner's words on its line.
- Change a card's behaviour, weaken or skip a test, or edit a workflow to get green.
- Push to `main` directly, deploy by hand, touch production, or start a browser.
- Work in the repo's main checkout or in a card's own worktree.

## Batched releases

The Router may tell the lane to ship several queued cards as one release when the queue is long
enough that one at a time would take too long. Only cards the owner already approved to ship. The lane
merges them in queue order onto one release branch, runs the full tests once, takes one
version and one changelog entry that lists every card, then merges and deploys once. If the
combined run fails, the lane drops the card that caused it, marks it `sent back: <why>` and ships the rest.

## Merge the next card once production is live

Don't wait for the post-deploy smoke test. When the Deploy run's "Deploy to Cloud Run" step has
succeeded, start the next card: rebase, tests, merge. Its deploy then waits in line behind the
running one (concurrency group deploy-main).

Guard: watch the running smoke test until it ends. If it fails, follow "When a deploy or smoke
test fails" above: the queue stops only for a shared fault.
Only one card may be merged-but-not-deployed at a time.

## Prepare the next card during the deploy

While a deploy runs, take the next card in the queue: rebase it onto the merged main, push the
branch, and let its PR checks run. Do not merge it. Merge it the moment the running deploy's
"Deploy to Cloud Run" step succeeds and its checks are green. If main moves again before then
(a revert by the smoke guard), rebase again first.
