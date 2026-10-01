# The Graph

Working repository for the **Phylograph** (the Graph): a faux-4D representation of evolutionary history. It does for four dimensions what Renaissance perspective did for three, displaying 4D in 3D isomorphically by converging all of time on a vanishing point. Its companion instrument, the **Ontograph**, maps the nested levels of energy, matter, life, mind and "I" through which the Phylograph is navigated.

This repo holds the buildable parts: prototypes, datasets, specs and the public site. The notebook scans, transcriptions and the Twigzistence reader live in the private companion repo, `TheGraph-archive`.

## Layout

| Path | What lives there |
|---|---|
| `site/` | The public front page (twigzistence.shunryugarvey.com). |
| `prototypes/<name>/` | One folder per roadmap project, each with its own `index.html` and `README.md`. Each is published at `/<name>/`. |
| `data/` | Datasets the prototypes read (lineages, geocoded timesteps, extracts), with their sources. |
| `docs/` | The roadmap, the notebook intake log, conventions, and specs for the design document. |
| `.github/workflows/` | Builds `site/` plus every prototype into one GitHub Pages site. |

## Prototypes

| # | Project | Status |
|---|---|---|
| 1 | [Lineland](prototypes/lineland/): ring-history toy | First version |
| 2 | [Genealogical diamond](prototypes/genealogical-diamond/): pedigree collapse and the common ancestor of all, with a partner mode | First version |
| 5 | [Ontograph plates](prototypes/ontograph-plates/): eight plates for the Ontograph in the Illustration Brief style, with prompts | First version |
| 7 | [Life on the Stratasphere](prototypes/life-sphere/): Conway's Life on a sphere, its history nested as shells | First version |
| 8 | [IAS machine family](data/ias-machine-lineage/): 23 machines, 1946–1960, placed and dated with sources | First version |
| 11 | [Stratasphere viewer](prototypes/stratasphere-viewer/): IAS computers, printing, Unix, SARS-CoV-2, hominin fossils and x86 design families as nested shells | M5 released; fossil and x86 pilots prepared |

The full ranked list is in [`docs/roadmap.md`](docs/roadmap.md). The viewer's milestones and outstanding source/platform checks are in [`docs/stratasphere-viewer-roadmap.md`](docs/stratasphere-viewer-roadmap.md).

## Run locally

The site has no build step. Use Python 3 to serve the repository over HTTP so the viewer can fetch all six datasets:

```sh
git clone https://github.com/shunryu999/TheGraph.git
cd TheGraph
python3 -m http.server 8000
```

Open `http://localhost:8000/prototypes/stratasphere-viewer/`. On a first visit, a four-stop tour introduces IAS → printing → Unix → SARS-CoV-2. Skip it to explore freely, or reopen it from the header. A shared `?d=…&pick=…&t=…` view takes precedence over the tour.

The **Hominin fossil finds** entry adds 32 sourced occurrences across 7 Ma–40 ka. Open `?d=hominins&pick=knm-wt-15000` or choose it in the dataset picker. Its links compare museum taxonomic groupings; they do not assert individual ancestry. Its fossil panel follows the selection with a thin-line drawing, source-photo mode and zoom; 29 records have images and three have explicit unavailable states. Read its [sources and limits](data/hominin-fossils/SOURCE.md) and [image credits](data/hominin-fossils/MEDIA.md). The introductory tour retains its original four stops.

The **x86 design families** pilot adds 11 milestones and eight documented connections. Open `?d=x86&pick=alder-lake` for hybrid composition, or `?d=x86&pick=core` for feature transfer. Branch colors distinguish architectural families, with manufacturer and monochrome alternatives. Every selection gives its qualified design-location evidence. See the [placement audit and research inventory](data/x86-design-pilot/SOURCE.md).

The renderer loads pinned libraries from CDNs. An embedded IAS dataset is available if catalog access fails, but a fresh offline browser still needs those libraries; this is not yet a complete offline bundle.

## Check a change

Data checks need only Python 3:

```sh
python3 -m unittest discover -s tools -v
python3 tools/validate.py --catalog data/catalog.json
```

Browser checks additionally need Node.js 22 or later. These development dependencies do not add a build step or runtime dependency to the site:

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

On Linux, use `npx playwright install --with-deps chromium` to install browser system libraries as well. The test runner starts and stops its own local server on port 8765. Tests load every catalog entry, check errors, rendered pixels, labels, selections and shared links, and exercise the tour and local CSV example. The test browser receives the production three.js r128 scripts from the pinned npm package, so CDN outages do not make CI fail. External fonts are omitted in tests. Failure screenshots and traces are saved under `test-results/` and uploaded by GitHub Actions.

## Add a dataset

Start with the [v1 format and worked spreadsheet example](docs/data-format.md#worked-example-two-spreadsheets-to-one-lineage). Read the [data design specification](docs/stratasphere-data-design.md) for the representation's scope and limitations. A proposed dataset needs sources, a licence, explicit inference and a bounded claim, as well as valid JSON. Add it to `data/catalog.json`, run both sets of checks, and open a pull request for review.

The printing source verification, Unix source expansion, Safari export and real-GPU performance checks remain open. Structural validation and browser checks do not certify the underlying evidence.

## Publishing

The public site is [twigzistence.shunryugarvey.com](https://twigzistence.shunryugarvey.com). GitHub Pages publishes `site/`, every prototype and `data/` on pushes to `main`. Propose changes in a pull request with passing checks; the owner reviews and merges. A merge to `main` publishes the change.

## Conventions

Visual and data conventions are in [`docs/conventions.md`](docs/conventions.md).
