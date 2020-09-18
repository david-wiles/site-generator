import * as utils from "./common/utils";
import * as fs from "fs";
import {EventEmitter} from "events";
import Config from "./common/Config";
import Builder from "./builder/Builder";
import Path from "./common/Path"
import {BufferPipeline, PipelineStep} from "./pipeline/BufferPipeline";
import {Command} from "commander";
import FileWriter from "./pipeline/FileWriter";
import Logger from "./Logger";

/**
 * class Generator
 * The Generator is the facade object which orchestrates the template builder and pipelines.
 */
export default class Generator {
  private emitter: EventEmitter;

  private root: Path;
  private out: Path;

  private config: Config;
  private builder: Builder;

  private pipeline: BufferPipeline;

  private deps = new Map<string, Set<string>>();

  constructor(config: Config) {
    this.emitter = new EventEmitter();

    this.config = config;
    this.root = config.root;
    this.out = config.out;

    this.builder = new Builder(config, this.deps);

    this.pipeline = new BufferPipeline();

    // Register log messages on lifecycle events
    this.emitter.on("build:start", () => Logger.info("Starting build process..."));
    this.emitter.on("build:done", () => Logger.info("Finished building files"));
    this.emitter.on("watch:start", () => Logger.info("Watching files for changes..."));
    this.emitter.on("watch:rebuild", (filename) => Logger.progress(`\tRebuilding ${filename}`));
    this.emitter.on("pipeline:start", (filename) => Logger.progress(`\tBuilding page at ${filename.absPath()}...`));
    this.emitter.on("pipeline:finished", (filename) => Logger.progress(`\tFinished building page at ${filename.absPath()}`));
  }

  // Creates a generator from a commander object
  static from(program: Command): Generator {
    return new Generator(Config.fromArgs(program));
  }

  /**
   * Start the site generator. This will build the entire site from scratch and then listen for file changes if
   * the daemon flag is set. On file change, all pages which depend on a template will be rebuilt.
   */
  buildSite() {
    // Finalize pipeline by adding output
    this.pipeline.add(new FileWriter(this.config));
    this.emitter.emit("build:start");
    utils.walkDir<Array<Path>>(this.root, this.gatherPages.bind(this), new Array<Path>())
      .forEach(path => this.executePipeline(path, true));
    this.emitter.emit("build:done");
  }

  watch(): void {
    this.buildSite();
    this.emitter.emit("watch:start");
    fs.watch(
      this.root.absPath(),
      {
        persistent: true,
        recursive: true
      },
      (event, filename) => {
        if (filename) {
          let file = Path.fromParts(this.root.absPath(), filename);
          if (!fs.statSync(file.absPath()).isDirectory()) {
            this.emitter.emit("watch:rebuild", filename);
            this.gatherDeps(file)
              .forEach(file => this.executePipeline(file, false));
          }
        } else {
          Logger.error(`Error: ${event}`);
        }
      }
    );
  }

  addStep(step: PipelineStep) {
    this.pipeline.add(step);
  }

  on(event: string, cb) {
    this.emitter.on(event, cb);
  }

  // Build a page a path and then execute the BufferPipeline for the resulting buffer
  private executePipeline(path: Path, useCache: boolean) {
    this.emitter.emit("pipeline:start", path);
    // Stop execution of pipeline for files located in template directory
    if (!path.absPath().startsWith(this.config.templates.absPath())) {
      let buf = this.builder.buildPage(path, useCache);
      this.pipeline.execute(buf, path);
    }
    this.emitter.emit("pipeline:finished", path);
  }

  // Gather all dependencies for a file
  private gatherDeps(file: Path): Path[] {
    let paths = new Array<Path>();

    if (!file.absPath().startsWith(this.config.templates.absPath())) {
      paths.push(file);
    }

    // TODO detect circular dependencies
    this.deps.get(file.absPath())?.forEach(dep => paths.push(...this.gatherDeps(new Path(dep))));

    return paths;
  }

  // Gather all pages to build by walking all files in the root directory, excluding the ones in the template folder
  private gatherPages(path: Path, paths: Array<Path>): Array<Path> {
    if (!path.absPath().startsWith(this.config.templates.absPath())) {
      if (fs.statSync(path.absPath()).isDirectory()) {
        paths = utils.walkDir(path, this.gatherPages.bind(this), paths);
      } else {
        if (path.absPath().endsWith(".html")) {
          paths.push(path);
        }
      }
    }
    return paths;
  }
}
