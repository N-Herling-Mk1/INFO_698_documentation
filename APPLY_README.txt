INFO_698_documentation — delta drop mk27
FORGE final report + Final Write-up panel
=========================================================================

WHAT THIS IS
  A delta, not a repo re-cut. Six files. Unzip over the repo root; the
  directory structure already matches.

FILES
  index.html                        REPLACED — "future" badge removed from the
                                    Final Write-up nav item. Nothing else changed.
  panels/writeup.html               REPLACED — the placeholder panel is now the
                                    real Final Write-up panel (embed + downloads
                                    + open-slot list).
  assets/docs/final_report.tex      NEW — the report source.
  assets/docs/forge-report.sty      NEW — report-only style add-on. Loads
                                    forge-proposal.sty, so the report and the
                                    proposal stay visually identical. Adds the new
                                    brand lockup, verdict badges, screenshot slots.
  assets/docs/final_report.pdf      NEW — prebuilt, 32 pp, so the panel renders
                                    before CI runs. CI overwrites it on push.
  assets/img/forge_flame_mk1.png    NEW — the flame, alpha-trimmed, used by the
                                    page-1 lockup.

CI
  No workflow change needed. build-latex.yml already globs every *.tex in
  assets/docs, so final_report.tex builds on the next push that touches a
  .tex or .sty file. forge-proposal.sty is untouched, so the proposal build
  is unaffected.

BEFORE FIRST RUN (PowerShell)
  Get-ChildItem -Recurse | Unblock-File

THE THREE SCREENSHOT SLOTS
  Section 7.6 has three placeholder boxes. Drop these three files into
  assets/img/ and they replace themselves on the next build — no LaTeX edit:

    shot_splash.png     splash page (strike to ignite)
    shot_deck.png       navigation deck (four model plates)
    shot_forge.png      FORGE dashboard (tau rail, C1–C4, graph area)

  Width is set to 0.94\linewidth; anything wider than ~1600 px is fine.

DOCUMENT SHAPE
  §1–§4    proposal, carried forward UNCHANGED
  §5–§9    new  (verdict / research component / results / discussion / conclusion)
  §10–§12  proposal ethics, approvals, appendix — renumbered from 5,6,7

WORD COUNT (measured, LaTeX markup stripped)
  §1–§9 body ............. 8,498   <- the word budget
  §5–§9 new material ..... 4,407
  excluded ............... title page, revision history, TOC, §10 ethics chart,
                           §11 approvals, §12 appendices — template and reference
                           matter carried forward, per the proposal convention

LOCAL BUILD
  cd assets/docs
  latexmk -pdf final_report.tex

