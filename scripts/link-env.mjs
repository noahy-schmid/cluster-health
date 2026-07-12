#!/usr/bin/env node
//
// Ensure the current git worktree can see the shared root .env.
//
// The root .env is gitignored, so it exists only in the main checkout. A linked
// worktree does not get it, which would leave the `dotenv -e .env` wrappers in
// package.json loading nothing. This symlinks the main checkout's .env into the
// current worktree, locating the main checkout via `git rev-parse
// --git-common-dir` (works no matter where the worktree lives on disk).
//
// It runs automatically from the root `prepare` script (after `pnpm install`),
// and can be re-run manually with `just link-env`.
//
// Best-effort by design: it never fails the caller. In the main checkout, in CI,
// in Docker image builds, or when git / the source .env is unavailable, it does
// nothing and exits 0 — so wiring it into `prepare`/`install` is always safe.
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const git = (args) =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();

const isSymlink = (p) => {
  try {
    return lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
};

try {
  const gitDir = git(["rev-parse", "--git-dir"]);
  const commonDir = git(["rev-parse", "--git-common-dir"]);

  // These differ only inside a linked worktree. In the main checkout or a plain
  // clone they are equal — the real .env is (or should be) right there.
  if (resolve(gitDir) === resolve(commonDir)) process.exit(0);

  const src = join(dirname(resolve(commonDir)), ".env");
  const dest = join(git(["rev-parse", "--show-toplevel"]), ".env");

  if (!existsSync(src)) {
    console.warn(`link-env: no .env in the main checkout (${src}); skipping.`);
    process.exit(0);
  }
  if (resolve(src) === resolve(dest)) process.exit(0);

  if (isSymlink(dest)) {
    rmSync(dest); // replace a stale/previous link
  } else if (existsSync(dest)) {
    console.warn(`link-env: ${dest} is a real file; leaving it in place.`);
    process.exit(0);
  }

  symlinkSync(src, dest);
  console.log(`link-env: linked ${dest} -> ${src}`);
} catch (err) {
  // git missing, not a repository, permission error, etc. Never block install.
  console.warn(`link-env: skipped (${err.message})`);
  process.exit(0);
}
