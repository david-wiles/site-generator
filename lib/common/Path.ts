import * as path from "path";

/**
 * Path provides a convenient way to get an absolute path from a relative one and store info related to the path
 */
export default class Path {
  private abs: string
  private info: path.ParsedPath

  constructor(p: string) {
    if (!p) {
      console.error("oops");
    }
    this.abs = p.charAt(0) === "/" ?
      p : `${process.cwd()}/${p}`;

    this.info = path.parse(this.abs);
  }

  // Construct a path from parts of a string
  static fromParts(...parts: string[]): Path {
    parts.forEach((part, idx, arr) => {
      if (part[0] === "/" && idx != 0) {
        arr[idx] = part.substring(1);
      }
      if (part[part.length - 1] === "/") {
        arr[idx] = part.substring(0, part.length - 2);
      }
    });
    return new Path(parts.join("/"));
  }

  absPath(): string {
    return this.abs;
  }

  dir(): string {
    return this.info.dir;
  }

  base(): string {
    return this.info.base;
  }
}
