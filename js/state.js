// The app state, { settings, vehicles }: the same shape as WielPrijs.defaults.
// normalize() turns anything loaded from storage or a file into a usable state,
// so a damaged or hand-edited file can never break the page.

(function (app) {
  // Bump when the saved shape changes in a way that needs migrating.
  const SCHEMA = 1;
  const LINES = ["solid", "dashed", "dotted"];

  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const isName = (value) => typeof value === "string" || (isObject(value) && Object.values(value).every((v) => typeof v === "string"));

  function newId() {
    return `v-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  function fresh() {
    return structuredClone(app.defaults);
  }

  // Known settings with the right type are kept; the rest come from the defaults.
  function normalizeSettings(settings) {
    const result = structuredClone(app.defaults.settings);
    for (const [key, value] of Object.entries(isObject(settings) ? settings : {})) {
      if (key in result && typeof value === typeof result[key]) result[key] = value;
    }
    return result;
  }

  function normalizeVehicle(vehicle, usedIds) {
    let id = typeof vehicle.id === "string" && vehicle.id ? vehicle.id : newId();
    if (usedIds.has(id)) id = newId();
    usedIds.add(id);

    const result = {
      id,
      name: isName(vehicle.name) ? vehicle.name : "?",
      color: /^#[0-9a-f]{6}$/i.test(vehicle.color) ? vehicle.color : "#5b6b7b",
      line: LINES.includes(vehicle.line) ? vehicle.line : "solid",
      // Unknown block types are kept: the model skips them, and a newer version may know them.
      blocks: (Array.isArray(vehicle.blocks) ? vehicle.blocks : []).filter((b) => isObject(b) && typeof b.type === "string"),
    };
    if (vehicle.hidden === true) result.hidden = true;
    return result;
  }

  // Throws when the data is not a WielPrijs state at all.
  function normalize(data) {
    if (!isObject(data) || !Array.isArray(data.vehicles)) throw new Error("Not a WielPrijs file");
    const usedIds = new Set();
    return {
      settings: normalizeSettings(data.settings),
      vehicles: data.vehicles.filter(isObject).map((vehicle) => normalizeVehicle(vehicle, usedIds)),
    };
  }

  // What is saved in the browser.
  function toStored(state) {
    return { schema: SCHEMA, ...state };
  }

  // An exported file: readable, and its settings and vehicles can be pasted into js/defaults.js.
  function toFile(state) {
    return JSON.stringify({ app: "wielprijs", version: app.version, schema: SCHEMA, ...state }, null, 2);
  }

  app.state = { SCHEMA, newId, fresh, normalize, toStored, toFile };
})(WielPrijs);
