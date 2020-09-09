import {PipelineStep} from "./BufferPipeline";
import Config from "../Config";

export function PipelineStepFactory(config: Config): PipelineStep[] {
  switch (config.steps) {
    default: return [];
  }
}
