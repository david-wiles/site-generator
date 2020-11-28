const Generator = require("./lib/generator");
const Template = require("./lib/template");

module.exports = {
  build: Template.build,
  buildDir: Generator.buildDir,
  watch: Generator.watch
};
