// Loads the browser's model scripts into Node's global scope, in index.html order.
// UI scripts are left out: they need a DOM.

const path = require("node:path");

const SCRIPTS = [
  "js/wielprijs.js",
  "js/i18n.js",
  "js/locales/en.js",
  "js/locales/nl.js",
  "js/data.js",
  "js/model.js",
];

for (const file of SCRIPTS) require(path.join(__dirname, "..", file));

module.exports = globalThis.WielPrijs;
