// Experiment 2 - Lab Pass Studio
// Reads what the user types and rewrites parts of the page straight away.

const $ = (id) => document.getElementById(id);

const form = $("profileForm");
const inputs = {
  name: $("name"),
  enrollment: $("enrollment"),
  department: $("department"),
  semester: $("semester"),
  headline: $("headline"),
  about: $("about"),
};
const labels = {
  name: "Full name", enrollment: "Enrollment number", department: "Department",
  semester: "Semester", headline: "Headline", about: "About",
};
const required = ["name", "enrollment", "department"];

let nameCase = "normal";

// ---------- validation rules ----------
// each rule returns an error message, or "" when the value is fine
const rules = {
  name(v) {
    if (!v) return "Name is required";
    if (!/^[A-Za-z ]+$/.test(v)) return "Only letters and spaces are allowed";
    if (v.replace(/\s/g, "").length < 3) return "Too short, at least 3 letters";
    return "";
  },
  enrollment(v) {
    if (!v) return "Enrollment number is required";
    if (v.length !== 11) return `${v.length} of 11 digits entered`;
    return "";
  },
  department: (v) => (v ? "" : "Choose a department"),
  semester: () => "",
  headline: (v) => (v.length > 50 ? "Keep it under 50 characters" : ""),
  about: (v) => (v.length > 160 ? "Maximum is 160 characters" : ""),
};

const okText = {
  name: "Looks good", enrollment: "Valid enrollment number", department: "Selected",
  semester: "Selected", headline: "Added to the pass", about: "Added to the pass",
};

// ---------- helpers ----------
const toTitle = (s) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

function styledName(raw) {
  const clean = raw.trim().replace(/\s+/g, " ");
  if (nameCase === "upper") return clean.toUpperCase();
  if (nameCase === "title") return toTitle(clean);
  return clean;
}

function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts.at(-1)[0] : "")).toUpperCase();
}

function timeGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

// write text into an element and flash it, but only if it actually changed
function setText(el, value, fallback) {
  const next = value || fallback;
  if (el.textContent === next) return;
  el.textContent = next;
  el.classList.toggle("placeholder", !value);
  el.classList.remove("flash");
  void el.offsetWidth; // restart the animation
  el.classList.add("flash");
}

// draws simple barcode-style bars from the digits of the enrollment number
function drawBarcode(digits) {
  const svg = $("barcode");
  const src = (digits || "00000000000").padEnd(11, "0");
  let x = 0, bars = "";
  for (const ch of src) {
    const d = Number(ch);
    // every digit gives three bars of different widths
    const widths = [1 + (d % 3), 1 + ((d + 1) % 2), 2 + (d % 2)];
    for (const w of widths) {
      bars += `<rect x="${x}" y="0" width="${w * 1.6}" height="44" fill="currentColor"/>`;
      x += w * 1.6 + 2.2;
    }
  }
  svg.setAttribute("viewBox", `0 0 ${x} 44`);
  svg.innerHTML = bars;
}

// ---------- show the result of one field's rule ----------
const touched = new Set();

function checkField(key) {
  const input = inputs[key];
  const box = input.closest(".field");
  const hint = box.querySelector(".hint");
  const value = input.value.trim();
  const error = rules[key](value);

  box.classList.remove("valid", "invalid");
  if (!touched.has(key) || (!value && !required.includes(key))) {
    hint.textContent = hint.dataset.default;
    return !error;
  }
  box.classList.add(error ? "invalid" : "valid");
  hint.textContent = error || okText[key];
  return !error;
}

