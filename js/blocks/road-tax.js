// Motorrijtuigenbelasting (MRB).

WielPrijs.blocks.register({
  type: "roadTax",
  category: "tax",
  fields: [
    { key: "perYear", kind: "money", default: 0, unit: "perYear" },
  ],
  compute(p, ctx) {
    return { yearly: ctx.eachYear(() => p.perYear) };
  },
});
