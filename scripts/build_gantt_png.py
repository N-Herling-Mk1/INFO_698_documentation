#!/usr/bin/env python3
"""Render the FORGE project Gantt (from data/gantt.json) to a print-quality
PNG embedded in the LaTeX proposal. Source of truth stays data/gantt.json."""
import json, datetime as dt, pathlib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
from matplotlib.lines import Line2D

ROOT = pathlib.Path(__file__).resolve().parents[1]
data = json.load(open(ROOT / "data" / "gantt.json"))
tasks = data["tasks"]
num_weeks = data["num_weeks"]                      # 13 -> W0..W12
w0 = dt.date.fromisoformat(data["week0_start"])    # 2026-05-18

# Phase colours (match the site legend)
PHASE = {
    "Intro":     "#5A6B86",
    "Planning":  "#5A6B86",
    "MVP P1":    "#5E9B86",
    "MVP P2":    "#5A7BA8",
    "Stretch":   "#C67D3E",
    "Write-up":  "#C79A3E",
    "Deliverables": "#5BA56B",
}
LABEL = {"Intro": "Intro / Planning", "Planning": "Intro / Planning",
         "MVP P1": "MVP \u2014 Phase 1 (standalone)", "MVP P2": "MVP \u2014 Phase 2 (integrate + deploy)",
         "Stretch": "MVP \u2014 Phase 3 / stretch",
         "Write-up": "Write-up / Deliverables", "Deliverables": "Turn in"}
FILL = {"planned": 0.40, "in_progress": 0.70, "done": 1.0}

fig, ax = plt.subplots(figsize=(11.0, 6.2), dpi=200)
n = len(tasks)

# risk-management window(s): shaded vertical band behind the bars
for w in data.get("windows", []):
    ws, we = w.get("start", 0), w.get("end", w.get("start", 0))
    ax.axvspan(ws, we + 1, color="#C67D3E", alpha=0.10, zorder=0)
    ax.axvline(ws, color="#C67D3E", lw=0.9, ls=(0, (4, 3)), alpha=0.6, zorder=1)
    ax.axvline(we + 1, color="#C67D3E", lw=0.9, ls=(0, (4, 3)), alpha=0.6, zorder=1)

for i, t in enumerate(tasks):
    y = n - 1 - i
    s, e = t["start"], t["end"]
    width = (e - s) + 1
    c = PHASE.get(t["phase"], "#888888")
    a = FILL.get(t["status"], 0.5)
    ax.barh(y, width, left=s, height=0.58, color=c, alpha=a,
            edgecolor=c, linewidth=1.1, zorder=3)
    if t["status"] == "in_progress":
        ax.barh(y, width, left=s, height=0.58, fill=False,
                edgecolor="#C67D3E", linewidth=1.4, linestyle=(0, (3, 2)), zorder=4)
    ax.text(-0.35, y, t["name"], ha="right", va="center", fontsize=8.3, color="#1A2238")

# Today marker: 2026-06-12
today = (dt.date(2026, 6, 12) - w0).days / 7.0
ax.axvline(today, color="#C0392B", lw=1.6, zorder=5)
ax.text(today, n - 0.2, "Today", color="#C0392B", fontsize=8, ha="center",
        va="bottom", fontweight="bold")

ax.set_xlim(-0.2, num_weeks)
ax.set_ylim(-0.8, n + 0.2)
ax.set_xticks([w + 0.5 for w in range(num_weeks)])
ax.set_xticklabels([f"W{w}" for w in range(num_weeks)], fontsize=8.5)
ax.set_yticks([])
for w in range(num_weeks + 1):
    ax.axvline(w, color="#E3E6EC", lw=0.7, zorder=1)
for s in ("top", "right", "left"):
    ax.spines[s].set_visible(False)
ax.spines["bottom"].set_color("#B9C0CC")
ax.tick_params(length=0)

# week-1 secondary axis: calendar dates
wk_dates = [(w0 + dt.timedelta(days=7 * w)).strftime("%b %-d") for w in range(num_weeks)]
ax2 = ax.secondary_xaxis("top")
ax2.set_xticks([w + 0.5 for w in range(num_weeks)])
ax2.set_xticklabels(wk_dates, fontsize=6.6, color="#5C657A", rotation=0)
ax2.tick_params(length=0)
for s in ("top", "right", "left"):
    ax2.spines[s].set_visible(False)
ax2.spines["top"].set_visible(False)

seen, handles = set(), []
for ph in ["Intro", "MVP P1", "MVP P2", "Stretch", "Write-up", "Deliverables"]:
    lab = LABEL[ph]
    if lab in seen:
        continue
    seen.add(lab)
    handles.append(Patch(facecolor=PHASE[ph], edgecolor=PHASE[ph], label=lab))
handles += [
    Patch(facecolor="#5A6B86", alpha=0.40, label="Planned"),
    Patch(facecolor="#5A6B86", alpha=0.70, label="In progress"),
    Patch(facecolor="#5A6B86", alpha=1.0, label="Done"),
    Patch(facecolor="#C67D3E", alpha=0.18, edgecolor="#C67D3E", label="Risk window"),
    Line2D([0], [0], color="#C0392B", lw=1.6, label="Today"),
]
ax.legend(handles=handles, loc="upper center", bbox_to_anchor=(0.5, -0.06),
          ncol=5, frameon=False, fontsize=7.2, handlelength=1.4, columnspacing=1.2)

plt.subplots_adjust(left=0.30, right=0.985, top=0.90, bottom=0.13)
out = ROOT / "assets" / "docs" / "gantt_chart.png"
fig.savefig(out, dpi=200, facecolor="white", bbox_inches="tight")
print("wrote", out)
