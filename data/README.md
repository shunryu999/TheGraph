# Data

Datasets used by the prototypes, in the v1 format described in [`docs/data-format.md`](../docs/data-format.md). Each gets its own folder with a `SOURCE.md` giving provenance, licence and date retrieved.

[`catalog.json`](catalog.json) lists the datasets the Stratasphere viewer offers. The whole folder is published with the site at `/data/`, so any prototype can fetch from it. Before adding a dataset to the catalog, check it:

```
python3 tools/validate.py --catalog data/catalog.json
```

CI runs the same check on every pull request.

- [`ias-machine-lineage/`](ias-machine-lineage/) (#8): the IAS machine family, 1946–1960. Read by the stratasphere viewer (#11).
- [`printing-1450-1500/`](printing-1450-1500/) (viewer M1): the spread of printing, 1454–1500, 57 towns.

Planned for the viewer roadmap: `sars-cov-2-lineages/`, `unix-family/`. Later: `paradise-lost-editions/` (#15), `pbdb-extract/` (#17).
