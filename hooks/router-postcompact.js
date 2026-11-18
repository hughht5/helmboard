// PostCompact hook: after the Router session compacts, feed back its durable state
// (handover, standing instructions, every lane queue and the Router skill).
// Only acts in the Router session named in <ROUTER_DIR>/router.json.
const fs = require("fs");
const cfg = require("./config");
let raw = ""; process.stdin.on("data", d => (raw += d)); process.stdin.on("end", () => {
  let router = "";
  try { router = JSON.parse(fs.readFileSync(cfg.file("router.json"), "utf8")).session; } catch (e) { process.exit(0); }
  if (!router || (process.env.CLAUDE_CODE_HOST_SESSION_ID || "") !== router) process.exit(0);
  const read = f => { try { return fs.readFileSync(f, "utf8"); } catch (e) { return "(missing: " + f + ")"; } };
  let queues = [];
  try { queues = fs.readdirSync(cfg.file("lane")).filter(f => /-queue\.md$/.test(f)); } catch (e) {}
  const ctx = [
    "You are the owner's Router and this session just compacted. Rebuild your picture from these files, not from the summary. Then re-read the board and the lane queues before acting. FIRST run CronList: if the Router check is missing, recreate it exactly from check-prompt.md in the board folder.",
    "## handover.md\n" + read(cfg.file("handover.md")),
    "## standing.md\n" + read(cfg.file("standing.md")),
    ...queues.map(q => "## lane/" + q + "\n" + read(cfg.file("lane", q))),
    "## Router skill\n" + read(cfg.skill),
  ].join("\n\n");
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: ctx } }));
  process.exit(0);
});
