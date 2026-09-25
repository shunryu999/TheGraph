"""Build the Ontograph plates (roadmap #5).

Writes one standalone SVG per plate into plates/, the gallery page index.html,
and PLATES.md (the Illustration Brief entries and PROMPT lines). Every glyph is
drawn by one function below, so it is identical on every plate, as the Brief
requires.

    python3 build.py
"""
import math
import html
from pathlib import Path

HERE = Path(__file__).parent

# ---- The visual system (Illustration Brief, section 1) ----------------------

GROUND, INK, GREY, RED = "#FAF7F0", "#141414", "#8C8C8C", "#B03A2E"
SUBJECT, SECONDARY, HAIR = 1.2, 0.6, 0.25          # the three line weights, pt
FORMATS = {"square": (432, 432), "portrait": (432, 540), "landscape": (540, 360)}

HORIZON_R = 6.0        # every Horizon is this size
HORIZON_DASH = "1.6 1.5"
READER_R, READER_TICK = 2.6, 4.2
SERIF = "'EB Garamond', 'Iowan Old Style', Palatino, Georgia, serif"
FONT_IMPORT = ("@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:"
               "ital,wght@0,400;1,400&amp;display=swap');")


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


class Plate:
    def __init__(self, fmt):
        self.w, self.h = FORMATS[fmt]
        self.fmt = fmt
        self.body = []
        self.holes = []      # (x, y, r): nothing is drawn inside a Horizon

    # primitives
    def path(self, d, w=SECONDARY, color=INK, dash=None, masked=True, cap="round"):
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        m = ' mask="url(#h)"' if masked else ""
        self.body.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}"'
                         f' stroke-linecap="{cap}" stroke-linejoin="round"{extra}{m}/>')

    def line(self, x1, y1, x2, y2, **kw):
        self.path(f"M{f(x1)} {f(y1)}L{f(x2)} {f(y2)}", **kw)

    def poly(self, pts, closed=False, **kw):
        d = "M" + "L".join(f"{f(x)} {f(y)}" for x, y in pts) + ("Z" if closed else "")
        self.path(d, **kw)

    def dot(self, x, y, r=1.8, color=INK):
        self.body.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{r}" fill="{color}"/>')

    def text(self, x, y, s, kind="caps", anchor="middle", color=INK, size=None):
        s = html.escape(s)
        if kind == "caps":
            style = ("font-variant-caps:all-small-caps;letter-spacing:.12em;"
                     f"font-size:{size or 9.5}px")
        elif kind == "italic":
            style = f"font-style:italic;font-size:{size or 8.5}px"
        else:  # lining figures
            style = f"font-variant-numeric:lining-nums;font-size:{size or 8}px"
        self.body.append(f'<text x="{f(x)}" y="{f(y)}" text-anchor="{anchor}" fill="{color}"'
                         f' style="{style}">{s}</text>')

    # the recurring glyphs (Brief, section 2)
    def horizon(self, x, y, color=INK):
        self.holes.append((x, y, HORIZON_R + 1.8))
        self.body.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{HORIZON_R}" fill="none"'
                         f' stroke="{color}" stroke-width="{SECONDARY}"'
                         f' stroke-dasharray="{HORIZON_DASH}"/>')

    def reader(self, x, y, color=RED):
        self.body.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{READER_R}" fill="none"'
                         f' stroke="{color}" stroke-width="{SUBJECT}"/>')
        self.line(x, y + READER_R, x, y + READER_R + READER_TICK, w=SUBJECT, color=color,
                  masked=False)

    def chevron(self, x, y, angle, color=INK):
        """A small open chevron pointing along `angle` (radians, screen axes)."""
        s = 3.2
        pts = []
        for da in (math.pi * 0.8, -math.pi * 0.8):
            pts.append((x + s * math.cos(angle + da), y + s * math.sin(angle + da)))
        self.poly([pts[0], (x, y), pts[1]], w=SECONDARY, color=color, masked=False)

    def svg(self, standalone=True):
        mask = ""
        if self.holes:
            circles = "".join(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="#000"/>'
                              for x, y, r in self.holes)
            mask = (f'<mask id="h" maskUnits="userSpaceOnUse" x="0" y="0" width="{self.w}"'
                    f' height="{self.h}"><rect width="{self.w}" height="{self.h}" fill="#fff"/>'
                    f'{circles}</mask>')
        style = f"<style>{FONT_IMPORT if standalone else ''}text{{font-family:{SERIF}}}</style>"
        head = ('<svg xmlns="http://www.w3.org/2000/svg"' if standalone else '<svg')
        body = "\n".join(self.body)
        if not self.holes:
            body = body.replace(' mask="url(#h)"', "")
        return (f'{head} viewBox="0 0 {self.w} {self.h}" width="{self.w}pt" height="{self.h}pt"'
                f' role="img">{style}<defs>{mask}</defs>'
                f'<rect width="{self.w}" height="{self.h}" fill="{GROUND}"/>\n{body}\n</svg>')


# ---- Geometry ---------------------------------------------------------------

def pinched_loop(px, py, h, w, tail=0.0, up=True):
    """A loop that crosses itself at its pinch point P, the tangents at P lying on
    the two 45-degree lines, so loops sharing a pinch nest without crossing.
    Returns SVG path data. `tail` extends both strands past P."""
    s = -1 if up else 1
    k = 0.62 * h
    d = ""
    if tail:
        d += f"M{f(px + tail)} {f(py - s * tail)}L{f(px)} {f(py)}"
    else:
        d += f"M{f(px)} {f(py)}"
    d += (f"C{f(px - k * .72)} {f(py + s * k * .72)} {f(px - w)} {f(py + s * h)} {f(px)} {f(py + s * h)}"
          f"C{f(px + w)} {f(py + s * h)} {f(px + k * .72)} {f(py + s * k * .72)} {f(px)} {f(py)}")
    if tail:
        d += f"L{f(px - tail)} {f(py - s * tail)}"
    return d


