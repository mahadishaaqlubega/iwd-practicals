// Experiment 3 - The Sales Ledger
// Line and bar charts built with Chart.js, plus statistics worked out from the same dataset.

const $ = (id) => document.getElementById(id);

// ---------- dataset (from the practical sheet) ----------
const ORIGINAL = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  sales:  [120, 150, 180, 170, 210, 240],
  orders: [50, 60, 75, 68, 85, 95],
};
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// working copy, so "Reset data" can bring the original back
let data = structuredClone(ORIGINAL);
let range = "all";
let newRowIndex = -1;

// ---------- statistics helpers ----------
const sum = (a) => a.reduce((t, x) => t + x, 0);
const mean = (a) => sum(a) / a.length;
function median(a) {
  const s = [...a].sort((x, y) => x - y);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function stdDev(a) {
  const m = mean(a);
  return Math.sqrt(mean(a.map((x) => (x - m) ** 2)));
}
function correlation(a, b) {
  const ma = mean(a), mb = mean(b);
  let top = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) {
    top += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return top / Math.sqrt(da * db);
}
const fmt = (n, d = 0) => n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

// months for the selected period
function currentSlice() {
  let start = 0, end = data.months.length;
  if (range === "q1") end = 3;
  if (range === "q2") { start = 3; end = 6; }
  return {
    start,
    months: data.months.slice(start, end),
    sales: data.sales.slice(start, end),
    orders: data.orders.slice(start, end),
  };
}

// ---------- chart colours come from CSS, so they follow the theme ----------
function colors() {
  const css = getComputedStyle(document.documentElement);
  const get = (v) => css.getPropertyValue(v).trim();
  return { s1: get("--s1"), s2: get("--s2"), ink: get("--ink"), ink2: get("--ink-2"), ink3: get("--ink-3"), rule: get("--rule"), paper: get("--paper"), card: get("--card") };
}

function applyChartDefaults() {
  const c = colors();
  Chart.defaults.font.family = "Heros, 'Helvetica Neue', Helvetica, Arial, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = c.ink2;
  Chart.defaults.borderColor = c.rule;
}

const titleFont = { family: "Pagella, Palatino, Georgia, serif", size: 15, weight: "normal" };

function tooltipStyle(c) {
  return {
    backgroundColor: c.card,
    borderColor: c.ink,
    borderWidth: 1,
    titleColor: c.ink,
    bodyColor: c.ink,
    footerColor: c.ink2,
    titleFont: { ...titleFont, size: 16 },
    footerFont: { weight: "normal", size: 12 },
    padding: 12,
    cornerRadius: 0,
    boxPadding: 5,
    usePointStyle: true,
  };
}

function legendStyle(pointStyle) {
  return { position: "bottom", align: "start", labels: { usePointStyle: true, pointStyle, boxWidth: 22, padding: 18 } };
}

// light fill under the sales line
function salesFill(context) {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return "transparent";
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  const base = colors().s1;
  g.addColorStop(0, base + "1f");
  g.addColorStop(1, base + "00");
  return g;
}

// ---------- line chart ----------
let lineChart, barChart;

function buildLineChart(tension = 0.4) {
  const c = colors();
  const s = currentSlice();
  const point = { pointRadius: 3.5, pointHoverRadius: 6, pointBackgroundColor: c.paper, pointBorderWidth: 2, tension };

  lineChart = new Chart($("lineChart"), {
    type: "line",
    data: {
      labels: s.months,
      datasets: [
        { label: "Sales", data: s.sales, borderColor: c.s1, backgroundColor: salesFill, fill: true, borderWidth: 2.5, yAxisID: "y", ...point },
        { label: "Orders", data: s.orders, borderColor: c.s2, backgroundColor: c.s2, borderWidth: 2.5, borderDash: [5, 4], yAxisID: "y1", ...point },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        title: { display: true, text: "Monthly sales and orders", align: "start", color: c.ink, font: titleFont, padding: { bottom: 16 } },
        legend: legendStyle("line"),
        tooltip: {
          ...tooltipStyle(c),
          callbacks: {
            footer: (items) => {
              const i = items[0].dataIndex;
              const sales = lineChart.data.datasets[0].data[i];
              const orders = lineChart.data.datasets[1].data[i];
              return `Sales per order  ${(sales / orders).toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false }, border: { color: c.ink } },
        y: { position: "left", grace: "8%", border: { display: false }, grid: { color: c.rule, drawTicks: false }, ticks: { padding: 8 }, title: { display: true, text: "Sales", color: c.ink3 } },
        y1: { position: "right", grace: "8%", border: { display: false }, grid: { drawOnChartArea: false, drawTicks: false }, ticks: { padding: 8 }, title: { display: true, text: "Orders", color: c.ink3 } },
      },
    },
  });
}

// ---------- bar chart ----------
function buildBarChart(horizontal = false) {
  const c = colors();
  const s = currentSlice();
  const valueAxis = { beginAtZero: true, border: { display: false }, grid: { color: c.rule, drawTicks: false }, ticks: { padding: 8 } };
  const catAxis = { grid: { display: false }, border: { color: c.ink } };

  barChart = new Chart($("barChart"), {
    type: "bar",
    data: {
      labels: s.months,
      datasets: [
        { label: "Sales", data: s.sales, backgroundColor: c.s1, borderRadius: 0, maxBarThickness: 26, categoryPercentage: 0.62, barPercentage: 0.9 },
        { label: "Orders", data: s.orders, backgroundColor: c.s2, borderRadius: 0, maxBarThickness: 26, categoryPercentage: 0.62, barPercentage: 0.9 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: horizontal ? "y" : "x",
      plugins: {
        title: { display: true, text: "Sales and orders by month", align: "start", color: c.ink, font: titleFont, padding: { bottom: 16 } },
        legend: legendStyle("rect"),
        tooltip: tooltipStyle(c),
      },
      scales: horizontal ? { x: valueAxis, y: catAxis } : { x: catAxis, y: valueAxis },
    },
  });
}

// ---------- headline figures and tables ----------
function renderNumbers() {
  const s = currentSlice();
  const totalSales = sum(s.sales);
  const totalOrders = sum(s.orders);
  const growth = ((s.sales.at(-1) - s.sales[0]) / s.sales[0]) * 100;

  $("kpiSales").textContent = fmt(totalSales);
  $("kpiSalesSub").textContent = `${fmt(mean(s.sales), 1)} a month on average`;
  $("kpiOrders").textContent = fmt(totalOrders);
  $("kpiOrdersSub").textContent = `${fmt(mean(s.orders), 1)} a month on average`;
  $("kpiRatio").textContent = (totalSales / totalOrders).toFixed(2);
  $("kpiGrowth").textContent = (growth >= 0 ? "+" : "") + growth.toFixed(1) + "%";
  const gs = $("kpiGrowthSub");
  gs.textContent = `${s.months[0]} to ${s.months.at(-1)}`;
  gs.className = "kpi-sub " + (growth >= 0 ? "up" : "down");

  // statistics table
  const at = (arr, v) => s.months[arr.indexOf(v)];
  const hi = (arr) => Math.max(...arr);
  const lo = (arr) => Math.min(...arr);
  const rows = [
    ["Total", fmt(totalSales), fmt(totalOrders)],
    ["Mean", fmt(mean(s.sales), 2), fmt(mean(s.orders), 2)],
    ["Median", fmt(median(s.sales), 1), fmt(median(s.orders), 1)],
    ["Highest", `${hi(s.sales)}<small>${at(s.sales, hi(s.sales))}</small>`, `${hi(s.orders)}<small>${at(s.orders, hi(s.orders))}</small>`],
    ["Lowest", `${lo(s.sales)}<small>${at(s.sales, lo(s.sales))}</small>`, `${lo(s.orders)}<small>${at(s.orders, lo(s.orders))}</small>`],
    ["Range", hi(s.sales) - lo(s.sales), hi(s.orders) - lo(s.orders)],
    ["Standard deviation", fmt(stdDev(s.sales), 2), fmt(stdDev(s.orders), 2)],
  ];
  $("statsBody").innerHTML = rows.map((r) => `<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td></tr>`).join("");

  const r = correlation(s.sales, s.orders);
  const label = range === "all" ? "All months" : `${s.months[0]} to ${s.months.at(-1)}`;
  $("statsCaption").textContent = `${label}, ${s.months.length} entries. Correlation between sales and orders: r = ${r.toFixed(3)}`;

  // raw data with month-on-month change in sales
  $("dataBody").innerHTML = s.months.map((m, i) => {
    const g = s.start + i;
    const prev = data.sales[g - 1];
    let change = '<span class="delta flat">&ndash;</span>';
    if (prev !== undefined) {
      const ch = ((s.sales[i] - prev) / prev) * 100;
      const cls = ch > 0 ? "up" : ch < 0 ? "down" : "flat";
      const arrow = ch > 0 ? "↑" : ch < 0 ? "↓" : "";
      change = `<span class="delta ${cls}">${arrow} ${Math.abs(ch).toFixed(1)}%</span>`;
    }
    const cls = g === newRowIndex ? ' class="new-row"' : "";
    return `<tr${cls}><td>${m}</td><td class="num">${s.sales[i]}</td><td class="num">${s.orders[i]}</td><td>${change}</td></tr>`;
  }).join("");
}

// send the current slice to both charts
function refresh() {
  const s = currentSlice();
  for (const chart of [lineChart, barChart]) {
    chart.data.labels = s.months;
    chart.data.datasets[0].data = s.sales;
    chart.data.datasets[1].data = s.orders;
    chart.update();
  }
  renderNumbers();
}

// ---------- adding data ----------
function addMonth(sales, orders) {
  const next = MONTH_NAMES[MONTH_NAMES.indexOf(data.months.at(-1)) + 1] || "Jan";
  data.months.push(next);
  data.sales.push(sales);
  data.orders.push(orders);
  // keep at most 12 months on screen
  if (data.months.length > 12) {
    data.months.shift(); data.sales.shift(); data.orders.shift();
  }
  newRowIndex = data.months.length - 1;
  return next;
}

function message(text, type = "") {
  const msg = $("formMsg");
  msg.textContent = text;
  msg.className = "form-msg " + type;
}

$("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const salesBox = $("newSales"), ordersBox = $("newOrders");
  const sales = Number(salesBox.value);
  const orders = Number(ordersBox.value);

  if (!salesBox.value || !ordersBox.value) return message("Enter both sales and orders.", "err");
  if (sales <= 0 || orders <= 0 || !Number.isInteger(sales) || !Number.isInteger(orders)) {
    return message("Use whole numbers greater than zero.", "err");
  }
  if (orders > sales) return message("Orders cannot be more than sales in this dataset.", "err");

  const added = addMonth(sales, orders);
  setRange("all");
  message(`${added} added. Charts and statistics updated.`, "ok");
  e.target.reset();
});

// live feed: a new month every 2.5 seconds, roughly following the trend
let liveTimer = null;
$("liveBtn").addEventListener("click", () => {
  const badge = $("liveBadge");
  if (liveTimer) {
    clearInterval(liveTimer);
    liveTimer = null;
    $("liveBtn").textContent = "Start live feed";
    badge.textContent = "Static data";
    badge.classList.remove("on");
    return;
  }
  setRange("all");
  $("liveBtn").textContent = "Stop live feed";
  badge.textContent = "Live feed";
  badge.classList.add("on");
  liveTimer = setInterval(() => {
    const sales = Math.max(60, Math.round(data.sales.at(-1) + (Math.random() * 60 - 25)));
    const orders = Math.round(sales / (2.3 + Math.random() * 0.3));
    addMonth(sales, orders);
    refresh();
  }, 2500);
});

$("resetBtn").addEventListener("click", () => {
  data = structuredClone(ORIGINAL);
  newRowIndex = -1;
  message("Data reset to the original six months.");
  setRange("all");
});

// ---------- controls ----------
function activate(groupId, btn) {
  document.querySelectorAll(`#${groupId} button`).forEach((b) => b.classList.toggle("active", b === btn));
}

function setRange(value) {
  range = value;
  activate("rangeControl", document.querySelector(`#rangeControl [data-range="${value}"]`));
  refresh();
}

$("rangeControl").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (btn) setRange(btn.dataset.range);
});

$("lineMode").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  activate("lineMode", btn);
  lineChart.data.datasets.forEach((d) => (d.tension = Number(btn.dataset.tension)));
  lineChart.update();
});

$("barMode").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  activate("barMode", btn);
  barChart.destroy();
  buildBarChart(btn.dataset.mode === "horizontal");
});

// ---------- theme ----------
// Chart.js keeps the colours it was built with, so both charts are rebuilt on a theme change
function rebuildCharts() {
  const tension = Number(document.querySelector("#lineMode .active").dataset.tension);
  const horizontal = document.querySelector("#barMode .active").dataset.mode === "horizontal";
  lineChart.destroy();
  barChart.destroy();
  applyChartDefaults();
  buildLineChart(tension);
  buildBarChart(horizontal);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $("themeBtn").textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

$("themeBtn").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("iwd-theme", next); } catch (err) { /* storage blocked */ }
  rebuildCharts();
});

// ---------- start ----------
try { applyTheme(localStorage.getItem("iwd-theme") || "light"); } catch (err) { applyTheme("light"); }

if (typeof Chart === "undefined") {
  document.querySelector(".charts").innerHTML =
    '<p class="sub" style="padding:40px 0">Chart.js could not be loaded. Check the internet connection and refresh.</p>';
} else {
  // wait for the web fonts so the chart text is measured with the right font
  document.fonts.ready.then(() => {
    applyChartDefaults();
    buildLineChart();
    buildBarChart();
    renderNumbers();
  });
}
