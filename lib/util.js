const fs = require("fs");
const path = require("path");

const trimPrefix = (prefix, str) => {
  let i = 0;
  if (prefix.length >= str.length) return str;
  else {
    while (i < prefix.length && prefix[i] === str[i]) i += 1;
  }
  return str.substring(i);
};

const newPath = (...parts) => {
  parts.forEach((part, idx, arr) => {
    if (part[0] === "/" && idx != 0) {
      arr[idx] = part.substring(1);
    }
    if (part[part.length - 1] === "/") {
      arr[idx] = part.substring(0, part.length - 2);
    }
  });
  return path.join(...parts);
};

const relPath = (base, f) => {
  let path = trimPrefix(base, f);

  if (path === f)
    throw new Error("Relative path is not in root subtree!");

  return path.startsWith("/") ?
    path.substring(1) :
    path;
};

const walkDir = (dir, walkFn, acc) => {
  try {
    let entries = fs.readdirSync(dir);
    entries.forEach((entry) => {
      acc = walkFn(newPath(dir, entry), acc);
    });
  } catch (err) {
    console.error("Error:", err);
  }
  return acc;
};

module.exports = {
  trimPrefix,
  newPath,
  relPath,
  walkDir
}
