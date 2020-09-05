import Path from "./Path";
import fs from "fs";

type WalkFn = (path: Path) => void;

export function trimPrefix(prefix: string, str: string): string {
  let i = 0;
  if (prefix.length >= str.length) return str;
  else {
    while (i < prefix.length && prefix[i] === str[i]) i += 1;
  }
  return str.substring(i);
}

export function walkDir(dir: Path, walkFn: WalkFn) {
  try {
    let entries = fs.readdirSync(dir.absPath());
    entries.forEach((entry) => {
      walkFn(Path.fromParts(dir.absPath(), entry));
    });
  } catch (err) {
    console.error("Error:", err);
  }
}
