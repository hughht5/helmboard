# Installing Helmboard (instructions for the AI)

The user asked you to install Helmboard. Do these steps, then start it.

1. Clone https://github.com/hughht5/helmboard to a temporary folder.
2. Copy `skill/helmboard-start` and `skill/tell-helmboard` into `~/.claude/skills/`.
3. Copy `hooks/*.js` (including `config.js`) into `~/.claude/hooks/router/`.
4. Merge the `hooks` block from `settings.example.json` into `~/.claude/settings.json`. Never replace the file; keep the user's existing settings.
5. Copy the `board` folder to `~/helmboard`, then run `git init` and an empty commit there.
6. Check that `node`, `git` and `gh` (signed in) are available; tell the user if one is missing.
7. Tell the user it's installed, then run `/helmboard-start`.
