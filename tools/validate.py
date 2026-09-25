"""Check lineage datasets against the v1 format (docs/data-format.md).

    python3 tools/validate.py data/ias-machine-lineage/ias-machine-lineage.json
    python3 tools/validate.py --catalog data/catalog.json

Exits 1 if any file has errors. Warnings are printed but do not fail.
No dependencies beyond Python 3.
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

UNITS = ("year", "month", "day", "yearBP")
PROVENANCE = ("record", "inferred", "detected")
LINK_KINDS = ("descent", "copy", "training", "code", "influence", "merge")
_MONTH = re.compile(r"^(-?\d{1,6})-(\d{2})$")
_DAY = re.compile(r"^(-?\d{1,6})-(\d{2})-(\d{2})$")


def to_decimal(t, unit):
    """A date in the file's unit as a decimal year (years BP become negative)."""
    if unit in ("year", "yearBP"):
        if isinstance(t, bool) or not isinstance(t, (int, float)):
            raise ValueError(f"{t!r} should be a number")
        return -float(t) if unit == "yearBP" else float(t)
    if not isinstance(t, str):
        raise ValueError(f"{t!r} should be a string like {'2021-03' if unit == 'month' else '2021-03-15'}")
    if unit == "month":
        m = _MONTH.match(t)
        if not m or not 1 <= int(m.group(2)) <= 12:
            raise ValueError(f"{t!r} is not a month (YYYY-MM)")
        return int(m.group(1)) + (int(m.group(2)) - 1) / 12
    m = _DAY.match(t)
    if not m:
        raise ValueError(f"{t!r} is not a day (YYYY-MM-DD)")
    y, mo, d = (int(g) for g in m.groups())
    try:
        day_of_year = date(y, mo, d).timetuple().tm_yday - 1 if y > 0 else (mo - 1) * 30.4 + d - 1
    except ValueError:
        raise ValueError(f"{t!r} is not a real date")
    return y + day_of_year / 365.25


class Report:
    def __init__(self, name):
        self.name, self.errors, self.warnings = name, [], []

    def err(self, msg):
        self.errors.append(msg)

    def warn(self, msg):
        self.warnings.append(msg)


