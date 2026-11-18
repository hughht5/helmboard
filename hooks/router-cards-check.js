// Stop hook for the Router: refuse to end a turn while cards.json contradicts the lane queues.
// A card queued to ship (not yet live) must be in "Ship it"; a live one in "Deploy complete" or
// "Done"; a held one in "Ship it" or "Blocked". Only acts in the Router session named in router.json.
const fs = require("fs");
const cfg = require("./config");
let raw = ""; process.stdin.on("data", d => (raw += d)); process.stdin.on("end", () => {
  let input = {}; try { input = JSON.parse(raw || "{}"); } catch (e) {}
  if (input.stop_hook_active) process.exit(0);
  let router = ""; try { router = JSON.parse(fs.readFileSync(cfg.file("router.json"), "utf8")).session; } catch (e) { process.exit(0); }
  if (!router || (process.env.CLAUDE_CODE_HOST_SESSION_ID || "") !== router) process.exit(0);
  let cards = {}; try { cards = JSON.parse(fs.readFileSync(cfg.file("cards.json"), "utf8")); } catch (e) { process.exit(0); }
  let files = []; try { files = fs.readdirSync(cfg.file("lane")).filter(f => /-queue\.md$/.test(f) && f !== "board-queue.md"); } catch (e) { process.exit(0); }
  const bad = [];
  for (const f of files) {
    for (const line of fs.readFileSync(cfg.file("lane", f), "utf8").split(/\r?\n/)) {
      const m = line.match(/^- \[([^\]]*)\]\s*#(\d+)/); if (!m) continue;
      const state = m[1].toLowerCase(), n = m[2], card = cards[n]; if (!card) continue;
      const want = /^live/.test(state) ? ["Deploy complete", "Done"] : /^held/.test(state) ? ["Ship it", "Blocked"] : ["Ship it"];
      if (!want.includes(card.column)) bad.push(`#${n} is "${m[1]}" in lane/${f} but its card is in ${card.column} (should be ${want.join(" or ")})`);
    }
  }
  if (!bad.length) process.exit(0);
  process.stdout.write(JSON.stringify({ decision: "block", reason: "Cards out of place. Fix the board row and cards.json now, then finish:\n- " + bad.join("\n- ") }));
  process.exit(0);
});
