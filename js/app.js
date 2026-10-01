// UI: reads the controls, runs the model and draws the ranking and charts.

(function (app) {
  const $= (id) => document.getElementById(id);
  const eur = (x) => (x < 0 ? "−" : "") + "€" + Math.abs(Math.round(x)).toLocaleString("nl-NL");
  const eur2 = (x) => "€" + x.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const dark = matchMedia("(prefers-color-scheme: dark)").matches;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const CATEGORIES = [
    { key: "depreciation", label: "Value loss", light: "#0c2d55", dark: "#9cc3ee" },
    { key: "insurance", label: "Insurance", light: "#1f5ba8", dark: "#5f97df" },
    { key: "tax", label: "Road tax", light: "#4f8fd8", dark: "#2f6bb5" },
    { key: "energy", label: "Fuel / electricity", light: "#9cc3ee", dark: "#1d4a80" },
    { key: "upkeep", label: "Maintenance, repairs, APK", light: "#b7bfc8", dark: "#5d6b78" },
    { key: "battery", label: "Battery risk (net)", light: "#f2c200", dark: "#f2c200" },
    { key: "lease", label: "Lease (all-in)", light: "#d85a30", dark: "#f0997b" },
    { key: "tickets", label: "Tickets and subscriptions", light: "#1d9e75", dark: "#5dcaa5" },
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
    $("yearsOut").textContent = s.years;
    $("kmOut").textContent = s.km.toLocaleString("nl-NL");
    $("petrolOut").textContent = eur2(s.petrol);
    $("electricityOut").textContent = eur2(s.electricity);
    $("peakOut").textContent = Math.round(s.peak * 100) + "%";
    $("packPriceOut").textContent = "€" + s.packPrice;
    $("leaseOut").textContent = "€" + s.lease;
  }

  const colorOf = (v) => v.color[dark ? 1 : 0];
  const yearLabel = (y) => (y === 1 ? "1 year" : `${y} years`);

  // Legends (built once)
  $("lineLegend").innerHTML = app.VEHICLES.map((v) =>
    `<span><svg width="22" height="8" aria-hidden="true"><line x1="1" y1="4" x2="21" y2="4" stroke="${colorOf(v)}" stroke-width="2.5" stroke-dasharray="${v.dash.join(",")}"/></svg>${v.name}</span>`
  ).join("");
  $("barLegend").innerHTML = CATEGORIES.map((c) =>
    `<span><span class="box" style="background:${dark ? c.dark : c.light}"></span>${c.label}</span>`
  ).join("");

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
        label: v.name, data: [], borderColor: colorOf(v), backgroundColor: colorOf(v),
        borderDash: v.dash, borderWidth: v.width || 2, pointRadius: 2.5, tension: 0,
      })),
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { itemSort: (a, b) => b.parsed.y - a.parsed.y, callbacks: { label: (c) => `${c.dataset.label}: ${eur(c.parsed.y)}` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { autoSkip: false } },
        y: { grid: { color: gridColor }, ticks: { callback: (v) => "€" + v / 1000 + "k" } },
      },
    },
  });

  const barChart = new Chart($("barChart"), {
    type: "bar",
    data: {
      labels: [],
      datasets: CATEGORIES.map((c) => ({
        label: c.label, data: [], backgroundColor: dark ? c.dark : c.light,
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
            label: (c) => `${c.dataset.label}: ${eur(c.parsed.x)}`,
            footer: (items) => "Total: " + eur(items[0].chart.data.datasets.reduce((s, d) => s + d.data[items[0].dataIndex], 0)),
          },
        },
      },
      scales: {
        x: { stacked: true, grid: { color: gridColor }, ticks: { callback: (v) => "€" + v / 1000 + "k" } },
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

    // Hero
    $("heroAmount").textContent = eur(mine.total);
    $("heroCaption").textContent = `Your Vmoto TC over ${yearLabel(s.years)} at ${s.km.toLocaleString("nl-NL")} km a year. That is ${eur(mine.total / months)} a month.`;

    // Ranking
    $("rankSub").textContent = `True cost after selling over ${yearLabel(s.years)}, cheapest first. Public transport uses ${app.PT.plans[plan]}.`;
    const sorted = [...results].sort((a, b) => a.total - b.total);
    $("rankBody").innerHTML = sorted.map((r, i) => {
      const diff = r.total - mine.total;
      const vs = r === mine ? "–" : `<span class="more">${diff >= 0 ? "+" : ""}${eur(diff)}</span>`;
      return `<tr class="${r === mine ? "mine" : ""}">
        <td><span class="name"><span class="rank">${i + 1}</span><span class="swatch" style="background:${colorOf(r.v)}"></span>${r.v.name}</span></td>
        <td>${eur(r.total)}</td>
        <td>${eur(r.total / months)}</td>
        <td>${eur2(r.total / totalKm)}</td>
        <td>${vs}</td>
      </tr>`;
    }).join("");

    // Line chart (original vehicle order keeps colours stable)
    lineChart.data.labels = ["Buy", ...Array.from({ length: s.years }, (_, i) => `Year ${i + 1}`), "Sold"];
    results.forEach((r, j) => (lineChart.data.datasets[j].data = r.line.map(Math.round)));
    lineChart.update();

    // Bar chart (sorted, cheapest on top)
    barChart.data.labels = sorted.map((r) => r.v.name);
    CATEGORIES.forEach((c, q) => (barChart.data.datasets[q].data = sorted.map((r) => Math.round(Math.max(0, r.b[c.key])))));
    barChart.update();

    $("notes").textContent = notes.join(" ");
  }

  function reset() {
    for (const [id, value] of Object.entries(DEFAULTS)) {
      const el = $(id);
      if (el.type === "checkbox") el.checked = value;
      else el.value = value;
    }
    render();
  }

  document.querySelectorAll(".controls input, .controls select").forEach((el) => el.addEventListener("input", render));
  $("reset").addEventListener("click", reset);
  render();
})(WielPrijs);
