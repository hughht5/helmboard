// Stop hook for the owner's Router: refuse to end a turn while the record contradicts the lane queues.
// A card queued to ship (not yet live) must be in "Ship it"; a live one must be in Deploy complete or Done;
// a sent-back one ("sent back: <reason>") must be In progress.
// Added 18 Nov 2026 after #1014 was queued but left In progress. Undo: remove its Stop entry in settings.json.
const fs = require("fs");
const B = "~/helmboard/";
let raw = ""; process.stdin.on("data", d => (raw += d)); process.stdin.on("end", () => {
  let input = {}; try { input = JSON.parse(raw || "{}"); } catch (e) {}
  if (input.stop_hook_active) process.exit(0);
  let router = ""; try { router = JSON.parse(fs.readFileSync(B + "router.json", "utf8")).session; } catch (e) { process.exit(0); }
  if ((process.env.CLAUDE_CODE_HOST_SESSION_ID || "") !== router) process.exit(0);
  let cards = {}; try { cards = JSON.parse(fs.readFileSync(B + "cards.json", "utf8")); } catch (e) { process.exit(0); }
  const bad = [];
  // Only each card's last line in a queue counts (a re-queued card keeps its old line as history).
  // Sent back (card #1057): a card the lane sent back, or held for its own fault, is In progress
  // with its session fixing it; only a shared-fault hold keeps the card in Ship it or Blocked.
  for (const f of fs.readdirSync(B + "lane").filter(f => /-queue\.md$/.test(f) && f !== "board-queue.md")) {
    const last = {};
    for (const line of fs.readFileSync(B + "lane/" + f, "utf8").split(/\r?\n/)) {
      const m = line.match(/^- \[([^\]]*)\]\s*#(\d+)/); if (m) last[m[2]] = m[1];
    }
    for (const [n, st] of Object.entries(last)) {
      const state = st.toLowerCase().trim(), card = cards[n]; if (!card || /^(batch|pending|was )/.test(state)) continue; // pending = approved but still being built: card stays In progress
      const want = /^held: shared fault/.test(state) ? ["Ship it", "Blocked"]
        : /^(held|sent back)/.test(state) ? ["In progress"]
        : (/\blive\b/.test(state) && !/not live|\bred\b|\bfailed\b|rolled back/.test(state)) ? ["Deploy complete", "Final action needed", "Email customer", "Done"]
        : ["Ship it"];
      if (!want.includes(card.column)) bad.push(`#${n} is "${st}" in lane/${f} but its card is in ${card.column} (should be ${want.join(" or ")})` + (want[0] === "In progress" ? `; a sent-back card's queue line reads "sent back: <reason>" and its session gets the reason` : ""));
    }
  }
  for (const k of Object.values(cards)) if (k && k.column === "In progress" && !k.session) bad.push(`#${k.n} is In progress with no session working on it (give it a session or move it to Backlog)`);
  // Sent back but left in Human test (added 23 Nov 2026 after #1070): a card in Human test whose session
  // is busy is being reworked, so it belongs In progress.
  try {
    const busy = JSON.parse(fs.readFileSync(B + "busy-sessions.json", "utf8"));
    for (const k of Object.values(cards)) if (k && k.column === "Human test" && k.session && busy.includes(k.session)) bad.push(`#${k.n} is in Human test but its session is working on it: move it to In progress until it reports done`);
  } catch (e) {}
  // Screenshots must be uploaded (added 23 Nov 2026 after #182 showed PC paths).
  // Empty Test tab: a card in Human test needs its detail checked: steps [{text}] and uploaded screenshots. Set testReady:true in cards.json only after reading cards/<n>/detail/full.
  for (const k of Object.values(cards)) if (k && k.column === "Human test" && !k.testReady) bad.push(`#${k.n} is in Human test without a checked Test tab: put steps [{text}] (with the stack link) and uploaded screenshots in detail/full, plus testIntro, testVisuals and beforeAfter pairs, then set testReady:true in cards.json`);
  for (const k of Object.values(cards)) if (k && k.column === "Human test" && Array.isArray(k.proof) && k.proof.some(p => typeof p === "string" || !p.url)) bad.push(`#${k.n} has screenshots that are PC paths, not uploaded: upload them as artifact assets and set proof [{label,url,step}]`);
  // Deploy complete -> post to Slack #product. Card needs slackPosted once posted.
  for (const k of Object.values(cards)) if (k && /your-app/.test(k.repo || "") && ["Deploy complete", "Final action needed", "Done"].includes(k.column) && !/^dsh/.test(k.source || "") && !k.slackPosted && !k.noSlack) bad.push(`#${k.n} is live but not posted to Slack #product (C0ALAMB66MB): post a one-line customer-facing note, then set slackPosted on the card in cards.json (or noSlack: true for internal-only work)`);
  // Timers (added 20 Nov 2026): each background timer touches timers/<name>.alive every minute.
  // A stale file means the timer died (e.g. the session restarted). Delete the file to retire a timer on purpose.
  try {
    for (const f of fs.readdirSync(B + "timers").filter(f => f.endsWith(".alive"))) {
      const age = (Date.now() - fs.statSync(B + "timers/" + f).mtimeMs) / 60000;
      if (age > 3) bad.push(`timer ${f.replace(/\.alive$/, "")} is not running (last beat ${Math.round(age)} min ago): relaunch it from timers/README.md, or delete timers/${f} if it was retired on purpose`);
    }
  } catch (e) {}
  if (!bad.length) process.exit(0);
  process.stdout.write(JSON.stringify({ decision: "block", reason: "Cards out of place. Fix the board row and cards.json now, then finish:\n- " + bad.join("\n- ") }));
  process.exit(0);
});
