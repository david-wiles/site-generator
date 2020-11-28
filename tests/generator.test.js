const fs = require("fs")
const path = require("path");
const {buildDir, build} = require("..");

describe("buildDir creates a website", () => {
  let reference = path.join(__dirname, "reference");
  let testOutput = path.join(__dirname, "test_output");
  let testData = path.join(__dirname, "data");

  beforeEach(() => {
    buildDir(testData, testOutput);
  });

  afterEach(() => {
    fs.rmdirSync(testOutput, { recursive: true });
  });

  test("build outputs a valid site", () => {
    expect(fs.readFileSync(path.join(testOutput, "index.html")).toString()).toBe(fs.readFileSync(path.join(reference, "index.html")).toString());
  });
});

describe("build outputs html", () => {
  let reference = path.join(__dirname, "reference");
  let testData = path.join(__dirname, "data");

  test("build creates an html file", async () => {
    let got = await build(path.join(testData, "index.html"), path.join(testData, "/templates"));
    expect(got.toString()).toBe(fs.readFileSync(path.join(reference, "index.html")).toString());
  });

});
