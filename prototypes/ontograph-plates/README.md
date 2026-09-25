# Ontograph plates (roadmap #5)

Eight reference plates for the Ontograph, redrawn from the Ontograph notebook (Japan, 14 pp.) under the rules of *Instructions to SOL Ultra — Illustration Brief*. The Recapitulation's 29 plates have no Ontograph yet. These are candidates for that gap, and they are the plates the Ontograph navigator (#12) and the twelve links (#10) will build on.

| Plate | Title | Source drawings (Figure Register) |
|---|---|---|
| O-I | The Pinched Loop | ON-134, ON-133 (p. 1) |
| O-II | Foldings of Infinity | ON-153 (p. 8) |
| O-III | The Chain | ON-135, ON-136, ON-137 (p. 2) |
| O-IV | The Ontograph | ON-138 (p. 3) |
| O-V | One Thread, Seen From Different Sides | ON-145, ON-144 (p. 7) |
| O-VI | P-type and O-type | ON-151, ON-150, ON-148 (p. 8) |
| O-VII | Untie, Untwist, Unwind | ON-154, ON-155 (p. 9) |
| O-VIII | The Circle of Empathy | ON-182 (p. 14), ON-172 (p. 12) |

## Files

- `index.html`: the gallery. Each plate with its claim, source line, construction, ink, labels, forbid list and PROMPT.
- `plates/*.svg`: the plates themselves, at print size in points (square 432 × 432, portrait 432 × 540, landscape 540 × 360).
- `PLATES.md`: the Brief-style entries with PROMPT lines, to hand to an illustrator or an image model after the Brief's style block.
- `build.py`: writes all of the above from one source. Run `python3 build.py` after any change; there are no dependencies beyond Python 3.

## How the rules are kept

- **Glyphs are functions.** The Horizon, the chevron and the three line weights live in one place, so they are identical on every plate.
- **Nothing inside a Horizon.** Every Horizon punches a hole in a mask, so a line that reaches one stops at the dashes.
- **Computed curves.** The lemniscate (O-II), the limaçon family (O-VII: inner loop → cardioid → dimple → circle) and the rotating wire (O-V) are exact curves, not drawn approximations. Each station follows from the last.
- **Accent.** Vermilion marks only the “I” (as in Plate IX), a lifetime as the reader's own line (O-VI), the present (O-VIII), or the sentence a plate proves (O-II, O-V, O-VII). O-I has none.

## One design decision to confirm

The pinch point is drawn as the Brief's **Horizon**. On O-IV that leaves two Horizons: the first singularity at the shared pinch, and the “I” at the centre in vermilion. That makes the Ontograph a folded version of Plate X (*Stationed Between Two Horizons*), which is the link between the two instruments. Where a plate departs from its notebook drawing, the entry's *Redrawing* note says so and why.

## Still to do

- Rescan ON-134, ON-137 and ON-182 (flagged in the register) and check the plates against them.
- Candidates for a second set: the hierarchy of knowledge (ON-139), the breath as an O-type (ON-152), the three-pane interface (ON-141, the reference for #12), and the white-hole self (ON-146, for Plate IX).
