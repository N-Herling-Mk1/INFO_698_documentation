/* ===========================================================
   FORGE INFO 698 — gantt.js
   Granular phase Gantt: phase-grouped spanning bars, milestone
   diamonds, a "today" marker, and a legend. Single contributor.
   Reads data/gantt.json. Drop-in for Gantt.render(el).
   =========================================================== */
const Gantt = (() => {

  const PHASE = {
    "Intro":         { cls: "fg-intro",   group: "Intro / Planning" },
    "Planning":      { cls: "fg-intro",   group: "Intro / Planning" },
    "Design / Impl": { cls: "fg-design",  group: "Design / Implementation" },
    "Testing":       { cls: "fg-testing", group: "Testing" },
    "Write-up":      { cls: "fg-writeup", group: "Write-up" },
    "Deliverables":  { cls: "fg-deliver", group: "Deliverables" },
  };

  const LEGEND = [
    ["fg-intro",   "Intro / Planning"],
    ["fg-design",  "Design / Implementation"],
    ["fg-testing", "Testing"],
    ["fg-writeup", "Write-up"],
    ["fg-deliver", "Deliverables"],
  ];

  const STATUS_KEY = [
    ["is-planned",  "Planned"],
    ["is-progress", "In progress"],
    ["is-done",     "Done"],
  ];

  const STYLE = `
.forge-gantt { --fg-label: 240px; }
.forge-gantt .fg-legend,
.forge-gantt .fg-statuskey { display:flex; flex-wrap:wrap; gap:8px 18px; align-items:center; color:var(--color-text-muted,#5A7BA8); }
.forge-gantt .fg-legend { margin:10px 0 6px; font-size:0.82rem; }
.forge-gantt .fg-statuskey { margin:0 0 14px; font-size:0.78rem; }
.forge-gantt .fg-legend .li, .forge-gantt .fg-statuskey .li { display:inline-flex; align-items:center; gap:6px; }
.forge-gantt .fg-legend > i, .forge-gantt .fg-legend .li > i { width:14px; height:14px; border-radius:3px; display:inline-block; }
.forge-gantt .fg-scroll { overflow-x:auto; padding-bottom:4px; }
.forge-gantt .fg-chart { position:relative; min-width:calc(var(--fg-label) + (var(--fg-cols) * 46px)); }
.forge-gantt .fg-row { display:grid; grid-template-columns:var(--fg-label) 1fr; align-items:center; }
.forge-gantt .fg-row + .fg-row { border-top:1px solid var(--color-border,rgba(90,123,168,0.16)); }
.forge-gantt .fg-label { padding:5px 10px 5px 0; font-size:0.82rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.forge-gantt .fg-head .fg-label { font-weight:600; }
.forge-gantt .fg-grouphead .fg-label { font-weight:600; display:flex; align-items:center; gap:7px; }
.forge-gantt .fg-grouphead i { width:11px; height:11px; border-radius:3px; display:inline-block; flex:none; }
.forge-gantt .fg-track { position:relative; display:grid; grid-template-columns:repeat(var(--fg-cols), minmax(0,1fr)); height:26px; background-image:linear-gradient(to right, var(--color-border,rgba(90,123,168,0.16)) 1px, transparent 1px); background-size:calc(100% / var(--fg-cols)) 100%; }
.forge-gantt .fg-head .fg-track, .forge-gantt .fg-grouphead .fg-track { height:22px; background-image:none; }
.forge-gantt .fg-wk { text-align:center; font-size:0.72rem; color:var(--color-text-muted,#5A7BA8); align-self:center; }
.forge-gantt .fg-bar { align-self:center; height:15px; border-radius:4px; margin:0 2px; box-shadow:0 1px 2px rgba(0,0,0,0.15); }
.forge-gantt .fg-bar.is-planned { opacity:0.5; }
.forge-gantt .fg-bar.is-progress { outline:2px dashed var(--color-accent,#C67D3E); outline-offset:1px; }
.forge-gantt .fg-intro   { background:#8893a8; }
.forge-gantt .fg-design  { background:#5e9b86; }
.forge-gantt .fg-testing { background:#8f73c4; }
.forge-gantt .fg-writeup { background:#c79a3e; }
.forge-gantt .fg-deliver { background:#5ba56b; }
.forge-gantt .fg-ms { align-self:center; justify-self:center; width:14px; height:14px; background:var(--color-navy,#0F1F3D); transform:rotate(45deg); display:flex; align-items:center; justify-content:center; }
.forge-gantt .fg-ms b { transform:rotate(-45deg); color:#fff; font-size:0.6rem; font-weight:700; line-height:1; }
.forge-gantt .fg-today { position:absolute; top:0; bottom:0; width:11px; margin-left:-5px; z-index:5; cursor:help; background:linear-gradient(to right, transparent 5px, var(--color-accent,#C67D3E) 5px, var(--color-accent,#C67D3E) 7px, transparent 7px); }
.forge-gantt .fg-today::before { content:"Today"; position:absolute; top:0; left:9px; font-size:0.66rem; font-weight:600; color:var(--color-accent,#C67D3E); white-space:nowrap; pointer-events:none; }
.forge-gantt .fg-mskey { margin:8px 0 0; padding-left:1.2rem; font-size:0.82rem; color:var(--color-text-muted,#5A7BA8); }
.forge-gantt .fg-mskey li { margin:3px 0; }
.forge-gantt .gantt-meta { margin-top:14px; font-size:0.8rem; color:var(--color-text-muted,#5A7BA8); }
`;

  function injectStyle() {
    if (document.getElementById("forge-gantt-style")) return;
    const s = document.createElement("style");
    s.id = "forge-gantt-style";
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function row(extra) {
    const r = document.createElement("div");
    r.className = "fg-row" + (extra ? " " + extra : "");
    return r;
  }
  function labelCell(text) {
    const d = document.createElement("div");
    d.className = "fg-label";
    if (typeof text === "string") { d.textContent = text; d.title = text; }
    return d;
  }
  function trackCell() {
    const d = document.createElement("div");
    d.className = "fg-track";
    return d;
  }
  function statusClass(status) {
    return "is-" + (status || "planned").replace("in_progress", "progress");
  }

  function todayFraction(week0Start, numWeeks) {
    if (!week0Start) return null;
    const w0 = new Date(week0Start + "T00:00:00");
    if (isNaN(w0)) return null;
    const weeks = (Date.now() - w0.getTime()) / (1000 * 60 * 60 * 24 * 7);
    if (weeks < 0 || weeks > numWeeks) return null;
    return weeks;
  }

  function buildChart(data) {
    const tasks = data.tasks || [];
    let numWeeks = data.num_weeks;
    if (!numWeeks) {
      numWeeks = tasks.reduce((m, t) => Math.max(m, (t.end != null ? t.end : t.start) || 0), 0) + 1;
    }

    const chart = document.createElement("div");
    chart.className = "fg-chart";
    chart.style.setProperty("--fg-cols", numWeeks);

    // header row of week labels
    const head = row("fg-head");
    head.appendChild(labelCell("Phase / Task"));
    const headTrack = trackCell();
    for (let w = 0; w < numWeeks; w++) {
      const c = document.createElement("div");
      c.className = "fg-wk";
      c.textContent = "W" + w;
      headTrack.appendChild(c);
    }
    head.appendChild(headTrack);
    chart.appendChild(head);

    // group tasks by phase-group, preserving first-seen order
    const order = [];
    const groups = {};
    tasks.forEach(t => {
      const meta = PHASE[t.phase] || { cls: "", group: t.phase || "\u2014" };
      if (!groups[meta.group]) { groups[meta.group] = { cls: meta.cls, items: [] }; order.push(meta.group); }
      groups[meta.group].items.push(t);
    });

    order.forEach(gName => {
      const g = groups[gName];
      const gh = row("fg-grouphead");
      const gl = labelCell();
      const sw = document.createElement("i");
      sw.className = g.cls;
      const tx = document.createElement("span");
      tx.textContent = gName;
      gl.appendChild(sw); gl.appendChild(tx); gl.title = gName;
      gh.appendChild(gl);
      gh.appendChild(trackCell());
      chart.appendChild(gh);

      g.items.forEach(t => {
        const r = row();
        r.appendChild(labelCell(t.name));
        const tk = trackCell();
        const start = t.start || 0;
        const end = (t.end != null ? t.end : start);
        const bar = document.createElement("div");
        bar.className = "fg-bar " + (PHASE[t.phase] ? PHASE[t.phase].cls : "") + " " + statusClass(t.status);
        bar.style.gridColumn = (start + 1) + " / " + (end + 2);
        const span = (end === start) ? ("W" + start) : ("W" + start + "\u2013W" + end);
        bar.title = t.name + " (" + span + ")";
        tk.appendChild(bar);
        r.appendChild(tk);
        chart.appendChild(r);
      });
    });

    // milestones row
    const ms = data.milestones || [];
    if (ms.length) {
      const mr = row();
      mr.appendChild(labelCell("Milestones"));
      const mt = trackCell();
      ms.forEach((m, i) => {
        const d = document.createElement("div");
        d.className = "fg-ms";
        d.style.gridColumn = String(m.week + 1);
        d.title = "M" + (i + 1) + ": " + m.label + " (W" + m.week + ")";
        const b = document.createElement("b");
        b.textContent = String(i + 1);
        d.appendChild(b);
        mt.appendChild(d);
      });
      mr.appendChild(mt);
      chart.appendChild(mr);
    }

    // today marker (computed live from the real date, anchored to week0)
    const frac = todayFraction(data.week0_start, numWeeks);
    if (frac != null) {
      const tl = document.createElement("div");
      tl.className = "fg-today";
      tl.title = "Today \u2014 " + new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
      const ratio = frac / numWeeks;
      tl.style.left = "calc(var(--fg-label) + (100% - var(--fg-label)) * " + ratio + ")";
      chart.appendChild(tl);
    }

    return chart;
  }

  function buildLegend() {
    const wrap = document.createElement("div");
    wrap.className = "fg-legend";
    LEGEND.forEach(([cls, lab]) => {
      const li = document.createElement("span");
      li.className = "li";
      const i = document.createElement("i");
      i.className = cls;
      const t = document.createElement("span");
      t.textContent = lab;
      li.appendChild(i); li.appendChild(t);
      wrap.appendChild(li);
    });
    // milestone marker
    const mli = document.createElement("span");
    mli.className = "li";
    const md = document.createElement("span");
    md.style.width = "12px"; md.style.height = "12px"; md.style.display = "inline-block";
    md.style.background = "var(--color-navy,#0F1F3D)"; md.style.transform = "rotate(45deg)";
    const mt = document.createElement("span"); mt.textContent = "Milestone";
    mli.appendChild(md); mli.appendChild(mt);
    wrap.appendChild(mli);
    // today marker
    const tli = document.createElement("span");
    tli.className = "li";
    const tk = document.createElement("span");
    tk.style.width = "3px"; tk.style.height = "14px"; tk.style.display = "inline-block";
    tk.style.background = "var(--color-accent,#C67D3E)";
    const tt = document.createElement("span"); tt.textContent = "Today";
    tli.appendChild(tk); tli.appendChild(tt);
    wrap.appendChild(tli);
    return wrap;
  }

  function buildStatusKey() {
    const wrap = document.createElement("div");
    wrap.className = "fg-statuskey";
    const intro = document.createElement("span");
    intro.textContent = "Bar fill:";
    wrap.appendChild(intro);
    STATUS_KEY.forEach(([cls, lab]) => {
      const li = document.createElement("span");
      li.className = "li";
      const bar = document.createElement("span");
      bar.className = "fg-bar fg-design " + cls;
      bar.style.display = "inline-block"; bar.style.width = "26px"; bar.style.height = "13px";
      bar.style.margin = "0"; bar.style.borderRadius = "4px"; bar.style.boxShadow = "none";
      const t = document.createElement("span");
      t.textContent = lab;
      li.appendChild(bar); li.appendChild(t);
      wrap.appendChild(li);
    });
    return wrap;
  }

  function buildMsKey(data) {
    const ms = data.milestones || [];
    if (!ms.length) return null;
    const ol = document.createElement("ol");
    ol.className = "fg-mskey";
    ms.forEach(m => {
      const li = document.createElement("li");
      li.textContent = m.label + " \u2014 Week " + m.week;
      ol.appendChild(li);
    });
    return ol;
  }

  async function render(container) {
    injectStyle();
    container.innerHTML = "";
    container.classList.add("forge-gantt");
    try {
      const data = await DataStore.fetchJSON("data/gantt.json");

      const h2 = document.createElement("h2");
      h2.textContent = "Gantt Chart";
      container.appendChild(h2);

      const intro = document.createElement("p");
      intro.textContent = "Thirteen-week project schedule (single contributor). Week 0 anchor: "
        + (data.week0_start || "(not set \u2014 edit data/gantt.json)")
        + ". Bars span the weeks each task is active; diamonds mark milestones; the vertical line marks today.";
      container.appendChild(intro);

      container.appendChild(buildLegend());
      container.appendChild(buildStatusKey());

      const scroll = document.createElement("div");
      scroll.className = "fg-scroll";
      scroll.appendChild(buildChart(data));
      container.appendChild(scroll);

      const msKey = buildMsKey(data);
      if (msKey) {
        const h3 = document.createElement("h3");
        h3.textContent = "Milestones";
        container.appendChild(h3);
        container.appendChild(msKey);
      }

      const meta = document.createElement("div");
      meta.className = "gantt-meta";
      meta.innerHTML = "<strong>Last updated:</strong> " + (data.last_updated || "\u2014")
        + " &nbsp;|&nbsp; <strong>Source:</strong> <code>data/gantt.json</code>"
        + " &nbsp;|&nbsp; Update workflow: edit JSON, commit, push.";
      container.appendChild(meta);

    } catch (err) {
      const notice = document.createElement("div");
      notice.className = "notice-error";
      notice.textContent = "Could not load Gantt data: " + err.message;
      container.appendChild(notice);
    }
  }

  return { render };
})();
