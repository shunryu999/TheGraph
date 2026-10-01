# x86 design families — pilot

Reviewed 1 October 2026. Eleven milestones and eight connections, November 2000–January 2023. The [source register](research-sources.json) supplies the URLs named below; the dataset also carries evidence on each node and link. This sample tests branching, feature transfer and hybrid composition, not a complete x86 phylogeny.

## Location method

Identify the exact architecture or product, then locate the responsible team through manufacturer technical papers or first-hand architect accounts. Paper-author affiliations establish a documented engineering contributor, not necessarily a lead site or exclusive origin. Record the role, evidence basis, geographic precision, source and other known contributors in `designLocation`. Keep the public milestone date separate from the source date. Reject headquarters, launch datelines, fabrication sites and geographic codenames as substitutes for design evidence.

Every plotted position is a city-scale anchor. Haifa (32.818, 34.989) and Austin (30.267, −97.743) use the existing [GeoNames register](../places/cities.json). Hillsboro (approximately 45.5229, −122.9898) uses [GeoNames 5731371](https://www.geonames.org/5731371/hillsboro.html). Coordinates are CC BY 4.0. Decimal storage precision does not imply a surveyed office. Colocated designs retain the same coordinates; the list and connected-design buttons allow selection when labels overlap.

| Entries | Location evidence | Limit |
|---|---|---|
| NetBurst / Pentium 4 | Hillsboro; Hinton et al., IEEE JSSC 36(11), 2001, author biographies (`netburst`) | Architecture/circuit team, not a fab. |
| Pentium M | Haifa; Intel Technology Journal 7(2), 2003, architecture-author biographies (`banias`) | Microarchitecture-definition team. |
| Yonah | Haifa; Intel Technology Journal 10(2), 2006, Core Duo authors (`yonah`) | Participating architecture/power-management team. |
| Core and Penryn | Haifa; Yoaz interview and design-history slide (`yoaz`) | Architecture anchor, not all implementation sites. |
| Golden Cove, Alder Lake, Sapphire Rapids | Haifa; Yoaz's core-team account (`yoaz`) | Products are anchored to their P-core contribution. |
| Gracemont | Austin; Yoaz's account of the separate efficiency-core team (`yoaz`) | Architecture-team anchor. |
| Zen | Austin; ISSCC 2017 program, paper 3.2, printed p. 15 (`zen_location`) | Author affiliations also include Fort Collins and Sunnyvale. |
| Zen 2 | Austin; ISSCC 2020 program, paper 2.1, printed p. 16 (`zen2_location`) | Also Markham. Paper 2.2 describes a separate chiplet contribution. |

The ISSCC documents are original conference programs hosted by mirrors. The architect interview includes an English transcript and an identified slide; editorial slide descriptions are distinguished from the spoken account. These sources do not establish that every part of a processor was designed in the plotted city.

## Public milestones

Dates identify the event named in `dateLabel`, not the beginning of internal development. `tEnd = t` makes each entry a milestone point without an invented production lifespan. The outer shell ends this historical sample in January 2023.

| Entry | Month and event | Date source key |
|---|---|---|
| NetBurst | November 2000, Pentium 4 introduction | `netburst_date` |
| Pentium M | March 2003, introduction | `banias` |
| Yonah | January 2006, Core Duo introduction | `yonah_date`, contemporary AP launch photographs |
| Core | March 2006, architecture unveiling | `core_date` |
| Penryn | November 2007, first family products | `penryn_date`, November 12 entry |
| Zen | March 2017, Ryzen launch | `zen_date` |
| Zen 2 | May 2019, public architecture/product announcement | `zen2` |
| Golden Cove / Gracemont | August 2021, detailed architecture disclosure | `hybrid` |
| Alder Lake | October 2021, desktop product introduction | `alder_date` |
| Sapphire Rapids | January 2023, Xeon launch | `sapphire_date` |

## Relationship and color rules

Solid links indicate documented design development; dotted links indicate feature transfer; dashed links indicate a core used in a product. Each has a source and a bounded claim. Pentium M → Core is conservatively a transfer of design approach; Pentium M → Yonah is development of the microarchitecture. NetBurst contributes features to Core. Golden Cove contributes to both client and server products, and Gracemont provides Alder Lake's other core architecture.

Colors are editorial navigation groups, not proof of strict monophyly. The mobile/Core/P-core grouping does not fill omitted generations with assumed edges. Shared x86 compatibility does not give AMD's Zen branch an invented Intel parent. Alder Lake has a neutral product marker and separately colored incoming contributions. Unknown relationships remain absent rather than appearing as established descent.

## Research inventory

The broader target remains about 30–40 representative designs. Candidates awaiting design-location and relationship evidence include early x86/P5/P6, AMD K-series/Bulldozer, earlier Atom designs and omitted Core generations. Include NexGen, Cyrix and Centaur/VIA transfers where the design history requires them. These candidates are unplaced: no headquarters coordinates have been assigned.

Expansion requires resolving conflicting locations, distinguishing author affiliation from direct team-location evidence, and sourcing each inheritance claim. Distributed products may eventually need multiple plotted anchors; this pilot keeps one qualified anchor and names the other documented places. Browser checks certify interaction, not historical truth. No publication text or images are redistributed. Compilation: all rights reserved until launch; sources retain their own rights.
