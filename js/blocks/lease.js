// An all-in lease: insurance, tax and maintenance are included in the monthly price.

WielPrijs.blocks.register({
  type: "lease",
  category: "lease",
  fields: [
    { key: "perMonth", kind: "money", default: 0, unit: "perMonth" },
    { key: "termYears", kind: "integer", default: 5, advanced: true },
  ],
  compute(p, ctx) {
    const notes = ctx.years > p.termYears ? [{ key: "notes.leaseRenews", params: { year: p.termYears } }] : [];
    return { yearly: ctx.eachYear(() => p.perMonth * 12), notes };
  },
});
