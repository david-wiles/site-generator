import Config from "../Config";
import MarkdownEngine from "./Markdown";

export interface Engine {
  executeEngine(buf: Buffer): Buffer
}

class DefaultEngine implements Engine {
  executeEngine(buf: Buffer): Buffer {
    return buf;
  }
}

// Return the markup engine to used based on configuration
export function EngineFactory(config: Config) {
  switch (config.builder) {
    case "md": return new MarkdownEngine(config);
    default: return new DefaultEngine();
  }
}
