// Better Auth–style link analytics dashboard
const STATS_GREEN = "rgb(36, 203, 113)";
const STATS_CHART_LINE = "#71717a";
const STATS_RED = "rgb(239, 68, 68)";
const STATS_MUTED = "#a1a1aa";

const PERIOD_LABELS = {
  day: "day",
  week: "week",
  month: "month",
  year: "year",
};

const TREND_UP = `<svg class="stats-delta-icon up" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M23 6L13.5 15.5L8.5 10.5L1 18"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 6H23V12"/></svg>`;
const TREND_DOWN = `<svg class="stats-delta-icon down" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M23 18L13.5 8.5L8.5 13.5L1 6"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 18H23V12"/></svg>`;
const TREND_UP_FOOT = `<svg class="stats-delta-icon up" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7h6v6"/><path stroke-linecap="round" stroke-linejoin="round" d="m22 7-8.5 8.5-5-5L2 17"/></svg>`;

if (window.Chart) {
  Chart.defaults.color = STATS_MUTED;
  Chart.defaults.borderColor = "rgba(255, 255, 255, 0.06)";
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
  Chart.defaults.font.size = 11;
}

const CHART_TOOLTIP = {
  backgroundColor: "rgba(10, 10, 10, 0.97)",
  titleColor: "#a1a1aa",
  titleFont: { weight: "normal", size: 13 },
  bodyFont: { weight: "600", size: 14 },
  bodyColor: STATS_GREEN,
  padding: 10,
  cornerRadius: 6,
  borderColor: "rgba(255, 255, 255, 0.1)",
  borderWidth: 1,
  displayColors: false,
};

let regionNames;
try {
  regionNames = new Intl.DisplayNames(["en"], { type: "region" });
} catch (_) {
  regionNames = null;
}

