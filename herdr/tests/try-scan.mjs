// Read-only check of the scan script against a real machine.
//   node herdr/tests/try-scan.mjs            this computer
//   node herdr/tests/try-scan.mjs <machine>  a Herdr machine, through `hc exec`
// Prints counts only. Not a test: the name keeps `node --test herdr/tests/*.test.mjs` from running it.
import { execFile } from "node:child_process";
import { TOOLS } from "../skillsgate/mods/skillsgate/registry.js";
import { scanScript } from "../skillsgate/mods/skillsgate/scripts.js";
import { buildSkills, parseScan } from "../skillsgate/mods/skillsgate/model.js";

const machine = process.argv[2];
const script = scanScript(TOOLS);
const [cmd, args] = machine
  ? ["hc", ["exec", "--on", machine, "sh", "-c", script, "skillsgate"]]
  : ["sh", ["-c", script, "skillsgate"]];

execFile(cmd, args, { timeout: 30000, maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
  if (err) {
    console.error(`scan failed: ${String(stderr || err.message).trim()}`);
    process.exit(1);
  }
  const scan = parseScan(stdout);
  const skills = buildSkills(scan);
  const homes = (h) => skills.filter((s) => s.home === h).length;
  console.log(`machine:  ${machine ?? "this computer"}`);
  console.log(`git:      ${scan.git}`);
  console.log(`tools:    ${scan.tools.length} known, ${scan.tools.filter((t) => t.detected).length} detected`);
  console.log(`entries:  ${scan.entries.length}`);
  console.log(`skills:   ${skills.length} (store ${homes("store")}, tool ${homes("tool")}, external ${homes("external")})`);
});
