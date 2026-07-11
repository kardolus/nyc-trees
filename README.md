# NYC Trees — trees.kardol.us

A gamified field guide for recognizing the common street & park trees of New York City, by
**leaf, bark, and fruit/nut**, with **real Creative-Commons photos**. Static client-side app
(HTML/CSS/vanilla JS, nginx), all progress in `localStorage`. Sibling of `cdl-pretrip`; reuses
the flightdeck design system + Leitner spaced-repetition pattern.

## Modes
- **Drill** (default): photo → species multiple-choice; distractors are real look-alikes.
- **Guide**: field-guide cards — photo strip (form/leaf/bark/fruit), fast-ID cues, "don't
  confuse with", traits, seasonality.
- **Key**: filter by what you see (leaf arrangement / type / bark / fruit) → matching species.
- **Walk**: seasonal "spot it outside" checklist.
- **Now**: what's flowering / fruiting this month + a themed quiz.
- **Progress**: mastery per species, streak, weak-spot drills, export/import.

## Data
- `site/species.js` — hand-authored botany (`window.NYCTREES_SPECIES`): 20 species with
  traits, confusable pairs, seasonality, iNaturalist taxon IDs.
- `site/photos.js` — **generated** by `scripts/build_photos.py` (`window.NYCTREES_PHOTOS` +
  `NYCTREES_CREDITS`). Photos: Wikimedia Commons (leaf/bark/fruit/flower — the filename names
  the part) + iNaturalist (whole-tree form). CC0 / CC-BY / CC-BY-SA only; every photo carries
  attribution; a `#/credits` page lists all sources.

## Rebuild photos
```bash
python3 scripts/build_photos.py            # all species  (--limit N to test)
```
`scripts/photo_picks.json` (optional) overrides the auto-pick per `species → part → [File:...]`.

## Deploy (same pattern as cdl)
```bash
# on forge:
docker build -t ghcr.io/kardolus/trees-web:vN . && docker push ghcr.io/kardolus/trees-web:vN
# from Mac:
kubectl --context forge -n trees set image deploy/trees-web trees-web=ghcr.io/kardolus/trees-web:vN
kubectl --context forge -n trees rollout status deploy/trees-web
```
Namespace `trees`, host `trees.kardol.us` via the platform Cloudflare tunnel. Bump `?v=N`
querystrings in `index.html` when shipping CSS/JS changes so clients don't cache stale assets.
