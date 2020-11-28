// template.js
// Implementation of an html generator. Takes an html file and template directory as inputs
// and returns a generated html file
const escapeStringRegexp = require("escape-string-regexp");
const fs = require("fs");
const {promisify} = require("util");
const {newPath, relPath} = require("./util");

const readFile = promisify(fs.readFile);

const build = async (template, tDir) => {
  return await buildTemplate(template, tDir, undefined);
}

/**
 * Builds the template found in the specified file. If dataFilename is not null,
 * the filename will be used for data values
 * @param template
 * @param tDir
 * @param deps
 * @returns {*}
 */
const buildTemplate = async (template, tDir, deps) => {
  let {text, data, filename} = await _parseArgs(template);

  // Replace placeholders with data from json string
  if (data) {
    text = _replaceData(text, data);
  }

  return _gatherTemplates(text, tDir).reduce((acc, t) => _replaceText(acc, t, tDir, filename, deps), text);
};

const _parseArgs = async (template) => {
  let text, data, filename;

  // If the template is a string, treat it as the template filename
  if (typeof template === "string") {
    filename = template;
    text = await readFile(template);
    data = false;

    text = text.toString();
  } else {
    // Otherwise, look for specified template and data filenames
    filename = template.name;
    text = await readFile(template.name);
    data = template.data ? await readFile(template.data) : false;

    text = text.toString();
    data = data.toString();
  }

  return {text, data, filename};
};

const _replaceData = (text, data) => {
  for (const [key, val] of Object.entries(JSON.parse(data))) {
    let re = new RegExp(`{{\\s*${escapeStringRegexp(key)}\\s*}}`, 'g');
    text = text.replace(re, val.toString());
  }
  return text;
}

const _gatherTemplates = (text, tDir) => {
  // Gather templates
  let templates = [];
  let matches = text.matchAll(/{{\s*template\s*"([.0-9a-zA-Z/-]+)"\s*"?([.0-9a-zA-Z/-]+)?"?\s*}}/g);
  let result = matches.next();

  while (!result.done) {
    templates.push({
      name: newPath(tDir, result.value[1]),
      data: result.value[2] ? newPath(tDir, result.value[2]) : undefined
    });

    result = matches.next();
  }

  return templates;
};

const _replaceText = async (text, t, tDir, filename, deps) => {
  _setDep(deps, t.name, filename);
  if (t.data) {
    _setDep(deps, t.data, filename);
  }

  let re = t.data ?
    new RegExp(`{{\\s*template\\s*"${escapeStringRegexp(relPath(tDir, t.name))}"\\s*"${escapeStringRegexp(relPath(tDir, t.data))}"\\s*}}`, 'g') :
    new RegExp(`{{\\s*template\\s*"${escapeStringRegexp(relPath(tDir, t.name))}"\\s*}}`, 'g');

  let html = await buildTemplate({name: t.name, data: t.data}, tDir, deps);
  return (await text).replace(re, html);
};

/**
 * Assigns the given dependencies to the map dep
 * @param {Map<string, Set<string>>}deps
 * @param {string} page
 * @param {[string]} dep
 * @private
 */
const _setDep = (deps, page, ...dep) => {
  // Set dependencies
  if (deps !== undefined) {
    if (!deps.has(page)) {
      deps.set(page, new Set());
    }
    deps.get(page).add(...dep)
  }
};

module.exports = {
  build: build,
  buildTemplate: buildTemplate
};
