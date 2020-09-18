import Path from "../common/Path";
import Config from "../common/Config";
import fs from "fs";
import {DataTemplate, StaticTemplate, Template} from "./Template";

/**
 * class Builder
 *
 * This is the implementation of the simple templating builder used by the program. Many different builder can also
 * be used with it to transform text markup into HTML
 */
export default class Builder {
  // Root directory of the templates used
  // This must be specified, and all templates must be stored under this directory. Any files in this directory
  // or its children will not be part of the buffer pipeline
  private templateDir: Path

  // KV Pairs for all templates or pages which are used by a certain template
  private deps: Map<string, Set<string>>;

  // Cache of all templates that have already been built
  // If a template or page is modified, that template will not be used from the cache
  // but any non-modified templates will still be used
  private cache = new Map<string, string>();

  constructor(config: Config, deps: Map<string, Set<string>>) {
    this.templateDir = config.templates;
    this.deps = deps;
  }

  /**
   * Build a page at a given path and return the page as a Buffer
   * @param {Path} path - the Path giving the location of the page to build
   * @param {boolean} useCache - represents whether this template or page should be rebuilt, meaning the cache should
   *                            be ignored
   * @returns {Buffer} - the fully built template or page
   */
  buildPage(path: Path, useCache: boolean): Buffer {
    let cached = this.cache.get(path.absPath());
    if (cached && useCache) {
      return Buffer.from(cached);
    }

    let text = fs.readFileSync(path.absPath()).toString();

    // Find layout template if this template is a decorator and replace the layout's decorator area with the template
    let layoutMatch = text.match(/{{\s*#replace#\s*"([.0-9a-zA-Z/]+)"\s*}}/);
    if (layoutMatch) {
      let layout = Path.fromParts(this.templateDir.absPath(), layoutMatch[1]);
      let templateStr = this.buildTemplates(layout, useCache);
      text = templateStr.replace(/{{\s*#replace#\s*}}/g, text.substring(layoutMatch[0].length));
      this.setTemplateDependency(path, layout);
    }

    return Buffer.from(this.buildDependencies(text, path, useCache));
  }

  /**
   * Builds a template. Works similar to build except layout templates are not parsed
   * @param {string} path
   * @param {boolean} useCache
   * @returns string
   */
  buildTemplates(path: Path, useCache: boolean): string {
    let cached = this.cache.get(path.absPath());
    if (cached && !useCache) {
      return cached;
    }

    let text = fs.readFileSync(path.absPath()).toString();

    return this.buildDependencies(text, path, useCache);
  }

  // Set the current template as a dependency for the page or template currently being built
  setTemplateDependency(path: Path, tmpl: Path) {
    let parent = this.deps.get(tmpl.absPath());
    if (parent === undefined) {
      this.deps.set(tmpl.absPath(), new Set<string>([path.absPath()]));
    } else {
      parent.add(path.absPath());
    }
  }

  // Build all the templates contained in the text string
  private buildDependencies(text: string, path: Path, useCache: boolean): string {
    let templates = this.gatherTemplates(text);

    templates.forEach((tmpl) => {
      tmpl.setAsDependency(path);
      text = tmpl.build(text, useCache);
    });

    this.cache.set(path.absPath(), text);
    return text;
  }

  // Get an array of all the templates found in a given string
  private gatherTemplates(text: string): Array<Template> {
    let templates = new Array<Template>();
    let matches = text.matchAll(/{{\s*template\s*"([.0-9a-zA-Z/-]+)"\s*"?([.0-9a-zA-Z/-]+)?"?\s*}}/g);
    let result = matches.next();

    while (!result.done) {
      if (result.value[2]) {
        templates.push(new DataTemplate(
          this.templateDir,
          Path.fromParts(this.templateDir.absPath(), result.value[1]),
          Path.fromParts(this.templateDir.absPath(), result.value[2]),
          this
        ));
      } else {
        templates.push(new StaticTemplate(
          this.templateDir,
          Path.fromParts(this.templateDir.absPath(), result.value[1]),
          this
        ));
      }
      result = matches.next();
    }

    return templates;
  }
}
