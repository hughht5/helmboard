// PostCompact hook: after this Router session compacts, feed back its durable state.
// Only acts in the Router session named in router-board/router.json. Added 18 Nov 2026.
// Undo: remove this file's entry from PostCompact in ~/.claude/settings.json.
const fs = require("fs");
const B = require("./config").dir.replace(/\\/g, "/") + "/";
let raw = ""; process.stdin.on("data", d => (raw += d)); process.stdin.on("end", () => {
  let router = "";
  try { router = JSON.parse(fs.readFileSync(B + "router.json", "utf8")).session; } catch (e) { process.exit(0); }
  if ((process.env.CLAUDE_CODE_HOST_SESSION_ID || "") !== router) process.exit(0);
  const read = f => { try { return fs.readFileSync(f, "utf8"); } catch (e) { return "(missing: " + f + ")"; } };
  const ctx = [
    "You are the owner's Router and this session just compacted. Rebuild your picture from these files, not from the summary. Then re-read the board and the lane queue before acting. FIRST run CronList: if the Router check is missing, recreate it exactly from router-board/check-prompt.md.",
    "## handover.md\n" + read(B + "handover.md"),
    "## standing.md\n" + read(B + "standing.md"),
    ...(() => { try { return require("fs").readdirSync(B + "lane").filter(f => /-queue\.md$/.test(f)); } catch (e) { return []; } })()
      .map(q => "## lane/" + q + "\n" + read(B + "lane/" + q)),
    "## Router skill\n" + read(require("./config").skill),
  ].join("\n\n");
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: ctx } }));
  process.exit(0);
});
