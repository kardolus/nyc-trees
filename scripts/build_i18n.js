// Build site/i18n.js — GPT-5.5 translations of the app's visible strings into 12 languages.
//   OPENAI_API_KEY=… node scripts/build_i18n.js
// Collects a curated UI-string list + auto-extracted species content (common names, fast-ID
// bullets, "don't confuse with" tells, family, walk targets), asks GPT-5.5 for a JSON map per
// language, and writes window.NYCTREES_I18N. The app (app.js i18nApply) swaps exact matches.

const fs = require("fs");
const path = require("path");

const LANGS = [
  ["es", "Spanish"], ["zh", "Simplified Chinese"], ["ru", "Russian"], ["bn", "Bengali"],
  ["ht", "Haitian Creole"], ["ko", "Korean"], ["ar", "Arabic"], ["ur", "Urdu"],
  ["fr", "French"], ["pl", "Polish"], ["nl", "Dutch"], ["de", "German"],
];

// ---- curated UI strings (high-visibility, non-interpolated) ----
const UI = [
  // nav + shell
  "Home", "Learn", "Quiz", "Walk", "Toggle dark mode", "Guide", "Compare", "Progress",
  // home sections
  "Tree of the day", "A new tree to learn every day", "Now", "Did you know?",
  "a new fact every day", "Most common trees", "living, city-wide · share of all",
  "Planting over time", "new trees recorded per year", "Biggest & notable trees",
  "the city’s superlatives", "Flowering", "Fruiting / nuts",
  "biggest", "high-risk", "dead standing",
  "A curated sample — “high-risk” is NYC forestry’s top risk rating (a maintenance flag). Full map:",
  // guide / compare
  "The common trees, roughly by how often you’ll see them on NYC streets. Tap a photo to enlarge.",
  "Don’t confuse with…", "See one feature across every tree, side by side.",
  "Leaf", "Bark", "Fruit", "Flower", "Form / whole tree",
  "form", "leaf", "bark", "fruit", "flower", "native", "invasive",
  // quiz
  "Recognition quiz", "Start a 10-question quiz", "Look-alikes", "Bark / leaf / fruit",
  "By features", "sharp eye 🌳", "getting there", "keep drilling", "Again", "Field guide",
  "correct", "score", "day streak",
  // progress
  "quizzed", "solid", "Export", "Import", "Reset all",
  // walk
  "Tree walk", "Reset walk", "🏅 Season complete — you found them all!",
  // fab
  "🌳 Quiz me", "Quick quiz", "Quick recognition quiz",
  // credits
  "Photo credits", "source",
];

// interpolated templates + values that render via t() in app.js (keep {placeholders})
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December"];
const FACTS = [
  "Flowering & fruiting in {month}",
  "NYC's most common tree is the {common} — about {count} of them, {pct}% of every tree in the city.",
  "The {common} is NYC's #2 tree — {count} of them line the streets.",
  "NYC's streets and parks are home to {n} different tree species.",
  "NYC Parks maps about {n} living trees across the five boroughs.",
  "{borough} has the most trees of any borough — around {n}.",
  "In {borough}, the most common tree is the {common} — bucking the citywide trend.",
  "The widest tree on record is a {common} with a {dbh}-inch trunk, in {borough}.",
  "The most-planted tree in {year} was the {common} — {n} new ones went in.",
  "NYC's biggest planting year lately was {year}, with {n} new trees.",
  "Callery pear is one of NYC's most common trees, but it's no longer planted — it's now considered invasive.",
];
// census common names (in the top-species bars) + boroughs not already covered by species.js
const EXTRA = ["Thornless honeylocust", "'Green leaf' Japanese flowering cherry", "swamp white oak",
  "Japanese flowering cherry", "Queens", "Brooklyn", "Manhattan", "Staten Island", "Bronx", "the Bronx",
  "NYC census · {count} trees · #{rank} · {pct}% of city · most in {borough}",
  // trait shorthand vocabulary (shown on the guide/tree-of-day cards)
  "alternate", "opposite", "simple", "compound", "needle", "scale", "fan",
  "toothed", "serrated", "lobed", "entire",
  "smooth", "furrowed", "ridged", "scaly", "exfoliating", "lenticels", "plated", "diamond", "mottled",
  "seed ball", "double samara", "acorn", "pod", "pome", "drupe", "nut", "samara", "capsule", "ginkgo seed"];

function loadSpecies() {
  const src = fs.readFileSync(path.join(__dirname, "..", "site", "species.js"), "utf8");
  const g = {};
  new Function("window", src)(g);
  const set = new Set();
  (g.NYCTREES_SPECIES || []).forEach((s) => {
    if (s.common) set.add(s.common);
    if (s.family) set.add(s.family);
    (s.fastId || []).forEach((x) => set.add(x));
    (s.confusableWith || []).forEach((c) => c.tell && set.add(c.tell));
  });
  return set;
}

function loadWalkTargets() {
  // pull the walk target label strings out of app.js
  const src = fs.readFileSync(path.join(__dirname, "..", "site", "app.js"), "utf8");
  const set = new Set();
  const re = /label:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(src))) set.add(m[1].replace(/\\"/g, '"'));
  return set;
}

async function translate(langName, strings) {
  const prompt =
    `You are a professional UI translator for a New York City street-tree learning web app.\n` +
    `Translate each English string into ${langName}. Return ONLY a JSON object mapping each exact ` +
    `English string (verbatim key) to its translation.\nRules:\n` +
    `- Natural, concise, UI-appropriate.\n` +
    `- Do NOT translate scientific/Latin plant names or proper nouns (NYC, New York, Callery, London).\n` +
    `- For tree common names, use the accepted common name in ${langName} if one exists, else a natural equivalent.\n` +
    `- Preserve emoji, punctuation, and any {placeholders} in braces.\n` +
    `Strings:\n${JSON.stringify(strings, null, 0)}`;
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-5.5", reasoning_effort: "low", max_completion_tokens: 32000,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  const j = await r.json();
  if (!j.choices) throw new Error("no choices: " + JSON.stringify(j).slice(0, 300));
  return JSON.parse(j.choices[0].message.content);
}

(async () => {
  const strings = Array.from(new Set([...UI, ...MONTHS, ...FACTS, ...EXTRA, ...loadSpecies(), ...loadWalkTargets()]));
  console.log(`translating ${strings.length} strings x ${LANGS.length} languages…`);
  const out = {};
  await Promise.all(LANGS.map(async ([code, name]) => {
    try {
      const map = await translate(name, strings);
      const clean = {};  // keep only keys we asked for (drop hallucinated extras / no-ops)
      strings.forEach((s) => { if (map[s] && map[s] !== s) clean[s] = map[s]; });
      out[code] = clean;
      console.log(`  ${code} (${name}): ${Object.keys(clean).length}/${strings.length}`);
    } catch (e) {
      console.error(`  ${code} FAILED: ${e.message}`);
    }
  }));
  const dst = path.join(__dirname, "..", "site", "i18n.js");
  fs.writeFileSync(dst, "// AUTO-GENERATED by scripts/build_i18n.js (GPT-5.5). Do not edit.\n" +
    "window.NYCTREES_I18N = " + JSON.stringify(out) + ";\n");
  console.log("wrote " + dst);
})();
