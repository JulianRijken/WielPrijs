// Insurance, with the Dutch no-claim discount (bonus-malus): every claim-free
// year raises the discount by `discountStep` points, up to `discountMax`.
// `perYear` is today's premium, so it already includes `discountNow`.

(function (app) {
  app.blocks.register({
    type: "insurance",
    category: "insurance",
    fields: [
      { key: "perYear", kind: "money", default: 0, unit: "perYear" },
      { key: "discountNow", kind: "percent", default: 0, advanced: true, hint: true },
      { key: "discountStep", kind: "percent", default: 0, advanced: true, hint: true },
      { key: "discountMax", kind: "percent", default: 75, advanced: true },
      app.blocks.PRICE_CHANGE,
    ],
    compute(p, ctx) {
      const fullPremium = p.discountNow < 100 ? p.perYear / (1 - p.discountNow / 100) : 0;
      const discount = (year) => Math.min(Math.max(p.discountMax, p.discountNow), p.discountNow + p.discountStep * (year - 1));
      return {
        yearly: ctx.eachYear((year) => fullPremium * (1 - discount(year) / 100) * ctx.priceFactor(year, p.priceChange)),
      };
    },
  });
})(WielPrijs);
