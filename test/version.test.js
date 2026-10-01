const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const app = require("./load");

test("version matches the latest release in CHANGELOG.md", () => {
  const changelog = fs.readFileSync(path.join(__dirname, "..", "CHANGELOG.md"), "utf8");
  const latest = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m)?.[1];
  assert.equal(app.version, latest);
});
