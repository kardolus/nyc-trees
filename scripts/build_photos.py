#!/usr/bin/env python3
"""Build site/photos.js + site/img/photos/** for the NYC Trees app.

Real photos, properly licensed. For each species in site/species.js and each part
(form / leaf / bark / fruit / flower) we pull open-licensed images:

  * Wikimedia Commons file-search — the PRIMARY source. Commons filenames carry the part
    ("Bark of Platanus x hispanica.jpg", "Quercus palustris acorn"), so the search term
    itself classifies the part. We keep only CC0 / CC-BY / CC-BY-SA / public-domain files
    and capture author + license for attribution.
  * iNaturalist (global, research-grade, CC0/CC-BY, ordered by faves) — a supplement for
    an extra real-world form/leaf shot.

Images are downloaded, re-encoded to WebP at two sizes (thumb ~400px, full ~1000px), and
written under site/img/photos/<species>/<part>-NN.webp. A manifest (window.NYCTREES_PHOTOS)
and a credits list are emitted to site/photos.js.

An optional scripts/photo_picks.json lets you override the auto-pick per (species, part):
  { "quercus-palustris": { "bark": ["File:Better bark.jpg"] } }

Run:  python3 scripts/build_photos.py            (add --limit N to test on a few species)
"""
import hashlib, io, json, os, re, subprocess, sys, urllib.parse, urllib.request
from PIL import Image


def _fh(path):
    """8-char content hash — appended to photo URLs so a replaced image (same filename) gets a
    fresh URL and isn't served stale from a browser's long image cache."""
    return hashlib.md5(open(path, "rb").read()).hexdigest()[:8]

HERE = os.path.dirname(__file__)
ROOT = os.path.join(HERE, "..")
SPECIES_JS = os.path.join(ROOT, "site", "species.js")
PICKS = os.path.join(HERE, "photo_picks.json")
IMGDIR = os.path.join(ROOT, "site", "img", "photos")
OUT = os.path.join(ROOT, "site", "photos.js")
UA = "nyc-trees/1.0 (kardolus@gmail.com)"

# Reject these outright (non-free or awkward); down-rank public-domain (usually old book
# scans/lithographs here) below modern CC photos.
BAD = ("nc", "nd", "gfdl", "all rights", "fair use")
# Commons full-text search also returns non-photographic files (book plates, herbarium sheets,
# lithographs, maps). Skip any file whose title looks like one of those.
JUNK = ("catalogue", "plate", "illustration", "drawing", "engraving", "lithograph", "herbarium",
        "flora of", "book", "sp. pl", "botanical magazine", "nas-", "label", "map", "diagram",
        "distribution", "chart", "title page", "figure", "woodcut", "icones", "tab.",
        "lorem", "mockup", "placeholder", "köhler", "koehler", "kohler", "sturm", "medizinal",
        "deutschlands flora", "vintage", "logo", "icon", "sign", "banner", "specimen", "sheet",
        "botanic", "arboretum", "garden", "gdn", "garten", "emblem", "alphabet",
        "language of flowers", "internet archive")
THUMB_W, FULL_W = 420, 1024

PARTS = ["form", "leaf", "bark", "fruit", "flower"]
# part -> title keywords we prefer (fruit keyword comes from the species record)
PART_KW = {"form": ["tree", "habit", "trunk"], "leaf": ["leaf", "leaves", "foliage"],
           "bark": ["bark"], "flower": ["flower", "bloom", "catkin"]}


def http(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=45) as r:
        return r.read()


def get_json(url):
    return json.loads(http(url))


def load_species():
    """Eval species.js via node and return the parsed array."""
    js = ("global.window={};require(" + json.dumps(os.path.abspath(SPECIES_JS)) +
          ");process.stdout.write(JSON.stringify(window.NYCTREES_SPECIES))")
    out = subprocess.check_output(["node", "-e", js])
    return json.loads(out)


