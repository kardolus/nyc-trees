// NYC Trees — quiz question generators. window.NYCTREES_QUIZ.build(ctx, opts) -> [question].
// ctx: { species:[...], photosBySpecies:{id:[photo]}, photosByKey:{ "id:part":[photo] }, month }
// A question is: { type, prompt, photo, options:[{label,value,photo?}], correct, explain, key }
//   key = "<speciesId>:<part>" for Leitner grading (or "<speciesId>:mix").
(function () {
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function sample(a, n) { return shuffle(a).slice(0, n); }

  // plausible wrong species: prefer this species' confusables, then same fruit/arrangement, then any.
  function distractors(ctx, sp, n) {
    var pool = [], seen = {}; seen[sp.id] = 1;
    (sp.confusableWith || []).forEach(function (c) { var s = ctx.byId[c.id]; if (s && !seen[s.id]) { pool.push(s); seen[s.id] = 1; } });
    ctx.species.forEach(function (s) { if (!seen[s.id] && (s.traits.fruit === sp.traits.fruit || s.traits.arrangement === sp.traits.arrangement)) { pool.push(s); seen[s.id] = 1; } });
    ctx.species.forEach(function (s) { if (!seen[s.id]) { pool.push(s); seen[s.id] = 1; } });
    return pool.slice(0, n);
  }

  function traitBlurb(sp) {
    var t = sp.traits;
    return t.arrangement + " · " + (t.leafType === "compound" ? "compound" : t.margin) + " leaves · " +
      (t.bark || []).join("/") + " bark · " + t.fruit.replace(/-/g, " ");
  }

  // 1. photo -> species (the core drill). part optional (else any photo).
  function qPhotoSpecies(ctx, sp, part) {
    var pool = part ? (ctx.photosByKey[sp.id + ":" + part] || []) : (ctx.photosBySpecies[sp.id] || []);
    if (!pool.length) return null;
    var ph = pick(pool);
    var opts = shuffle([sp].concat(distractors(ctx, sp, 3))).map(function (s) { return { label: s.common, value: s.id }; });
    return { type: "photo_species", prompt: part ? ("What tree — by its " + part + "?") : "What tree is this?",
      photo: ph, options: opts, correct: sp.id, explain: sp.common + " — " + traitBlurb(sp) + ".", key: sp.id + ":" + (ph.part || "mix") };
  }

  // 2. confusable pair — same as photo_species but options forced to the look-alike pair + 2.
  function qConfusable(ctx, sp) {
    var cw = (sp.confusableWith || []).map(function (c) { return ctx.byId[c.id]; }).filter(Boolean);
    if (!cw.length) return null;
    var pool = ctx.photosBySpecies[sp.id] || []; if (!pool.length) return null;
    var ph = pick(pool);
    var others = cw.concat(distractors(ctx, sp, 3)).filter(function (s, i, a) { return s.id !== sp.id && a.indexOf(s) === i; }).slice(0, 3);
    var tell = (sp.confusableWith[0] || {}).tell || traitBlurb(sp);
    return { type: "confusable", prompt: "Look-alike check — which one?", photo: ph,
      options: shuffle([sp].concat(others)).map(function (s) { return { label: s.common, value: s.id }; }),
      correct: sp.id, explain: sp.common + " — " + tell, key: sp.id + ":" + (ph.part || "mix") };
  }

  // 3. pick the correct part photo — "which is the BARK of X?"
  function qPickPart(ctx, sp, part) {
    var right = ctx.photosByKey[sp.id + ":" + part]; if (!right || !right.length) return null;
    var wrongs = [];
    ctx.species.forEach(function (s) { if (s.id !== sp.id) { var p = ctx.photosByKey[s.id + ":" + part]; if (p && p.length) wrongs.push(pick(p)); } });
    if (wrongs.length < 3) return null;
    var correctPhoto = pick(right);
    var opts = shuffle([{ photo: correctPhoto, value: correctPhoto.id }].concat(sample(wrongs, 3).map(function (p) { return { photo: p, value: p.id }; })));
    return { type: "pick_part", prompt: "Which is the " + part + " of " + sp.common + "?", photo: null,
      options: opts, correct: correctPhoto.id, explain: traitBlurb(sp) + ".", key: sp.id + ":" + part, photoOptions: true };
  }

  // 4. feature -> species (teaches the ID skill; no photo).
  function qFeature(ctx, sp) {
    var opts = shuffle([sp].concat(distractors(ctx, sp, 3))).map(function (s) { return { label: s.common, value: s.id }; });
    return { type: "feature", prompt: "Which tree has — " + traitBlurb(sp) + "?", photo: null,
      options: opts, correct: sp.id, explain: sp.common + (sp.fastId && sp.fastId[0] ? " — " + sp.fastId[0] : ""), key: sp.id + ":feature" };
  }

  function build(ctx, opts) {
    opts = opts || {};
    var scope = opts.scope || "mixed";
    var count = opts.count || 10;
    var pool = opts.speciesPool || ctx.species;
    var qs = [], guard = 0;
    while (qs.length < count && guard++ < count * 12) {
      var sp = pick(pool), q = null, r = Math.random();
      if (scope === "confusable") q = qConfusable(ctx, sp) || qPhotoSpecies(ctx, sp);
      else if (scope === "feature") q = qFeature(ctx, sp);
      else if (scope === "parts") q = qPickPart(ctx, sp, pick(["bark", "leaf", "fruit"])) || qPhotoSpecies(ctx, sp);
      else { // mixed: mostly photo-recognition, sprinkle the others
        if (r < 0.55) q = qPhotoSpecies(ctx, sp, pick(["leaf", "bark", "fruit", "form"]));
        else if (r < 0.72) q = qConfusable(ctx, sp);
        else if (r < 0.86) q = qPickPart(ctx, sp, pick(["bark", "leaf", "fruit"]));
        else q = qFeature(ctx, sp);
        if (!q) q = qPhotoSpecies(ctx, sp);
      }
      if (q) qs.push(q);
    }
    return qs;
  }

  window.NYCTREES_QUIZ = { build: build };
})();
