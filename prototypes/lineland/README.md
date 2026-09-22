# Lineland

A one-dimensional world wrapped into a circle and run forward in time. Each generation is laid down as a ring: the present outermost, the beginning at the center. Connect every child to its parent and the whole history becomes one branching figure.

This is **project 1** on the Phylograph roadmap. It is the Graph's three operations (nebulization, stratospherication and twigzillation) at their smallest scale.

## What it shows

- **Nested ⇄ extruded.** The same history drawn as nested rings, or unrolled into a cylinder (S¹ × I) where every generation is the same size. *They are not smaller. They are farther.*
- **Density gradient.** At zero, every generation gets equal spacing. Higher values give the recent past room and press the deep past toward the center.
- **The fur.** Lines that lead to someone alive now are drawn in ink. Lines that ended are drawn faintly.
- **Trace a line.** Click any life to trace its line back to the beginning. Click a second to find where the two lines meet.
- **Common ancestor.** A live count of how many generations back everyone alive shares one ancestor.
- **Heredity vs. automaton.** With one parent per life, the lines form a tree. Under a Wolfram rule, each cell draws on up to three parents and the lines braid instead.

## Sources in the archive

After the Storyboarding notebook (Bloomington, 2007–08), Figs. 1, 3.c, 7.a–c and 14–16, and the Ontograph notebook's presentation outline ("Darwin's diagram is of Lineland — basically C.A. world lines!").

## Running it

It's a single self-contained `index.html` with no build step. Open it in a browser, or serve it with GitHub Pages from the `main` branch root.
