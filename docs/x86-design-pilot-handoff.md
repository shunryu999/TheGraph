# x86 design pilot: handoff and restart guide

Saved 1 October 2026. The owner asked to document this work and return to the wider Phylograph chart. **Further x86 expansion is parked.** The implemented pilot remains available for review; parking it is not a merge or publication decision.

## Checkpoint and release state

- Implementation commit: `8195e33` on `codex/x86-design-pilot`.
- [PR #11](https://github.com/shunryu999/TheGraph/pull/11) is open, targeting `codex/fossil-viewer`; it contains the x86 implementation and this documentation checkpoint.
- [PR #10](https://github.com/shunryu999/TheGraph/pull/10), the fossil image viewer, is open against `main`. Its code is the base of this pilot.
- Published `main` at this checkpoint is `d0cd0de`: the M5 viewer, first-step radial fix and 32-fossil comparison dataset are merged (PRs #7–9). The [Pages deployment](https://github.com/shunryu999/TheGraph/actions/runs/36436422876) succeeded. The published catalog has five datasets; this branch has six.
- Before publication, review/merge #10, retarget #11 to `main`, reconcile any changes and rerun checks. The repository's owner-review workflow still applies.
- [PR #6](https://github.com/shunryu999/TheGraph/pull/6) remains a separate, older handoff/rights proposal. Its handoff predates M5 and these case studies. Reconcile it against current docs if resumed; do not treat its release status or proposed licensing changes as already merged.

## Agreed purpose and scope

Evaluate x86 architectural branching using the IAS family as a precedent, with persistent colors for design families. The owner agreed to representative designs and documented design locations. The broader research target is about 30–40 designs; the implemented first slice has **11 milestones and 8 connections**, November 2000–January 2023. It is deliberately incomplete.

The sample covers NetBurst/Pentium 4; Pentium M/Banias; Yonah/Core Duo; Core; Penryn; Zen; Zen 2; Golden Cove/P-core; Gracemont/E-core; Alder Lake; and Sapphire Rapids. Colors are editorial navigation groups, not proof of strict biological-style clades. x86 instruction-set compatibility alone does not establish a design-inheritance link.

## How locations and dates were established

1. Identify the particular microarchitecture, core or product and the role to be located.
2. Use manufacturer technical papers, named architect accounts and conference papers/programs. Record what each source actually establishes. Author affiliation is a documented contributor, not automatically a lead or exclusive design site.
3. Keep headquarters, fabs, launch datelines and geographic codenames separate from design-team evidence.
4. Plot a city-scale anchor using sourced geographic coordinates. Explain distributed contributions and other known places. Do not offset colocated designs to make the figure more attractive.
5. Cite public disclosure/introduction milestones separately from location evidence. `tEnd = t` makes each record an occurrence, without inventing a development or production lifespan.
6. Leave inadequately sourced candidates unplaced in the research inventory.

The [placement audit](../data/x86-design-pilot/SOURCE.md) contains the complete node-by-node location/date audit, relationship rules and remaining inventory. The [source register](../data/x86-design-pilot/research-sources.json) holds checked URLs, and the [dataset](../data/x86-design-pilot/x86-design-pilot.json) carries evidence on every node and link.

Evidence qualifications to preserve:

- Hillsboro anchors the Pentium 4 architecture/circuit team documented in author biographies.
- Haifa anchors the documented Intel mobile/performance-core work. Alder Lake and Sapphire Rapids are qualified P-core contribution anchors, not claims that each whole product was exclusively designed there.
- Austin anchors Gracemont's E-core team and the cited AMD paper affiliations. Zen also names Fort Collins and Sunnyvale; Zen 2 names Markham.
- The Yoaz interview distinguishes the architect's English account from the accompanying design-history slide and editorial description.
- ISSCC 2020 paper **2.1** supplies the Zen 2 core affiliation evidence; paper **2.2** is a separate chiplet contribution. Do not conflate them. The ISSCC documents used here are original programs hosted by mirrors.
- Coordinate decimals are storage precision, not office-level certainty. A missing edge is an unmade claim, not evidence of an independent origin.

## Relationships and rendering decisions

| Relationship | Pilot examples | Rendering |
|---|---|---|
| Design development | Pentium M → Yonah; Core → Penryn; Zen → Zen 2 | Solid; target family color |
| Feature/design-approach transfer | Pentium M → Core; NetBurst → Core | Dotted; contributing source color; optional in tracing |
| Core composition | Golden Cove → Alder Lake and Sapphire Rapids; Gracemont → Alder Lake | Dashed; contributing source color |

The Zen → Zen 2 note explicitly acknowledges omitted Zen+. The mobile/Core/P-core color group does not fill missing generations with assumed links. Alder Lake's marker is neutral and its two incoming contributions retain separate colors.

The optional palette uses blue for Intel mobile/Core/P-core, ochre for NetBurst, teal for E-core and purple for AMD Zen, with theme-specific variants. Manufacturer and monochrome modes are available. Selection keeps category hues, enlarges selected points and fades unrelated branches; inferred marks and labels remain grey. Vermilion retains the present boundary and reader worldline. These are scoped conventions for datasets with family metadata; existing datasets keep their previous rendering.

`relationshipMode: "network"` gives typed contributions and connected-design buttons rather than a first-parent ancestry chain. Same-city points can overlap; list entries and these buttons are the current navigation remedy. Selected/traced family labels may show through the transparent globe even on its far side. No artificial geographic jitter or multi-anchor products were introduced.

## Where the implementation lives

| File | Responsibility |
|---|---|
| `data/x86-design-pilot/` | Data, location/relationship/date audit and source register |
| `data/catalog.json` | `x86` catalog entry |
| `prototypes/stratasphere-viewer/index.html` | Family controls, palette, per-vertex style attributes, line patterns, trace emphasis, network cards, source links and browser metadata validation |
| `tools/validate.py` | Optional families/vendors, node membership, design-location metadata and relationship URL validation |
| `tests/browser/viewer.spec.js` | Catalog loading/first-step checks; family colors, shared state, hybrid evidence, mobile layout and malformed metadata rejection |
| `tools/test_validate.py` | Metadata errors and pilot evidence/composition invariants |
| `docs/data-format.md`, `docs/conventions.md` | Public format and visual behavior contracts |

Optional `meta.families` / `meta.vendors` map stable IDs to labels and palette tones 0–4. Nodes reference those IDs and carry `designLocation` with `precision`, `basis`, `role`, `evidence`, `sources` and optional `otherPlaces`. Links carry their own evidence URLs. Browser validation rejects bad metadata without replacing the current dataset. Schema checks do not establish historical truth.

Shared views use the existing dataset/selection/date parameters plus `color=vendor|mono` and `transfers=0`. Defaults are family colors and transfer tracing enabled. Color/transfer controls reset on a dataset change.

## Resume and verify

From a checkout of `codex/x86-design-pilot` (or its merged successor):

```sh
npm ci
npx playwright install chromium
python3 -m unittest discover -s tools -v
python3 tools/validate.py --catalog data/catalog.json
npm run test:browser
python3 -m http.server 8000
```

On Linux, install browser system dependencies as described in the root README. Tests start their own server on port 8765. The last implementation check passed **17 Python tests, all six dataset validations and 29 Chromium tests** locally and on GitHub. Browser coverage includes actual blue/teal canvas pixels in both themes, two hybrid contributors, restored shared state, malformed evidence rejection and a 390 px viewport. Desktop visual review and a final isolated browser check confirmed selected inferred labels/list entries remain grey. Safari and real-GPU performance remain unverified.

Local examples (the preview server must be running):

- `http://127.0.0.1:8000/prototypes/stratasphere-viewer/?d=x86&pick=alder-lake` — both core contributions.
- `http://127.0.0.1:8000/prototypes/stratasphere-viewer/?d=x86&pick=core` — two feature/design-approach inputs.
- `http://127.0.0.1:8000/prototypes/stratasphere-viewer/?d=x86&pick=zen-2` — qualified AMD affiliations.

The corresponding public x86 URL is not available until the PR chain is merged and deployed. The preview screenshot is a local review artifact; the durable record is the code, audit and PR.

## Remaining work when reopened

1. Review the historical claims and the small sample before adding more nodes. Scope candidates include early x86/P5/P6, AMD K-series/Bulldozer, earlier Atom and omitted Core generations, plus NexGen, Cyrix and Centaur/VIA where the history requires them.
2. Require both location and relationship evidence for each addition; keep uncertain candidates in the inventory. Preserve the distinction between team location and author affiliation.
3. Decide whether distributed products need multiple plotted anchors, and whether dense same-city runs need an additional non-geographic view. Do not silently move points.
4. Evaluate legibility of overlapping branches, family grouping boundaries and line patterns with a larger sample. Strict clade language would require a defensible ancestry model.
5. Complete any needed review and merge work, then verify the deployed catalog and examples. Broader printing-source, Unix-source, Safari-export and real-GPU debts are tracked separately in the viewer roadmap.

The next overall project is still a choice for the owner. The refreshed [23-project chart](roadmap.md) identifies #12 (Ontograph navigator) as the recommended next build, with #9 previously deferred and #17 requiring actual PBDB/paleogeographic work beyond the hominin comparison pilot.
