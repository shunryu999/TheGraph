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

## Data

Lineage datasets use the v1 format in [`data-format.md`](data-format.md): nodes placed in space and time, and links saying what came from what. Check a file with `python3 tools/validate.py`.

## Commit messages

`<verb> <what> (roadmap #n)`, for example `Add Lineland ring-history toy (roadmap #1)`.
