"""Tests for validate.py.  Run: python3 -m unittest discover tools"""
import copy
import json
import tempfile
import unittest
from pathlib import Path

import validate as V

ROOT = Path(__file__).resolve().parent.parent

GOOD = {
    "format": 1,
    "meta": {"title": "Test", "unit": "year", "tStart": 1900, "tEnd": 1950, "defaultPick": "b",
             "linkKinds": {"copy": "a design copied", "graft": "a graft"}},
    "nodes": [
        {"id": "a", "label": "A", "lat": 10, "lng": 20, "t": 1900},
        {"id": "b", "label": "B", "lat": -10, "lng": 170, "t": 1910, "tEnd": 1930},
        {"id": "c", "label": "C", "lat": 0, "lng": 0, "t": 1920, "provenance": "detected"},
    ],
    "links": [
        {"from": "a", "to": "b", "kind": "copy"},
        {"from": "a", "to": "c"},
        {"from": "b", "to": "c", "kind": "graft", "inferred": True},
    ],
}


def run(data):
    return V.check(data)


def with_(**changes):
    d = copy.deepcopy(GOOD)
    for path, value in changes.items():
        obj = d
        *head, last = path.split("__")
        for k in head:
            obj = obj[int(k)] if k.isdigit() else obj[k]
        if value is DELETE:
            del obj[int(last) if last.isdigit() else last]
        else:
            obj[int(last) if last.isdigit() else last] = value
    return d


DELETE = object()


class TestTime(unittest.TestCase):
    def test_units(self):
        self.assertEqual(V.to_decimal(1946, "year"), 1946)
        self.assertEqual(V.to_decimal(3_200_000, "yearBP"), -3_200_000)
        self.assertAlmostEqual(V.to_decimal("2021-03", "month"), 2021 + 2 / 12)
        self.assertAlmostEqual(V.to_decimal("2021-01-01", "day"), 2021)
        self.assertLess(V.to_decimal("2021-12-31", "day"), 2022)

    def test_bad_dates(self):
        for t, unit in (("1946", "year"), (True, "year"), (2021, "month"), ("2021-13", "month"),
                        ("2021-02-30", "day"), ("March 2021", "day")):
            with self.assertRaises(ValueError, msg=(t, unit)):
                V.to_decimal(t, unit)


class TestCheck(unittest.TestCase):
    def test_good_file_passes(self):
        r = run(GOOD)
        self.assertEqual(r.errors, [])
        self.assertEqual(r.warnings, [])

    def test_draft_format_still_valid(self):
        draft = {"meta": {"title": "Draft"},
                 "nodes": [{"id": "x", "label": "X", "lat": 1, "lng": 2, "t": 1950, "inferred": True}],
                 "links": []}
        self.assertEqual(run(draft).errors, [])

    def assertError(self, data, fragment):
        r = run(data)
        self.assertTrue(any(fragment in e for e in r.errors), f"no error containing {fragment!r}: {r.errors}")

    def test_errors(self):
        self.assertError(with_(meta__title=""), "meta.title")
        self.assertError(with_(meta__unit="decade"), "meta.unit")
        self.assertError(with_(nodes__1__id="a"), "used more than once")
        self.assertError(with_(nodes__0__lat=95), "outside")
        self.assertError(with_(nodes__0__lng="20"), "lng should be a number")
        self.assertError(with_(nodes__2__t=DELETE), "t is required")
        self.assertError(with_(nodes__1__tEnd=1905), "tEnd is before t")
        self.assertError(with_(nodes__2__t=1960), "after meta.tEnd")
        self.assertError(with_(nodes__2__provenance="rumoured"), "provenance")
        self.assertError(with_(links__0__to="zz"), "not a node id")
        self.assertError(with_(links__1__kind="osmosis"), "not a standard kind")
        self.assertError(with_(meta__defaultPick="zz"), "defaultPick")
        self.assertError(with_(meta__tStart=1960), "tStart is later")

    def test_cycle(self):
        d = copy.deepcopy(GOOD)
        d["links"].append({"from": "c", "to": "a"})
        self.assertError(d, "cycle")

    def test_self_link(self):
        d = copy.deepcopy(GOOD)
        d["links"].append({"from": "a", "to": "a"})
        self.assertError(d, "own parent")

    def test_child_before_parent_warns(self):
        d = with_(nodes__1__t=1895, meta__tStart=1890)
        r = run(d)
        self.assertEqual(r.errors, [])
        self.assertTrue(any("before its parent" in w for w in r.warnings))

    def test_influence_may_run_backwards(self):
        d = with_(nodes__1__t=1895, meta__tStart=1890, links__0__kind="influence")
        self.assertFalse(any("before its parent" in w for w in run(d).warnings))

    def test_month_and_bp_units(self):
        months = {"meta": {"title": "M", "unit": "month", "tStart": "2019-12", "tEnd": "2024-06"},
                  "nodes": [{"id": "r", "label": "R", "lat": 30.6, "lng": 114.3, "t": "2019-12"},
                            {"id": "k", "label": "K", "lat": 52, "lng": 0, "t": "2020-09", "tEnd": "2021-12",
                             "provenance": "detected"}],
                  "links": [{"from": "r", "to": "k"}]}
        self.assertEqual(run(months).errors, [])
        bp = {"meta": {"title": "BP", "unit": "yearBP", "tStart": 7_000_000, "tEnd": 40_000},
              "nodes": [{"id": "s", "label": "S", "lat": 16, "lng": 18, "t": 7_000_000},
                        {"id": "l", "label": "L", "lat": 11, "lng": 40.6, "t": 3_200_000}],
              "links": [{"from": "s", "to": "l", "inferred": True}]}
        self.assertEqual(run(bp).errors, [])
        bp["meta"]["tStart"], bp["meta"]["tEnd"] = 40_000, 7_000_000
        self.assertError(bp, "larger number")


class TestCatalog(unittest.TestCase):
    def test_repo_catalog_is_valid(self):
        reports = V.check_catalog(ROOT / "data" / "catalog.json")
        for r in reports:
            self.assertEqual(r.errors, [], r.name)

    def test_catalog_errors(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            (tmp / "a.json").write_text(json.dumps(GOOD))
            (tmp / "catalog.json").write_text(json.dumps({"datasets": [
                {"id": "a", "path": "a.json", "title": "A"},
                {"id": "a", "path": "missing.json", "title": "B"},
                {"id": "c", "path": "../escape.json", "title": "C"}]}))
            errs = V.check_catalog(tmp / "catalog.json")[0].errors
            self.assertTrue(any("more than once" in e for e in errs))
            self.assertTrue(any("does not exist" in e for e in errs))
            self.assertTrue(any("relative" in e for e in errs))


if __name__ == "__main__":
    unittest.main()
