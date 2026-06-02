# assets/docs/

Documents served as static assets and referenced by the site.

## Proposal (LaTeX workflow)

The project proposal is authored in LaTeX and compiled to PDF automatically by
`.github/workflows/build-latex.yml` on every push that touches a `.tex` or `.sty`.

| File | Role |
| --- | --- |
| `proposal.tex` | **Working copy — edit this.** Your live proposal. Fill in sections and delete the red `guidance` blocks as you go. |
| `proposal.pdf` | Compiled working draft (auto-built). Shown as **"Working draft"** on the site. |
| `proposal_original.tex` | **Frozen reference — do not edit.** The pristine UA template with every red guidance note intact. |
| `proposal_original.pdf` | Compiled original (auto-built, but byte-stable so it never changes). Shown as **"Original template"** on the site. |
| `forge-proposal.sty` | Shared style/macros for both documents (fonts, colors, the F.O.R.G.E color-encoded masthead, the `guidance` environment, custom section numbering). Edit styling in one place here. |

### Dependencies

- **Logo:** the masthead pulls `assets/img/official_Forge_logo.png` (referenced as
  `../img/official_Forge_logo.png` from this folder). It must be a *real* PNG — if you
  re-export it, make sure it is genuinely PNG-encoded, not a JPEG renamed `.png`.
- **Fonts:** the documents target the Office look (Calibri body / Cambria title) via the
  metric-compatible `carlito` / `caladea` packages, which ship with a full TeX Live (the
  CI container has them). Where those are missing, the style falls back to Arial/Times so
  the build never fails — the layout is the same, only the exact letterforms differ.

`panels/proposal.html` embeds these and offers a toggle between the working draft
and the original template.

### Editing the proposal

1. Edit `proposal.tex`. Delete each `\begin{guidance}...\end{guidance}` block as you
   complete that section (or set `\renewcommand{\showguidance}{0}` near the top to hide
   them all at once for a clean submission).
2. Commit and push. CI rebuilds `proposal.pdf`, commits it back, and redeploys the site.
3. `proposal_original.*` is never edited, so the "Original template" view stays pristine.

Build locally with `latexmk -pdf proposal.tex` (run twice, or use latexmk, so the table
of contents resolves).

## Other documents

- `poster.pdf` — iShowcase poster (future, Week 11)
- `final_writeup.pdf` — final paper (future, Week 11–12)

## Legacy

- `Project_Proposal_Hybrid.docx` / `.pdf` — the original Word template the LaTeX version
  was built from. Kept for reference; no longer the source of truth.

Anyone with the site URL can view or download files in this folder.
