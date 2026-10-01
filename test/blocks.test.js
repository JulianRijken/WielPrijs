const { test } = require("node:test");
const assert = require("node:assert/strict");

const app = require("./load");

const SETTINGS = { years: 4, kmPerYear: 10000, petrol: 2, diesel: 1.8, electricity: 0.3 };
const run = (blocks, settings = SETTINGS) => app.model.compute(settings, [{ id: "x", blocks }])[0];

test("params fills in defaults for missing fields", () => {
  const p = app.blocks.params({ type: "purchase", price: 1000 });
  assert.equal(p.price, 1000);
  assert.equal(p.resaleAge, 5);
  assert.equal(p.minimumValue, null);
});

test("the line starts with upfront costs and ends at the total", () => {
  const r = run([
    { type: "purchase", price: 5000, fees: 100, resaleValue: 2500, resaleKmPerYear: 10000 },
    { type: "insurance", perYear: 300 },
  ]);
  assert.equal(r.line.length, SETTINGS.years + 2);
  assert.equal(r.line[0], 5100);
  assert.equal(r.line[4], 5100 + 4 * 300);
  assert.equal(r.line.at(-1), r.total);
  assert.ok(Math.abs(app.model.sum(Object.values(r.breakdown)) - r.total) < 1e-9);
});

test("unknown block types are skipped", () => {
  const r = run([{ type: "teleporter", perYear: 1e6 }, { type: "insurance", perYear: 100 }]);
  assert.equal(r.total, 400);
});

test("a vehicle without blocks costs nothing", () => {
  assert.deepEqual(run([]).line, [0, 0, 0, 0, 0, 0]);
});

test("purchase never drops below its minimum value", () => {
  const r = run([{ type: "purchase", price: 1000, resaleValue: 1, minimumValue: 300 }]);
  assert.equal(r.total, 700);
});

test("purchase handles a free vehicle", () => {
  assert.equal(run([{ type: "purchase", price: 0, resaleValue: 0 }]).total, 0);
});

test("energy uses the global price unless the vehicle has its own", () => {
  assert.equal(run([{ type: "energy", source: "diesel", per100km: 5 }]).total, 4 * 100 * 5 * 1.8);
  assert.equal(run([{ type: "energy", source: "electricity", per100km: 5, ownPrice: 0 }]).total, 0);
});

test("extra costs land at the start, every year, or in one year", () => {
  assert.deepEqual(run([{ type: "extra", amount: 50, when: "start" }]).line, [50, 50, 50, 50, 50, 50]);
  assert.deepEqual(run([{ type: "extra", amount: 50, when: "yearly" }]).line, [0, 50, 100, 150, 200, 200]);
  assert.deepEqual(run([{ type: "extra", amount: 50, when: "once", year: 2 }]).line, [0, 0, 50, 50, 50, 50]);
});

test("battery packs are replaced in the worst-case year", () => {
  const r = run([{ type: "battery", packs: 2, packPrice: 500, scenario: "worst", failureYear: 2, resaleShare: 0 }]);
  assert.deepEqual(r.line, [0, 0, 1000, 1000, 1000, 1000]);
  assert.deepEqual(r.notes, [{ key: "notes.batteryFailed", params: { year: 2 } }]);
});

test("transit on auto picks the cheapest plan", () => {
  const heavy = run([{ type: "transit", plan: "auto", peakShare: 0 }], { ...SETTINGS, kmPerYear: 30000 });
  assert.equal(heavy.notes[0].params.plan.key, "blocks.transit.options.plan.offPeakFree");
  const light = run([{ type: "transit", plan: "auto" }], { ...SETTINGS, kmPerYear: 100 });
  assert.equal(light.notes[0].params.plan.key, "blocks.transit.options.plan.full");
});
