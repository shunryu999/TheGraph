"""Build sars-cov-2-lineages.json from Nextstrain and Pango, at pinned commits.

    python3 data/sars-cov-2-lineages/build.py

Dates and parents come from Nextstrain's clade files; the Pango lineage for each
clade, its designation note and recombinant parents come from pango-designation.
The only hand-made parts are the tables below: a readable label, the place rule's
coordinates, the WHO reclassification dates, and recombinant parents expressed as
clades. Every choice is explained in SOURCE.md.
"""
import csv
import io
import json
import re
import urllib.request
from pathlib import Path

NEXTSTRAIN = "nextstrain/ncov", "36481bc75458fed3b6da221a8ca5c4d77167e50b"
PANGO = "cov-lineages/pango-designation", "40adc91a9d0e093c22162aaaf79a3ea4b5ea9772"
HERE = Path(__file__).parent


def fetch(repo_sha, path):
    repo, sha = repo_sha
    url = f"https://raw.githubusercontent.com/{repo}/{sha}/{path}"
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read().decode("utf-8")


def tsv(text):
    return list(csv.DictReader(io.StringIO(text), delimiter="\t"))


# The representative Pango lineage of each Nextstrain clade. From 21K on these are
# Nextstrain's own display names; before that, the lineage the clade is best known by.
PANGO_OF = {
    "19A": "B", "19B": "A", "20A": "B.1", "20B": "B.1.1", "20C": None, "20D": "C.1", "20E": "B.1.177",
    "20F": "D.2", "20G": "B.1.2", "20H": "B.1.351", "20I": "B.1.1.7", "20J": "P.1", "21A": "B.1.617.2",
    "21B": "B.1.617.1", "21C": "B.1.427", "21D": "B.1.525", "21E": "P.3", "21F": "B.1.526", "21G": "C.37",
    "21H": "B.1.621", "21I": None, "21J": None, "21M": "B.1.1.529",
}
WHO = {"20H": "Beta", "20I": "Alpha", "20J": "Gamma", "21A": "Delta", "21B": "Kappa", "21C": "Epsilon",
       "21D": "Eta", "21E": "Theta", "21F": "Iota", "21G": "Lambda", "21H": "Mu", "21I": "Delta", "21J": "Delta",
       "21M": "Omicron"}

# Places named in the Pango designation notes, and where they are drawn. A country is
# drawn at its geographic centre; a city or region named in the note, there.
PLACES = {
    "Wuhan": ("Wuhan, China", 30.593, 114.305),
    "Northern Italy": ("Northern Italy", 45.60, 9.80),
    "South Africa": ("South Africa", -29.0, 25.1),
    "Spain": ("Spain", 40.2, -3.6),
    "Australia": ("Australia", -25.3, 133.8),
    "USA": ("United States", 39.8, -98.6),
    "UK": ("United Kingdom", 54.0, -2.5),
    "Brazil": ("Brazil", -10.8, -52.9),
    "India": ("India", 22.4, 79.0),
    "California": ("California, United States", 37.2, -119.5),
    "Philippines": ("Philippines", 12.9, 121.8),
    "New York": ("New York, United States", 40.71, -74.01),
    "Peru": ("Peru", -9.2, -75.0),
    "Colombia": ("Colombia", 3.9, -73.1),
    "Nigeria": ("Nigeria", 9.1, 8.7),
    "China": ("China", 35.9, 104.2),
    "Hong Kong": ("Hong Kong", 22.32, 114.17),
    "Germany": ("Germany", 51.2, 10.4),
    "Senegal": ("Senegal", 14.5, -14.5),
}
REGIONS = {"Europe": ("Europe (the record names only the region)", 50.0, 10.0)}

# Which place in the note is used: the first one it names. Order matters where a note
# names a city and its country, so cities come first.
NOTE_PLACES = [("Northern Italian", "Northern Italy"), ("New York", "New York"), ("(CA)", "California"),
               ("South Africa", "South Africa"), ("Spani", "Spain"), ("Australia", "Australia"), ("Brazil", "Brazil"),
               ("India", "India"), ("Philippines", "Philippines"), ("Peru", "Peru"), ("Colombia", "Colombia"),
               ("Nigeria", "Nigeria"), ("Hong Kong", "Hong Kong"), ("Germany", "Germany"), ("Senegal", "Senegal"),
               ("China", "China"), ("UK", "UK"), ("USA", "USA")]
# The 20E note says "mostly European"; its origin in Spain is from Hodcroft et al., Nature 2021.
PLACE_OVERRIDE = {"19A": "Wuhan", "19B": "Wuhan", "20E": "Spain"}

# WHO reclassified these as "previously circulating": Alpha, Beta, Gamma on 9 March 2022,
# Delta on 7 June 2022. That is the end drawn; it is not extinction.
ENDS = {"20H": "2022-03", "20I": "2022-03", "20J": "2022-03", "21A": "2022-06", "21I": "2022-06", "21J": "2022-06"}

# Recombinants: Pango's parent lineages, expressed as the clades that contain them.
MERGES = {
    "22F": ["21L", "22D"],   # XBB = BJ.1 (BA.2 line) x BM.1.1.1 (BA.2.75 line)
    "24D": ["23D", "24A"],   # XDV = XDE (XBB.1.9 family, via FL.13.4) x JN.1
    "24F": ["24A", "24C"],   # XEC = KS.1.1 (JN.1 line) x KP.3.3
    "25C": ["24H", "25A"],   # XFG = LF.7 x LP.8.1.2
    "25G": ["25A", "24H"],   # XFC = LP.8.1.1 x LF.7
    "25H": ["24A", "24H"],   # XFJ = LS.2.1.1 (JN.1 line) x LF.7.2
}


