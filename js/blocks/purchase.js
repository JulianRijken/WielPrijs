// Buying the vehicle and selling it at the end.
// The value falls along a curve that reaches resaleValue at resaleAge, so vehicles
// lose value fastest in the first years. Driving more or less than resaleKmPerYear
// moves the value by valueLossPerKm for every km of difference.

WielPrijs.blocks.register({
  type: "purchase",
  category: "depreciation",
  fields: [
    { key: "price", kind: "money", default: 0 },
    { key: "fees", kind: "money", default: 0 },
    { key: "resaleValue", kind: "money", default: 0, hint: true },
    { key: "resaleAge", kind: "integer", default: 5, advanced: true },
    { key: "resaleKmPerYear", kind: "number", default: 5000, step: 500, unit: "km", advanced: true },
    { key: "valueLossPerKm", kind: "money", default: 0, step: 0.001, advanced: true, hint: true },
    { key: "minimumValue", kind: "money", default: null, optional: true, advanced: true, hint: true },
  ],
  compute(p, ctx) {
    const ratio = p.price > 0 ? p.resaleValue / p.price : 0;
    const curve = p.price * Math.pow(ratio, ctx.years / p.resaleAge);
    const extraKm = (ctx.kmPerYear - p.resaleKmPerYear) * ctx.years;
    const floor = p.minimumValue ?? p.price * 0.1;
    return {
      upfront: p.price + p.fees,
      refund: Math.max(floor, curve - extraKm * p.valueLossPerKm),
    };
  },
});
