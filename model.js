// Pure calculation logic. No DOM access, so it can be tested in Node.
// Input: settings object. Output: one result per vehicle with yearly line and cost breakdown.

(function () {
  const sum = (a) => a.reduce((s, x) => s + x, 0);

  function ptYear(plan, km, peak, y) {
    const PT = globalThis.PT;
    const g = Math.pow(1 + PT.yearlyRise, y - 1);
    const fare = PT.farePerKm * g;
    if (plan === "full") return km * fare;
    if (plan === "dv") return PT.dalVoordeelPerYear * g + km * fare * (1 - 0.4 * PT.trainShare * (1 - peak));
    return PT.dalVrijPerYear * g + km * fare * ((1 - PT.trainShare) + PT.trainShare * peak);
  }

  function pickPlan(s) {
    if (s.ptPlan !== "auto") return s.ptPlan;
    let best = "full", bestCost = Infinity;
    for (const plan of ["full", "dv", "dvr"]) {
      let c = 0;
      for (let y = 1; y <= s.years; y++) c += ptYear(plan, s.km, s.peak, y);
      if (c < bestCost) { bestCost = c; best = plan; }
    }
    return best;
  }

  function emptyBreakdown() {
    return { depreciation: 0, insurance: 0, tax: 0, energy: 0, upkeep: 0, battery: 0, lease: 0, tickets: 0 };
  }

  function compute(s) {
    const B = globalThis.BATTERY;
    const Y = s.years;
    const plan = pickPlan(s);
    const notes = new Set();

    const results = globalThis.VEHICLES.map((v) => {
      const b = emptyBreakdown();
      const line = [0];

      if (v.type === "pt") {
        let cum = 0;
        for (let y = 1; y <= Y; y++) { cum += ptYear(plan, s.km, s.peak, y); line.push(cum); }
        line.push(cum);
        b.tickets = cum;
        return { v, line, b, total: cum };
      }

      const pricePerUnit = v.fuel === "electric" ? (v.battery && s.freeCharging ? 0 : s.electricity) : s.petrol;
      const energy = (s.km / 100) * v.c * pricePerUnit;

      if (v.type === "lease") {
        const run = s.lease * 12 + energy;
        for (let y = 1; y <= Y; y++) line.push(y * run);
        line.push(line[Y]);
        b.energy = energy * Y;
        b.lease = s.lease * 12 * Y;
        if (Y > 5) notes.add("Beyond 5 years the lease renews at the same price.");
        return { v, line, b, total: sum(Object.values(b)) };
      }

      const upfront = v.p + v.r;
      line[0] = upfront;
      let cum = upfront, upkeep = 0, batterySpend = [], packStart = 0, kmSincePack = 0;

      for (let y = 1; y <= Y; y++) {
        const m = v.f * (1 + globalThis.UPKEEP_GROWTH * (y - 1)) + s.km * v.k;
        let bc = 0;
        if (v.battery) {
          kmSincePack += s.km;
          const age = y - packStart;
          if (s.batteryMode === "worst" && y === 3) {
            bc += B.packs * s.packPrice; packStart = y; kmSincePack = 0;
            notes.add("Both Vmoto battery packs replaced in year 3.");
          } else if (s.batteryMode === "expected" && age > B.warrantyYears) {
            bc += (age <= 5 ? B.failRateEarly : B.failRateLate) * B.packs * s.packPrice;
          }
          if (kmSincePack >= B.wearKm || y - packStart >= B.wearYears) {
            bc += B.packs * s.packPrice; packStart = y; kmSincePack = 0;
            notes.add(`Vmoto packs worn out and replaced in year ${y}.`);
          }
        }
        batterySpend.push(bc);
        upkeep += m;
        cum += v.i + v.t + energy + m + bc;
        line.push(cum);
      }

      const floor = v.floor ?? v.p * 0.1;
      const baseResale = Math.max(floor, v.p * Math.pow(v.rv / v.p, Y / 5) - (s.km - 5000) * Y * v.d);
      const recentBattery = sum(batterySpend.slice(Math.max(0, Y - 4)));
      const boost = v.battery ? B.resaleBoost * recentBattery : 0;
      line.push(cum - baseResale - boost);

      b.depreciation = upfront - baseResale;
      b.insurance = v.i * Y;
      b.tax = v.t * Y;
      b.energy = energy * Y;
      b.upkeep = upkeep;
      b.battery = sum(batterySpend) - boost;
      if (v.battery && Y <= B.warrantyYears) notes.add("Vmoto sold with battery warranty still running.");
      return { v, line, b, total: sum(Object.values(b)) };
    });

    return { results, plan, notes: [...notes] };
  }

  globalThis.CostModel = { compute, ptYear };
})();
