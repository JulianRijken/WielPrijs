// Inflation, own price changes and present value ("value today").

const { test } = require("node:test");
const assert = require("node:assert/strict");

const app = require("./load");

const BASE = { years: 3, kmPerYear: 5000, petrol: 2, diesel: 2, electricity: 0.3, inflation: 0, interest: 0, view: "paid" };
const total = (blocks, settings = {}) => app.model.compute({ ...BASE, ...settings }, [{ id: "x", blocks }])[0].total;
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.01, `${actual} != ${expected}`);

test("inflation raises running costs from year 2 on", () => {
  near(total([{ type: "insurance", perYear: 100 }], { inflation: 10 }), 100 + 110 + 121);
});

test("a cost's own price change overrides inflation", () => {
  near(total([{ type: "roadTax", perYear: 100, priceChange: 0 }], { inflation: 10 }), 300);
  near(total([{ type: "roadTax", perYear: 100, priceChange: -10 }], { inflation: 10 }), 100 + 90 + 81);
});

test("a lease price is fixed per contract and renews at the prices of that time", () => {
  near(total([{ type: "lease", perMonth: 100, termYears: 2 }], { inflation: 10 }), 1200 + 1200 + 1452);
});

test("resale value follows inflation to the end of the period", () => {
  const keepsValue = [{ type: "purchase", price: 1000, resaleValue: 1000, resaleAge: 3, resaleKmPerYear: 5000 }];
  near(total(keepsValue, { inflation: 10 }), 1000 - 1331);
});

test("value today discounts each later payment by the interest", () => {
  const insurance = [{ type: "insurance", perYear: 100 }];
  near(total(insurance, { interest: 10, view: "today" }), 100 + 100 / 1.1 + 100 / 1.21);
  near(total(insurance, { interest: 10, view: "paid" }), 300);
});

test("with interest equal to inflation, value today equals today's prices", () => {
  near(total([{ type: "insurance", perYear: 100 }], { inflation: 5, interest: 5, view: "today" }), 300);
});

test("paying up front beats a fixed lease only when interest is low", () => {
  const buy = [{ type: "purchase", price: 3000, resaleValue: 0, minimumValue: 0 }];
  const lease = [{ type: "lease", perMonth: 1000 / 12, termYears: 3 }];
  const low = { interest: 0, view: "today" };
  const high = { interest: 10, view: "today" };
  near(total(buy, low), total(lease, low));
  assert.ok(total(lease, high) < total(buy, high));
});

test("the no-claim discount grows each claim-free year up to its maximum", () => {
  const insurance = [{ type: "insurance", perYear: 500, discountNow: 30, discountStep: 10, discountMax: 50 }];
  const full = 500 / 0.7;
  near(total(insurance, { years: 4 }), 500 + full * 0.6 + full * 0.5 + full * 0.5);
});
