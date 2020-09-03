import Config from "./Config";
import Path from "./common/Path";
import * as fs from "fs";

export interface HtmlBuilder {
  buildPage(path: Path): Buffer
}

export function BuilderFactory(config: Config): HtmlBuilder {
  switch (config.builder) {
    default: return new DefaultBuilder(config.root, config.templateDir);
  }
}

export class DefaultBuilder implements HtmlBuilder {
  private root: string
  private templateDir: string

  constructor(root: string, templateDir: string) {
    this.root = root;
    this.templateDir = templateDir;
  }

  buildPage(path: Path): Buffer {
    return fs.readFileSync(path.absPath());
  }
}