def lemniscate(n=240):
    """Bernoulli lemniscate, crossing at the origin, lobes along +/-y, unit half-length.
    Returns (upper_lobe, lower_lobe) as point lists running through the origin."""
    up, lo = [], []
    for i in range(n + 1):
        t = -math.pi / 2 + math.pi * i / n          # right lobe of the standard curve
        den = 1 + math.sin(t) ** 2
        x, y = math.cos(t) / den, math.sin(t) * math.cos(t) / den
        up.append((y, -x))                            # rotate: lobe points up
        lo.append((-y, x))
    return up, lo


def limacon(k, n=360):
    """r = b + a cos(theta) with a = k, b = 1 - k, rotated so the loop points up and
    the (possible) crossing sits at the bottom. k > .5: inner loop; k = .5: cardioid
    (the knot pulled to a cusp); .5 > k > 1/3: dimpled; k = 0: a circle."""
    a, b = k, 1 - k
    pts = []
    for i in range(n + 1):
        th = 2 * math.pi * i / n
        r = b + a * math.cos(th)
        x, y = r * math.cos(th), r * math.sin(th)
        pts.append((y, -x))
    return pts


def fit(pts, cx, cy, height):
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    s = height / (max(ys) - min(ys))
    mx, my = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2
    return [(cx + (x - mx) * s, cy + (y - my) * s) for x, y in pts]


# ---- The plates -------------------------------------------------------------

def plate_1():
    """O-I The Pinched Loop (ON-133, ON-134)."""
    p = Plate("landscape")
    px, py, h = 270, 238, 150
    p.line(70, py, 470, py, w=HAIR, masked=False)
    p.text(470, py - 6, "the plane of the page", anchor="end")
    p.path(pinched_loop(px, py, h, 92), w=SUBJECT)
    # the two strands cross at P and run out to infinity on either side
    for s in (-1, 1):
        p.path(f"M{f(px)} {f(py)}C{f(px + s * 16)} {f(py + 16)} {f(px + s * 48)} {f(py + 28)}"
               f" {f(px + s * 82)} {f(py + 28)}L{f(px + s * 178)} {f(py + 28)}", w=SUBJECT)
    p.text(px - 184, py + 31, "infinity", anchor="end")
    p.text(px + 184, py + 31, "infinity", anchor="start")
    p.horizon(px, py)
    p.text(px, py + 50, "singularity")
    p.chevron(px, py - h, math.pi)
    p.text(px, py - h - 9, "the flow of time", kind="italic")
    return p


def plate_2():
    """O-II Foldings of Infinity (ON-153)."""
    p = Plate("landscape")
    cy, half = 190, 72
    up, lo = lemniscate()
    xs = (110, 270, 430)
    for i, cx in enumerate(xs):
        if i == 0:
            upper, lower = up, lo
        elif i == 1:
            upper, lower = up, [(x * .5, y * .5) for x, y in lo]
        else:
            upper, lower = up, [(x * .5, -y * .5) for x, y in lo]   # folded up inside
        for lobe in (upper, lower):
            p.poly([(cx + x * half, cy + y * half) for x, y in lobe], w=SUBJECT, masked=False)
        if i == 2:
            # where the folded lobe used to run: the lines go on, off the page
            for s in (-1, 1):
                p.line(cx, cy, cx + s * 60, cy + 60, w=HAIR, dash="0.4 2.2", masked=False)
    labels = ("a figure of infinity", "one lobe drawn in", "folded")
    for cx, s in zip(xs, labels):
        p.text(cx, 292, s)
    p.text(270, 318, "the inner domain is as large as the outer", color=RED)
    return p


def plate_3():
    """O-III The Chain (ON-135, ON-136, ON-137)."""
    p = Plate("landscape")
    py, h, w = 250, 158, 62
    names = ("energy", "matter", "life")
    inner = ("matter condenses", "life happens", "mind occurs")
    pinch = ("quantum", "replication “singularity”", "“I”")
    for i, cx in enumerate((120, 270, 420)):
        p.path(pinched_loop(px := cx, py, h, w, tail=13), w=SUBJECT)
        p.path(pinched_loop(px, py, 50, 21), w=SECONDARY)
        p.horizon(cx, py, color=RED if i == 2 else INK)
        p.text(cx, py - h + 26, names[i])
        p.text(cx, py - 58, inner[i], kind="italic")
        p.text(cx, py + 26, pinch[i])
        p.chevron(cx, py - h, math.pi)
    for x in (195, 345):
        p.line(x, 70, x, 300, w=HAIR, masked=False)
    return p


