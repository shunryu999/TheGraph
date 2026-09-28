# Handoff: the Phylograph

*Written 28 Sept 2026 for a coder taking over. It covers the state of this repository at `main` after [#5](https://github.com/shunryu999/TheGraph/pull/5). The project owner is Colin Shunryu Garvey. Design and content decisions are his; this document says which are settled and which are still open.*

## 1. What this is, in one paragraph

The **Phylograph** (the Graph) draws history the way Renaissance perspective draws depth. Every moment is a sphere (the Earth at that time), and the spheres are nested: the present is the outermost, and the past sinks inward toward a vanishing point at the centre. A lineage becomes a set of lines running outward through the shells from where each thing began. "The inner shells are not smaller. They are farther." Its companion, the **Ontograph**, maps the nested levels of energy, matter, life and mind. This repo holds the buildable parts: browser prototypes, datasets, the tools that check them, and the public site. The main piece of work is the **Stratasphere viewer**, which draws any dated, geolocated lineage in this form.

## 2. Where everything lives

| What | Where | Access |
|---|---|---|
| Code, datasets, docs | this repo, `shunryu999/TheGraph` (**public**) | GitHub |
| Live site | twigzistence.shunryugarvey.com, built from `main` by GitHub Pages | public |
| Notebook scans, transcriptions, the Reader | the private repo `TheGraph-archive` | ask the owner |
| Working notes: roadmap with statuses, the Lexicon (121 terms), the Figure Register (183 drawings), the Illustration Brief, essay drafts | the owner's Notion workspace, page **PHYLOGRAPH** | ask the owner |

The repo is public. Anything not meant for the public, such as essay drafts awaiting approval, the diary material in the Gleanings, or notebook scans, belongs in Notion or the archive repo, never here.

## 3. Quick start

No build step and no package manager. You need Python 3 and a browser.

```sh
git clone https://github.com/shunryu999/TheGraph && cd TheGraph
python3 -m unittest discover -s tools              # validator tests (12)
python3 tools/validate.py --catalog data/catalog.json   # every dataset
python3 -m http.server 8000                         # then open:
#   http://localhost:8000/prototypes/stratasphere-viewer/
#   http://localhost:8000/site/
```

Serve over HTTP rather than opening files directly. The viewer fetches `data/catalog.json` and the datasets; from `file://` it falls back to the one embedded dataset. In a checkout it looks for data at `../../data/`, and on the site at `../data/`.

To see exactly what Pages publishes, run the "Assemble site" step of `.github/workflows/pages.yml` by hand. It copies `site/` to `_site/`, each `prototypes/<name>/` to `_site/<name>/`, and `data/` to `_site/data/`.

## 4. Repository map

| Path | What it is |
|---|---|
| `site/index.html` | The front page. It lists the prototypes by roadmap number. |
| `prototypes/lineland/` | #1. A 1D automaton on nested rings: the method at its smallest. One file, canvas 2D. |
| `prototypes/genealogical-diamond/` | #2. Pedigree collapse; common-ancestor and identical-ancestors points, checked against Chang's theory; partner mode. |
| `prototypes/ontograph-plates/` | #5. Eight SVG plates of the Ontograph in the Illustration Brief style. **`build.py` generates the SVGs, `index.html` and `PLATES.md`; edit it, not its outputs.** |
| `prototypes/life-sphere/` | #7. Conway's Life on a cube-sphere with history as shells. three.js; the viewer's shader ancestor. |
| `prototypes/stratasphere-viewer/` | #11. **The main work.** One file, `index.html`. See §6. |
| `data/catalog.json` | The datasets the viewer offers. |
| `data/<name>/` | One dataset: `<name>.json`, a `SOURCE.md`, and a `build.py` where it is generated. |
| `data/places/cities.json` | 1,712 GeoNames places of 250,000+ people, for the viewer's place finder. |
| `tools/validate.py`, `tools/test_validate.py` | Checks a dataset or the whole catalog against the format; its tests. Python 3 only. |
| `docs/roadmap.md` | The 23 projects, ranked. |
| `docs/stratasphere-viewer-roadmap.md` | The viewer's milestones M0–M5, with status per milestone and the settled decisions. |
| `docs/data-format.md` | **The lineage data format, v1.** The contract between datasets and the viewer. |
| `docs/conventions.md` | Visual tokens (colours, type) and the commit-message convention. |
| `docs/notebook-intake-log.md` | Which notebooks have been scanned and processed. |
| `.github/workflows/check.yml` | CI on every PR: validator tests, then the catalog. |
| `.github/workflows/pages.yml` | On push to `main`: validate, assemble `_site/`, deploy to Pages. |

## 5. Status of the whole project

From `docs/roadmap.md`. The Notion copy of the roadmap has a dated status line under each finished project.

| # | Project | State | Where |
|---|---|---|---|
| 1 | Lineland | first version | `prototypes/lineland/` |
| 2 | Genealogical diamond | first version | `prototypes/genealogical-diamond/` |
| 3 | Lexicon with first-attestation dates | first version (121 terms) | Notion + archive repo |
| 4 | Figure register of the notebook drawings | first version (183 records) | Notion + archive repo |
| 5 | Ontograph plates | first version (8 plates) | `prototypes/ontograph-plates/` |
| 6 | Essays from the notebooks | 4 drafts, **awaiting the owner's approval** | Notion only (not public) |
| 7 | Life on the Stratasphere | first version | `prototypes/life-sphere/` |
| 8 | IAS machine family | first version (23 machines) | `data/ias-machine-lineage/` |
| 9 | Dimensional reduction chart | not started (set aside by the owner) | — |
| 10 | Twelve links on the Ontograph | not started | — |
| **11** | **Stratasphere viewer** | **M0–M4 done; M5 next. Current priority.** | `prototypes/stratasphere-viewer/` |
| 12 | Ontograph navigator (three panes) | not started; builds on #11 permalinks | — |
| 13 | Data blooms (fork networks etc.) | not started; a catalog entry once found | — |
| 14–23 | cultural layer spec, *Paradise Lost* editions, satellite shells, fossil nebula, animation, illustrated Recapitulation, paper, full phylograph, ancient DNA, memoir | not started | see roadmap |

## 6. The Stratasphere viewer

**Live:** `/stratasphere-viewer/`. **Code:** `prototypes/stratasphere-viewer/index.html`, about 1,050 lines. The file holds the CSS, the HTML, one inline script, and two JSON blocks: `data-default` (the IAS dataset, an offline fallback, kept identical to `data/ias-machine-lineage/ias-machine-lineage.json`) and `data-land` (Natural Earth 110 m coastlines, 84 rings). **Dependencies:** three.js r128 from cdnjs and OrbitControls from jsDelivr, both pinned. There is no bundler.

### How it draws

- **Radius comes from time on the GPU.** Every vertex carries a direction (`dir`), a time (`gen`) and a class (`cls`). The vertex shader turns `gen` into a radius using `tNow`, `tStart` and the density gradient `grad`: `f = (1 − e^(−k·age)) / (1 − e^(−k))`, `r = R(1 − f)·0.94 + 0.06R`. So moving the time slider or the gradient costs nothing on the CPU. The JS twin is `radiusAt(t)`; keep the two in step.
- **Vertices in the future are hidden** (`gen > tNow`).
- **`cls` decides the look** in the fragment shader:

  | cls | Meaning | Look |
  |---|---|---|
  | 0 | land | faint, fading inward |
  | 1 | record | ink |
  | 2 | in the picked lineage, or the reader's line | vermilion |
  | 3 | inference, or a line that has ended | grey |
  | 4 / 5 | first detected here (a point) / the same, picked | open ring, ink / vermilion |
  | 6 | influence, with no code or material passed on | faint ink |

- **Time.** All dates become decimal years inside the viewer (`toNum`); years BP become negative. `fmtT` formats a date for display and `rawT` writes one back in the file's own notation for permalinks.
- **Geometry is rebuilt on selection** (`buildGraph`: worldlines with 4 segments, links with segments in proportion to their arc). The land is rebuilt on dataset change (10 redrawn shells).
- **Names** are HTML over the canvas (`placeLabels`, every frame). Each sits where its node began. Overlaps are resolved with a grid of screen cells in priority order: the picked lineage, then out-degree, then age. **There is no raycast picking on the canvas:** nodes are picked by clicking a name or a list entry.
- **Framing** (`frame0`) gives a three-quarter view of the data's own region. Datasets spanning less than about 70° are orbited from the middle of their cone, and auto-turn is switched off.
- **Hatched inference** (`buildHatches`, `placeHatches`) is a sphere mesh whose fragment shader draws screen-space 45° lines. It discards fragments inside the inner shell's outline, so what's left is a band between the two shells.

### Main functions, in the order they run

`openCatalog` → `openDataset` → `load` (checks and normalises units, builds lookups, calls `frame0`, `buildHatches`, `buildLand`, `buildLabels`, `list`, then `pick`) → each animation `frame`: `turnStep` if recording, `placeHatches`, render, `placeLabels`, `composite` if recording. `pick(id)` sets the selection, rebuilds the graph, the card and the list, and writes the URL.

### State in the URL

`?d=<catalog id>&pick=<node id>&t=<date in the file's unit>`. The reader's place is deliberately **not** in the URL, not saved, and not sent anywhere; keep it that way.

### Settled design rules (from the owner and the Illustration Brief)

- **Vermilion** means only: the picked lineage, the reader's own line, the present shell. Never decoration.
- **Grey** means inference or a line that ended. **Record and inference are never drawn alike.**
- **No dashes.** The Brief reserves dashes for the Horizon glyph.
- **SARS-CoV-2:** say "first detected in", never "originated in", and never name a variant after a place.
- **The reader chooses where their vermilion line attaches** (a city, coordinates or browser location), not an entry in a dataset.
- **Datasets are published from `data/`**, with one copy each, read by any prototype.

### Adding a dataset

1. Write `data/<name>/<name>.json` in the v1 format (`docs/data-format.md`). The essentials:
   - `meta.title`; `meta.unit` (`year`, `month`, `day` or `yearBP`)
   - nodes with `id`, `label`, `lat`, `lng`, `t`, and optionally `tEnd`, `provenance` (`record`, `inferred`, `detected`) and `sources`
   - links with `from`, `to`, `kind`, and `inferred` where they are reconstructed
   - `meta.linkKinds` captions, which must read well after "From *parent*:"
2. Write `data/<name>/SOURCE.md`: the sources with retrieval dates, the licence, what is inference and why, and what was left out.
3. If the data is derived from other files, add a `build.py` that fetches them **at pinned commits** and rebuilds the JSON exactly (see `data/sars-cov-2-lineages/build.py`).
4. Add an entry to `data/catalog.json`: `id`, `path`, `title`, `span`, `blurb`, `why`.
5. Run `python3 tools/validate.py --catalog data/catalog.json`, then open the viewer with `?d=<id>` and look at it.

## 7. The datasets and what each still owes

| Dataset | Size | Sources | Still owed |
|---|---|---|---|
| IAS machine family, 1946–60 | 23 nodes / 22 links | Wikipedia lists and machine articles (see its SOURCE.md) | — |
| Spread of printing, 1454–1500 | 57 / 56 | Standard references plus web-search cross-checks | **A line-by-line check against the ISTC (data.cerl.org).** 43 of 56 links are inferred placeholders ("nearest earlier press on a plausible route"), and per-node citations are missing. This was blocked because the build environment could not reach ISTC, Wikipedia or Wikisource. 1454–1460 is declared as an inferred span. |
| SARS-CoV-2 lineages, 2019–26 | 60 / 65 | Nextstrain `ncov` and Pango `pango-designation`, pinned; WHO reclassification dates | Reproducible with `build.py`. To refresh, bump the two pinned SHAs and rerun. 25 of 60 places are inferred because the Pango notes name no place. |
| Unix family, 1970–2026 | 27 / 35 | Spinellis's Unix History Repository for the backbone; per-node sources for the rest | A pass against Éric Lévénez's chart (blocked from the build environment), which would add HP-UX, IRIX, Ultrix, Tru64 and the Linux distributions. |

Licensing: **everything here is all rights reserved until launch** ([`LICENSE`](../LICENSE)), including the datasets as compiled. Third-party material keeps its own terms and is listed in `LICENSE`: the GeoNames city list (CC BY 4.0), Natural Earth coastlines (public domain), and the facts drawn from Nextstrain (MIT), Pango (CC BY 4.0) and the Unix History Repository (Apache 2.0). New datasets set `meta.licence` to `All rights reserved (compilation); see LICENSE`.

## 8. What to do next

### M5: the MVP release (`docs/stratasphere-viewer-roadmap.md`)
- A short guided tour on first open: IAS → printing → Unix → SARS-CoV-2, one sentence each.
- A worked example in `docs/data-format.md`: converting a spreadsheet (CSV) into the format.
- **An automated browser smoke test.** Headless Chromium loads every catalog entry and fails on page errors, a blank canvas or missing labels. Wire it into `check.yml`. The CDNs may be blocked in CI sandboxes; route three.js from the `three@0.128.0` npm package, which is how it was tested during development.
- The data-spec section of the design document, written from `data-format.md`.

### Verification only a person with a real machine can do
- **Frame rate on a real GPU.** The target is 2,000 nodes at 60 fps. In the build sandbox (software rendering), a synthetic 2,000-node set ran at 11 fps and IAS at 27, and label work was under 3% of frame time.
- **Safari export.** *Save image* and *Record a turn* were tested only in Chromium. The clip records MP4 when the browser offers it, which should be Safari's path.

### Known issues and debts, most important first
1. **The printing data needs the ISTC check** described in §7.
2. **three.js r128 is from 2021.** `examples/js/` (OrbitControls as a global) was removed in r148, so upgrading means moving to ES modules and an import map. It works as is; do this only with a reason.
3. **The viewer is one 88 KB file** with embedded coastlines and IAS data. Splitting out the JS and the land data would make review easier. If you split it, keep the offline fallback and the no-build-step property.
4. **No canvas picking.** Clicking a point or line on the globe does nothing; picking is by name or list. A raycast against the points would help dense datasets.
5. **The hatch draws over everything** (`depthTest:false`) inside its band. It's intended to read as an overlay, but a dataset with many nodes inside an inferred span may want it drawn behind.
6. **Names can flicker in recorded clips.** `composite` draws the names into the PNG and into every clip frame, but as the view turns, overlap culling can show and hide a name from one frame to the next. Check a clip before using it in a talk.
7. **The validator doesn't check catalog prose** (`blurb`, `why`) or that `linkKinds` captions read well after "From *parent*:". Those need eyes, not code.

### Open decisions for the owner (don't settle these yourself)
- **Ontograph plates:** each pinch point is drawn as a Horizon, so plate O-IV has two Horizons, making the Ontograph read as Plate X folded into loops. Proposed in [#1](https://github.com/shunryu999/TheGraph/pull/1), not yet confirmed.
- **Essays (#6):** four drafts in Notion await approval. They are not in the repo because it is public.
- **Lexicon (Notion):** several terms appear twice (created about 15 minutes apart on 23 Sept). The owner hasn't yet decided whether to deduplicate.
- **Next roadmap project after the viewer MVP:** #9 (the dimensional-reduction chart) was set aside by the owner; hominin fossils are the viewer's next dataset after M5.

## 9. Working agreements

- **Pull requests.** One per milestone or project, merged by the owner. CI (`Check`) must be green. `main` deploys automatically, so what merges is live within a minute.
- **Commit messages.** `<Verb> <what> (roadmap #n)`, for example `Add the Unix family, 1970-2026, to the viewer (viewer M3, roadmap #11)`. Explain the why in the body.
- **Data honesty over completeness.** A dataset states what is record and what is inference, in the file and in its SOURCE.md, and never claims an origin or a date its sources do not support. Where a source could not be reached, say so and list it as owed.
- **Generated files.** Edit the generator, not its outputs: `prototypes/ontograph-plates/build.py`, `data/sars-cov-2-lineages/build.py`.
- **Visual system.** `docs/conventions.md` (tokens), plus the Illustration Brief in Notion for the plates: three line weights, one accent, no gradients, no glow, nothing drawn inside a Horizon.
- **Writing.** Plain, exact English in the Brief's register. Captions and notes are part of the work and are reviewed like code.
- **Rights.** The work is unpublished and all rights reserved (see `LICENSE`). Don't copy it into other projects, public gists or forks, don't paste it into third-party services beyond what the work needs, and keep new concepts out of this public repo until the owner decides to publish them. `site/robots.txt` asks crawlers to stay away until launch; remove it only when the owner says so.

## 10. First hour, suggested

1. Read §1, §6 and `docs/data-format.md`.
2. Run the quick start (§3), and open each of the four datasets in the viewer.
3. Try these links:
   - `?d=unix&pick=linux`, then switch off *Follow influence links*
   - `?d=sars-cov-2&pick=20I&t=2021-06`
   - `?d=printing&t=1470`, which shows the hatched band
4. Pick up M5 from §8, starting with the smoke test. Every later change will lean on it.
