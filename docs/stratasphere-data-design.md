# Stratasphere design document: data specification

This section describes the data boundary of the roadmap #11 instrument. The normative field reference and worked CSV conversion are in [Lineage data format, v1](data-format.md). The viewer consumes that format without a dataset-specific code change.

## What a dataset represents

A dataset is a bounded account of things placed in space and time, with directed relationships between them. It is not a complete history. Its title, description, time span, sources, caveats and licence define the scope. Nodes have stable ids, names, geographic coordinates and start dates; they may also have ending dates, categories, notes and citations. Links identify their two endpoints and the kind of relationship claimed.

All positions use WGS 84 latitude and longitude. These locate a record on each temporal shell; they do not imply that an uncertain event happened at a precisely known point. The present is the dataset's `meta.tEnd`, which may be a historical cutoff rather than today's date. An absent node ending date extends its line to that cutoff; it is not proof of uninterrupted survival.

## Time and display

One unit applies throughout a file: numeric years, ISO months, ISO days, or numeric years before present (BP, referenced to 1950). The viewer converts dates to internal decimal values for ordering and projection. For BP it uses negative ages as an ordering coordinate, not a calendar-year conversion. Display radius encodes time, with the newest shell outermost; the density gradient changes spacing, not dates or relationships. Shell size is a projection choice, not the physical size of the Earth in the past.

The file remains the source of truth. Display coordinates and selection state are derived at runtime and never written back into the data. The current day conversion uses a 365.25-day approximation and does not round-trip every leap-day boundary exactly; this is a known limit before adding a dataset that requires daily precision.

## Relationships and uncertainty

The graph permits several parents per child and requires acyclic links. Standard link kinds distinguish descent, copying, training, code inheritance, influence and merges. Dataset captions explain these kinds at the point of use. A backward date on an influence link can be meaningful; other child-before-parent dates produce validator warnings for review.

Node provenance is `record`, `inferred` or `detected`. Detection locates the first known observation, not necessarily an origin. A relationship has its own independent `inferred` flag, and `meta.inferredSpans` declares reconstructed intervals. These distinctions must survive both the visual key and the text account. In the current renderer, a selected lineage takes the vermilion highlight even over inferred segments; readers should clear selection to inspect the grey encoding and read the card's inference notes. Highlighting alone is not evidence status.

The format currently has one combined node provenance field, not separate confidence values for date and place. Notes and citations must explain partial uncertainty; the format does not express probability distributions or competing temporal intervals. New uncertainty requirements should be specified explicitly before expanding the schema.

## Distribution and reproduction

Each published dataset has one JSON file under `data/` and a companion `SOURCE.md` with retrieval dates, licence, omissions and reconstruction decisions. Generated datasets keep their generator and pinned upstream inputs. The catalog supplies stable ids, paths and reader-facing descriptions; it does not duplicate the dataset. Git commits identify the exact data revision.

The viewer fetches the catalog and selected JSON through ordinary static HTTP. It also embeds an IAS fallback. That fallback supplies data when catalog access fails, but a fresh offline browser still needs the externally hosted rendering libraries cached or supplied locally. A full offline distribution is not part of M5.

Permalinks carry dataset id, selected node and time. They do not pin a Git revision, camera angle, density gradient or influence-filter state, so they reproduce a lineage and moment against the currently published data rather than an immutable image. Local JSON imports are not uploaded. The reader's chosen location is neither stored nor added to links. The tour stores only a local completed/skipped preference.

## Admission and checks

Before publication, a contributor converts the source to v1, supplies citations and scope notes, validates the JSON and catalog, and opens the dataset in the viewer. The validator checks ids, coordinates, units, date bounds, endpoints, cycles and known or captioned relationships. It does not establish historical or scientific truth, source rights, or the quality of catalog prose.

Continuous integration runs Python validation and Chromium smoke tests. Browser tests load every catalog entry, compare expected headings and record counts, check visible names and nonblank canvas pixels, exercise selection and shared links, and cover the guided tour. They use the same pinned three.js version locally so CDN availability does not determine the result. This does not establish real-GPU performance or Safari export compatibility.

The printing dataset's ISTC verification and per-node citations, the Unix comparison against Lévénez, real-GPU performance, and Safari export remain follow-up work. Completing the M5 interface and checks does not certify those outstanding claims or platforms.
