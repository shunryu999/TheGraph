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

## Data (draft)

Every prototype should be able to read the same two things:

- **timestep**: `{ t, label, cells|points: [...], provenance, inferred: bool }`
- **worldline link**: `{ from: {t, id}, to: {t, id}, kind: "persist" | "birth" | "copy" | "descent" }`

This will be firmed up for the stratasphere viewer (roadmap #11).

## Commit messages

`<verb> <what> (roadmap #n)`, for example `Add Lineland ring-history toy (roadmap #1)`.
