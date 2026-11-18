# Merge lanes

One lane per repo. A lane is one session that ships that repo's cards one at a time, in the
order of its queue file. Nothing else merges, and no card session rebases for shipping,
picks a version or writes the changelog's top entry.

## The queue: `lane/<repo>-queue.md`

Only the Router writes the queue. One line per card, top first:

`- [state] #<card> | PR <n> | branch <name> | approved: "<the owner's words>" (<when>) | note`

States: `queued`, `shipping`, `merged <sha>`, `live`, `held: <why>`.
A card is only in the queue because the owner said to ship it; their words are on the line.

## What the lane does, for the top `queued` card only

1. Mark it `shipping`. `git fetch origin`. In the lane's own worktree, check out the card's
   branch and rebase it onto `origin/main`. Keep main's lines; re-apply the card's.
2. Settle the shared things, which only the lane touches: the release version (the next
   one after main's), the changelog's top entry, and any shared index or test lists the
   repo keeps.
3. `git range-diff` old against new: the card's own product changes must be unchanged. If a
   conflict needs a judgement about behaviour, mark the card `held`, tell the Router, and
   go on to the next card. Never guess.
4. Run the card's tests and the full unit list. Push the branch (`--force-with-lease`).
   Wait for the PR's checks. A red check that is the card's own: `held`. A known red that
   the Router has listed at the top of the queue file is not a reason to hold.
5. Merge the PR (the way the repo merges). Mark it `merged <sha>`. Watch the deploy
   workflow on that commit to the end. Green: mark it `live` and tell the Router.
   Red: tell the Router at once and stop the lane; do not ship the next card onto a
   broken main.
6. Tell the Router after every state change, in one line. Then take the next card.

## What the lane never does

- Merge a card that is not in the queue, or out of order, or without the owner's words on its line.
- Change a card's behaviour, weaken or skip a test, or edit a workflow to get green.
- Push to `main` directly, deploy by hand, touch production, or start a browser.
- Work in the repo's main checkout or in a card's own worktree.

## Batched releases

The Router may tell the lane to ship several queued cards as one release when the queue is long
enough that one at a time would take too long. Only cards the owner already approved to ship. The
lane merges them in queue order onto one release branch, runs the full tests once, takes one
version and one changelog entry that lists every card, then merges and deploys once. If the
combined run fails, the lane drops the card that caused it, puts it back in the queue and ships the rest.

## Merge the next card once production is live

Don't wait for the post-deploy smoke test. When the deploy step itself has succeeded, start the
next card: rebase, tests, merge. Its deploy then waits in line behind the running one (use a CI
concurrency group).

Guard: watch the running smoke test until it ends. If it fails:
1. Cancel the queued deploy run for the next card (`gh run cancel`).
2. Revert that card's merge on main with a revert commit through a PR, so main matches what is
   live. Never force-push main.
3. Put the card back at the top of the queue as [held: smoke failed on #<n>].
4. Hold the whole queue and tell the Router at once.
Only one card may be merged-but-not-deployed at a time.
