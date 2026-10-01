// Totals of the original prototype (v0.1.0) for a range of settings.
// Any refactor of the model must keep reproducing these numbers.

const { test } = require("node:test");
const assert = require("node:assert/strict");

require("../data.js");
require("../model.js");

const BASE = { years: 5, km: 5000, petrol: 2.45, electricity: 0.25, freeCharging: true,
  ptPlan: "auto", peak: 0.3, batteryMode: "expected", packPrice: 900, lease: 900 };

const CASES = {
  defaults: {
    settings: BASE,
    plan: "dv",
    totals: { vmoto: 4513.5, pt: 6412.93, "scr-used": 10772.5, "scr-new": 12347.5, nc: 16880,
      nd: 25117.5, golf: 16388.75, tesla: 24402.5, "id7-buy": 43605, "id7-lease": 55125 },
  },
  short: {
    settings: { ...BASE, years: 1, km: 1000 },
    plan: "full",
    totals: { vmoto: 932.06, pt: 280, "scr-used": 1718.84, "scr-new": 1974.68, nc: 2432.69,
      nd: 4514.84, golf: 2466.09, tesla: 5200.46, "id7-buy": 10172.83, "id7-lease": 10845 },
  },
  heavy: {
    settings: { ...BASE, years: 10, km: 30000, petrol: 2.0, electricity: 0.4, freeCharging: false,
      ptPlan: "full", peak: 0.8, batteryMode: "worst", packPrice: 1200, lease: 700 },
    plan: "full",
    totals: { vmoto: 23453.2, pt: 100851.3, "scr-used": 50630, "scr-new": 53450.5, nc: 85235,
      nd: 98228.75, golf: 76007.5, tesla: 72305, "id7-buy": 103733.5, "id7-lease": 105600 },
  },
  wear: {
    settings: { ...BASE, years: 3, km: 12000, ptPlan: "dvr", peak: 0, batteryMode: "wear" },
    plan: "dvr",
    totals: { vmoto: 3521.21, pt: 7415.05, "scr-used": 10269.1, "scr-new": 11367.86, nc: 15557.22,
      nd: 20730.27, golf: 14616.26, tesla: 17993.88, "id7-buy": 31791.88, "id7-lease": 34020 },
  },
  long: {
    settings: { ...BASE, years: 8, km: 20000, petrol: 2.2, electricity: 0.3, ptPlan: "dv",
      peak: 0.5, packPrice: 800, lease: 1000 },
    plan: "dv",
    totals: { vmoto: 11955.2, pt: 44578.43, "scr-used": 32953, "scr-new": 35548.5, nc: 54889.76,
      nd: 64847.74, golf: 49030, tesla: 50782, "id7-buy": 79731.58, "id7-lease": 104640 },
  },
};

for (const [name, c] of Object.entries(CASES)) {
  test(`original totals: ${name}`, () => {
    const { results, plan } = CostModel.compute(c.settings);
    assert.equal(plan, c.plan);
    for (const r of results) {
      assert.ok(Math.abs(r.total - c.totals[r.v.id]) < 0.01, `${r.v.id}: ${r.total} != ${c.totals[r.v.id]}`);
    }
  });
}
