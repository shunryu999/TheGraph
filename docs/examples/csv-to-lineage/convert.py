"""Convert the two example spreadsheets to v1 JSON on stdout (Python 3 only).

Run from any directory: python3 path/to/convert.py > workshop-lineage.json
This is a worked year-unit example, not a general spreadsheet importer.
"""
import csv
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def rows(name):
    with (HERE / name).open(encoding="utf-8-sig", newline="") as source:
        return [{key: value.strip() for key, value in row.items()}
                for row in csv.DictReader(source)]


def convert():
    nodes = []
    for row in rows("nodes.csv"):
        node = {key: row[key] for key in ("id", "label", "place", "provenance", "note")}
        node.update({key: float(row[key]) for key in ("lat", "lng", "t")})
        if row["tEnd"]:
            node["tEnd"] = float(row["tEnd"])
        if row["source"]:
            node["sources"] = [row["source"]]
        nodes.append(node)
    links = []
    for row in rows("links.csv"):
        value = row["inferred"].lower()
        if value not in ("true", "false"):
            raise ValueError("links.csv: inferred must be true or false")
        links.append({"from": row["from"], "to": row["to"], "kind": row["kind"],
                      "inferred": value == "true", "note": row["note"]})
    return {
        "format": 1,
        "meta": {
            "title": "Three fictional workshops (CSV example)",
            "unit": "year", "tStart": 1900, "tEnd": 1950,
            "description": "An invented lineage for learning the file format.",
            "caveats": "Every workshop, date and relationship is fictional. Do not use this as historical evidence.",
            "sources": ["Fictional teaching example; no historical source."],
            "defaultPick": "hill", "linkKinds": {"copy": "a design copied"},
        },
        "nodes": nodes, "links": links,
    }


if __name__ == "__main__":
    json.dump(convert(), sys.stdout, indent=2, ensure_ascii=False, allow_nan=False)
    print()
