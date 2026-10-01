WielPrijs.blocks.register({
  type: "insurance",
  category: "insurance",
  fields: [
    { key: "perYear", kind: "money", default: 0, unit: "perYear" },
  ],
  compute(p, ctx) {
    return { yearly: ctx.eachYear(() => p.perYear) };
  },
});
