// Test helpers: a temp HOME built from a fixture, and an exec that runs a script
// with the machine's real `sh`, the way Herdr's `exec` does.
import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const temps = new Set();
process.on("exit", () => {
  for (const dir of temps) fs.rmSync(dir, { recursive: true, force: true });
});

function mkTemp(prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  temps.add(dir);
  return dir;
}

// `files` maps a path relative to home to its text, or to `{ link: target }`
// for a symlink. HOME is passed to scripts unresolved (on macOS the temp folder
// sits behind a symlink); the `home` returned to tests is the real path.
export function makeHome(files) {
  const homeDir = mkTemp("sg home.");
  const tmpDir = mkTemp("sg tmp.");
  const at = (rel) => path.join(homeDir, rel);
  for (const [rel, value] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(at(rel)), { recursive: true });
    if (typeof value === "string") fs.writeFileSync(at(rel), value);
    else fs.symlinkSync(value.link, at(rel));
  }
  const env = { HOME: homeDir, PATH: process.env.PATH, TMPDIR: tmpDir };
  const exec = (script, args = [], on, timeoutMs) =>
    new Promise((resolve) => {
      execFile("sh", ["-c", script, "skillsgate", ...args], { env, timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
        const code = err ? (typeof err.code === "number" ? err.code : -1) : 0;
        resolve({ code, stdout: String(stdout), stderr: String(stderr || (err && err.message) || "") });
      });
    });
  const readText = async (file, on) => {
    try {
      return fs.readFileSync(file, "utf8");
    } catch {
      return null;
    }
  };
  return { home: fs.realpathSync(homeDir), exec, readText, path: at };
}
