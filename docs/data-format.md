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
| `linkKinds` | no | A caption for each `kind` of link used, e.g. `{"copy": "a design copied"}`. The viewer builds its key from these. |
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
| `place` | no | The place in words, shown on the card. |
| `note` | no | A sentence or two shown on the card. |
| `kind` | no | A free category, captioned in `meta.kinds`. |
| `provenance` | no | How the node's place and date are known (see below). Defaults to `record`. |
| `inferred` | no | Shorthand kept from the draft: `true` means `"provenance": "inferred"`. |
| `sources` | no | Citations for this node alone. |

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

`id` is what permalinks use (`?d=ias`). `path` is relative to `data/`. The rest is shown in the picker.

## Permalinks

The viewer keeps its state in the address bar: `?d=<dataset>&pick=<node id>&t=<date>`. The date is in the dataset's own unit. A link like that reopens the same dataset, lineage and moment.

## Each dataset folder

`data/<name>/` holds `<name>.json` and a `SOURCE.md` giving the sources with retrieval dates, the licence, and the choices a reader should know about: what was left out, what is inference, how places and dates were settled.
