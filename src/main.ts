import Generator from "./Generator";
import {Command} from "commander";
import Config from "./Config";

const program = new Command();
program.version("0.0.1")
  .option("-r, --root <string>", "Root directory of html files", ".")
  .option("-t, --templates <string>", "Source directory of templates. Must be inside the root folder.", "templates")
  .option("-o, --out [string]", "Local output directory")
  .option("-b, --builder <string>", "Template builder to use", "")
  .option("-f, --file [string]", "Get configuration from json file. Other flags will be discarded");

program.parse(process.argv);

var gen = new Generator(Config.fromArgs(program));

gen.start(false);
