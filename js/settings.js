// Global settings: they apply to every vehicle.
// The sidebar sliders are generated from FIELDS; labels live under "settings.<key>".

(function (app) {
  // Energy sources a vehicle can run on. Each has a price setting with the same key.
  const ENERGY_SOURCES = {
    petrol: { unit: "L" },
    diesel: { unit: "L" },
    electricity: { unit: "kWh" },
  };

  // A slider by default; with options, a select.
  //   format  how a slider value is shown: "number" | "money" | "percent" (whole numbers: 2.5 is 2.5%)
  //   hint    has a hint text under "settings.hints.<key>"
  const FIELDS = [
    { group: "use", key: "years", min: 1, max: 15, step: 1, format: "number" },
    { group: "use", key: "kmPerYear", min: 1000, max: 30000, step: 500, format: "number" },
    { group: "energy", key: "petrol", min: 1.5, max: 3.5, step: 0.05, format: "money" },
    { group: "energy", key: "diesel", min: 1.2, max: 3.2, step: 0.05, format: "money" },
    { group: "energy", key: "electricity", min: 0, max: 0.8, step: 0.01, format: "money" },
    { group: "money", key: "inflation", min: 0, max: 10, step: 0.1, format: "percent", hint: true },
    { group: "money", key: "interest", min: 0, max: 10, step: 0.1, format: "percent", hint: true },
    { group: "money", key: "view", options: ["today", "paid"], hint: true },
  ];

  app.settings = { ENERGY_SOURCES, FIELDS };
})(WielPrijs);
