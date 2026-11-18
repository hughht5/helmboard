// PreToolUse hook (Bash, PowerShell): refuse commands that start Edge or Chrome from the shell.
// Added 18 Nov 2026 after a session ran headless Edge for screenshots and the owner got error pop-ups.
// To see a page rendered, sessions use the Claude in Chrome tools instead.
// Undo: remove the PreToolUse entry for this file from ~/.claude/settings.json.
let raw = "";
process.stdin.on("data", d => (raw += d));
process.stdin.on("end", () => {
  let cmd = "";
  try { cmd = String((JSON.parse(raw).tool_input || {}).command || ""); } catch (e) { process.exit(0); }
  const exe = "(?:msedge|chrome|chromium|google-chrome)(?:\\.exe)?";
  const launchFlags = /--(?:headless|screenshot|user-data-dir|remote-debugging-port|app=|new-window|window-size|virtual-time-budget|dump-dom|print-to-pdf)/i;
  const rules = [
    // the browser named together with a launch flag, anywhere in the command
    c => new RegExp("\\b" + exe + "\\b", "i").test(c) && launchFlags.test(c),
    // Start-Process / start / cmd /c start aimed at a browser
    c => new RegExp("\\b(?:Start-Process|saps|start)\\b[^|;&\\n]*\\b" + exe + "\\b", "i").test(c),
    // the browser run directly as the command (optionally by full path, quoted, or with & in PowerShell)
    c => new RegExp("(?:^|[;&|\\n(]\\s*)(?:&\\s*)?[\"']?(?:[^\\s\"']*[\\\\/])?" + exe + "[\"']?(?=\\s|$)", "im").test(c),
  ];
  if (rules.some(r => r(cmd))) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Blocked: starting Edge or Chrome from the shell is not allowed on this machine. To see a page rendered, use the Claude in Chrome tools in a tab of your own. Do not try another way of launching a browser.",
      },
    }));
  }
  process.exit(0);
});
