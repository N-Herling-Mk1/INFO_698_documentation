#!/usr/bin/env python3
"""
build_xlsx.py — Generate FORGE_INFO698_Gantt.xlsx from data/gantt.json.

Run from repo root:
    python scripts/build_xlsx.py

The resulting .xlsx is written to the repo root and is intended to be
committed alongside gantt.json so external viewers (advisor, sponsor)
can download a familiar spreadsheet.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

try:
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.utils import get_column_letter
except ImportError:
    sys.exit("Missing dependency: pip install openpyxl")


REPO_ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = REPO_ROOT / "data" / "gantt.json"
OUT_PATH  = REPO_ROOT / "FORGE_INFO698_Gantt.xlsx"

PHASE_FILLS = {
    "Intro":         "A8C5BA",
    "Planning":      "6BA292",
    "Design / Impl": "5A7BA8",
    "Testing":       "B58D7A",
    "Write-up":      "8E6A8A",
    "Deliverables":  "5C4B7A",
}


def parse_week0(s: str) -> datetime | None:
    if not s:
        return None
    try:
        return datetime.strptime(s, "%Y-%m-%d")
    except ValueError:
        return None


def build():
    if not JSON_PATH.exists():
        sys.exit(f"gantt.json not found at {JSON_PATH}")

    data = json.loads(JSON_PATH.read_text())
    weeks = data["weeks"]
    week0 = parse_week0(data.get("week0_start", ""))
    num_weeks = len(weeks)

    wb = Workbook()
    ws = wb.active
    ws.title = "FORGE_Gantt"

    header_fill = PatternFill("solid", start_color="0F1F3D")
    white_bold  = Font(color="FFFFFF", bold=True, name="Calibri")
    normal      = Font(name="Calibri")
    bold        = Font(bold=True, name="Calibri")
    italic_gray = Font(italic=True, color="666666", name="Calibri")
    light_gray  = PatternFill("solid", start_color="F4F6FA")
    yellow_hl   = PatternFill("solid", start_color="FFF2CC")
    thin = Side(border_style="thin", color="D9DCE3")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)

    # Parameter block
    ws["A1"] = "Week 0 start:"
    ws["A1"].font = bold
    ws["B1"] = data.get("week0_start", "")
    ws["B1"].fill = yellow_hl
    ws["B1"].number_format = "yyyy-mm-dd"
    ws["C1"] = "(Edit data/gantt.json week0_start)"
    ws["C1"].font = italic_gray

    ws["A2"] = "Project:"; ws["A2"].font = bold
    ws["B2"] = data.get("project", "FORGE"); ws["B2"].font = normal

    ws["A3"] = "Owner:"; ws["A3"].font = bold
    ws["B3"] = data.get("owner", ""); ws["B3"].font = normal

    ws["A4"] = "Updated:"; ws["A4"].font = bold
    ws["B4"] = data.get("last_updated", ""); ws["B4"].font = normal

    # Header
    HEADER_ROW = 6
    headers = ["Week", "Phase", "Activity", "Start", "End", "Status"]
    for w in range(num_weeks):
        headers.append(f"W{w}")
    for col_idx, h in enumerate(headers, start=1):
        c = ws.cell(row=HEADER_ROW, column=col_idx, value=h)
        c.fill = header_fill
        c.font = white_bold
        c.alignment = Alignment(horizontal="center", vertical="center")
        c.border = border

    # Body
    start_row = HEADER_ROW + 1
    for i, row in enumerate(weeks):
        r = start_row + i
        wk = row["week"]
        phase = row["phase"]
        fill_hex = PHASE_FILLS.get(phase, "CCCCCC")
        phase_fill = PatternFill("solid", start_color=fill_hex)

        ws.cell(row=r, column=1, value=f"Week {wk}").font = bold
        ws.cell(row=r, column=2, value=phase).font = normal
        ws.cell(row=r, column=3, value=row["activity"]).font = normal

        if week0:
            s = week0 + timedelta(days=wk * 7)
            e = s + timedelta(days=6)
            ws.cell(row=r, column=4, value=s).number_format = "yyyy-mm-dd"
            ws.cell(row=r, column=5, value=e).number_format = "yyyy-mm-dd"
        else:
            ws.cell(row=r, column=4, value="")
            ws.cell(row=r, column=5, value="")

        ws.cell(row=r, column=6, value=row.get("status", "planned"))
        ws.cell(row=r, column=6).alignment = Alignment(horizontal="center")

        for w in range(num_weeks):
            c = ws.cell(row=r, column=7 + w)
            c.border = border
            if w == wk:
                c.fill = phase_fill
            else:
                c.fill = light_gray

        for col in range(1, 7):
            ws.cell(row=r, column=col).border = border

    # Widths
    ws.column_dimensions["A"].width = 10
    ws.column_dimensions["B"].width = 16
    ws.column_dimensions["C"].width = 52
    ws.column_dimensions["D"].width = 13
    ws.column_dimensions["E"].width = 13
    ws.column_dimensions["F"].width = 12
    for w in range(num_weeks):
        ws.column_dimensions[get_column_letter(7 + w)].width = 5

    ws.freeze_panes = "G7"

    # Legend
    legend_start = start_row + num_weeks + 2
    ws.cell(row=legend_start, column=1, value="Legend").font = bold
    for i, (phase, hex_) in enumerate(PHASE_FILLS.items()):
        r = legend_start + 1 + i
        swatch = ws.cell(row=r, column=1, value="")
        swatch.fill = PatternFill("solid", start_color=hex_)
        swatch.border = border
        ws.cell(row=r, column=2, value=phase).font = normal

    wb.save(OUT_PATH)
    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    build()
