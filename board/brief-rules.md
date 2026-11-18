# Rules every session brief carries

The Router pastes this block into the `background` of every session it starts. Each line
is here because something went wrong once. Add a line the same day a new thing goes wrong.

- Never launch Edge or Chrome directly from the shell. To see a page rendered, use
  Playwright's own headless browser (see "Browser testing"); Claude in Chrome only for a
  page that needs the owner's sign-in.
- Never take the owner's window focus, and never open anything on their screen.
- Never merge, push `main`, deploy or write to production unless this brief says the
  card goes all the way.
- Work only in your own worktree. Never touch the repo's main checkout.
- Screenshots tell the story of the test, start to finish. Begin where the user begins:
  the page they start from, with the button or menu item they press to get in. Then one
  screenshot per step, in order, to the final result. Expect 8 to 15 for a feature, not 3
  or 4. On each, put a highlight box around the thing to look at (the button, the message,
  the number): draw a bright outline on that element before capturing (a 3px outline that
  changes no product code), or draw the box on the image afterwards. Caption each: what
  was done, and what to notice. Number the files in story order.
- Sessions share one test database, the same test logins and one browser. Before changing
  a test person's role or permissions, an organisation's settings, or starting a dev
  stack, follow `locks/README.md` in the board folder: take the lock, put the state back,
  release it. List your stack's ports in `locks/ports.md`.
- Never pick a release version number yourself. Version numbers and the changelog's top
  entry are settled at merge time by the merge lane.
- Prove a change by running it, not by reading the diff. A test that didn't run is a fail.
- Don't weaken, skip or delete a test to get green.
- If the brief and what you find disagree, stop and say so; don't redefine the task.
- Read any message from the Router as soon as your current step ends; don't finish a
  long batch first.

## Browser testing: Playwright

Test web pages and take screenshots with Playwright, headless, building on the repo's own
end-to-end tests where it has them. Draw the highlight boxes with Playwright (an overlay added
before each shot). Keep the script with the card's evidence so it can be rerun. Use Claude in
Chrome only for a page that needs the owner's own sign-in (for example the board on claude.ai).

## Models

Use the model the Router names in the brief for yourself and every subagent; never a dearer one.

## Board page work

A card that changes `board.html` works in its own worktree of the board folder's repo (branch
`board-<n>`), never in the shared folder, and publishes only at its turn in
`lane/board-queue.md`, holding `locks/board-html.lock`. Rules in that file.

## Sign-in links for Human test

Every card with a screen goes to Human test with its dev stack left up and sends the Router
`logins`: [{label, persona, url}], where url is the app's own local dev sign-in route (if the
app has one) with the start page to land on. No token, session cookie or password anywhere.
