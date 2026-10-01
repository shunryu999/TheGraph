# Stratasphere Viewer (roadmap #11)

A general viewer for any lineage with places and dates. Each node sits on the globe where it happened, at the shell for its year: the present is the outer shell and the start of the dataset is the center. Each node's worldline runs outward to the present. Each link is an arc from parent to child that climbs through the shells as it crosses the globe.

The catalog contains the IAS machine family, the spread of printing, Unix and SARS-CoV-2 lineages, plus hominin fossil comparisons and an x86 design-family pilot. A short first-visit tour introduces the original four in that order, with one sentence per stop. Skip, finish or change datasets to leave the tour; reopen it from the header. Only the completed/skipped preference is stored locally, and shared dataset links bypass the tour.

## What it does

- **Shells.** Radius is computed on the GPU from `tNow`, the fixed dataset span `tEnd − tStart`, and the density gradient `f = (1 − e^(−k·age)) / (1 − e^(−k))`, where `age = (tNow − nodeTime) / (tEnd − tStart)`, clamped to 0–1. Advancing one time step moves existing shells inward by one increment of that fixed scale; the first shell reaches the inner limit only at the end of the full span. The current shell stays outermost. Moving the time slider or gradient does not rebuild the graph geometry; labels and hatch boundaries use the same scale on the CPU.
- **Land.** The Natural Earth 110 m coastlines, simplified to 84 rings and redrawn at ten intervals between the start and the present, so geography is legible at every depth.
- **Picking.** Click a name or a list entry to trace its ancestors and descendants in vermilion. The card gives the chain of descent and the machines that copied it.
- **Inference.** Nodes and links marked `"inferred": true` are drawn in grey italic. Record and inference stay visibly apart.
- **Time.** A slider and a Play button run the lineage forward from its start. Nodes not yet built are hidden.
- **Cutaway.** An optional oblique cut facing the viewer shows the shells in section.
- **Framing.** Each dataset opens in a three-quarter view of its own region, so the radial lines of time are seen side-on. A regional dataset (all within about 70° of arc, like the spread of printing) is orbited from the middle of its cone and does not turn by itself. A global one is orbited from the centre.
- **Names.** Each name sits where its node began, on its own shell. When names would overlap, the picked lineage wins, then the hubs that led on to most, then the oldest. Hovering an entry in the list always shows its name.
- **Endings and detection.** A node with `tEnd` has its line stop there, with a plain terminus, drawn grey (the convention's "lines that ended") unless it is in the picked lineage. A node with `"provenance": "detected"` is drawn as an open ring, and its card says "first detected". The key shows these entries only when the dataset uses them.
- **Kinds of link.** Links of kind `influence` (shaped by, with nothing passed on) are drawn faint; all other kinds are drawn as record. The key lists the dataset's own captions from `linkKinds`. Where a dataset has influence links, a *Follow influence links when tracing* switch decides whether a picked lineage runs through them.
- **The card** lists every parent with the kind of link (from the dataset's `linkKinds`) and the link's own note, traces the line back to its root, names what it led on to, and gives the node's own `sources`.
- **Hatched inference.** Stretches of time a dataset declares in `meta.inferredSpans` are drawn as the Brief's 45° hatch, grey, in the band between the two shells that bound the stretch, never as record.
- **Your place.** Type a city (any place of 250,000 people or more, from GeoNames via [`data/places/cities.json`](../../data/places/cities.json)), a latitude and longitude, or use the browser's location. A vermilion line runs from that point on the present shell to the nearest node that has begun, and the panel names it with its distance. The place stays in the page: it is not saved, put in the address, or sent anywhere.
- **Export.** *Save image* writes a PNG about 3000 pixels wide: the view, the names as drawn, and a caption line. *Record a turn* writes one slow eight-second turn as WebM or MP4, whichever the browser records.
- **Keyboard.** ← → step through time (Shift for ten steps), Home and End jump to the first moment and the present, Space plays, Esc clears the selection, and ↓ ↑ move through the list, which is a full text equivalent of the figure. The card is announced to screen readers when it changes.
- **Performance.** Names are placed with a grid of screen cells, so the overlap test stays cheap at thousands of nodes. Worldlines are drawn with four segments and links with segments in proportion to their arc, and the Earth is redrawn on ten shells.
- **Datasets.** A picker lists the datasets in [`data/catalog.json`](../../data/catalog.json), fetched from `/data/` on the site (or `../../data/` in a checkout). The IAS family is also embedded in the page, so it still opens offline or from a file.
- **Permalinks.** The address bar keeps `?d=<dataset>&pick=<node>&t=<date>`, so a link reopens the same lineage at the same moment.
- **Your own data.** Load any JSON file in the v1 format: [`docs/data-format.md`](../../docs/data-format.md). Dates may be years, months, days or years before present, and a node with `tEnd` stops there.

For fossil occurrences, `tEnd = t` produces a single point. Optional `dateLabel` text preserves an age range or minimum on the card. `meta.relationshipMode: "comparison"` uses comparison wording and `meta.defaultGradient` sets the initial density (3.0 for hominins; otherwise 1.0). The gradient resets on dataset load. URL-only citations become clickable links.

## Architectural branch colors

The x86 pilot introduces optional `meta.families` and `meta.vendors` palettes. Family, manufacturer and monochrome modes preserve category identity during selection: traced connections stay bright, unrelated branches fade, and selected points enlarge. Inference remains grey. Dotted feature transfers can be excluded from tracing; dashed composition links retain the contributing core's color when they enter a mixed product. Other datasets keep their original rendering.

`relationshipMode: "network"` shows typed contributions and connected-design buttons instead of a first-parent ancestry chain. The card exposes `designLocation` evidence, its geographic scale and other documented contributors. Same-city designs keep their coordinates; select an obscured label through the list or connected-design buttons. The [pilot audit](../../data/x86-design-pilot/SOURCE.md) documents city anchors and source limitations. Optional `color=vendor|mono` and `transfers=0` URL parameters restore the chosen view. Family and transfer settings reset when changing datasets.

## Fossil panel

In the hominin catalog entry, a panel above Dataset follows the selected fossil. It renders a thin-line study of the sourced photograph, with Photo mode, detail adjustment, zoom and drag-to-pan. Focus the drawing to use +/− for zoom, arrow keys for panning, and 0 to fit. Line strokes follow the light or dark theme. These are two-dimensional photographic contours, not a reconstructed 3D fossil.

[`fossil-viewer.js`](fossil-viewer.js) reads the [image register](../../data/hominin-fossils/media.json) and same-origin image assets. The original photographs stay unchanged. Source attribution and terms remain visible, and [MEDIA.md](../../data/hominin-fossils/MEDIA.md) records the source choices and limits. The three Smithsonian records without a photograph display a message instead. A bounded cache and selection token prevent stale images after rapid picking. This panel is separate from the globe's PNG/clip export.

## Dependencies

three.js r128 (cdnjs) and OrbitControls (jsDelivr). Land outlines are embedded in the page. There is no build step. The embedded IAS data alone does not make a fresh browser work offline: the external libraries must also be available. See the root [README](../../README.md#check-a-change) for the optional development dependencies used by the browser checks.

## Next

M5 adds the tour, Chromium checks, a [worked CSV conversion](../../docs/data-format.md#worked-example-two-spreadsheets-to-one-lineage), and the [data design specification](../../docs/stratasphere-data-design.md). The [roadmap](../../docs/stratasphere-viewer-roadmap.md) retains the outstanding printing-source verification, Unix expansion, Safari export and real-GPU checks. The first hominin fossil comparison dataset is prepared for review. See its [sources and scientific limits](../../data/hominin-fossils/SOURCE.md); a reviewed ancestry-hypothesis model remains future work.
