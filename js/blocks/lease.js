// An all-in lease: insurance, tax and maintenance are included in the monthly price.
// The price is fixed for the length of the contract; a renewal is at the prices of that time.

WielPrijs.blocks.register({
  type: "lease",
  category: "lease",
  fields: [
    { key: "perMonth", kind: "money", default: 0, unit: "perMonth" },
    { key: "termYears", kind: "integer", default: 5, advanced: true },
    WielPrijs.blocks.PRICE_CHANGE,
  ],
  compute(p, ctx) {
    const term = Math.max(1, p.termYears);
    const contractStart = (year) => year - ((year - 1) % term);
    const notes = ctx.years > term ? [{ key: "notes.leaseRenews", params: { year: term } }] : [];
    return {
      yearly: ctx.eachYear((year) => p.perMonth * 12 * ctx.priceFactor(contractStart(year), p.priceChange)),
      notes,
    };
  },
});
