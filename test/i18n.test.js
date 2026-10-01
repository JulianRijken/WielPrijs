const { test } = require("node:test");
const assert = require("node:assert/strict");

const { i18n } = require("./load");

// Every key path in a dictionary, e.g. "ranking.title". Plural objects count as one key.
function keys(node, prefix = "") {
  if (typeof node === "string" || "other" in node) return [prefix];
  return Object.entries(node).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

test("every language has exactly the same keys as English", () => {
  const english = keys(i18n.dictionary("en")).sort();
  for (const code of i18n.languages().filter((c) => c !== "en")) {
    assert.deepEqual(keys(i18n.dictionary(code)).sort(), english, `keys differ in ${code}`);
  }
});

test("t fills placeholders and picks plurals", () => {
  i18n.setLanguage("en");
  assert.equal(i18n.t("lineChart.year", { year: 3 }), "Year 3");
  assert.equal(i18n.t("units.years", { count: 1 }), "1 year");
  assert.equal(i18n.t("units.years", { count: 5 }), "5 years");
  i18n.setLanguage("nl");
  assert.equal(i18n.t("units.years", { count: 5 }), "5 jaar");
});

test("t falls back to English, then to the key", () => {
  i18n.register("xx", { page: { title: "Titel" } });
  i18n.setLanguage("xx");
  assert.equal(i18n.t("page.title"), "Titel");
  assert.equal(i18n.t("ranking.title"), "Ranking");
  assert.equal(i18n.t("does.not.exist"), "does.not.exist");
  i18n.setLanguage("en");
});

test("localize accepts plain text or text per language", () => {
  i18n.setLanguage("nl");
  assert.equal(i18n.localize("Vmoto TC"), "Vmoto TC");
  assert.equal(i18n.localize({ en: "Bus", nl: "Busje" }), "Busje");
  assert.equal(i18n.localize({ en: "Bus" }), "Bus");
  i18n.setLanguage("en");
});

test("detect picks the first supported browser language", () => {
  assert.equal(i18n.detect(["de-DE", "nl-BE", "en-US"]), "nl");
  assert.equal(i18n.detect(["fr-FR"]), "en");
});

test("money is formatted for the current language", () => {
  i18n.setLanguage("nl");
  assert.match(i18n.money(1234.5), /^€\s1\.235$/);
  i18n.setLanguage("en");
  assert.equal(i18n.money(1234.5), "€1,235");
  assert.equal(i18n.money(0.184, { decimals: 2 }), "€0.18");
  assert.equal(i18n.money(50, { sign: true }), "+€50");
});
