// Starting points for "Add vehicle". Rough Dutch figures, meant to be adjusted.
// Names live under "templates.<id>" in the dictionaries.

WielPrijs.templates = [
  {
    id: "electricScooter",
    blocks: [
      { type: "purchase", price: 3000, resaleValue: 1000, valueLossPerKm: 0.01 },
      { type: "insurance", perYear: 300 },
      { type: "energy", source: "electricity", per100km: 3.5 },
      { type: "maintenance", perYear: 50, perKm: 0.02 },
      { type: "battery", packs: 1, packPrice: 900 },
    ],
  },
  {
    id: "motorbike",
    blocks: [
      { type: "purchase", price: 6000, fees: 150, resaleValue: 3500, valueLossPerKm: 0.03 },
      { type: "insurance", perYear: 450 },
      { type: "roadTax", perYear: 160 },
      { type: "energy", source: "petrol", per100km: 4 },
      { type: "maintenance", perYear: 250, perKm: 0.05 },
    ],
  },
  {
    id: "car",
    blocks: [
      { type: "purchase", price: 10000, fees: 150, resaleValue: 5000, valueLossPerKm: 0.03 },
      { type: "insurance", perYear: 600 },
      { type: "roadTax", perYear: 550 },
      { type: "energy", source: "petrol", per100km: 6.5 },
      { type: "maintenance", perYear: 600, perKm: 0.03 },
    ],
  },
  {
    id: "electricCar",
    blocks: [
      { type: "purchase", price: 25000, fees: 150, resaleValue: 13000, valueLossPerKm: 0.04 },
      { type: "insurance", perYear: 900 },
      { type: "roadTax", perYear: 400 },
      { type: "energy", source: "electricity", per100km: 17 },
      { type: "maintenance", perYear: 350, perKm: 0.03 },
    ],
  },
  {
    id: "lease",
    blocks: [
      { type: "lease", perMonth: 600 },
      { type: "energy", source: "electricity", per100km: 17 },
    ],
  },
  {
    id: "transit",
    blocks: [
      { type: "transit" },
    ],
  },
  {
    id: "empty",
    blocks: [],
  },
];
