# The spread of printing, 1454–1500 (viewer roadmap M1)

Fifty-seven towns and fifty-six links: the first press in each town, placed where and when it began, and linked to where its printer came from. It covers the major centres and the first press in each country, not every town that printed before 1501; there were roughly 250.

## Sources

- The **Incunabula Short Title Catalogue** (ISTC), British Library and CERL, for printers, places and first dated editions.
- L. Febvre and H.-J. Martin, *The Coming of the Book* (1958; English translation 1976), the standard account of how printing spread.
- *Encyclopaedia Britannica* (1911), "Incunabula", which lists towns with their first printers and dates (public domain).
- Individual dates and printers cross-checked by web search on 25 September 2026, against: the Swiss National Museum and Beromünster (Helias Helye, 1470); Utrecht University Special Collections (Ketelaer and de Leempt, 1473); the Bibliothèque municipale de Lyon and Cambridge University Library (Le Roy, 1473); Angers and Toulouse municipal and university sources (1476); KU Leuven (Johannes de Westfalia, Aalst and Leuven); the Conference of European National Librarians and the Buda Chronicle literature (Andreas Hess, 1473, from Georg Lauer's shop in Rome); Segovia sources on Johannes Párix and the Sinodal de Aguilafuente (1472); the Faro Pentateuch (1487); the Cetinje Octoechos and Hieromonk Makarije (1494); Danish and Swedish biographical dictionaries on Johann Snell (Odense 1482, Stockholm 1483); and Oxford University Press histories on Theoderic Rood (1478).

**Not yet done:** a line-by-line check of every date and printer against the ISTC itself. The ISTC, Wikipedia and Wikisource could not be reached from the environment this was built in. Until that check is done, treat single dates as good to about a year.

## How it was built

- **Dates** are the year of the first dated or securely datable print in the town. Where a start a year earlier is claimed (Basel 1467, Milan 1469, Valencia 1473, Toulouse 1475), the note says so.
- **Places** are the town (the Sorbonne for Paris), not the individual shop.
- **Links** say where the printer came from, in one of four kinds (captioned in the file):
  - `training`: the printer learned the craft there
  - `copy`: type or method taken from there (Bamberg and Eltville, printing with type from Gutenberg's shop)
  - `move`: the same printer moved on (Subiaco → Rome, Bruges → Westminster, Aalst → Leuven, Odense → Stockholm)
  - `influence`: shaped by, without training or type (Florence, where Cennini is said to have worked out the method himself)
- **Record and inference.** A link is *record* only where the move or training is documented: 13 of 56. The other 43 are *inferred*. They join a town to the nearest earlier press on a plausible route (by the printer's origin, language or region), are drawn grey, and are placeholders for the check above. Correcting them is the most useful next step for this dataset.

## Licence

The compilation (which towns, dates, places and links) is released under CC BY 4.0. The notes are original.

Corrections are welcome. Edit the JSON and run `python3 tools/validate.py --catalog data/catalog.json`.
