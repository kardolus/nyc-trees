/* NYC Trees — client app. Static, no backend; all state in localStorage. */
(function () {
  "use strict";
  var SPECIES = (window.NYCTREES_SPECIES || []).slice();
  var PHOTOS = (window.NYCTREES_PHOTOS || []).slice();
  var CREDITS = window.NYCTREES_CREDITS || [];

  // ---- indexes ----------------------------------------------------------------
  var byId = {}; SPECIES.forEach(function (s) { byId[s.id] = s; });
  var photosBySpecies = {}, photosByKey = {};
  PHOTOS.forEach(function (p) {
    (photosBySpecies[p.speciesId] = photosBySpecies[p.speciesId] || []).push(p);
    var k = p.speciesId + ":" + p.part;
    (photosByKey[k] = photosByKey[k] || []).push(p);
  });
  var PARTS = ["form", "leaf", "bark", "fruit", "flower"];
  function photosFor(id, part) { return part ? (photosByKey[id + ":" + part] || []) : (photosBySpecies[id] || []); }
  function heroPhoto(id) { var p = photosBySpecies[id] || []; return (photosByKey[id + ":leaf"] || photosByKey[id + ":form"] || p)[0] || p[0]; }

  // ---- state / Leitner --------------------------------------------------------
  var KEY = "nyctrees.v1";
  var INTERVALS = [0, 1, 2, 4, 8, 16]; // days by mastery 0..5
  function blank() { return { progress: {}, settings: { area: "all" }, stats: { streak: { count: 0, last: "" }, seen: 0, walk: {}, badges: {} } }; }
  var S = blank();
  try { var sv = JSON.parse(localStorage.getItem(KEY) || "{}"); S.progress = sv.progress || {}; S.settings = Object.assign(S.settings, sv.settings || {}); S.stats = Object.assign(S.stats, sv.stats || {}); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function todayStr() { return new Date().toISOString().slice(0, 10); }
  function addDays(d, n) { var t = new Date(d + "T00:00:00"); t.setDate(t.getDate() + n); return t.toISOString().slice(0, 10); }
  function prog(k) { return (S.progress[k] = S.progress[k] || { mastery: 0, due: "", hits: 0, misses: 0 }); }
  function bumpStreak() { var t = todayStr(), st = S.stats.streak; if (st.last === t) return; st.count = st.last === addDays(t, -1) ? st.count + 1 : 1; st.last = t; }
  function grade(k, result) {
    var p = prog(k);
    if (result === "right") { p.mastery = Math.min(5, p.mastery + 1); p.hits++; }
    else { p.mastery = Math.max(1, p.mastery - 2); p.misses++; }
    p.due = addDays(todayStr(), INTERVALS[p.mastery]); bumpStreak(); S.stats.seen++; save();
  }
  // per-species mastery = mean mastery over its seen keys (0..5)
  function speciesMastery(id) {
    var ks = Object.keys(S.progress).filter(function (k) { return k.indexOf(id + ":") === 0; });
    if (!ks.length) return 0;
    return ks.reduce(function (a, k) { return a + S.progress[k].mastery; }, 0) / ks.length;
  }

  // ---- dom helpers ------------------------------------------------------------
  var APP = document.getElementById("app");
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function on(sel, ev, fn) { Array.prototype.forEach.call(APP.querySelectorAll(sel), function (n) { n.addEventListener(ev, fn); }); }
  function track(name, data) { try { if (window.umami) umami.track(name, data); } catch (e) {} }
  function month() { return new Date().getMonth() + 1; }

  // ---- lightbox ---------------------------------------------------------------
  function openLightbox(photo, sp) {
    // Cycle through every photo of this tree (form/leaf/bark/fruit/flower) with ← → keys or the
    // on-screen arrows, so you can compare the parts of one species without leaving the lightbox.
    var list = sp ? (photosBySpecies[sp.id] || []) : [];
    if (list.indexOf(photo) < 0) list = [photo];
    var idx = Math.max(0, list.indexOf(photo)), multi = list.length > 1;
    var lb = document.createElement("div"); lb.className = "lb";
    lb.innerHTML = '<div class="lb-win">' +
      '<div class="lb-img">' + (multi ? '<button class="lb-nav prev" aria-label="Previous photo">‹</button>' : '') +
      '<img alt="">' + (multi ? '<button class="lb-nav next" aria-label="Next photo">›</button>' : '') + '</div>' +
      '<div class="lb-side"><button class="lb-close" aria-label="Close">×</button>' +
      (sp ? '<span class="part-tag"></span><h2>' + esc(sp.common) + '</h2><p class="meta"><i>' + esc(sp.scientific) + '</i></p>' : '') +
      (multi ? '<p class="meta mono lb-count"></p>' : '') +
      '<p class="cred meta"></p></div></div>';
    var img = lb.querySelector(".lb-img img"), tag = lb.querySelector(".part-tag"),
        cred = lb.querySelector(".cred"), count = lb.querySelector(".lb-count");
    function paint() {
      var p = list[idx];
      img.src = p.src; img.alt = (sp ? sp.common + " " : "") + p.part;
      if (tag) tag.textContent = p.part;
      if (count) count.textContent = (idx + 1) + " / " + list.length;
      cred.innerHTML = esc(p.attribution || "") + (p.sourceUrl ? ' · <a href="' + esc(p.sourceUrl) + '" target="_blank" rel="noopener">source</a>' : '');
      // preload neighbours for snappy stepping
      [list[(idx + 1) % list.length], list[(idx - 1 + list.length) % list.length]].forEach(function (n) { if (n) { var i = new Image(); i.src = n.src; } });
    }
    function go(d) { idx = (idx + d + list.length) % list.length; paint(); }
    function close() { document.removeEventListener("keydown", onKey); if (lb.parentNode) document.body.removeChild(lb); }
    function onKey(e) {
      if (e.key === "ArrowRight") { go(1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { go(-1); e.preventDefault(); }
      else if (e.key === "Escape") close();
    }
    lb.addEventListener("click", function (e) {
      var c = typeof e.target.className === "string" ? e.target.className : "";
      if (e.target === lb || c.indexOf("lb-close") >= 0) close();
      else if (c.indexOf("next") >= 0) go(1);
      else if (c.indexOf("prev") >= 0) go(-1);
    });
    document.addEventListener("keydown", onKey);
    paint();
    document.body.appendChild(lb);
  }
  window.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-photo]");
    if (t) { var ph = PHOTOS.find(function (p) { return p.id === t.getAttribute("data-photo"); }); if (ph) openLightbox(ph, byId[ph.speciesId]); }
  });

  // ---- quiz session (Drill + Now) ---------------------------------------------
  var QZ = null;
  function startQuiz(opts) {
    opts = opts || {};
    var ctx = { species: SPECIES, byId: byId, photosBySpecies: photosBySpecies, photosByKey: photosByKey, month: month() };
    var qs = window.NYCTREES_QUIZ.build(ctx, opts);
    if (!qs.length) { APP.innerHTML = '<div class="wrap"><p class="empty">No photos loaded yet.</p></div>'; return; }
    QZ = { qs: qs, i: 0, answered: false, chosen: null, right: 0, wrong: 0, label: opts.label || "Recognition quiz" };
    track("drill_start", { scope: opts.scope || "mixed", n: qs.length });
    if ((location.hash || "").indexOf("quiz") < 0) location.hash = "#/quiz";
    else drawQuiz();
  }
  function drawQuiz() {
    var q = QZ.qs[QZ.i];
    var body = '<div class="wrap quiz">';
    body += '<div class="qz-top"><span class="meta mono">' + esc(QZ.label) + ' · ' + (QZ.i + 1) + '/' + QZ.qs.length + '</span>' +
      '<span class="meta mono">✓ ' + QZ.right + ' · ✗ ' + QZ.wrong + '</span></div>';
    body += '<div class="qz-card"><h2 class="qz-q">' + esc(q.prompt) + '</h2>';
    if (q.photo) body += '<div class="qz-photo"><img loading="eager" src="' + esc(q.photo.src) + '" alt="tree photo"><span class="qz-cred meta">' + esc(q.photo.attribution || "") + '</span></div>';
    if (q.photoOptions) {
      body += '<div class="qz-photogrid">' + q.options.map(function (o, idx) {
        return '<button class="qz-opt-photo" data-i="' + idx + '"><img loading="lazy" src="' + esc(o.photo.thumb || o.photo.src) + '" alt="option"></button>';
      }).join("") + '</div>';
    } else {
      body += '<div class="qz-opts">' + q.options.map(function (o, idx) {
        return '<button class="qz-opt" data-i="' + idx + '">' + esc(o.label) + '</button>';
      }).join("") + '</div>';
    }
    body += '<div class="qz-feedback" id="qz-fb"></div>';
    body += '<div class="qz-actions" id="qz-actions"></div>';
    body += '</div></div>';
    APP.innerHTML = body;
    on(".qz-opt,.qz-opt-photo", "click", function () { if (!QZ.answered) answer(parseInt(this.getAttribute("data-i"), 10)); });
  }
  function answer(idx) {
    var q = QZ.qs[QZ.i]; QZ.answered = true; QZ.chosen = idx;
    var ok = q.options[idx].value === q.correct;
    if (ok) QZ.right++; else QZ.wrong++;
    grade(q.key, ok ? "right" : "wrong");
    track("drill_answer", { type: q.type, ok: ok });
    var opts = APP.querySelectorAll(".qz-opt,.qz-opt-photo");
    Array.prototype.forEach.call(opts, function (n, i) {
      if (q.options[i].value === q.correct) n.classList.add("right");
      else if (i === idx) n.classList.add("wrong");
      n.disabled = true;
    });
    $("qz-fb").innerHTML = '<div class="fb ' + (ok ? "good" : "bad") + '">' + (ok ? "✓ " : "✗ ") + esc(q.explain) + '</div>';
    var last = QZ.i >= QZ.qs.length - 1;
    $("qz-actions").innerHTML = '<button class="btn primary" id="qz-next">' + (last ? "See score" : "Next →") + '</button>';
    $("qz-next").addEventListener("click", function () { if (last) endQuiz(); else { QZ.i++; QZ.answered = false; drawQuiz(); } });
  }
  function endQuiz() {
    var pct = Math.round(100 * QZ.right / QZ.qs.length);
    var verd = pct >= 80 ? "sharp eye 🌳" : pct >= 55 ? "getting there" : "keep drilling";
    APP.innerHTML = '<div class="wrap"><div class="scorecard"><div class="verdict">' + esc(verd) + '</div>' +
      '<div class="kpis"><div class="kpi"><b>' + QZ.right + '/' + QZ.qs.length + '</b><span>correct</span></div>' +
      '<div class="kpi"><b>' + pct + '%</b><span>score</span></div>' +
      '<div class="kpi"><b>' + S.stats.streak.count + '</b><span>day streak</span></div></div>' +
      '<div class="row"><button class="btn primary" onclick="location.hash=\'#/home\'">Again</button>' +
      '<button class="btn" onclick="location.hash=\'#/learn\'">Field guide</button></div></div></div>';
    track("drill_done", { pct: pct });
  }

  // ---- Quiz (recognition) + Progress, as one tab with a segmented toggle ------
  var QUIZ_SEG = [["#/quiz", "Quiz", "quiz"], ["#/quiz/progress", "Progress", "progress"]];
  var LEARN_SEG = [["#/learn", "Guide", "guide"], ["#/learn/compare", "Compare", "compare"]];
  function seg(items, active) {
    return '<div class="seg">' + items.map(function (it) {
      return '<a href="' + it[0] + '" class="seg-btn' + (active === it[2] ? " active" : "") + '">' + it[1] + '</a>';
    }).join("") + '</div>';
  }
  function renderQuiz() {
    var sub = (location.hash.split("/")[2] || "").toLowerCase();
    // an in-progress quiz takes over the quiz sub-view, but you can still peek at Progress
    if (sub !== "progress" && QZ && !QZ.done && QZ.i < QZ.qs.length) { drawQuiz(); return; }
    if (sub === "progress") renderProgress(); else renderQuizStart();
  }
  function renderQuizStart() {
    var mastered = SPECIES.filter(function (s) { return speciesMastery(s.id) >= 4; }).length;
    APP.innerHTML = '<div class="wrap home">' + seg(QUIZ_SEG, "quiz") +
      '<h1>Recognition quiz</h1>' +
      '<p class="sub">Photo in, tree out. ' + SPECIES.length + ' common NYC trees · ' + mastered + ' well-known · ' + S.stats.streak.count + '-day streak.</p>' +
      '<div class="drill-cta"><button class="btn primary big" id="d-mixed">Start a 10-question quiz</button></div>' +
      '<div class="drill-modes">' +
      '<button class="chip" id="d-conf">Look-alikes</button>' +
      '<button class="chip" id="d-parts">Bark / leaf / fruit</button>' +
      '<button class="chip" id="d-feat">By features</button>' +
      '</div></div>';
    $("d-mixed").onclick = function () { startQuiz({ scope: "mixed", count: 10, label: "Recognition quiz" }); };
    $("d-conf").onclick = function () { startQuiz({ scope: "confusable", count: 10, label: "Look-alikes" }); };
    $("d-parts").onclick = function () { startQuiz({ scope: "parts", count: 10, label: "Bark / leaf / fruit" }); };
    $("d-feat").onclick = function () { startQuiz({ scope: "feature", count: 10, label: "By features" }); };
  }

  // ---- Field Guide ------------------------------------------------------------
  function statusTag(s) { return (s.nycStatus || []).indexOf("invasive") >= 0 ? '<span class="tag bad">invasive</span>' : (s.native ? '<span class="tag good">native</span>' : ''); }
  // Learn = Guide (species cards) + Compare (one feature across all trees), one tab, segmented
  function renderLearn() {
    var sub = (location.hash.split("/")[2] || "").toLowerCase();
    if (sub === "compare") renderCompare(); else renderGuide();
  }
  function renderGuide() {
    var list = SPECIES.slice().sort(function (a, b) { return (a.nycRank || 99) - (b.nycRank || 99); });
    APP.innerHTML = '<div class="wrap">' + seg(LEARN_SEG, "guide") +
      '<p class="sub">The common trees, roughly by how often you’ll see them on NYC streets. Tap a photo to enlarge.</p>' +
      '<div class="species-list">' + list.map(guideCard).join("") + '</div></div>';
    fillCensus();
  }
  // ---- Atlas (live NYC tree-census) hooks — degrade gracefully if /atlas is down ----
  var _census = null;
  function censusData(cb) {
    if (_census) return cb(_census);
    fetch("/atlas/api/species?limit=100").then(function (r) { return r.json(); })
      .then(function (o) { _census = (o && o.data) || []; cb(_census); })
      .catch(function () { _census = []; cb(_census); });
  }
  function fillCensus() {
    var els = APP.querySelectorAll(".census[data-census]");
    if (!els.length) return;
    censusData(function (list) {
      Array.prototype.forEach.call(els, function (el) {
        var key = el.getAttribute("data-census"), m = null;
        for (var i = 0; i < list.length; i++) {
          if (((list[i].scientific || "").replace("×", "x").toLowerCase()).indexOf(key) === 0) { m = list[i]; break; }
        }
        if (!m) return;
        el.textContent = "NYC census · " + m.count.toLocaleString() + " trees · #" + m.rank +
          " · " + m.pct + "% of city" + (m.borough ? " · most in " + m.borough : "");
        el.classList.add("show");
      });
    });
  }
  // ---- Atlas panels on Home (compact charts + map from the live /atlas/api) ----
  var _atlasChart = null, _atlasMap = null, _atlasTiles = null;
  function renderAtlasPanels() {
    fetch("/atlas/api/species?limit=8").then(function (r) { return r.json(); }).then(function (o) {
      var sp = (o && o.data) || [], el = document.getElementById("atlas-species"); if (!el) return;
      if (!sp.length) { el.textContent = "—"; return; }
      var max = sp[0].count || 1;
      var kNum = function (n) { return n >= 1000 ? Math.round(n / 1000) + "k" : "" + n; };
      el.innerHTML = sp.map(function (x) {
        return '<div class="bar-row"><span class="nm" title="' + esc(x.scientific || "") + '">' + x.rank + '. ' + esc(x.common || x.scientific) + '</span>' +
          '<span class="track"><i style="width:' + Math.max(2, 100 * x.count / max) + '%"></i></span>' +
          '<span class="val" title="' + x.count.toLocaleString() + ' trees">' + kNum(x.count) + ' · ' + x.pct + '%</span></div>';
      }).join("");
    }).catch(function () {});
    fetch("/atlas/api/planting").then(function (r) { return r.json(); }).then(function (o) { atlasPlanting((o && o.data) || []); }).catch(function () {});
    atlasMap();
  }
  function _cssvar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function atlasPlanting(pl) {
    var ctx = document.getElementById("atlas-planting"); if (!ctx || !window.Chart) return;
    if (_atlasChart) _atlasChart.destroy();
    _atlasChart = new Chart(ctx, { type: "bar",
      data: { labels: pl.map(function (x) { return x.yr; }), datasets: [{ data: pl.map(function (x) { return x.n; }), backgroundColor: _cssvar("--accent"), borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false }, ticks: { color: _cssvar("--meta"), maxRotation: 0 } }, y: { grid: { color: "#8884" }, ticks: { color: _cssvar("--meta") } } } } });
  }
  function _tileUrl() { return document.documentElement.classList.contains("dark")
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"; }
  function atlasMap() {
    if (!window.L) return void setTimeout(atlasMap, 200);
    if (!document.getElementById("atlas-map")) return;
    if (_atlasMap) { _atlasMap.remove(); _atlasMap = null; }
    fetch("/atlas/api/notable").then(function (r) { return r.json(); }).then(function (o) {
      if (!document.getElementById("atlas-map")) return;
      var data = (o && o.data) || [], KIND = { biggest: "#1da46c", risk: "#d98a00", dead: "#8b949e" };
      _atlasMap = L.map("atlas-map", { scrollWheelZoom: false }).setView([40.70, -73.92], 10);
      _atlasTiles = L.tileLayer(_tileUrl(), { attribution: "&copy; OpenStreetMap &copy; CARTO", subdomains: "abcd", maxZoom: 19 }).addTo(_atlasMap);
      data.forEach(function (t) {
        L.circleMarker([t.lat, t.lon], { radius: 4, color: KIND[t.kind] || "#1da46c", weight: 1, fillOpacity: .8 })
          .bindPopup('<b>' + esc(t.common || "tree") + '</b><br>' + (t.dbh ? "trunk " + t.dbh + "&Prime; · " : "") + esc([t.nta, t.borough].filter(Boolean).join(", "))).addTo(_atlasMap);
      });
    }).catch(function () {});
  }
  window.addEventListener("themechange", function () {
    if (_atlasTiles) _atlasTiles.setUrl(_tileUrl());
    if (_atlasChart) fetch("/atlas/api/planting").then(function (r) { return r.json(); }).then(function (o) { atlasPlanting((o && o.data) || []); });
  });
  function guideCard(s) {
    var strip = PARTS.map(function (part) {
      var ph = photosFor(s.id, part)[0]; if (!ph) return "";
      return '<figure class="ph" data-photo="' + esc(ph.id) + '"><img loading="lazy" src="' + esc(ph.thumb || ph.src) + '" alt="' + esc(s.common + " " + part) + '"><figcaption>' + esc(part) + '</figcaption></figure>';
    }).join("");
    var conf = (s.confusableWith || []).map(function (c) { var o = byId[c.id]; return o ? '<li><b>' + esc(o.common) + '</b> — ' + esc(c.tell) + '</li>' : ''; }).join("");
    var t = s.traits;
    return '<article class="sp-card"><header><div><h2>' + esc(s.common) + ' ' + statusTag(s) + '</h2>' +
      '<p class="meta"><i>' + esc(s.scientific) + '</i> · ' + esc(s.family) + '</p></div>' +
      '<div class="mastery-dot m' + Math.round(speciesMastery(s.id)) + '" title="familiarity"></div></header>' +
      '<div class="strip">' + strip + '</div>' +
      '<ul class="fastid">' + (s.fastId || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>' +
      '<p class="traits meta">' + esc(t.arrangement) + ' · ' + esc(t.leafType) + ' · ' + esc(t.margin) + ' · ' + esc((t.bark || []).join("/")) + ' bark · ' + esc(t.fruit.replace(/-/g, " ")) + '</p>' +
      '<p class="census" data-census="' + esc((s.scientific || "").replace("×", "x").toLowerCase()) + '"></p>' +
      (conf ? '<details class="confuse"><summary>Don’t confuse with…</summary><ul>' + conf + '</ul></details>' : '') +
      '</article>';
  }

  // ---- Compare (one feature across every tree) --------------------------------
  var CMP_PARTS = [["leaf", "Leaf"], ["bark", "Bark"], ["fruit", "Fruit"], ["flower", "Flower"], ["form", "Form / whole tree"]];
  var CMP = "leaf";
  function renderCompare() {
    if (!CMP_PARTS.some(function (p) { return p[0] === CMP; })) CMP = "leaf";
    var opts = CMP_PARTS.map(function (p) { return '<option value="' + p[0] + '"' + (CMP === p[0] ? " selected" : "") + '>' + p[1] + '</option>'; }).join("");
    var list = SPECIES.filter(function (s) { return photosFor(s.id, CMP)[0]; })
      .sort(function (a, b) { return a.common.localeCompare(b.common); });
    var tiles = list.map(function (s) {
      var ph = photosFor(s.id, CMP)[0];
      return '<button class="key-tile" data-photo="' + esc(ph.id) + '"><img loading="lazy" src="' + esc(ph.thumb || ph.src) + '" alt="' + esc(s.common + " " + CMP) + '"><span>' + esc(s.common) + '</span></button>';
    }).join("");
    APP.innerHTML = '<div class="wrap">' + seg(LEARN_SEG, "compare") +
      '<p class="sub">See one feature across every tree, side by side.</p>' +
      '<div class="cmp-bar"><label class="cmp-l" for="cmp-sel">Compare</label>' +
      '<select id="cmp-sel" class="cmp-sel">' + opts + '</select>' +
      '<span class="meta count">' + list.length + ' trees</span></div>' +
      '<div class="key-grid">' + tiles + '</div></div>';
    $("cmp-sel").onchange = function () { CMP = this.value; renderCompare(); };
  }

  // ---- Tree Walk (seasonal spotting) -----------------------------------------
  function walkTargets() {
    // pic = [speciesId, part] -> a representative example photo of the feature to hunt for
    var m = month(), t = [
      { id: "opp", label: "A tree with OPPOSITE branches/leaves (maple, ash, horse chestnut)", pic: ["acer-rubrum", "leaf"] },
      { id: "compound", label: "A compound leaf (honeylocust, ash, pagoda tree)", pic: ["gleditsia-triacanthos", "leaf"] },
      { id: "exfol", label: "Exfoliating / mottled bark (London planetree)", pic: ["platanus-acerifolia", "bark"] },
      { id: "fan", label: "A ginkgo fan-shaped leaf", pic: ["ginkgo-biloba", "leaf"] },
      { id: "samara", label: "A winged samara (maple or ash)", pic: ["acer-platanoides", "fruit"] },
      { id: "acorn", label: "An oak with acorns", pic: ["quercus-rubra", "fruit"] },
      { id: "star", label: "A star-shaped sweetgum leaf (or its spiky ball)", pic: ["liquidambar-styraciflua", "leaf"] }
    ];
    if ([9, 10, 11].indexOf(m) >= 0) t.push({ id: "fall-fruit", label: "Fall fruit/nut on the ground: acorn, ginkgo, conker, or honeylocust pod", pic: ["aesculus-hippocastanum", "fruit"] });
    if ([4, 5].indexOf(m) >= 0) t.push({ id: "spring-flower", label: "Spring blossom: Callery pear, cherry, or redbud", pic: ["pyrus-calleryana", "flower"] });
    return t;
  }
  function renderWalk() {
    var tg = walkTargets(), w = S.stats.walk || (S.stats.walk = {}), done = tg.filter(function (x) { return w[x.id]; }).length;
    APP.innerHTML = '<div class="wrap"><h1>Tree walk</h1><p class="sub">Take this outside. Spot each one on a real NYC block or in a park — tap when you find it. ' + done + '/' + tg.length + ' this season.</p>' +
      '<ul class="walk">' + tg.map(function (x) {
        var ph = x.pic && photosFor(x.pic[0], x.pic[1])[0];
        return '<li class="walk-item' + (w[x.id] ? " done" : "") + '" data-w="' + x.id + '"><span class="tick">' + (w[x.id] ? "✓" : "○") + '</span>' +
          (ph ? '<img class="walk-pic" loading="lazy" src="' + esc(ph.thumb || ph.src) + '" alt="" data-photo="' + esc(ph.id) + '">' : '') +
          '<span class="walk-label">' + esc(x.label) + '</span></li>';
      }).join("") + '</ul>' +
      (done === tg.length ? '<p class="badge">🏅 Season complete — you found them all!</p>' : '') +
      '<button class="btn" id="walk-reset">Reset walk</button></div>';
    on(".walk-item", "click", function (e) { if (e.target.closest("[data-photo]")) return; var k = this.getAttribute("data-w"); S.stats.walk[k] = !S.stats.walk[k]; save(); track("walk_spot", { t: k }); renderWalk(); });
    $("walk-reset").onclick = function () { S.stats.walk = {}; save(); renderWalk(); };
  }

  // ---- Home (landing: what's out now) ----------------------------------------
  function renderHome() {
    var m = month(), names = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var flowering = SPECIES.filter(function (s) { return (s.season && s.season.flower || []).indexOf(m) >= 0; });
    var fruiting = SPECIES.filter(function (s) { return (s.season && s.season.fruit || []).indexOf(m) >= 0; });
    function grid(list, label) {
      if (!list.length) return '<p class="meta">Nothing notable ' + label + ' in ' + names[m] + '.</p>';
      var part = label === "flowering" ? "flower" : "fruit", alt = part === "flower" ? "fruit" : "flower";
      return '<div class="now-grid">' + list.map(function (s) { var ph = photosFor(s.id, part)[0] || photosFor(s.id, alt)[0] || heroPhoto(s.id);
        return '<button class="key-tile"' + (ph ? ' data-photo="' + esc(ph.id) + '"' : '') + '>' + (ph ? '<img loading="lazy" src="' + esc(ph.thumb || ph.src) + '" alt="' + esc(s.common) + '">' : '') + '<span>' + esc(s.common) + '</span></button>';
      }).join("") + '</div>';
    }
    // Tree of the day: a deterministic daily pick that ISN'T already shown in the
    // seasonal lists (keeps it fresh). Same tree for everyone on a given day; rotates daily.
    var shown = {}; flowering.concat(fruiting).forEach(function (s) { shown[s.id] = 1; });
    var pool = SPECIES.filter(function (s) { return !shown[s.id]; });
    if (!pool.length) pool = SPECIES.slice();
    var seed = todayStr(), h = 0; for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    var totd = pool[h % pool.length];
    function secHero(ico, title, sub) {
      return '<div class="sec-hero"><span class="sec-ico">' + ico + '</span><div><h2>' + title + '</h2>' +
        (sub ? '<p class="sec-sub">' + sub + '</p>' : '') + '</div></div>';
    }
    var mapPanel = '<div class="card"><div id="atlas-map"></div>' +
      '<div class="map-legend"><span><b style="background:#1da46c"></b>biggest</span>' +
      '<span><b style="background:#d98a00"></b>high-risk</span>' +
      '<span><b style="background:#8b949e"></b>dead standing</span></div>' +
      '<p class="disclaimer">A curated sample — “high-risk” is NYC forestry’s top risk rating (a maintenance flag). ' +
      'Full map: <a href="https://tree-map.nycgovparks.org" target="_blank" rel="noopener">NYC Tree Map</a>.</p></div>';
    APP.innerHTML = '<div class="wrap">' +
      '<div class="home-cols">' +
        '<section class="home-col">' + secHero("🌳", "Tree of the day", "A new tree to learn every day") +
          '<div class="species-list totd">' + guideCard(totd) + '</div>' +
          secHero("💡", "Did you know?", "a new fact every day") +
          '<div class="card dyk-card"><p id="dyk-fact" class="dyk-fact">…</p></div>' +
        '</section>' +
        '<section class="home-col">' + secHero("🌸", "Now", "Flowering &amp; fruiting in " + names[m]) +
          '<h4 class="now-sub">Flowering</h4>' + grid(flowering, "flowering") +
          '<h4 class="now-sub">Fruiting / nuts</h4>' + grid(fruiting, "fruiting") +
          secHero("🌱", "Planting over time", "new trees recorded per year") +
          '<div class="card"><div class="chartwrap"><canvas id="atlas-planting"></canvas></div></div>' +
        '</section>' +
      '</div>' +
      '<div class="data-cols">' +
        '<section>' + secHero("🥇", "Most common trees", "living, city-wide · share of all") +
          '<div class="card"><div class="bars" id="atlas-species">…</div></div></section>' +
        '<section>' + secHero("📍", "Biggest &amp; notable trees", "the city’s superlatives") + mapPanel + '</section>' +
      '</div></div>';
    fillCensus();
    fillDyk();
    renderAtlasPanels();
  }
  function fillDyk() {
    var el = document.getElementById("dyk-fact"); if (!el) return;
    fetch("/atlas/api/facts").then(function (r) { return r.json(); }).then(function (o) {
      var f = (o && o.data) || []; if (!f.length) { el.textContent = ""; return; }
      var s = todayStr() + "dyk", h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
      el.textContent = f[h % f.length];
    }).catch(function () {});
  }

  // ---- Progress ---------------------------------------------------------------
  function renderProgress() {
    var rows = SPECIES.slice().sort(function (a, b) { return speciesMastery(b.id) - speciesMastery(a.id); }).map(function (s) {
      var m = speciesMastery(s.id), pc = Math.round(100 * m / 5);
      return '<div class="pr-row"><span>' + esc(s.common) + '</span><div class="bar"><i style="width:' + pc + '%"></i></div><span class="meta mono">' + Math.round(m * 20) + '%</span></div>';
    }).join("");
    var weak = SPECIES.filter(function (s) { return speciesMastery(s.id) > 0 && speciesMastery(s.id) < 3; });
    APP.innerHTML = '<div class="wrap">' + seg(QUIZ_SEG, "progress") +
      '<div class="kpis"><div class="kpi"><b>' + S.stats.streak.count + '</b><span>day streak</span></div>' +
      '<div class="kpi"><b>' + (S.stats.seen || 0) + '</b><span>quizzed</span></div>' +
      '<div class="kpi"><b>' + SPECIES.filter(function (s) { return speciesMastery(s.id) >= 4; }).length + '/' + SPECIES.length + '</b><span>solid</span></div></div>' +
      (weak.length ? '<div class="row"><button class="btn primary" id="pr-weak">Quiz your ' + weak.length + ' weak spots</button></div>' : '') +
      '<div class="pr-list">' + rows + '</div>' +
      '<div class="row"><button class="btn" id="pr-export">Export</button><button class="btn" id="pr-import">Import</button><button class="btn bad" id="pr-reset">Reset all</button></div></div>';
    if (weak.length) $("pr-weak").onclick = function () { startQuiz({ scope: "mixed", count: 10, speciesPool: weak, label: "Weak spots" }); };
    $("pr-export").onclick = function () { var b = new Blob([JSON.stringify(S)], { type: "application/json" }); var a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "nyc-trees-progress.json"; a.click(); };
    $("pr-import").onclick = function () { var i = document.createElement("input"); i.type = "file"; i.accept = "application/json"; i.onchange = function () { var f = i.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { try { var d = JSON.parse(r.result); S.progress = d.progress || {}; S.stats = Object.assign(S.stats, d.stats || {}); save(); renderProgress(); } catch (e) { alert("Bad file"); } }; r.readAsText(f); }; i.click(); };
    $("pr-reset").onclick = function () { if (confirm("Erase all progress?")) { S = blank(); save(); renderProgress(); } };
  }

  // ---- Credits ----------------------------------------------------------------
  function renderCredits() {
    var byS = {}; CREDITS.forEach(function (c) { (byS[c.speciesId] = byS[c.speciesId] || []).push(c); });
    APP.innerHTML = '<div class="wrap"><h1>Photo credits</h1><p class="sub">Every photo is Creative-Commons or public-domain, from Wikimedia Commons and iNaturalist. Thank you to the photographers.</p>' +
      Object.keys(byS).map(function (id) {
        return '<div class="cred-block"><h3>' + esc((byId[id] || {}).common || id) + '</h3><ul class="meta">' +
          byS[id].map(function (c) { return '<li>' + esc(c.part) + ': ' + esc(c.attribution) + (c.sourceUrl ? ' · <a href="' + esc(c.sourceUrl) + '" target="_blank" rel="noopener">source</a>' : '') + '</li>'; }).join("") + '</ul></div>';
      }).join("") + '</div>';
  }

  // ---- router -----------------------------------------------------------------
  var ROUTES = { home: renderHome, learn: renderLearn, walk: renderWalk, quiz: renderQuiz, credits: renderCredits };
  function route() {
    var name = (location.hash.replace(/^#\//, "") || "home").split("/")[0];
    if (name === "progress") { location.hash = "#/quiz/progress"; return; }             // legacy deep link
    if (name === "guide") { location.hash = "#/learn"; return; }                        // legacy deep link
    if (name === "key" || name === "compare") { location.hash = "#/learn/compare"; return; }  // legacy deep link
    if (!ROUTES[name]) name = "home";
    if (name !== "quiz") QZ = null;
    Array.prototype.forEach.call(document.querySelectorAll("#nav a"), function (a) { a.classList.toggle("active", a.getAttribute("data-route") === name); });
    var fabEl = document.getElementById("fab"); if (fabEl) fabEl.style.display = (name === "quiz") ? "none" : "";
    ROUTES[name](); window.scrollTo(0, 0);
    track("mode_enter", { mode: name });
  }
  window.addEventListener("hashchange", route);
  var fab = document.getElementById("fab"); if (fab) fab.onclick = function () { startQuiz({ scope: "mixed", count: 5, label: "Quick quiz" }); };

  // ---- boot -------------------------------------------------------------------
  var fc = document.getElementById("foot-count"); if (fc) fc.textContent = SPECIES.length + " NYC trees";
  if (!location.hash) location.hash = "#/home";
  route();
})();
