# Roadmap: Actionable Projects from the Archive

*Drawn from the Twigzistence Reader (through the Storyboarding and Ontograph notebooks), the Recapitulation, the Gleanings, the Illustration Brief, and the Notebook Intake Log. Compiled 22 Sept 2026.*

> **Current priority (25 Sept 2026):** building out the Stratasphere Viewer (#11) to MVP, with three new case studies: the spread of printing, SARS-CoV-2 variants and the Unix family. See [`stratasphere-viewer-roadmap.md`](stratasphere-viewer-roadmap.md).

Projects run from the lowest-hanging fruit down to the heavy lifts. Each one names the thread in the archive it comes from, what it produces, and what it needs first. Effort is a rough guess at focused work: **S** = a day or two, **M** = one to three weeks, **L** = one to three months, **XL** = a season or more, or a team.

## At a glance

| # | Project | Tier | Effort | Needs first |
|---|---|---|---|---|
| 1 | Lineland ring-history toy (1D automaton on nested rings) | Low | S | — |
| 2 | Genealogical diamond simulator | Low | S | — |
| 3 | Canonical lexicon with first-attestation dates | Low | S | — |
| 4 | Figure register of the notebook drawings | Low | S–M | high-res scans |
| 5 | Ontograph plates in the Illustration Brief style | Low | S–M | 3 |
| 6 | Essays from the notebooks (wells of attention, planetary/globular, Circle of Empathy) | Low | S each | — |
| 7 | Game of Life on the stratasphere | Low–Mid | M | 1 |
| 8 | Computer family tree on nested globes (IAS-machine lineage) | Low–Mid | M | 7 or 11 |
| 9 | Dimensional reduction chart, phonomeme → phenomeme | Mid | M | 3 |
| 10 | Twelve links mapped onto the Ontograph | Mid | M | 5 |
| 11 | Stratasphere viewer MVP (web) | Mid | M–L | 1, 7 |
| 12 | Ontograph navigator, three-pane interface | Mid | M | 5, 11 |
| 13 | Data blooms today: fork networks and edition lineages | Mid | M | 11 |
| 14 | Cultural layer spec: the vector burst | Mid | M | 9 |
| 15 | *Paradise Lost* edition lineage on the stratasphere | Mid–Heavy | M–L | 9, 11 |
| 16 | Real Earth shells from satellite archives | Mid–Heavy | L | 11 |
| 17 | Fossil nebula from the Paleobiology Database | Heavy | L | 11 |
| 18 | A. Hexagon teaching animation, storyboard revision → animatic | Heavy | L | 4, 7 |
| 19 | Illustrated Recapitulation (29 plates) | Heavy | L | 5 |
| 20 | Scholarly paper: faux-4D as a representational technique | Heavy | L | 11 + one real dataset |
| 21 | The full phylograph: Tree of Life twigzillated across 540 My | Heavy | XL | 11, 17 |
| 22 | Ancient-DNA human worldlines and the autophylograph | Heavy | XL | 21 |
| 23 | Memoir / talk series: "like transcribing his future" | Heavy | XL | intake complete |

---

## Tier 1: Low-hanging fruit

**1. Lineland ring-history toy.** *Thread: Storyboarding pp. 1–7 and 12–15; "Darwin's diagram is of Lineland, basically C.A. world lines!" (Ontograph p. 12).* A single web page. It runs a 1D cellular automaton (a Wolfram rule, or the Game of Line's four rules) on a *circular* Lineland and draws each generation as a ring, the present outermost, with log spacing inward. A slider controls the density gradient ("the user simply specifies a density gradient"). Cells that inherit from parents get connected, so lineages show up as worldlines. **Why first:** it's the whole method (nebulize → stratospherate → twigzillate) in about 200 lines of code, and it's the first shot of the teaching animation. **Output:** an interactive artifact.

**2. Genealogical diamond simulator.** *Thread: Storyboarding p. 10, "maximum network diameter."* A random-mating pedigree simulation that shows your ancestors diverging generation by generation, then collapsing onto shared ancestors. **Note a correction:** the notebook dates the convergence to 100,000–200,000 years ago, which is the range for mitochondrial Eve and Y-chromosomal Adam. Pedigree modelling (Rohde, Olson & Chang, *Nature* 2004) puts the most recent common *genealogical* ancestor of all living people only a few thousand years back. The "identical ancestors point", after which everyone alive then is either an ancestor of everyone now or of no one, falls somewhat earlier. That is a stronger and stranger result, and it's exactly the kind of thing the Graph makes visible. **Output:** a chart or animation, plus one paragraph for the Reader and Gleanings.

**3. Canonical lexicon with first-attestation dates.** *Thread: Lexicon (XIX); "The Vocabulary, in order of assembly" on the Notion home page.* Put every term in one table: first appearance (notebook, page, year), mature definition, and descendant in the design document. This fixes the vocabulary before the overall summary and settles open dating questions, such as when "stratasphere" first appeared (storyboard 2007–08 vs. the 2011 outline). **Output:** a sheet or database, which could be a Notion database.

**4. Figure register of the notebook drawings.** *Thread: Gleanings, "flagged for proper high-resolution scanning"; the storyboard's numbered Figs. 1–31.* Catalog every drawing: figure number, page, what it shows, and which lexicon term, Recapitulation proposition, and animation beat it serves. The storyboard already numbers its figures, so half the work is done. **Output:** a reference-art index for the animation and the illustrator.

**5. Ontograph plates in the Illustration Brief style.** *Thread: Ontograph notebook pp. 1–3, 7–9.* Clean vector versions under the SOL Ultra rules: three line weights, vermilion only for the reader. The set: the chained pinched loops; the nested form with "I"; the 0-6-8 rotation; O-type and P-type; the untie/untwist/unwind sequence; the Circle of Empathy. These may also become new plates for the Recapitulation, which currently has no Ontograph. **Output:** 6 to 8 plates plus prompts.

**6. Essays from the notebooks.** *Threads: Milton and "wells of attention" (2008, your later note: "good prediction of 2022"); planetary vs. globular; the Circle of Empathy; the Bug in the Rug.* Each is a short, self-contained Substack piece that draws on your AI-governance audience and seeds the book. **Output:** 3–4 drafts. As with other public-facing work, I'd send drafts for your approval before anything is posted.

## Tier 2: Middle weight

**7. Game of Life on the stratasphere.** *Thread: Storyboarding p. 33, "rapidly recognized by the general readership of science."* Run Conway's Life on a closed spherical grid, such as a geodesic or cube-sphere cell layout, so the world is a 2-sphere and the history nests as true shells rather than stacked squares. Add birth-lineage tracing: each new cell links to its three parents, which the Life rules supply for free. That produces fur, dead-end twigs, and blooms. Gliders become luminous worldlines threading the shells. **Why it matters:** it's a real, familiar dataset that behaves like evolution, and it tests the rendering conventions (translucence, log gradient, "you can't bump into yourself") on something anyone can check. **Output:** an interactive prototype, and short clips for talks.

**8. Computer family tree on nested globes.** *Thread: Storyboarding pp. 23–24, "computer graphing of computer spread is ideal."* The IAS machine (Princeton, 1952) is ideal. Its design was deliberately shared, and its well-documented descendants spread across the world: JOHNNIAC, MANIAC, ILLIAC, ORDVAC, SILLIAC, BESK, WEIZAC and others. Geocode each one, put it on shells for the 1940s through the 1970s, and connect design inheritance. It's a small, clean, fully sourced lineage and the first non-biological phylograph. **Output:** a dataset and a rendered stratasphere.

**9. Dimensional reduction chart, phonomeme → phenomeme.** *Threads: VI "descent of dimensions" (3D idols → 2D images → 1D text → 0D binary); the thesis's memevolution; Storyboarding p. 68 (psychomeme → phonomeme → phenomeme, "fidelity decreases, longevity increases").* Build a chart or timeline in two parts:
- **(a) The conceptual map.** Each medium placed by encoding dimension, date of emergence, copying fidelity, and expected longevity, with the Graph's nested codes (8-bit, 4-bit, 2-bit) alongside.
- **(b) A worked transduction.** One text followed from voice to manuscript to print to digital, with each step's losses and gains.

It turns the memetics into something testable and is the conceptual groundwork for the cultural layer. **Output:** a chart plus a short essay.

**10. The twelve links mapped onto the Ontograph.** *Thread: pinned in the 2026 vision note and on the Notion home page; the Ontograph's chain of conditioned levels ending in "I am."* Set the twelve links (*paṭiccasamuppāda*) beside the Ontograph's pinched loops and the untie sequence, and note where they match, where they don't, and what each tradition shows the other. This fits naturally with *The Jeweled Mirror*. **Output:** an essay section and a plate.

**11. Stratasphere viewer MVP.** *Threads: the whole of §5 of the Recapitulation; the design document.* A web viewer (WebGL/Three.js), so it can be shared and published as an artifact:
- nested translucent shells with a log gradient slider;
- in/out travel ("to travel in time, move in space");
- hatching on inference shells;
- worldlines, with the reader's worldline in vermilion;
- a level-of-detail "fur";
- a simple data format of timestep plus worldline.

Projects 1, 7 and 8 become its first datasets. **This is the hinge.** Most projects after this one plug into it. **Output:** a working prototype and the data spec for the design document.

**12. Ontograph navigator, the three-pane interface.** *Thread: Ontograph p. 5.* Put the Phylograph, the Ontograph and a 3D view side by side. Picking a level on the Ontograph (Life, say) shrinks the Phylograph to that stretch of time and brings it forward. Highlighting an inner shell on the Phylograph expands it to full-globe size. This is where the two instruments first work together. **Output:** a module on top of 11.

**13. Data blooms today.** *Thread: Storyboarding p. 38, pirated files as fieldwork.* The 2008 idea has cleaner modern stand-ins with open, time-stamped heredity data:
- GitHub fork networks, which are literal directed graphs of heredity with dates;
- Wikipedia article language editions, with creation dates;
- a documented internet meme and its variants.

Take one, geolocate what you can, and render it as a bloom on the stratasphere. **Output:** one case study, and an A2A memetics paper seed.

**14. Cultural layer spec: the vector burst.** *Thread: Storyboarding pp. 61–69.* Write the section the design document lacks:
- the organism-centered cultural stratasphere, with house and tool directions;
- newest technology nearest and extinct technology gone, so that proximity shows use and supplanting is visible;
- blending as shared material contribution;
- the two linked views (organism ↔ whole Earth), with highlight-to-map navigation;
- the extended phenotype drawn as continuous descent.

Prototype it with the tool lineage from stone to computers and the energy-methods vector. **Output:** a design document section and a mock-up.

## Tier 3: Heavy lifts

**15. *Paradise Lost* edition lineage.** *Thread: Storyboarding p. 68, "each printing considered a new memome."* Gather the edition history from 1667 to digital from bibliographic catalogues, with place, printer, date and textual basis (which edition was copied from which). Render it as a lineage on the stratasphere with the psycho → phono → pheno stages marked. It is the flagship cultural case study and the concrete test of project 9. **Output:** a dataset, a render and an essay. Chaucer's printing lineage (from the Gleanings) is the alternative.

**16. Real Earth shells from satellite archives.** *Thread: the Red Notebook's "Google Earth shunted inward"; Storyboarding p. 42, the Earth as a 4-variable matrix.* Build annual global composites from the long satellite record (Landsat from the 1970s–80s onward) and nest them as real shells. Real present-day geography goes in the outermost shells, before any deep-time inference. **Output:** a demonstration of the actual Earth as a stratasphere across roughly 40 years.

**17. Fossil nebula from the Paleobiology Database.** *Thread: the 2011 outline's "every fossil in every museum."* The Paleobiology Database provides fossil occurrences with ages and reconstructed paleocoordinates, which is nebulization with real, public data. Plate-reconstruction tools such as GPlates can supply the continents for each shell. **Output:** the first deep-time stratasphere, with fossils placed where they lay when alive.

**18. A. Hexagon teaching animation, storyboard to animatic.** *Threads: the storyboard notebook; A Work in Progress; the Peewee's Big Adventure flattening gag (Gleanings).* Fold the new material into the script:
- A. Pentagon and the Line-to-Circle series;
- Bandland;
- the Flatland Camera;
- Circle Hinton as sensei;
- the laser pulled toward the past;
- the black-hole opening ("the rubber sheet is Flatland").

Then build an animatic from projects 1 and 7. **Output:** a revised script and an animatic in Blender or Maya.

**19. Illustrated Recapitulation.** The 29 plates are already specified in the Illustration Brief. Commission or generate them, add the Ontograph plates from project 5, and lay out the book. **Output:** a print-ready edition.

**20. Scholarly paper on faux-4D.** Frame it with Latour's *Drawing Things Together*, the Renaissance perspective analogy, and the focus+context literature, and demonstrate it on one real dataset (from 8, 13 or 17). Venues: an information-visualization conference, *Leonardo*, or an STS journal. This gives the project academic standing and ties it to your STS credentials. **Output:** a paper.

**21. The full phylograph.** Twigzillate the Tree of Life across the Phanerozoic, drawing on:
- a synthetic phylogeny (the Open Tree of Life);
- divergence dates (TimeTree);
- fossil occurrences and paleogeography (from 17).

Add the fur by level of detail, with the Cambrian as "an emptiness before a flowering." **Output:** the instrument itself, in first form.

**22. Ancient-DNA human worldlines and the autophylograph.** Place published, dated, geolocated ancient genomes on the last ~50,000 years of shells, then let a viewer find their own line through haplogroup or ancestry data. Privacy and consent need to be designed in from the start. **Output:** the Graph's human layer and Sequence 8, "Looking At Ourselves", in working form.

**23. Memoir / talk series: "like transcribing his future."** It's pinned by you, and the source material is in the Gleanings: B and the porch, the recovery years, the coffeehouse. It's best started once notebook intake is complete, so it can follow the whole arc. **Output:** an outline, then episodes or chapters.

---

## Suggested first moves

1. **Project 1 this week.** It's small, it proves the method visually, and it becomes the seed code for 7 and 11.
2. **Projects 3 and 4 alongside the remaining notebook intake.** The lexicon and figure register feed the overall summary directly.
3. **Project 7, then 11.** Once Life runs on a real spherical shell stack, the viewer can be generalized from working code.
4. **Project 9 as the conceptual bet.** It is the most original intellectual contribution on the list and has the shortest path to a publishable piece (via 6 and 15).

*Open question carried from the Intake Log: whether the Ontograph notebook predates the 23 Oct 2011 outline. This affects how projects 10 and 12 are framed historically.*
