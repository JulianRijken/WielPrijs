// Consistency of everything the UI is generated from: blocks, settings, templates and defaults.

const { test } = require("node:test");
const assert = require("node:assert/strict");

const app = require("./load");

const has = (key) => {
  const value = key.split(".").reduce((node, part) => node?.[part], app.i18n.dictionary("en"));
  return value !== undefined;
};
const missing = (keys) => keys.filter((key) => !has(key));

test("every block type, field, hint and option has a label", () => {
  const keys = app.blocks.all().flatMap((type) => {
    const base = `blocks.${type.type}`;
    return [
      `${base}.title`,
      `${base}.description`,
      ...type.fields.map((f) => app.blocks.labelKey(type.type, f)),
      ...type.fields.filter((f) => f.hint).map((f) => app.blocks.hintKey(type.type, f)),
      ...type.fields.filter((f) => f.placeholder).map((f) => f.placeholder),
      ...type.fields.flatMap((f) => (f.options ?? []).map((o) => `${base}.options.${f.key}.${o}`)),
      ...type.fields.filter((f) => typeof f.unit === "string").map((f) => `units.${f.unit}`),
    ];
  });
  assert.deepEqual(missing(keys), []);
});

test("every category, setting and template has a label", () => {
  const keys = [
    ...app.blocks.CATEGORIES.map((c) => `categories.${c}`),
    ...app.settings.FIELDS.flatMap((f) => [`settings.${f.key}`, `settings.groups.${f.group}`]),
    ...app.settings.FIELDS.filter((f) => f.hint).map((f) => `settings.hints.${f.key}`),
    ...app.settings.FIELDS.flatMap((f) => (f.options ?? []).map((o) => `settings.options.${f.key}.${o}`)),
    ...app.templates.map((tpl) => `templates.${tpl.id}`),
  ];
  assert.deepEqual(missing(keys), []);
});

test("every block's category exists", () => {
  for (const type of app.blocks.all()) assert.ok(app.blocks.CATEGORIES.includes(type.category), type.type);
});

test("every energy source has a price setting", () => {
  const settingKeys = app.settings.FIELDS.map((f) => f.key);
  for (const source of Object.keys(app.settings.ENERGY_SOURCES)) assert.ok(settingKeys.includes(source), source);
});

function checkVehicleBlocks(blocks, where) {
  for (const block of blocks) {
    const type = app.blocks.get(block.type);
    assert.ok(type, `${where}: unknown block type ${block.type}`);
    const fields = type.fields.map((f) => f.key);
    for (const key of Object.keys(block)) {
      assert.ok(key === "type" || fields.includes(key), `${where}: unknown field ${block.type}.${key}`);
    }
  }
}

test("defaults are valid", () => {
  const { settings, vehicles } = app.defaults;
  for (const field of app.settings.FIELDS) {
    if (field.options) assert.ok(field.options.includes(settings[field.key]), field.key);
    else assert.equal(typeof settings[field.key], "number", field.key);
  }
  assert.equal(new Set(vehicles.map((v) => v.id)).size, vehicles.length, "vehicle ids are unique");
  assert.ok(vehicles.some((v) => v.id === settings.reference), "reference vehicle exists");
  for (const v of vehicles) {
    assert.match(v.color, /^#[0-9a-f]{6}$/i, `${v.id} color`);
    assert.ok(["solid", "dashed", "dotted"].includes(v.line), `${v.id} line`);
    checkVehicleBlocks(v.blocks, v.id);
  }
  for (const r of app.model.compute(settings, vehicles)) assert.ok(Number.isFinite(r.total), r.vehicle.id);
});

test("templates are valid", () => {
  for (const tpl of app.templates) checkVehicleBlocks(tpl.blocks, tpl.id);
});
