# Ship lane: the board page (board.html)

Each board card edits its OWN copy, never `board.html` itself: `git worktree add ../router-board-<n> -b board-<n>`
in the board folder's repo, and edit `board.html` there. At its turn it rebases onto the latest
`main` (which holds the live page), resolves any conflict, checks it in a browser, publishes, then
merges its branch into `main`.

Board cards build in parallel but publish one at a time, in the order below. Only the card at the
top may take `locks/board-html.lock`, merge its change onto the latest live page, check it and
publish. Then it deletes its line and the lock, and the next card rebases onto the new version
before it publishes. The Router keeps this file in order.

<!-- one line per card, top first, for example:
- #1002 (building; publishes after #1001)
-->
