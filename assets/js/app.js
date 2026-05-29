/* ===========================================================
   FORGE INFO 698 — app.js
   Hash-based router, panel loader, nav state
   =========================================================== */

const App = (() => {

  const PANELS = {
    home:     { type: "html", src: "panels/home.html" },
    overview: { type: "html", src: "panels/overview.html" },
    timeline: { type: "html", src: "panels/timeline.html" },
    gantt:    { type: "dynamic", render: (el) => Gantt.render(el) },
    proposal: { type: "html", src: "panels/proposal.html" },
    mvp:      { type: "html", src: "panels/mvp.html" },
    contacts: { type: "html", src: "panels/contacts.html" },
    video:    { type: "html", src: "panels/video.html" },
    branding: { type: "html", src: "panels/branding.html" },
    sheen_test: { type: "html", src: "panels/sheen_test.html" },
    poster:   { type: "html", src: "panels/poster.html" },
    writeup:  { type: "html", src: "panels/writeup.html" },
  };

  const DEFAULT_PANEL = "home";

  function getCurrentPanel() {
    const hash = (window.location.hash || "").replace(/^#/, "");
    return PANELS[hash] ? hash : DEFAULT_PANEL;
  }

  function setActiveLink(panelKey) {
    document.querySelectorAll(".nav-link").forEach(a => {
      a.classList.toggle("active", a.getAttribute("data-panel") === panelKey);
    });
  }

  async function loadPanel(panelKey) {
    const main = document.getElementById("main-panel");
    if (!main) return;
    main.classList.remove("has-gantt");  // cleared each load; Gantt.render re-adds it for its own panel
    main.innerHTML = '<div class="loading">Loading&hellip;</div>';
    setActiveLink(panelKey);

    const config = PANELS[panelKey] || PANELS[DEFAULT_PANEL];

    try {
      if (config.type === "html") {
        const html = await DataStore.fetchText(config.src);
        main.innerHTML = html;
        executeScripts(main);
      } else if (config.type === "dynamic") {
        await config.render(main);
      }
      main.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      main.innerHTML = `<div class="notice-error">Could not load panel: ${err.message}</div>`;
    }
  }

  // innerHTML doesn't execute <script> tags it inserts; we replace each one with
  // a freshly-created element so the script actually runs.
  function executeScripts(container) {
    const scripts = container.querySelectorAll("script");
    scripts.forEach(oldScript => {
      const newScript = document.createElement("script");
      for (const attr of oldScript.attributes) {
        newScript.setAttribute(attr.name, attr.value);
      }
      if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  function attachNavHandlers() {
    document.querySelectorAll(".nav-link[data-panel]").forEach(a => {
      a.addEventListener("click", (e) => {
        const key = a.getAttribute("data-panel");
        if (!key) return;
        e.preventDefault();
        window.location.hash = key;
      });
    });

    document.addEventListener("click", (e) => {
      const card = e.target.closest("[data-go-panel]");
      if (card) {
        e.preventDefault();
        window.location.hash = card.getAttribute("data-go-panel");
      }
    });
  }

  function onHashChange() {
    const hash = (window.location.hash || "").replace(/^#/, "");
    // If the hash is a known panel, load that panel.
    // Otherwise, it's an in-page anchor (e.g. references jump) — let the browser handle it.
    if (PANELS[hash]) {
      loadPanel(hash);
    } else if (!hash) {
      loadPanel(DEFAULT_PANEL);
    }
    // else: unknown hash, leave it alone — the browser will scroll to it if a matching id exists.
  }

  function init() {
    attachNavHandlers();
    window.addEventListener("hashchange", onHashChange);
    loadPanel(getCurrentPanel());
  }

  document.addEventListener("DOMContentLoaded", init);

  return { loadPanel };
})();
