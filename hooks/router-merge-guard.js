// PreToolUse hook (Bash, PowerShell): among the Router's own sessions, only a merge lane may
// merge a pull request or push to main.
//
// It applies to the sessions listed in <ROUTER_DIR>/lane/guard.json:
//   { "router": "<id>", "family": ["<id>", ...], "lanes": ["<id>", ...] }
// A session listed under "lanes" is allowed. Any other session on the machine (one the owner
// opens directly) is never blocked. If the guard file is missing, nothing is blocked.
// The session id is read from CLAUDE_CODE_HOST_SESSION_ID.
const fs = require("fs");
const cfg = require("./config");
let raw = "";
process.stdin.on("data", d => (raw += d));
process.stdin.on("end", () => {
  let cmd = "", guard;
  try { cmd = String((JSON.parse(raw).tool_input || {}).command || ""); } catch (e) { process.exit(0); }
  try { guard = JSON.parse(fs.readFileSync(cfg.file("lane", "guard.json"), "utf8")); } catch (e) { process.exit(0); }
  const me = process.env.CLAUDE_CODE_HOST_SESSION_ID || "";
  const family = new Set([guard.router, ...(guard.family || [])].filter(Boolean));
  const lanes = new Set(guard.lanes || []);
  if (!me || !family.has(me) || lanes.has(me)) process.exit(0);
  const rules = [
    /\bgh\s+pr\s+merge\b/i,
    /\bgh\s+api\b[^\n]*\/pulls\/\d+\/merge\b/i,
    /\bgit\s+push\b[^\n;&|]*\s(?:[\w./-]+:)?(?:refs\/heads\/)?(?:main|master)(?=\s|$|["'])/i,
    /\bgit\s+push\b[^\n;&|]*\s--all\b/i,
  ];
  if (rules.some(r => r.test(cmd))) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Blocked: among the Router's sessions only a merge lane may merge a pull request or push to main. Push your own branch and tell the Router the card is ready; it queues the card for the lane. Do not try another way of merging.",
      },
    }));
  }
  process.exit(0);
});
