import Config from "./Config";
import Builder from "./engines/Builder";
import Path from "./common/Path"
import * as utils from "./common/utils";
import * as fs from "fs";
import {BufferPipeline} from "./pipeline/BufferPipeline";
import {WriterFactory} from "./pipeline/writers";
import {PipelineStepFactory} from "./pipeline/steps";

/**
 * class Generator
 * The Generator is the facade object which orchestrates the template builder and pipelines.
 */
export default class Generator {
  private root: Path;
  private out: Path;
  private config: Config;

  private builder: Builder;
  private pipeline: BufferPipeline;

  private paths = new Array<Path>();

  // TODO find a better data structure for this
  private tmplDependencies = new Map<string, string[]>();

  constructor(config: Config) {
    this.config = config;
    this.root = config.root;
    this.out = config.out;

    this.builder = new Builder(config, this.tmplDependencies);

    this.pipeline = new BufferPipeline();
    this.pipeline.add(...WriterFactory(config));
    this.pipeline.add(...PipelineStepFactory(config));
  }

  /**
   * Start the site generator. This will build the entire site from scratch and then listen for file changes if
   * the daemon flag is set. On file change, all pages which depend on a template will be rebuilt.
   * @param daemon
   */
  start(daemon: boolean) {
    utils.walkDir(this.root, this.gatherPages.bind(this));
    this.paths.forEach(path => this.executePipeline(path, false));

    if (daemon) {
      fs.watch(this.root.absPath(),
        { persistent: true,
          recursive: true },
        (event, filename) => {
          if (filename) {
            if (!fs.statSync(filename).isDirectory()) {
              this.recursiveRebuild(filename);
            }
          } else {
            console.error("Error:", event);
          }
        }
      );

      // Exit on exception
      while (true);
    }
  }

  // Build a page a path and then execute the BufferPipeline for the resulting buffer
  private executePipeline(path: Path, rebuild: boolean) {
    let buf = this.builder.build(path, rebuild);
    this.pipeline.execute(buf, path);
  }

  // Rebuild a page or template and also rebuild any pages which are dependent on it
  private recursiveRebuild(filename: string) {
    this.executePipeline(new Path(filename), true);
    this.tmplDependencies.get(filename)
      .forEach(tmpl => this.recursiveRebuild(tmpl));
  }

  // Gather all pages to build by walking all files in the root directory, excluding the ones in the template folder
  private gatherPages(path: Path) {
    if (!path.absPath().startsWith(this.config.templates.absPath())) {
      if (fs.statSync(path.absPath()).isDirectory()) {
        utils.walkDir(path, this.gatherPages.bind(this));
      } else {
        this.paths.push(path);
      }
    }
  }
}
