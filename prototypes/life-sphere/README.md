# Life on the Stratasphere (roadmap #7)

Conway's Game of Life (B3/S23) played on the surface of a sphere, with its whole history nested as shells: the present outermost, generation 0 at the center. It is the storyboard's first proposed application of the stratasphere (Storyboarding notebook, p. 33): "rapidly recognized by the general readership of science."

## What it does

- **The grid.** A cube-sphere: six faces of n×n cells, inflated with a tangent warp so the cells come out roughly equal in size. Each cell's eight nearest cells are its neighbours. At the eight cube corners the eighth neighbour is slightly farther away than the rest.
- **Lineage.** A newborn cell is joined to the three live neighbours that caused its birth. A surviving cell is joined to itself in the previous generation, drawn as a short radial line. Because every birth has three parents, the lineages braid as well as branch.
- **Rendering.** Three.js, with shells positioned in a vertex shader by `tNow` and a density-gradient uniform. Nothing is recomputed on the CPU when the view changes. An oblique cutaway facing the viewer shows the shells in section.
- **The fur.** Lives on a line to a cell alive now are drawn in ink. Everything else is drawn faintly.
- **Picking.** Click a cell on the outer shell to trace everything it came from, drawn in vermilion.
- **Spontaneous births.** An optional trickle of parentless new founders keeps the sphere from settling into still lifes.

## Dependencies

three.js r128 (cdnjs) and OrbitControls (jsDelivr). There is no build step.

## Next

This is the seed of the stratasphere viewer (#11). The shell shader, the timestep-plus-link data model and the picking code carry over directly.
