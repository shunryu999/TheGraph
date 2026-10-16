# Fossil viewer image sources

Retrieved **1 October 2026** from the specimen pages already cited by this dataset. [`media.json`](media.json) is the per-specimen register: page URL, original image URL, source alt text, credit, availability and SHA-256 of each local image. Every one of the 32 records has an explicit state. The 29 photographs under [`images/`](images/) total approximately 1.18 MB and are **unaltered copies of the Smithsonian page's WebP renditions**.

## What the viewer displays

The panel appears above Dataset for the catalog's hominin case study and follows the selected specimen. It defaults to a thin-line study computed in the browser from the photograph. Photo mode displays the source image. Both modes can zoom and pan; line detail is adjustable. Clearing selection removes the image and credit; choosing another dataset hides the panel.

These are two-dimensional image contours, not a 3D scan, an anatomical segmentation, or new evidence. The renderer smooths photographic grain, detects strong edges, retains connected weaker detail and draws thin strokes. Lighting, damage, mounting materials and source annotations may appear in the drawing. It neither restores missing bone nor invents an unseen side. The caption identifies Lucy's photographed skeleton as a reconstruction and Irhoud 3 as a tooth fragment with a photomicrograph inset.

The line view fits the bounds of the traced subject. For Lucy and KNM-WT 15000, a recorded normalized crop (`x, y, width, height`) omits only the black side borders, which would otherwise become spurious vertical lines. The complete original remains visible in Photo mode; source files are never cropped or overwritten. The small decoded-image cache is bounded, and late image loads cannot replace a newer selection.

## Availability

The specimen pages for **ARA-VP-6/500 (Ardi), BOU-VP-12/1 and Omo I** currently provide a “photo not available” placeholder. The viewer shows a message and a link to the actual record for these three. No placeholder is traced as a fossil and no substitute specimen is used. Failed image requests also retain the source link and clear the previous drawing.

## Credits and terms

Each image keeps the credit printed on its specimen page, available in `media.json` and directly below the drawing. SK 48's page does not list an individual photographer; its record says this rather than guessing from its filename. The Smithsonian's displayed images are **not assumed to be CC0**. Their [Terms of Use](https://www.si.edu/termsofuse) distinguish open-access material from content with usage conditions. This viewer uses the latter as attributed illustrations in the project's educational case study; it does not grant a general reuse licence. Third-party rights remain with the credited holders.

**DNH 7 has a separate explicit licence:** the [original Commons file](https://commons.wikimedia.org/wiki/File:DNH7.jpg), by **Dr. Andy I. R. Herries (DrHerries), The Drimolen Field School**, is [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Its source photograph and the derived line study are attributed and distributed under that licence. The panel links the licence and marks the line study as derived. The project's compilation notice does not override these image rights.

The register retains the original source captions, including credits to Chip Clark, the Human Origins Program, Zeresenay Alemseged, Tanya Smith, Tyler Evans, James Di Loreto and Donald H. Hurlbert. The repository's existing all-rights-reserved notice applies to its own compilation, with third-party media expressly excluded.

## Maintenance and checks

Keep specimen ids aligned with `hominin-fossils.json`. Before replacing a photograph, verify its specimen identity and credit on the source page, update the URL/retrieval record and checksum, and inspect its line view. An unavailable record should gain an image only when an identified source photograph is supplied.

`tools/test_fossil_media.py` checks coverage, source-record identity, local image bytes, checksums, credits and crop bounds. Browser tests render all 29 images, check the three unavailable states, exercise photo/line modes, zoom, keyboard behavior, delayed and failed loads, dataset switching, and narrow-screen/dark-theme display. Tests serve the committed assets locally; they do not scrape the museum or depend on its availability. Published images are fetched from this site's own data directory; the source links open the museum only when the reader chooses them.
