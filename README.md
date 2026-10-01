# What does getting around really cost?

A small web app that compares the true cost of a Vmoto TC electric scooter with
motorcycles, cars, a leased VW ID.7 and public transport in the Netherlands.
Plain HTML, CSS and JavaScript. No build step.

## Run it

Open `index.html` in a browser. That is it.

Or serve it locally (useful while developing):

```bash
npm start
```

## Files

| File | What it does |
|---|---|
| `index.html` | Page structure and controls |
| `styles.css` | All styling, including dark mode |
| `js/wielprijs.js` | Root namespace and app version, loaded first |
| `js/data.js` | Every assumption: prices, insurance, road tax, consumption, resale values, PT fares, battery risk |
| `js/model.js` | The calculation. Pure functions, no DOM, so it runs in Node |
| `js/app.js` | Reads the controls, runs the model, draws the ranking table and charts |

To change a number, edit `js/data.js`. To add a vehicle, add an object to `VEHICLES`.

## Test

```bash
npm test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for branches, commits and releases.

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
