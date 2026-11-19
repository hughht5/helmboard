// Stop hook for the owner's Router: refuse to end a turn while the record contradicts the lane queues.
// A card queued to ship (not yet live) must be in "Ship it"; a live one must be in Deploy complete or Done.
// Added 18 Nov 2026 after #1014 was queued but left In progress. Undo: remove its Stop entry in settings.json.
const fs = require("fs");
const B = require("./config").dir.replace(/\\/g, "/") + "/";
let raw = ""; process.stdin.on("data", d => (raw += d)); process.stdin.on("end", () => {
  let input = {}; try { input = JSON.parse(raw || "{}"); } catch (e) {}
  if (input.stop_hook_active) process.exit(0);
  let router = ""; try { router = JSON.parse(fs.readFileSync(B + "router.json", "utf8")).session; } catch (e) { process.exit(0); }
  if ((process.env.CLAUDE_CODE_HOST_SESSION_ID || "") !== router) process.exit(0);
  let cards = {}; try { cards = JSON.parse(fs.readFileSync(B + "cards.json", "utf8")); } catch (e) { process.exit(0); }
  const bad = [];
  for (const f of fs.readdirSync(B + "lane").filter(f => /-queue\.md$/.test(f) && f !== "board-queue.md")) {
    for (const line of fs.readFileSync(B + "lane/" + f, "utf8").split(/\r?\n/)) {
      const m = line.match(/^- \[([^\]]*)\]\s*#(\d+)/); if (!m) continue;
      const state = m[1].toLowerCase(), n = m[2], card = cards[n]; if (!card || /^(batch|pending)/.test(state)) continue; // pending = approved but still being built: card stays In progress
      const want = (/\blive\b/.test(state) && !/not live|\bred\b|\bfailed\b|rolled back/.test(state)) ? ["Deploy complete", "Final action needed", "Email customer", "Done"] : /^held/.test(state) ? ["Ship it", "Blocked"] : ["Ship it"];
      if (!want.includes(card.column)) bad.push(`#${n} is "${m[1]}" in lane/${f} but its card is in ${card.column} (should be ${want.join(" or ")})`);
    }
  }
  for (const k of Object.values(cards)) if (k && k.column === "In progress" && !k.session) bad.push(`#${k.n} is In progress with no session working on it (give it a session or move it to Backlog)`);
  // Deploy complete -> post to Slack #product. Card needs slackPosted once posted.
  for (const k of Object.values(cards)) if (k && /your-app/.test(k.repo || "") && ["Deploy complete", "Final action needed", "Done"].includes(k.column) && !/^dsh/.test(k.source || "") && !k.slackPosted && !k.noSlack) bad.push(`#${k.n} is live but not posted to Slack #product (C0ALAMB66MB): post a one-line customer-facing note, then set slackPosted on the card in cards.json (or noSlack: true for internal-only work)`);
  if (!bad.length) process.exit(0);
  process.stdout.write(JSON.stringify({ decision: "block", reason: "Cards out of place. Fix the board row and cards.json now, then finish:\n- " + bad.join("\n- ") }));
  process.exit(0);
});
