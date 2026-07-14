// NYC tree recognition — species reference data
// Common NYC street/park trees (2015 Street Tree Census) plus a few
// recognizable park/nut trees. Field guide cues are tuned for at-a-glance
// identification in the five boroughs.
window.NYCTREES_SPECIES = [
  {
    id: "platanus-acerifolia",
    common: "London planetree",
    scientific: "Platanus × acerifolia",
    family: "Platanaceae",
    nycRank: 1,
    nycStatus: ["street", "park", "ornamental"],
    native: false,
    fastId: [
      "Camo bark flaking to cream, olive and gray",
      "Big maple-like leaf but leaves ALTERNATE",
      "Dangling 'seed balls' on long stalks"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "simple",
      margin: "toothed",
      lobing: "palmate-lobed",
      bark: ["exfoliating", "mottled"],
      fruit: "seed-ball"
    },
    season: { flower: [4, 5], fruit: [9, 10, 11] },
    confusableWith: [
      { id: "acer-platanoides", tell: "Maples are OPPOSITE; planetree is alternate with mottled camo bark and hanging seed balls" }
    ],
    fruitKeyword: "seed ball",
    inaturalistTaxonId: 552449
  },
  {
    id: "acer-platanoides",
    common: "Norway maple",
    scientific: "Acer platanoides",
    family: "Sapindaceae",
    nycRank: 2,
    nycStatus: ["street", "park", "invasive"],
    native: false,
    fastId: [
      "Broad 5-lobed leaf wider than long, points on the teeth",
      "Broken leaf stalk oozes MILKY white sap",
      "Wide-spread (~180°) double samaras"
    ],
    traits: {
      arrangement: "opposite",
      leafType: "simple",
      margin: "lobed",
      lobing: "palmate-lobed",
      bark: ["furrowed", "ridged"],
      fruit: "double-samara"
    },
    season: { flower: [4], fruit: [9, 10] },
    confusableWith: [
      { id: "acer-saccharum", tell: "Snap the leaf stalk: Norway bleeds milky white, sugar maple runs clear; Norway samaras spread nearly flat" },
      { id: "acer-rubrum", tell: "Norway leaf is broad with pointed teeth; red maple is smaller with silvery underside and red stalks" }
    ],
    fruitKeyword: "samara",
    inaturalistTaxonId: 54763
  },
  {
    id: "pyrus-calleryana",
    common: "Callery pear",
    scientific: "Pyrus calleryana",
    family: "Rosaceae",
    nycRank: 3,
    nycStatus: ["street", "ornamental", "invasive"],
    native: false,
    fastId: [
      "Cloud of white flowers in early spring (fishy smell)",
      "Glossy, rounded, finely scalloped leaves",
      "Tight upright 'Bradford' teardrop crown"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "simple",
      margin: "toothed",
      lobing: "none",
      bark: ["furrowed", "scaly"],
      fruit: "pome"
    },
    season: { flower: [3, 4], fruit: [9, 10, 11] },
    confusableWith: [
      { id: "prunus-serotina", tell: "Pear leaves are glossy and rounded with tiny hard pomes; black cherry has horizontal lenticel bands and dangling black drupes" }
    ],
    fruitKeyword: "fruit",
    inaturalistTaxonId: 119793
  },
  {
    id: "gleditsia-triacanthos",
    common: "honeylocust",
    scientific: "Gleditsia triacanthos",
    family: "Fabaceae",
    nycRank: 4,
    nycStatus: ["street", "park", "native"],
    native: true,
    fastId: [
      "Fine, ferny once- or twice-compound leaves (dappled shade)",
      "Long twisted flat brown pods",
      "Wild type has branched thorns on the trunk"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "compound",
      margin: "toothed",
      lobing: "pinnate-compound",
      bark: ["ridged", "plated"],
      fruit: "pod"
    },
    season: { flower: [5, 6], fruit: [9, 10, 11] },
    confusableWith: [
      { id: "styphnolobium-japonicum", tell: "Honeylocust often bipinnate with twisted pods and trunk thorns; pagoda tree has smooth green twigs and beaded pods" },
      { id: "fraxinus-pennsylvanica", tell: "Honeylocust is ALTERNATE with tiny leaflets; ash is OPPOSITE with larger toothed leaflets" }
    ],
    fruitKeyword: "pods",
    inaturalistTaxonId: 54797
  },
  {
    id: "quercus-palustris",
    common: "pin oak",
    scientific: "Quercus palustris",
    family: "Fagaceae",
    nycRank: 5,
    nycStatus: ["street", "park", "native"],
    native: true,
    fastId: [
      "Deeply cut leaf with bristle tips and wide U-shaped sinuses",
      "Small acorns with a thin shallow cap",
      "Lower branches droop, dead twigs cling ('pin' stubs)"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "simple",
      margin: "lobed",
      lobing: "pinnate-lobed",
      bark: ["smooth", "ridged"],
      fruit: "acorn"
    },
    season: { flower: [4, 5], fruit: [9, 10] },
    confusableWith: [
      { id: "quercus-rubra", tell: "Pin oak has tiny acorns, deep sinuses and drooping lower limbs; red oak has big acorns, shallow sinuses and a tall clean trunk" }
    ],
    fruitKeyword: "acorn",
    inaturalistTaxonId: 54785
  },
  {
    id: "tilia-cordata",
    common: "littleleaf linden",
    scientific: "Tilia cordata",
    family: "Malvaceae",
    nycRank: 6,
    nycStatus: ["street", "park", "ornamental"],
    native: false,
    fastId: [
      "Small heart-shaped leaf with an UNEVEN (asymmetric) base",
      "Nutlets hang from a strap-like papery bract",
      "Dense pyramidal crown, fragrant early-summer flowers"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "simple",
      margin: "toothed",
      lobing: "none",
      bark: ["furrowed", "ridged"],
      fruit: "nut"
    },
    season: { flower: [6, 7], fruit: [8, 9, 10] },
    confusableWith: [
      { id: "cercis-canadensis", tell: "Linden leaves are toothed with a lopsided base; redbud leaves are smooth-edged with a symmetric heart base" }
    ],
    fruitKeyword: "bract",
    inaturalistTaxonId: 132600
  },
  {
    id: "fraxinus-pennsylvanica",
    common: "green ash",
    scientific: "Fraxinus pennsylvanica",
    family: "Oleaceae",
    nycRank: 7,
    nycStatus: ["street", "park", "native"],
    native: true,
    fastId: [
      "OPPOSITE pinnately compound leaves (5-9 leaflets)",
      "Diamond-patterned ridged bark",
      "Clusters of single paddle-shaped samaras"
    ],
    traits: {
      arrangement: "opposite",
      leafType: "compound",
      margin: "serrated",
      lobing: "pinnate-compound",
      bark: ["ridged", "diamond"],
      fruit: "samara"
    },
    season: { flower: [4, 5], fruit: [9, 10] },
    confusableWith: [
      { id: "ailanthus-altissima", tell: "Ash is OPPOSITE with toothed leaflets; tree-of-heaven is alternate with glandular basal teeth and a rancid smell" },
      { id: "styphnolobium-japonicum", tell: "Ash is OPPOSITE with winged samaras; pagoda tree is alternate with beaded pods" }
    ],
    fruitKeyword: "samara",
    inaturalistTaxonId: 54808
  },
  {
    id: "acer-rubrum",
    common: "red maple",
    scientific: "Acer rubrum",
    family: "Sapindaceae",
    nycRank: 8,
    nycStatus: ["street", "park", "native"],
    native: true,
    fastId: [
      "3-5 shallow lobes, whitish underside, serrated edges",
      "Red buds, red flowers and red leaf stalks",
      "Paired red samaras drop in LATE SPRING"
    ],
    traits: {
      arrangement: "opposite",
      leafType: "simple",
      margin: "lobed",
      lobing: "palmate-lobed",
      bark: ["smooth", "plated"],
      fruit: "double-samara"
    },
    season: { flower: [3, 4], fruit: [4, 5, 6] },
    confusableWith: [
      { id: "acer-saccharinum", tell: "Red maple has shallow lobes and a whitish underside; silver maple has deeply cut sinuses and a silvery-white underside" },
      { id: "acer-saccharum", tell: "Red maple leaves are toothed with red stalks; sugar maple lobes are smooth-edged with U-shaped notches" }
    ],
    fruitKeyword: "samara",
    inaturalistTaxonId: 48098
  },
  {
    id: "acer-saccharinum",
    common: "silver maple",
    scientific: "Acer saccharinum",
    family: "Sapindaceae",
    nycRank: 9,
    nycStatus: ["street", "park", "native"],
    native: true,
    fastId: [
      "Deeply cut 5-lobed leaf, SILVERY-white underside",
      "Leaves flash silver in the wind",
      "Largest maple samaras, dropping in spring"
    ],
    traits: {
      arrangement: "opposite",
      leafType: "simple",
      margin: "lobed",
      lobing: "palmate-lobed",
      bark: ["scaly", "exfoliating"],
      fruit: "double-samara"
    },
    season: { flower: [2, 3], fruit: [4, 5, 6] },
    confusableWith: [
      { id: "acer-rubrum", tell: "Silver maple has deep sinuses and a bright silver underside; red maple has shallow lobes and merely whitish underside" }
    ],
    fruitKeyword: "samara",
    inaturalistTaxonId: 54762
  },
  {
    id: "ginkgo-biloba",
    common: "ginkgo",
    scientific: "Ginkgo biloba",
    family: "Ginkgoaceae",
    nycRank: 10,
    nycStatus: ["street", "park", "ornamental"],
    native: false,
    fastId: [
      "Fan-shaped leaf with radiating dichotomous veins",
      "Uniform butter-yellow, drops all at once in fall",
      "Female trees' fleshy seeds reek of vomit"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "fan",
      margin: "entire",
      lobing: "none",
      bark: ["furrowed", "ridged"],
      fruit: "ginkgo-seed"
    },
    season: { flower: [4], fruit: [9, 10, 11] },
    confusableWith: [
      { id: "cercis-canadensis", tell: "Both are alternate with entire margins and yellow fall color, but ginkgo's leaf is a veined fan, not a heart" }
    ],
    fruitKeyword: "ginkgo seed",
    inaturalistTaxonId: 64350
  },
  {
    id: "zelkova-serrata",
    common: "Japanese zelkova",
    scientific: "Zelkova serrata",
    family: "Ulmaceae",
    nycRank: 11,
    nycStatus: ["street", "park", "ornamental"],
    native: false,
    fastId: [
      "Elm-like leaf but SINGLE-serrate with an even base",
      "Smooth gray bark with orange lenticels, flaking with age",
      "Clean vase-shaped crown"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "simple",
      margin: "serrated",
      lobing: "none",
      bark: ["smooth", "lenticels", "exfoliating"],
      fruit: "drupe"
    },
    season: { flower: [4], fruit: [9, 10] },
    confusableWith: [
      { id: "ulmus-americana", tell: "Zelkova has a nearly even leaf base and single teeth; American elm has a strongly lopsided base and double-serrate edge" }
    ],
    fruitKeyword: "fruit",
    inaturalistTaxonId: 129055
  },
  {
    id: "ulmus-americana",
    common: "American elm",
    scientific: "Ulmus americana",
    family: "Ulmaceae",
    nycRank: 12,
    nycStatus: ["street", "park", "native"],
    native: true,
    fastId: [
      "Leaf base strongly LOPSIDED, edge double-serrate",
      "Classic arching vase-shaped silhouette",
      "Flat papery hairy-edged samaras in early spring"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "simple",
      margin: "serrated",
      lobing: "none",
      bark: ["ridged", "furrowed"],
      fruit: "samara"
    },
    season: { flower: [3], fruit: [4, 5] },
    confusableWith: [
      { id: "zelkova-serrata", tell: "Elm has a lopsided base, double teeth and papery round samaras; zelkova has an even base and single teeth" }
    ],
    fruitKeyword: "samara",
    inaturalistTaxonId: 53547
  },
  {
    id: "quercus-rubra",
    common: "northern red oak",
    scientific: "Quercus rubra",
    family: "Fagaceae",
    nycRank: 13,
    nycStatus: ["street", "park", "native"],
    native: true,
    fastId: [
      "7-11 lobes with SHALLOW sinuses and bristle tips",
      "Bark ridges look like flat-topped 'ski trails'",
      "Large acorns with a shallow saucer cap"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "simple",
      margin: "lobed",
      lobing: "pinnate-lobed",
      bark: ["ridged", "furrowed"],
      fruit: "acorn"
    },
    season: { flower: [4, 5], fruit: [9, 10] },
    confusableWith: [
      { id: "quercus-palustris", tell: "Red oak has shallow sinuses and big acorns; pin oak has deep U-sinuses, tiny acorns and drooping lower branches" }
    ],
    fruitKeyword: "acorn",
    inaturalistTaxonId: 49005
  },
  {
    id: "liquidambar-styraciflua",
    common: "sweetgum",
    scientific: "Liquidambar styraciflua",
    family: "Altingiaceae",
    nycRank: 14,
    nycStatus: ["street", "park", "native"],
    native: true,
    fastId: [
      "Star-shaped 5-7 pointed leaf, but leaves ALTERNATE",
      "Spiky woody 'gumball' seed capsules",
      "Corky wings on the twigs; multicolor fall"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "simple",
      margin: "toothed",
      lobing: "palmate-lobed",
      bark: ["furrowed", "ridged"],
      fruit: "capsule"
    },
    season: { flower: [4, 5], fruit: [9, 10, 11] },
    confusableWith: [
      { id: "acer-saccharum", tell: "Star leaves look maple-like but sweetgum is ALTERNATE with spiky gumballs; maples are opposite with samaras" }
    ],
    fruitKeyword: "gumball",
    inaturalistTaxonId: 49658
  },
  {
    id: "styphnolobium-japonicum",
    common: "Japanese pagoda tree",
    scientific: "Styphnolobium japonicum",
    family: "Fabaceae",
    nycRank: 15,
    nycStatus: ["street", "park", "ornamental"],
    native: false,
    fastId: [
      "Pinnately compound leaves on SMOOTH GREEN twigs",
      "Creamy flower sprays in mid/late summer",
      "Pods constricted like a string of beads"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "compound",
      margin: "entire",
      lobing: "pinnate-compound",
      bark: ["furrowed", "ridged"],
      fruit: "pod"
    },
    season: { flower: [7, 8], fruit: [9, 10, 11] },
    confusableWith: [
      { id: "gleditsia-triacanthos", tell: "Pagoda tree has smooth green thornless twigs and beaded pods; honeylocust has thorns and long twisted flat pods" },
      { id: "ailanthus-altissima", tell: "Pagoda tree leaflets are entire and smell fine; tree-of-heaven has glandular basal teeth and a rank odor" }
    ],
    fruitKeyword: "pods",
    inaturalistTaxonId: 53945
  },
  {
    id: "acer-saccharum",
    common: "sugar maple",
    scientific: "Acer saccharum",
    family: "Sapindaceae",
    nycRank: 16,
    nycStatus: ["street", "park", "native"],
    native: true,
    fastId: [
      "5 lobes with smooth edges and U-shaped notches between",
      "Broken leaf stalk runs CLEAR sap",
      "Fiery orange-red fall color; U-shaped paired samaras"
    ],
    traits: {
      arrangement: "opposite",
      leafType: "simple",
      margin: "lobed",
      lobing: "palmate-lobed",
      bark: ["furrowed", "plated"],
      fruit: "double-samara"
    },
    season: { flower: [4, 5], fruit: [9, 10] },
    confusableWith: [
      { id: "acer-platanoides", tell: "Sugar maple bleeds clear sap with few smooth-edged teeth; Norway bleeds milky sap with a broader, toothier leaf" }
    ],
    fruitKeyword: "samara",
    inaturalistTaxonId: 52543
  },
  {
    id: "cercis-canadensis",
    common: "eastern redbud",
    scientific: "Cercis canadensis",
    family: "Fabaceae",
    nycRank: 17,
    nycStatus: ["street", "park", "ornamental", "native"],
    native: true,
    fastId: [
      "Perfectly heart-shaped leaf, smooth-edged",
      "Magenta pea-flowers burst straight from bare branches",
      "Flat pea-pods hang in clusters"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "simple",
      margin: "entire",
      lobing: "none",
      bark: ["smooth", "scaly"],
      fruit: "pod"
    },
    season: { flower: [4], fruit: [7, 8, 9, 10] },
    confusableWith: [
      { id: "tilia-cordata", tell: "Redbud leaves are smooth-edged with a symmetric heart base; linden leaves are toothed with a lopsided base" }
    ],
    fruitKeyword: "pods",
    inaturalistTaxonId: 48502
  },
  {
    id: "ailanthus-altissima",
    common: "tree-of-heaven",
    scientific: "Ailanthus altissima",
    family: "Simaroubaceae",
    nycRank: 18,
    nycStatus: ["street", "park", "invasive"],
    native: false,
    fastId: [
      "Huge compound leaf, 11-41 leaflets, each with glandular basal teeth",
      "Crushed leaves smell like rancid peanuts",
      "Twisted samaras in big reddish clusters"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "compound",
      margin: "entire",
      lobing: "pinnate-compound",
      bark: ["smooth", "lenticels"],
      fruit: "samara"
    },
    season: { flower: [5, 6], fruit: [8, 9, 10, 11] },
    confusableWith: [
      { id: "fraxinus-pennsylvanica", tell: "Tree-of-heaven is ALTERNATE with glandular basal teeth and a foul smell; ash is OPPOSITE with toothed leaflets" },
      { id: "styphnolobium-japonicum", tell: "Tree-of-heaven has a rank odor and glandular teeth; pagoda tree smells fine with entire leaflets and beaded pods" }
    ],
    fruitKeyword: "samara",
    inaturalistTaxonId: 57278
  },
  {
    id: "prunus-serotina",
    common: "black cherry",
    scientific: "Prunus serotina",
    family: "Rosaceae",
    nycRank: 19,
    nycStatus: ["street", "park", "native"],
    native: true,
    fastId: [
      "Glossy narrow leaf with fine incurved teeth and rusty hairs on the midrib",
      "Bark has horizontal lenticel bands, aging to 'burnt cornflakes'",
      "Drooping racemes of small white flowers, then black cherries"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "simple",
      margin: "serrated",
      lobing: "none",
      bark: ["smooth", "lenticels", "scaly"],
      fruit: "drupe"
    },
    season: { flower: [5], fruit: [7, 8, 9] },
    confusableWith: [
      { id: "pyrus-calleryana", tell: "Cherry has horizontal lenticel bark, rusty midrib hairs and black drupes; callery pear has glossy rounded leaves and hard pomes" }
    ],
    fruitKeyword: "fruit",
    inaturalistTaxonId: 54834
  },
  {
    id: "aesculus-hippocastanum",
    common: "horse chestnut",
    scientific: "Aesculus hippocastanum",
    family: "Sapindaceae",
    nycRank: 20,
    nycStatus: ["park", "ornamental"],
    native: false,
    fastId: [
      "OPPOSITE palmately COMPOUND leaf, 5-7 big toothed leaflets radiating from one point",
      "Showy white flower 'candles' in spring",
      "Spiny green husk holds one glossy brown conker"
    ],
    traits: {
      arrangement: "opposite",
      leafType: "compound",
      margin: "toothed",
      lobing: "palmate-compound",
      bark: ["scaly", "plated"],
      fruit: "capsule"
    },
    season: { flower: [5], fruit: [9, 10] },
    confusableWith: [
      { id: "acer-platanoides", tell: "Both opposite, but horse chestnut has separate palmate LEAFLETS with a spiny conker; Norway maple is a single palmately LOBED leaf" }
    ],
    fruitKeyword: "conker",
    inaturalistTaxonId: 84298
  },
  {
    id: "prunus-cerasifera",
    common: "cherry plum",
    scientific: "Prunus cerasifera",
    family: "Rosaceae",
    nycRank: 21,
    nycStatus: ["street", "park", "ornamental"],
    native: false,
    fastId: [
      "Small tree; leaves deep purple-maroon all summer (the 'purple-leaf plum')",
      "Early-spring haze of pale-pink 5-petaled blossoms before the leaves",
      "Small round cherry-plums about 1 inch, yellow to deep red"
    ],
    traits: {
      arrangement: "alternate",
      leafType: "simple",
      margin: "serrated",
      lobing: "none",
      bark: ["smooth", "lenticels"],
      fruit: "drupe"
    },
    season: { flower: [3, 4], fruit: [6, 7, 8] },
    confusableWith: [
      { id: "prunus-serotina", tell: "Cherry plum is a small purple-leaved ornamental with round plums and pink spring bloom; black cherry is a big green forest tree with drooping white flower racemes, black drupes, and burnt-cornflake bark" },
      { id: "pyrus-calleryana", tell: "Both bloom early on small street trees, but callery pear is a white cloud with glossy green rounded leaves; cherry plum has pink-white blossoms and deep purple summer leaves" }
    ],
    fruitKeyword: "plum",
    inaturalistTaxonId: 55837
  }
];
// 21 species
