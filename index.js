const Generator = require("./dist/Generator");
const HtmlMinifer = require("./dist/pipeline/HtmlMinifier");

module.exports = {
  Generator: Generator.default,
  HtmlMinifer: HtmlMinifer.default
};
