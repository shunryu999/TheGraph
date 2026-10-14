# Cultural Dimensions (roadmap #9)

A reusable visualization of cultural transduction: psychomeme -> phonomeme -> phenomeme, followed by 4D -> 3D -> 2D -> 1D organization within phenomemetic forms.

The 4D category means an embodied form unfolding through time: a performance, ritual, or demonstrated craft. Dimensions describe a selected representation, not the physical dimensions of its carrier. Forms coexist; the general model is not a dated sequence that every culture must follow.

## Run

From the repository root:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/prototypes/dimensional-reduction/`. GitHub Pages assembles this folder at `/dimensional-reduction/`.

No build step, third-party runtime requests, or backend service is required. The local ES modules need an HTTP server; opening `index.html` through a file URL is not supported.

## Included Examples

- **Cultural progression:** the six-form conceptual framework.
- **Paradise Lost:** thought, dictation, manuscript, two editions, and digital text. The textual forms remain 1D despite changes in their material carriers.
- **A performed pattern:** a constructed movement example passing through performance, wire, drawing, and notation.

The map, comparison table, evidence inspector, playback, view links, and exports all read the same data. Notes distinguish the historical evidence for artifacts from interpretations of their dimensional organization.

## Add an Example

See the [data format](../../docs/dimensional-reduction-data-format.md) and [model essay](../../docs/dimensional-reduction-model.md).

Download the example template in the interface, give it a unique ID, edit its plain-text content and graph, and import the JSON. To ship a built-in example, add it to `DATASETS` in `data.js`; the renderer needs no changes.

Imports remain in the current browser's local storage. Sharing an imported view also requires sharing its exported JSON. The model-notes dialog removes an imported example. SVG exports are standalone diagrams; JSON exports retain complete notes and provenance.

Node order is the authored reading order. Edges record relationships independently, including branches and feedback. The renderer does not infer descent, force every example through all categories, or invent historical dates. Small case studies are the intended scope; dense networks should be divided into bounded examples.

## Check

From the repository root, after `npm ci` and installing Playwright Chromium:

```sh
npm run test:model
npx playwright test tests/browser/dimensional-reduction.spec.js
```

`DIMENSIONS_PATH` can point the browser suite at an assembled `/dimensional-reduction/` path. The normal repository browser command includes these tests and the existing viewer suite.

## Files and Credits

- `model.js`: versioned schema, normalization, validation, and stage grouping.
- `data.js`: independently authored examples and sources.
- `app.js`: rendering, interactions, import/export, and selection state.
- `style.css`: responsive workbench layout.
- `assets/lucide.min.js`: bundled icons; ISC and Feather MIT notices in `assets/LUCIDE-LICENSE`.

The public-domain 1667 title page is courtesy of Houghton Library, Harvard University, shelfmark EC65.M6427P.1667aa. [Image and rights record](https://commons.wikimedia.org/wiki/File:Houghton_EC65.M6427P.1667aa_-_Paradise_Lost,_1667.jpg). It illustrates an edition; the Oxford digital text is not claimed to descend from this photographed Harvard copy. Notion references point to the project's private research archive and may require access; historical claims also link to public library records.
