// Build all html files in a specified directory
const fs = require("fs");
const mkdirp = require("mkdirp");
const dirname = require("path").dirname;
const {newPath, relPath, walkDir} = require("./util");
const {buildTemplate} = require("./template");

// Deps object, global to the duration of the project
let Deps = new Map();

// Walks through a directory and returns an array of the generated html
const buildDir = (dir, out) => {
  let pages = walkDir(dir, gatherPages, []);
  pages.forEach((p) => {
    let tDir = newPath(dir, "/templates");
    if (!p.startsWith(tDir)) {
      buildTemplate(p, undefined, tDir, Deps)
        .then((html) => write(out, relPath(dir, p), html))
        .catch(err => console.error(err));
    }
  });
};

// Watch a directory and write html to an output file when complete
const watch = (dir, out) => {
  console.log("\x1b[32m", "Watching files for changes...", "\x1b[0m")
  fs.watch(
    dir,
    {
      persistent: true,
      recursive: true
    }, ((event, filename) => {
      if (filename) {
        let file = newPath(dir, filename);
        if (!fs.statSync(file).isDirectory()) {
          gatherDeps(Deps, file).forEach(f => {
            if (!f.startsWith(newPath(dir, "/templates"))) {
              buildTemplate(f, undefined, newPath(dir, "/templates"), Deps)
                .then((html) => write(out, relPath(dir, f), html))
                .catch(err => console.error(err));
            }
          });
        }
      } else {
        console.error(`Error: ${event}`);
      }
    })
  );
};

const write = async (dir, file, data) => {
  let output = newPath(dir, file);
  await mkdirp(dirname(output));
  console.log("\x1b[32m", "Writing file to " + output, "\x1b[0m")
  fs.writeFileSync(output, data);
}

const gatherDeps = (deps, page) => {
  let paths = [page];
  deps.get(page)?.forEach(dep => paths.push(...gatherDeps(deps, dep)));
  return paths;
};

const gatherPages = (path, paths, tDir) => {
  if (!path.startsWith(tDir)) {
    if (fs.statSync(path).isDirectory()) {
      paths = walkDir(path, gatherPages, paths);
    } else {
      if (path.endsWith(".html")) {
        paths.push(path);
      }
    }
  }
  return paths;
};

module.exports = {
  buildDir,
  watch
};
