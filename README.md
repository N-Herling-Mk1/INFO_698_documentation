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
│   ├── gantt.json                # SINGLE SOURCE OF TRUTH for the Gantt
│   ├── weekly_todos.json         # per-week task lists for the Gantt detail panel
│   └── glossary.json             # entries for the Glossary panel
├── panels/                       # HTML fragments loaded into the main panel
├── scripts/
│   └── build_xlsx.py             # generates FORGE_INFO698_Gantt.xlsx from gantt.json
├── FORGE_INFO698_Gantt.xlsx      # generated artifact (committed for download)
├── .github/workflows/
│   ├── pages.yml                 # deploys the site on push (non-LaTeX changes)
│   └── build-latex.yml           # compiles assets/docs/*.tex -> PDF, commits PDFs, deploys
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
3. **Commit and push** (see [Git & CI workflow](#git--ci-workflow) below). GitHub Actions deploys the site automatically.

The git log is the change history. No PDF snapshots needed.

## Git & CI workflow

Two GitHub Actions run on push to `main`:

- **`pages.yml`** — deploys the static site. Fires on any push that does *not* touch `*.tex`/`*.sty` (ordinary HTML/CSS/JS/JSON edits). It only deploys; it never writes back to the repo.
- **`build-latex.yml`** — fires *only* when a push touches `*.tex` or `*.sty`. It compiles every `.tex` in `assets/docs/` to PDF, strips the LaTeX aux files, **commits the rebuilt PDFs back to `main`** (`ci: rebuild proposal PDF(s) … [skip ci]`), then deploys. The `[skip ci]` tag stops it from re-triggering itself, and a fixed `SOURCE_DATE_EPOCH` keeps unchanged source byte-identical — so it only commits when a PDF genuinely changes.

**Consequence:** after a `.tex`/`.sty` push, the remote has a CI commit (the rebuilt PDF) that your local clone doesn't, so your *next* push is rejected until you pull it down. Site-only changes never trigger this.

**One-time setup, per clone:**

```bash
git config pull.rebase true       # replay local work on top of incoming commits
git config rebase.autoStash true  # don't let uncommitted edits block the pull
```

**Routine for every change:**

```bash
git add -A
git commit -m "message"
git pull        # brings down any CI PDF commit and rebases your work on top
git push
```

If the push is still rejected (CI committed in the gap between your pull and push), just run `git pull && git push` again.

If a rebase ever conflicts on a PDF you also built locally, take the CI copy and continue:

```bash
git checkout --theirs -- assets/docs/*.pdf
git add assets/docs/*.pdf
git rebase --continue
```

To sidestep that case entirely, let CI own the PDFs: `git rm --cached assets/docs/*.pdf`, then add `assets/docs/*.pdf` to `.gitignore`. They still live on the remote (CI commits them), so the site keeps serving them.

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