def check(data, name="dataset"):
    """Validate one parsed dataset. Returns a Report."""
    r = Report(name)
    if not isinstance(data, dict):
        r.err("the file should be a JSON object")
        return r
    fmt = data.get("format", 1)
    if fmt != 1:
        r.err(f"format {fmt!r} is not supported (expected 1)")
    meta = data.get("meta")
    if not isinstance(meta, dict):
        r.err('"meta" is missing or not an object')
        meta = {}
    if not meta.get("title"):
        r.err('meta.title is required')
    unit = meta.get("unit", "year")
    if unit not in UNITS:
        r.err(f"meta.unit {unit!r} should be one of {', '.join(UNITS)}")
        unit = "year"

    def when(v, where):
        try:
            return to_decimal(v, unit)
        except ValueError as e:
            r.err(f"{where}: {e}")
            return None

    span = [when(meta[k], f"meta.{k}") if k in meta else None for k in ("tStart", "tEnd")]
    if None not in span and span[0] > span[1]:
        r.err("meta.tStart is later than meta.tEnd" + (" (in yearBP, tStart is the larger number)" if unit == "yearBP" else ""))

    kinds_ok = set(LINK_KINDS) | set((meta.get("linkKinds") or {}).keys())
    node_kinds = set((meta.get("kinds") or {}).keys())

    nodes = data.get("nodes")
    if not isinstance(nodes, list) or not nodes:
        r.err('"nodes" should be a non-empty list')
        nodes = []
    ids, times = set(), {}
    for i, n in enumerate(nodes):
        where = f"nodes[{i}]"
        if not isinstance(n, dict):
            r.err(f"{where} is not an object")
            continue
        nid = n.get("id")
        if not isinstance(nid, str) or not nid:
            r.err(f"{where}: id should be a non-empty string")
            continue
        where = f"node {nid!r}"
        if nid in ids:
            r.err(f"{where}: id is used more than once")
        ids.add(nid)
        if not n.get("label"):
            r.warn(f"{where}: no label; the id will be shown")
        for k, lo, hi in (("lat", -90, 90), ("lng", -180, 180)):
            v = n.get(k)
            if isinstance(v, bool) or not isinstance(v, (int, float)):
                r.err(f"{where}: {k} should be a number")
            elif not lo <= v <= hi:
                r.err(f"{where}: {k} {v} is outside {lo} to {hi}")
        if "t" not in n:
            r.err(f"{where}: t is required")
            continue
        t0 = when(n["t"], f"{where}.t")
        t1 = when(n["tEnd"], f"{where}.tEnd") if "tEnd" in n else None
        if t0 is not None:
            times[nid] = t0
            if span[0] is not None and t0 < span[0] - 1e-9:
                r.err(f"{where}: t is before meta.tStart")
            if span[1] is not None and t0 > span[1] + 1e-9:
                r.err(f"{where}: t is after meta.tEnd (the present shell)")
            if t1 is not None and t1 < t0:
                r.err(f"{where}: tEnd is before t")
        prov = n.get("provenance")
        if prov is not None and prov not in PROVENANCE:
            r.err(f"{where}: provenance {prov!r} should be one of {', '.join(PROVENANCE)}")
        if "inferred" in n and not isinstance(n["inferred"], bool):
            r.err(f"{where}: inferred should be true or false")
        if prov == "detected" and n.get("inferred"):
            r.warn(f"{where}: both inferred and detected; provenance wins")
        if "kind" in n and node_kinds and n["kind"] not in node_kinds:
            r.warn(f"{where}: kind {n['kind']!r} has no caption in meta.kinds")

    links = data.get("links", [])
    if not isinstance(links, list):
        r.err('"links" should be a list')
        links = []
    parents = {}
    seen_pairs = set()
    for i, lk in enumerate(links):
        where = f"links[{i}]"
        if not isinstance(lk, dict):
            r.err(f"{where} is not an object")
            continue
        a, b = lk.get("from"), lk.get("to")
        where = f"link {a!r} -> {b!r}"
        bad = False
        for end, v in (("from", a), ("to", b)):
            if v not in ids:
                r.err(f"{where}: {end} {v!r} is not a node id")
                bad = True
        if bad:
            continue
        if a == b:
            r.err(f"{where}: a node cannot be its own parent")
            continue
        if (a, b) in seen_pairs:
            r.warn(f"{where}: duplicate link")
        seen_pairs.add((a, b))
        kind = lk.get("kind", "descent")
        if kind not in kinds_ok:
            r.err(f"{where}: kind {kind!r} is not a standard kind and has no caption in meta.linkKinds")
        if "inferred" in lk and not isinstance(lk["inferred"], bool):
            r.err(f"{where}: inferred should be true or false")
        if a in times and b in times and times[b] < times[a] - 1e-9 and kind != "influence":
            r.warn(f"{where}: the child begins before its parent")
        parents.setdefault(b, []).append(a)

    # cycles: depth-first search over child -> parents
    state = {}

    def visit(v, path):
        state[v] = 1
        for p in parents.get(v, []):
            if state.get(p) == 1:
                cyc = path[path.index(p):] + [p] if p in path else [v, p]
                r.err("links form a cycle: " + " -> ".join(reversed(cyc)))
                return True
            if state.get(p) is None and visit(p, path + [p]):
                return True
        state[v] = 2
        return False

    for v in list(parents):
        if state.get(v) is None and visit(v, [v]):
            break

    pick = meta.get("defaultPick")
    if pick is not None and pick not in ids:
        r.err(f"meta.defaultPick {pick!r} is not a node id")
    for i, s in enumerate(meta.get("inferredSpans") or []):
        if not (isinstance(s, list) and len(s) == 2):
            r.err(f"meta.inferredSpans[{i}] should be [t0, t1]")
            continue
        a, b = when(s[0], f"meta.inferredSpans[{i}][0]"), when(s[1], f"meta.inferredSpans[{i}][1]")
        if a is not None and b is not None and a > b:
            r.err(f"meta.inferredSpans[{i}] runs backwards")

    r.summary = f"{len(ids)} nodes, {len(links)} links, unit {unit}"
    return r


def load(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def check_file(path):
    try:
        data = load(path)
    except (OSError, json.JSONDecodeError) as e:
        r = Report(str(path))
        r.err(f"could not read JSON: {e}")
        return r
    return check(data, str(path))


def check_catalog(path):
    path = Path(path)
    reports = []
    cat_r = Report(str(path))
    reports.append(cat_r)
    try:
        cat = load(path)
    except (OSError, json.JSONDecodeError) as e:
        cat_r.err(f"could not read JSON: {e}")
        return reports
    entries = cat.get("datasets")
    if not isinstance(entries, list) or not entries:
        cat_r.err('"datasets" should be a non-empty list')
        return reports
    seen = set()
    for i, e in enumerate(entries):
        did = e.get("id") if isinstance(e, dict) else None
        if not isinstance(did, str) or not did:
            cat_r.err(f"datasets[{i}]: id should be a non-empty string")
            continue
        if did in seen:
            cat_r.err(f"dataset {did!r}: id is used more than once")
        seen.add(did)
        rel = e.get("path")
        if not isinstance(rel, str) or rel.startswith("/") or ".." in Path(rel).parts:
            cat_r.err(f"dataset {did!r}: path should be relative to the catalog's folder")
            continue
        target = path.parent / rel
        if not target.is_file():
            cat_r.err(f"dataset {did!r}: {rel} does not exist")
            continue
        if not e.get("title"):
            cat_r.warn(f"dataset {did!r}: no title for the picker")
        reports.append(check_file(target))
    cat_r.summary = f"{len(seen)} datasets"
    return reports


def main(argv):
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__.strip())
        return 0
    reports = check_catalog(argv[1]) if argv[0] == "--catalog" and len(argv) > 1 else \
        [check_file(p) for p in argv]
    failed = False
    for r in reports:
        status = "FAIL" if r.errors else "ok"
        print(f"{status:4}  {r.name}" + (f"  ({r.summary})" if getattr(r, "summary", None) else ""))
        for m in r.errors:
            print(f"      error: {m}")
        for m in r.warnings:
            print(f"      warning: {m}")
        failed |= bool(r.errors)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
