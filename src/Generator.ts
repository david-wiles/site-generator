import Config from "./Config";
import {Builder} from "./engines/Engines";
import Path from "./common/Path"
import * as utils from "./common/utils";
import * as fs from "fs";

export default class Generator {
  private root: Path;
  private out: Path;
  private builder: Builder;
  private config: Config;

  // TODO find a better data structure for this
  private templates = new Map<string, string[]>();

  constructor(config: Config) {
    this.setup(config);
    this.builder = new Builder(config, this.templates);
  }

  start(daemon: boolean) {
    utils.walkDir(this.root, this.walkTemplates.bind(this));

    if (daemon) {
      fs.watch(this.root.absPath(),
        {
          persistent: true,
          recursive: true
        },
        (event, filename) => {
          if (filename) {
            if (!fs.statSync(filename).isDirectory()) {
              this.recursiveRebuild(filename)
            }
          } else {
            console.error("Error:", event);
          }
        }
      );
    }
  }

  private recursiveRebuild(filename: string) {
    this.builder.rebuild(new Path(filename));
    this.templates.get(filename).forEach((tmpl) => {
      this.recursiveRebuild(tmpl);
    });
  }

  private walkTemplates(path: Path) {
    if (!path.absPath().startsWith(this.config.templates.absPath())) {
      if (fs.statSync(path.absPath()).isDirectory()) {
        utils.walkDir(path, this.walkTemplates.bind(this));
      } else {
        let outPath = new Path(this.out.absPath().concat(utils.trimPrefix(this.root.absPath(), path.absPath())));
        fs.mkdirSync(outPath.dir(), { recursive: true });
        fs.writeFile(
          this.out.absPath().concat(utils.trimPrefix(this.root.absPath(), path.absPath())),
          this.builder.build(path),
          err => { if (err) console.error("Error:", err); }
        );
      }
    }
  }

  private setup(config: Config) {
    this.config = config;
    this.root = config.root;
    this.out = config.out;
  }
}
