// Shared paths for the Router hooks. Override with environment variables:
//   HELMBOARD_DIR the board folder (default ~/helmboard; ROUTER_DIR still works as an alias)
//   ROUTER_SKILL  the Router skill file (default: this plugin's skills/helmboard-start/SKILL.md,
//                 else ~/.claude/skills/helmboard-start/SKILL.md)
const fs = require("fs"), os = require("os"), path = require("path");
const home = os.homedir();
const expand = p => (p && p.startsWith("~") ? path.join(home, p.slice(1)) : p);
const dir = path.resolve(expand(process.env.HELMBOARD_DIR || process.env.ROUTER_DIR) || path.join(home, "helmboard"));
const own = path.join(__dirname, "..", "skills", "helmboard-start", "SKILL.md");
const skill = path.resolve(expand(process.env.ROUTER_SKILL) ||
  (fs.existsSync(own) ? own : path.join(home, ".claude", "skills", "helmboard-start", "SKILL.md")));
module.exports = { dir, skill, file: (...p) => path.join(dir, ...p) };
