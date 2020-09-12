import commander from "commander";
import Path from "./Path";

export default class Config {
  root: Path;
  templates: Path;
  out: Path;
  watch: boolean;
  builder: string;
  writer: string;
  steps: string;

  constructor(
    root: string,
    templates: string,
    out: string,
    watch: boolean,
    builder: string,
    writer: string,
    steps: string
) {
    this.root = new Path(root);
    this.templates = Path.fromParts(root, templates);
    this.out = new Path(out);
    this.watch = watch;
    this.builder = builder;
    this.writer = writer;
    this.steps = steps;
  }

  static fromArgs(args: commander.Command): Config {
    return new Config(
      args.root,
      args.templates,
      args.out,
      args.watch,
      args.builder,
      args.writer,
      args.steps
    );
  }
}
