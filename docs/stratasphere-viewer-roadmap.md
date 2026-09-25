# Stratasphere Viewer: roadmap to MVP (roadmap #11)

*Drafted 25 Sept 2026. For now this takes priority over the other projects in [`roadmap.md`](roadmap.md).*

The viewer's first version ([`prototypes/stratasphere-viewer/`](../prototypes/stratasphere-viewer/)) draws one small lineage, the IAS machine family: 23 nodes over 14 years. The MVP is the version that can carry several real case studies side by side and be shown in a talk, cited in the faux-4D paper (#20), and handed a new dataset without code changes.

The build is paced by three approved case studies. Each one is chosen to force open one limit of the current viewer, so the datasets and the features arrive together:

| Order | Case study | Span | Nodes | Forces the viewer to add |
|---|---|---|---|---|
| 1 | **The spread of printing** | 1450–1500 | ~60–120 | a dataset catalog; labels and picking that hold up in dense clusters |
| 2 | **SARS-CoV-2 variants** | Dec 2019–2024 | ~40–60 | time in months; lineages that end; "first detected" as a kind of place |
| 3 | **The Unix family** | 1969–today | ~40–70 | kinds of link; several parents per node |
| next | Hominin fossils | 7 Ma–40 ka | ~30–40 | deep time in years before present; an inference-heavy lineage |
| later | *Paradise Lost* editions | 1667–today | ~40–60 | stays with #15, after #9 |

## What the current viewer assumes

These are the limits the case studies run into. Each is fixed in the milestone that first needs it.

1. **Every worldline runs to the present.** A node's line is drawn from its date to `tEnd`, so nothing can die out. Extinct lineages (Alpha, Delta), presses that closed, and discontinued systems all need an end date.
2. **Time is whole years.** The slider steps by 1 and every label is a rounded year. Variants need months; hominins need millions of years before present.
3. **One parent, one kind of link.** The card follows only the first parent and describes every child as "copied by". Unix needs code descent, influence and merges, drawn differently.
4. **One kind of uncertainty.** A single `inferred` flag. SARS-CoV-2 needs to say "first detected here", which is not the same as "inferred" or "originated here".
5. **One embedded dataset.** The IAS data is inlined in the page, and the Pages workflow publishes only `site/` and `prototypes/*`, so nothing in `data/` reaches the site. The opening pick (`illiac`) is hard-coded.
6. **Every name is a label.** The overlap culling works for 23 nodes. It will hide most of a Rhineland cluster of 30 presses, with no way to reach them except the list.

## Milestones

Effort uses the roadmap's scale: **S** = a day or two, **M** = one to three weeks.

### M0 · Data format v1 and a catalog (S) — done 25 Sept 2026

The format in `conventions.md` is still a draft. Settle it as v1, backward compatible with the IAS file.

- **`docs/data-format.md`: the v1 spec.**
  - `meta.unit` is one of `year`, `month`, `day` or `yearBP`. `t` stays a number; months and days are written as ISO strings and converted to fractional years on load.
  - `node.tEnd` is optional; the worldline stops there. Absent means "continues to the present".
  - `node.kind` is optional and free, with a style declared in `meta.kinds`.
  - `node.provenance` is `record`, `inferred` or `detected`. `inferred: true` still works.
  - Links may share a `to` (several parents). `link.kind` is one of `descent`, `copy`, `code`, `influence` or `merge`, and `meta.linkKinds` gives each one a caption for the key.
  - `node.sources` gives per-node citations.
- **`tools/validate.py`**: checks a dataset against the spec (ids unique, links resolve, no cycles, dates inside the span, coordinates in range) and prints a summary. It runs on every dataset in CI.
- **Datasets move out of the page.** They live in `data/<name>/<name>.json`, with a catalog `data/catalog.json` (title, span, node count, default pick). `pages.yml` copies `data/` into the site so the viewer can fetch `../data/…`. The IAS set stays embedded as the offline fallback.
- **A dataset picker and permalinks:** `?d=printing&pick=mainz&t=1470`.

*Done when:* the viewer loads IAS from the catalog, the picker lists it, a permalink restores the view, and `validate.py` passes on IAS in CI.

### M1 · The spread of printing, 1450–1500 (M) — first version 25 Sept 2026

