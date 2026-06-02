# assets/docs/assignments/

Flat folder for assignment files (`.tex`, `.pdf`, and anything else) shown in the
**Assignments** panel (`panels/assignments.html`).

## Adding an assignment

1. Drop the files here, e.g. `assignment_03.pdf` and `assignment_03.tex`.
2. In `panels/assignments.html`:
   - add an entry to the index list at the top (an `<a class="asg-jump">` pointing
     at the new section's `id`), and
   - copy an existing `<section class="asg-item" id="asg-03">…</section>` block,
     updating the title, meta line, `<embed src>`, and the download links.

That's it — content is hardcoded in the panel HTML (no build step, no JSON).

## Current stubs

- `assignment_01.{pdf,tex}` — placeholder
- `assignment_02.{pdf,tex}` — placeholder

Replace these with real work when ready.
