"""Keep the published spreadsheet recipe executable and valid."""
import json
import subprocess
import sys
import unittest
from pathlib import Path

import validate

ROOT = Path(__file__).resolve().parent.parent


class TestCSVExample(unittest.TestCase):
    def test_recipe_produces_valid_typed_lineage(self):
        result = subprocess.run(
            [sys.executable, str(ROOT / "docs/examples/csv-to-lineage/convert.py")],
            cwd=ROOT.parent, check=True, capture_output=True, text=True)
        data = json.loads(result.stdout)
        report = validate.check(data)
        self.assertEqual(report.errors, [])
        self.assertEqual(report.warnings, [])
        self.assertEqual(len(data["nodes"]), 3)
        self.assertEqual([link["inferred"] for link in data["links"]], [False, True])
        self.assertNotIn("tEnd", data["nodes"][0])
        self.assertEqual(data["nodes"][1]["tEnd"], 1930)
