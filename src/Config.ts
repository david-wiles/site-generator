import commander from "commander";
import Path from "./common/Path";

export default class Config {
  root: Path;
  templates: Path;
  out: Path;
  builder: string;

  constructor(
    root: string,
    templates: string,
    out: string,
    builder: string,
  ) {
    this.root = new Path(root);
    this.templates = Path.fromParts(root, templates);
    this.out = new Path(out);
    this.builder = builder;
  }

  static fromArgs(args: commander.Command): Config {
    return new Config(
      args.root,
      args.templates,
      args.out,
      args.builder,
    );
  }
}