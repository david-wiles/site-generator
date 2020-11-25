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
