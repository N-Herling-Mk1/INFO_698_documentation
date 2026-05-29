# INFO_698_documentation

Documentation hub for the **FORGE** capstone project (INFO 698, University of Arizona).

This repository is published as a static website via GitHub Pages. It contains the project timeline, Gantt chart, proposal, supporting documents, and links to the sibling code repositories.

**Live site:** https://n-herling-mk1.github.io/INFO_698_documentation/

---

## Repository structure

```
INFO_698_documentation/
├── index.html                    # Shell page: banner + sidenav + main panel
├── assets/
│   ├── css/                      # base.css, layout.css, components.css
│   ├── js/                       # app.js (router), gantt.js (renderer), data.js (fetch)
│   ├── img/                      # logo, diagrams
│   ├── video/                    # project video (.mp4)
│   └── docs/                     # Project_Proposal_Hybrid.pdf/.docx, poster.pdf, etc.
├── data/
│   └── gantt.json                # SINGLE SOURCE OF TRUTH for the Gantt
├── panels/                       # HTML fragments loaded into the main panel
├── scripts/
│   └── build_xlsx.py             # generates FORGE_INFO698_Gantt.xlsx from gantt.json
├── FORGE_INFO698_Gantt.xlsx      # generated artifact (committed for download)
├── .github/workflows/pages.yml   # auto-deploys to GitHub Pages on push
└── README.md
```

## How the site works

- One HTML shell (`index.html`) with a top banner, a left side nav, and a main content area.
- Nav clicks update the URL hash (`#timeline`, `#gantt`, etc.); `app.js` swaps the matching panel from `panels/` into the main area.
- The Gantt panel is rendered dynamically from `data/gantt.json` by `gantt.js`.
- No build step. No framework. No backend. Just static files.

## Weekly update workflow

1. **Edit `data/gantt.json`.** Change `status` values, update `last_updated`, set `week0_start` when known.
2. **(Optional) Regenerate the xlsx** for advisor/sponsor downloads:
   ```bash
   python scripts/build_xlsx.py
   ```
3. **Commit and push.** GitHub Actions deploys the site automatically.

The git log is the change history. No PDF snapshots needed.

## Adding a new panel

1. Create `panels/your_panel.html` with the content fragment (no `<html>`/`<body>` wrapper — just the content).
2. Add a nav entry in `index.html`:
   ```html
   <li><a href="#your_panel" data-panel="your_panel" class="nav-link">Your Panel</a></li>
   ```
3. Register it in `assets/js/app.js`:
   ```javascript
   PANELS = { ..., your_panel: { type: "html", src: "panels/your_panel.html" } };
   ```

That's it. Add and push.

## Local preview

The site uses `fetch()` to load panel HTML and JSON, which requires an HTTP server (not `file://`). Quickest:

```bash
cd INFO_698_documentation
python -m http.server 8000
# then visit http://localhost:8000
```

## Replacing the placeholder logo

Drop your real logo at `assets/img/forge_logo.svg` (SVG preferred; PNG works too — adjust the `<img>` src in `index.html`).

## Adding the project video

Place your video at `assets/video/forge_intro.mp4`. Already wired in `panels/video.html`. If the file is too large for the repo (GitHub recommends < 100 MB per file), host on YouTube and replace the `<video>` element with an `<iframe>`.

## Sibling repositories

- **[INFO_698_experiments](https://github.com/N-Herling-Mk1/INFO_698_experiments)** — Research code, Hernández-Lobato PoC, FAIR Universe HiggsML, sweeps.
- **[INFO_698_software](https://github.com/N-Herling-Mk1/INFO_698_software)** — Deployed application: frontend, backend, worker, calibration.

## License

MIT (or specify per institutional requirements).
