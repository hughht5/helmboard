# Installing Helmboard (instructions for the AI)

The user asked you to install Helmboard. Do these steps, then start it.

1. Check that `git`, `node` and `gh` are installed. If any is missing, tell the user what it is for and offer to install it; install only after they say yes:
   - macOS: `xcode-select --install` (git), then `brew install node gh` (offer to install Homebrew first if it is missing).
   - Windows: `winget install Git.Git OpenJS.NodeJS.LTS GitHub.cli`.
   - Then ask the user to run `gh auth login` themselves (it signs in to their GitHub account).
   If they don't want to sign in to GitHub, download the repo as a zip from https://github.com/hughht5/helmboard/archive/refs/heads/main.zip instead of cloning.
2. Clone https://github.com/hughht5/helmboard to a temporary folder.
3. Copy `skill/helmboard-start` and `skill/tell-helmboard` into `~/.claude/skills/`.
4. Copy `hooks/*.js` (including `config.js`) into `~/.claude/hooks/router/`.
5. Merge the `hooks` block from `settings.example.json` into `~/.claude/settings.json`. Never replace the file; keep the user's existing settings.
6. Copy the `board` folder to `~/helmboard`, then run `git init` and an empty commit there.
7. Tell the user it's installed, then run `/helmboard-start`.
