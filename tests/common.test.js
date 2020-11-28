const utils = require("../lib/util");

describe("trimPrefix removes leading characters from a string", () => {

  test("prefix longer than string returns string", () => {
    expect(utils.trimPrefix("/usr/bin/", "bin/")).toBe("bin/");
    expect(utils.trimPrefix("abcd", "abc")).toBe("abc");
    expect(utils.trimPrefix("a", "")).toBe("");
    expect(utils.trimPrefix("abcd", "abcde")).not.toBe("abcde");
  });

  test("prefix shorter than string returns suffix", () => {
    expect(utils.trimPrefix("abc", "abcd")).toBe("d");
    expect(utils.trimPrefix("", "abcd")).toBe("abcd");
  });

  test("no prefix returns full string", () => {
    expect(utils.trimPrefix("abc", "efgabc")).toBe("efgabc");
    expect(utils.trimPrefix("qqq", "qpla")).toBe("qpla");
  })
});

describe("newPath creates a path from a list of parts", () => {
  test("joins path parts", () => {
    expect(utils.newPath("/usr", "/local/bin")).toBe("/usr/local/bin");
    expect(utils.newPath("usr", "/local/bin")).toBe("usr/local/bin");
    expect(utils.newPath("abc/abc", "abc")).toBe("abc/abc/abc");
    expect(utils.newPath("abc", "abc", "abc", "abc")).toBe("abc/abc/abc/abc");
    expect(utils.newPath("abc", "abc/")).toBe("abc/abc");
  });
});

describe("relPath gets the path relative to a base path", () => {
  test("relPath gets the path if it exists", () => {
    expect(utils.relPath("/qwerty/", "/qwerty/asdfg/file.txt")).toBe("asdfg/file.txt");
    expect(utils.relPath("home/david/site-generator", "home/david/site-generator/src/f.js")).toBe("src/f.js");
  });

  test("relPath throws error if isn't part of the base directory", () => {
    expect(() => utils.relPath("asdf/qwer", "qwer/asdf")).toThrow();
  });
});
