// Loads the browser's non-UI scripts into Node's global scope, in index.html order.
// UI scripts (js/ui/, js/app.js) are left out: they need a DOM.

const path = require("node:path");

const SCRIPTS = [
  "js/wielprijs.js",
  "js/i18n.js",
  "js/locales/en.js",
  "js/locales/nl.js",
  "js/settings.js",
  "js/blocks.js",
  "js/blocks/purchase.js",
  "js/blocks/insurance.js",
  "js/blocks/road-tax.js",
  "js/blocks/energy.js",
  "js/blocks/maintenance.js",
  "js/blocks/battery.js",
  "js/blocks/lease.js",
  "js/blocks/transit.js",
  "js/blocks/extra.js",
  "js/model.js",
];

for (const file of SCRIPTS) require(path.join(__dirname, "..", file));

module.exports = globalThis.WielPrijs;
