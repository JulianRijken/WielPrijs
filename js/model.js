// Pure calculation logic. No DOM access, so it runs in Node.
//
// compute(settings, vehicles) returns one result per vehicle:
//   vehicle    the vehicle itself
//   line       cumulative cost at the start, after each year, and after the refund (selling)
//   breakdown  net cost per category
//   total      net cost over the whole period
//   notes      [{ key, params }] remarks from the vehicle's blocks

(function (app) {
  const sum = (values) => values.reduce((total, x) => total + x, 0);

  function context(settings) {
    const years = settings.years;
    return {
      years,
      kmPerYear: settings.kmPerYear,
      energyPrice: (source) => settings[source] ?? 0,
      eachYear: (fn) => Array.from({ length: years }, (_, i) => fn(i + 1)),
    };
  }

  function computeVehicle(vehicle, ctx) {
    const yearly = new Array(ctx.years).fill(0);
    const breakdown = {};
    const notes = [];
    let upfront = 0;
    let refund = 0;

    for (const block of vehicle.blocks) {
      const type = app.blocks.get(block.type);
      if (!type) continue; // unknown type, for example from a file made by a newer version

      const result = type.compute(app.blocks.params(block), ctx);
      const blockUpfront = result.upfront ?? 0;
      const blockYearly = result.yearly ?? [];
      const blockRefund = result.refund ?? 0;

      upfront += blockUpfront;
      refund += blockRefund;
      blockYearly.forEach((cost, i) => (yearly[i] += cost));
      breakdown[type.category] = (breakdown[type.category] ?? 0) + blockUpfront + sum(blockYearly) - blockRefund;
      notes.push(...(result.notes ?? []));
    }

    const line = [upfront];
    for (const cost of yearly) line.push(line.at(-1) + cost);
    line.push(line.at(-1) - refund);

    return { vehicle, line, breakdown, total: line.at(-1), notes };
  }

  function compute(settings, vehicles) {
    const ctx = context(settings);
    return vehicles.map((vehicle) => computeVehicle(vehicle, ctx));
  }

  app.model = { compute, sum };
})(WielPrijs);
