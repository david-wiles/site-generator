import {Engine} from "./Engines";
import Path from "../common/Path";
import MarkdownIt from "markdown-it";
import * as fs from "fs";

export default class MarkdownEngine implements Engine {
  private md: MarkdownIt;

  constructor() {}

  buildPage(buf: Buffer): Buffer {
    return Buffer.from(this.md.render(buf.toString()));
  }
}
