# Conventions

## Visual system

Taken from the *Illustration Brief* for the Recapitulation plates, so the prototypes and the book read as one family.

| Token | Light | Dark | Meaning |
|---|---|---|---|
| ground | `#FAF7F0` | `#14130F` | book-paper ground |
| ink | `#141414` | `#ECE6D8` | primary construction; lives with living descendants |
| grey / fur | `#8C8C8C` / `#A7A294` | `#7F796D` / `#5E594F` | context, inference, lines that ended |
| accent (vermilion) | `#B03A2E` | `#E0634C` | only three meanings: the reader's own worldline, the present shell, and the sentence a figure exists to prove |

- **Type:** a humanist serif (EB Garamond) for text and labels, with small caps for labels; IBM Plex Mono for numbers.
- **No** gradients, glows, starfields or 3D gloss. Inference is drawn hatched or grey, never as record.
- **The present** is always outermost. **The inner shells are not smaller; they are farther.**

### Optional architectural family colors

The x86 pilot adds a categorical mode for architectural branches. Blue, ochre, teal and purple identify declared families; ink identifies mixed products. Hues stay stable within a dataset, with light/dark variants. Manufacturer and monochrome views are alternatives. Existing datasets retain their original system.

Selection preserves category hues, enlarges selected points and dims unrelated branches. Inferred marks remain grey even when selected. Development links are solid, transfers dotted, and composition links dashed. Transfer/composition links keep the contributing source family's color without blending. Vermilion remains the present boundary and reader worldline. Labels and evidence remain independent of color.

## Data

Lineage datasets use the v1 format in [`data-format.md`](data-format.md): nodes placed in space and time, and links saying what came from what. Check a file with `python3 tools/validate.py`.

## Commit messages

`<verb> <what> (roadmap #n)`, for example `Add Lineland ring-history toy (roadmap #1)`.
