// Experiment 1 - AI Project Portfolio
// Projects and client sites are kept as data and rendered by JavaScript,
// so adding a new project only means adding one object to the list.

const $ = (id) => document.getElementById(id);

const projects = [
  {
    title: "Environment fingerprinting in AI agents",
    text: "A bachelor's research paper on self-locating inference: how an agent with limited sensors can work out which environment it is running in, studied through a small computational experiment.",
    tags: ["Research", "AI agents", "IEEE paper"],
    type: "ai",
    status: "In progress",
  },
  {
    title: "Agentic AI seminar and poster",
    text: "A seminar talk and A3 research poster on LLM-powered autonomous agents: how they plan, call tools and check their own work, and where they still fail.",
    tags: ["LLM agents", "Seminar", "Poster"],
    type: "ai",
    status: "Semester 5",
  },
  {
    title: "The Sales Ledger",
    text: "An interactive dashboard with Chart.js line and bar charts, live statistics (mean, median, standard deviation, correlation) and a simulated data feed.",
    tags: ["Data visualisation", "Chart.js", "Statistics"],
    type: "ai",
    status: "IWD Experiment 3",
    link: "../experiment-3/",
  },
  {
    title: "Aadhaar and biometric ID: a data ethics study",
    text: "A group study for Data Ethics and Privacy on national biometric ID systems, weighing inclusion against the risk of exclusion and data leaks.",
    tags: ["Data ethics", "Privacy"],
    type: "ai",
    status: "Coursework",
  },
  {
    title: "Stockdesk",
    text: "An inventory and point-of-sale system for small shops, with a separate back end deployed on Railway.",
    tags: ["Full stack", "Inventory", "POS"],
    type: "systems",
    status: "Live",
    link: "https://stockdeskinventory.com",
  },
  {
    title: "Lumen, a toy programming language",
    text: "A small language built to learn how compilers work: lexer, parser, syntax tree and a code generator that turns Lumen into Python.",
    tags: ["Compilers", "Python"],
    type: "systems",
    status: "Learning project",
  },
  {
    title: "Lab Pass Studio",
    text: "A responsive form where the headline, a lab pass and text statistics are rewritten on every keystroke, with validation on each field.",
    tags: ["DOM", "Events", "Validation"],
    type: "systems",
    status: "IWD Experiment 2",
    link: "../experiment-2/",
  },
];

const clients = [
  { name: "Stockdesk", what: "Inventory and POS", url: "https://stockdeskinventory.com" },
  { name: "Institchu", what: "Clothing brand, Australia", url: "https://institchu.com" },
  { name: "Songserm", what: "Travel and booking", url: "https://songserm.com" },
  { name: "Sikyomu Doctors Hospital", what: "Hospital, Uganda", url: "https://sikyomudoctorshospital.com" },
  { name: "Shaping Destinies", what: "Wonder Christian Centre, Uganda", url: "https://shapingdestinies.com" },
  { name: "Orchards of Hope Uganda", what: "Non-profit", url: "https://orchardsofhopeuganda.com" },
  { name: "Oasis Funeral Services", what: "Funeral services", url: "https://oasisfuneralservices.com" },
];

// ---------- render projects ----------
function renderProjects(filter = "all") {
  const list = $("projectList");
  const shown = projects.filter((p) => filter === "all" || p.type === filter);
  list.innerHTML = "";

  shown.forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "project";
    li.style.animationDelay = `${i * 60}ms`;

    const num = document.createElement("span");
    num.className = "num";
    num.textContent = String(i + 1).padStart(2, "0");

    const body = document.createElement("div");
    const h3 = document.createElement("h3");
    h3.textContent = p.title;
    const text = document.createElement("p");
    text.textContent = p.text;
    const tags = document.createElement("p");
    tags.className = "tags";
    tags.textContent = p.tags.join(" · ");
    body.append(h3, text, tags);

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = "<b></b>";
    meta.querySelector("b").textContent = p.status;
    if (p.link) {
      const a = document.createElement("a");
      a.href = p.link;
      a.textContent = p.link.startsWith("http") ? "Visit site" : "Open demo";
      if (p.link.startsWith("http")) { a.target = "_blank"; a.rel = "noopener"; }
      meta.append(a);
    }

    li.append(num, body, meta);
    list.append(li);
  });

  $("filterCount").textContent = `${shown.length} of ${projects.length} projects`;
}

// ---------- render client list ----------
function renderClients() {
  $("clientList").innerHTML = clients.map((c) =>
    `<li><a href="${c.url}" target="_blank" rel="noopener"><strong>${c.name}</strong><span>${c.what}</span></a></li>`
  ).join("");
}

// ---------- count-up numbers in the hero ----------
function countUp(el, target) {
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / 900, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------- events ----------
$("filter").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  document.querySelectorAll("#filter button").forEach((b) => b.classList.toggle("active", b === btn));
  renderProjects(btn.dataset.filter);
});

// mobile menu
const menuBtn = $("menuBtn");
menuBtn.addEventListener("click", () => {
  const open = $("nav").classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
$("nav").addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    $("nav").classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

// highlight the nav link of the section on screen
const links = [...document.querySelectorAll(".nav a")];
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      links.forEach((a) => a.classList.toggle("current", a.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });
document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));

// theme, remembered between visits
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

// ---------- start ----------
$("year").textContent = new Date().getFullYear();
renderProjects();
renderClients();
countUp($("countProjects"), projects.length);
countUp($("countClients"), clients.length);
