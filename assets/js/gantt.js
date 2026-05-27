/* ===========================================================
   FORGE INFO 698 — gantt.js
   Read gantt.json, render Excel-style table
   =========================================================== */

const Gantt = (() => {

  const PHASE_CLASS = {
    "Intro":         "phase-intro",
    "Planning":      "phase-planning",
    "Design / Impl": "phase-design",
    "Testing":       "phase-testing",
    "Write-up":      "phase-writeup",
    "Deliverables":  "phase-deliverables",
  };

  const STATUS_LABEL = {
    "planned":     "Planned",
    "in_progress": "In Progress",
    "done":        "Done",
    "slipped":     "Slipped",
  };

  function fmtDate(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr + "T00:00:00");
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function weekDates(week0Start, weekIdx) {
    if (!week0Start) return { start: "", end: "" };
    const start = new Date(week0Start + "T00:00:00");
    start.setDate(start.getDate() + weekIdx * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const iso = (d) => d.toISOString().slice(0, 10);
    return { start: iso(start), end: iso(end) };
  }

  function buildTable(data) {
    const weeks = data.weeks;
    const numWeeks = weeks.length;
    const week0 = data.week0_start || null;

    const t = document.createElement("table");
    t.className = "gantt-table";

    // Header
    const thead = document.createElement("thead");
    const trH = document.createElement("tr");
    ["Week", "Phase", "Activity", "Start", "End", "Status"].forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      trH.appendChild(th);
    });
    for (let w = 0; w < numWeeks; w++) {
      const th = document.createElement("th");
      th.textContent = `W${w}`;
      trH.appendChild(th);
    }
    thead.appendChild(trH);
    t.appendChild(thead);

    // Body
    const tbody = document.createElement("tbody");
    weeks.forEach((row, i) => {
      const tr = document.createElement("tr");

      const tdWk = document.createElement("td");
      tdWk.className = "col-week";
      tdWk.textContent = `Week ${row.week}`;
      tr.appendChild(tdWk);

      const tdPh = document.createElement("td");
      tdPh.className = "col-phase";
      tdPh.textContent = row.phase;
      tr.appendChild(tdPh);

      const tdAc = document.createElement("td");
      tdAc.className = "col-activity";
      tdAc.textContent = row.activity;
      tr.appendChild(tdAc);

      const { start, end } = weekDates(week0, row.week);
      const tdSt = document.createElement("td");
      tdSt.textContent = fmtDate(start);
      tr.appendChild(tdSt);

      const tdEn = document.createElement("td");
      tdEn.textContent = fmtDate(end);
      tr.appendChild(tdEn);

      const tdStatus = document.createElement("td");
      tdStatus.className = "col-status";
      const badge = document.createElement("span");
      badge.className = `status-badge status-${row.status || "planned"}`;
      badge.textContent = STATUS_LABEL[row.status] || "Planned";
      tdStatus.appendChild(badge);
      tr.appendChild(tdStatus);

      // Week bar cells
      for (let w = 0; w < numWeeks; w++) {
        const td = document.createElement("td");
        td.className = "gantt-bar-cell";
        if (w === row.week) {
          const bar = document.createElement("span");
          bar.className = `gantt-bar ${PHASE_CLASS[row.phase] || ""}`;
          bar.title = `${row.activity} (Week ${row.week})`;
          td.appendChild(bar);
        }
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });
    t.appendChild(tbody);
    return t;
  }

  function buildLegend() {
    const phases = [
      ["Intro",         "phase-intro"],
      ["Planning",      "phase-planning"],
      ["Design / Impl", "phase-design"],
      ["Testing",       "phase-testing"],
      ["Write-up",      "phase-writeup"],
      ["Deliverables",  "phase-deliverables"],
    ];
    const wrap = document.createElement("div");
    wrap.className = "gantt-legend";
    phases.forEach(([label, cls]) => {
      const item = document.createElement("div");
      item.className = "legend-item";
      const sw = document.createElement("span");
      sw.className = `legend-swatch ${cls}`;
      const bar = document.createElement("span");
      bar.className = `gantt-bar ${cls}`;
      bar.style.height = "14px";
      bar.style.width  = "14px";
      bar.style.display = "inline-block";
      bar.style.margin = "0";
      sw.appendChild(bar);
      const txt = document.createElement("span");
      txt.textContent = label;
      item.appendChild(sw);
      item.appendChild(txt);
      wrap.appendChild(item);
    });
    return wrap;
  }

  async function render(container) {
    container.innerHTML = "";
    try {
      const data = await DataStore.fetchJSON("data/gantt.json");

      const h2 = document.createElement("h2");
      h2.textContent = "Gantt Chart";
      container.appendChild(h2);

      const intro = document.createElement("p");
      intro.textContent = `Thirteen-week project schedule. Week 0 anchor: ${data.week0_start || "(not set — edit data/gantt.json)"}.`;
      container.appendChild(intro);

      const wrap = document.createElement("div");
      wrap.className = "gantt-wrapper";
      wrap.appendChild(buildTable(data));
      container.appendChild(wrap);

      container.appendChild(buildLegend());

      const meta = document.createElement("div");
      meta.className = "gantt-meta";
      meta.innerHTML = `<strong>Last updated:</strong> ${data.last_updated || "—"} &nbsp;|&nbsp; <strong>Source:</strong> <code>data/gantt.json</code> &nbsp;|&nbsp; Update workflow: edit JSON, commit, push.`;
      container.appendChild(meta);

    } catch (err) {
      const notice = document.createElement("div");
      notice.className = "notice-error";
      notice.textContent = `Could not load Gantt data: ${err.message}`;
      container.appendChild(notice);
    }
  }

  return { render };
})();