def plate_4():
    """O-IV The Ontograph (ON-138)."""
    p = Plate("square")
    px, py = 216, 352
    loops = (("energy", 272, 152), ("matter", 206, 114), ("life", 146, 80), ("mind", 92, 50))
    for i, (name, h, w) in enumerate(loops):
        tail = 84 if i == 0 else 0
        p.path(pinched_loop(px, py, h, w, tail=tail), w=SUBJECT if i == 0 else SECONDARY,
               masked=False)
        top = py - h
        nxt = loops[i + 1][1] if i + 1 < len(loops) else 60
        p.text(px, top + (h - nxt) / 2 + 4, name)
    # the "I": a Horizon in the shape of the innermost loop, enclosing nothing
    p.path(pinched_loop(px, py, 44, 24), w=SECONDARY, color=RED, dash=HORIZON_DASH,
           masked=False)
    p.text(px, py - 50, "“I”", kind="italic", size=10)
    p.chevron(px, py - 272, math.pi)
    p.text(px, py - 272 - 9, "the flow of time, of energy", kind="italic")
    p.text(px - 94, py + 64, "infinity", anchor="end")
    p.text(px + 94, py + 64, "infinity", anchor="start")
    return p


def plate_5():
    """O-V One Thread, Seen From Different Sides (ON-144, ON-145)."""
    p = Plate("landscape")
    R, r, gamma = 38, 24, math.radians(10)
    cy = 196

    def project(pts3, alpha):
        out = []
        for x, y, z in pts3:
            y1, z1 = y * math.cos(alpha) - z * math.sin(alpha), y * math.sin(alpha) + z * math.cos(alpha)
            x2 = x * math.cos(gamma) + z1 * math.sin(gamma)
            out.append((x2, y1))
        return out

    n = 180
    outer = [(R * math.sin(t), R - R * math.cos(t), 0) for t in
             (2 * math.pi * i / n for i in range(n + 1))]
    # the inner loop: same thread, through the same point, in a plane turned 90 degrees
    inner = [(r * math.sin(t), 0, r - r * math.cos(t)) for t in
             (2 * math.pi * i / n for i in range(n + 1))]
    stations = (-40, -20, 0, 22, 44)
    xs = (86, 178, 270, 362, 454)
    for cx, a in zip(xs, stations):
        al = math.radians(a)
        for loop in (outer, inner):
            p.poly([(cx + x, cy - y) for x, y in project(loop, al)], w=SUBJECT, masked=False)
    p.text(xs[-1] + R + 6, cy - 34, "Self", kind="italic", anchor="start")
    p.text(xs[-1] + r + 8, cy + 20, "self", kind="italic", anchor="start")
    p.text(270, 290, "one thread, seen from different sides", color=RED)
    return p


def plate_6():
    """O-VI P-type and O-type (ON-151, ON-150, ON-148)."""
    p = Plate("landscape")
    # P-type: one lifetime, birth and death at the same pinch
    px, py, h, w = 135, 250, 160, 78
    p.path(pinched_loop(px, py, h, w, tail=13), w=SUBJECT, color=RED)
    p.horizon(px, py)
    p.chevron(px, py - h, 0, color=RED)
    p.text(px, py + 26, "birth · death")
    p.text(px - 58, py - 40, "infancy", kind="italic", anchor="end")
    p.text(px + 58, py - 40, "senility", kind="italic", anchor="start")
    p.text(px, 318, "p-type: a lineage in time")
    p.line(270, 70, 270, 300, w=HAIR, masked=False)
    # O-type: a community in the present, each life a loop pinched on the shared ring
    cx, cy, ring, n = 405, 180, 34, 9
    p.path(f"M{cx - ring} {cy}a{ring} {ring} 0 1 0 {2 * ring} 0a{ring} {ring} 0 1 0 {-2 * ring} 0",
           w=HAIR, masked=False)
    for i in range(n):
        th = -math.pi / 2 + 2 * math.pi * i / n
        x, y = cx + ring * math.cos(th), cy + ring * math.sin(th)
        rot = math.degrees(th) + 90
        p.body.append(f'<g transform="rotate({f(rot)} {f(x)} {f(y)})">')
        p.path(pinched_loop(x, y, 34, 14), w=SECONDARY, masked=False)
        p.body.append("</g>")
        # exchange: a short arc between neighbours, at the loops' waist
        a0, a1 = th + 0.27, th + 2 * math.pi / n - 0.27
        rr = ring + 20
        p.path(f"M{f(cx + rr * math.cos(a0))} {f(cy + rr * math.sin(a0))}"
               f"A{rr} {rr} 0 0 1 {f(cx + rr * math.cos(a1))} {f(cy + rr * math.sin(a1))}",
               w=HAIR, masked=False)
    p.text(cx + 66, cy - 66, "exchange", kind="italic", anchor="start")
    p.text(cx, 318, "o-type: a community in the present")
    return p


def plate_7():
    """O-VII Untie, Untwist, Unwind (ON-154, ON-155)."""
    p = Plate("landscape")
    ks = (0.84, 0.7, 0.6, 0.5, 0.42, 0.3, 0.15, 0.0)
    xs = (105, 215, 325, 435)
    for i, k in enumerate(ks):
        cx, cy = xs[i % 4], (118 if i < 4 else 240)
        last = i == len(ks) - 1
        pts = fit(limacon(k), cx, cy, 70)
        p.poly(pts, w=SUBJECT, color=RED if last else INK, masked=False)
        if last:
            p.chevron(cx, cy - 35, math.pi, color=RED)
            p.chevron(cx, cy + 35, 0, color=RED)
        p.text(cx, cy + 56, str(i + 1), kind="fig", color=GREY)
    p.text(270, 330, "untie · untwist · unwind")
    return p


