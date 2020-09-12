import * as utils from "./common/utils";
import * as fs from "fs";
import {EventEmitter} from "events";
import Config from "./common/Config";
import Builder from "./engines/Builder";
import Path from "./common/Path"
import {BufferPipeline, PipelineStep} from "./pipeline/BufferPipeline";
import {Command} from "commander";
import FileWriter from "./pipeline/FileWriter";

type LifecycleEvent = () => void;

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

    this.pipeline = BufferPipeline.from(
      new FileWriter(config)
    );
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
    this.emitter.emit("build:start");
    utils.walkDir<Array<Path>>(this.root, this.gatherPages.bind(this), new Array<Path>())
      .forEach(path => this.executePipeline(path, false));
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
            this.gatherDeps(file)
              .forEach(file => this.executePipeline(file, true));
          }
        } else {
          console.error("Error:", event);
        }
      }
    );
  }

  addStep(step: PipelineStep) {
    this.pipeline.add(step);
  }

  on(event: string, cb: LifecycleEvent) {
    this.emitter.on(event, cb);
  }

  // Build a page a path and then execute the BufferPipeline for the resulting buffer
  private executePipeline(path: Path, rebuild: boolean) {
    // Stop execution of pipeline for files located in template directory
    if (!path.absPath().startsWith(this.config.templates.absPath())) {
      let buf = this.builder.build(path, rebuild);
      this.pipeline.execute(buf, path);
    }
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
