import Path from "../common/Path";
import escapeStringRegexp from "escape-string-regexp";
import * as utils from "../common/utils";
import Builder from "./Builder";

import * as fs from "fs";

export interface Template {
  path: Path
  build(page: string, useCache: boolean): string
  setAsDependency(path: Path)
}

export class StaticTemplate implements Template {
  path: Path

  private tmplDir: Path
  private text: string

  private builder: Builder

  constructor(tmplDir: Path, path: Path, builder: Builder) {
    this.tmplDir = tmplDir;
    this.path = path;
    this.builder = builder;
  }

  build(page: string, useCache: boolean): string {
    let text = this.builder.buildTemplates(this.path, useCache);
    let re = new RegExp(`{{\\s*template\\s*"${escapeStringRegexp(utils.relativePath(this.tmplDir, this.path))}"\\s*}}`, 'g');
    return page.replace(re, text);
  }

  setAsDependency(path: Path) {
    this.builder.setTemplateDependency(path, this.path);
  }
}

export class DataTemplate implements Template {
  path: Path

  private tmplDir: Path
  private text: string
  private data: any
  private dataPath: Path;

  private builder: Builder

  constructor(tmplDir: Path, path: Path, dataPath: Path, builder: Builder) {
    this.tmplDir = tmplDir;
    this.path = path;
    this.dataPath = dataPath;
    this.data = JSON.parse(fs.readFileSync(dataPath.absPath()).toString());
    this.builder = builder;
  }

  build(page: string): string {
    let text = this.builder.buildTemplates(this.path, false);

    // Replace placeholders with data from json string
    for (const [key, val] of Object.entries(this.data)) {
      let re = new RegExp(`{{\\s*${escapeStringRegexp(key)}\\s*}}`, 'g');
      text = text.replace(re, val.toString());
    }

    text = this.builder.buildDependencies(text, this.dataPath, false);

    let re = new RegExp(`{{\\s*template\\s*"${escapeStringRegexp(utils.relativePath(this.tmplDir, this.path))}"\\s*"${escapeStringRegexp(utils.relativePath(this.tmplDir, this.dataPath))}"\\s*}}`, 'g')
    return page.replace(re, text);
  }

  setAsDependency(path: Path) {
    this.builder.setTemplateDependency(path, this.path);
    this.builder.setTemplateDependency(path, this.dataPath);
  }
}
