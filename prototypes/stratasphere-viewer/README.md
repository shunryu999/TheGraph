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
- **Your own data.** Load any JSON file of the form below.

```json
{"meta": {"title": "", "tStart": 0, "tEnd": 0, "description": "", "sources": [], "caveats": ""},
 "nodes": [{"id": "", "label": "", "lat": 0, "lng": 0, "t": 0, "place": "", "note": "", "inferred": false}],
 "links": [{"from": "", "to": "", "inferred": false}]}
```

## Dependencies

three.js r128 (cdnjs) and OrbitControls (jsDelivr). The dataset and land outlines are embedded in the page. There is no build step.

## Next

Species (#17, a Paleobiology Database extract), manuscripts and editions (#15), and software forks all fit this schema unchanged.
