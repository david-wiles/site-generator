#!/usr/bin/env node
const path = require("path");
const {Command} = require("commander");
const cmd = require("..");

const program = new Command();
program.version("0.0.2")
  .option("-r, --root <string>", "Root directory of html files", ".")
  .option("-o, --out [string]", "Local output directory")
  .option("-w, --watch", "Watch files for changes.", false)

program.parse(process.argv);

const root = path.join(process.cwd(), program.root);
const out = path.join(process.cwd(), program.out);

cmd.buildDir(root, out);

if (program.watch) {
  cmd.watch(root, out);
}
