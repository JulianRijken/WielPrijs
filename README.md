# What does getting around really cost?

A small web app that compares the true cost of a Vmoto TC electric scooter with
motorcycles, cars, a leased VW ID.7 and public transport in the Netherlands.
Plain HTML, CSS and JavaScript. No build step.

## Run it

Open `index.html` in a browser. That's it.

Or serve it locally (useful while developing):

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Files

| File | What it does |
|---|---|
| `index.html` | Page structure and controls |
| `styles.css` | All styling, including dark mode |
| `data.js` | Every assumption: prices, insurance, road tax, consumption, resale values, PT fares, battery risk |
| `model.js` | The calculation. Pure functions, no DOM, so you can test it in Node |
| `app.js` | Reads the controls, runs the model, draws the ranking table and charts |

To change a number, edit `data.js`. To add a vehicle, add an object to `VEHICLES`.

## Test the model

```bash
node -e 'require("./data.js"); require("./model.js");
const r = CostModel.compute({ years: 5, km: 5000, petrol: 2.45, electricity: 0.25,
  lease: 900, freeCharging: true, ptPlan: "auto", peak: 0.3,
  batteryMode: "expected", packPrice: 900 });
r.results.forEach(x => console.log(x.v.name, Math.round(x.total)));'
```

## Ideas to build next in Claude Code

- Let users add their own vehicle through a form instead of editing `data.js`
- Save settings in the URL so a comparison can be shared as a link
- A province selector, since road tax (MRB) differs per province
- Licence costs (AM, A2, B) as an optional toggle
- Unit tests for `model.js` (for example with `node --test`)
- Deploy to GitHub Pages or Netlify

## Sources and caveats

Prices reflect the Dutch market around October 2026 (pump price, NS 2026 fares,
dealer and listing prices). Insurance, repairs and resale values are estimates.
Check your own quotes.
