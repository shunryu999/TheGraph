# Ontograph navigator: first working slice

Checkpoint: 1 October 2026. The owner selected roadmap **#12** after parking further x86 expansion. This implementation is based on released `main` (`d0cd0de`), so it can be reviewed independently of open fossil-image and x86 PRs #10–11.

The interaction follows ON-141 (Ontograph notebook p. 5) and the navigation rule preserved in the Reader §XV. The large historical globe remains at left; the compass and spatial view occupy the right column. On narrow screens they stack with the level chooser first. Implementation details and restart instructions are in the [prototype README](../prototypes/ontograph-navigator/README.md).

## Decisions made for this slice

1. Reuse the existing renderer in two same-origin embedded views. Preserve the standalone instrument and its fixed-scale first time step.
2. Use the five released case studies. Life selects biology; Mind selects culture/technology. Each dataset supplies its own time bounds. Energy and Matter show an explicit no-data state. These mappings do not assert universal emergence dates.
3. Inspect dated event shells without hiding the surrounding history. An explicit expand action makes the chosen earlier shell the outer globe; reset restores the full extent. Dated occurrences do not become invented lifespans.
4. Synchronize record and shell selection in both directions. The spatial view contains records whose stated intervals intersect the selected date, with empty dates labeled. List/select controls provide access when labels overlap.
5. Interpret the third pane initially as spatial context. It uses modern coastlines and dataset coordinates, with that limitation visible. Specimen models, reconstructions and paleogeographic shells are not supplied by the current data.
6. Keep “I” optional and local. A reader can enter coordinates, remove them, or reload to forget them. Shared links carry only the instrument state.
7. Preserve the existing loop form without adding or resolving Horizon glyphs. The open interpretation of the pinch remains an explicit design question.

## Acceptance and remaining work

The implemented acceptance slice is: choose Life → select a fossil → inspect its dated shell → expand it → see the corresponding spatial records → select another record → restore a shared view. Mind provides an independent cultural case study using the same contract. The original viewer and all released datasets must still pass their regression checks.

Five added browser tests exercise the linked state, real canvas marks, an actual GPU radius readback before/after expansion, empty shells, shared/reloaded state, private coordinates, request races/recovery, keyboard interaction and a 390 px dark layout. This is not a claim of Safari support or measured real-GPU performance.

Before extending the prototype, review the third-pane interpretation with the owner; decide which sourced model or object could accompany a record; design any broader cross-level chronology; and check the two-view cost on real devices. The independent cameras intentionally retain their own orientation/zoom during selection. There is no claim of full cosmic-to-personal navigation or a completed biological ancestry model.
