// Public transport, door to door, with the NS off-peak subscriptions.
//
// Subscriptions only discount the train part of the fare (discountableShare),
// and only for trips outside rush hour:
//   full             pay per trip, no subscription
//   offPeakDiscount  Dal Voordeel: a monthly fee for a discount off-peak
//   offPeakFree      Dal Vrij: a monthly fee for free travel off-peak
// "auto" picks whichever is cheapest over the whole period.

(function (app) {
  const PLANS = {
    full: () => ({ fee: 0, discount: 0 }),
    offPeakDiscount: (p) => ({ fee: p.offPeakDiscountFee * 12, discount: p.offPeakDiscount / 100 }),
    offPeakFree: (p) => ({ fee: p.offPeakFreeFee * 12, discount: 1 }),
  };

  function yearCost(p, plan, km, year) {
    const { fee, discount } = PLANS[plan](p);
    const offPeak = 1 - p.peakShare / 100;
    const growth = Math.pow(1 + p.fareRise / 100, year - 1);
    return growth * (fee + km * p.farePerKm * (1 - discount * (p.discountableShare / 100) * offPeak));
  }

  app.blocks.register({
    type: "transit",
    category: "tickets",
    fields: [
      { key: "farePerKm", kind: "money", default: 0.28, step: 0.01, unit: "perKm", hint: true },
      { key: "plan", kind: "select", options: ["auto", ...Object.keys(PLANS)], default: "auto" },
      { key: "peakShare", kind: "percent", default: 30 },
      { key: "fareRise", kind: "percent", default: 4, step: 0.1, advanced: true },
      { key: "discountableShare", kind: "percent", default: 75, advanced: true, hint: true },
      { key: "offPeakDiscount", kind: "percent", default: 40, advanced: true },
      { key: "offPeakDiscountFee", kind: "money", default: 6.5, step: 0.01, unit: "perMonth", advanced: true },
      { key: "offPeakFreeFee", kind: "money", default: 127.95, step: 0.01, unit: "perMonth", advanced: true },
    ],
    compute(p, ctx) {
      const costs = (plan) => ctx.eachYear((year) => yearCost(p, plan, ctx.kmPerYear, year));
      if (p.plan !== "auto") return { yearly: costs(p.plan) };

      const total = (plan) => costs(plan).reduce((sum, x) => sum + x, 0);
      const cheapest = Object.keys(PLANS).reduce((best, plan) => (total(plan) < total(best) ? plan : best));
      return {
        yearly: costs(cheapest),
        notes: [{ key: "notes.transitPlan", params: { plan: { key: `blocks.transit.options.plan.${cheapest}` } } }],
      };
    },
  });
})(WielPrijs);
