// Results: the hero amount, ranking table, charts and notes.

(function (app) {
  const { $, h, DASHES, dark, themeColor, lineSample } = app.ui;
  const { t, localize, money, compactMoney, number, percent } = app.i18n;

  // [light, dark] colour per breakdown category
  const CATEGORY_COLORS = {
    depreciation: ["#0c2d55", "#9cc3ee"],
    insurance: ["#1f5ba8", "#5f97df"],
    tax: ["#4f8fd8", "#2f6bb5"],
    energy: ["#9cc3ee", "#1d4a80"],
    upkeep: ["#b7bfc8", "#5d6b78"],
    battery: ["#f2c200", "#f2c200"],
    lease: ["#d85a30", "#f0997b"],
    tickets: ["#1d9e75", "#5dcaa5"],
    other: ["#8a6d9e", "#b49cc6"],
  };
  const categoryColor = (category) => CATEGORY_COLORS[category][dark ? 1 : 0];

  let lineChart;
  let distanceChart;
  let barChart;

  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // Draws a dashed vertical line at options.value on the x axis.
  const markerPlugin = {
    id: "marker",
    afterDatasetsDraw(chart, _args, options) {
      if (options.value == null) return;
      const x = chart.scales.x.getPixelForValue(options.value);
      const { top, bottom } = chart.chartArea;
      const ctx = chart.ctx;
      ctx.save();
      ctx.strokeStyle = options.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
      ctx.restore();
    },
  };

  function init() {
    const animation = matchMedia("(prefers-reduced-motion: reduce)").matches ? false : { duration: 250 };
    const grid = { color: css("--grid") };

    Chart.defaults.font.family = '"Overpass", "Helvetica Neue", Arial, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = css("--muted");

    lineChart = new Chart($("lineChart"), {
      type: "line",
      data: { labels: [], datasets: [] },
      options: {
        responsive: true, maintainAspectRatio: false, animation,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            itemSort: (a, b) => b.parsed.y - a.parsed.y,
            callbacks: { label: (c) => `${c.dataset.label}: ${money(c.parsed.y)}` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { autoSkip: false } },
          y: { grid, ticks: { callback: (value) => compactMoney(value) } },
        },
      },
    });

    distanceChart = new Chart($("distanceChart"), {
      type: "line",
      data: { datasets: [] },
      plugins: [markerPlugin],
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        interaction: { mode: "index", intersect: false },
        elements: { point: { radius: 0, hoverRadius: 4 } },
        plugins: {
          legend: { display: false },
          marker: { color: css("--muted") },
          tooltip: {
            itemSort: (a, b) => b.parsed.y - a.parsed.y,
            callbacks: {
              title: (items) => `${number(items[0].parsed.x)} km`,
              label: (c) => `${c.dataset.label}: ${money(c.parsed.y)}`,
            },
          },
        },
        scales: {
          x: { type: "linear", grid: { display: false }, title: { display: true }, ticks: { callback: (value) => number(value) } },
          y: { grid, ticks: { callback: (value) => compactMoney(value) } },
        },
      },
    });

    barChart = new Chart($("barChart"), {
      type: "bar",
      data: { labels: [], datasets: [] },
      options: {
        indexAxis: "y", responsive: true, maintainAspectRatio: false, animation,
        plugins: {
          legend: { display: false },
          tooltip: {
            filter: (item) => item.parsed.x !== 0,
            callbacks: {
              label: (c) => `${c.dataset.label}: ${money(c.parsed.x)}`,
              footer: (items) => t("barChart.total", { amount: money(items[0].chart.$totals[items[0].dataIndex]) }),
            },
          },
        },
        scales: {
          x: { stacked: true, grid, ticks: { callback: (value) => compactMoney(value) } },
          y: { stacked: true, grid: { display: false } },
        },
      },
    });
  }

  function renderHero(settings, reference) {
    if (!reference) {
      $("heroAmount").textContent = "–";
      $("heroCaption").textContent = t("hero.empty");
      return;
    }
    $("heroAmount").textContent = money(reference.total);
    $("heroCaption").textContent = t("hero.caption", {
      vehicle: localize(reference.vehicle.name),
      years: t("units.years", { count: settings.years }),
      km: number(settings.kmPerYear),
      perMonth: money(reference.total / (settings.years * 12)),
    });
  }

  function renderRanking(settings, sorted, reference) {
    const months = settings.years * 12;
    const totalKm = settings.years * settings.kmPerYear;
    $("rankSub").textContent = t(settings.view === "today" ? "ranking.subToday" : "ranking.subPaid", {
      years: t("units.years", { count: settings.years }),
      inflation: percent(settings.inflation / 100, 1),
      interest: percent(settings.interest / 100, 1),
    });
    $("rankVersus").textContent = reference ? t("ranking.versus", { vehicle: localize(reference.vehicle.name) }) : "";

    if (sorted.length === 0) {
      $("rankBody").replaceChildren(h("tr", {}, h("td", { colspan: 5, class: "empty" }, t("ranking.empty"))));
      return;
    }
    $("rankBody").replaceChildren(...sorted.map((r, i) => {
      const versus = r === reference ? "–" : h("span", { class: "more" }, money(r.total - reference.total, { sign: true }));
      return h("tr", { class: r === reference ? "mine" : null },
        h("td", {}, h("span", { class: "name" },
          h("span", { class: "rank" }, String(i + 1)),
          lineSample(r.vehicle.color, r.vehicle.line),
          localize(r.vehicle.name))),
        h("td", {}, money(r.total)),
        h("td", {}, money(r.total / months)),
        h("td", {}, money(r.total / totalKm, { decimals: 2 })),
        h("td", {}, versus));
    }));
  }

  const vehicleLegend = (results) => results.map((r) =>
    h("span", {}, lineSample(r.vehicle.color, r.vehicle.line), localize(r.vehicle.name)));

  // A vehicle's line in a chart: its colour and dashes, thicker for the reference.
  function vehicleDataset(result, reference, data) {
    const color = themeColor(result.vehicle.color);
    return {
      label: localize(result.vehicle.name),
      data,
      borderColor: color, backgroundColor: color,
      borderDash: DASHES[result.vehicle.line] ?? [],
      borderWidth: result === reference ? 3 : 2,
      pointRadius: 2.5, tension: 0,
    };
  }

  function renderLineChart(settings, results, reference) {
    $("lineLegend").replaceChildren(...vehicleLegend(results));
    lineChart.data.labels = [
      t("lineChart.start"),
      ...Array.from({ length: settings.years }, (_, i) => t("lineChart.year", { year: i + 1 })),
      t("lineChart.end"),
    ];
    lineChart.data.datasets = results.map((r) => vehicleDataset(r, reference, r.line.map(Math.round)));
    lineChart.update();
  }

  // Total cost across the whole range of the km slider, and where options break even.
  function renderDistanceChart(settings, results, reference) {
    const range = app.settings.FIELDS.find((field) => field.key === "kmPerYear");
    const kms = [];
    for (let km = range.min; km <= range.max; km += range.step) kms.push(km);
    const totals = app.model.sweep(settings, results.map((r) => r.vehicle), "kmPerYear", kms);

    $("distanceSub").textContent = t("distanceChart.sub", { years: t("units.years", { count: settings.years }) });
    $("distanceLegend").replaceChildren(...vehicleLegend(results));
    distanceChart.data.datasets = results.map((r, i) => ({
      ...vehicleDataset(r, reference, kms.map((x, j) => ({ x, y: Math.round(totals[i][j]) }))),
      pointRadius: 0,
    }));
    Object.assign(distanceChart.options.scales.x, { min: range.min, max: range.max });
    distanceChart.options.scales.x.title.text = t("distanceChart.axis");
    distanceChart.options.plugins.marker.value = settings.kmPerYear;
    distanceChart.update();

    const ref = results.indexOf(reference);
    const breakEven = ref < 0 ? [] : results.flatMap((r, i) => {
      if (i === ref) return [];
      const diffs = totals[i].map((total, j) => total - totals[ref][j]);
      return app.model.crossings(kms, diffs).map((crossing) =>
        t(crossing.rising ? "distanceChart.cheaperBelow" : "distanceChart.cheaperAbove", {
          vehicle: localize(r.vehicle.name),
          reference: localize(reference.vehicle.name),
          km: number(Math.round(crossing.at / 100) * 100),
        }));
    });
    $("breakEven").replaceChildren(...breakEven.map((text) => h("li", {}, text)));
  }

  function renderBarChart(sorted) {
    const used = app.blocks.CATEGORIES.filter((c) => sorted.some((r) => Math.abs(r.breakdown[c] ?? 0) >= 0.5));

    $("barLegend").replaceChildren(...used.map((c) =>
      h("span", {}, h("span", { class: "box", style: `background:${categoryColor(c)}` }), t(`categories.${c}`))));

    $("barChart").parentElement.style.height = `${Math.max(160, 70 + sorted.length * 36)}px`;
    barChart.data.labels = sorted.map((r) => localize(r.vehicle.name));
    barChart.data.datasets = used.map((c) => ({
      label: t(`categories.${c}`),
      data: sorted.map((r) => Math.round(r.breakdown[c] ?? 0)),
      backgroundColor: categoryColor(c),
      borderColor: css("--surface"),
      borderWidth: 1, barThickness: 22,
    }));
    barChart.$totals = sorted.map((r) => r.total);
    barChart.update();
  }

  // Note params may themselves be { key } to translate, such as a ticket name.
  function noteText(note) {
    const params = Object.fromEntries(Object.entries(note.params ?? {}).map(([name, value]) =>
      [name, value?.key ? t(value.key) : value]));
    return t(note.key, params);
  }

  function renderNotes(results) {
    $("notes").replaceChildren(...results.flatMap((r) => r.notes.map((note) =>
      h("li", {}, `${localize(r.vehicle.name)}: ${noteText(note)}`))));
  }

  // results: model results for the shown vehicles; reference: one of them, or undefined
  function render(settings, results, reference) {
    const sorted = [...results].sort((a, b) => a.total - b.total);
    renderHero(settings, reference);
    renderRanking(settings, sorted, reference);
    renderLineChart(settings, results, reference);
    renderDistanceChart(settings, results, reference);
    renderBarChart(sorted);
    renderNotes(results);
  }

  app.ui.results = { init, render };
})(WielPrijs);
