import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const remote = "https://github.com/yalishiduozhang/yalishiduozhang.github.io.git";
const gitOptions = ["-c", "credential.helper=!gh auth git-credential"];
function git(args, cwd = root) {
  return execFileSync("git", [...gitOptions, ...args], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
}
if (git(["status", "--porcelain"])) throw new Error("Commit source changes before deploying.");
const source = git(["rev-parse", "HEAD"]);
const published = git(["ls-remote", remote, "refs/heads/academic-source"]).split(/\s+/)[0];
if (source !== published) throw new Error("Push the current academic-source commit before deploying.");
for (const script of ["lint", "test", "build"]) execFileSync("npm", ["run", script], { cwd: root, stdio: "inherit" });
const dist = join(root, "dist");
if (!existsSync(join(dist, "index.html"))) throw new Error("Missing production build.");
const temp = mkdtempSync(join(tmpdir(), "xun-pages-"));
const checkout = join(temp, "site");
try {
  git(["clone", "--depth", "1", "--branch", "main", "--single-branch", remote, checkout]);
  git(["config", "user.name", git(["config", "user.name"]) || "Xun Zhang"], checkout);
  git(["config", "user.email", git(["config", "user.email"]) || "yalishiduozhang@users.noreply.github.com"], checkout);
  const previous = git(["rev-parse", "HEAD"], checkout);
  const backup = "backup/main-" + new Date().toISOString().replace(/[-:.]/g, "") + "-before-academic";
  git(["push", "origin", previous + ":refs/heads/" + backup], checkout);
  git(["rm", "-r", "--ignore-unmatch", "."], checkout);
  cpSync(dist, checkout, { recursive: true });
  git(["add", "--all"], checkout);
  if (!git(["status", "--porcelain"], checkout)) {
    console.log("The production files are already current.");
  } else {
    git(["commit", "-m", "Publish bilingual academic homepage from " + source.slice(0, 12)], checkout);
    git(["push", "origin", "HEAD:main"], checkout);
    console.log("Published commit " + git(["rev-parse", "HEAD"], checkout));
    console.log("Backup branch: " + backup);
    console.log("Site: https://yalishiduozhang.github.io/");
  }
} finally {
  // Only the newly created, task-owned checkout is removed.
  if (resolve(temp).startsWith(resolve(tmpdir()) + "/xun-pages-")) rmSync(temp, { recursive: true, force: true });
}
