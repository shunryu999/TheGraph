# Genealogical diamond (roadmap #2), planned

A random-mating pedigree simulation. Your ancestors double each generation back, overlap more and more, then collapse onto shared ancestors: the storyboard's "maximum network diameter" (Storyboarding notebook, p. 10).

## Correction to carry into the Reader

The notebook dates the convergence to about 100,000–200,000 years ago. That is the range for mitochondrial Eve and Y-chromosomal Adam, who are single-locus ancestors. Pedigree modelling (Rohde, Olson & Chang, *Nature*, 2004) puts the most recent common *genealogical* ancestor of all living people only a few thousand years back, with the "identical ancestors point" somewhat earlier.

## Plan

- Population N, generations G, simple mating structure, with an optional migration parameter between demes.
- Plot distinct ancestors per generation against the naive 2^g curve. The gap is pedigree collapse.
- Mark the MRCA generation and the identical-ancestors generation.
- Reuse Lineland's ring drawing for a nested view of the diamond.