CHANGED IN mk3 (page-1 lockup redesign)
  forge-report.sty only. The report body is byte-identical to mk2.
    - Flame height : text-block height now 2.7 : 1, proportioned off the
      splash reference (the flame dominates instead of matching the text).
    - Flame and text block are centre-aligned to each other (\raisebox),
      not baseline-aligned.
    - F.O.R.G.E is now ONE gold (#B0761E), sans, wide-tracked; the
      interpuncts are one step deeper (#8A5A16) so they still separate.
    - The rule under POSTERIOR OBSERVATORY tapers: 1.5pt and saturated at
      the left edge, 0.22pt and near-transparent at the right.
  Three tunable lengths at the top of the lockup block, if you want to
  re-proportion without touching the geometry:
      \forgeflameht    39mm   flame height
      \forgetextwd     82mm   text-block width
      \forgelockupgap   7mm   gap between them

CHANGED IN mk4 (front matter only)
  The SPECIAL NOTE box now carries a "Word count" block: the total in bold
  (8,498), the 4,091 / 4,407 split between carried-forward proposal and new
  material, what is excluded and why, and a stated rationale for exceeding
  the typical 5,000-6,000 words. Explicit \clearpage before the note so the
  revision history and the note/TOC page break deterministically rather than
  by luck. Nothing in the body changed.

CHANGED IN mk5 (Section 5 table rebuilt + a rendering bug fixed repo-wide)
  BUG: a plain l or c column mixed with tabularx X columns takes its NATURAL
  width, which starved the X columns to near-zero and wrapped every word one
  letter per line. It hit the Section 5 goals table and the Section 7.1 model
  board. Both are now built on weighted columns:
        \newcolumntype{W}[1]{>{\hsize=#1\hsize\raggedright\arraybackslash}X}
        \newcolumntype{N}[1]{>{\hsize=#1\hsize\centering\arraybackslash}X}
  Weights must sum to the number of columns. NEVER mix l/c with X again.

  REDESIGN: Section 5 is now GOAL | METRIC | MET, with MET reading
  YES / CAVEAT / NO (\vyes, \vcav, \vno). The metric column carries both the
  criterion and the measured value, so a reader gets the judgement and the
  evidence for it on one line. Four CAVEAT rows, two YES, no NO.

  Body trimmed by 30 words to keep the count under the 8,500 ceiling after
  the table grew. New totals: 8,498 body / 4,407 new.

CHANGED IN mk6
  Section 5's goals table is now a numbered float: Table 11, with a caption
  underneath in the same style as the proposal's tables (\label{tab:goals-met}
  if you want to cross-reference it). Numbering is automatic — it follows
  Table 10 (Milestone Schedule) and will renumber itself if you insert a table
  earlier in the document.

  Body trimmed by 21 words to absorb the caption and stay under the ceiling.
  New totals: 8,498 body / 4,407 new. Special note and the site panel are
  synced to those figures.

CHANGED IN mk7 (Section 5 content edits — word count NOT re-trimmed)
  Table 11 is now "Goals as proposed" (4 rows) and Table 12 is "Goals that
  evolved / project outcomes" (3 rows). Table numbering downstream shifts by
  one automatically.
  Row edits: hosting row rewritten against the proposal's actual F6 envelope
  (Table 7 — Pages + rented CPU box + serverless GPU, target ~$25/mo) and the
  $0 home-box outcome; LLLA row made explicit about base-model modification
  and the Gaussian-posterior/no-new-information expectation for HMC; Brandeis
  demoted from fourth model to tutorial (also updated in 6.4 and 7.1); new
  row on beating the phonon reproduction with a regularizer.
  Body is now 8,758 / 4,667 new — over the 8,500 ceiling by 258. Deliberate:
  edits first, trim later.

CHANGED IN mk8
  New "widetable" environment in forge-report.sty. It bleeds a table past the
  1in text block by \forgewidebleed on EACH side, so the printed margin drops
  to 1in - bleed. Currently 11mm, i.e. ~0.57in margins. Caption sits inside
  the wide block so it matches the table width. Tables 11 and 12 now use it.

      \setlength{\forgewidebleed}{11mm}   % raise/lower to taste; 12mm is
                                          % about the printer-safe limit

  Usage for any future wide table:
      \begin{widetable}
        \boardstretch\boardfont
        \begin{tabularx}{\linewidth}{...}   % \linewidth is the WIDE width
        ...
        \end{tabularx}
        \caption{...}\label{...}
      \end{widetable}

CHANGED IN mk9 (factual correction — LLLA / HMC)
  The Table 11 LLLA/HMC row asserted two things that were false in general:
    (a) "every base model required structural modification before LLLA" —
        only phonon did (the E(3)NN has no linear last layer). Genre and
        ATLAS read their existing last layers; ATLAS's is refit to the MAP
        by IRLS.
    (b) "where the fitted head is linear-Gaussian the posterior is Gaussian"
        was written as if it covered the board. Only phonon's shipped head
        (H2_planted_diag) is linear-Gaussian. Genre is categorical (K=10),
        ATLAS is Bernoulli — neither conjugate.
  Corrected everywhere the claim appears: Table 11 row 2, Section 8 limit
  (iv), and Section 9 open item 1. The C2 gap is now stated as NON-UNIFORM:
  vacuous on phonon by construction, genuinely unrun on genre and ATLAS,
  which are the two heads where HMC would actually referee the fast path.
  Body now 8,815 / 4,724 new — still over, still parked.

CHANGED IN mk10
  NEW Table 11 — "The FORGE four": C1..C4 by row, columns = as first
  conceived / as it stands / attenuation (where it stops reading). Preceded
  by a short passage on the two re-cuts (gauges vs capabilities; then the
  variance lock turning four readouts into four operations on one budget).
  Everything downstream shifts by one: goals-as-proposed is now Table 12,
  goals-that-evolved is Table 13. Cross-refs are by \label, so they follow.
  The FORGE-four row was removed from the evolved-goals table — it now has
  its own table.

  Table 13 "improved the base model" row rewritten: the claim is now against
  CHEN'S PUBLISHED 0.70, which is what was beaten (0.717, margin 0.017). The
  trunk is stated as untouched — the gain is from the ridge-regularized
  readout with the prior centred on the trunk's own trained last layer, not
  from retraining the network.

  REGRESSION FIXED: three edits from the mk7 drop were silently lost (an
  assertion aborted the script before it wrote). The Section 7.1 model board
  still called Brandeis a fourth model and the Section 5 lead-in still had no
  table cross-references. Both re-applied. If you already pushed mk7/mk8/mk9,
  those PDFs carried the stale 7.1 wording.

  Body 9,398 / 5,307 new. Over ceiling by ~900, parked per your call.

CHANGED IN mk11 (factual correction — what the proposal actually says)
  "The proposal named four dashboard gauges" was FALSE. Sections 1-4 contain
  no gauge language, no G1-G4 and no C1-C4. What the proposal commits to is
  the F3 two-path architecture (LLLA fast path vs HMC ground truth) and the
  three hypotheses H1-H3. The four gauges are a July dashboard-wireframe
  artefact, months after the proposal was signed.
  The passage now derives C1-C4 from H1-H3 instead: H2 (fast path agrees with
  the sampler within tolerance) is C2 in embryo, and H3's steerable knob is
  the tau axis. Also defuses a naming collision — C1-C4 are unrelated to the
  C0-C3 CALIBRATION TIERS named in Section 3b.
  Section 6.2 additionally now states where G1-G4 come from, so they are not
  introduced as if the reader has already met them.

CHANGED IN mk12 (width pass — layout only, no text edits)
  Everything below now reads at the wide measure (textwidth + 11mm each side,
  ~0.57in printed margins), matching Tables 11-13:
    - the SPECIAL NOTE / word-count box on p.3
    - Tables 3,4,5,6,7,8,9  -> converted from table[H] to widetable
    - Table 10 (Milestone Schedule) -> it is a LONGTABLE, which is page-
      breakable and cannot live in a minipage, so widetable does not apply.
      Widened by its fixed column instead: p{10.4cm} -> p{15.2cm}. longtable
      centres itself, so it overflows symmetrically like the floats do.
  Tables 1 and 2 (the two user point-of-view tables) left at text width —
  they were not in your list and they are narrow-content by design.

  One length still governs all of it:
      \setlength{\forgewidebleed}{11mm}    % in forge-report.sty
  The longtable is the exception: its 15.2cm is hardcoded, so if you change
  the bleed, adjust that number too.

CHANGED IN mk13 (Section 5 refactored)
  Section 5 retitled "Final Project — Final Stats" and split three ways:
    5a Deliverables — Table 11 rehashes the Section 3 feature list (F1-F6,
       S1) marked met/caveat/unmet with a one-line "as delivered"; Table 12
       is the project-level goals, tightened to Goal | Met | Evidence. Three
       short paragraphs carry what the tables cannot.
    5b Project Evolution — the FORGE four. Table 13 is now a SIGHT READ:
       Was | Is | Reads over, bullets only, no prose in cells. The argument
       moved into the two paragraphs above it.
    5c Project Insights — research findings and the website-design evolution,
       including why the three-standalone-site architecture was rebuilt and
       the honest note that the W6 milestone is superseded, not met.

  TWO NEW VERDICTS you should check before submitting — I marked them from
  the record, not from you:
    F5 resource-logging layer -> NO (not built as a layer; the costs it
       existed to produce were measured directly in 6.6 instead)
    S1 MCP server            -> NO (descoped, declared optional)
  If either actually shipped, tell me and I will flip it.

  Also fixed: Table 13's tabularx weights summed to 3.00 across 4 columns,
  which left a dead strip on the right edge. Weights must sum to the COLUMN
  COUNT.

  Body 9,596 / 5,512 new.

CHANGED IN mk14
  SPECIAL NOTE box on p.3 was hanging off the right edge. Cause: a center
  environment CANNOT centre a box wider than \linewidth — it sets it flush
  left and lets the overflow run right. Replaced with
      \noindent\makebox[\linewidth][c]{ ... }
  which centres overfull content and splits the overflow evenly. Measured
  from the rendered page: 57px left, 57px right. Exact.

  Same trap applies anywhere else a wide box is wrapped in center — the
  widetable environment already avoids it by using a negative \hspace*.

CHANGED IN mk15
  (1) F3 real-time knob RETIRED in favour of solving for tau*. Status kept
      at CAVEAT per your call. Reconciled in three other places that still
      assumed a live slider: 5b (H3's steerable knob), 6.6 ("cheap enough to
      run behind a slider" -> "to recompute on demand"), and the Section 9
      conclusion ("steer the uncertainty in real time" -> exposes it at an
      operating point the instrument selects for itself).
  (2) Goal "point estimate -> full Bayesian posterior" flipped CAVEAT -> YES.
      Evidence rewritten so the row supports the verdict; the HMC gap now
      reads as a qualification below the table rather than as the verdict.
  (3) F5 restated: not built AND NOT NEEDED. It existed to size F6's metered
      cloud tier; the stack redesign removed that tier, so there is no bill
      to predict. New RETIRED badge (\vret, grey) added so a deliberate
      removal does not sight-read as a missed commitment. S1 left at NO —
      it is the one true descope.
  Body 9,783 / 5,699 new.

CHANGED IN mk16
  Rewrote the HMC paragraph in 5a. It now opens by stating the verdict rather
  than hedging it, explains what HMC is FOR (LLLA approximates, HMC samples,
  comparing them is how you learn whether the approximation can be trusted)
  before using conjugacy, and drops the "demonstrated, not delivered" line
  that read as contradicting the YES two inches above it. Split into two
  paragraphs: what shipped, then which models the omission actually costs.
  Body 9,857 / 5,773 new.

CHANGED IN mk17 (overclaim corrected — "full posterior")
  "Every model ships a full posterior" was FALSE and contradicted Section 8
  limit (i) and Table 13's C1 row ("last layer only"). What ships is a
  Gaussian over the LAST-LAYER weights only — mean at w_MAP, covariance
  (H_GGN + tau I)^-1, tau* by evidence — with everything upstream frozen at a
  point estimate. On phonon that is 1,632 of 2.4M parameters, ~0.07%.

  The YES verdict STANDS, because Section 3b is what was committed to and it
  scopes each model to a head: "a Bayesian classification head" (genre), "a
  Bayesian last-layer head over the 51-point DOS output" (phonon), "HMC over
  the output layer" (ATLAS). The report now says so explicitly and notes that
  "full Bayesian posterior" in Section 1 describes the long-term platform,
  not this release.

  Corrected in three places: Table 12 evidence cell, the 5a paragraph, and
  the Section 9 conclusion.
  Body 9,970 / 5,886 new.

CHANGED IN mk18
  The two-paragraph HMC block in 5a is replaced by ONE paragraph carrying the
  caveat you specified: phonon needed a readout head fitted before a posterior
  was possible (the E(3)NN has no linear last layer — its final convolution
  contracts hidden features against edge spherical harmonics); genre and ATLAS
  did not, because both already end in a linear layer feeding a softmax /
  sigmoid. Closes on the payoff: the fitted head is linear-Gaussian, so its
  posterior is exactly Gaussian and agreement with HMC is guaranteed by
  construction rather than hoped for.

  "Ship / bundle / shipped" removed from Section 5 throughout — deployment
  jargon that means nothing to a report reader. (Still present in Sections 7
  and 9 where it refers to the packaged export itself.)

  The "unrun on the bundles" material is GONE from 5a. It is still recorded
  in Table 13 (C2 reads over) and as an open item in Section 9.
  Body 9,854 / 5,770 new.

CHANGED IN mk19
  The readout-head paragraph in 5a split in two and rewritten:
   - "nothing linear to be Bayesian about" replaced with the actual
     requirement — the method places a Gaussian over the weights of a final
     linear map and reads the predictive variance off that map; the phonon
     network's last operation has no weight matrix between the features and
     the prediction, so there is nothing for the Gaussian to sit on.
   - "readout head" now defined inline on first use: a small linear layer
     trained on top of the finished network with the original weights frozen,
     taking a fixed feature vector as input and reproducing the network's own
     output — manufacturing the linear map the method requires without
     disturbing the model it is measuring.
  Body 9,943 / 5,859 new.

CHANGED IN mk20
  "the closed-form method" -> "the closed-form method (LLLA)" in the 5a
  readout-head paragraph. Correct: the proposal names LLLA as the closed-form
  path in Section 1 and again in Feature F3.

CHANGED IN mk21
  BRANDEIS DICE removed as a model/tutorial throughout. Touched six places:
    5a  costs paragraph, F1 row  — tutorial is now "a click-through of the
        definitions", not a fourth model
    6.3 resolving-axis table — dice row dropped (now 3 rows)
    6.4 generalization design — the dice passage was ~90 words of booby-trap
        detail; compressed to a statement that identities were first checked
        against a closed-form, deliberately degenerate analytic problem, and
        that this was a DEVELOPMENT instrument, not part of the product
    7.1 model board — dice row dropped; lead no longer says "plus the
        analytic tutorial"
    9   open item — "the dice testbed" -> "the closed-form development
        problem"

  GENRE now has its own cost line in 5a (it had none). Each model now carries
  a different kind: phonon a conjugate head that C2 cannot referee, ATLAS a
  thin 129-dim channel with latent rather than named feature rows, and genre
  a benchmark that is the author's own earlier coursework rather than an
  independent published result.

  Body 9,937 / 5,853 new.

CHANGED IN mk22
  (1) "The tutorial is a click-through of the definitions rather than a fourth
      model." removed from 5a.
  (2) MacKay evidence now DEFINED, twice, at the right depth for each spot:
        - Table 11 F3 row, first use in the document: "the value of tau that
          maximizes the marginal likelihood of the training data, found by
          fixed-point iteration and needing no held-out labels".
        - Section 6.2, where the reader wants the mechanism: the marginal
          likelihood p(D|tau) obtained by integrating the weights out, the
          fixed point tau = gamma(tau)/||w||^2, and gamma(tau) = sum
          lambda_i/(lambda_i+tau) as the effective number of parameters the
          data constrains.
      Before this it appeared five times as a bare name.
  (3) F3/F5/S1 paragraph rewritten to your reasoning: the panel kept resolving
      into a cluttered surface with little to do, every control moved a value
      toward the optimum, and the optimum is what the user wants anyway; once
      the dashboard's focus settled on the variance readouts of 6.1-6.2 the
      decision followed. "Theatre" cut.
  Body 10,020 / 5,936 new.

CHANGED IN mk23
  F3/F5/S1 paragraph cut 206 -> 152 words. Heading changed to "F3 was
  retired, and the reader should register it as a deviation" so the alert is
  the first thing read rather than a conclusion at the end. F5 is one clause;
  S1 is four words — both are already stated in Table 11 two inches above, so
  the prose only needs to not contradict it.
  Body 9,968 / 5,884 new.

CHANGED IN mk24
  (a) Table 13 refactored. "Was" kept as-is. "Is" now says what the DASHBOARD
      CHANNEL became — the question the panel answers and the graphs it shows
      — instead of restating the role abstractly. "Reads over" (limits)
      dropped and replaced by "Metric it reports", carrying the actual
      quantity: E_k vs A_k / EAR / reducibility; the signed epsilon_k and
      fidelity %; c_i and prior-leak; a_k and concentration. Cells vertically
      centred (tabularxcolumn -> m, scoped to this float). Caption and the
      follow-on paragraph rewritten to match.
  (b) C1..C4 renamed FF1..FF4 (FORGE Four) document-wide — 28 tokens in the
      new sections, 2 in the revision history. The abbreviation is introduced
      on first use in 5b.
      NOT renamed: the C0-C3 CALIBRATION TIERS in Section 3b, which are
      proposal text and a different construct. The parenthetical warning
      about that collision is now deleted, since FF removes the collision.
  Body 10,031 / 5,947 new.

CHANGED IN mk25
  Table 13 cells now genuinely vertically centred. Three things had to change
  together — any one alone does not do it:
    1. \renewcommand{\tabularxcolumn}[1]{m{#1}}   (centres the cell box)
    2. \arraystretch back to 1.0 — at 1.18 the stretch inflates the row
       asymmetrically, which is what made the TALLEST cell hug the top while
       the short ones looked centred
    3. \ffcell wraps each cell in a minipage[c] with 4pt above and below,
       supplying the padding arraystretch used to add badly
  Both helpers now live in forge-report.sty:
       \ffcell{...}   vertically centred cell with even padding
       \ffbul{\item .. \item ..}   the tight bullet list used inside it

  GOTCHA worth remembering: \ffcell uses \hsize, NOT \linewidth. Inside a
  weighted >{\hsize=..}X column, \linewidth is stale and the minipage
  overflows into the next column — the label cell bled across the border
  before this was caught.

CHANGED IN mk26
  NEW Section 10 — GLOSSARY, seeded with two entries: MCP (Model Context
  Protocol) and MacKay evidence fixed point. Sits in back matter, outside the
  word budget, alongside ethics/approvals/appendices.

  Everything downstream renumbered: Ethics 10 -> 11, Approvals 11 -> 12,
  Appendix 12 -> 13. Front-matter special note updated to match.

  TO ADD AN ENTRY: copy a row in the Section 10 tabularx --
      \ffcell{\textbf{TERM}\par\smallskip\textit{expansion}}
      & \ffcell{definition} \\ \hline
  Keep the list alphabetical by term. NOTE the two-column weights sum to
  2.00, not 3.00 -- weights must always sum to the COLUMN COUNT (this bit me
  on the first build: the table rendered one letter per line).

  SPELLING: MacKay, not McKay -- David J. C. MacKay, who introduced the
  evidence framework for neural networks in 1992.

CHANGED IN mk27
  Glossary moved to the END, after the appendix. It is now Section 13; the
  proposal tail is back at its previous numbering (10 Ethics, 11 Approvals,
  12 Appendix). Front-matter special note updated to match.
  Glossary lands on p.34, immediately after Appendix C.