def main():
    dates = {r["Nextstrain_clade"]: r["first_sequence"] for r in tsv(fetch(NEXTSTRAIN, "defaults/clade_emergence_dates.tsv"))}
    hier = {r["clade"]: r["parent"] for r in tsv(fetch(NEXTSTRAIN, "defaults/clade_hierarchy.tsv"))}
    display = {}
    for line in fetch(NEXTSTRAIN, "defaults/clade_display_names.yml").splitlines():
        m = re.match(r"^(\w+):\s*\w+\s*\(([^)]+)\)", line)
        if m:
            display[m.group(1)] = m.group(2)
    notes = {}
    for line in fetch(PANGO, "lineage_notes.txt").splitlines():
        p = line.split("\t", 1)
        if len(p) == 2:
            notes[p[0].lstrip("*")] = p[1]

    missing = (set(hier) | {"19A"}) - set(dates)
    if missing:
        raise SystemExit(f"no emergence date for {sorted(missing)}")
    # parents before children (21K's parent is 21M, for example)
    clades, done = [], set()
    def visit(c):
        if c in done:
            return
        for p in MERGES.get(c, []) + ([hier[c]] if hier.get(c) else []):
            visit(p)
        done.add(c)
        clades.append(c)
    for c in sorted(set(hier) | {"19A"}):  # clades in the hierarchy; 20A.EU2 and the like are labels, not clades
        visit(c)
    nodes, links, where = [], [], {}
    for c in clades:
        pango = PANGO_OF[c] if c in PANGO_OF else display.get(c)
        who = WHO.get(c)
        note = notes.get(pango, "") if pango else ""
        # label: the WHO name for named pre-Omicron variants, else the Pango lineage, else the clade
        if who and c not in ("21I", "21J"):
            label = who
        elif who:
            label = f"Delta ({c})"
        else:
            label = pango or c
        # place: override, else the first place the note names, else a named region, else the parent's
        key = PLACE_OVERRIDE.get(c) or next((k for s, k in NOTE_PLACES if s in note), None)
        parent = MERGES[c][0] if c in MERGES else hier.get(c)  # a recombinant is drawn from its first parent
        if key:
            place, lat, lng = PLACES[key]
            prov = "detected"
        elif any(r in note for r in REGIONS):
            r = next(r for r in REGIONS if r in note)
            place, lat, lng = REGIONS[r]
            prov = "inferred"
        else:
            _, lat, lng = where[parent]
            place = f"not recorded; drawn at the place of its parent, {nodes_by(nodes, parent)['label']}"
            prov = "inferred"
        where[c] = (place, lat, lng)
        text = f"Nextstrain clade {c}"
        if pango:
            text += f", Pango {pango}"
        if who and label != who:
            text += f", WHO {who}"
        text += f". First sequence {dates[c][:7]} (Nextstrain)."
        if note:
            text += f" Pango note: “{note.strip()}”"
        n = {"id": c, "label": label, "place": place, "lat": lat, "lng": lng, "t": dates[c][:7],
             "provenance": prov, "note": text}
        if c in ENDS:
            n["tEnd"] = ENDS[c]
            n["note"] += f" WHO reclassified it as previously circulating in {ENDS[c]}."
        nodes.append(n)
        if c in MERGES:
            for p in MERGES[c]:
                links.append({"from": p, "to": c, "kind": "merge"})
        elif parent:
            links.append({"from": parent, "to": c})

    data = {
        "format": 1,
        "meta": {
            "title": "SARS-CoV-2 lineages, 2019–2026",
            "unit": "month", "tStart": "2019-12", "tEnd": "2026-09",
            "description": "Every Nextstrain clade of SARS-CoV-2, from the first sequences in Wuhan to the lineages of 2026, each placed where its Pango designation says it was first detected and linked to the clade it descends from.",
            "sources": [
                f"Nextstrain, ncov defaults (clade_emergence_dates, clade_hierarchy, clade_display_names), commit {NEXTSTRAIN[1][:7]}, MIT licence",
                f"Pango lineage designations, lineage_notes.txt and alias_key.json, commit {PANGO[1][:7]}, CC BY 4.0",
                "WHO, tracking SARS-CoV-2 variants: reclassification of Alpha, Beta, Gamma (9 March 2022) and Delta (7 June 2022) as previously circulating",
                "E. B. Hodcroft et al., 'Spread of a SARS-CoV-2 variant through Europe in the summer of 2020', Nature 595 (2021), for 20E in Spain",
            ],
            "caveats": "Places are where a lineage was first detected or described, never where it arose. They come from the Pango designation note; a country is drawn at its geographic centre. Where the note names only a region, or nothing, the place is marked inference and drawn at the region's centre or at the parent's place. Dates are the month of the first sequence in Nextstrain's curation. A line ends where WHO reclassified the variant as previously circulating; that is not extinction. Recombinants are joined to both parent clades.",
            "defaultPick": "24A",
            "linkKinds": {"descent": "descends from it", "merge": "one parent of a recombinant"},
            "licence": "CC BY 4.0 (compilation), from MIT and CC BY 4.0 sources",
        },
        "nodes": nodes, "links": links,
    }
    out = HERE / "sars-cov-2-lineages.json"
    out.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    print(f"wrote {out.name}: {len(nodes)} nodes, {len(links)} links, "
          f"{sum(n['provenance'] == 'detected' for n in nodes)} places recorded, "
          f"{sum(n['provenance'] == 'inferred' for n in nodes)} inferred")


def nodes_by(nodes, cid):
    return next(n for n in nodes if n["id"] == cid)


if __name__ == "__main__":
    main()
