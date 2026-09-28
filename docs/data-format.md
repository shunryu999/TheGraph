# Lineage data format, v1

The format every stratasphere dataset is written in: the IAS machine family, the case studies of the viewer roadmap (#11), and anything a collaborator wants to load. One JSON file per dataset holds a lineage: things placed where and when they happened, and the links saying what came from what.

v1 replaces the draft in [`conventions.md`](conventions.md). Files written for the draft (the IAS family as first published) are valid v1 files.

Check a file with:

```
python3 tools/validate.py data/<name>/<name>.json
python3 tools/validate.py --catalog data/catalog.json     # every dataset in the catalog
```

## The file

```json
{
  "format": 1,
  "meta":  { "title": "…", "unit": "year", … },
  "nodes": [ { "id": "…", "label": "…", "lat": 0, "lng": 0, "t": 1946 }, … ],
  "links": [ { "from": "…", "to": "…" }, … ]
}
```

`format` is optional; if it is absent the file is read as v1.

## `meta`

| Field | Required | Meaning |
|---|---|---|
| `title` | yes | The dataset's name, as shown in the viewer and the catalog. |
| `unit` | no | How `t` is written: `year` (the default), `month`, `day` or `yearBP`. See *Time*. |
| `tStart`, `tEnd` | no | The span the viewer shows, in the same unit as `t`. They default to the earliest and latest dates in the file. `tEnd` is the present shell. |
| `description` | no | One or two sentences for the viewer's header. |
| `sources` | no | A list of citations for the dataset as a whole. |
| `caveats` | no | What a careful reader should know: rounding, choices, omissions. |
| `defaultPick` | no | The id of the node selected when the dataset opens. |
| `defaultGradient` | no | Initial density gradient, a finite number from 0 to 5. Defaults to 1; reset on each dataset load and rounded to the control's 0.1 increment. |
| `relationshipMode` | no | `lineage` (default) or `comparison`. Comparison mode describes connected records without calling them ancestors or descendants. The data's notes must explain the evidence for each comparison. |
| `linkKinds` | no | A caption for each `kind` of link used, e.g. `{"copy": "a design copied"}`. The viewer builds its key from these, and the card shows each parent as "From *parent*: *caption*", so write captions that read well after that. |
| `kinds` | no | A caption for each `kind` of node used, e.g. `{"translation": "a translation"}`. |
| `inferredSpans` | no | Stretches of time that are reconstructed rather than recorded, as `[[t0, t1], …]`. The viewer hatches these shells (M4). |
| `licence` | no | The licence the compilation is released under. |

## `nodes`

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Unique within the file. Short, lower case and stable, because permalinks use it. |
| `label` | yes* | The name shown. If it is missing, the id is shown. |
| `lat`, `lng` | yes | Decimal degrees, WGS 84. Latitude −90 to 90, longitude −180 to 180. |
| `t` | yes | When the thing began: first ran, first printed, first detected. See *Time*. |
| `tEnd` | no | When it ended: stopped running, was displaced, died out. The worldline stops there. If absent, the thing continues to the present. |
| `dateLabel` | no | Non-empty text displayed in the card instead of the formatted date or date range, e.g. `286 ± 32 ka`. It qualifies the numeric plotting date; it does not change chronology or draw uncertainty bounds. Use the note to explain how `t` was chosen. |
| `place` | no | The place in words, shown on the card. |
| `note` | no | A sentence or two shown on the card. |
| `kind` | no | A free category, captioned in `meta.kinds`. |
| `provenance` | no | How the node's place and date are known (see below). Defaults to `record`. |
| `inferred` | no | Shorthand kept from the draft: `true` means `"provenance": "inferred"`. |
| `sources` | no | Citations for this node alone. |

For an occurrence with no claimed duration, set `tEnd` equal to `t`: the viewer draws one point and no worldline. Do not use a dating uncertainty interval as a lifespan. A fossil may be physically documented while its date or placement is inferred; explain this distinction in its note. The [hominin sample](../data/hominin-fossils/SOURCE.md) demonstrates ranges, approximate dates and a one-sided age constraint. URL-only citation strings become clickable HTTP(S) links; other citation text remains plain text.

### Provenance

| Value | Means | Drawn as |
|---|---|---|
| `record` | The place and date are documented. | ink |
| `inferred` | The node, or its place or date, is reconstructed. | grey, italic label |
| `detected` | The place and date are where and when it was *first detected*, which may not be where or when it arose. | an open ring, and the card says "first detected" |

A dataset never claims an origin its sources do not support. Use `detected` when the record is of detection (a virus lineage, a manuscript that surfaced in a collection), and say so in `caveats`.

## `links`

| Field | Required | Meaning |
|---|---|---|
| `from` | yes | The parent's id. |
| `to` | yes | The child's id. |
| `kind` | no | What passed from parent to child (see below). Defaults to `descent`. |
| `inferred` | no | `true` if the link itself is reconstructed. |
| `note` | no | A sentence for the card. |

A node may have several parents: write one link for each. Links must not form a cycle. A child should not begin before its parent; the validator warns if one does, because it usually means a date is wrong.

### Kinds of link

| Kind | Means | Example |
|---|---|---|
| `descent` | Biological or genealogical descent. The default. | a variant from its parent lineage |
| `copy` | A design or technique copied. | ORDVAC from the IAS reports |
| `training` | A person trained in the parent's workshop carried the method on. | a printer from the shop he learned in |
| `code` | Source code carried over. | FreeBSD from 386BSD |
| `influence` | A design shaped the child without anything being copied. | Linux from Minix |
| `merge` | One of several parents that combined. | Darwin from NeXTSTEP and BSD |

Other kinds are allowed if they are captioned in `meta.linkKinds`.

In a `comparison` dataset, `from` and `to` orient a comparison for acyclic tracing, not parenthood. The hominin case study uses a captioned `comparison` kind for editorial links between museum taxonomic assignments, all marked `inferred`. Source classification does not establish individual ancestry, a migration route or temporal precedence when age estimates overlap.

## Time

The unit is set once for the whole file in `meta.unit`.

| Unit | How `t` is written | Example |
|---|---|---|
| `year` | a number | `1946`, or `-500` for 501 BCE |
| `month` | an ISO string `YYYY-MM` | `"2021-03"` |
| `day` | an ISO string `YYYY-MM-DD` | `"2021-03-15"` |
| `yearBP` | a number of years before present (present = 1950, as in radiocarbon dating) | `3200000` |

The viewer converts every date to a decimal year before drawing, so months and days sit at their true fraction of the year. For `yearBP`, larger numbers are older: `tStart` is the larger number and `tEnd` the smaller.

## The catalog

[`data/catalog.json`](../data/catalog.json) lists the datasets the viewer offers:

```json
{ "format": 1,
  "datasets": [
    { "id": "ias", "path": "ias-machine-lineage/ias-machine-lineage.json",
      "title": "The IAS machine family, 1946–1960", "blurb": "…" } ] }
```

`id` is what permalinks use (`?d=ias`). `path` is relative to `data/`. `title`, `span` and `blurb` are shown in the picker, and `why` (a short paragraph on why the dataset is in the Graph) fills the viewer's "Why this dataset" note.

## Permalinks

The viewer keeps its state in the address bar: `?d=<dataset>&pick=<node id>&t=<date>`. The date is in the dataset's own unit. A link like that reopens the same dataset, lineage and moment.

## Each dataset folder

`data/<name>/` holds `<name>.json` and a `SOURCE.md` giving the sources with retrieval dates, the licence, and the choices a reader should know about: what was left out, what is inference, how places and dates were settled.

## Worked example: two spreadsheets to one lineage

The [CSV example](examples/csv-to-lineage/) contains three **fictional** workshops. It teaches the format without making a historical claim. It is deliberately outside the public dataset catalog.

1. Open [`nodes.csv`](examples/csv-to-lineage/nodes.csv) in a spreadsheet. Keep one row per thing, and a stable, unique `id` per row. `lat`, `lng` and `t` are numbers; an empty `tEnd` means the worldline continues to the dataset's present shell. The `source` column holds one citation for this small example.
2. Open [`links.csv`](examples/csv-to-lineage/links.csv). Each row joins a parent `from` id to a child `to` id. Write `true` or `false` in `inferred`; a string containing “false” must not accidentally become a true Boolean. Several rows may have the same `to` id when a thing has several parents.
3. Export both sheets as UTF-8 CSV, retaining their header names and filenames. Keep them beside [`convert.py`](examples/csv-to-lineage/convert.py).
4. From the repository root, run:

```sh
python3 docs/examples/csv-to-lineage/convert.py > /tmp/workshop-lineage.json
python3 tools/validate.py /tmp/workshop-lineage.json
python3 -m http.server 8000
```

Open `http://localhost:8000/prototypes/stratasphere-viewer/` and choose the generated file under **Load another dataset**. The card initially selects Hill workshop, whose worldline ends in 1930. Clear the selection to see the inferred River workshop and its incoming link in grey.

The converter writes `format`, `meta`, `nodes` and `links`, turns coordinates and years into JSON numbers, omits blank ending dates, and wraps each source as a citation list. For example, the second link becomes:

```json
{"from":"hill","to":"river","kind":"copy","inferred":true,"note":"A possible route within the fictional example."}
```

This converter is intentionally for `year` data. For months or days, preserve the ISO strings and change `meta.unit`; for years before present, use numeric ages with the older bound in `tStart`. Update the metadata, span, default pick and captions for your actual dataset. Run the validator after every conversion. Validation checks structure and consistency; a person still needs to verify the evidence, provenance and licence.

To propose a real catalog entry, place the reviewed JSON and a `SOURCE.md` in `data/<name>/`, then add its relative path and descriptive text to `data/catalog.json`. Validate the whole catalog and run the browser checks before opening a pull request. A file loaded locally stays in the browser; it is not uploaded or added to the catalog.
