import Path from "../common/Path";
import Config from "../Config";
import fs from "fs";
import * as utils from "../common/utils";
import {PipelineStep} from "./BufferPipeline";

export default class FileWriter implements PipelineStep {
  private out: Path;
  private root: Path;

  constructor(config: Config) {
    this.out = config.out;
    this.root = config.root;
  }

  execute(buf: Buffer, inPath: Path) {
    let outPath = new Path(this.out.absPath().concat(utils.trimPrefix(this.root.absPath(), inPath.absPath())));
    fs.mkdirSync(outPath.dir(), { recursive: true });
    fs.writeFile(outPath.absPath(), buf, err => { if (err) console.error("Error:", err); });
    return buf;
  }
}