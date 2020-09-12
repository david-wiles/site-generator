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
  return str.substring(i);
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
