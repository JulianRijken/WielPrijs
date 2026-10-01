# WielPrijs

What does getting around really cost? A small web page that compares the true
cost of transport options in the Netherlands, from purchase to resale: owned
vehicles, leases and public transport, side by side. In Dutch and English.

Plain HTML, CSS and JavaScript. No build step; the only dependency is Chart.js,
loaded from a CDN.

## Use it

Open `index.html` in a browser, or serve the folder while developing:

```bash
npm start
```

- Set the number of years, km per year and energy prices in the sidebar.
- Tick the vehicles you want to compare, and choose the one to compare against.
- **Edit** a vehicle to change any of its costs, or **Add vehicle** to start
  from a template (scooter, motorbike, car, electric car, lease, public
  transport or empty).
- Everything is saved in your browser. **Export** and **Import** move a setup
  between devices or people.

## How it works

A vehicle is a name, a colour and a list of **cost blocks**. Each block adds
what is paid up front, what is paid each year and what comes back at the end.
The model only adds blocks up, so any mix is possible.

| Block | Adds |
|---|---|
| Purchase and resale | Price and fees up front; the resale value comes back at the end, following a depreciation curve and adjusted for mileage |
| Insurance | Premium per year, optionally dropping with a no-claim discount every claim-free year |
| Road tax (MRB) | Tax per year |
| Fuel or electricity | Consumption × the global energy price, or the vehicle's own price (0 for free charging) |
| Maintenance and repairs | A fixed amount per year that grows with age, plus an amount per km |
| Battery packs | Replacement packs: normal wear only, the expected failure risk, or a worst case where all packs fail once |
| Lease | An all-in monthly price |
| Public transport | Fare per km with the NS off-peak subscriptions; can pick the cheapest one automatically |
| Extra cost | Anything else, once or every year; negative amounts are income |

### Inflation and paying now versus later

Prices rise with a global inflation rate; any cost can set its own yearly
price change instead (public transport fares, cheaper battery packs). A lease
stays fixed for its contract. Used-vehicle prices follow inflation too, which
is why owning something protects against it.

Totals can be shown as **euros as paid** or as **value today**: every future
payment discounted by the interest your savings would earn until then. That
makes a big payment now and many payments later comparable. When prices rise
faster than savings grow, buying up front wins; when savings earn more, paying
as you go wins.

## Files

| Path | What it does |
|---|---|
| `index.html` | Page structure; loads the scripts in order |
| `styles.css` | All styling, including dark mode |
| `js/wielprijs.js` | Root namespace and app version, loaded first |
| `js/i18n.js`, `js/locales/` | Translations and locale-aware number formatting |
| `js/store.js`, `js/state.js` | Browser storage, and checking state loaded from storage or a file |
| `js/settings.js` | Global settings (years, distance, energy prices) |
| `js/blocks.js`, `js/blocks/` | The cost block registry and one file per block type |
| `js/model.js` | The calculation. Pure functions, no DOM, so it runs in Node |
| `js/defaults.js` | The comparison a first-time visitor sees |
| `js/templates.js` | Starting points for new vehicles |
| `js/ui/` | Sidebar, vehicle editor, results and charts |
| `js/app.js` | Holds the state and wires everything together |

## Develop

```bash
npm test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to extend the app, and for the
branch, commit and release workflow. Changes are listed in
[CHANGELOG.md](CHANGELOG.md).

## Sources and caveats

Default prices reflect the Dutch market around October 2026 (pump price, NS
2026 fares, dealer and listing prices). Insurance, repairs and resale values are
estimates. Check your own quotes.
