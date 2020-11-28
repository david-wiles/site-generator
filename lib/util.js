const fs = require("fs");
const path = require("path");

/**
 * Removes the specified prefix from the string
 * @param {string} prefix
 * @param {string} str
 * @returns {string|*}
 */
const trimPrefix = (prefix, str) => {
  let i = 0;
  if (prefix.length >= str.length) return str;
  else {
    while (i < prefix.length && prefix[i] === str[i]) i += 1;
  }
  // Only trim string if the index matches the length of the prefix
  return i === prefix.length ? str.substring(i) : str;
};

/**
 * Creates a new paths from the parts passed to it. This
 * acts as a wrapper around path.join, but ensures that
 * absolute paths are preserved
 * @param {[string]} parts
 * @returns {string}
 */
const newPath = (...parts) => {
  let p = path.join(...parts);
  return p.endsWith("/") ? p.slice(0, -1) : p;
};

/**
 * Creates a new path relative to the base using a given file
 * @param {string} base
 * @param {string} f
 * @returns {string|*}
 */
const relPath = (base, f) => {
  let path = trimPrefix(base, f);

  if (path === f)
    throw new Error("Relative path is not in root subtree!");

  return path.startsWith("/") ?
    path.substring(1) :
    path;
};

/**
 * Walks through a directory recursively and calls walkFn on each file.
 * Results are accumulated into acc.
 * @param {string} dir
 * @param {function} walkFn
 * @param acc
 * @returns {*}
 */
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
