import Path from "./Path";
import fs from "fs";

type WalkFn<T> = (path: Path, acc: T) => T;

// Remove the entire prefix from a string, if it exists
export function trimPrefix(prefix: string, str: string): string {
  let i = 0;
  if (prefix.length >= str.length) return str;
  else {
    while (i < prefix.length && prefix[i] === str[i]) i += 1;
  }
  return i === prefix.length ? str.substring(i) : str;
}

// Recursive walk all directory entries, starting from a specific Path
export function walkDir<T>(dir: Path, walkFn: WalkFn<T>, acc?: T): T {
  try {
    let entries = fs.readdirSync(dir.absPath());
    entries.forEach((entry) => {
      acc = walkFn(Path.fromParts(dir.absPath(), entry), acc);
    });
  } catch (err) {
    console.error("Error:", err);
  }
  return acc;
}

// Get a relative path based on a given root directory
export function relativePath(root: Path, rel: Path) {
  let path = trimPrefix(root.absPath(), rel.absPath());

  if (path === rel.absPath())
    throw new Error("Relative path is not in root subtree!");

  return path.startsWith("/") ?
    path.substring(1) :
    path;
}
