# The Graph

Working repository for the **Phylograph** (the Graph): a faux-4D representation of evolutionary history. It does for four dimensions what Renaissance perspective did for three, displaying 4D in 3D isomorphically by converging all of time on a vanishing point. Its companion instrument, the **Ontograph**, maps the nested levels of energy, matter, life, mind and "I" through which the Phylograph is navigated.

This repo holds the buildable parts: prototypes, datasets, specs and the public site. The notebook scans, transcriptions and the Twigzistence reader live in the private companion repo, `TheGraph-archive`.

## Layout

| Path | What lives there |
|---|---|
| `site/` | The public front page (thegraph.shunryugarvey.com). |
| `prototypes/<name>/` | One folder per roadmap project, each with its own `index.html` and `README.md`. Each is published at `/<name>/`. |
| `data/` | Datasets the prototypes read (lineages, geocoded timesteps, extracts), with their sources. |
| `docs/` | The roadmap, the notebook intake log, conventions, and specs for the design document. |
| `.github/workflows/` | Builds `site/` plus every prototype into one GitHub Pages site. |

## Prototypes

| # | Project | Status |
|---|---|---|
| 1 | [Lineland](prototypes/lineland/): ring-history toy | First version |
| 2 | [Genealogical diamond](prototypes/genealogical-diamond/): pedigree collapse and the common ancestor of all, with a partner mode | First version |
| 7 | [Life on the Stratasphere](prototypes/life-sphere/): Conway's Life on a sphere, its history nested as shells | First version |
| 8 | [IAS machine family](data/ias-machine-lineage/): 23 machines, 1946–1960, placed and dated with sources | First version |
| 11 | [Stratasphere viewer](prototypes/stratasphere-viewer/): any dated, geolocated lineage as nested shells | First version |

The full ranked list is in [`docs/roadmap.md`](docs/roadmap.md).

## Publishing

Nothing is public until Pages is switched on (Settings → Pages → Source: *GitHub Actions*) and the repo or site is made public. Drafts are reviewed before anything goes live.

## Conventions

Visual and data conventions are in [`docs/conventions.md`](docs/conventions.md).
