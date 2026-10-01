// Small DOM helpers shared by the UI scripts.

(function (app) {
  const $ = (id) => document.getElementById(id);

  // h("button", { class: "x", onclick: fn }, "Label", child)
  // Attributes set to null, undefined or false are left out; true sets an empty attribute.
  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) {
      if (value == null || value === false) continue;
      if (name.startsWith("on")) el.addEventListener(name.slice(2), value);
      else el.setAttribute(name, value === true ? "" : value);
    }
    el.append(...children.flat().filter((child) => child != null && child !== false));
    return el;
  }

  const DASHES = { solid: [], dashed: [6, 4], dotted: [2, 3] };

  const dark = matchMedia("(prefers-color-scheme: dark)").matches;

  // Vehicle colour for the current theme: lifted a little on dark backgrounds.
  function themeColor(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex ?? "")) return "#8796a5";
    if (!dark) return hex;
    const lift = (i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.8 + 255 * 0.2).toString(16).padStart(2, "0");
    return `#${lift(1)}${lift(3)}${lift(5)}`;
  }

  // A short line sample in a vehicle's colour and line style, for legends and lists.
  function lineSample(color, line) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "22");
    svg.setAttribute("height", "8");
    svg.setAttribute("aria-hidden", "true");
    const stroke = document.createElementNS(svg.namespaceURI, "line");
    const attrs = { x1: 1, y1: 4, x2: 21, y2: 4, stroke: themeColor(color), "stroke-width": 2.5,
      "stroke-dasharray": (DASHES[line] ?? []).join(",") };
    for (const [name, value] of Object.entries(attrs)) stroke.setAttribute(name, value);
    svg.append(stroke);
    return svg;
  }

  app.ui = { $, h, DASHES, dark, themeColor, lineSample };
})(WielPrijs);
