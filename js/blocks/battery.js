// Replaceable battery packs, as on the Vmoto TC.
//
// Scenarios:
//   wear      packs are only replaced at the end of their life (km or years)
//   expected  after the warranty, each year carries the average cost of failures
//   worst     all packs fail once, in failureYear
// A buyer pays back part of what was spent on packs in the last four years.

(function (app) {
  const sum = (values) => values.reduce((total, x) => total + x, 0);

  app.blocks.register({
    type: "battery",
    category: "battery",
    fields: [
      { key: "packs", kind: "integer", default: 1 },
      { key: "packPrice", kind: "money", default: 0 },
      { key: "scenario", kind: "select", options: ["wear", "expected", "worst"], default: "expected" },
      { key: "failureYear", kind: "integer", default: 3, visible: (p) => p.scenario === "worst" },
      { key: "warrantyYears", kind: "integer", default: 2, advanced: true },
      { key: "lifeKm", kind: "number", default: 80000, step: 1000, unit: "km", advanced: true, hint: true },
      { key: "lifeYears", kind: "integer", default: 10, advanced: true },
      { key: "failureRate", kind: "percent", default: 5, advanced: true, hint: true },
      { key: "oldAfterYears", kind: "integer", default: 5, advanced: true },
      { key: "failureRateOld", kind: "percent", default: 8, advanced: true },
      { key: "resaleShare", kind: "percent", default: 35, advanced: true, hint: true },
    ],
    compute(p, ctx) {
      const replaceAll = p.packs * p.packPrice;
      const yearly = [];
      const notes = [];
      let packsFrom = 0; // year the current packs were fitted
      let kmOnPacks = 0;

      for (let year = 1; year <= ctx.years; year++) {
        let cost = 0;
        kmOnPacks += ctx.kmPerYear;
        const age = year - packsFrom;

        if (p.scenario === "worst" && year === p.failureYear) {
          cost += replaceAll;
          packsFrom = year;
          kmOnPacks = 0;
          notes.push({ key: "notes.batteryFailed", params: { year } });
        } else if (p.scenario === "expected" && age > p.warrantyYears) {
          const rate = age <= p.oldAfterYears ? p.failureRate : p.failureRateOld;
          cost += (rate / 100) * replaceAll;
        }

        if (kmOnPacks >= p.lifeKm || year - packsFrom >= p.lifeYears) {
          cost += replaceAll;
          packsFrom = year;
          kmOnPacks = 0;
          notes.push({ key: "notes.batteryWorn", params: { year } });
        }
        yearly.push(cost);
      }

      if (ctx.years <= p.warrantyYears) notes.push({ key: "notes.batteryWarranty" });
      return { yearly, refund: (p.resaleShare / 100) * sum(yearly.slice(-4)), notes };
    },
  });
})(WielPrijs);