def lic_rank(lic):
    l = (lic or "").lower()
    if any(b in l for b in BAD):
        return 99
    if "cc0" in l:
        return 0
    if "cc-by-sa" in l or "cc by-sa" in l:
        return 2
    if "cc-by" in l or "cc by" in l:
        return 1
    if "public domain" in l or l.strip() in ("pd", "cc pd"):
        return 6   # usually old book scans — allow only as a last resort
    return 8       # unknown


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def commons_search(term, want_kw, name_tokens=None, n=20, require_kw=True):
    """Search Commons File namespace for real photographs; sort by (license, jpg, kw).
    If name_tokens is given, the FILENAME must contain the genus or a common-name word — this
    rejects generic files ('Seed pods.jpg') and book plates that only mention the species in
    their description/categories."""
    s = get_json("https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search"
                 f"&srsearch={urllib.parse.quote(term)}&srnamespace=6&srlimit={n}")
    titles = [r["title"] for r in s.get("query", {}).get("search", [])]
    if not titles:
        return []
    r = get_json("https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo"
                 "&iiprop=url|extmetadata|size&iiurlwidth=1200&titles=" + urllib.parse.quote("|".join(titles)))
    cands = []
    for pg in r.get("query", {}).get("pages", {}).values():
        ii = (pg.get("imageinfo") or [{}])[0]
        if not ii.get("thumburl"):
            continue
        title = pg["title"]; tl = title.lower()
        if not tl.endswith((".jpg", ".jpeg")):
            continue                                   # photos only — skip svg/png/gif/tif (scans, illustrations, placeholders)
        if any(j in tl for j in JUNK):
            continue                                   # book plate / herbarium / garden scene, not a species part photo
        if name_tokens and not any(nt in tl for nt in name_tokens):
            continue                                   # filename must name the species (genus or common)
        kwhit = any(k in tl for k in want_kw)
        if require_kw and not kwhit:
            continue                                   # filename must name the part (reliable on Commons)
        lic = (em := ii.get("extmetadata", {})) and (em.get("LicenseShortName", {}) or {}).get("value", "")
        rank = lic_rank(lic)
        if rank >= 99:
            continue
        w, h = ii.get("thumbwidth", 1), ii.get("thumbheight", 1)
        if h and w and (h / w > 2.3 or w / h > 2.6):    # book pages / banners
            continue
        cands.append({
            "title": title, "thumburl": ii["thumburl"], "license": lic,
            "creator": strip_html((em.get("Artist", {}) or {}).get("value", "")) or "Unknown",
            "sourceUrl": ii.get("descriptionurl", ""), "source": "Wikimedia Commons",
            "score": (rank, 0 if kwhit else 1),
        })
    cands.sort(key=lambda c: c["score"])
    return cands


def commons_by_title(title):
    """Fetch one Commons file by its exact File: title (for photo_picks overrides)."""
    r = get_json("https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo"
                 "&iiprop=url|extmetadata&iiurlwidth=1200&titles=" + urllib.parse.quote(title))
    for pg in r.get("query", {}).get("pages", {}).values():
        ii = (pg.get("imageinfo") or [{}])[0]
        if not ii.get("thumburl"):
            continue
        em = ii.get("extmetadata", {})
        return {"title": pg["title"], "thumburl": ii["thumburl"],
                "license": (em.get("LicenseShortName", {}) or {}).get("value", ""),
                "creator": strip_html((em.get("Artist", {}) or {}).get("value", "")) or "Unknown",
                "sourceUrl": ii.get("descriptionurl", ""), "source": "Wikimedia Commons"}
    return None


