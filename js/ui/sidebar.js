// The settings panel: sliders for the global settings and the list of vehicles.

(function (app) {
  const { $, h, lineSample } = app.ui;
  const { t, localize, money, number, percent } = app.i18n;

  const FORMATS = {
    number: (value) => number(value),
    money: (value) => money(value, { decimals: 2 }),
    percent: (value) => percent(value / 100, 1),
  };

  function slider(id, field, value, onChange) {
    const format = FORMATS[field.format];
    const output = h("output", { for: id }, format(value));
    const input = h("input", {
      type: "range", id, min: field.min, max: field.max, step: field.step, value,
      oninput: () => {
        output.textContent = format(Number(input.value));
        onChange(field.key, Number(input.value));
      },
    });
    return [output, input];
  }

  function select(id, field, value, onChange) {
    return h("select", { id, onchange: (e) => onChange(field.key, e.target.value) },
      field.options.map((option) =>
        h("option", { value: option, selected: option === value }, t(`settings.options.${field.key}.${option}`))));
  }

  function control(field, value, onChange) {
    const id = `setting-${field.key}`;
    return h("div", { class: "field" },
      h("label", { for: id }, t(`settings.${field.key}`)),
      field.options ? select(id, field, value, onChange) : slider(id, field, value, onChange),
      field.hint && h("small", { class: "hint" }, t(`settings.hints.${field.key}`)));
  }

  // Builds the controls, grouped in fieldsets. Call again when the language changes.
  function renderSettings(settings, onChange) {
    const groups = Map.groupBy(app.settings.FIELDS, (field) => field.group);
    $("settings").replaceChildren(...[...groups].map(([group, fields]) =>
      h("fieldset", {},
        h("legend", {}, t(`settings.groups.${group}`)),
        fields.map((field) => control(field, settings[field.key], onChange)))));
  }

  // handlers: onReference(id), onToggle(id, shown), onEdit(id)
  function renderVehicles(vehicles, reference, handlers) {
    $("reference").replaceChildren(...vehicles.filter((v) => !v.hidden).map((v) =>
      h("option", { value: v.id, selected: v === reference }, localize(v.name))));
    $("reference").onchange = (e) => handlers.onReference(e.target.value);

    $("vehicleList").replaceChildren(...vehicles.map((v) => {
      const name = localize(v.name);
      return h("li", { class: "vehicle" },
        h("label", { class: "check" },
          h("input", { type: "checkbox", checked: !v.hidden, onchange: (e) => handlers.onToggle(v.id, e.target.checked) }),
          lineSample(v.color, v.line),
          h("span", { class: "vehicle-name" }, name)),
        h("button", { type: "button", class: "link-button", "aria-label": t("vehicles.editLabel", { vehicle: name }),
          onclick: () => handlers.onEdit(v.id) }, t("vehicles.edit")));
    }));
  }

  app.ui.sidebar = { renderSettings, renderVehicles };
})(WielPrijs);