def plate_8():
    """O-VIII The Circle of Empathy (ON-182, ON-172)."""
    p = Plate("portrait")
    top, cx, cyC = 118, 216, 418
    ax, bx = 138, 294
    p.line(66, top, 366, top, w=HAIR, masked=False)
    p.text(66, top - 9, "the present", anchor="start")

    def bez(p0, p1, p2, p3, t):
        return tuple((1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d
                     for a, b, c, d in zip(p0, p1, p2, p3))

    for s in (-1, 1):
        # the line from A (s=-1) or B (s=+1) down to C; mirror images of each other
        x0 = cx + s * (cx - ax)
        seg1 = ((x0, top), (x0 - s * 14, top + 96), (cx + s * 70, top + 150), (cx + s * 52, top + 212))
        seg2 = (seg1[3], (cx + s * 34, top + 274), (cx + s * 4, cyC - 40), (cx, cyC))
        p.path("M{} {}C{} {} {} {} {} {}C{} {} {} {} {} {}".format(
            *[f(v) for pt in seg1 for v in pt], *[f(v) for pt in seg2[1:] for v in pt]),
            w=SUBJECT, masked=False)
        # kin: one twig that reaches the present, one (grey) that ended
        kx, ky = bez(*seg1, 0.72)
        p.path(f"M{f(kx)} {f(ky)}C{f(kx + s * 30)} {f(ky - 40)} {f(x0 + s * 38)} {f(top + 70)}"
               f" {f(x0 + s * 44)} {f(top)}", w=HAIR, masked=False)
        ex, ey = bez(*seg2, 0.45)
        p.path(f"M{f(ex)} {f(ey)}C{f(ex + s * 30)} {f(ey - 8)} {f(ex + s * 54)} {f(ey - 30)}"
               f" {f(ex + s * 66)} {f(ey - 58)}", w=HAIR, color=GREY, masked=False)
    # the loop closes in the present
    p.line(ax, top, bx, top, w=SUBJECT, color=RED, masked=False)
    p.line(cx, top + 6, cx, cyC - 6, w=HAIR, dash="0.4 2.2", masked=False)
    for x, s in ((ax, "a"), (bx, "b")):
        p.dot(x, top, 2.2)
        p.text(x, top - 9, s)
    p.dot(cx, cyC, 2.2)
    p.text(cx + 10, cyC + 4, "c, a common ancestor", anchor="start")
    p.text(cx, 486, "known factually before it is felt")
    return p


# ---- Plate texts (Brief-style entries) ----------------------------------------

STYLE_BLOCK = (
    "Technical line drawing in the manner of the original Flatland illustrations and "
    "Edward Tufte's diagrams. Pure outline; no shading, no gradients, no textures, no 3D "
    "rendering, no photorealism. Warm off-white paper ground (#FAF7F0). Near-black ink "
    "(#141414); mid-grey (#8C8C8C) for secondary structure; a single dry vermilion (#B03A2E) "
    "accent used only where specified. Three line weights only: 1.2pt subject, 0.6pt "
    "secondary, 0.25pt hairline construction. Labels in small capitals, humanist serif, set "
    "horizontally beside what they name; no legend, no key, no title in the image. Ruled and "
    "compassed, not sketchy. Generous white margin.")

PLATES = [
    dict(n="O-I", slug="o1-pinched-loop", title="The Pinched Loop", build=plate_1,
         fmt="Landscape, 3:2", sources="ON-134 (p. 1), priority 1; ON-133 (p. 1)",
         thread="“Another way of looking at this is to recognize the plane cut by this paper.”",
         claim="The universe is a loop in time that touches the page at a single point.",
         construction="A hairline rule, the plane of the page seen edge-on. Standing on it, one "
         "loop at subject weight. It crosses itself where it meets the rule, and both strands run "
         "on under the rule to left and right until they leave the drawing. The crossing is a "
         "Horizon: the strands enter the dashes and are not drawn inside. One chevron at the top "
         "gives the direction of time.",
         ink="Loop and strands 1.2pt. Rule hairline. Horizon 0.6pt black. No accent.",
         labels="THE PLANE OF THE PAGE; INFINITY at both ends; SINGULARITY under the Horizon; "
         "italic *the flow of time* over the chevron.",
         forbid="A burst, glow or radiance at the singularity. Any mark inside the Horizon. Arrows "
         "anywhere but the one chevron.",
         prompt="A single smooth loop standing on a fine horizontal rule, crossing itself at the "
         "one point where it touches the rule; from the crossing both strands curve down and run "
         "horizontally beneath the rule to left and right, labeled INFINITY at each end. The "
         "crossing is a small dashed circle enclosing nothing, labeled SINGULARITY beneath. One "
         "small open chevron at the top of the loop pointing left, with the italic words the flow "
         "of time. The small capitals THE PLANE OF THE PAGE on the rule at the right.",
         note="The notebook draws the page's plane dashed. Here it is a hairline rule, because "
         "the Brief keeps dashes for Horizons and hidden edges. The singularity becomes the "
         "Horizon of Plates VIII and X, which is what ties the Ontograph into the Recapitulation."),
    dict(n="O-II", slug="o2-foldings", title="Foldings of Infinity", build=plate_2,
         fmt="Landscape, 3:2", sources="ON-153 (p. 8), priority 2",
         thread="“These layers are all connected, rightly thought of as foldings of infinity — "
         "as such the inner domain is as large as the outer.”",
         claim="The nested loop is the figure of infinity with one lobe folded inside the other.",
         construction="Three stations of one curve, all the same size, crossing at the same height. "
         "(1) A true lemniscate standing upright. (2) The same curve with its lower lobe at half "
         "size. (3) That lobe folded up inside the upper one. It keeps the crossing's two 45° "
         "tangents, so it nests without touching. Dotted hairlines continue the tangents downward "
         "from station 3, where the lobe used to run.",
         ink="Curves 1.2pt. Dotted continuations hairline. The sentence beneath in vermilion.",
         labels="A FIGURE OF INFINITY · ONE LOBE DRAWN IN · FOLDED; beneath, in vermilion, THE "
         "INNER DOMAIN IS AS LARGE AS THE OUTER.",
         forbid="The ∞ sign as a typographic ornament. Arrows between stations; the sequence is "
         "the argument.",
         prompt="Three equal stations in a row. First, an upright figure-eight lemniscate crossing "
         "at its center. Second, the same figure with its lower lobe drawn at half size. Third, "
         "that small lobe folded up inside the upper lobe, touching it only at the crossing point; "
         "from that point two fine dotted lines run down and outward at 45 degrees. Beneath the "
         "stations, in small capitals: A FIGURE OF INFINITY, ONE LOBE DRAWN IN, FOLDED. Centered "
         "below, in small capitals and dry vermilion: THE INNER DOMAIN IS AS LARGE AS THE OUTER.",
         note="Station 3 is the unit every later plate is built from. The lemniscate is exact "
         "(Bernoulli). Stations 2 and 3 are the same point set, scaled and reflected."),
    dict(n="O-III", slug="o3-chain", title="The Chain", build=plate_3,
         fmt="Landscape, 3:2", sources="ON-135, ON-136, ON-137 (p. 2), all priority 1",
         thread="“Within which matter condenses … within which life happens … within "
         "which mind occurs.”",
         claim="Each level is born from a pinch in the level before it.",
         construction="Three panels, divided by hairline rules. Each holds one loop at subject "
         "weight, pinched at a Horizon, with a small loop at secondary weight born from the same "
         "pinch. The small loop of each panel is the large loop of the next. The reader supplies "
         "the magnification; nothing is drawn between panels.",
         ink="Large loops 1.2pt; small loops 0.6pt; Horizons 0.6pt, the last one (the “I”) in "
         "vermilion.",
         labels="ENERGY · MATTER · LIFE inside the large loops; italic *matter condenses*, "
         "*life happens*, *mind occurs* over the small ones; QUANTUM, REPLICATION "
         "“SINGULARITY”, “I” under the Horizons.",
         forbid="Lists of galaxies, cells, species or stages of learning around the loops; they "
         "belong in the caption. Connecting arrows between panels.",
         prompt="Three equal panels divided by fine vertical rules. In each, a tall smooth loop "
         "that crosses itself at the bottom, where a small dashed circle encloses nothing; from "
         "the same crossing a much smaller loop rises inside it. Inside the large loops, the "
         "small capitals ENERGY, MATTER, LIFE; above the small loops, the italic words matter "
         "condenses, life happens, mind occurs. Under the three dashed circles: QUANTUM; "
         "REPLICATION “SINGULARITY”; “I” — the third dashed circle in dry vermilion.",
         note="The notebook's third link is pinched at the “I”, and so is this one. The next "
         "plate folds the chain into one figure, and there the “I” moves to the centre."),
    dict(n="O-IV", slug="o4-ontograph", title="The Ontograph", build=plate_4,
         fmt="Square, 1:1", sources="ON-138 (p. 3), priority 1, the key reference image",
         thread="“In the center we have the mind's ‘I,’ and yet at all times, identification "
         "with the universal and even infinite level is possible, by turning awareness around and "
         "sending it ‘back the way you came.’”",
         claim="Energy, matter, life and mind are one loop folded four times, and the one who "
         "looks is at the centre, never among the things shown.",
         construction="Four loops sharing one pinch point, nested without touching, because they "
         "share the pinch's two tangents. The outermost strands cross at the pinch and run off the "
         "bottom edge of the page: the one place in the set where a line leaves the margin, as the "
         "notebook asks (“we draw lines running off the page to emphasize the fact that infinity is "
         "necessarily connected”). The innermost loop is a Horizon in the shape of a loop.",
         ink="Energy 1.2pt; matter, life, mind 0.6pt; the “I” as vermilion dashes. This is the "
         "same vermilion Horizon as Plate IX, the event horizon of perception.",
         labels="ENERGY · MATTER · LIFE · MIND in the bands between loops; italic "
         "“I” beside the dashed loop, never inside it; INFINITY at the ends of the strands; italic "
         "*the flow of time, of energy* over the chevron.",
         forbid="A face, eye, figure or letter inside the dashed loop. Colour-coding the levels. "
         "Concentric circles; the loops must be pinched.",
         prompt="Four smooth nested loops of decreasing size, all passing through one shared point "
         "near the bottom of the frame and nesting without touching elsewhere; the outermost is "
         "heavier and its two strands cross at the shared point and run down off the bottom edge, "
         "labeled INFINITY. Innermost, a fifth small loop through the same point drawn as dry "
         "vermilion dashes, enclosing nothing, with an italic “I” beside it. In the bands "
         "between loops, the small capitals ENERGY, MATTER, LIFE, MIND. A small chevron at the top "
         "of the outer loop pointing left, with the italic words the flow of time, of energy.",
         note="The notebook also pinches the loops at the top and sets a dashed INFINITY line "
         "over them. This plate keeps one pinch, so that it reads as the first singularity, and "
         "sends infinity out through the strands, as on p. 1."),
    dict(n="O-V", slug="o5-viewing-angle", title="One Thread, Seen From Different Sides",
         build=plate_5, fmt="Landscape, 3:2",
         sources="ON-145 (p. 7), priority 1; ON-144 (p. 7)",
         thread="“The Ontograph appears to capture the sense of separation of self and other, "
         "subject and object. But this is an illusion brought on by the viewing angle.”",
         claim="Self containing self, and self apart from Self, are one thread seen from two sides.",
         construction="One rigid wire figure, drawn five times as it turns. The figure is a large "
         "loop and a small loop through the same point, in planes at right angles to each other. "
         "From the first side the small loop sits inside the large one (a 0 with an o in it, the "
         "notebook's Self containing self). Turned, the small loop narrows to a line at the base (a 6), "
         "then swings out beneath (an 8). The projection is computed, not sketched, so it is one "
         "object throughout.",
         ink="All 1.2pt. The sentence beneath in vermilion.",
         labels="Italic *Self* and *self* on the last station only, where they read apart; beneath, in "
         "vermilion, ONE THREAD, SEEN FROM DIFFERENT SIDES.",
         forbid="Motion lines, arrows or ghosting between stations. Faces or figures for self "
         "and other.",
         prompt="Five equal stations in a row showing one wire figure rotating: a large loop and a "
         "small loop joined at a single point at the base. In the first station the small loop "
         "sits inside the large one; across the sequence it narrows to a line and then swings "
         "down beneath the large loop, so the last station reads as a figure eight. Italic Self "
         "and self beside the two loops of the last station. Centered beneath, in small "
         "capitals and dry vermilion: ONE THREAD, SEEN FROM DIFFERENT SIDES.",
         note="The notebook's “apparent knots in the thread” are left out. One thread is enough "
         "for the claim, and the Brief allows one idea per plate."),
    dict(n="O-VI", slug="o6-p-and-o-types", title="P-type and O-type", build=plate_6,
         fmt="Landscape, 3:2",
         sources="ON-151 and ON-150 (p. 8), both priority 1; ON-148 (p. 8)",
         thread="“The O-type emphasizes energetic exchange in the present … the P-type can be "
         "scaled down to an individual's history, emphasizing the temporal dimension.”",
         claim="The same loop read in time is a lifetime; read in the present, it is a community.",
         construction="Two panels divided by a hairline rule. Left: one loop pinched at a Horizon "
         "where birth and death are the same point, time running up through infancy, over the top "
         "and down to senility. Right: nine small loops, each pinched on one shared hairline ring, "
         "with a hairline arc of exchange between each pair of neighbours.",
         ink="The lifetime loop 1.2pt vermilion: the reader's own line, drawn as a loop. The "
         "community 0.6pt black, the ring and arcs hairline. No one in the community is "
         "distinguished.",
         labels="BIRTH · DEATH under the Horizon; italic *infancy*, *senility*, *exchange*; beneath "
         "the panels, P-TYPE: A LINEAGE IN TIME and O-TYPE: A COMMUNITY IN THE PRESENT.",
         forbid="Faces, figures or names on the small loops. Lungs, noses or anatomy; the breath "
         "(ON-152) is a separate plate if it is ever drawn.",
         prompt="Two panels divided by a fine vertical rule. Left: one tall smooth loop in dry "
         "vermilion crossing itself at the bottom inside a small dashed circle labeled BIRTH · "
         "DEATH, with the italic words infancy and senility on either side and a small chevron at "
         "the top pointing right. Right: nine small identical loops standing out from a fine "
         "circle like petals, each crossing itself on the circle, with short fine arcs between "
         "neighbours and the italic word exchange. Beneath, in small capitals: P-TYPE: A LINEAGE "
         "IN TIME; O-TYPE: A COMMUNITY IN THE PRESENT.",
         note="The notebook's P-type puts BIRTH/DEATH at the top. It is moved to the pinch at the "
         "bottom here, to match O-I to O-IV."),
    dict(n="O-VII", slug="o7-untying", title="Untie, Untwist, Unwind", build=plate_7,
         fmt="Landscape, 3:2", sources="ON-154 and ON-155 (p. 9), both priority 1",
         thread="“Unwind the links in the ontogenetic chain … This is the point of meditation, "
         "untying the self.” — and, in Japanese, ほとけがほどけてくれるんだ.",
         claim="Pulled open, the knotted loop becomes one open circle.",
         construction="Eight stations in two rows, all the same height, drawn from one family of "
         "curves (the limaçon, r = b + a cos θ, with a + b held constant). As a falls: the "
         "loop inside a loop (1–3); the inner loop pulled to a cusp and gone (4, the cardioid, "
         "the knot untied); a kidney shape whose dimple flattens (5–6); convex (7); a circle (8). "
         "The curves are computed, so each station follows exactly from the one before it.",
         ink="Stations 1–7 1.2pt black; station 8 1.2pt vermilion with two chevrons: the "
         "sentence the plate proves. Station numbers hairline grey.",
         labels="Figures 1–8; beneath, UNTIE · UNTWIST · UNWIND. The Japanese line goes in "
         "the caption, not the plate.",
         forbid="Glow, radiance or a halo on the final circle. Anything drawn inside it.",
         prompt="Eight equal stations in two rows of four, each a single closed curve of the same "
         "height: first a loop with a smaller loop inside it, joined at the bottom; across the "
         "sequence the inner loop shrinks to a cusp and disappears, the curve becomes a kidney "
         "shape, its dimple flattens, and the last station is a plain circle drawn in dry "
         "vermilion with two small chevrons showing circulation. Small grey figures 1 to 8 "
         "beneath the stations; at the bottom, in small capitals: UNTIE · UNTWIST · UNWIND.",
         note="The notebook's stations 5–7 open the curve into a horseshoe, a gap in the ring. "
         "The limaçon keeps it closed and reaches the same end. If the open ring matters (the "
         "“open circle”), stations 6–7 can be redrawn with a gap."),
    dict(n="O-VIII", slug="o8-circle-of-empathy", title="The Circle of Empathy", build=plate_8,
         fmt="Portrait, 4:5", sources="ON-182 (p. 14), priority 1; ON-172 (p. 12)",
         thread="“Any two peoples (A, B) can now perceive themselves as twigs on the same tree, "
         "with common ancestors (C) and a shared material being.”",
         claim="Two people traced back to a common ancestor make a closed loop, and it can be "
         "known before it is felt.",
         construction="A hairline rule for the present. From two points on it, A and B, two "
         "worldlines descend as mirror images and meet at C. Each carries two hairline twigs: one "
         "that reaches the present (other kin) and one, in grey, that ended. The stretch of the "
         "present between A and B closes the loop. A dotted hairline from C to that stretch is "
         "the notebook's “loop completed”.",
         ink="Worldlines 1.2pt black, identical. The closing stretch A–B 1.2pt vermilion, which "
         "is the present shell. Twigs hairline; the ended twigs grey.",
         labels="THE PRESENT; A; B; C, A COMMON ANCESTOR; beneath, KNOWN FACTUALLY BEFORE IT IS "
         "FELT.",
         forbid="Figures, faces or flags for A and B; they are points. Any asymmetry between the "
         "two lines. A heart or any sentiment.",
         prompt="Portrait. A fine horizontal rule near the top labeled THE PRESENT. Two small dots "
         "on it, labeled A and B; from each, a continuous heavier line descends, mirror images of "
         "each other, until they meet at a single dot low in the frame labeled C, A COMMON "
         "ANCESTOR. Each line puts out two fine twigs, one reaching up to the rule and one, in "
         "grey, stopping short. The stretch of the rule between A and B is heavier and dry "
         "vermilion. A fine dotted vertical runs from C up to it. At the bottom, in small "
         "capitals: KNOWN FACTUALLY BEFORE IT IS FELT.",
         note="The notebook draws C in red. Here the red moves to the stretch of the present, "
         "because the Brief's accent marks the present and C is in the past. Rescan ON-182 "
         "(faint red and blue ink) before comparing the two."),
]


def write_markdown():
    out = ["# Ontograph plates: Brief entries and prompts (roadmap #5)", "",
           "Eight plates in the style of *Instructions to SOL Ultra — Illustration Brief*, for "
           "the Ontograph, which the Recapitulation does not yet illustrate. Each entry follows "
           "the Brief's form. To render a plate with an image model, prepend the style block "
           "verbatim, then the plate's PROMPT, then its format.",
           "",
           "The SVGs in `plates/` are the reference drawings, built by `build.py`. The PROMPT is "
           "for anyone redrawing them. If a PROMPT and its SVG disagree, the SVG is right.", "",
           "> **STYLE BLOCK.** " + STYLE_BLOCK, "", "---", ""]
    for pl in PLATES:
        out += [f"### Plate {pl['n']} · {pl['title']}", "",
                f"**Source.** {pl['sources']}. *{pl['thread']}*", "",
                f"**The claim.** {pl['claim']}", "",
                f"**Construction.** {pl['construction']}", "",
                f"**Ink.** {pl['ink']}", "",
                f"**Labels.** {pl['labels']}", "",
                f"**Forbid.** {pl['forbid']}", "",
                f"**PROMPT.** {pl['prompt']} {pl['fmt'].split(',')[0]} format.", "",
                f"**Note on the redrawing.** {pl['note']}", "",
                f"![Plate {pl['n']}](plates/{pl['slug']}.svg)", "", "---", ""]
    (HERE / "PLATES.md").write_text("\n".join(out).rstrip() + "\n")


PAGE_HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Eight plates for the Ontograph, the Phylograph's pair, redrawn from the Ontograph notebook under the Illustration Brief's rules. Phylograph roadmap project 5.">
<title>Ontograph Plates</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Mono:wght@400&display=swap">
<style>
:root{
  --ground:#FAF7F0; --panel:#F3EEE3; --rule:#E2DBCB;
  --ink:#141414; --ink-2:#3C3A35; --grey:#8C8C8C;
  --accent:#B03A2E;
  --paper:#FAF7F0; --plate-edge:#E2DBCB;
  --serif:"EB Garamond", "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  --mono:"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --ground:#14130F; --panel:#1C1A16; --rule:#2E2B24;
    --ink:#ECE6D8; --ink-2:#C9C2B2; --grey:#7F796D;
    --accent:#E0634C; --plate-edge:#2E2B24;
  }
}
:root[data-theme="dark"]{
  --ground:#14130F; --panel:#1C1A16; --rule:#2E2B24;
  --ink:#ECE6D8; --ink-2:#C9C2B2; --grey:#7F796D;
  --accent:#E0634C; --plate-edge:#2E2B24;
}
*{box-sizing:border-box}
body{background:var(--ground);color:var(--ink);font-family:var(--serif);font-size:17px;line-height:1.5;margin:0}
.wrap{max-width:1040px;margin:0 auto;padding-inline:16px;padding-block:28px 64px}
header{display:grid;gap:6px;margin-bottom:36px;max-width:720px}
.eyebrow{font-variant:small-caps;letter-spacing:.12em;color:var(--grey);font-size:15px}
.eyebrow a{color:inherit}
h1{font-weight:500;font-size:clamp(34px,5vw,48px);line-height:1.05;margin:0;letter-spacing:-.01em}
.lede{margin:4px 0 0;color:var(--ink-2);font-size:18px;max-width:62ch;text-wrap:pretty}
.lede em{color:var(--ink)}
.index{display:flex;flex-wrap:wrap;gap:4px 18px;margin:14px 0 0;padding:0;list-style:none;font-size:15px}
.index a{color:var(--ink-2);text-decoration:none;border-bottom:1px solid var(--rule)}
.index a:hover{color:var(--accent);border-color:var(--accent)}
.index b{font-family:var(--mono);font-weight:400;font-size:12px;color:var(--grey);margin-right:6px}
article{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:32px;align-items:start;
  padding-block:36px;border-top:1px solid var(--rule)}