def inat_photos(taxon_id, n=3):
    q = ("https://api.inaturalist.org/v1/observations?"
         f"taxon_id={taxon_id}&photo_license=cc0,cc-by&quality_grade=research"
         f"&order_by=votes&order=desc&per_page={n}&photos=true")
    out = []
    for o in get_json(q).get("results", []):
        ph = (o.get("photos") or [{}])[0]
        if not ph.get("url"):
            continue
        out.append({
            "thumburl": ph["url"].replace("square", "large"), "license": ph.get("license_code", ""),
            "creator": strip_html(ph.get("attribution", "")).split(",")[0] or "iNaturalist user",
            "sourceUrl": f"https://www.inaturalist.org/observations/{o['id']}", "source": "iNaturalist",
        })
    return out


def to_webp(raw, path_full, path_thumb):
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    for path, w in ((path_full, FULL_W), (path_thumb, THUMB_W)):
        c = im.copy()
        if c.width > w:
            c = c.resize((w, round(c.height * w / c.width)), Image.LANCZOS)
        c.save(path, "WEBP", quality=80, method=5)


def main():
    limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None
    only = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None
    species = load_species()
    if only:
        species = [s for s in species if s["id"] == only]
    elif limit:
        species = species[:limit]
    picks = json.load(open(PICKS)) if os.path.exists(PICKS) else {}
    photos, credits, misses = [], [], []

    # --only rebuilds a single species in place: preload the existing manifest (minus that
    # species) so the other 19 are preserved.
    if only and os.path.exists(OUT):
        ex = json.loads(subprocess.check_output(["node", "-e",
            "global.window={};require(" + json.dumps(os.path.abspath(OUT)) +
            ");process.stdout.write(JSON.stringify({p:window.NYCTREES_PHOTOS,c:window.NYCTREES_CREDITS}))"]))
        photos = [p for p in ex["p"] if p["speciesId"] != only]
        credits = [c for c in ex["c"] if c["speciesId"] != only]

    for sp in species:
        sid, sci = sp["id"], sp["scientific"]
        sci_x = sci.replace("×", "x")  # Commons search prefers plain x
        os.makedirs(os.path.join(IMGDIR, sid), exist_ok=True)
        want = {**PART_KW, "fruit": [sp.get("fruitKeyword", "fruit"), "fruit", "seed", "nut", "pod", "acorn"]}
        # Commons filenames may use a synonym (e.g. Platanus × hispanica for the London plane).
        # Search across name aliases: the listed name, the iNat accepted name, and the common name.
        aliases = [sci_x]
        try:
            nm = get_json(f"https://api.inaturalist.org/v1/taxa/{sp['inaturalistTaxonId']}")["results"][0]["name"].replace("×", "x")
            if nm not in aliases:
                aliases.append(nm)
        except Exception:
            pass
        aliases.append(sp["common"])
        kwword = {"leaf": "leaf", "bark": "bark", "flower": "flower", "fruit": sp.get("fruitKeyword", "fruit")}

        name_tokens = [sci_x.split()[0].lower()] + [w.lower() for w in sp["common"].split() if len(w) > 3]
        def part_cands(part):
            kws = [kwword[part]]
            if part == "fruit":
                kws += ["fruit", "seed", "seedpod"]
            seen, out = {}, []
            for nm in aliases:
                for kw in kws:
                    for c in commons_search(f"{nm} {kw}", want[part], name_tokens):
                        if c["title"] not in seen:
                            seen[c["title"]] = 1; out.append(c)
            out.sort(key=lambda c: c["score"])
            return out
        def emit(part, c, n, source_label):
            base = os.path.join(IMGDIR, sid, f"{part}-{n:02d}")
            to_webp(http(c["thumburl"]), base + ".webp", base + ".thumb.webp")
            attribution = f"{c['creator']}, {c['license']}, via {source_label}"
            rel = f"img/photos/{sid}/{part}-{n:02d}"
            photos.append({"id": f"{sid}-{part}-{n:02d}", "speciesId": sid, "part": part,
                           "src": f"{rel}.webp?h={_fh(base + '.webp')}", "thumb": f"{rel}.thumb.webp?h={_fh(base + '.thumb.webp')}",
                           "license": c["license"], "creator": c["creator"],
                           "source": source_label, "sourceUrl": c["sourceUrl"], "attribution": attribution})
            credits.append({"speciesId": sid, "part": part, "attribution": attribution, "sourceUrl": c["sourceUrl"]})

        got, done = 0, set()
        # 1. explicit photo_picks overrides win for ANY part (incl. leaf/form)
        for part, titles in (picks.get(sid, {}) or {}).items():
            if part not in PARTS:
                continue                                   # skip directives like inat_leaf/inat_form
            for i, t in enumerate(titles[:2], 1):
                c = commons_by_title(t)
                if not c:
                    misses.append(f"{sid}:{part} pick-not-found ({t})")
                    continue
                try:
                    emit(part, c, i, "Wikimedia Commons"); got += 1; done.add(part)
                except Exception as e:
                    misses.append(f"{sid}:{part} pick ({e})")
        # 2. bark / fruit / flower from Commons (the filename reliably names the part)
        for part in ["bark", "fruit", "flower"]:
            if part in done:
                continue
            cands = part_cands(part)
            if not cands:
                if part not in ("flower",):
                    misses.append(f"{sid}:{part}")
                continue
            try:
                emit(part, cands[0], 1, cands[0]["source"]); got += 1
            except Exception as e:
                misses.append(f"{sid}:{part} ({e})")
        # 3. leaf + form from iNaturalist (unless supplied by a Commons pick). By default the top
        #    votes-ordered CC photos map indices [0,1]->leaf and [2,3]->form; photo_picks
        #    "inat_leaf"/"inat_form" (lists of 0-based indices) override which iNat photos become
        #    which part — for hand-curation (e.g. "photo #2 is actually a great leaf").
        pk = picks.get(sid, {}) or {}
        leaf_idx = (pk.get("inat_leaf", [0, 1]) if "leaf" not in done else [])
        form_idx = (pk.get("inat_form", [2, 3]) if "form" not in done else [])
        want_n = max([-1] + leaf_idx + form_idx) + 1
        if want_n > 0:
            try:
                inat = inat_photos(sp.get("inaturalistTaxonId"), want_n)
                for part, idxs in (("leaf", leaf_idx), ("form", form_idx)):
                    for n, i in enumerate(idxs, 1):
                        if i < len(inat):
                            try:
                                emit(part, inat[i], n, "iNaturalist"); got += 1
                            except Exception:
                                pass
            except Exception:
                pass
        if not any(p["speciesId"] == sid and p["part"] == "leaf" for p in photos):
            misses.append(f"{sid}:leaf")
        print(f"  {sid:<26} {got} photos")

    with open(OUT, "w") as f:
        f.write("// AUTO-GENERATED by scripts/build_photos.py. Do not edit by hand.\n")
        f.write("window.NYCTREES_PHOTOS = " + json.dumps(photos, ensure_ascii=False, indent=1) + ";\n")
        f.write("window.NYCTREES_CREDITS = " + json.dumps(credits, ensure_ascii=False) + ";\n")
    # Cloudflare overrides the origin's no-cache and gives js a 4h browser TTL, so bump the
    # manifest's cache-bust query to the photos.js content hash — index.html is served fresh, so
    # a new ?v reaches clients immediately and photo changes propagate on the next reload.
    ver = _fh(OUT)
    idx_path = os.path.join(ROOT, "site", "index.html")
    idx = open(idx_path).read()
    new_idx = re.sub(r'photos\.js\?v=[0-9a-f]+', f"photos.js?v={ver}", idx)
    if new_idx != idx:
        open(idx_path, "w").write(new_idx)
        print(f"index.html -> photos.js?v={ver}")
    print(f"\nwrote {len(photos)} photos across {len(species)} species -> {os.path.relpath(OUT)}")
    if misses:
        print("MISSES (no photo):", ", ".join(misses))


if __name__ == "__main__":
    main()
