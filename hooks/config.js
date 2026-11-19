// Shared paths for the Router hooks. Override with environment variables:
//   HELMBOARD_DIR the board folder (default ~/helmboard; ROUTER_DIR still works as an alias)
//   ROUTER_SKILL  the Router skill file (default ~/.claude/skills/helmboard-start/SKILL.md)
const os = require("os"), path = require("path");
const home = os.homedir();
const expand = p => (p && p.startsWith("~") ? path.join(home, p.slice(1)) : p);
const dir = path.resolve(expand(process.env.HELMBOARD_DIR || process.env.ROUTER_DIR) || path.join(home, "helmboard"));
const skill = path.resolve(expand(process.env.ROUTER_SKILL) || path.join(home, ".claude", "skills", "helmboard-start", "SKILL.md"));
module.exports = { dir, skill, file: (...p) => path.join(dir, ...p) };
