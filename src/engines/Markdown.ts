import {Engine} from "./Engines";
import MarkdownIt from "markdown-it";
import Config from "../common/Config";

export default class MarkdownEngine implements Engine {
  private md: MarkdownIt;

  constructor(config: Config) {
    this.md = new MarkdownIt();
  }

  executeEngine(buf: Buffer): Buffer {
    return Buffer.from(this.md.render(buf.toString()));
  }
}
