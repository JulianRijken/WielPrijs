const { test } = require("node:test");
const assert = require("node:assert/strict");

const app = require("./load");

test("the defaults survive a save and load unchanged", () => {
  const state = app.state.fresh();
  const loaded = app.state.normalize(JSON.parse(JSON.stringify(app.state.toStored(state))));
  assert.deepEqual(loaded, state);
});

test("an exported file can be imported again", () => {
  const state = app.state.fresh();
  const file = JSON.parse(app.state.toFile(state));
  assert.equal(file.app, "wielprijs");
  assert.equal(file.version, app.version);
  assert.deepEqual(app.state.normalize(file), state);
});

test("data that is not a WielPrijs state is rejected", () => {
  for (const data of [null, 42, "text", [], {}, { vehicles: "nope" }]) {
    assert.throws(() => app.state.normalize(data));
  }
});

test("unknown or mistyped settings fall back to the defaults", () => {
  const { settings } = app.state.normalize({ settings: { years: "ten", kmPerYear: 8000, colour: "red" }, vehicles: [] });
  assert.equal(settings.years, app.defaults.settings.years);
  assert.equal(settings.kmPerYear, 8000);
  assert.ok(!("colour" in settings));
});

test("broken vehicles are repaired", () => {
  const { vehicles } = app.state.normalize({ vehicles: [
    { id: "a", name: "Bike", color: "red", line: "wavy", blocks: [{ type: "insurance", perYear: 10 }, "junk", { perYear: 5 }] },
    { id: "a", name: { en: "Car", nl: "Auto" }, hidden: true },
    "not a vehicle",
  ] });
  assert.equal(vehicles.length, 2);
  assert.notEqual(vehicles[0].id, vehicles[1].id, "duplicate ids are replaced");
  assert.equal(vehicles[0].color, "#5b6b7b");
  assert.equal(vehicles[0].line, "solid");
  assert.deepEqual(vehicles[0].blocks, [{ type: "insurance", perYear: 10 }]);
  assert.deepEqual(vehicles[1].name, { en: "Car", nl: "Auto" });
  assert.equal(vehicles[1].hidden, true);
  assert.deepEqual(vehicles[1].blocks, []);
});
