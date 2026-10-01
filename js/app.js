// UI: reads the controls, runs the model and draws the ranking and charts.

(function (app) {
  const { t, localize, money, compactMoney, number, percent } = app.i18n;
  const $ = (id) => document.getElementById(id);
  const escapeHtml = (text) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  const dark = matchMedia("(prefers-color-scheme: dark)").matches;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const CATEGORIES = [
    { key: "depreciation", light: "#0c2d55", dark: "#9cc3ee" },
    { key: "insurance", light: "#1f5ba8", dark: "#5f97df" },
    { key: "tax", light: "#4f8fd8", dark: "#2f6bb5" },
    { key: "energy", light: "#9cc3ee", dark: "#1d4a80" },
    { key: "upkeep", light: "#b7bfc8", dark: "#5d6b78" },
    { key: "battery", light: "#f2c200", dark: "#f2c200" },
    { key: "lease", light: "#d85a30", dark: "#f0997b" },
    { key: "tickets", light: "#1d9e75", dark: "#5dcaa5" },
  ];

  const DEFAULTS = {
    years: 5, km: 5000, petrol: 2.45, electricity: 0.25, freeCharging: true,
    ptPlan: "auto", peak: 30, batteryMode: "expected", packPrice: 900, lease: 900,
  };

  function readSettings() {
    return {
      years: +$("years").value,
      km: +$("km").value,
      petrol: +$("petrol").value,
      electricity: +$("electricity").value,
      freeCharging: $("freeCharging").checked,
      ptPlan: $("ptPlan").value,
      peak: +$("peak").value / 100,
      batteryMode: $("batteryMode").value,
      packPrice: +$("packPrice").value,
      lease: +$("lease").value,
    };
  }

  function updateOutputs(s) {
    $("yearsOut").textContent = number(s.years);
    $("kmOut").textContent = number(s.km);
    $("petrolOut").textContent = money(s.petrol, { decimals: 2 });
    $("electricityOut").textContent = money(s.electricity, { decimals: 2 });
    $("peakOut").textContent = percent(s.peak);
    $("packPriceOut").textContent = money(s.packPrice);
    $("leaseOut").textContent = money(s.lease);
  }

  const colorOf = (v) => v.color[dark ? 1 : 0];
  const categoryColor = (c) => (dark ? c.dark : c.light);
  const nameOf = (v) => localize(v.name);

  function renderLegends() {
    $("lineLegend").innerHTML = app.VEHICLES.map((v) =>
      `<span><svg width="22" height="8" aria-hidden="true"><line x1="1" y1="4" x2="21" y2="4" stroke="${colorOf(v)}" stroke-width="2.5" stroke-dasharray="${v.dash.join(",")}"/></svg>${escapeHtml(nameOf(v))}</span>`
    ).join("");
    $("barLegend").innerHTML = CATEGORIES.map((c) =>
      `<span><span class="box" style="background:${categoryColor(c)}"></span>${escapeHtml(t(`categories.${c.key}`))}</span>`
    ).join("");
  }

  // Charts

  Chart.defaults.font.family = '"Overpass", "Helvetica Neue", Arial, sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.color = css("--muted");
  const gridColor = css("--grid");
  const animation = reduceMotion ? false : { duration: 250 };

  const lineChart = new Chart($("lineChart"), {
    type: "line",
    data: {
      labels: [],
      datasets: app.VEHICLES.map((v) => ({
        data: [], borderColor: colorOf(v), backgroundColor: colorOf(v),
        borderDash: v.dash, borderWidth: v.width || 2, pointRadius: 2.5, tension: 0,
      })),
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { itemSort: (a, b) => b.parsed.y - a.parsed.y, callbacks: { label: (c) => `${c.dataset.label}: ${money(c.parsed.y)}` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { autoSkip: false } },
        y: { grid: { color: gridColor }, ticks: { callback: (v) => compactMoney(v) } },
      },
    },
  });

  const barChart = new Chart($("barChart"), {
    type: "bar",
    data: {
      labels: [],
      datasets: CATEGORIES.map((c) => ({
        data: [], backgroundColor: categoryColor(c),
        borderColor: css("--surface"), borderWidth: 1, barThickness: 22,
      })),
    },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false, animation,
      plugins: {
        legend: { display: false },
        tooltip: {
          filter: (it) => it.parsed.x > 0,
          callbacks: {
            label: (c) => `${c.dataset.label}: ${money(c.parsed.x)}`,
            footer: (items) => t("barChart.total", {
              amount: money(items[0].chart.data.datasets.reduce((s, d) => s + d.data[items[0].dataIndex], 0)),
            }),
          },
        },
      },
      scales: {
        x: { stacked: true, grid: { color: gridColor }, ticks: { callback: (v) => compactMoney(v) } },
        y: { stacked: true, grid: { display: false } },
      },
    },
  });

  function render() {
    const s = readSettings();
    updateOutputs(s);
    const { results, plan, notes } = app.model.compute(s);
    const mine = results.find((r) => r.v.id === "vmoto");
    const months = s.years * 12;
    const totalKm = s.km * s.years;
    const years = t("units.years", { count: s.years });

    // Hero
    $("heroAmount").textContent = money(mine.total);
    $("heroCaption").textContent = t("hero.caption", {
      vehicle: nameOf(mine.v), years, km: number(s.km), perMonth: money(mine.total / months),
    });

    // Ranking
    $("rankSub").textContent = t("ranking.sub", { years, plan: t(`plans.${plan}`) });
    $("rankVersus").textContent = t("ranking.versus", { vehicle: nameOf(mine.v) });
    const sorted = [...results].sort((a, b) => a.total - b.total);
    $("rankBody").innerHTML = sorted.map((r, i) => {
      const vs = r === mine ? "–" : `<span class="more">${money(r.total - mine.total, { sign: true })}</span>`;
      return `<tr class="${r === mine ? "mine" : ""}">
        <td><span class="name"><span class="rank">${i + 1}</span><span class="swatch" style="background:${colorOf(r.v)}"></span>${escapeHtml(nameOf(r.v))}</span></td>
        <td>${money(r.total)}</td>
        <td>${money(r.total / months)}</td>
        <td>${money(r.total / totalKm, { decimals: 2 })}</td>
        <td>${vs}</td>
      </tr>`;
    }).join("");

    // Line chart (original vehicle order keeps colours stable)
    lineChart.data.labels = [
      t("lineChart.start"),
      ...Array.from({ length: s.years }, (_, i) => t("lineChart.year", { year: i + 1 })),
      t("lineChart.end"),
    ];
    results.forEach((r, j) => {
      lineChart.data.datasets[j].label = nameOf(r.v);
      lineChart.data.datasets[j].data = r.line.map(Math.round);
    });
    lineChart.update();

    // Bar chart (sorted, cheapest on top)
    barChart.data.labels = sorted.map((r) => nameOf(r.v));
    CATEGORIES.forEach((c, q) => {
      barChart.data.datasets[q].label = t(`categories.${c.key}`);
      barChart.data.datasets[q].data = sorted.map((r) => Math.round(Math.max(0, r.b[c.key])));
    });
    barChart.update();

    $("notes").textContent = notes.map((n) => t(n.key, n.params)).join(" ");
  }

  function reset() {
    for (const [id, value] of Object.entries(DEFAULTS)) {
      const el = $(id);
      if (el.type === "checkbox") el.checked = value;
      else el.value = value;
    }
    render();
  }

  // Language

  function applyLanguage() {
    app.i18n.translatePage();
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === app.i18n.language()));
    });
    renderLegends();
    render();
  }

  function chooseLanguage(code) {
    app.i18n.setLanguage(code);
    app.store.write("language", code);
    applyLanguage();
  }

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => chooseLanguage(button.dataset.lang));
  });
  document.querySelectorAll(".controls input, .controls select").forEach((el) => el.addEventListener("input", render));
  $("reset").addEventListener("click", reset);

  app.i18n.setLanguage(app.store.read("language") ?? app.i18n.detect());
  applyLanguage();
})(WielPrijs);
