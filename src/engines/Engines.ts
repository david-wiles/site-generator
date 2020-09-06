import Path from "../common/Path";
import Config from "../Config";
import CustomEngine from "./CustomEngine";
import * as utils from "../common/utils";
import * as fs from "fs";
import MarkdownEngine from "./Markdown";
import escapeStringRegexp from "escape-string-regexp";

export interface Engine {
  buildPage(buf: Buffer): Buffer
}

export class Builder {
  private root: Path
  private templateDir: Path
  private engine: Engine

  // Map of all templates that depend on a certain template
  private parents: Map<string, string[]>;

  // Cache of all templates that have been built x
  private tmplCache = new Map<string, Buffer>();

  constructor(config: Config, parents: Map<string, string[]>) {
    this.root = config.root;
    this.templateDir = config.templates;
    this.engine = EngineFactory(config);
    this.parents = parents;
  }

  build(path: Path): Buffer {
    let data = fs.readFileSync(path.absPath());
    let fileStr = data.toString();
    let dependents = this.gatherDependents(data);

    dependents.forEach((tmpl) => {
      let parent = this.parents.get(tmpl.absPath());
      if (parent === undefined) {
        this.parents.set(tmpl.absPath(), [path.absPath()]);
      } else {
        parent.push(path.absPath());
      }

      let templateStr = this.build(tmpl).toString();
      let re = new RegExp(`{{\\s*template\\s*"${escapeStringRegexp(this.getRelativeTmplPath(tmpl))}"\\s*}}`, 'g');
      fileStr = fileStr.replace(re, templateStr);
    });

    // Find layout template if this template is a decorator and replace the layout's decorator area with the template
    let layoutMatch = fileStr.match(/{{\s*#replace#\s*"([.0-9a-zA-Z/]+)"\s*}}/);
    if (layoutMatch) {
      let templateStr = this.build(Path.fromParts(this.templateDir.absPath(), layoutMatch[1])).toString();
      fileStr = templateStr.replace(/{{\s*#replace#\s*}}/g, fileStr.substring(layoutMatch[0].length));
    }

    let cached = this.tmplCache.get(path.absPath());
    if (!cached) {
      let buf = this.engine.buildPage(Buffer.from(fileStr));
      this.tmplCache.set(path.absPath(), buf);
      return buf;
    } else {
      return cached;
    }
  }

  rebuild(path: Path): Buffer {
    this.tmplCache.set(path.absPath(), undefined);
    return this.build(path);
  }

  private gatherDependents(data: Buffer): Path[] {
    let paths = new Array<Path>();
    let str = data.toString();
    let matches = str.toString().matchAll(/{{\s*template\s*"([.0-9a-zA-Z/]+)"\s*}}/g);
    let result = matches.next();

    while (!result.done) {
      paths.push(Path.fromParts(this.templateDir.absPath(), result.value[1]));
      result = matches.next();
    }

    return paths;
  }

  private getRelativeTmplPath(tmpl: Path): string {
    let path = utils.trimPrefix(this.templateDir.absPath(), tmpl.absPath())
    return path.startsWith("/") ?
      path.substring(1) :
      path;
  }
}

function EngineFactory(config: Config) {
  switch (config.builder) {
    case "md": return new MarkdownEngine();
    default: return new CustomEngine();
  }
}
