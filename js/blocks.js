// Cost blocks: a vehicle is a name, a colour and a list of blocks.
// Each block type lives in js/blocks/<type>.js and registers itself here.
//
// Block type definition:
//   type        unique id; labels live under "blocks.<type>" in the dictionaries
//   category    breakdown category its cost counts towards (see CATEGORIES)
//   title       optional function (params) → text, overriding the translated title
//   fields      editable parameters, shown in the vehicle editor
//   compute(params, ctx) → { upfront, yearly, refund, notes }, all optional:
//     upfront   paid at the start
//     yearly    amount paid in each year, an array of ctx.years numbers
//     refund    received back at the end, such as the resale value
//     notes     [{ key, params }] remarks shown below the charts; a param
//               can itself be { key } to have it translated too
//   Amounts are as paid at the time, so they include price changes. Showing
//   them as "value today" is done by the model; blocks never deal with interest.
//
// Field:
//   key         parameter name in the block data
//   kind        "money" | "number" | "integer" | "percent" | "select" | "text"
//   default     value for new blocks and for data that lacks the field
//   step        input step; money defaults to 1
//   unit        i18n key under "units", or a function (params) → text
//   options     values for a select
//   optional    an empty input stores null instead of 0
//   advanced    shown under "More settings"
//   hint        true for a hint text under "blocks.<type>.hints.<key>"
//   visible     function (params) → boolean, to hide fields that do not apply
//   label, hint, placeholder
//               an i18n key instead, to share text between blocks (see PRICE_CHANGE)
//
// Percentages are stored as whole numbers: 5 means 5%.
//
// The context passed to compute():
//   years            length of the period
//   kmPerYear        distance driven each year
//   energyPrice(s)   price per unit of energy source s, at today's prices
//   eachYear(fn)     [fn(1), fn(2), ... fn(years)]
//   priceFactor(year, change)
//                    price level relative to today. Year 1 is at today's prices;
//                    the end of the period, when things are sold, is years + 1.
//                    change is the yearly price change in percent; null follows inflation.

(function (app) {
  const CATEGORIES = ["depreciation", "insurance", "tax", "energy", "upkeep", "battery", "lease", "tickets", "other"];

  // A cost's own yearly price change, to include in a block's fields. Empty follows inflation.
  const PRICE_CHANGE = {
    key: "priceChange", kind: "percent", default: null, step: 0.1, optional: true, advanced: true,
    label: "blocks.common.priceChange", hint: "blocks.common.priceChangeHint", placeholder: "blocks.common.inflation",
  };

  const types = new Map();

  function register(definition) {
    types.set(definition.type, definition);
  }

  function get(type) {
    return types.get(type);
  }

  function all() {
    return [...types.values()];
  }

  // A block's data with defaults filled in for missing fields.
  function params(block) {
    const result = { ...block };
    for (const field of get(block.type).fields) {
      if (result[field.key] === undefined) result[field.key] = field.default;
    }
    return result;
  }

  // A new block of the given type, with every field at its default.
  function create(type) {
    return params({ type });
  }

  // i18n keys of a field's texts.
  const labelKey = (type, field) => (typeof field.label === "string" ? field.label : `blocks.${type}.fields.${field.key}`);
  const hintKey = (type, field) => (typeof field.hint === "string" ? field.hint : field.hint ? `blocks.${type}.hints.${field.key}` : null);

  app.blocks = { CATEGORIES, PRICE_CHANGE, register, get, all, params, create, labelKey, hintKey };
})(WielPrijs);
