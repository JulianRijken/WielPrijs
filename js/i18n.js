// Translations and locale-aware formatting.
// Dictionaries live in js/locales/<code>.js and register themselves here.
//
// A dictionary is a nested object of strings. Strings may contain {placeholders}.
// A value can also be a plural object, { one: "...", other: "..." }, picked by params.count.

(function (app) {
  const FALLBACK = "en";
  const INTL_LOCALES = { en: "en-GB", nl: "nl-NL" };

  const dictionaries = {};
  let current = FALLBACK;

  function register(code, dictionary) {
    dictionaries[code] = dictionary;
  }

  function languages() {
    return Object.keys(dictionaries);
  }

  function dictionary(code) {
    return dictionaries[code];
  }

  function language() {
    return current;
  }

  function setLanguage(code) {
    current = dictionaries[code] ? code : FALLBACK;
    formatters.clear();
  }

  // First supported language in the browser's preference list.
  function detect(preferred = globalThis.navigator?.languages ?? []) {
    for (const tag of preferred) {
      const code = tag.slice(0, 2).toLowerCase();
      if (dictionaries[code]) return code;
    }
    return FALLBACK;
  }

  const lookup = (dictionary, key) => key.split(".").reduce((node, part) => node?.[part], dictionary);

  function t(key, params = {}) {
    let text = lookup(dictionaries[current], key) ?? lookup(dictionaries[FALLBACK], key) ?? key;
    if (typeof text === "object") {
      text = text[new Intl.PluralRules(intlLocale()).select(params.count)] ?? text.other;
    }
    return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? params[name] : match));
  }

  // User-facing text that is either a plain string or translated per language: { en: "...", nl: "..." }.
  function localize(text) {
    if (text == null || typeof text === "string") return text ?? "";
    return text[current] ?? text[FALLBACK] ?? Object.values(text)[0] ?? "";
  }

  // Formatting. Intl formatters are slow to create, so they are cached per language.

  const formatters = new Map();
  const intlLocale = () => INTL_LOCALES[current] ?? current;

  function formatter(options) {
    const key = JSON.stringify(options);
    if (!formatters.has(key)) formatters.set(key, new Intl.NumberFormat(intlLocale(), options));
    return formatters.get(key);
  }

  // money(1234.5) → "€ 1.235" (nl) or "€1,235" (en). Options: decimals, sign (show + for positive).
  function money(amount, { decimals = 0, sign = false } = {}) {
    return formatter({
      style: "currency", currency: "EUR",
      minimumFractionDigits: decimals, maximumFractionDigits: decimals,
      signDisplay: sign ? "exceptZero" : "auto",
    }).format(amount);
  }

  // Short money for chart axes: "€5K".
  function compactMoney(amount) {
    return formatter({ style: "currency", currency: "EUR", notation: "compact" }).format(amount);
  }

  function number(value, decimals = 0) {
    return formatter({ minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
  }

  // percent(0.3) → "30%"
  function percent(fraction, decimals = 0) {
    return formatter({ style: "percent", minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(fraction);
  }

  // Applies translations to static markup:
  //   data-i18n="key"                       sets the text content
  //   data-i18n-attr="attr:key, attr:key"   sets attributes
  function translatePage(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      for (const pair of el.dataset.i18nAttr.split(",")) {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        el.setAttribute(attr, t(key));
      }
    });
    document.documentElement.lang = current;
    document.title = t("page.title");
  }

  app.i18n = {
    register, languages, dictionary, language, setLanguage, detect,
    t, localize, money, compactMoney, number, percent, translatePage,
  };
})(WielPrijs);
