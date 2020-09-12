#!/usr/bin/env node
const {Command} = require("commander");
const {Generator} = require("..");

const program = new Command();
program.version("0.0.2")
  .option("-r, --root <string>", "Root directory of html files", ".")
  .option("-t, --templates <string>", "Source directory of templates. Must be inside the root folder.", "templates")
  .option("-o, --out [string]", "Local output directory")
  .option("-b, --builder <string>", "Template builder to use", "")
  .option("-f, --file [string]", "Get configuration from json file. Other flags will be discarded")
  .option("-w, --watch", "Watch files for changes.", false);

program.parse(process.argv);

const gen = Generator.from(program);

if (program.watch) {
  gen.watch();
} else {
  gen.buildSite();
}
