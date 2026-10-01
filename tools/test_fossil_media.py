"""Keep source images, credits and specimen identities consistent."""
import hashlib
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'data' / 'hominin-fossils'


class TestFossilMedia(unittest.TestCase):
    def test_all_specimens_have_reviewed_media_states(self):
        nodes = json.loads((ROOT / 'hominin-fossils.json').read_text())['nodes']
        media = json.loads((ROOT / 'media.json').read_text())['specimens']
        self.assertEqual(set(media), {node['id'] for node in nodes})
        for node in nodes:
            item = media[node['id']]
            self.assertEqual(item['source'], node['sources'][0])
            self.assertIn(item['status'], ('available', 'unavailable'))
            if item['status'] == 'unavailable':
                self.assertTrue(item['reason'])
                self.assertNotIn('image', item)
                continue
            image = ROOT / item['image']
            self.assertTrue(image.resolve().is_relative_to(ROOT))
            blob = image.read_bytes()
            self.assertEqual(blob[:4], b'RIFF')
            self.assertEqual(blob[8:12], b'WEBP')
            self.assertEqual(hashlib.sha256(blob).hexdigest(), item['sha256'])
            self.assertTrue(item['credit'])
            self.assertTrue(item['alt'])
            self.assertNotIn('photoNotAvailable', item['original'])
            if 'crop' in item:
                x, y, w, h = item['crop']
                self.assertTrue(0 <= x < x + w <= 1 and 0 <= y < y + h <= 1)
