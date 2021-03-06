// Build all html files in a specified directory
const fs = require("fs");
const mkdirp = require("mkdirp");
const dirname = require("path").dirname;
const {newPath, relPath, walkDir} = require("./util");
const {buildTemplate} = require("./template");

// Deps object, global to the duration of the project
let Deps = new Map();

/**
 * Walks through a given directory and builds html files for all pages
 * not found within the template directory. Outputs files into the out directory
 * @param {string} dir
 * @param {string} out
 */
const buildDir = (dir, out) => {
  walkDir(dir, _gatherPages, [])
    .forEach(f => _buildPage(f, dir, out));
};

/**
 * Watches a directory for file changes and rebuilds the changes pages
 * @param {string} dir
 * @param {string} out
 */
const watch = (dir, out) => {
  console.log("\x1b[32m", "Watching files for changes...", "\x1b[0m")
  fs.watch(
    dir,
    {
      persistent: true,
      recursive: true
    },
    (event, filename) => {
      if (filename) {
        let file = newPath(dir, filename);
        if (fs.existsSync(file) && !fs.statSync(file).isDirectory()) {
          _gatherDeps(Deps, file).forEach(f => _buildPage(f, dir, out));
        }
      } else {
        console.error(`Error: ${event}`);
      }
    }
  );
};

const _write = (dir, file, data) => {
  let output = newPath(dir, file);
  mkdirp.sync(dirname(output))
  console.log("\x1b[32m", "Writing file to " + output, "\x1b[0m")
  fs.writeFileSync(output, data);
}

const _gatherDeps = (deps, page) => {
  let paths = [page];
  deps.get(page)?.forEach(dep => paths.push(..._gatherDeps(deps, dep)));
  return paths;
};

const _gatherPages = (path, paths, tDir) => {
  if (!path.startsWith(tDir)) {
    if (fs.statSync(path).isDirectory()) {
      paths = walkDir(path, _gatherPages, paths);
    } else {
      if (path.endsWith(".html")) {
        paths.push(path);
      }
    }
  }
  return paths;
};

const _buildPage = (f, dir, out) => {
  let tDir = newPath(dir, "/templates");
  if (!f.startsWith(tDir)) {
    buildTemplate(f, tDir, Deps)
      .then(html => _write(out, relPath(dir, f), html))
      .catch(err => console.error(err));
  }
};

module.exports = {
  buildDir,
  watch
};
