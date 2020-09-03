import commander from "commander";

export default class Config {
  root: string;
  templateDir: string
  out: string;
  builder: string;

  constructor(
    root: string,
    templateDir: string,
    out: string,
    builder: string,
  ) {
    this.root = root;
    this.templateDir = templateDir;
    this.out = out;
    this.builder = builder;
  }

  static fromArgs(args: commander.Command): Config {
    return new Config(
      args.root,
      args.templateDir,
      args.out,
      args.builder,
    );
  }

  getWriter(): string {
    return "";
  }
}