function setStatsDate() {
  const el = document.getElementById("stats-dash-date");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function countryFlag(code) {
  if (!code || code.length !== 2) return "🌐";
  return code.toUpperCase().split("").map(c =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  ).join("");
}

function countryLabel(code) {
  if (regionNames) {
    try { return regionNames.of(code.toUpperCase()); } catch (_) {}
  }
  return code.toUpperCase();
}

function halfTrend(data) {
  if (!data || !data.length) return { percent: 0, up: false };
  const mid = Math.floor(data.length / 2);
  const first = data.slice(0, mid).reduce((a, b) => a + b, 0);
  const second = data.slice(mid).reduce((a, b) => a + b, 0);
  if (first === 0) return { percent: second > 0 ? 100 : 0, up: second >= first };
  return { percent: ((second - first) / first) * 100, up: second >= first };
}

function periodTotal(data) {
  if (!data || !data.length) return 0;
  return data.reduce((a, b) => a + b, 0);
}

function deltaHtml(percent, period, { footer = false, compact = false } = {}) {
  const abs = Math.abs(percent).toFixed(1);
  const isUp = percent > 0;
  const isDown = percent < 0;
  const pctClass = isUp ? "up" : isDown ? "down" : "";
  const icon = isUp
    ? (footer ? TREND_UP_FOOT : TREND_UP)
    : isDown
      ? TREND_DOWN
      : "";

  if (compact) {
    if (percent === 0) {
      return `<span class="stats-delta-pct">0.0%</span><span class="stats-delta-suffix">unchanged</span>`;
    }
    const suffix = period === "day" ? " vs yesterday" : " vs last week";
    const word = isUp ? "up" : "down";
    return `${icon}<span class="stats-delta-pct ${pctClass}">${abs}%</span><span class="stats-delta-suffix">${word}${suffix}</span>`;
  }

  const direction = isUp ? "increase" : isDown ? "decrease" : "no change";
  const suffix = period ? ` from previous ${PERIOD_LABELS[period]}` : " from previous period";
  return `${icon}<span class="stats-delta-pct ${pctClass}">${abs}%</span><span class="stats-delta-suffix">${direction}${suffix}</span>`;
}

function applyDelta(el, percent, period, options) {
  if (!el) return;
  el.innerHTML = deltaHtml(percent, period, options);
}

function mapDeltaHtml(percent) {
  const abs = Math.abs(percent).toFixed(1);
  const isUp = percent > 0;
  const isDown = percent < 0;
  const sign = isUp ? "+" : "";
  const icon = isUp ? TREND_UP_FOOT : isDown ? TREND_DOWN : "";
  const pctClass = isUp ? "up" : isDown ? "down" : "";
  return `${icon}<span class="stats-delta-pct ${pctClass}">${sign}${abs}%</span>`;
}

function createViewsChartLabel(ctx) {
  const period = ctx.dataset.period;
  let labels = [];

  if (period === "day") {
    const nowHour = new Date().getHours();
    for (let i = 23; i >= 0; --i) {
      let h = nowHour - i;
      if (h < 0) h = 24 + h;
      labels.push(`${Math.floor(h)}:00`);
    }
  }

  if (period === "week") {
    const nowDay = new Date().getDate();
    for (let i = 6; i >= 0; --i) {
      const date = new Date(new Date().setDate(nowDay - i));
      labels.push(`${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`);
    }
  }

  if (period === "month") {
    const nowDay = new Date().getDate();
    for (let i = 29; i >= 0; --i) {
      const date = new Date(new Date().setDate(nowDay - i));
      labels.push(`${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`);
    }
  }

  if (period === "year") {
    const nowMonth = new Date().getMonth();
    for (let i = 11; i >= 0; --i) {
      const date = new Date(new Date().setMonth(nowMonth - i));
      labels.push(`${date.toLocaleString("default", { month: "short" })}`);
    }
  }

  return labels;
}

function changeStatsPeriod(event) {
  const period = event.target.dataset.period;
  if (!period) return;
  const root = document.querySelector("#stats");
  if (!root) return;

  root.querySelectorAll(".stats-tab").forEach(b => b.disabled = false);
  event.target.disabled = true;

  root.querySelectorAll([
    ".stats-chart-delta",
    ".stats-range",
    "canvas.visits",
    ".stats-country-list",
    ".stats-device-list",
    ".stats-big-num",
  ].join(",")).forEach(el => {
    if (el.dataset.period === period) el.classList.remove("hidden");
    else el.classList.add("hidden");
  });

  feedMapData(period);
}

function beautifyBrowserName(name) {
  const map = { firefox: "Firefox", chrome: "Chrome", edge: "Edge", opera: "Opera", safari: "Safari", other: "Other", ie: "IE" };
  return map[name] || name;
}

function beautifyOsName(name) {
  const map = { android: "Android", ios: "iOS", linux: "Linux", macos: "macOS", windows: "Windows", other: "Other" };
  return map[name] || name;
}

function labelForKind(kind, name) {
  if (kind === "browser") return beautifyBrowserName(name);
  if (kind === "os") return beautifyOsName(name);
  if (kind === "country") return countryLabel(name);
  return name.replace(/\[dot\]/g, ".") || "Direct";
}

function renderCountryLists() {
  document.querySelectorAll(".stats-country-list").forEach(list => {
    let data = [];
    try { data = JSON.parse(list.dataset.data || "[]"); } catch (_) {}
    list.innerHTML = "";

    if (!data.length) {
      list.innerHTML = `<li class="stats-empty">No country data for this period</li>`;
      return;
    }

    const max = data[0].value || 1;
    const total = data.reduce((s, d) => s + d.value, 0);

    data.slice(0, 6).forEach((item, index) => {
      const pct = total ? ((item.value / total) * 100).toFixed(1) : "0.0";
      const barPct = ((item.value / max) * 100).toFixed(1);
      const li = document.createElement("li");
      li.className = "stats-country-item";
      li.innerHTML = `
        <div class="stats-country-row">
          <div class="stats-country-left">
            <span class="stats-country-rank">#${index + 1}</span>
            <span class="stats-country-flag">${countryFlag(item.name)}</span>
            <span class="stats-country-name">${countryLabel(item.name)}</span>
          </div>
          <div class="stats-country-right">
            <span class="stats-country-count">${item.value}</span>
            <span class="stats-country-pct">${pct}%</span>
          </div>
        </div>
        <div class="stats-country-bar"><span style="width:${barPct}%"></span></div>
      `;
      list.appendChild(li);
    });
  });
}

function renderDeviceLists() {
  document.querySelectorAll(".stats-device-list").forEach(list => {
    const kind = list.dataset.kind;
    let data = [];
    try { data = JSON.parse(list.dataset.data || "[]"); } catch (_) {}
    list.innerHTML = "";

    if (!data.length) {
      list.innerHTML = `<li class="stats-empty">No data for this period</li>`;
      return;
    }

    const total = data.reduce((s, d) => s + d.value, 0);

    data.slice(0, 4).forEach(item => {
      const name = labelForKind(kind, item.name);
      const pct = total ? ((item.value / total) * 100).toFixed(1) : "0.0";
      const li = document.createElement("li");
      li.className = "stats-device-item";
      li.innerHTML = `
        <span class="stats-device-name">${name}</span>
        <span class="stats-device-meta">${item.value} views · ${pct}% of traffic</span>
      `;
      list.appendChild(li);
    });
  });
}

function updateTrendLabels() {
  ["day", "week", "month", "year"].forEach(period => {
    const canvas = document.querySelector(`canvas.visits[data-period="${period}"]`);
    if (!canvas) return;
    let data = [];
    try { data = JSON.parse(canvas.dataset.data || "[]"); } catch (_) {}
    applyDelta(
      document.querySelector(`.stats-chart-delta[data-period="${period}"]`),
      halfTrend(data).percent,
      period,
      { footer: true }
    );
  });

  const weekCanvas = document.querySelector('canvas.visits[data-period="week"]');
  const dayCanvas = document.querySelector('canvas.visits[data-period="day"]');
  let weekData = [];
  let dayData = [];
  try { weekData = JSON.parse(weekCanvas?.dataset.data || "[]"); } catch (_) {}
  try { dayData = JSON.parse(dayCanvas?.dataset.data || "[]"); } catch (_) {}

  applyDelta(
    document.querySelector('.stats-metric-delta[data-metric="total"]'),
    halfTrend(weekData).percent
  );
  applyDelta(
    document.querySelector('.stats-metric-delta[data-metric="day"]'),
    halfTrend(dayData).percent,
    "day"
  );

  updateMapDelta();
}

function updateMapDelta() {
  const el = document.querySelector(".stats-map-delta");
  if (!el) return;

  const weekCanvas = document.querySelector('canvas.visits[data-period="week"]');
  const monthCanvas = document.querySelector('canvas.visits[data-period="month"]');
  if (!weekCanvas || !monthCanvas) return;

  let weekData = [];
  let monthData = [];
  try { weekData = JSON.parse(weekCanvas.dataset.data || "[]"); } catch (_) {}
  try { monthData = JSON.parse(monthCanvas.dataset.data || "[]"); } catch (_) {}

  const weekTotal = periodTotal(weekData);
  const monthTotal = periodTotal(monthData);
  const prev = monthTotal - weekTotal;
  let percent = 0;
  if (prev > 0) percent = ((weekTotal - prev) / prev) * 100;
  else if (weekTotal > 0) percent = 100;

  el.innerHTML = mapDeltaHtml(percent);
}

function createViewsChart() {
  const canvases = document.querySelectorAll("canvas.visits");
  if (!canvases.length) return;

  canvases.forEach(ctx => {
    const data = JSON.parse(ctx.dataset.data);
    const period = ctx.dataset.period;
    const labels = createViewsChartLabel(ctx);
    const maxTicksLimitX = period === "year" ? 6 : period === "month" ? 10 : 7;

    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Views",
          data,
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: STATS_CHART_LINE,
          pointBorderColor: STATS_CHART_LINE,
          pointBorderWidth: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: STATS_CHART_LINE,
          fill: false,
          borderColor: STATS_CHART_LINE,
          borderWidth: 2,
        }]
      },
      options: {
        plugins: { legend: { display: false }, tooltip: CHART_TOOLTIP },
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        scales: {
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: "rgba(255, 255, 255, 0.06)", drawTicks: false },
            ticks: { maxTicksLimit: 4, color: STATS_MUTED, padding: 8 },
          },
          x: {
            border: { display: false },
            grid: { display: false, drawTicks: false },
            ticks: { maxTicksLimit: maxTicksLimitX, color: STATS_MUTED, maxRotation: 0, padding: 8 },
          }
        }
      }
    });
  });
}

