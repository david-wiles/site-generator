import Config from "../Config";
import FileWriter from "./FileWriter";
import {PipelineStep} from "./BufferPipeline";

export function WriterFactory(config: Config): [PipelineStep] {
  switch (config.writer) {
    default: return [new FileWriter(config)];
  }
}
