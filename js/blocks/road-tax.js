// Motorrijtuigenbelasting (MRB).

WielPrijs.blocks.register({
  type: "roadTax",
  category: "tax",
  fields: [
    { key: "perYear", kind: "money", default: 0, unit: "perYear" },
    WielPrijs.blocks.PRICE_CHANGE,
  ],
  compute(p, ctx) {
    return { yearly: ctx.eachYear((year) => p.perYear * ctx.priceFactor(year, p.priceChange)) };
  },
});
