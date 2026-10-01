// The ten vehicles of the original prototype (v0.1.0), expressed as cost blocks.
// Kept separate from js/defaults.js so the defaults can change freely.

const owned = (o) => [
  { type: "purchase", price: o.p, fees: o.r, resaleValue: o.rv, valueLossPerKm: o.d, minimumValue: o.floor ?? null },
  { type: "insurance", perYear: o.i },
  { type: "roadTax", perYear: o.t },
  { type: "energy", source: o.fuel, per100km: o.c },
  { type: "maintenance", perYear: o.f, perKm: o.k },
];

module.exports = [
  { id: "vmoto", blocks: [
    { type: "purchase", price: 2848, fees: 0, resaleValue: 900, valueLossPerKm: 0.01 },
    { type: "insurance", perYear: 324 },
    { type: "energy", source: "electricity", per100km: 3.5, ownPrice: 0 },
    { type: "maintenance", perYear: 40, perKm: 0.022 },
    { type: "battery", packs: 2, packPrice: 900, scenario: "expected" },
  ] },
  { id: "pt", blocks: [{ type: "transit", farePerKm: 0.28, plan: "auto", peakShare: 30 }] },
  { id: "scr-used", blocks: owned({ p: 5750, r: 150, i: 456, t: 156, fuel: "petrol", c: 3.4, f: 260, k: 0.052, rv: 3000, d: 0.035 }) },
  { id: "scr-new", blocks: owned({ p: 7845, r: 0, i: 540, t: 156, fuel: "petrol", c: 3.4, f: 280, k: 0.052, rv: 3900, d: 0.04 }) },
  { id: "nc", blocks: owned({ p: 9500, r: 150, i: 540, t: 496, fuel: "petrol", c: 8.0, f: 700, k: 0.032, rv: 7500, d: 0.03 }) },
  { id: "nd", blocks: owned({ p: 32000, r: 150, i: 840, t: 496, fuel: "petrol", c: 7.0, f: 400, k: 0.032, rv: 21000, d: 0.04 }) },
  { id: "golf", blocks: owned({ p: 3000, r: 20, i: 420, t: 600, fuel: "petrol", c: 7.5, f: 750, k: 0.03, rv: 1200, d: 0.01, floor: 400 }) },
  { id: "tesla", blocks: owned({ p: 21000, r: 150, i: 1080, t: 780, fuel: "electricity", c: 17, f: 380, k: 0.032, rv: 10000, d: 0.04 }) },
  { id: "id7-buy", blocks: owned({ p: 48990, r: 0, i: 1320, t: 1128, fuel: "electricity", c: 18, f: 250, k: 0.035, rv: 21000, d: 0.06 }) },
  { id: "id7-lease", blocks: [
    { type: "lease", perMonth: 900 },
    { type: "energy", source: "electricity", per100km: 18 },
  ] },
];
