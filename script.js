"use strict";

const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const indexToggle = document.querySelector(".index-toggle");
const indexMenu = document.querySelector("#site-index");
const indexClose = document.querySelector(".index-close");
const progressBar = document.querySelector(".scroll-progress span");
const backToTop = document.querySelector(".back-to-top");
const toast = document.querySelector(".interaction-toast");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const dashboard = document.querySelector(".dashboard-card");
const chartButtons = [...document.querySelectorAll(".chart-switch")];
const chartBars = [...document.querySelectorAll(".chart-bar")];
const chartPath = document.querySelector(".chart-line path");

const chartViews = {
  energy: {
    title: "Energy patterns",
    value: "+24.8%",
    caption: "pattern spotted across sample data",
    badge: "↗ TREND",
    bars: [34, 48, 42, 67, 57, 79, 63, 89, 72],
    path: "M2 87 C38 84 47 60 82 67 S123 75 151 50 S194 57 220 35 S261 52 292 27 S332 26 358 9",
    color: "#95e0c3",
  },
  quality: {
    title: "Quality signals",
    value: "3 signals",
    caption: "indicators highlighted in sample data",
    badge: "✳ EDA",
    bars: [66, 42, 78, 53, 86, 62, 92, 70, 83],
    path: "M2 72 C35 61 46 83 82 52 S124 61 151 42 S194 63 220 28 S263 41 292 18 S329 36 358 12",
    color: "#c5b2ff",
  },
};

function setTheme(isDark) {
  root.dataset.theme = isDark ? "dark" : "light";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
  themeToggle.title = `Switch to ${isDark ? "light" : "dark"} theme`;
  themeIcon.textContent = isDark ? "☀" : "☾";
  document.querySelector('meta[name="theme-color"]').content = isDark ? "#101018" : "#151426";
}

themeToggle.addEventListener("click", () => {
  setTheme(root.dataset.theme !== "dark");
});

function setIndexOpen(isOpen) {
  indexMenu.hidden = !isOpen;
  indexToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("index-open", isOpen);

  if (isOpen) {
    indexClose.focus();
  } else {
    indexToggle.focus();
  }
}

indexToggle.addEventListener("click", () => {
  setIndexOpen(indexMenu.hidden);
});
indexClose.addEventListener("click", () => setIndexOpen(false));
indexMenu.querySelectorAll('.nav-list a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => setIndexOpen(false));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !indexMenu.hidden) setIndexOpen(false);
});

function showChart(viewName) {
  const view = chartViews[viewName];
  if (!view) return;

  dashboard.dataset.chartMode = viewName;
  document.querySelector(".chart-title").textContent = view.title;
  document.querySelector(".chart-stat").textContent = view.value;
  document.querySelector(".chart-caption").textContent = view.caption;
  document.querySelector(".chart-badge").textContent = view.badge;
  chartPath.setAttribute("d", view.path);
  chartPath.style.stroke = view.color;
  document.querySelector(".chart-line circle").style.fill = view.color;
  chartBars.forEach((bar, index) => {
    bar.style.setProperty("--bar-height", `${view.bars[index]}%`);
  });
  chartButtons.forEach((button) => {
    const selected = button.dataset.chart === viewName;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

chartButtons.forEach((button) => {
  button.addEventListener("click", () => showChart(button.dataset.chart));
});

dashboard.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse" || prefersReducedMotion.matches) return;
  const bounds = dashboard.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  const rotateY = (x - 0.5) * 7 - 2;
  const rotateX = (0.5 - y) * 5 + 2;

  dashboard.style.setProperty("--tilt-x", `${rotateX}deg`);
  dashboard.style.setProperty("--tilt-y", `${rotateY}deg`);
  dashboard.style.setProperty("--light-x", `${x * 100}%`);
  dashboard.style.setProperty("--light-y", `${y * 100}%`);
});

dashboard.addEventListener("pointerleave", () => {
  dashboard.style.setProperty("--tilt-x", "3deg");
  dashboard.style.setProperty("--tilt-y", "-4deg");
  dashboard.style.setProperty("--light-x", "50%");
  dashboard.style.setProperty("--light-y", "50%");
});

let toastTimeout;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    toast.textContent = "";
  }, 2800);
}

document.querySelector(".copy-email").addEventListener("click", async (event) => {
  const email = event.currentTarget.dataset.copyEmail;

  try {
    await navigator.clipboard.writeText(email);
    showToast("Email address copied to clipboard.");
  } catch {
    showToast(`Copy not available here. Email: ${email}`);
  }
});

const navLinks = [...document.querySelectorAll('.nav-list a[href^="#"]')];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function setActiveSection(sectionId) {
  navLinks.forEach((link) => {
    if (link.hash === `#${sectionId}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  if (!prefersReducedMotion.matches) {
    document.querySelectorAll(
      ".hero-copy, .hero-visual, .section-heading, .about-content, .skill-group, .project-card, .timeline, .timeline-entry, .contact-copy, .contact-card"
    ).forEach((element) => {
      element.classList.add("reveal");
      revealObserver.observe(element);
    });
    document.body.classList.add("js-ready");
  }

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActiveSection(entry.target.id);
    });
  }, { rootMargin: "-25% 0px -65% 0px", threshold: 0 });

  navSections.forEach((section) => sectionObserver.observe(section));
}

let scrollFrame = 0;

function updateScrollUI() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  backToTop.classList.toggle("is-visible", window.scrollY > 480);
  scrollFrame = 0;
}

window.addEventListener("scroll", () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollUI);
}, { passive: true });

window.addEventListener("resize", updateScrollUI, { passive: true });
updateScrollUI();

document.querySelectorAll(".project-art").forEach((art) => {
  art.addEventListener("pointermove", (event) => {
    const bounds = art.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    art.style.setProperty("--pointer-x", `${x}%`);
    art.style.setProperty("--pointer-y", `${y}%`);
  });
});
