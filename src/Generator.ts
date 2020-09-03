import Config from "./Config";
import {HtmlBuilder, BuilderFactory} from "./Builders";
import Path from "./common/Path"
import * as Utils from "./common/Utils";
import * as fs from "fs";

type WalkFn = (path: Path) => void;

export default class Generator {
  private root: Path;
  private out: Path;
  private builder: HtmlBuilder;

  constructor(config: Config) {
    this.setup(config);
    this.builder = BuilderFactory(config);
  }

  generateSite() {
    this.walkDir(this.root, (path) => {
      let buf = this.builder.buildPage(path);
      let outPath = Path.fromParts(
        this.out.absPath(),
        Utils.TrimPrefix(this.root.absPath(), path.absPath())
      );
      if (!fs.existsSync(outPath.dir())) {
        fs.mkdirSync(outPath.dir(), { recursive: true });
      }
      fs.writeFileSync(outPath.absPath(), buf);
    });
  }

  private walkDir(dir: Path, walkFn: WalkFn) {
    fs.readdir(dir.absPath(), (err, entries) => {
      if (err) console.error(err);
      else {
        entries.forEach((entry) => {
          let f = Path.fromParts(dir.absPath(), entry);
          let stat = fs.statSync(f.absPath());
          if (stat.isDirectory()) {
            this.walkDir(f, walkFn);
          } else {
            walkFn(f);
          }
        });
      }
    });
  }

  private setup(config: Config) {
    this.root = new Path(config.root);
    this.out = new Path(config.out);
  }
}
