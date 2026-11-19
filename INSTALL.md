# Installing Helmboard (instructions for the AI)

The user asked you to install Helmboard. It is a Claude Code plugin. Do these steps, then start it.

1. Check that `git`, `node` and `gh` are installed. If any is missing, tell the user what it is for and offer to install it; install only after they say yes:
   - macOS: `xcode-select --install` (git), then `brew install node gh` (offer to install Homebrew first if it is missing).
   - Windows: `winget install Git.Git OpenJS.NodeJS.LTS GitHub.cli`.
   - Then ask the user to run `gh auth login` themselves (it signs in to their GitHub account).
2. Add the marketplace and install the plugin (the skills and hooks come with it; nothing to copy):
   ```
   /plugin marketplace add hughht5/helmboard
   /plugin install helmboard@helmboard
   ```
   If you can't run slash commands yourself, ask the user to paste those two lines, then restart Claude Code if it asks.
3. Run `/helmboard-start`. On its first run it creates the board folder `~/helmboard` from the plugin's `board/` templates.
