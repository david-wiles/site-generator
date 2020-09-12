import Path from "../common/Path";
import Config from "../common/Config";
import fs from "fs";
import escapeStringRegexp from "escape-string-regexp";
import * as utils from "../common/utils";
import {Engine, EngineFactory} from "./Engines";

/**
 * class Builder
 *
 * This is the implementation of the simple templating engine used by the program. Many different engines can also
 * be used with it to transform text markup into HTML
 */
export default class Builder {
  // Root directory of the templates used
  // This must be specified, and all templates must be stored under this directory. Any files in this directory
  // or its children will not be part of the buffer pipeline
  private templateDir: Path
  // Markup engine instance
  private engine: Engine

  // KV Pairs for all templates or pages which are used by a certain template
  private deps: Map<string, Set<string>>;

  // Cache of all templates that have already been built
  // If a template or page is modified, that template will not be used from the cache
  // but any non-modified templates will still be used
  private tmplCache = new Map<string, Buffer>();

  constructor(config: Config, deps: Map<string, Set<string>>) {
    this.templateDir = config.templates;
    this.deps = deps;
    this.engine = EngineFactory(config);
  }

  /**
   * Build a page at a given path and return the page as a Buffer
   * @param {Path} path - the Path giving the location of the page to build
   * @param {boolean} rebuild - represents whether this template or page should be rebuilt, meaning the cache should
   *                            be ignored
   * @returns {Buffer} - the fully built template or page
   */
  build(path: Path, rebuild: boolean): Buffer {
    let cached = this.tmplCache.get(path.absPath());
    if (cached && !rebuild) {
      return cached;
    }

    let data = fs.readFileSync(path.absPath());
    let fileStr = data.toString();
    let dependents = this.gatherDependents(data);

    dependents.forEach((tmpl) => {
      this.setTemplateDependency(path, tmpl);
      fileStr = this.pasteTemplate(tmpl, fileStr, rebuild);
    });

    fileStr = this.replaceTemplate(path, fileStr, rebuild);

    let buf = this.engine.executeEngine(Buffer.from(fileStr));
    this.tmplCache.set(path.absPath(), buf);
    return buf;
  }

  // Parse the template and gather the paths for all templates used on the page
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

  // Set the current template as a dependency for the page or template currently being built
  private setTemplateDependency(path: Path, tmpl: Path) {
    let parent = this.deps.get(tmpl.absPath());
    if (parent === undefined) {
      this.deps.set(tmpl.absPath(), new Set<string>([path.absPath()]));
    } else {
      parent.add(path.absPath());
    }
  }

  // Get the path to the template based on the currently set template directory
  private getRelativeTmplPath(tmpl: Path): string {
    let path = utils.trimPrefix(this.templateDir.absPath(), tmpl.absPath())
    return path.startsWith("/") ?
      path.substring(1) :
      path;
  }

  // Paste the template into the current page
  private pasteTemplate(tmpl: Path, page: string, rebuild: boolean): string {
    let templateStr = this.build(tmpl, rebuild).toString();
    let re = new RegExp(`{{\\s*template\\s*"${escapeStringRegexp(this.getRelativeTmplPath(tmpl))}"\\s*}}`, 'g');
    return page.replace(re, templateStr);
  }

  // Paste the current page into the given template
  private replaceTemplate(path: Path, page: string, rebuild: boolean): string {
    // Find layout template if this template is a decorator and replace the layout's decorator area with the template
    let layoutMatch = page.match(/{{\s*#replace#\s*"([.0-9a-zA-Z/]+)"\s*}}/);
    if (layoutMatch) {
      let layout = Path.fromParts(this.templateDir.absPath(), layoutMatch[1]);
      let templateStr = this.build(layout, rebuild).toString();
      page = templateStr.replace(/{{\s*#replace#\s*}}/g, page.substring(layoutMatch[0].length));
      this.setTemplateDependency(path, layout);
      return page;
    } else {
      return page;
    }
  }
}
