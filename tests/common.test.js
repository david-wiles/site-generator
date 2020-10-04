const utils = require("../dist/common/utils");
const Path = require("../dist/common/Path").default;

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

describe("relativePath returns the correct file path", () => {
  test("relative path that contains the root will return relative path", () => {
    expect(utils.relativePath(new Path("/usr/bin"), new Path("/usr/bin/openssl"))).toBe("openssl");
    expect(utils.relativePath(new Path("/abc/def"), new Path("/abc/def/g/hij"))).toBe("g/hij");
    expect(utils.relativePath(new Path("/abc/def"), new Path("/abc/def/g/hij/lmno"))).toBe("g/hij/lmno");
  });
  test("relative path not in root will throw error", () => {
    expect(() => utils.relativePath(new Path("/abc/def"), new Path("/ghi/jkl"))).toThrow();
    expect(() => utils.relativePath(new Path("/asdf/qwer/asdf"), new Path("/qwer/erty/asdf"))).toThrow();
  });
});
