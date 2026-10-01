// All assumptions live here. Edit these numbers to update the whole app.
// Prices are for the Netherlands, autumn 2026. Amounts in euros.
//
// name  plain text, or per language: { en, nl }
// p   purchase price            r   registration / transfer / dealer fees
// i   insurance per year        t   road tax (MRB) per year
// fuel "petrol" or "electric"   c   use per 100 km (litres or kWh)
// f   fixed upkeep per year (service, APK, age repairs), grows 5% per year
// k   upkeep per km (tyres, brakes, chain)
// rv  resale value after 5 years at 5,000 km/year
// d   resale drop per extra km driven above 5,000 km/year
// floor  lowest possible resale value (defaults to 10% of price)
// color  [light, dark] line colour; same model = same colour
// dash   line dash pattern; variants of a model use different dashes

WielPrijs.VEHICLES = [
  { id: "vmoto", name: "Vmoto TC", p: 2848, r: 0, i: 324, t: 0, fuel: "electric", c: 3.5,
    f: 40, k: 0.022, rv: 900, d: 0.01, battery: true, color: ["#2a78d6", "#3987e5"], dash: [], width: 3 },
  { id: "pt", name: { en: "Public transport (NS + bus)", nl: "Openbaar vervoer (NS + bus)" }, type: "pt", color: ["#008300", "#3fae3f"], dash: [], width: 3 },
  { id: "scr-used", name: { en: "Scrambler 400 X used", nl: "Scrambler 400 X gebruikt" }, p: 5750, r: 150, i: 456, t: 156, fuel: "petrol", c: 3.4,
    f: 260, k: 0.052, rv: 3000, d: 0.035, color: ["#eb6834", "#d95926"], dash: [5, 4] },
  { id: "scr-new", name: { en: "Scrambler 400 X new", nl: "Scrambler 400 X nieuw" }, p: 7845, r: 0, i: 540, t: 156, fuel: "petrol", c: 3.4,
    f: 280, k: 0.052, rv: 3900, d: 0.04, color: ["#eb6834", "#d95926"], dash: [] },
  { id: "nc", name: { en: "MX-5 NC used", nl: "MX-5 NC gebruikt" }, p: 9500, r: 150, i: 540, t: 496, fuel: "petrol", c: 8.0,
    f: 700, k: 0.032, rv: 7500, d: 0.03, color: ["#c98a00", "#d9a20e"], dash: [5, 4] },
  { id: "nd", name: { en: "MX-5 ND 2.0 used (2022)", nl: "MX-5 ND 2.0 gebruikt (2022)" }, p: 32000, r: 150, i: 840, t: 496, fuel: "petrol", c: 7.0,
    f: 400, k: 0.032, rv: 21000, d: 0.04, color: ["#c98a00", "#d9a20e"], dash: [] },
  { id: "golf", name: { en: "VW Golf 5 budget (~€3k)", nl: "VW Golf 5 goedkoop (~€3k)" }, p: 3000, r: 20, i: 420, t: 600, fuel: "petrol", c: 7.5,
    f: 750, k: 0.03, rv: 1200, d: 0.01, floor: 400, color: ["#d1557f", "#e07aa0"], dash: [] },
  { id: "tesla", name: { en: "Tesla Model 3 used", nl: "Tesla Model 3 gebruikt" }, p: 21000, r: 150, i: 1080, t: 780, fuel: "electric", c: 17,
    f: 380, k: 0.032, rv: 10000, d: 0.04, color: ["#6250d6", "#9085e9"], dash: [] },
  { id: "id7-buy", name: { en: "VW ID.7 bought new", nl: "VW ID.7 nieuw gekocht" }, p: 48990, r: 0, i: 1320, t: 1128, fuel: "electric", c: 18,
    f: 250, k: 0.035, rv: 21000, d: 0.06, color: ["#d63a3a", "#e66767"], dash: [] },
  { id: "id7-lease", name: "VW ID.7 private lease", type: "lease", fuel: "electric", c: 18,
    color: ["#d63a3a", "#e66767"], dash: [1, 3], width: 3 },
];

// Public transport: door-to-door fare per km at full price (train + bus legs).
WielPrijs.PT = {
  farePerKm: 0.28,
  yearlyRise: 0.04,       // fares rise 4% per year
  trainShare: 0.75,       // share of the fare that is train (discounts apply only here)
  dalVoordeelPerYear: 78, // estimate, about €6.50 a month
  dalVrijPerYear: 127.95 * 12,
};

// Vmoto battery packs.
WielPrijs.BATTERY = {
  packs: 2,
  warrantyYears: 2,
  wearKm: 80000,          // replace after this many km...
  wearYears: 10,          // ...or this many years, whichever comes first
  failRateEarly: 0.05,    // yearly failure chance per pack, years 3-5 of a pack's life
  failRateLate: 0.08,     // from year 6
  resaleBoost: 0.35,      // share of recent battery spend recovered at sale
};

WielPrijs.UPKEEP_GROWTH = 0.05; // upkeep rises 5% per year as vehicles age
