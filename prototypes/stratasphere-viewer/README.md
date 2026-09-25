# Stratasphere Viewer (roadmap #11)

A general viewer for any lineage with places and dates. Each node sits on the globe where it happened, at the shell for its year: the present is the outer shell and the start of the dataset is the center. Each node's worldline runs outward to the present. Each link is an arc from parent to child that climbs through the shells as it crosses the globe.

The first dataset is the IAS machine family (#8), in [`data/ias-machine-lineage/`](../../data/ias-machine-lineage/).

## What it does

- **Shells.** The same vertex-shader approach as Life on the Stratasphere (#7). Radius is computed on the GPU from `tNow`, `tStart` and the density gradient `f = (1 − e^(−k·age)) / (1 − e^(−k))`. Moving the time slider or the gradient recomputes nothing on the CPU.
- **Land.** The Natural Earth 110 m coastlines, simplified to 84 rings and redrawn on about sixteen shells between the start and the present, so geography is legible at every depth.
- **Picking.** Click a name or a list entry to trace its ancestors and descendants in vermilion. The card gives the chain of descent and the machines that copied it.
- **Inference.** Nodes and links marked `"inferred": true` are drawn in grey italic. Record and inference stay visibly apart.
- **Labels.** Names sit at each node's present tip. When names would overlap, the picked lineage wins, then older nodes.
- **Time.** A slider and a Play button run the lineage forward from its start. Nodes not yet built are hidden.
- **Cutaway.** An optional oblique cut facing the viewer shows the shells in section.
- **Framing.** Each dataset opens in a three-quarter view of its own region, so the radial lines of time are seen side-on. A regional dataset (all within about 70° of arc, like the spread of printing) is orbited from the middle of its cone and does not turn by itself. A global one is orbited from the centre.
- **Names.** Each name sits where its node began, on its own shell. When names would overlap, the picked lineage wins, then the hubs that led on to most, then the oldest. Hovering an entry in the list always shows its name.
- **Endings and detection.** A node with `tEnd` has its line stop there, with a plain terminus, drawn grey (the convention's "lines that ended") unless it is in the picked lineage. A node with `"provenance": "detected"` is drawn as an open ring, and its card says "first detected". The key shows these entries only when the dataset uses them.
- **Kinds of link.** Links of kind `influence` (shaped by, with nothing passed on) are drawn faint; all other kinds are drawn as record. The key lists the dataset's own captions from `linkKinds`. Where a dataset has influence links, a *Follow influence links when tracing* switch decides whether a picked lineage runs through them.
- **The card** lists every parent with the kind of link (from the dataset's `linkKinds`) and the link's own note, traces the line back to its root, names what it led on to, and gives the node's own `sources`.
- **Datasets.** A picker lists the datasets in [`data/catalog.json`](../../data/catalog.json), fetched from `/data/` on the site (or `../../data/` in a checkout). The IAS family is also embedded in the page, so it still opens offline or from a file.
- **Permalinks.** The address bar keeps `?d=<dataset>&pick=<node>&t=<date>`, so a link reopens the same lineage at the same moment.
- **Your own data.** Load any JSON file in the v1 format: [`docs/data-format.md`](../../docs/data-format.md). Dates may be years, months, days or years before present, and a node with `tEnd` stops there.

## Dependencies

three.js r128 (cdnjs) and OrbitControls (jsDelivr). Land outlines are embedded in the page. There is no build step.

## Next

The build-out to MVP is planned in [`docs/stratasphere-viewer-roadmap.md`](../../docs/stratasphere-viewer-roadmap.md): the spread of printing, SARS-CoV-2 variants and the Unix family, then hominin fossils.
