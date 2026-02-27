import pc from "picocolors";
import os from "node:os";
import path from "node:path";

export const fmt = {
  success: (msg: string) => pc.green(msg),
  error: (msg: string) => pc.red(msg),
  warn: (msg: string) => pc.yellow(msg),
  info: (msg: string) => pc.cyan(msg),
  dim: (msg: string) => pc.dim(msg),
  bold: (msg: string) => pc.bold(msg),
  skillName: (name: string) => pc.bold(pc.cyan(name)),
  agentName: (name: string) => pc.magenta(name),
  path: (p: string) => pc.dim(pc.underline(p)),
};

export function shortenPath(fullPath: string): string {
  const home = os.homedir();
  const cwd = process.cwd();

  if (fullPath.startsWith(cwd + path.sep)) {
    return "." + fullPath.slice(cwd.length);
  }
  if (fullPath.startsWith(home)) {
    return "~" + fullPath.slice(home.length);
  }
  return fullPath;
}
