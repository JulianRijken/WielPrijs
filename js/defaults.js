// What a first-time visitor sees, and what "Reset to defaults" restores.
// Prices are for the Netherlands, autumn 2026. Insurance and resale values are estimates.
//
// Vehicle:
//   id      unique, stable identifier
//   name    plain text, or per language: { en, nl }
//   color   line and swatch colour
//   line    "solid" | "dashed" | "dotted"; variants of one model share a colour
//   hidden  true to leave it out of the comparison
//   blocks  cost blocks, see js/blocks.js; missing fields take the block's defaults

WielPrijs.defaults = {
  settings: {
    years: 5,
    kmPerYear: 5000,
    petrol: 2.45,
    diesel: 2.1,
    electricity: 0.25,
    reference: "vmoto",
  },
  vehicles: [
    {
      id: "vmoto", name: "Vmoto TC", color: "#2a78d6", line: "solid",
      blocks: [
        { type: "purchase", price: 2848, fees: 0, resaleValue: 900, valueLossPerKm: 0.01 },
        { type: "insurance", perYear: 324 },
        { type: "energy", source: "electricity", per100km: 3.5, ownPrice: 0 },
        { type: "maintenance", perYear: 40, perKm: 0.022 },
        { type: "battery", packs: 2, packPrice: 900, scenario: "expected" },
      ],
    },
    {
      id: "pt", name: { en: "Public transport (NS + bus)", nl: "Openbaar vervoer (NS + bus)" },
      color: "#008300", line: "solid",
      blocks: [
        { type: "transit", farePerKm: 0.28, plan: "auto", peakShare: 30 },
      ],
    },
    {
      id: "scr-used", name: { en: "Scrambler 400 X used", nl: "Scrambler 400 X gebruikt" },
      color: "#eb6834", line: "dashed",
      blocks: [
        { type: "purchase", price: 5750, fees: 150, resaleValue: 3000, valueLossPerKm: 0.035 },
        { type: "insurance", perYear: 456 },
        { type: "roadTax", perYear: 156 },
        { type: "energy", source: "petrol", per100km: 3.4 },
        { type: "maintenance", perYear: 260, perKm: 0.052 },
      ],
    },
    {
      id: "scr-new", name: { en: "Scrambler 400 X new", nl: "Scrambler 400 X nieuw" },
      color: "#eb6834", line: "solid",
      blocks: [
        { type: "purchase", price: 7845, fees: 0, resaleValue: 3900, valueLossPerKm: 0.04 },
        { type: "insurance", perYear: 540 },
        { type: "roadTax", perYear: 156 },
        { type: "energy", source: "petrol", per100km: 3.4 },
        { type: "maintenance", perYear: 280, perKm: 0.052 },
      ],
    },
    {
      id: "nc", name: { en: "MX-5 NC used", nl: "MX-5 NC gebruikt" },
      color: "#c98a00", line: "dashed",
      blocks: [
        { type: "purchase", price: 9500, fees: 150, resaleValue: 7500, valueLossPerKm: 0.03 },
        { type: "insurance", perYear: 540 },
        { type: "roadTax", perYear: 496 },
        { type: "energy", source: "petrol", per100km: 8 },
        { type: "maintenance", perYear: 700, perKm: 0.032 },
      ],
    },
    {
      id: "nd", name: { en: "MX-5 ND 2.0 used (2022)", nl: "MX-5 ND 2.0 gebruikt (2022)" },
      color: "#c98a00", line: "solid",
      blocks: [
        { type: "purchase", price: 32000, fees: 150, resaleValue: 21000, valueLossPerKm: 0.04 },
        { type: "insurance", perYear: 840 },
        { type: "roadTax", perYear: 496 },
        { type: "energy", source: "petrol", per100km: 7 },
        { type: "maintenance", perYear: 400, perKm: 0.032 },
      ],
    },
    {
      id: "golf", name: { en: "VW Golf 5 budget (~€3k)", nl: "VW Golf 5 goedkoop (~€3k)" },
      color: "#d1557f", line: "solid",
      blocks: [
        { type: "purchase", price: 3000, fees: 20, resaleValue: 1200, valueLossPerKm: 0.01, minimumValue: 400 },
        { type: "insurance", perYear: 420 },
        { type: "roadTax", perYear: 600 },
        { type: "energy", source: "petrol", per100km: 7.5 },
        { type: "maintenance", perYear: 750, perKm: 0.03 },
      ],
    },
    {
      id: "tesla", name: { en: "Tesla Model 3 used", nl: "Tesla Model 3 gebruikt" },
      color: "#6250d6", line: "solid",
      blocks: [
        { type: "purchase", price: 21000, fees: 150, resaleValue: 10000, valueLossPerKm: 0.04 },
        { type: "insurance", perYear: 1080 },
        { type: "roadTax", perYear: 780 },
        { type: "energy", source: "electricity", per100km: 17 },
        { type: "maintenance", perYear: 380, perKm: 0.032 },
      ],
    },
    {
      id: "id7-buy", name: { en: "VW ID.7 bought new", nl: "VW ID.7 nieuw gekocht" },
      color: "#d63a3a", line: "solid",
      blocks: [
        { type: "purchase", price: 48990, fees: 0, resaleValue: 21000, valueLossPerKm: 0.06 },
        { type: "insurance", perYear: 1320 },
        { type: "roadTax", perYear: 1128 },
        { type: "energy", source: "electricity", per100km: 18 },
        { type: "maintenance", perYear: 250, perKm: 0.035 },
      ],
    },
    {
      id: "id7-lease", name: "VW ID.7 private lease", color: "#d63a3a", line: "dotted",
      blocks: [
        { type: "lease", perMonth: 900 },
        { type: "energy", source: "electricity", per100km: 18 },
      ],
    },
  ],
};
