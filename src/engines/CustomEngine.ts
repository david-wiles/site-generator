import {Engine} from "./Engines";
import Path from "../common/Path";
import * as fs from "fs";

export default class CustomEngine implements Engine {
  constructor() {}

  buildPage(buf: Buffer): Buffer {
    return buf;
  }
}
