<h1 align="center">Helmboard</h1>

<p align="center"><strong>A visual board and GUI for Claude Code. Take the helm of every session.</strong></p>

<p align="center">
  <a href="LICENSE"><img alt="Licence: MIT" src="https://img.shields.io/badge/licence-MIT-blue.svg"></a>
  <img alt="Built for Claude Code" src="https://img.shields.io/badge/built%20for-Claude%20Code-d97757.svg">
  <img alt="Platforms: macOS | Windows" src="https://img.shields.io/badge/platforms-macOS%20%7C%20Windows-lightgrey.svg">
</p>

<!-- TODO: add docs/screenshot.png (a board screenshot) -->
<!-- <p align="center"><img src="docs/screenshot.png" alt="The Helmboard board" width="800"></p> -->

Helmboard is a Claude Code dashboard for pro vibe coders who want less terminal: one board to see, steer and ship every session.

**Talk to one Claude Code session. It runs all the others.**

- Tell it what you want, in plain words.
- It makes a card for each task and starts a separate session to build it.
- An independent tester checks the work, and a critic reviews it.
- You watch it all on a live board.

**By default, you stay in control.** Big or risky tasks get a plan first. You approve it, or answer its questions with one click on the card. You test the result, then say "ship it".

**Or let it run.** Say "take it all the way" and it plans, builds, tests and ships on its own, skipping the human checks. It still won't ship anything that fails its tests.

## Install

Paste this into Claude Code (macOS or Windows):

```
Install https://github.com/hughht5/helmboard
```

That's it. Claude reads [INSTALL.md](INSTALL.md) and does the rest.

## Features

| | |
|---|---|
| **Live board**<br>Every task is a card on a private board that moves as the work does. | **One session per task**<br>Each card gets its own Claude Code session, in its own worktree and branch. |
| **Independent tester and critic**<br>A separate tester runs every check and leaves evidence before you see it. | **Plans first, your gates**<br>Each card is planned before building; you approve the plan or answer its questions on the card, test it, and say when it ships. |
| **Merge lanes**<br>Approved cards ship one at a time per repo, so parallel work never collides. | **Many repos, one board**<br>One Router runs cards across all your repos, with a lane for each. |

Why: running five or ten agent sessions by hand means losing track of which is stuck, which drifted, and which two are about to merge over each other.

---

## What you need

Works on macOS and Windows. You need:

- The Claude desktop app, with Claude Code.
- A claude.ai account that can publish artifacts (the board page).
- Node.js and git installed, and GitHub's `gh` signed in. If you're not signed in, run `gh auth login` yourself.

Missing something? Ask Claude: "Check I have everything Helmboard needs and fix what's missing."

## Quick start

1. Paste the install text above. It ends by starting your Router. Keep that session open.
2. Tell it what you want: "fix the login bug", "add dark mode". It makes a card and gets on with it.
3. Watch the board. You approve plans, test the result, and say "ship it".
4. In any other session, say "tell the router" to hand that task over.

Handy phrases: "what's next?", "ship it", "take it all the way".

## How it works

1. You tell the Router a task. It makes a card and starts a session for it.
2. Big or risky tasks get a plan first, and wait for you to approve it.
3. A separate tester checks the work and leaves evidence. A critic reviews it.
4. The card waits for you to test it. Say "ship it" and it goes out. Say "take it all the way" up front to skip the waiting.
5. Every 15 minutes the Router checks for stuck or drifting sessions. Each mistake becomes a permanent rule, so it doesn't repeat.

## Make it yours

Everything is changed by asking. Tell the Router what you want and it edits the board, its rules and its checks itself.

- Columns: "Add a Design review column before Human test."
- Repos: "Work in my other repo too."
- Rules for one project: "Never touch the billing folder in this repo."
- Pace: "Stop asking me to approve plans for small changes."
- Models and cost: "Use cheaper models wherever you can."

## FAQ

**Does it need the desktop app?** Yes.

**Is the board public?** No, it's private to you. Don't share it: a comment on it can approve a ship.

**Not on GitHub?** Ask Claude: "Adapt Helmboard to GitLab" (or "to work without a remote"). It follows [ADAPTING.md](ADAPTING.md). Untested so far.

**Can it merge or deploy without me?** Not unless you say "take it all the way". Otherwise it stops and waits for your say-so.

**Where does my data live?** In a folder on your machine that you own. Ask: "Where is my board stored, and can you back it up?"

**Can I use my own columns or repos?** Yes. Ask the Router: "add a Design review column", "work in my other repo too". It changes the board and its own rules.

**Something looks stuck or wrong.** Ask: "Router, what's stuck and why?" or "The board looks out of date, fix it."

**Can I run more than one Router, or keep projects apart?** Yes. Ask: "Set up a separate Router for my side project."

**What does it cost?** Each card is its own session. The Router uses cheap models for routine work and your own model for code and plans. Ask: "What have my cards cost so far?"

**How do I update or remove it?** Ask: "Update Helmboard to the latest version" or "Remove Helmboard cleanly."

<details>
<summary>How it works under the hood</summary>

- Skills: `helmboard-start` (the Router) and `tell-helmboard` (hand-off from other sessions), in `skill/`.
- Board: `board/board.html`, published as a private artifact. Cards are kept in your board folder (`~/helmboard`), which is a git repo.
- Rules: `board/brief-rules.md` goes into every session the Router starts.
- Merge lanes: one session per repo ships approved cards one at a time.
- Hooks (`hooks/`): stop non-lane sessions merging to `main`, keep cards and lane queues consistent, restore the Router's context after a compaction, and refuse launching a browser from the shell. They only act in the Router's own session.

</details>

## Licence

MIT. See `LICENSE`.
