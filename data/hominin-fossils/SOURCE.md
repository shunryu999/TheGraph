# Hominin fossil finds, 7 Ma–40 ka

First version prepared 28 September 2026. **32 occurrences, 15 inferred comparison links.** This is the next deep-time case study after viewer M5 and an initial bridge to roadmap #17. It is a curated comparison graph, **not a reconstructed species phylogeny or a chain of individual ancestors**. An expert-reviewed ancestry model remains follow-up work.

Open the viewer with `?d=hominins&pick=knm-wt-15000`. The stronger initial density gradient is 3.0; the control remains adjustable.

## Sources and selection

The [Smithsonian National Museum of Natural History fossil collection](https://humanorigins.si.edu/evidence/human-fossils/fossils) supplies specimen identities, named discovery sites, approximate ages and taxonomic assignments. Individual records were retrieved on 28 September 2026 and are cited on every node. Facts are curated manually; no museum prose, scans or models are included in the lineage file. The optional fossil panel uses the separately attributed photographs documented in [MEDIA.md](MEDIA.md). This is a source-specific selection, not an exhaustive review of all current dating or taxonomic literature.

Three age decisions use dating research alongside the museum record:

- Richter et al. (2017), [The age of the hominin fossils from Jebel Irhoud, Morocco, and the origins of the Middle Stone Age](https://doi.org/10.1038/nature22335): the recalculated tooth age for **Irhoud 3 is 286 ± 32 ka**. This replaces the museum page's 160 ka age. The distinct 315 ± 34 ka estimate dates associated archaeological material; it is not substituted for the specimen-specific tooth estimate.
- Grün et al. (2020), [Dating the skull from Broken Hill, Zambia, and its position in human evolution](https://doi.org/10.1038/s41586-020-2165-4): **Kabwe 1 is plotted at 299 ka**, with the reported ±25 ka (2σ) shown on its card. This agrees with the museum's 274–324 ka interval. The museum's *Homo heidelbergensis* grouping is retained as a source attribution, not a resolution of the taxonomic debate.
- Vidal et al. (2022), [Age of the oldest known Homo sapiens from eastern Africa](https://doi.org/10.1038/s41586-021-04275-8): a dated overlying horizon supplies a **minimum age of 233 ± 22 ka for Omo I**. Its point at 233 ka is explicitly a lower-bound display anchor, not an estimated exact fossil age. No chronological comparison link is drawn to this node because the one-sided constraint does not establish its order relative to Irhoud 3. This supersedes the museum page's 195 ka estimate.

These papers were consulted on 28 September 2026. Approximate museum ages remain approximate; this compilation does not make them new measurements. Source updates may change both dates and classifications.

## What the representation means

- Each node is a fossil occurrence. `tEnd = t` makes it a single temporal point, so an individual is never drawn as surviving millions of years. `t` is a display anchor: an approximate published age, the midpoint of a source interval, or the explicitly identified Omo I minimum-age anchor. `dateLabel` preserves the qualification on the card. Dates are numeric `yearBP`; the rounded geological ages are used directly, without an artificial 1950-year correction that would imply unsupported precision.
- Every node has `provenance: inferred` because dates are estimates and coordinates are approximate placements. The underlying fossils are documented physical finds. The one provenance field cannot separately encode fossil documentation, date estimation and map approximation; notes explain that distinction.
- Latitude and longitude are **editorial regional estimates at whole-degree resolution**, guided by the named sites below. They are not surveyed excavation coordinates, are not a geocoding product, and have not undergone site-by-site geographic review. Nearby sites may share a point. Do not use this dataset to locate an excavation, estimate travel distances, infer migration routes or reconstruct ancient geography. The viewer's modern coastlines are reference outlines only. Precise georeferencing is follow-up work.
- Nodes sharing a taxonomic assignment in the cited museum records are compared by links from the earliest plotted member to later members. The choice of that hub is editorial, made only to keep the graph sparse and acyclic. A tied plotting age uses stable id order with **no temporal precedence implied**. These 15 links are all `kind: comparison, inferred: true`; the two endpoint citations support the shared classification, not the link as an observed historical event. The graph supplies no links between different taxa and does not claim migrations, breeding relationships, taxon origins or individual ancestry.
- `relationshipMode: comparison` prevents the card from describing these links as ancestors or descendants. Selection still highlights a connected trace in vermilion; clear it to inspect the grey inference marks. The header, legend and card explain the comparison convention.
- The displayed point and thin line do not visualize dating probability or uncertainty bounds. Intervals may overlap. Density changes spacing only. `inferredSpans` is deliberately absent: gaps between finds are sampling gaps, not entire geological periods declared hypothetical.

## Coverage and omissions

The sample includes early possible hominins, australopiths, *Paranthropus*, early *Homo*, geographically dispersed *H. erectus*, Middle Pleistocene *Homo*, *H. sapiens* and Neanderthals. It ends with Feldhofer at approximately 40 ka. The outer display limit is not an extinction claim. Omitted groups include Denisovans, *H. naledi*, *H. floresiensis* and *H. luzonensis*. There are no inferred ghost populations or genetic admixture edges.

This first release leaves out the Sterkfontein STS records, Malapa MH1/MH2 and KNM-WT 40000 until their dating or classification choices can receive a focused review. Shanidar 1 is omitted because the museum interval extends younger than the selected cutoff. These omissions are editorial scope choices, not judgments about scientific importance.

## Record register

Coordinates below are the editorial regional placements described above. The plotting age is not necessarily the full age estimate; the JSON card text records qualifications. Follow each specimen citation for the original museum record.

| Specimen / museum record | Museum taxon | Plotting age (BP) | Approximate regional lat, lng |
|---|---|---:|---|
| [TM 266-01-060-1 (Toumaï)](https://humanorigins.si.edu/evidence/human-fossils/fossils/tm-266-01-060-1) | Sahelanthropus tchadensis | 6,500,000 | 16, 17 |
| [BAR 1002’00](https://humanorigins.si.edu/evidence/human-fossils/fossils/bar-100200) | Orrorin tugenensis | 6,000,000 | 1, 36 |
| [ARA-VP-6/500 (Ardi)](https://humanorigins.si.edu/evidence/human-fossils/fossils/ara-vp-6500) | Ardipithecus ramidus | 4,400,000 | 10, 40 |
| [KNM-KP 29285](https://humanorigins.si.edu/evidence/human-fossils/fossils/knm-kp-29285) | Australopithecus anamensis | 4,100,000 | 2, 36 |
| [DIK-1-1 (Selam)](https://humanorigins.si.edu/evidence/human-fossils/fossils/dik-1-1) | Australopithecus afarensis | 3,300,000 | 11, 41 |
| [AL 288-1 (Lucy)](https://humanorigins.si.edu/evidence/human-fossils/fossils/al-288-1) | Australopithecus afarensis | 3,200,000 | 11, 41 |
| [AL 444-2](https://humanorigins.si.edu/evidence/human-fossils/fossils/al-444-2) | Australopithecus afarensis | 3,000,000 | 11, 41 |
| [Taung Child](https://humanorigins.si.edu/evidence/human-fossils/fossils/taung-child) | Australopithecus africanus | 2,800,000 | -28, 25 |
| [BOU-VP-12/1](https://humanorigins.si.edu/evidence/human-fossils/fossils/bou-vp-121) | Australopithecus garhi | 2,500,000 | 10, 41 |
| [KNM-WT 17000](https://humanorigins.si.edu/evidence/human-fossils/fossils/knm-wt-17000) | Paranthropus aethiopicus | 2,500,000 | 4, 36 |
| [DNH 7](https://humanorigins.si.edu/evidence/human-fossils/fossils/dnh-7) | Paranthropus robustus | 1,995,000 | -26, 28 |
| [KNM-ER 1470](https://humanorigins.si.edu/evidence/human-fossils/fossils/knm-er-1470) | Homo rudolfensis | 1,900,000 | 4, 36 |
| [KNM-ER 1813](https://humanorigins.si.edu/evidence/human-fossils/fossils/knm-er-1813) | Homo habilis | 1,900,000 | 4, 36 |
| [KNM-ER 3733](https://humanorigins.si.edu/evidence/human-fossils/fossils/knm-er-3733) | Homo erectus | 1,800,000 | 4, 36 |
| [OH 24](https://humanorigins.si.edu/evidence/human-fossils/fossils/oh-24) | Homo habilis | 1,800,000 | -3, 35 |
| [OH 5](https://humanorigins.si.edu/evidence/human-fossils/fossils/oh-5) | Paranthropus boisei | 1,800,000 | -3, 35 |
| [D2282](https://humanorigins.si.edu/evidence/human-fossils/fossils/d2282) | Homo erectus | 1,770,000 | 41, 44 |
| [D3444](https://humanorigins.si.edu/evidence/human-fossils/fossils/d3444) | Homo erectus | 1,770,000 | 41, 44 |
| [KNM-ER 406](https://humanorigins.si.edu/evidence/human-fossils/fossils/knm-er-406) | Paranthropus boisei | 1,700,000 | 4, 36 |
| [KNM-ER 732 A](https://humanorigins.si.edu/evidence/human-fossils/fossils/knm-er-732) | Paranthropus boisei | 1,700,000 | 4, 36 |
| [SK 46](https://humanorigins.si.edu/evidence/human-fossils/fossils/sk-46) | Paranthropus robustus | 1,650,000 | -26, 28 |
| [SK 48](https://humanorigins.si.edu/evidence/human-fossils/fossils/sk-48) | Paranthropus robustus | 1,650,000 | -26, 28 |
| [KNM-ER 3883](https://humanorigins.si.edu/evidence/human-fossils/fossils/knm-er-3883) | Homo erectus | 1,600,000 | 4, 36 |
| [KNM-WT 15000](https://humanorigins.si.edu/evidence/human-fossils/fossils/knm-wt-15000) | Homo erectus | 1,600,000 | 4, 36 |
| [Sangiran 17](https://humanorigins.si.edu/evidence/human-fossils/fossils/sangiran-17) | Homo erectus | 1,150,000 | -7, 111 |
| [Bodo](https://humanorigins.si.edu/evidence/human-fossils/fossils/bodo) | Homo heidelbergensis | 600,000 | 10, 41 |
| [Kabwe 1](https://humanorigins.si.edu/evidence/human-fossils/fossils/kabwe-1) | Homo heidelbergensis | 299,000 | -14, 28 |
| [Irhoud 3](https://humanorigins.si.edu/evidence/human-fossils/fossils/irhoud-3) | Homo sapiens | 286,000 | 32, -9 |
| [Omo I](https://humanorigins.si.edu/evidence/human-fossils/fossils/omo-i) | Homo sapiens | 233,000 | 5, 36 |
| [La Chapelle-aux-Saints 1](https://humanorigins.si.edu/evidence/human-fossils/fossils/la-chapelle-aux-saints) | Homo neanderthalensis | 60,000 | 45, 2 |
| [La Ferrassie 1](https://humanorigins.si.edu/evidence/human-fossils/fossils/la-ferrassie) | Homo neanderthalensis | 60,000 | 45, 1 |
| [Feldhofer 1](https://humanorigins.si.edu/evidence/human-fossils/fossils/feldhofer) | Homo neanderthalensis | 40,000 | 51, 7 |

## Rights and reproducibility

All rights reserved for this compilation until launch, following the current project handoff. Third-party source material retains its own terms; citation does not relicense it. The lineage compilation uses factual fields and original summaries, without article text. Photographs for the fossil panel retain their separate credits and terms in [MEDIA.md](MEDIA.md); they are excluded from the compilation notice.

The JSON is the curated source of truth, with stable specimen ids, node citations and explicit overrides above. Revision history records future corrections. There is no live scrape at runtime and no external source fetch required to render the dataset. To check structure and the viewer from the repository root:

```sh
python3 tools/validate.py --catalog data/catalog.json
python3 -m unittest discover -s tools -v
npm run test:browser
```

These checks establish format and rendering behavior, not scientific validation. Next data work: specialist review of taxonomy and chronology, site-level coordinate sources, additional coverage, and a separately specified ancestry-hypothesis model with evidence attached to every proposed relationship.
