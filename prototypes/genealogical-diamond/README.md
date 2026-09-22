# Genealogical diamond (roadmap #2)

A random-mating pedigree simulation. Your ancestors double each generation back, overlap more and more, then collapse onto shared ancestors: the storyboard's "maximum network diameter" (Storyboarding notebook, p. 10).

## Correction to carry into the Reader

The notebook dates the convergence to about 100,000–200,000 years ago. That is the range for mitochondrial Eve and Y-chromosomal Adam, who are single-locus ancestors. Pedigree modelling (Rohde, Olson & Chang, *Nature*, 2004) puts the most recent common *genealogical* ancestor of all living people only a few thousand years back, with the "identical ancestors point" somewhat earlier.

## What the first version does

- Each generation has N people (64–512). Each person gets two parents drawn at random, optionally from 2, 4 or 8 separate communities with a set rate of marriage between them.
- Rows view or rings view. Your ancestors are in vermilion, ancestors of everyone alive now are ringed in ink, and people with no living descendants are faint. Click anyone in the present row to make them "you".
- A chart compares the naive 2^g ancestor slots with your distinct ancestors and with the count of ancestors of everyone.
- **Partner mode.** Add a second person and watch two cones widen until they meet on the ancestors you share. This is the literal diamond of the storyboard, with the generation of your first shared ancestor.
- It finds the most recent common ancestor of all and the identical ancestors point, and compares both with Chang's theory (log₂N and 1.77·log₂N).

## Original plan

- Population N, generations G, simple mating structure, with an optional migration parameter between demes.
- Plot distinct ancestors per generation against the naive 2^g curve. The gap is pedigree collapse.
- Mark the MRCA generation and the identical-ancestors generation.
- Reuse Lineland's ring drawing for a nested view of the diamond.