function feedMapData(period) {
  const map = document.querySelector("svg.map");
  if (!map) return;

  let data = [];
  try { data = JSON.parse(map.dataset[period || "week"] || "[]"); } catch (_) {}

  let max = data.sort((a, b) => a.value > b.value ? -1 : 1)[0];
  if (!max) max = { value: 1 };

  const lookup = data.reduce((a, c) => ({ ...a, [c.name]: c.value }), {});

  map.querySelectorAll("path").forEach(path => {
    const views = lookup[path.dataset.id] || 0;
    path.dataset.views = views;
    const colorLevel = Math.ceil((views / max.value) * 6) || 0;
    for (let j = 1; j < 7; j++) path.classList.remove(`color-${j}`);
    if (colorLevel) path.classList.add(`color-${colorLevel}`);
  });
}

function mapTooltipHoverOver() {
  const tooltip = document.querySelector("#map-tooltip");
  if (!tooltip) return;
  if (!event.target.dataset.id) return mapTooltipHoverOut();
  tooltip.classList.add("visible");
  tooltip.dataset.tooltip = `${event.target.ariaLabel}: ${event.target.dataset.views || 0}`;
  const rect = event.target.getBoundingClientRect();
  tooltip.style.top = rect.top + rect.height / 2 + "px";
  tooltip.style.left = rect.left + rect.width / 2 + "px";
  event.target.classList.add("active");
}

function mapTooltipHoverOut() {
  const tooltip = document.querySelector("#map-tooltip");
  const map = document.querySelector("svg.map");
  if (!tooltip || !map) return;
  tooltip.classList.remove("visible");
  map.querySelectorAll("path").forEach(p => p.classList.remove("active"));
}

function createCharts() {
  if (typeof Chart === "undefined") {
    setTimeout(createCharts, 100);
    return;
  }
  createViewsChart();
  feedMapData("week");
}

function initStatsDashboard() {
  setStatsDate();
  renderCountryLists();
  renderDeviceLists();
  updateTrendLabels();
  createCharts();
}
