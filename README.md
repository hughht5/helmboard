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


## Features

| | |
|---|---|
| **Live board**<br>Every task is a card on a private board that moves as the work does. | **One session per task**<br>Each card gets its own Claude Code session, in its own worktree and branch. |
| **Independent tester and critic**<br>A separate tester runs every check and leaves evidence before you see it. | **Plans first, your gates**<br>Each card is planned before building; you approve the plan or answer its questions on the card, test it, and say when it ships. |
| **Merge lanes**<br>Approved cards ship one at a time per repo, so parallel work never collides. | **Many repos, one board**<br>One Router runs cards across all your repos, with a lane for each. |

Why: running five or ten agent sessions by hand means losing track of which is stuck, which drifted, and which two are about to merge over each other.

---

## Requirements

Works on macOS and Windows.

- The **Claude desktop app** with Claude Code (the Router uses its session tools to start, watch and open
  sessions, and its Artifact tools for the board).
- A **claude.ai account** that can publish artifacts, for the board page.
- **Node.js** (runs the hooks), **git**, and the **`gh` CLI** signed in to GitHub (`gh auth status`).

## Quick start

1. **Start it:** the install ends by starting your Router: that session is the one you keep open.
2. **Give it work:** type what you want in plain words ("fix the login bug", "add dark mode"). It makes a card, starts a session for it, and plans.
3. **Watch the board:** the Router publishes your board as a private artifact. Cards move: Backlog, Planning, Plan review, In progress, Human test, Ship it, Deploy complete, Done.
4. **Your gates:** you approve plans (Plan review), test (Human test) and say "ship it". Answer card questions with the buttons on the card or by commenting.
5. **From any other session:** type `/tell-helmboard` to hand that conversation's task to the Router.

Tips: say "ship it" to ship; drag a card to move it; "what's next" for a summary.

## The parts

| Part | Where | What it does |
|---|---|---|
| helmboard-start skill | `skill/helmboard-start/SKILL.md` | How the Router behaves: cards, briefs, models, testing, review gates, watching for stuck or drifting sessions, shipping. |
| tell-helmboard skill | `skill/tell-helmboard/SKILL.md` | Lets any other session hand a task to the Router with a full brief. |
| Board artifact | `board/board.html` | The board: columns, card faces, full view, Plan tab, questions with answer buttons, an "Ask the Router" box. Cards live in the artifact's database; `cards.json` is the record it can be rebuilt from. |
| Session rules | `board/brief-rules.md` | Pasted into every session the Router starts. One line per thing that once went wrong. |
| Plan schema | `board/plan-fields.md` | The fields the Plan tab draws. |
| Merge lanes | `board/lane/` | One lane session per repo ships approved cards strictly in queue order: rebase, settle the version and changelog, test, merge, watch the deploy. `board-queue.md` does the same for changes to the board page itself. |
| Locks | `board/locks/` | File locks for shared test state: test personas, organisation settings, dev-stack ports, the board page. |
| Scheduled check | `board/check-prompt.md` | The prompt the Router runs every 15 minutes to audit cards and catch stuck or drifting sessions. |
| Hooks | `hooks/` | Blocks that words in a brief can't guarantee (below). |

### Hooks

| Hook | Event | Does |
|---|---|---|
| `router-merge-guard.js` | PreToolUse (Bash, PowerShell) | Among the Router's sessions (listed in `lane/guard.json`), only a lane may merge a PR or push `main`. Your own sessions are never blocked. |
| `router-cards-check.js` | Stop | The Router can't end a turn while `cards.json` disagrees with a lane queue. |
| `router-postcompact.js` | SessionStart (compact, resume) | After a compaction, feeds the Router its handover, standing instructions, lane queues and skill. |
| `block-shell-browser.js` | PreToolUse (Bash, PowerShell) | Refuses launching Edge or Chrome from the shell (use Playwright or Claude in Chrome). |

Paths: the hooks read `HELMBOARD_DIR` (or its older alias `ROUTER_DIR`) (default `~/helmboard`) and `ROUTER_SKILL` (default
`~/.claude/skills/helmboard-start/SKILL.md`), in `hooks/config.js`. Keep `config.js` beside the hooks.
The Router-only hooks act only in the session named in `router.json`, so they are safe to
install globally.

Example `settings.json` snippet (the whole of `settings.example.json`, one event shown):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|PowerShell",
        "hooks": [
          { "type": "command", "command": "node \"$HOME/.claude/hooks/router/block-shell-browser.js\"", "timeout": 10 },
          { "type": "command", "command": "node \"$HOME/.claude/hooks/router/router-merge-guard.js\"", "timeout": 10 }
        ]
      }
    ]
  }
}
```

On macOS `$HOME` works as written. On Windows, if `$HOME` doesn't expand in your hook shell, use the full path
(`C:/Users/<you>/.claude/hooks/router/...`). The hooks find your home folder through Node
(`USERPROFILE` on Windows), not `$HOME`, so to keep the board anywhere other than
`~/helmboard` set `HELMBOARD_DIR` (and `ROUTER_SKILL` for the skill) in your environment.

## How it works

1. You tell the Router a task. It writes a card with done-when checks and starts a session for
   it, in its own worktree and branch, with `brief-rules.md` in the brief and the cheapest
   model that fits.
2. By default the session plans if needed (stopping in **Plan review** for big or risky
   changes), builds, and runs its tests. A separate tester then runs every check and leaves
   evidence: a numbered, captioned screenshot story for anything with a screen.
3. The card stops in **Human test** with steps to try. You test, then say "ship it" (or click
   on the board). Say "all the way" up front to skip the stop.
4. The Router queues the card in that repo's lane. The lane ships cards one at a time, so
   parallel work never collides at merge, and stops the line if a deploy goes red.
5. Every 15 minutes the Router checks each running session for being stuck or drifting off its
   card, and keeps every card in the right column. Each mistake becomes a permanent rule: a
   hook, a test, or a line in `brief-rules.md` and `lessons.md`.

## One repo or many

- One Router can manage cards across several repos. Each card names its repo.
- Each repo gets its own merge lane, started the first time that repo has a card to ship.
  Lanes ship one card at a time, so different repos never wait on each other.
- Cards for the same repo queue in that repo's lane and are told to rebase after each merge.
- One Router runs per machine (per user account). To keep projects fully apart, run a second Router under another account or machine.
- Pick whichever fits. Put rules that only apply to one project in `project-rules.md`, so the
  general `brief-rules.md` stays the same everywhere.

## FAQ

**Does it need the desktop app?** Yes. The Router starts, watches and opens other sessions with
the desktop app's session tools; the plain CLI doesn't have them.

**Is the board public?** No. Artifacts are private to you unless you share them. Don't share
it: a comment on it can approve a ship for the card it names.

**Can it merge or deploy without me?** Not on a default task. It stops in Human test, and the
merge-guard hook blocks merges and pushes to `main` from every session it started except the
lane. Only "all the way", said by you, lets a card go through.

**Where does my data live?** In your board folder (`~/helmboard`, a git repo you own) and in
the artifact's database. `cards.json` can rebuild the board if the page is ever lost.

**Can I use my own columns or repos?** Repos, yes: lanes are made per repo on first ship.
Columns are the ones in the skill's table; changing them means editing `board.html` and the skill.

**What does it cost?** Each card is its own session. The Router picks cheap models for docs,
reviews, testers and lanes, and your own model only for code and plans.

## Licence

MIT. See `LICENSE`.
