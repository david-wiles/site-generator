import {PipelineStep} from "./BufferPipeline";
import Path from "../common/Path";
import {minify} from "html-minifier";

export default class HtmlMinifier implements PipelineStep {
  execute(buf: Buffer, path: Path): Buffer {
    return Buffer.from(minify(buf.toString()));
  }
}