@media (max-width:820px){article{grid-template-columns:1fr;gap:18px}}
.plate{margin:0;background:var(--paper);border:1px solid var(--plate-edge);padding:0;line-height:0}
.plate svg{display:block;width:100%;height:auto}
.plate.portrait{max-width:520px}
.plate.square{max-width:560px}
.num{font-family:var(--mono);font-size:13px;color:var(--grey);letter-spacing:.04em}
h2{font-weight:500;font-size:28px;line-height:1.15;margin:2px 0 8px}
.claim{margin:0 0 12px;color:var(--ink);font-size:18px}
.thread{margin:0 0 14px;color:var(--ink-2);font-style:italic;font-size:16px;border-left:2px solid var(--rule);padding-left:12px}
dl{margin:0;display:grid;gap:10px;font-size:15.5px;color:var(--ink-2)}
dt{font-variant:small-caps;letter-spacing:.12em;color:var(--grey);font-size:14px}
dd{margin:0}
details{margin-top:14px;border-top:1px solid var(--rule);padding-top:10px}
summary{cursor:pointer;font-variant:small-caps;letter-spacing:.12em;color:var(--grey);font-size:14px}
summary:hover{color:var(--accent)}
.prompt{font-size:15px;color:var(--ink-2);margin:10px 0 0}
.dl{font-size:14px;margin-top:10px}
.dl a{color:var(--ink-2)}
footer{border-top:1px solid var(--rule);padding-top:22px;color:var(--grey);font-size:15px;max-width:70ch}
footer a{color:var(--ink-2)}
</style>
</head>
<body>
<div class="wrap">
<header>
  <div class="eyebrow"><a href="../">The Graph</a> · roadmap 5</div>
  <h1>Ontograph Plates</h1>
  <p class="lede">The Phylograph answers <em>where did this come from?</em> Its pair, the Ontograph, answers <em>what is this made of, and where am I in it?</em> These eight plates redraw the Ontograph notebook (Japan, mid-20s) under the rules of the Recapitulation’s Illustration Brief: three line weights, no shading, vermilion only for the reader, the present, and the sentence a plate exists to prove. Nothing is ever drawn inside a dashed Horizon.</p>
  <ul class="index">
