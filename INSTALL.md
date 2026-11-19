# Installing Helmboard (instructions for the AI)

The user asked you to install (or update) Helmboard. Do these steps, then start it. Work on macOS or Windows; use the user's home folder for `~`.

1. Check that `git`, `node` and `gh` are installed. If any is missing, tell the user what it's for and offer to install it; install only after they say yes:
   - macOS: `xcode-select --install` (git), then `brew install node gh` (offer to install Homebrew first if it's missing).
   - Windows: `winget install Git.Git OpenJS.NodeJS.LTS GitHub.cli`.
   - Then ask the user to run `gh auth login` themselves (it signs in to their GitHub account).
2. Clone https://github.com/hughht5/helmboard to a temporary folder (if they don't use GitHub, download https://github.com/hughht5/helmboard/archive/refs/heads/main.zip instead).
3. Copy `skills/helmboard-start` and `skills/tell-helmboard` into `~/.claude/skills/` (replace older copies).
4. Copy every file in `hooks/` except `hooks.json` into `~/.claude/hooks/helmboard/`.
5. Register the hooks in `~/.claude/settings.json`: take the `hooks` block from `hooks/hooks.json`, replace `${CLAUDE_PLUGIN_ROOT}/hooks/` with the full path of `~/.claude/hooks/helmboard/` (forward slashes), and merge it in. Never replace the file or remove the user's own settings; don't add an entry that's already there.
6. If `~/helmboard` doesn't exist, copy the `board` folder there, then run `git init` and an empty first commit in it. If it exists, leave the user's cards alone; only replace `board.html`.
7. Delete the temporary folder. Tell the user in two lines what you installed. New skills load when a session starts, so tell them: "Open a new Claude Code session and send /helmboard-start."
