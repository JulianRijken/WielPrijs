// Anything else: a parking permit, riding gear, a one-off repair.
// A negative amount is income, such as a travel allowance.

WielPrijs.blocks.register({
  type: "extra",
  category: "other",
  title: (p) => p.label,
  fields: [
    { key: "label", kind: "text", default: "" },
    { key: "amount", kind: "money", default: 0 },
    { key: "when", kind: "select", options: ["yearly", "start", "once"], default: "yearly" },
    { key: "year", kind: "integer", default: 1, visible: (p) => p.when === "once" },
    { ...WielPrijs.blocks.PRICE_CHANGE, visible: (p) => p.when !== "start" },
  ],
  compute(p, ctx) {
    if (p.when === "start") return { upfront: p.amount };
    const inYear = (year) => p.amount * ctx.priceFactor(year, p.priceChange);
    if (p.when === "once") return { yearly: ctx.eachYear((year) => (year === p.year ? inYear(year) : 0)) };
    return { yearly: ctx.eachYear(inYear) };
  },
});
