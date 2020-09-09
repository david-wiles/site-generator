import Path from "../common/Path";

export interface PipelineStep {
  execute(buf: Buffer, path: Path): Buffer
}

export class BufferPipeline {
  private steps = new Array<PipelineStep>();

  add(...step: PipelineStep[]) {
    this.steps.push(...step);
  }

  execute(buf: Buffer, path: Path) {
    this.steps.forEach((step) => {
      buf = step.execute(buf, path);
    });
  }
}
