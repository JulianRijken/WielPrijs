// Entry point: holds the state, wires the UI together and redraws on every change.
//
// state = { settings, vehicles }, the same shape as WielPrijs.defaults.

(function (app) {
  const { $ } = app.ui;
  const { t } = app.i18n;
  const { sidebar, editor, results } = app.ui;

  // Colours for new vehicles; the first one not in use is picked.
  const PALETTE = ["#2a78d6", "#008300", "#eb6834", "#c98a00", "#d1557f", "#6250d6", "#d63a3a", "#0e8f8f", "#8a5a2b", "#5b6b7b"];

  let state = structuredClone(app.defaults);

  const newId = () => `v-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const findVehicle = (id) => state.vehicles.find((v) => v.id === id);
  const shownVehicles = () => state.vehicles.filter((v) => !v.hidden);

  // The vehicle everything is compared with; falls back to the first one shown.
  function referenceVehicle() {
    const shown = shownVehicles();
    return shown.find((v) => v.id === state.settings.reference) ?? shown[0];
  }

  function renderResults() {
    const shown = shownVehicles();
    const computed = app.model.compute(state.settings, shown);
    const reference = computed.find((r) => r.vehicle === referenceVehicle());
    results.render(state.settings, computed, reference);
  }

  function renderVehicles() {
    sidebar.renderVehicles(state.vehicles, referenceVehicle(), {
      onReference: (id) => update(() => (state.settings.reference = id)),
      onToggle: (id, shown) => update(() => {
        if (shown) delete findVehicle(id).hidden;
        else findVehicle(id).hidden = true;
      }),
      onEdit: (id) => editor.open(findVehicle(id)),
    });
  }

  function renderAll() {
    app.i18n.translatePage();
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === app.i18n.language()));
    });
    sidebar.renderSettings(state.settings, (key, value) => {
      state.settings[key] = value;
      renderResults();
    });
    renderVehicles();
    renderResults();
  }

  // Applies a change to the vehicles and redraws what depends on them.
  function update(change) {
    change();
    renderVehicles();
    renderResults();
  }

  // Vehicles

  function vehicleFromTemplate(template) {
    const used = new Set(state.vehicles.map((v) => v.color));
    return {
      id: newId(),
      name: t(`templates.${template.id}`),
      color: PALETTE.find((c) => !used.has(c)) ?? PALETTE[0],
      line: "solid",
      blocks: template.blocks.map((block) => app.blocks.params(block)),
    };
  }

  editor.init({
    onTemplate: (template) => editor.open(vehicleFromTemplate(template), { isNew: true }),
    onSave: (vehicle, isNew) => update(() => {
      if (isNew) state.vehicles.push(vehicle);
      else state.vehicles[state.vehicles.indexOf(findVehicle(vehicle.id))] = vehicle;
    }),
    onSaveCopy: (vehicle) => update(() => {
      const original = findVehicle(vehicle.id);
      const sameName = app.i18n.localize(vehicle.name) === app.i18n.localize(original.name);
      const copy = { ...vehicle, id: newId() };
      if (sameName) copy.name = t("editor.copyName", { name: app.i18n.localize(vehicle.name) });
      state.vehicles.splice(state.vehicles.indexOf(original) + 1, 0, copy);
    }),
    onDelete: (id) => update(() => {
      state.vehicles = state.vehicles.filter((v) => v.id !== id);
    }),
  });

  // Language

  function chooseLanguage(code) {
    app.i18n.setLanguage(code);
    app.store.write("language", code);
    renderAll();
  }

  // Start

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => chooseLanguage(button.dataset.lang));
  });
  $("addVehicle").addEventListener("click", () => editor.openTemplates());
  $("reset").addEventListener("click", () => {
    state = structuredClone(app.defaults);
    renderAll();
  });

  app.i18n.setLanguage(app.store.read("language") ?? app.i18n.detect());
  results.init();
  renderAll();
})(WielPrijs);
