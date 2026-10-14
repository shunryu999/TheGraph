# Dataset format

The visualization reads a graph from a browser-native JavaScript module or an imported JSON file. Each dataset is independent of its presentation. Adding a new case does not require changing the chart renderer.

`prototypes/dimensional-reduction/data.js` exports the bundled `DATASETS` array. `prototypes/dimensional-reduction/model.js` exports `validateDataset(value)`, which returns `{ valid: true, errors: [], data }` with a normalized copy, or `{ valid: false, errors }`. Only render `data` from a successful validation result. All text is plain text and must be inserted with `textContent`, never treated as HTML. Sources are outgoing links, not executable resources.

## Top-level fields

| Field | Value |
| --- | --- |
| `schemaVersion` | The number `1` |
| `id` | Unique dataset identifier |
| `title` | Display title, at most 160 characters |
| `subtitle` | Optional brief description, at most 300 characters |
| `kind` | `framework`, `case-study`, or `illustrative` |
| `description` | Dataset description, at most 5,000 characters |
| `notes` | Optional array of up to 20 plain-text notes |
| `sources` | Optional array of source records |
| `nodes` | Array of 1 to 120 node records |
| `edges` | Array of 0 to 240 edge records |

Identifiers use letters, numbers, periods, underscores and hyphens, begin with a letter or number, and contain no more than 80 characters. Node, edge and source IDs must each be unique within their collection. Unsupported fields are rejected so schema changes cannot silently disappear on export.

## Node records

Each node requires `id`, `label`, `stage`, `dimension`, `form`, `summary` and `evidence`.

| Field | Value |
| --- | --- |
| `stage` | `psychomeme`, `phonomeme`, or `phenomeme` |
| `dimension` | `null` for psychomemes and phonomemes; `4`, `3`, `2`, or `1` for phenomemes |
| `form` | Name of the selected representational form |
| `summary` | Description of the state, at most 2,500 characters |
| `preserves` | Optional list of selected properties retained from the preceding state |
| `loses` | Optional list of properties omitted or made less accessible |
| `gains` | Optional list of newly available properties or operations |
| `evidence` | `framework`, `documented`, `inferred`, or `illustrative` |
| `sourceIds` | Optional list referencing entries in `sources` |
| `dateLabel` | Optional sourced date or period; omit when unknown |
| `example` | Optional short example |
| `detail` | Optional longer explanation, at most 6,000 characters |

`preserves`, `loses`, and `gains` describe interpretation at a transition. They are not numeric measures of information, semantic value, copying accuracy or durability. At a branching or converging node, explain the relevant incoming transition in the text; more granular edge-level claims can be added in a future schema version.

Evidence values distinguish conceptual assignments (`framework`), claims supported by a cited record (`documented`), reasoned reconstructions (`inferred`), and deliberately constructed examples (`illustrative`). A source link alone does not make all claims within a node documented.

## Edge records

Each edge requires `id`, `from`, `to`, `kind` and `label`. `summary` and `sourceIds` are optional. Both endpoint IDs and every source ID must resolve in the same dataset.

`kind` is one of `externalization`, `transduction`, `re-encoding` or `copying`. These are descriptive categories, not proof of a historical relationship. Graphs can branch, return to an earlier category or connect two nodes within the same dimension. Node order provides a stable display order; an edge is the explicit statement of connection.

## Source records

A source requires `id`, `title`, and an absolute `url` using `https:` or `http:` without embedded credentials. An optional `locator` identifies a page, section, passage, artifact or folio. There can be at most 60 sources. Use sources that support the specific claims, and distinguish a conceptual notebook from historical evidence about an example.

## Dimensional interpretation

The framework follows the current project brief: psychomeme, phonomeme, then phenomemetic forms organized as 4D, 3D, 2D and 1D. The 4D category means an embodied material event unfolding through time, such as performance, ritual or demonstrated craft. This interpretation was confirmed for this project.

Dimension describes the organization selected for the analysis. It does not describe every physical or semantic property of a medium. For example, a printed poem is a one-dimensional symbolic sequence arranged on a two-dimensional page within a three-dimensional book. A study of its typography could instead model its planar organization. State that choice in `form`, `summary` or `detail`.

The general progression is a heuristic for cultural representation, not a dated universal law. Stages coexist, and a particular case may skip categories. No chronology, numerical fidelity score or survival estimate is inferred by the schema.

## Minimal example

```json
{
  "schemaVersion": 1,
  "id": "gesture-to-notation",
  "title": "Gesture to notation",
  "kind": "illustrative",
  "description": "A constructed transformation from performed gesture to written sequence.",
  "nodes": [
    {
      "id": "gesture",
      "label": "Gesture",
      "stage": "phenomeme",
      "dimension": 4,
      "form": "An embodied event",
      "summary": "A participant traces a rising spiral.",
      "evidence": "illustrative"
    },
    {
      "id": "notation",
      "label": "Notation",
      "stage": "phenomeme",
      "dimension": 1,
      "form": "Ordered instructions",
      "summary": "A symbolic sequence describes selected features of the gesture.",
      "preserves": ["The selected order of movement"],
      "loses": ["Unrecorded timing and bodily particulars"],
      "gains": ["A sequence that can be copied"],
      "evidence": "illustrative"
    }
  ],
  "edges": [
    {
      "id": "gesture-notation",
      "from": "gesture",
      "to": "notation",
      "kind": "re-encoding",
      "label": "Notation"
    }
  ]
}
```

To author a case, copy a bundled dataset or the minimal example, choose the level of representation, add only defensible claims and sources, then import the JSON. Exported JSON can be reimported without losing supported fields. Unknown fields, unsafe link schemes, malformed dimensions, duplicate IDs and dangling references are reported before rendering.