*Status:* 57 towns and 56 links are in; 13 links are record and 43 are inference. A line-by-line check against the ISTC is still owed, because the ISTC, Wikipedia and Wikisource could not be reached from the build environment (see the dataset's `SOURCE.md`). Per-node citations will come with that check.


**Data.** `data/printing-1450-1500/`. One node per town's first press (place, year, first printer), with a link to the shop the printer trained in or came from. Where the training line is documented it is `record`; where it is only the nearest earlier press on the printer's route it is `inferred`.
- *Sources:* the Incunabula Short Title Catalogue (ISTC) for towns and first dated imprints, and standard printing histories for the printer lines.
- *Target:* the ~60 best-documented towns first, extended to ~120.
- *Scope:* printing only, not paper mills or type foundries.

**Viewer.**
- **Density-aware labels.** Rank labels by out-degree and age, so the hubs (Mainz, Strasbourg, Venice, Cologne) always show. Show more names as you zoom in, and hover to reveal a hidden one.
- **Region framing.** Open on the data's centroid rather than a fixed camera, so a Europe-only dataset is not viewed from the Pacific.
- **Generic text.** The card and key take their wording from `meta.linkKinds`, so no dataset says "Copied by" unless it means it.

*Done when:* all ~60 towns are reachable by clicking or the list at the default zoom. Tracing Mainz shows its whole descent. Every node has a source.

### M2 · SARS-CoV-2 variants, Dec 2019–2024 (M) — done 25 Sept 2026

*Status:* built as SARS-CoV-2 lineages, 2019–2026: all 60 Nextstrain clades (35 places recorded, 25 inferred), 65 links including 12 recombinant merges, and endings for Alpha, Beta, Gamma and Delta at their WHO reclassification. `build.py` rebuilds it from Nextstrain and Pango at pinned commits.


**Data.** `data/sars-cov-2-lineages/`. The major Pango lineages and WHO variants, with parent links from the Pango designation tree. Each is placed where and when it was first detected, and gets an end date where it was displaced (for example Alpha and Delta).
- *Sources:* Pango lineage designations and Nextstrain's public trees (CC-BY; attribution in `SOURCE.md`).
- *Target:* ~40–60 lineages, not the full tree of thousands.

**Viewer.**
- **Month units.** The slider steps by month and labels read "Mar 2021". Play speed is set per unit.
- **Endings.** A worldline stops at `tEnd` with a plain terminus (as in Plate XXIX), and an ended line is drawn grey outside the picked lineage. This is the convention's "lines that ended".
- **"Detected" provenance.** A distinct mark (an open ring) that means *seen here first*, not *born here*. The card says so in words.

*Done when:* scrubbing 2020→2024 shows Alpha, Beta, Gamma and Delta appear and end and Omicron take over. No node claims an origin the data does not support.

### M3 · The Unix family, 1969–today (S–M)

**Data.** `data/unix-family/`. Bell Labs Unix, the BSDs, System V, Minix, Linux, NeXTSTEP, macOS/iOS, Android, Solaris, the illumos line and others, each placed at the institution or company that made it.
- **Link kinds:** `code` (source descent), `influence` (design without code, e.g. Minix → Linux) and `merge` (e.g. NeXTSTEP + BSD → Darwin).
- *Sources:* Éric Lévénez's Unix history and each system's release history.

**Viewer.**
- **Links drawn by kind:** `code` and `descent` in solid ink, `influence` hairline grey, `merge` meeting from both parents. The key is generated from `meta.linkKinds`. No dashes; the Brief keeps those for Horizons.
- **Several parents.** The card reads "Descends from BSD and NeXTSTEP", and tracing can follow all kinds or record descent only.

*Done when:* macOS traces to both parents, Linux shows its influence from Minix without a code line, and the key matches what is drawn.

### M4 · The instrument's own conventions (M)

These are the parts of the original #11 spec still unbuilt. They land once the three datasets exist to test them on.

- **Hatched inference shells.** When a stretch of time is reconstructed rather than recorded (declared in `meta.inferredSpans`), its shells are drawn with the 45° hatch, grey, never as record.
- **The reader's worldline in vermilion.** The reader chooses a place (by typing a city, or by the browser's location with permission). A vermilion line runs from that point on the present shell back into the dataset to the nearest node, so the reader can see where they stand in relation to the lineage. This is the only use of vermilion other than the picked lineage.
- **Export.** A PNG of the current view at print resolution, and a short turntable clip for talks.
- **Accessibility and performance.** The list stays a full text equivalent of the figure, with keyboard navigation for scrubbing and picking. The target is 2,000 nodes at 60 fps on a mid-range laptop, which means a spatial index for picking and instanced points.

*Done when:* all three case studies use hatching where it applies, the reader's line can be placed, and an export works in Chromium and Safari.

### M5 · MVP release (S)

- The catalog opens on a short guided tour: IAS → printing → Unix → SARS-CoV-2, each with one sentence on what to look at.
- `README.md` and `docs/data-format.md` are final enough to hand to a collaborator, with a worked example of converting a spreadsheet into the format.
- There is a smoke test: headless Chromium loads every catalog entry and fails on errors, blank canvases or missing labels.
- The data-spec section for the design document (#11's second output) is written from `data-format.md`.

### After the MVP

- **Hominin fossils.** `yearBP` units with a strong default density gradient, labels like "1.8 Ma", and nearly all links marked `inferred`. It is the bridge to #17.
- ***Paradise Lost* editions (#15).** This comes after #9 supplies the psycho → phono → pheno staging; `node.kind` already carries it.
- **#12, the Ontograph navigator,** docks beside the viewer and uses the permalink state from M0.
- **#13 and #17** plug in as further catalog entries.

## Order and dependencies

```
M0 format + catalog ─┬─ M1 printing ─┐
                     ├─ M2 SARS-CoV-2 ├─ M4 conventions ── M5 release
                     └─ M3 Unix ──────┘
```

M1–M3 can overlap once M0 is in. Each is shipped as its own pull request with its dataset, its `SOURCE.md` and the viewer changes it needs.

## Decisions (settled 25 Sept 2026)

1. **Datasets are published from `data/`.** `pages.yml` copies `data/` into the site, so there is one copy of each dataset and any prototype can read it.
2. **The reader chooses where their vermilion line attaches.** It attaches to a place the reader picks (a typed city, or the browser's location with permission), so it works with every dataset.
3. **SARS-CoV-2 says "first detected in", never "originated in",** and variants are not named after places.