"""

PAGE_FOOT = """<footer>
  <p>Drawn by <code>build.py</code> in this folder, which writes the SVGs, this page and <a href="PLATES.md">PLATES.md</a> (the Brief entries and PROMPT lines) from one source. Glyphs are shared functions, so they are identical on every plate. Source figure numbers (ON-133 to ON-183) refer to the Figure Register (roadmap #4). The plates stay on book paper in dark mode, as printed pages would.</p>
</footer>
</div>
</body>
</html>
"""


def write_outputs():
    (HERE / "plates").mkdir(exist_ok=True)
    page = [PAGE_HEAD]
    page += [f'    <li><a href="#{pl["slug"]}"><b>{pl["n"]}</b>{html.escape(pl["title"])}</a></li>\n'
             for pl in PLATES]
    page.append("  </ul>\n</header>\n")
    for pl in PLATES:
        plate = pl["build"]()
        (HERE / "plates" / f"{pl['slug']}.svg").write_text(plate.svg(standalone=True) + "\n")
        inline = plate.svg(standalone=False).replace('id="h"', f'id="h-{pl["slug"]}"') \
                                            .replace("url(#h)", f"url(#h-{pl['slug']})")
        e = html.escape
        page.append(f"""<article id="{pl['slug']}">
  <figure class="plate {plate.fmt}" aria-label="Plate {pl['n']}, {e(pl['title'])}">{inline}</figure>
  <div>
    <div class="num">PLATE {pl['n']} · {e(pl['sources'])}</div>
    <h2>{e(pl['title'])}</h2>
    <p class="claim">{e(pl['claim'])}</p>
    <p class="thread">{e(pl['thread'])}</p>
    <dl>
      <dt>Construction</dt><dd>{e(pl['construction'])}</dd>
      <dt>Ink</dt><dd>{e(pl['ink'])}</dd>
      <dt>Redrawing</dt><dd>{e(pl['note'])}</dd>
    </dl>
    <details><summary>Labels, forbid, prompt</summary>
      <dl style="margin-top:10px">
        <dt>Labels</dt><dd>{e(pl['labels'].replace('*', ''))}</dd>
        <dt>Forbid</dt><dd>{e(pl['forbid'])}</dd>
        <dt>Prompt · {e(pl['fmt'])}</dt><dd class="prompt">{e(pl['prompt'])}</dd>
      </dl>
    </details>
    <div class="dl"><a href="plates/{pl['slug']}.svg" download>SVG</a></div>
  </div>
</article>
""")
    page.append(PAGE_FOOT)
    (HERE / "index.html").write_text("".join(page))
    write_markdown()


if __name__ == "__main__":
    write_outputs()
    print(f"wrote {len(PLATES)} plates, index.html and PLATES.md")
