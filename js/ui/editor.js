// Dialogs for adding a vehicle (pick a template) and editing one (name, colour, cost blocks).
// The editor works on a copy; nothing changes until Save.

(function (app) {
  const { $, h } = app.ui;
  const { t, localize } = app.i18n;

  const DEFAULT_STEP = { money: 1, number: 1, integer: 1, percent: 1 };

  let draft = null; // copy of the vehicle being edited
  let isNew = false;
  let handlers = {};

  // Templates

  function openTemplates() {
    $("templateList").replaceChildren(...app.templates.map((template) =>
      h("button", { type: "button", class: "template", onclick: () => {
        $("templates").close();
        handlers.onTemplate(template);
      } }, t(`templates.${template.id}`))));
    $("templates").showModal();
  }

  // Editor

  function open(vehicle, options = {}) {
    draft = structuredClone(vehicle);
    isNew = Boolean(options.isNew);
    $("editorTitle").textContent = t(isNew ? "editor.titleNew" : "editor.titleEdit");
    $("vehicleName").value = localize(draft.name);
    $("vehicleColor").value = draft.color;
    $("vehicleLine").replaceChildren(...Object.keys(app.ui.DASHES).map((line) =>
      h("option", { value: line, selected: line === draft.line }, t(`editor.lines.${line}`))));
    $("deleteVehicle").hidden = isNew;
    $("saveCopy").hidden = isNew;
    $("addBlock").replaceChildren(
      h("option", { value: "" }, t("editor.addBlockPlaceholder")),
      ...app.blocks.all().map((type) => h("option", { value: type.type }, t(`blocks.${type.type}.title`))));
    renderBlocks();
    $("editor").showModal();
  }

  function blockTitle(type, params) {
    return type.title?.(params) || t(`blocks.${type.type}.title`);
  }

  function renderBlocks() {
    $("editorBlocks").replaceChildren(...(draft.blocks.length
      ? draft.blocks.map(blockCard)
      : [h("p", { class: "empty" }, t("editor.noBlocks"))]));
  }

  // Re-renders one block, for when a choice changes which fields apply.
  function refreshBlock(index) {
    const old = $("editorBlocks").children[index];
    const card = blockCard(draft.blocks[index], index);
    const details = card.querySelector("details");
    if (details) details.open = Boolean(old.querySelector("details")?.open);
    old.replaceWith(card);
  }

  function removeButton(index, title) {
    return h("button", {
      type: "button", class: "block-remove", "aria-label": t("editor.removeLabel", { block: title }),
      onclick: () => {
        draft.blocks.splice(index, 1);
        renderBlocks();
      },
    }, "×");
  }

  function blockCard(block, index) {
    const type = app.blocks.get(block.type);
    if (!type) {
      // Unknown type, e.g. from a file made by a newer version: it can only be removed.
      return h("fieldset", { class: "block" }, h("legend", {}, block.type), removeButton(index, block.type));
    }

    const params = app.blocks.params(block);
    const fields = type.fields.filter((field) => !field.visible || field.visible(params));
    const basic = fields.filter((field) => !field.advanced);
    const advanced = fields.filter((field) => field.advanced);
    const title = blockTitle(type, params);

    return h("fieldset", { class: "block" },
      h("legend", {}, title),
      removeButton(index, title),
      h("p", { class: "block-description" }, t(`blocks.${type.type}.description`)),
      h("div", { class: "block-fields" }, basic.map((field) => fieldInput(block, index, field, params))),
      advanced.length > 0 && h("details", { class: "block-advanced" },
        h("summary", {}, t("editor.more")),
        h("div", { class: "block-fields" }, advanced.map((field) => fieldInput(block, index, field, params)))));
  }

  function parseNumber(text, field) {
    if (text.trim() === "") return field.optional ? null : 0;
    const value = Number(text);
    return Number.isFinite(value) ? value : 0;
  }

  function unitText(field, params) {
    if (field.kind === "percent") return "%";
    if (typeof field.unit === "function") return field.unit(params);
    return field.unit ? t(`units.${field.unit}`) : null;
  }

  function fieldInput(block, index, field, params) {
    const id = `block-${index}-${field.key}`;
    const key = `blocks.${block.type}`;
    const value = params[field.key];
    const hint = app.blocks.hintKey(block.type, field);
    let input;

    if (field.kind === "select") {
      input = h("select", { id, onchange: () => {
        block[field.key] = input.value;
        refreshBlock(index);
      } }, field.options.map((option) =>
        h("option", { value: option, selected: option === value }, t(`${key}.options.${field.key}.${option}`))));
    } else if (field.kind === "text") {
      input = h("input", { id, type: "text", value: value ?? "", oninput: () => (block[field.key] = input.value) });
    } else {
      input = h("input", {
        id, type: "number", inputmode: "decimal", value: value ?? "",
        step: field.step ?? DEFAULT_STEP[field.kind],
        placeholder: field.placeholder ? t(field.placeholder) : field.optional ? "–" : null,
        oninput: () => (block[field.key] = parseNumber(input.value, field)),
      });
    }

    const unit = unitText(field, params);
    return h("div", { class: "field" },
      h("label", { for: id }, t(app.blocks.labelKey(block.type, field))),
      h("div", { class: "input-group" },
        field.kind === "money" && h("span", { class: "affix" }, "€"),
        input,
        unit && h("span", { class: "affix" }, unit)),
      hint && h("small", { class: "hint" }, t(hint)));
  }

  function addBlock(type) {
    draft.blocks.push(app.blocks.create(type));
    renderBlocks();
    const card = $("editorBlocks").lastElementChild;
    card.scrollIntoView({ block: "nearest", behavior: "smooth" });
    card.querySelector("input, select")?.focus({ preventScroll: true });
  }

  // handlers: onTemplate(template), onSave(vehicle, isNew), onSaveCopy(vehicle), onDelete(id)
  function init(callbacks) {
    handlers = callbacks;

    $("vehicleName").addEventListener("input", (e) => (draft.name = e.target.value));
    $("vehicleColor").addEventListener("input", (e) => (draft.color = e.target.value));
    $("vehicleLine").addEventListener("change", (e) => (draft.line = e.target.value));
    $("addBlock").addEventListener("change", (e) => {
      if (e.target.value) addBlock(e.target.value);
      e.target.value = "";
    });

    $("editorForm").addEventListener("submit", () => handlers.onSave(draft, isNew));
    $("saveCopy").addEventListener("click", () => {
      $("editor").close();
      handlers.onSaveCopy(draft);
    });
    $("deleteVehicle").addEventListener("click", () => {
      if (!confirm(t("editor.deleteConfirm", { vehicle: localize(draft.name) }))) return;
      $("editor").close();
      handlers.onDelete(draft.id);
    });
    $("cancelEdit").addEventListener("click", () => $("editor").close());
  }

  app.ui.editor = { init, open, openTemplates };
})(WielPrijs);
