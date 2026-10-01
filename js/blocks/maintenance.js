// Service, APK and repairs. The fixed part grows as the vehicle ages:
// each year adds `ageing` percent of the first year's amount.

WielPrijs.blocks.register({
  type: "maintenance",
  category: "upkeep",
  fields: [
    { key: "perYear", kind: "money", default: 0, unit: "perYear", hint: true },
    { key: "perKm", kind: "money", default: 0, step: 0.001, unit: "perKm", hint: true },
    { key: "ageing", kind: "percent", default: 5, advanced: true, hint: true },
  ],
  compute(p, ctx) {
    return {
      yearly: ctx.eachYear((year) => p.perYear * (1 + (p.ageing / 100) * (year - 1)) + ctx.kmPerYear * p.perKm),
    };
  },
});
