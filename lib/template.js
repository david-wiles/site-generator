// template.js
// Implementation of an html generator. Takes an html file and template directory as inputs
// and returns a generated html file
const escapeStringRegexp = require("escape-string-regexp");
const fs = require("fs");
const {promisify} = require("util");
const {newPath, relPath} = require("./util");

const readFile = promisify(fs.readFile);

const buildTemplate = async (filename, dataFilename, tDir, deps) => {
  let text = await readFile(filename);
  let data = dataFilename ? await readFile(dataFilename) : false;

  text = text.toString();
  data = data.toString() || false;

  // Replace placeholders with data from json string
  if (data) {
    for (const [key, val] of Object.entries(JSON.parse(data))) {
      let re = new RegExp(`{{\\s*${escapeStringRegexp(key)}\\s*}}`, 'g');
      text = text.replace(re, val.toString());
    }
  }

  // Gather templates
  let templates = [];
  let matches = text.matchAll(/{{\s*template\s*"([.0-9a-zA-Z/-]+)"\s*"?([.0-9a-zA-Z/-]+)?"?\s*}}/g);
  let result = matches.next();

  while (!result.done) {
    templates.push({
      name: newPath(tDir, result.value[1]),
      data: result.value[2] ? newPath(tDir, result.value[2]) : undefined
    });
    setDep(deps, filename, result.value[1]);
    if (result.value[2]) {
      setDep(deps, filename, result.value[2]);
    }
    result = matches.next();
  }

  // Build templates and replace text
  return templates.reduce(async (acc, t, i) => {
    let re = t.data ?
      new RegExp(`{{\\s*template\\s*"${escapeStringRegexp(relPath(tDir, t.name))}"\\s*"${escapeStringRegexp(relPath(tDir, t.data))}"\\s*}}`, 'g') :
      new RegExp(`{{\\s*template\\s*"${escapeStringRegexp(relPath(tDir, t.name))}"\\s*}}`, 'g');
    let render = await buildTemplate(t.name, t.data, tDir, deps);
    return (await acc).replace(re, render);
  }, text);
};

const setDep = (deps, page, ...dep) => {
  // Set dependencies
  if (!deps.has(page)) {
    deps.set(page, new Set());
  }
  deps.get(page).add(...dep)
};

module.exports = {buildTemplate}