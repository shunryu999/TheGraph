# SARS-CoV-2 lineages, 2019–2026 (viewer roadmap M2)

Sixty clades and sixty-five links: every clade in Nextstrain's SARS-CoV-2 hierarchy, from 19A (Wuhan, December 2019) to 26B (October 2025). Each is placed where its Pango designation says it was first detected, dated by its first sequence, and linked to the clade it descends from. The six recombinants are linked to both parents.

## Sources

- **Nextstrain**, [`nextstrain/ncov`](https://github.com/nextstrain/ncov) at commit `36481bc` (24 Sept 2026), MIT licence:
  - `defaults/clade_emergence_dates.tsv` — the first sequence of each clade, used as the date (month resolution);
  - `defaults/clade_hierarchy.tsv` — each clade's parent;
  - `defaults/clade_display_names.yml` — the Pango lineage each clade from 21K onward is known by.
- **Pango**, [`cov-lineages/pango-designation`](https://github.com/cov-lineages/pango-designation) at commit `40adc91` (24 Sept 2026), CC BY 4.0:
  - `lineage_notes.txt` — the designation note for each lineage, which is where the place comes from; the note is quoted in full on each node's card;
  - `pango_designation/alias_key.json` — the parents of recombinants (XBB, XDV, XEC, XFG, XFC, XFJ).
- **WHO**, *Tracking SARS-CoV-2 variants*: Alpha, Beta and Gamma reclassified as previously circulating on 9 March 2022, Delta on 7 June 2022 (checked by web search, 25 Sept 2026).
- **E. B. Hodcroft et al.**, "Spread of a SARS-CoV-2 variant through Europe in the summer of 2020", *Nature* 595 (2021): the origin of 20E (B.1.177, "EU1") in Spain, which its Pango note describes only as "mostly European".

`build.py` downloads these files at the pinned commits and rebuilds the JSON exactly: `python3 data/sars-cov-2-lineages/build.py`. Everything hand-made is in the tables at the top of that script.

## How it was built

- **Detected, not originated.** A place is where a lineage was first detected or described. The data never says where a lineage arose, and no lineage is named after a place. Every recorded place has `"provenance": "detected"`, and the viewer says "first detected" on the card and draws the node as an open ring.
- **The place rule.** The place is the first place the Pango note names, drawn at the country's geographic centre, or at the city or region the note names (Wuhan, Northern Italy, New York, California). Where the note names only a region ("Europe"), the node is drawn at the region's centre and marked inference. Where it names nothing, the node is drawn at its parent's place and marked inference, and the card says so. That gives 35 recorded places and 25 inferred.
- **Dates** are Nextstrain's first sequence for the clade, to the month. They can be earlier than when the lineage was noticed or designated.
- **Endings.** A line ends where WHO reclassified the variant as previously circulating: Alpha, Beta, Gamma (March 2022) and the three Delta clades (June 2022). That is a change of status, not extinction. Other clades run to the present.
- **Labels** use the WHO name for the variants WHO named before Omicron, and the Pango lineage for everything else; the clade code and the full Pango note are on the card.
- **Representative lineages.** Before 21K, Nextstrain clades do not map one-to-one to Pango lineages; the lineage each is best known by is used (for example 20A → B.1, 20I → B.1.1.7). 20C, 21I and 21J have no single representative and are labelled by clade.
- **Recombinants** are linked to the clades containing their Pango parents, with `"kind": "merge"`: XBB (21L × 22D), XDV (23D × 24A), XEC (24A × 24C), XFG (24H × 25A), XFC (25A × 24H), XFJ (24A × 24H).

## Licence

The compilation is released under CC BY 4.0. It is derived from Nextstrain (MIT) and Pango (CC BY 4.0) data; attribute both when reusing it.
