# The Unix family, 1970–2026 (viewer roadmap M3)

Twenty-seven systems and thirty-five links: the operating systems descended from, or shaped by, the Unix of Bell Labs. Each is placed where it was made and dated from its first release, and each link says what passed between them.

## Sources

- **The Unix History Repository**, D. Spinellis ([`dspinellis/unix-history-make`](https://github.com/dspinellis/unix-history-make), `releases.md`, commit `464f1df`, January 2026; Apache 2.0). This is the documented backbone: the Research editions from the PDP-7 version (mid-1970) to the Seventh Edition, 32V (Holmdel, 1978), the Berkeley distributions from 1BSD (early 1978) to 4.4BSD-Lite Release 2 (June 1995, the last before the CSRG was disbanded), 386BSD (March 1992) and the FreeBSD Project (early 1993), with how each derives from the last.
- **Everything else** was checked by web search on 25 September 2026, and each node carries its own `sources`. The checks included Apple's announcement of Darwin 1.0 (5 April 2000); System V Release 4's source release at Unix Expo (November 1989); SunOS 4.1.4 (November 1994) as the last SunOS; 386BSD 1.0 (late 1994) as its last release; Sun's founding in Santa Clara (February 1982); NeXT's headquarters in Redwood City and NeXTSTEP's introduction (1989); and AIX's first release on the IBM RT PC (1986).

Éric Lévénez's Unix history chart, the fullest reference, could not be reached from the build environment. A pass against it would add the many systems left out (HP-UX, IRIX, Ultrix, Tru64, the Linux distributions and others) and check the dates here.

## How it was built

- **Nodes are systems, not releases.** Each is dated from its first release. Where its own line of development stopped, it has an end (`tEnd`): Research Unix (1990, the Tenth Edition manual), BSD at Berkeley (1995), 386BSD (1994), SunOS (1994), NeXTSTEP and OPENSTEP (1997, when Apple bought NeXT) and OpenSolaris (2010). The code lives on in the descendants; the end marks the line itself.
- **Places** are where a system was made. They are marked inference where the project was distributed (FreeBSD, NetBSD and illumos, drawn at the place of the project they came from), or where only the company is known (System III, System V and System V Release 4 at AT&T in New Jersey; AIX at IBM, whose Austin origin was not confirmed).
- **Three kinds of link:**
  - `code`: source code carried over (for example Research Unix → BSD, BSD → SunOS, Darwin → iPhone OS)
  - `influence`: shaped by it, with no code shared (Research Unix → MINIX, GNU and Plan 9; MINIX and GNU → Linux). These are drawn faint, and the viewer can leave them out of a trace.
  - `merge`: one of several lines combined (System V + BSD + SunOS + Xenix → System V Release 4; Mach + BSD → NeXTSTEP; NeXTSTEP + FreeBSD → Darwin)
- **Notes on links** give the specific release where it matters: 1BSD was additions to the Sixth Edition; 3BSD extended 32V; FreeBSD was rebased on 4.4BSD-Lite Release 2 after the USL settlement.

## Licence

The compilation is released under CC BY 4.0. The notes are original; `releases.md` in the Unix History Repository is Apache 2.0.
