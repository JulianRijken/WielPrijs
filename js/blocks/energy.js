// Fuel or electricity. The price comes from the global energy prices,
// unless the vehicle has its own price (0 for free charging).

(function (app) {
  const sources = app.settings.ENERGY_SOURCES;

  app.blocks.register({
    type: "energy",
    category: "energy",
    fields: [
      { key: "source", kind: "select", options: Object.keys(sources), default: "petrol" },
      { key: "per100km", kind: "number", default: 0, step: 0.1, unit: (p) => `${sources[p.source]?.unit ?? ""}/100 km` },
      { key: "ownPrice", kind: "money", default: null, step: 0.01, optional: true, hint: true },
      app.blocks.PRICE_CHANGE,
    ],
    compute(p, ctx) {
      const price = p.ownPrice ?? ctx.energyPrice(p.source);
      const perYear = (ctx.kmPerYear / 100) * p.per100km * price;
      return { yearly: ctx.eachYear((year) => perYear * ctx.priceFactor(year, p.priceChange)) };
    },
  });
})(WielPrijs);