// ---------- main render: copy the form values into the page ----------
function render() {
  const v = {};
  for (const key in inputs) v[key] = inputs[key].value.trim();

  const shown = styledName(v.name);
  const first = shown.split(" ")[0];

  // headline and deck
  const greet = $("greeting");
  greet.textContent = `${timeGreeting()}, `;
  const em = document.createElement("em");
  em.textContent = first || "guest";
  greet.append(em, ".");

  $("deck").textContent = first
    ? `${first}, your pass is being written as you type. Finish the three required fields to issue it.`
    : "Fill in the form and the pass on the right is written for you, one keystroke at a time.";

  // the pass
  setText($("pvName"), shown, "Your name");
  setText($("pvHeadline"), v.headline, "Your headline");
  setText($("pvEnroll"), v.enrollment, "Not set");
  setText($("pvDept"), v.department, "Not set");
  setText($("pvSem"), v.semester.replace("Semester ", "Sem "), "Not set");
  setText($("pvAbout"), v.about, "Whatever you write in the About box appears here.");
  $("pvInitials").textContent = initials(v.name);
  $("pvCode").textContent = (v.enrollment || "").padEnd(11, "0");
  drawBarcode(v.enrollment);

  // about counter
  const len = inputs.about.value.length;
  $("aboutCounter").textContent = `${len}/160`;
  $("aboutCounter").classList.toggle("near", len >= 140);

  // completeness meter, required fields count double
  let score = 0, total = 0;
  for (const key in inputs) {
    const weight = required.includes(key) ? 2 : 1;
    total += weight;
    if (v[key] && !rules[key](v[key])) score += weight;
  }
  const pct = Math.round((score / total) * 100);
  $("pctValue").textContent = pct;
  $("pctFill").style.width = pct + "%";

  const missing = required.filter((k) => rules[k](v[k])).length;
  $("pctNote").textContent = missing
    ? `${missing} required field${missing > 1 ? "s" : ""} left`
    : "Ready to issue";

  // text statistics
  const all = [v.name, v.headline, v.about].join(" ").trim();
  const words = all ? all.split(/\s+/).length : 0;
  const secs = Math.ceil((words / 200) * 60); // about 200 words a minute
  $("stChars").textContent = all.replace(/\s/g, "").length;
  $("stWords").textContent = words;
  $("stRead").textContent = secs + "s";
}

// ---------- change log ----------
function logChange(text) {
  const list = $("log");
  const empty = list.querySelector(".empty");
  if (empty) empty.remove();

  // typing in the same field updates the top entry instead of adding a new one
  const top = list.firstElementChild;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  if (top && top.dataset.text === text) {
    top.querySelector("time").textContent = time;
    return;
  }
  const li = document.createElement("li");
  li.dataset.text = text;
  li.innerHTML = "<span></span><time></time>";
  li.querySelector("span").textContent = text;
  li.querySelector("time").textContent = time;
  list.prepend(li);
  while (list.children.length > 5) list.lastElementChild.remove();
}

// ---------- events ----------
// one listener on the form handles every field (event delegation)
function onFieldChange(e) {
  const key = e.target.getAttribute("name");
  if (!key || !(key in inputs)) return;

  if (key === "enrollment") e.target.value = e.target.value.replace(/\D/g, "");

  touched.add(key);
  checkField(key);
  render();
  $("stamp").classList.remove("on");
  logChange(`${labels[key]} edited`);
}

form.addEventListener("input", onFieldChange);
form.addEventListener("change", (e) => {
  if (e.target.tagName === "SELECT") onFieldChange(e);
});

$("swatches").addEventListener("click", (e) => {
  const btn = e.target.closest(".swatch");
  if (!btn) return;
  document.querySelectorAll(".swatch").forEach((s) => s.classList.toggle("active", s === btn));
  document.documentElement.style.setProperty("--pass", btn.dataset.color);
  logChange(`Accent set to ${btn.dataset.name}`);
});

$("caseControl").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  document.querySelectorAll("#caseControl button").forEach((b) => b.classList.toggle("active", b === btn));
  nameCase = btn.dataset.case;
  render();
  logChange(`Name style: ${btn.textContent}`);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  Object.keys(inputs).forEach((k) => touched.add(k));
  const allValid = Object.keys(inputs).map(checkField).every(Boolean);

  if (allValid) {
    $("stamp").classList.add("on");
    showToast(`Pass issued to ${styledName(inputs.name.value)}`);
    logChange("Pass issued");
  } else {
    const firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
    if (firstBad) firstBad.focus();
    showToast("Some fields need fixing first");
  }
});

$("resetBtn").addEventListener("click", () => {
  form.reset();
  touched.clear();
  Object.keys(inputs).forEach(checkField);
  $("stamp").classList.remove("on");
  render();
  logChange("Form cleared");
});

let toastTimer;
function showToast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

// ---------- theme (remembered between visits) ----------
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $("themeBtn").textContent = theme === "dark" ? "Light mode" : "Dark mode";
}
$("themeBtn").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("iwd-theme", next); } catch (err) { /* storage blocked */ }
});
try { applyTheme(localStorage.getItem("iwd-theme") || "light"); } catch (err) { applyTheme("light"); }

// ---------- clock in the masthead ----------
function tick() {
  const now = new Date();
  $("clock").textContent = now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) +
    "  " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  $("pvYear").textContent = now.getFullYear();
}
tick();
setInterval(tick, 30000);

render();
