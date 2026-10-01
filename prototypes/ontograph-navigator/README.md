# Ontograph navigator (roadmap #12)

The first working three-pane interface: a large Phylograph on the left, the Ontograph at upper right, and a full-size spatial view of the inspected shell below it. It builds directly on the released #11 viewer. The parked x86 pilot and the fossil-photo PR are not dependencies.

## Try it

Serve the repository using `python3 -m http.server 8000`, then open:

- `http://127.0.0.1:8000/prototypes/ontograph-navigator/` — Life, with KNM-WT 15000 at 1.6 Ma.
- `?level=mind&d=ias&pick=illiac&shell=1952` — cultural/technical inheritance.
- `?level=life&d=hominins&pick=knm-wt-15000&shell=1600000&expanded=1&g=3` — an earlier shell expanded to the outer globe.

Select a level and case study, then a record or dated shell. The black ring identifies that shell in the nested history. **Expand this shell** brings it to the outer radius, hiding later records; **Full history** restores the dataset extent. The 3D pane projects records intersecting that date to a full-size globe. Picking a visible globe label or a spatial-record button updates the common selection and its date. Both globes can be rotated and zoomed independently.

The shell slider steps through unique node dates and the dataset's two endpoints, not equal elapsed durations. A record with `tEnd = t` appears only at its occurrence date; a duration intersects inclusive start/end dates. A missing end means the dataset cutoff, following v1 semantics. Counts describe records, not population, survival or physical coexistence. Empty shells are explicit.

## Level assignments and source

The design reference is **ON-141**, Ontograph notebook p. 5: a large globe at left, nested loops above a third spatial view at right. The companion navigation rule is recorded in the Reader, §XV and the “Ontographic navigation” lexicon entry: choose a level to navigate its history, and expand an earlier shell to full globe size. Archive originals remain in the private workspace; this implementation paraphrases the interaction and does not redistribute notebook scans or prose.

| Level | This first implementation |
|---|---|
| Energy | Explicit no-dataset state; no speculative cosmic dates |
| Matter | Explicit no-dataset state; no speculative geological dates |
| Life | Hominin finds and SARS-CoV-2 lineages |
| Mind | IAS machines, printing and Unix, as cultural/technical case studies |
| “I” | Optional reader coordinates within the retained case study and moment |

Assignments are editorial browsing categories, not claims about when life or mind emerged. The available interval is each dataset's own span. The loops derive from plate O-IV; this prototype adds no Horizon glyph and does not settle the existing pinch/Horizon interpretation. “I” marks a viewing position, not a personal lineage. Coordinates live only in page memory and same-origin renderer state; they are not saved, fetched from a location service, or included in links. Reload removes them.

Modern coastline geometry is shared with the viewer. The third pane is a **spatial record view**, not a fossil mesh, reconstructed organism/face, paleolandscape or complete historical Earth. Object models, paleogeography and a sourced cross-level chronology remain later work.

## Implementation and state contract

- `index.html`: accessible controls, layout and original loop geometry derived from the existing plates.
- `navigator.css`: the project's serif/ink/paper visual system, dark theme and stacked phone layout.
- `navigator.js`: curated level-to-catalog mapping, dataset loading, shared selection/shell state, evidence card, local reader coordinates and recoverable loading errors.
- `../stratasphere-viewer/index.html`: unchanged standalone interaction plus explicit `embed=history|slice` modes. The same renderer supplies both panes; there is no duplicate Earth/time renderer.

Embedded instances expose a same-origin `window.PhylographEmbed` API: `ready`, `setView({dataset,pick,shell,expanded,gradient,reader})`, and `onPick(id,dataset)`. The browser's same-origin boundary governs access. There is no cross-origin message listener or arbitrary dataset URL/payload import. The parent and children use request counters so an old load cannot win over a newer selection. When a pane fails, a visible retry reloads both renderers.

History uses the original fixed dataset time scale until the reader explicitly expands a shell. Expansion changes the displayed end and rebuilds coastline shells over that interval; the source dataset is unchanged. Slice mode filters records by their source intervals, removes lineage arcs, and places the remaining points/coastlines at the outer radius. The CPU label/ring scale and GPU vertex scale agree. Standalone first-step behavior remains covered by the existing tests.

Shared navigator URLs carry `level`, `d`, `pick` (including an explicitly empty selection), `shell`, `expanded=1`, and `g`. Dates retain each dataset's notation. Camera angle, pan, zoom and reader coordinates are intentionally not shared. The “Open this record in the viewer” link carries dataset/selection and the expanded cutoff; it does not promise the navigator's full framing.

## Validation and continuation

`npm run test:browser` includes five navigator tests plus the existing viewer suite. Navigator checks cover both canvases, label-to-parent selection, spatial membership/empty shells, GPU-measured shell expansion, shared state, level assignment, location privacy, racing/failed requests, keyboard selection and dark mobile rendering. Python dataset validation still covers all five released datasets.

Continue by reviewing this interaction against the notebook, deciding how an actual contextual object model should relate to a record, and defining sourced datasets/time mappings for the unrepresented levels. Check Safari and real-GPU performance before treating two simultaneous WebGL views as accepted across devices. If #10/#11 later merge, reconcile their localized viewer edits and run both features' tests; do not discard their work or silently enable x86 without reviewing its level assignment.
