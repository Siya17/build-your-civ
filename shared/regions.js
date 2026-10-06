// The eleven starting places A–K from the Week 2 slides (16, 18, 24–26).
// Slide 18 supplies only G's three price exceptions. The other ten price tables
// and their geography explanations are authored classroom assumptions for instructor
// review, not tables transcribed from the slides. Preserve G's supplied example.
// Text marks glossary words as [[id|shown text]] and furigana as {漢字|かな}.
// `prices` lists only the cards that are not normal (normal = 1 point):
//   free = ★ 0 points, hard = △ 2 points and a success roll, impossible = ✗.
// Climate: rounded monthly averages for one modern weather station (°C, mm). Today's
// climate is only a guide to the past. Images live in /assets/regions/<letter>/.
export const regions = {
  A: {
    name:{ en:'Zimbabwe Plateau', ja:'ジンバブエ{高原|こうげん}' },
    area:{ en:'Southern Africa', ja:'アフリカ南部' },
    site:[-20.27, 30.93],
    tagline:{ en:'A high, grassy land between two big rivers in southern Africa.', ja:'アフリカ南部の、二つの大きな川にはさまれた、草の多い高い土地です。' },
    land:{
      en:['Your land is a high [[plateau|plateau]], about 1,000 metres above the sea.', 'Open grassland with trees covers most of it. Big, round [[granite|granite]] hills rise above the grass.', 'The Zambezi River is to the north, and the Limpopo River is to the south.'],
      ja:['あなたの土地は、海より約1,000メートル高い[[plateau|{高原|こうげん}]]です。', '木のまじった草原が広がり、丸い[[granite|{花崗岩|かこうがん}]]の丘が草原の上に立っています。', '北にザンベジ川、南にリンポポ川があります。']
    },
    climate:{ station:'Masvingo', source:'WMO 1961–1990',
      temp:[23,22,21,19,16,14,14,16,20,22,23,23], rain:[129,107,66,28,13,6,3,6,10,30,77,140],
      summary:{ en:'Warm all year. Almost all rain falls in summer, from November to March. Winter is dry.', ja:'一年中あたたかいです。雨はほとんど夏（11月〜3月）に降り、冬はかわいています。' } },
    resources:[
      { id:'cattle', en:'Cattle', ja:'牛', text:{ en:'The grass on the plateau feeds large herds of cattle. Here, cattle are wealth.', ja:'高原の草で、たくさんの牛を育てられます。ここでは、牛は{富|とみ}のしるしです。' } },
      { id:'gold', en:'Gold', ja:'金', text:{ en:'Gold lies in rocks near the surface. People far away want it.', ja:'金が地面に近い岩の中にあります。遠くの人々もほしがります。' } },
      { id:'granite', en:'Granite slabs', ja:'{花崗岩|かこうがん}の石板', text:{ en:'Hot days and cold nights crack the granite hills into flat slabs. They are good for building.', ja:'昼の暑さと夜の寒さで、花崗岩の丘は平らな板のように割れます。建物に使いやすい石です。' } }
    ],
    challenge:{
      en:['The sea is about 400 km away. Traders must walk.', 'Some years the rain does not come, and the soil is often thin.', 'In the hot, low valleys, [[tsetse|tsetse flies]] make cattle sick.'],
      ja:['海までは約400キロメートルあり、交易する人は歩いて行かなければなりません。', '雨が降らない年があり、土はうすいところが多いです。', '暑くて低い谷では、[[tsetse|ツェツェバエ]]が牛を病気にします。']
    },
    prices:{
      husbandry:['free',{ en:'The high grassland is good for cattle and has few tsetse flies.', ja:'高い草原は牛に向いていて、ツェツェバエも少ないです。' }],
      mining:['free',{ en:'Gold and iron ore lie close to the surface.', ja:'金や鉄の{鉱石|こうせき}が、地面の近くにあります。' }],
      masonry:['free',{ en:'Granite hills break naturally into flat, easy-to-use slabs.', ja:'花崗岩の丘は自然に割れて、使いやすい平らな石になります。' }],
      sailing:['hard',{ en:'The sea is far away, and the rivers have rocks and rapids.', ja:'海は遠く、川には岩や急な流れがあります。' }],
      irrigation:['hard',{ en:'Rain often fails, and the rivers lie in low valleys below the high fields.', ja:'雨が降らない年が多く、川は高い畑より低い谷を流れています。' }],
      wheel:['hard',{ en:'Tsetse flies in the low valleys make cattle sick, so few animals can pull carts.', ja:'低い谷ではツェツェバエが牛を病気にするので、{荷車|にぐるま}を引ける動物が少ないです。' }],
      horseback:['impossible',{ en:'No horses have reached southern Africa. Tsetse flies in the lowlands around the plateau carry a disease that kills them.', ja:'アフリカ南部には、まだ馬が伝わっていません。高原の周りの低地では、ツェツェバエがうつす病気で馬が死んでしまいます。' }]
    },
    events:{
      1:{ en:'The summer rains do not come. Rivers and wells run low.', ja:'夏の雨が降りません。川も井戸も水が少なくなります。' },
      2:{ en:'Huge storms fill the rivers. Water rushes through the valleys.', ja:'大きな{嵐|あらし}で川があふれ、谷に水が流れこみます。' },
      3:{ en:'Traders from the coast arrive with cloth and glass beads.', ja:'海岸から、布とガラス玉を持った商人がやって来ます。' },
      4:{ en:'A sickness spreads from village to village.', ja:'病気が村から村へ広がります。' },
      5:{ en:'The thin soil gives less grain every year.', ja:'うすい土から、とれる穀物が年々へっていきます。' },
      6:{ en:'Good rain, fat cattle and full grain stores.', ja:'雨にめぐまれ、牛は太り、穀物の倉もいっぱいです。' }
    },
    reveal:{
      name:{ en:'[[greatzimbabwe|Great Zimbabwe]]', ja:'[[greatzimbabwe|グレート・ジンバブエ]]' }, when:{ en:'about 1100–1450 CE', ja:'紀元1100年〜1450年ごろ' },
      facts:{
        en:['People built a capital with huge stone walls. They used no [[mortar|mortar]]: the stones simply fit together.', 'The city grew rich from cattle and from gold. Traders carried the gold to the Indian Ocean coast.', 'Archaeologists found glass beads from India and pottery from China there.', 'In the Shona language, “Zimbabwe” means “houses of stone”.'],
        ja:['人々は、大きな石の{壁|かべ}のある都をつくりました。[[mortar|モルタル]]を使わず、石を組み合わせただけです。', '牛と金で豊かになりました。金はインド洋の海岸まで運ばれました。', 'インドのガラス玉や、中国の焼き物も見つかっています。', 'ショナ語で「ジンバブエ」は「石の家」という意味です。']
      },
      had:['husbandry','mining','masonry','trade','craft']
    }
  },

  B: {
    name:{ en:'Aegean Sea', ja:'エーゲ海' },
    area:{ en:'Eastern Mediterranean', ja:'東地中海' },
    site:[35.30, 25.16],
    tagline:{ en:'Mountains, rocky islands and a warm sea in the eastern Mediterranean.', ja:'東地中海の、山と岩の多い島々と、あたたかい海の地域です。' },
    land:{
      en:['Your land is a sea full of islands, with mountains on every coast.', 'There is only a little flat land for farms, spread out between the hills.', 'Many islands are so close that you can see the next one.'],
      ja:['あなたの土地は島の多い海で、どの海岸にも山があります。', '畑にできる平らな土地は少なく、丘の間にばらばらにあります。', '多くの島は、となりの島が見えるほど近くにあります。']
    },
    climate:{ station:'Heraklion (Crete)', source:'National Observatory of Athens 2007–2024',
      temp:[13,14,15,17,20,24,27,27,24,21,18,15], rain:[62,49,31,13,13,4,0,2,15,44,32,53],
      summary:{ en:'A [[mediterranean|Mediterranean climate]]: hot, dry summers and mild, rainy winters.', ja:'[[mediterranean|{地中海性気候|ちちゅうかいせいきこう}]]です。夏は暑くかわいていて、冬はおだやかで雨が降ります。' } },
    resources:[
      { id:'olives', en:'Olives and grapes', ja:'オリーブとブドウ', text:{ en:'Olive trees and grape vines grow on dry hills. They give oil and wine to trade.', ja:'オリーブとブドウは、かわいた丘でも育ちます。油とワインは交易に使えます。' } },
      { id:'fish', en:'Fish', ja:'魚', text:{ en:'The sea gives fish and shellfish all year.', ja:'海から一年中、魚や貝がとれます。' } },
      { id:'marble', en:'Stone and marble', ja:'石と{大理石|だいりせき}', text:{ en:'The mountains have good building stone, including [[marble|marble]].', ja:'山には、[[marble|大理石]]など、建物に向いた石があります。' } }
    ],
    challenge:{
      en:['There is little flat land, so farms are small.', 'The soil is thin and rocky, and there is no rain in summer.', 'Mountains and sea separate communities from each other.'],
      ja:['平らな土地が少ないので、畑は小さいです。', '土はうすくて石が多く、夏は雨が降りません。', '山と海が、人々の住む場所をへだてています。']
    },
    prices:{
      sailing:['free',{ en:'The islands lie close together, and summer is a good season for sailing.', ja:'島どうしが近く、夏は船で動きやすい季節です。' }],
      husbandry:['free',{ en:'Sheep and goats live well on dry, rocky hills.', ja:'羊やヤギは、かわいた岩の丘でもよく育ちます。' }],
      trade:['free',{ en:'The sea links many coasts, and each one has different goods.', ja:'海が多くの海岸を結び、それぞれの場所にちがう品物があります。' }],
      masonry:['free',{ en:'Marble and other good stone lie on many islands.', ja:'多くの島に、{大理石|だいりせき}などのよい石があります。' }],
      irrigation:['hard',{ en:'There are few rivers, and summers are dry.', ja:'川が少なく、夏は雨が降りません。' }],
      horseback:['hard',{ en:'Steep mountains and little grass make horses hard to keep.', ja:'山が急で草が少ないので、馬を育てるのは大変です。' }],
      wheel:['hard',{ en:'Steep, rocky paths make carts hard to use.', ja:'急で岩の多い道では、{荷車|にぐるま}は使いにくいです。' }],
      empire:['hard',{ en:'Mountains and sea split the land into many small valleys and islands.', ja:'山と海が、土地をたくさんの小さな谷や島に分けています。' }]
    },
    events:{
      1:{ en:'No rain falls all winter. The springs dry up.', ja:'冬の間ずっと雨が降らず、わき水がかれてしまいます。' },
      2:{ en:'A storm sends floods down the mountain valleys.', ja:'嵐で、山の谷に洪水が流れ下ります。' },
      3:{ en:'Ships from a faraway coast land on your beach.', ja:'遠い海岸から来た船が、あなたの浜に着きます。' },
      4:{ en:'Sailors bring a sickness from another port.', ja:'船乗りが、ほかの港から病気を持ちこみます。' },
      5:{ en:'Rain washes the thin hill soil away.', ja:'雨で、丘のうすい土が流されてしまいます。' },
      6:{ en:'The olive trees and vines give a huge harvest.', ja:'オリーブとブドウが大豊作です。' }
    },
    reveal:{
      name:{ en:'The [[minoan|Minoans]] and the Greek city-states', ja:'[[minoan|ミノア文明]]とギリシアの{都市国家|としこっか}' }, when:{ en:'from about 2000 BCE', ja:'紀元前2000年ごろから' },
      facts:{
        en:['On Crete, the Minoans built large palatial centres, such as Knossos, with administrative, economic and religious functions.', 'Much later, Greek [[citystate|city-states]] developed different political institutions and maritime connections.', 'Athens expanded citizen participation, while its alliance also became a system of domination over other cities.', 'These examples belong to different periods; one card list cannot represent a single continuous Aegean society.'],
        ja:['クレタ島のミノア人は、クノッソスなど、行政・経済・宗教の機能を持つ大きな宮殿の中心をつくりました。', 'ずっと後、ギリシアの[[citystate|都市国家]]は、異なる政治制度と海のつながりを発達させました。', 'アテネでは市民の政治参加が広がる一方、同盟は他の都市を支配するしくみにもなりました。', 'これらは異なる時代の例です。一枚のカード一覧で、連続する一つのエーゲ海社会を表せるわけではありません。']
      },
      had:['sailing','shipbuilding','trade','writing','currency','philosophy','poetry','history']
    }
  },

  C: {
    name:{ en:'Mesopotamia', ja:'メソポタミア' },
    area:{ en:'Tigris and Euphrates rivers', ja:'チグリス川とユーフラテス川' },
    site:[31.32, 45.64],
    tagline:{ en:'A flat, hot plain between the Tigris and Euphrates rivers.', ja:'チグリス川とユーフラテス川の間の、平らで暑い平野です。' },
    land:{
      en:['Two big rivers cross a very flat plain. “Mesopotamia” means “between the rivers”.', 'In the south, the rivers spread into wide [[wetland|marshes]] full of reeds.', 'Away from the rivers, the land is dry desert.'],
      ja:['二つの大きな川が、とても平らな平野を流れます。「メソポタミア」は「川の間」という意味です。', '南では、川が広い[[wetland|{湿地|しっち}]]になり、{葦|あし}がたくさん生えています。', '川から{離|はな}れると、かわいた{砂漠|さばく}です。']
    },
    climate:{ station:'Nasiriyah', source:'Wikipedia climate table, 1991–2020',
      temp:[12,15,20,26,32,37,38,38,34,28,19,14], rain:[21,15,20,15,3,0,0,0,1,7,23,22],
      summary:{ en:'Summers are very hot, with no rain at all. A little rain falls in winter.', ja:'夏はとても暑く、雨はまったく降りません。冬に少しだけ雨が降ります。' } },
    resources:[
      { id:'clay', en:'River clay', ja:'川の{粘土|ねんど}', text:{ en:'Clay is everywhere. People make pots, bricks and even writing tablets from it.', ja:'粘土はどこにでもあります。器やれんが、文字を書く板まで作れます。' } },
      { id:'reeds', en:'Reeds', ja:'{葦|あし}', text:{ en:'Tall reeds grow in the marshes. People use them for houses, boats and baskets.', ja:'湿地には背の高い葦が生えています。家・船・かごに使えます。' } },
      { id:'dates', en:'Date palms', ja:'ナツメヤシ', text:{ en:'Date palms like the heat. Their sweet fruit keeps for a long time.', ja:'ナツメヤシは暑さに強く、あまい実は長もちします。' } }
    ],
    challenge:{
      en:['There is almost no stone, wood or metal.', 'The rivers flood in spring, just before the harvest. Some floods are huge.', 'Watering fields again and again can leave [[salt|salt]] in the soil.'],
      ja:['石・木・金属がほとんどありません。', '川は春、{収穫|しゅうかく}の直前にあふれます。とても大きな洪水もあります。', '畑に何度も水を引くと、土に[[salt|塩]]がたまることがあります。']
    },
    prices:{
      irrigation:['free',{ en:'Two rivers cross a flat plain, so canals are easy to dig.', ja:'平らな土地を二つの川が流れるので、水路を{掘|ほ}りやすいです。' }],
      pottery:['free',{ en:'River clay is everywhere.', ja:'川の粘土がどこにでもあります。' }],
      trade:['free',{ en:'People must trade for stone, wood and metal.', ja:'石・木・金属は、交易で手に入れるしかありません。' }],
      writing:['free',{ en:'Soft clay is everywhere. People can press signs into it and keep the tablets.', ja:'やわらかい粘土がどこにでもあります。しるしを押しつけて書き、粘土板として残せます。' }],
      mining:['hard',{ en:'The plain has no metal ore and almost no stone.', ja:'平野には金属の{鉱石|こうせき}がなく、石もほとんどありません。' }],
      masonry:['hard',{ en:'Builders have mud and reeds, but almost no stone.', ja:'泥と葦はあっても、石はほとんどありません。' }],
      shipbuilding:['hard',{ en:'There are almost no tall trees. Boats are made of reeds or of wood from far away.', ja:'高い木がほとんどありません。船は葦で作るか、遠くから運んだ木で作ります。' }],
      bronze:['hard',{ en:'There is no copper or tin here. All metal must come from far away.', ja:'ここには銅もスズもありません。金属はすべて遠くから運ぶ必要があります。' }]
    },
    events:{
      1:{ en:'The rivers run low, and the canals are dry.', ja:'川の水がへり、水路がかわいてしまいます。' },
      2:{ en:'The spring flood is huge. It breaks the river banks.', ja:'春の洪水がとても大きく、川の{堤|つつみ}をこわします。' },
      3:{ en:'Herders from the hills come down to the river towns.', ja:'山から、家畜を連れた人々が川の町に下りて来ます。' },
      4:{ en:'A sickness spreads quickly in the crowded towns.', ja:'人の多い町で、病気がすぐに広がります。' },
      5:{ en:'Salt builds up in the fields. The barley grows badly.', ja:'畑に塩がたまり、大麦がよく育ちません。' },
      6:{ en:'The canals work well, and the barley harvest is huge.', ja:'水路がうまく働き、大麦が大豊作です。' }
    },
    reveal:{
      name:{ en:'[[sumer|Sumer]] and the first cities', ja:'[[sumer|シュメール]]と最初の都市' }, when:{ en:'from about 3500 BCE', ja:'紀元前3500年ごろから' },
      facts:{
        en:['Uruk was one of the first cities in the world. Tens of thousands of people lived there.', 'People pressed signs into wet clay. This [[cuneiform|cuneiform]] writing began as a way to count goods.', 'Temples stood on huge mud-brick platforms called [[ziggurat|ziggurats]].', 'Stone, timber and metal came from far away by trade.'],
        ja:['ウルクは世界で最も古い都市の一つで、何万人もの人がくらしました。', '人々は、ぬれた粘土に記号を{押|お}しつけました。この[[cuneiform|{楔形|くさびがた}文字]]は、品物を数える方法から始まりました。', '神殿は、[[ziggurat|ジッグラト]]という、日干しれんがの大きな台の上に建てられました。', '石・木材・金属は、交易で遠くから運ばれました。']
      },
      had:['irrigation','pottery','writing','wheel','math','laws','trade','empire']
    }
  },

  D: {
    name:{ en:'Indus Valley', ja:'インダス川{流域|りゅういき}' },
    area:{ en:'Pakistan and north-west India', ja:'パキスタンとインド北西部' },
    site:[27.33, 68.14],
    tagline:{ en:'A wide river plain between high mountains and a desert.', ja:'高い山々と砂漠の間に広がる、大きな川の平野です。' },
    land:{
      en:['The Indus River flows from the Himalaya mountains down to the sea.', 'Its water comes from melting snow and from summer [[monsoon|monsoon]] rain.', 'To the east lies the Thar Desert.'],
      ja:['インダス川は、ヒマラヤ山脈から海へ流れています。', '川の水は、雪どけ水と、夏の[[monsoon|モンスーン（{季節風|きせつふう}）]]の雨から来ます。', '東にはタール砂漠があります。']
    },
    climate:{ station:'Jacobabad', source:'WMO / NOAA 1991–2020',
      temp:[15,18,24,31,36,37,35,33,32,28,22,17], rain:[5,8,11,5,4,27,48,54,38,2,12,9],
      summary:{ en:'Very hot. Most rain comes with the summer monsoon, from July to September.', ja:'とても暑いです。雨のほとんどは、7月から9月の夏のモンスーンで降ります。' } },
    resources:[
      { id:'cotton', en:'Cotton', ja:'{綿花|めんか}', text:{ en:'Cotton grows in the warm plain. People spin it and weave it into cloth.', ja:'あたたかい平野で綿花が育ちます。糸にして、布を{織|お}れます。' } },
      { id:'clay', en:'River clay', ja:'川の{粘土|ねんど}', text:{ en:'Good clay is easy to find. Baked in a fire, it becomes hard bricks.', ja:'よい粘土がすぐ見つかります。焼くと、かたいれんがになります。' } },
      { id:'carnelian', en:'Bright stones', ja:'美しい石', text:{ en:'Red [[carnelian|carnelian]] and other stones can be made into beads.', ja:'赤い[[carnelian|カーネリアン]]などの石で、ビーズが作れます。' } }
    ],
    challenge:{
      en:['The river floods every summer, but the size of the flood changes.', 'Sometimes the river moves to a new path, far from the towns.', 'The desert is close, and summers are extremely hot.'],
      ja:['川は毎年夏にあふれますが、洪水の大きさは年によってちがいます。', '川の流れる道が変わって、町から遠くなることがあります。', '砂漠が近く、夏はとても暑いです。']
    },
    prices:{
      irrigation:['free',{ en:'Summer floods spread water and rich mud over the fields.', ja:'夏の洪水が、畑に水と{栄養|えいよう}のある泥を運びます。' }],
      pottery:['free',{ en:'Good clay is everywhere, and it bakes into strong bricks.', ja:'よい粘土がどこにでもあり、焼くと{丈夫|じょうぶ}なれんがになります。' }],
      sailing:['free',{ en:'Boats can follow the river to the sea, then sail along the coast to the west.', ja:'船で川を下って海に出て、西の海岸に行けます。' }],
      craft:['free',{ en:'Bright stones, shells and cotton give skilled workers fine materials.', ja:'色あざやかな石・貝・綿が、職人によい材料をあたえます。' }],
      horseback:['hard',{ en:'No wild horses live here. They must come from far away.', ja:'ここには野生の馬がいません。遠くから連れて来る必要があります。' }],
      masonry:['hard',{ en:'The river plain has little stone, so people bake bricks instead.', ja:'平野には石が少ないので、かわりにれんがを焼きます。' }],
      mining:['hard',{ en:'The plain is river mud. Metal ores and hard stone lie in distant hills.', ja:'平野は川の泥でできています。金属の{鉱石|こうせき}やかたい石は、遠くの丘にあります。' }]
    },
    events:{
      1:{ en:'The monsoon is weak. The river stays low all summer.', ja:'モンスーンが弱く、夏の間ずっと川の水が少ないです。' },
      2:{ en:'The river floods too much and changes its path.', ja:'川があふれすぎて、流れる道が変わります。' },
      3:{ en:'Traders arrive by sea from the west.', ja:'西から、海をこえて商人がやって来ます。' },
      4:{ en:'A sickness spreads through the busy city streets.', ja:'にぎやかな町の通りに、病気が広がります。' },
      5:{ en:'Years of farming wear out the fields near town.', ja:'長く使ってきた町の近くの畑が、やせてしまいます。' },
      6:{ en:'A good flood brings rich mud and a big harvest.', ja:'ちょうどよい洪水が栄養のある泥を運び、大豊作です。' }
    },
    reveal:{
      name:{ en:'The Indus ([[harappan|Harappan]]) cities', ja:'インダス文明（[[harappan|ハラッパー]]の都市）' }, when:{ en:'about 2600–1900 BCE', ja:'紀元前2600年〜1900年ごろ' },
      facts:{
        en:['People built planned cities, such as Mohenjo-daro and Harappa, with straight streets.', 'Houses had bathrooms, and covered drains ran under the streets.', 'Bricks and stone weights had the same standard sizes across a huge area.', 'No one can read their script yet, and no palaces or royal tombs are known.'],
        ja:['モヘンジョ・ダロやハラッパーなど、まっすぐな道のある{計画|けいかく}都市がつくられました。', '家には{浴室|よくしつ}があり、道の下にはふたのある下水道がありました。', '広い地域で、れんがや石の{分銅|ふんどう}の大きさが同じでした。', '文字はまだ読めず、宮殿や王の{墓|はか}も見つかっていません。']
      },
      had:['pottery','irrigation','sailing','craft','trade','writing','math']
    }
  },

  E: {
    name:{ en:'Mekong and Tonle Sap', ja:'メコン川とトンレサップ湖' },
    area:{ en:'Mainland Southeast Asia', ja:'東南アジア' },
    site:[13.41, 103.87],
    tagline:{ en:'A hot, green lowland where a great lake grows and shrinks every year.', ja:'大きな湖が毎年大きくなったり小さくなったりする、暑くて緑の多い{低地|ていち}です。' },
    land:{
      en:['Your land is a wide, flat plain in Southeast Asia, near the Mekong River.', 'In the wet season, the Tonle Sap lake grows to about five times its dry-season size.', 'Low, forested hills with good sandstone stand to the north.'],
      ja:['あなたの土地は、東南アジアのメコン川に近い、広くて平らな平野です。', '雨季には、トンレサップ湖が{乾季|かんき}の約5倍の大きさになります。', '北には、よい{砂岩|さがん}のある、森の多い低い山があります。']
    },
    climate:{ station:'Siem Reap', source:'Deutscher Wetterdienst 1997–2010',
      temp:[26,28,30,30,30,29,29,29,28,28,27,26], rain:[4,5,29,57,150,214,193,209,288,200,51,7],
      summary:{ en:'Hot all year. The [[monsoon|monsoon]] brings heavy rain from May to October. The other months are very dry.', ja:'一年中暑いです。5月から10月は[[monsoon|モンスーン]]で雨が多く、ほかの月はとてもかわいています。' } },
    resources:[
      { id:'rice', en:'Rice', ja:'米', text:{ en:'Rice grows well in warm, wet fields.', ja:'あたたかく水の多い田んぼで、米がよく育ちます。' } },
      { id:'fish', en:'Fish', ja:'魚', text:{ en:'The lake is one of the richest places for fish in the world.', ja:'この湖は、世界でも特に魚の多い場所です。' } },
      { id:'sandstone', en:'Sandstone', ja:'{砂岩|さがん}', text:{ en:'The hills to the north have sandstone that is easy to carve.', ja:'北の山には、ほりやすい砂岩があります。' } }
    ],
    challenge:{
      en:['The wet season brings too much water, and the dry season brings too little.', 'People must store water for the dry months.', 'Heavy rain can break dams and channels.'],
      ja:['雨季は水が多すぎ、乾季は水が足りません。', 'かわいた月のために、水をためておく必要があります。', 'はげしい雨で、ダムや水路がこわれることがあります。']
    },
    prices:{
      irrigation:['free',{ en:'Heavy monsoon rain can be stored in big [[reservoir|reservoirs]] and channels.', ja:'モンスーンの大雨を、大きな[[reservoir|{貯水池|ちょすいち}]]や水路にためられます。' }],
      sailing:['free',{ en:'Rivers and a huge lake connect the land. In the wet season, boats go almost everywhere.', ja:'川と大きな湖が土地を結んでいます。雨季には、船でほとんどどこへでも行けます。' }],
      pottery:['free',{ en:'The river and lake shores give good clay for pots.', ja:'川や湖の岸に、つぼを作るためのよい粘土があります。' }],
      horseback:['hard',{ en:'Hot, wet forests and floods are hard for horses. Elephants work better here.', ja:'暑くしめった森や洪水は、馬には大変です。ここでは{象|ぞう}のほうが役に立ちます。' }],
      wheel:['hard',{ en:'Floods cover the land for months, and paths turn to deep mud.', ja:'洪水が何か月も土地をおおい、道は深い泥になります。' }],
      mining:['hard',{ en:'The lowland is river mud. Metal ores lie in distant hills.', ja:'低地は川の泥でできています。金属の{鉱石|こうせき}は遠くの丘にあります。' }]
    },
    events:{
      1:{ en:'The monsoon comes late. The ponds and canals dry out.', ja:'モンスーンがおくれ、池も水路もかわいてしまいます。' },
      2:{ en:'Extreme monsoon rain floods the fields and breaks the channels.', ja:'はげしいモンスーンの雨で、田んぼが水につかり、水路がこわれます。' },
      3:{ en:'Traders come up the river from the sea.', ja:'海から、商人が川をさかのぼって来ます。' },
      4:{ en:'A sickness spreads in the wet season.', ja:'雨季に、病気が広がります。' },
      5:{ en:'Rice fields used every year begin to give less.', ja:'毎年使ってきた田んぼから、とれる米がへりはじめます。' },
      6:{ en:'Perfect rain brings a huge rice harvest.', ja:'ちょうどよい雨で、米が大豊作です。' }
    },
    reveal:{
      name:{ en:'The [[khmer|Khmer]] kingdom of Angkor', ja:'アンコールの[[khmer|クメール]]王国' }, when:{ en:'9th–15th century CE', ja:'9世紀〜15世紀' },
      facts:{
        en:['Khmer kings built Angkor, one of the largest cities of its time.', 'Huge [[reservoir|reservoirs]] and canals stored and moved water for the city.', 'Angkor Wat, a giant stone temple, is still the largest religious building in the world.', 'Later, long droughts and extreme monsoons damaged the water system.'],
        ja:['クメールの王たちは、当時世界で最も大きな都市の一つ、アンコールをつくりました。', '大きな[[reservoir|貯水池]]と運河が、都市の水をため、運びました。', '石でできた{巨大|きょだい}な寺院アンコール・ワットは、今も世界最大の宗教建築です。', 'のちに、長い{干|かん}ばつとはげしいモンスーンが、水のしくみをこわしました。']
      },
      had:['irrigation','sailing','masonry','construction','engineering','empire','theology','writing']
    }
  },

  F: {
    name:{ en:'Yellow River', ja:'{黄河|こうが}' },
    area:{ en:'Northern China', ja:'中国北部' },
    site:[36.10, 114.39],
    tagline:{ en:'A river plain in northern China, covered in fine yellow soil, with cold winters.', ja:'中国北部の、細かい黄色い土におおわれた、冬の寒い川の平野です。' },
    land:{
      en:['The Yellow River carries huge amounts of fine yellow soil called [[loess|loess]].', 'This soil is soft, rich and easy to dig, even with simple tools.', 'The river drops the soil on the plain and slowly raises its own bed.'],
      ja:['黄河は、[[loess|{黄土|おうど}]]という細かい黄色い土を大量に運びます。', 'この土はやわらかく、{栄養|えいよう}があり、かんたんな道具でも{掘|ほ}れます。', '川は平野に土を落とし、自分の川底を少しずつ高くしていきます。']
    },
    climate:{ station:'Anyang', source:'China Meteorological Administration',
      temp:[-1,3,8,15,21,26,27,26,21,15,7,1], rain:[5,9,15,26,40,60,162,118,60,27,19,6],
      summary:{ en:'Cold, dry winters and hot summers. Most rain falls in July and August.', ja:'冬は寒くてかわいていて、夏は暑いです。雨のほとんどは7月と8月に降ります。' } },
    resources:[
      { id:'millet', en:'Millet', ja:'アワ・キビ', text:{ en:'Millet is a grain that grows well in dry, cold places.', ja:'アワやキビは、かわいた寒い土地でもよく育つ{穀物|こくもつ}です。' } },
      { id:'silk', en:'Silkworms', ja:'{蚕|かいこ}', text:{ en:'Silkworms eat mulberry leaves and spin silk thread.', ja:'蚕はクワの葉を食べて、{絹|きぬ}の糸をはきます。' } },
      { id:'metal', en:'Copper and tin', ja:'銅とすず', text:{ en:'Some copper ore lies in mountains to the west. Tin is scarce, so much metal must come from far away.', ja:'西の山には銅の{鉱石|こうせき}があります。すずは少ないので、多くの金属を遠くから運ぶ必要があります。' } }
    ],
    challenge:{
      en:['The river floods often. Sometimes it moves to a completely new path.', 'Dry winds can blow the soft soil away.', 'Winters are very cold.'],
      ja:['川はよくあふれ、まったく新しい道に変わることもあります。', 'かわいた風で、やわらかい土が飛ばされることがあります。', '冬はとても寒いです。']
    },
    prices:{
      pottery:['free',{ en:'Fine loess and river clays are easy to dig and shape.', ja:'細かい黄土と川の粘土は、掘りやすく形を作りやすいです。' }],
      husbandry:['free',{ en:'Wild boar live along the river, and pigs were tamed here very early. Millet farms can also feed pigs and dogs.', ja:'川沿いにはイノシシがいて、ここではとても早くからブタが飼われました。キビやアワの畑は、ブタやイヌのえさにもなります。' }],
      craft:['free',{ en:'Silkworms and fine clay give skilled workers special materials.', ja:'カイコとよい粘土が、職人に特別な材料をあたえます。' }],
      sailing:['hard',{ en:'The river is shallow, full of mud, and often changes its path.', ja:'川は浅く、泥が多く、流れる道がよく変わります。' }],
      irrigation:['hard',{ en:'The river carries so much yellow mud that canals fill up quickly.', ja:'川は黄色い泥をたくさん運ぶので、水路はすぐにうまってしまいます。' }],
      shipbuilding:['hard',{ en:'The shallow, muddy river is dangerous for large boats.', ja:'浅く泥の多い川は、大きな船には危険です。' }]
    },
    events:{
      1:{ en:'Little rain falls. Dust storms blow across the fields.', ja:'雨がほとんど降らず、畑に砂ぼこりの嵐がふきます。' },
      2:{ en:'The river breaks its banks and finds a new path.', ja:'川が堤をこわし、新しい道を流れはじめます。' },
      3:{ en:'Riders from the northern grasslands appear.', ja:'北の草原から、馬に乗った人々があらわれます。' },
      4:{ en:'A sickness spreads through the villages.', ja:'村々に病気が広がります。' },
      5:{ en:'The soft soil blows away in the dry winds.', ja:'かわいた風で、やわらかい土が飛ばされます。' },
      6:{ en:'Warm, wet summers bring rich millet harvests.', ja:'あたたかく雨の多い夏で、アワやキビが大豊作です。' }
    },
    reveal:{
      name:{ en:'The [[shang|Shang]] kingdom', ja:'[[shang|{殷|いん}（{商|しょう}）]]' }, when:{ en:'about 1600–1046 BCE', ja:'紀元前1600年〜1046年ごろ' },
      facts:{
        en:['Shang kings ruled from large capitals with palaces and royal tombs.', 'Craft workers made bronze vessels for rituals.', 'Kings consulted ancestors through [[oraclebone|oracle bones]]. These preserve the earliest known mature Chinese writing system.', 'Royal tombs contain chariots and sacrificial remains, showing that elite power could carry severe human costs.'],
        ja:['殷の王は、宮殿や王の墓のある大きな都から国を{治|おさ}めました。', '{職人|しょくにん}は、{儀式|ぎしき}のための青銅器を作りました。', '王は[[oraclebone|{甲骨|こうこつ}]]を使って祖先に問いかけました。これらは、知られている最も古い成熟した漢字の体系を残しています。', '王墓には戦車や犠牲となった人々の遺骨があり、支配層の権力が深刻な人的負担を伴いうることを示しています。']
      },
      had:['pottery','bronze','writing','astrology','wheel','craft','tradition']
    }
  },

  G: {
    name:{ en:'Nile Valley', ja:'ナイル川{流域|りゅういき}' },
    area:{ en:'North-east Africa', ja:'アフリカ北東部' },
    site:[25.70, 32.64],
    tagline:{ en:'A cultivated river valley through a desert. Before modern dams, summer floods varied in height and extent.', ja:'砂漠を通る川沿いの耕地です。近代のダム以前、夏の洪水の高さと広がりには違いがありました。' },
    land:{
      en:['The Nile flows north through the desert to the Mediterranean Sea.', 'Before modern dams, summer floods brought water and [[silt|silt]]. Their height and reach varied between years.', 'Desert extends beyond the valley, with routes linking river settlements, quarries and oases.'],
      ja:['ナイル川は砂漠の中を北へ流れ、地中海に注ぎます。', '近代のダム以前、夏の洪水が水と[[silt|{肥沃|ひよく}な泥]]を運びました。高さと範囲は年によって違いました。', '谷の外には砂漠が広がり、川沿いの集落・石切り場・オアシスを結ぶ道もあります。']
    },
    climate:{ station:'Luxor', source:'NOAA 1991–2020',
      temp:[15,17,21,28,31,33,34,34,31,27,21,16], rain:[3,0,2,0,1,0,0,0,0,1,0,0],
      summary:{ en:'Hot, and almost no rain all year. The water comes from rain far to the south, not from local rain.', ja:'一年中暑く、雨はほとんど降りません。水は、はるか南で降る雨から来ます。' } },
    resources:[
      { id:'silt', en:'Fertile silt', ja:'{肥沃|ひよく}な泥', text:{ en:'Seasonal floods could deposit sediment on fields. Low floods reached less land, while unusually high floods could cause damage.', ja:'季節の洪水は畑に泥を運ぶことがありました。低い洪水は届く範囲が狭く、高すぎる洪水は被害を起こします。' } },
      { id:'papyrus', en:'Papyrus', ja:'パピルス', text:{ en:'This tall reed grows by the river. People make paper, boats and rope from it.', ja:'川べりに生える背の高い草です。紙・船・ロープが作れます。' } },
      { id:'stone', en:'Building stone', ja:'建物用の石', text:{ en:'Cliffs of limestone and granite line the valley.', ja:'谷の両側には、{石灰岩|せっかいがん}や花崗岩のがけがあります。' } },
      { id:'gold', en:'Gold to the south', ja:'南の金', text:{ en:'There are gold mines in the desert to the south.', ja:'南の砂漠に金の{鉱山|こうざん}があります。' } }
    ],
    challenge:{
      en:['Almost no rain falls. Nearly all life depends on one river.', 'If the flood is too low, crops fail. If it is too high, it destroys villages.'],
      ja:['雨はほとんど降りません。生活のほぼすべてが、一本の川にかかっています。', '洪水が少なすぎると作物が育たず、多すぎると村がこわされます。']
    },
    prices:{
      irrigation:['free',{ en:'Seasonal river water supports cultivation. Channels, timing and maintenance help use floods whose height varies between years.', ja:'季節の川の水は耕作を支えます。年によって違う洪水を利用するには、水路・時期の判断・維持が役立ちます。' }],
      sailing:['free',{ en:'The river flows north, and the wind blows south. Boats can go both ways.', ja:'川は北へ流れ、風は南へふきます。船はどちらの方向にも進めます。' }],
      masonry:['free',{ en:'Limestone, sandstone and granite cliffs line the valley.', ja:'谷の両側に、{石灰岩|せっかいがん}・{砂岩|さがん}・{花崗岩|かこうがん}のがけがあります。' }],
      writing:['free',{ en:'Papyrus reeds can be made into a light, smooth surface for writing.', ja:'パピルスという草から、軽くてなめらかな書く材料を作れます。' }],
      horseback:['hard',{ en:'No horses live here, and the narrow valley has little grass for them.', ja:'ここには馬がいません。せまい谷には、馬のための草も少ないです。' }],
      shipbuilding:['hard',{ en:'Few large trees grow here. Long timber must come from far away.', ja:'大きな木はほとんど育ちません。長い木材は遠くから運ぶ必要があります。' }],
      iron:['hard',{ en:'There is little wood to make charcoal for hot iron furnaces.', ja:'鉄を作る高温の炉のための炭にする木が、少ししかありません。' }]
    },
    events:{
      1:{ en:'The Nile flood is too low. The fields stay dry.', ja:'ナイル川の洪水が少なすぎて、畑がかわいたままです。' },
      2:{ en:'The Nile flood is too high. It washes villages away.', ja:'ナイル川の洪水が大きすぎて、村が流されます。' },
      3:{ en:'Traders arrive from the south with gold and ivory.', ja:'南から、金と象牙を持った商人がやって来ます。' },
      4:{ en:'A sickness spreads along the crowded river banks.', ja:'人の多い川べりに、病気が広がります。' },
      5:{ en:'Some fields get no fresh mud this year.', ja:'今年は、新しい泥がとどかない畑があります。' },
      6:{ en:'A perfect flood brings a record harvest.', ja:'ちょうどよい洪水で、これまでにない大豊作です。' }
    },
    reveal:{
      name:{ en:'Ancient Egypt', ja:'古代エジプト' }, when:{ en:'from about 3100 BCE', ja:'紀元前3100年ごろから' },
      facts:{
        en:['Around 3100 BCE, the valley became one kingdom, ruled by a [[pharaoh|pharaoh]].', 'The kingdom lasted, with some breaks, for about 3,000 years.', 'People wrote in hieroglyphs, on stone and on papyrus.', 'Officials measured the flood. They planned farming, taxes and huge projects like the pyramids.'],
        ja:['紀元前3100年ごろ、谷は[[pharaoh|ファラオ]]が治める一つの王国になりました。', '王国は、とぎれながらも約3,000年続きました。', '人々は、石やパピルスにヒエログリフ（{神聖文字|しんせいもじ}）を書きました。', '役人は洪水の高さを{測|はか}り、農業・税・ピラミッドのような大工事を計画しました。']
      },
      had:['irrigation','sailing','writing','masonry','math','construction','astrology','theology','workforce']
    }
  },

  H: {
    name:{ en:'South-eastern Australia', ja:'オーストラリア南東部' },
    area:{ en:'Budj Bim, Victoria', ja:'ビクトリア州バッジ・ビム' },
    site:[-38.06, 141.94],
    tagline:{ en:'Volcanic plains, lakes and wetlands near the south coast of Australia.', ja:'オーストラリア南部の海岸に近い、火山の平野・湖・{湿地|しっち}の地域です。' },
    land:{
      en:['More than 30,000 years ago, a volcano called Budj Bim sent [[lava|lava]] across the land.', 'The lava left a rocky plain with many lakes, streams and [[wetland|wetlands]].', 'The land is green and mild, close to the cold Southern Ocean.'],
      ja:['3万年以上前、バッジ・ビムという火山から[[lava|{溶岩|ようがん}]]が流れ出しました。', '溶岩は、湖・小川・[[wetland|湿地]]の多い、岩だらけの平野をのこしました。', '緑が多くおだやかな土地で、冷たい南の海に近いです。']
    },
    climate:{ station:'Hamilton', source:'Bureau of Meteorology 1983–2022',
      temp:[19,19,17,14,11,9,8,9,10,12,15,17], rain:[33,23,34,40,54,66,71,78,67,54,48,44],
      summary:{ en:'Mild all year, with no very hot or very cold months. It rains in every season, most in winter (June to August).', ja:'一年中おだやかで、とても暑い月も寒い月もありません。雨は一年中降り、冬（6月〜8月）に多いです。' } },
    resources:[
      { id:'eels', en:'Eels', ja:'ウナギ', text:{ en:'Every year, huge numbers of short-finned eels swim through the lakes and streams.', ja:'毎年、たくさんのウナギが湖や小川を泳いで行き来します。' } },
      { id:'murnong', en:'Murnong', ja:'マーノン', text:{ en:'This small plant has a sweet root, like a little potato.', ja:'小さな植物で、根は小さなイモのようにあまいです。' } },
      { id:'stone', en:'Volcanic stone', ja:'火山の石', text:{ en:'Dark lava stone lies everywhere. It is easy to move and stack.', ja:'黒っぽい溶岩の石がどこにでもあり、運んで積み上げやすいです。' } }
    ],
    challenge:{
      en:['No local plants are easy to farm, like wheat or rice.', 'No local animals can be kept in herds, like cattle.', 'Australia is very far from the other continents.'],
      ja:['小麦や米のように育てやすい植物は、ここにはありません。', '牛のように、群れで飼える動物もいません。', 'オーストラリアは、ほかの大陸からとても遠く{離|はな}れています。']
    },
    prices:{
      irrigation:['free',{ en:'Lava stone and wetlands make water channels easy to build – for eels, not for crops.', ja:'溶岩の石と湿地で、水路が作りやすいです。作物のためではなく、ウナギのためです。' }],
      masonry:['free',{ en:'Volcanic stone lies everywhere on the lava plain.', ja:'溶岩の平野には、どこにでも火山の石があります。' }],
      husbandry:['impossible',{ en:'No local animals can be herded. Kangaroos and emus cannot be tamed like cattle.', ja:'群れで飼える動物がいません。カンガルーやエミューは、牛のように飼いならせません。' }],
      craft:['free',{ en:'Volcanic stone and wetland plants are good materials for eel traps and stone houses.', ja:'火山の石と湿地の植物は、ウナギのわなや石の家のよい材料になります。' }],
      horseback:['impossible',{ en:'There are no horses in Australia.', ja:'オーストラリアには馬がいません。' }],
      wheel:['hard',{ en:'No animals can pull carts, and the lava plain is rough and rocky.', ja:'荷車を引く動物がいません。溶岩の平野も、でこぼこで岩が多いです。' }]
    },
    events:{
      1:{ en:'A long, dry summer. The wetlands shrink.', ja:'かわいた夏が長く続き、湿地が小さくなります。' },
      2:{ en:'Heavy winter rain floods the lava plain.', ja:'冬の大雨で、溶岩の平野が水につかります。' },
      3:{ en:'Neighbouring peoples arrive to talk and exchange.', ja:'近くの人々が、話し合いと交換のためにやって来ます。' },
      4:{ en:'A sickness spreads between the camps.', ja:'キャンプからキャンプへ、病気が広がります。' },
      5:{ en:'Too much harvesting leaves fewer plants and eels.', ja:'とりすぎて、植物やウナギがへってしまいます。' },
      6:{ en:'The eels arrive in huge numbers this year.', ja:'今年は、ウナギがとてもたくさんやって来ます。' }
    },
    reveal:{
      name:{ en:'[[gunditjmara|Gunditjmara]] Country (Budj Bim)', ja:'[[gunditjmara|グンディッジマラ]]の土地（バッジ・ビム）' }, when:{ en:'Aboriginal people have lived in Australia for over 50,000 years', ja:'オーストラリアの先住民は5万年以上くらしています' },
      facts:{
        en:['Gunditjmara knowledge and relationships with Country continue today.', 'At Budj Bim, people developed stone channels, weirs and ponds for [[aquaculture|aquaculture]] over at least 6,600 years.', 'These systems deliberately managed waterways, seasonal flows and eel life cycles, rather than simply collecting an abundant resource.', 'Knowledge passed through Elders, stories and practices. This example challenges a development tree centred on kingdoms and written records.'],
        ja:['グンディッジマラの知識と土地との関係は、現在も続いています。', 'バッジ・ビムでは、少なくとも6,600年にわたり、[[aquaculture|水産養殖]]のための石の水路・せき・池が発達しました。', '豊富な資源を集めるだけでなく、水路・季節の流れ・ウナギの生活周期を意図的に管理しました。', '知識は長老・物語・実践を通じて伝わりました。この例は、王国と文字の記録を中心にした発展ツリーを問い直します。']
      },
      had:['irrigation','masonry','trade']
    }
  },

  I: {
    name:{ en:'Mesoamerica', ja:'メソアメリカ' },
    area:{ en:'Southern Mexico and Central America', ja:'メキシコ南部と中央アメリカ' },
    site:[19.69, -98.84],
    tagline:{ en:'Volcanic highlands, high valleys and warm rainforest in southern Mexico and Central America.', ja:'メキシコ南部と中央アメリカの、火山のある高地・高い谷・あたたかい{熱帯雨林|ねったいうりん}です。' },
    land:{
      en:['High valleys sit between volcanoes, about 2,000 metres above the sea.', 'In the south and east, thick rainforest covers the low land.', 'There are lakes in the highland valleys, but few long rivers for boats.'],
      ja:['火山の間に、海より約2,000メートル高い谷があります。', '南と東の低い土地は、こい熱帯雨林におおわれています。', '高地の谷には湖がありますが、船で長く進める川は少ないです。']
    },
    climate:{ station:'Mexico City', source:'Servicio Meteorológico Nacional',
      temp:[15,17,19,20,20,20,19,19,18,18,16,15], rain:[12,6,12,24,59,132,174,176,158,71,17,5],
      summary:{ en:'Mild all year in the highlands. Summers (June to September) are rainy, and winters are dry.', ja:'高地は一年中おだやかです。夏（6月〜9月）は雨が多く、冬はかわいています。' } },
    resources:[
      { id:'maize', en:'Maize', ja:'トウモロコシ', text:{ en:'Maize, beans and squash grow well together in the same field.', ja:'トウモロコシ・豆・カボチャは、同じ畑でいっしょによく育ちます。' } },
      { id:'obsidian', en:'Obsidian', ja:'{黒曜石|こくようせき}', text:{ en:'Volcanoes made [[obsidian|obsidian]], a black glass. It breaks into very sharp blades.', ja:'火山がつくった[[obsidian|黒曜石]]は、黒いガラスのような石です。割ると、とても{鋭|するど}い{刃|は}になります。' } },
      { id:'cacao', en:'Cacao', ja:'カカオ', text:{ en:'Cacao beans grow in the warm lowlands. People make a drink from them.', ja:'あたたかい低地でカカオ豆が育ちます。飲み物が作れます。' } }
    ],
    challenge:{
      en:['There are no large animals to ride or to pull loads. People carry everything.', 'Mountains, forests and few long rivers make travel slow.', 'Maize needs summer rain, and some years the rain fails.'],
      ja:['乗ったり、荷物を引かせたりできる大きな動物がいません。人がすべてを運びます。', '山や森が多く、長い川が少ないので、移動に時間がかかります。', 'トウモロコシには夏の雨が必要ですが、雨が降らない年もあります。']
    },
    prices:{
      mining:['free',{ en:'Volcanoes give obsidian, a black glass for very sharp tools.', ja:'火山から、鋭い道具になる黒曜石がとれます。' }],
      masonry:['free',{ en:'Soft limestone and volcanic stone are easy to cut.', ja:'やわらかい石灰岩や火山の石は、切りやすいです。' }],
      craft:['free',{ en:'Obsidian and fine clay give skilled workers good materials.', ja:'黒曜石とよい粘土が、職人によい材料をあたえます。' }],
      husbandry:['hard',{ en:'Only turkeys and dogs can be kept. There are no large farm animals.', ja:'飼えるのは{七面鳥|しちめんちょう}と犬だけで、大きな{家畜|かちく}はいません。' }],
      wheel:['hard',{ en:'No animals can pull carts, and the land is steep or covered in forest.', ja:'荷車を引く動物がいません。土地も急な山や森です。' }],
      horseback:['impossible',{ en:'At this time, no horses live in the Americas.', ja:'この時代、アメリカ大陸には馬がいません。' }]
    },
    events:{
      1:{ en:'The summer rain fails. The maize dies in the fields.', ja:'夏の雨が降らず、畑のトウモロコシがかれます。' },
      2:{ en:'Hurricane rain floods the valleys.', ja:'ハリケーンの大雨で、谷が水につかります。' },
      3:{ en:'Traders arrive, carrying cacao and bright feathers.', ja:'カカオと美しい羽を持った商人がやって来ます。' },
      4:{ en:'A sickness spreads through the city.', ja:'町に病気が広がります。' },
      5:{ en:'Cutting the forest leaves tired, thin soil.', ja:'森を切りすぎて、土がやせてしまいます。' },
      6:{ en:'Good rain brings a rich maize harvest.', ja:'雨にめぐまれ、トウモロコシが豊作です。' }
    },
    reveal:{
      name:{ en:'The Olmec, the Maya and [[teotihuacan|Teotihuacan]]', ja:'オルメカ・マヤ・[[teotihuacan|テオティワカン]]' }, when:{ en:'from about 1200 BCE', ja:'紀元前1200年ごろから' },
      facts:{
        en:['Mesoamerica included different societies across many centuries; these categories do not describe one unified civilization.', 'Teotihuacan became a large planned city with monumental buildings, residential districts and a modified river course.', 'Maya cities, such as Palenque, left inscriptions, temples and palaces; they were distinct from Teotihuacan.', 'Their different urban histories show why shared technical labels cannot measure a society’s complexity or success.'],
        ja:['メソアメリカには、長い時代にわたり異なる社会がありました。この分類が、一つの統一文明を表すわけではありません。', 'テオティワカンは、大きな記念建築・居住地区・流路を変えた川を持つ、計画された大都市になりました。', 'パレンケなどのマヤの都市には、碑文・神殿・宮殿が残ります。これらはテオティワカンとは別の社会でした。', '異なる都市の歴史は、共通する技術の名前だけで社会の複雑さや成功を測れないことを示しています。']
      },
      had:['mining','masonry','writing','astrology','math','construction','trade','games','theology']
    }
  },

  J: {
    name:{ en:'Andes and Pacific coast', ja:'アンデス山脈と太平洋岸' },
    area:{ en:'Peru', ja:'ペルー' },
    site:[-10.89, -77.52],
    tagline:{ en:'Very high mountains next to one of the driest deserts on Earth.', ja:'地球で最もかわいた砂漠の一つのとなりに、とても高い山々がそびえています。' },
    land:{
      en:['The Andes mountains rise to more than 6,000 metres.', 'Between the mountains and the Pacific Ocean is a narrow coastal desert.', 'Short rivers run from the mountains to the sea. Each one makes a green valley.'],
      ja:['アンデス山脈は、6,000メートル以上の高さまでそびえます。', '山と太平洋の間には、細長い海岸の砂漠があります。', '短い川が山から海へ流れ、川ごとに緑の谷をつくっています。']
    },
    climate:{ station:'Lima (coast)', source:'Deutscher Wetterdienst',
      temp:[24,25,24,22,20,19,18,17,18,18,20,22], rain:[1,0,0,0,0,1,1,2,1,0,0,0],
      summary:{ en:'The coast is mild, and it almost never rains. In the mountains, the rainy season is December to March.', ja:'海岸はおだやかで、雨はほとんど降りません。山では、12月から3月が雨の季節です。' } },
    resources:[
      { id:'llamas', en:'Llamas and alpacas', ja:'リャマとアルパカ', text:{ en:'Llamas carry loads, and alpacas give soft wool.', ja:'リャマは荷物を運び、アルパカはやわらかい毛をくれます。' } },
      { id:'potatoes', en:'Potatoes', ja:'ジャガイモ', text:{ en:'Many kinds of potato grow in the cold, high mountains.', ja:'寒い高地で、たくさんの種類のジャガイモが育ちます。' } },
      { id:'fish', en:'Fish', ja:'魚', text:{ en:'A cold ocean current brings huge numbers of small fish, such as anchovies.', ja:'冷たい海流が、アンチョビなどの小さな魚を大量に運びます。' } }
    ],
    challenge:{
      en:['The mountain slopes are very steep, and flat land is rare.', 'High in the mountains, the air is thin and cold.', 'Every few years, [[elnino|El Niño]] changes the ocean and brings floods or drought. Earthquakes also happen.'],
      ja:['山の{斜面|しゃめん}はとても急で、平らな土地はわずかです。', '高い山の上は空気がうすく、寒いです。', '数年に一度、[[elnino|エルニーニョ]]で海が変わり、洪水や干ばつが起こります。地震もあります。']
    },
    prices:{
      husbandry:['free',{ en:'Llamas and alpacas give wool and meat, and llamas carry loads.', ja:'リャマとアルパカから毛と肉がとれ、リャマは荷物を運びます。' }],
      irrigation:['free',{ en:'The coast is a desert, but rivers flow down from the Andes. Canals can carry their water to fields in the valleys.', ja:'海岸は砂漠ですが、アンデスから川が流れてきます。水路で、その水を谷の畑へ運べます。' }],
      masonry:['free',{ en:'Hard stone is everywhere in the mountains.', ja:'山には、かたい石がどこにでもあります。' }],
      wheel:['hard',{ en:'The slopes are very steep, and no animal is big enough to pull a cart.', ja:'斜面はとても急で、荷車を引けるほど大きな動物もいません。' }],
      horseback:['impossible',{ en:'There are no horses in the Americas, and llamas are too small to ride.', ja:'アメリカ大陸には馬がいません。リャマは小さすぎて乗れません。' }],
      construction:['hard',{ en:'Earthquakes shake the land, and flat ground for big buildings is rare.', ja:'地震で土地がゆれ、大きな建物を建てる平らな土地も少ないです。' }]
    },
    events:{
      1:{ en:'The mountain rain fails, and the rivers on the coast shrink.', ja:'山に雨が降らず、海岸の川が細くなります。' },
      2:{ en:'El Niño brings rare, heavy rain to the desert coast.', ja:'エルニーニョで、砂漠の海岸にめずらしい大雨が降ります。' },
      3:{ en:'Herders from the high mountains come down with llamas.', ja:'高い山から、リャマを連れた人々が下りて来ます。' },
      4:{ en:'A sickness spreads in the valley towns.', ja:'谷の町に病気が広がります。' },
      5:{ en:'Heavy rain washes the soil off the steep fields.', ja:'大雨で、急な畑の土が流されます。' },
      6:{ en:'The ocean is full of fish, and the potato harvest is good.', ja:'海には魚がいっぱいで、ジャガイモも豊作です。' }
    },
    reveal:{
      name:{ en:'[[caral|Caral]] and the Inca', ja:'[[caral|カラル]]とインカ' }, when:{ en:'from about 2600 BCE', ja:'紀元前2600年ごろから' },
      facts:{
        en:['Around 2600 BCE, the people of Caral built pyramids and plazas. They lived on fish, cotton and farming.', 'Much later, in the 15th and 16th centuries CE, the Inca ruled the largest empire in the Americas.', 'Inca roads ran for more than 30,000 km through the mountains.', 'The Inca kept records with knotted cords called [[khipu|khipu]], not with writing.'],
        ja:['紀元前2600年ごろ、カラルの人々はピラミッドと広場をつくりました。魚・綿・農業でくらしていました。', 'ずっと後の15〜16世紀に、インカがアメリカ大陸で最大の帝国を治めました。', 'インカの道は、山の中を3万キロメートル以上も続いていました。', 'インカは文字ではなく、[[khipu|キープ]]という結んだひもで記録をのこしました。']
      },
      had:['husbandry','masonry','irrigation','construction','workforce','empire','history']
    }
  },

  K: {
    name:{ en:'Greenland', ja:'グリーンランド' },
    area:{ en:'The North Atlantic', ja:'北大西洋' },
    site:[60.82, -45.78],
    tagline:{ en:'A huge island of ice, with green fjords along its south-west coast.', ja:'{巨大|きょだい}な氷の島です。南西の海岸に、緑のフィヨルドがあります。' },
    land:{
      en:['An [[icesheet|ice sheet]] up to 3 km thick covers about 80% of the island.', 'In the south-west, long, deep [[fjord|fjords]] cut into the coast.', 'Grass grows in sheltered places, but almost no trees grow.'],
      ja:['厚さ最大3キロメートルの[[icesheet|{氷床|ひょうしょう}]]が、島の約80%をおおっています。', '南西の海岸には、長く深い[[fjord|フィヨルド]]があります。', '風の当たらない場所には草が生えますが、木はほとんど育ちません。']
    },
    climate:{ station:'Narsarsuaq', source:'Danish Meteorological Institute 1991–2020',
      temp:[-6,-6,-5,1,6,10,11,10,6,2,-3,-6], rain:[40,52,37,45,33,45,50,66,80,57,68,40],
      summary:{ en:'Long winters below 0°C. Summers are short and cool: even in July, the average is about 11°C.', ja:'冬は長く、0℃より寒いです。夏は短くすずしく、7月でも平均は約11℃です。' } },
    resources:[
      { id:'seals', en:'Seals', ja:'アザラシ', text:{ en:'Seals live on the sea ice. They give meat, oil for lamps, and skins.', ja:'アザラシは{海氷|かいひょう}の上にいて、肉・ランプの油・皮になります。' } },
      { id:'walrus', en:'Walrus ivory', ja:'セイウチの{牙|きば}', text:{ en:'Walrus tusks are valuable ivory. People far away pay well for it.', ja:'セイウチのきばは、高く売れる{象牙|ぞうげ}になります。' } },
      { id:'driftwood', en:'Driftwood', ja:'{流木|りゅうぼく}', text:{ en:'Ocean currents bring wood here from Siberia. It is the only large wood.', ja:'シベリアから海流で木が流れて来ます。大きな木材はこれだけです。' } }
    ],
    challenge:{
      en:['Summer is very short, so grass and crops have little time to grow.', 'Winter is long and dark, and sea ice can block boats.', 'Europe is very far away. Ships rarely come.'],
      ja:['夏がとても短く、草や作物が育つ時間が少ないです。', '冬は長く暗く、海氷で船が進めないことがあります。', 'ヨーロッパはとても遠く、船はめったに来ません。']
    },
    prices:{
      sailing:['free',{ en:'Fjords and the sea are the only roads. Light boats of skin and bone work well.', ja:'フィヨルドと海だけが道です。皮と骨でできた軽い船がよく役に立ちます。' }],
      craft:['free',{ en:'Wood and metal are scarce, so people work bone, antler, skin, driftwood and soapstone with great skill.', ja:'木と金属が少ないので、人々は骨・角・皮・流木・{滑石|かっせき}をとても上手に加工します。' }],
      archery:['free',{ en:'Driftwood and antler can be made into bows, and caribou and seals are close by.', ja:'流木や角で弓を作れ、カリブーやアザラシも近くにいます。' }],
      husbandry:['hard',{ en:'Cows and sheep need hay for about seven months of winter.', ja:'牛や羊には、約7か月の冬の間、ほし草が必要です。' }],
      irrigation:['hard',{ en:'Summers are short and cool. Channels can water hayfields for animals, but they take a lot of work to dig and maintain.', ja:'夏は短くすずしいです。水路で家畜のための牧草地に水を引けますが、掘って維持するには多くの労働が必要です。' }],
      shipbuilding:['hard',{ en:'No trees grow big enough. Builders have only driftwood.', ja:'大きく育つ木がありません。使えるのは流木だけです。' }],
      trade:['hard',{ en:'Europe is very far, and sea ice can block ships.', ja:'ヨーロッパはとても遠く、海氷が船の行く手をふさぎます。' }]
    },
    events:{
      1:{ en:'A dry, cold summer. The hay does not grow.', ja:'かわいた寒い夏で、ほし草用の草が育ちません。' },
      2:{ en:'Melting ice sends floods down the fjords.', ja:'とけた氷で、フィヨルドに洪水が流れこみます。' },
      3:{ en:'Strangers arrive by boat from far away.', ja:'遠くから、知らない人々が船でやって来ます。' },
      4:{ en:'A ship brings a sickness.', ja:'船が病気を運んで来ます。' },
      5:{ en:'Cattle and sheep eat the thin grass down to the soil.', ja:'牛や羊が、うすい草を根元まで食べつくします。' },
      6:{ en:'A warm summer: good hay and many seals.', ja:'あたたかい夏です。草はよく育ち、アザラシもたくさんとれます。' }
    },
    reveal:{
      name:{ en:'[[norse|Norse]] farmers and Inuit hunters', ja:'[[norse|ノルド人]]の農民とイヌイットの{狩猟民|しゅりょうみん}' }, when:{ en:'about 985–1450 CE', ja:'紀元985年〜1450年ごろ' },
      facts:{
        en:['Norse settlers came from Iceland in the late tenth century. Farming was combined with hunting marine animals.', 'They imported iron and timber, and exported goods including walrus ivory. European trade involved elites and royal authority.', 'Norse settlements ended during the fifteenth century. Climate and political-economic changes are possible interacting causes, not one settled explanation.', 'Ancestors of Inuit communities arrived around 1200 with efficient Arctic transport. Their knowledge and settlement histories differed from Norse farming.'],
        ja:['ノルド人の移住者は10世紀末にアイスランドから来ました。農業と海獣の狩猟を組み合わせていました。', '鉄と木材を輸入し、セイウチの牙などを輸出しました。ヨーロッパとの交易には、支配層と王権が関わりました。', 'ノルド人の居住は15世紀に終わりました。気候と政治・経済の変化が重なった可能性があり、説明は一つに確定していません。', 'イヌイットの祖先は1200年ごろ、効率的な北極の移動手段とともに来ました。知識と居住の歴史は、ノルド人の農業と異なります。']
      },
      had:['husbandry','trade','masonry','theology','sailing','archery']
    }
  }
};

// The historical categories are comparisons, not prerequisite-complete saved trees.
// Difficulty notes pair source-supported observations with explicit interpretive
// questions. They avoid treating one explanation of change as historically inevitable.
const historicalContext = {
  A:{
    difficulty:{
      en:['Stone construction and distant exchange supported an urban centre over centuries. Feeding its population exceeded a single Masonry click.', 'Imported objects document connections, but cannot establish that every household shared equally in their benefits.', 'What evidence would distinguish environmental pressure from changing trade, conflict or authority?'],
      ja:['石造建築と遠くとの交流が、何世紀にもわたり都市を支えました。人口を養う仕事は、石工術を一回クリックするだけでは表せません。', '輸入品は交流を示しますが、すべての家が利益を平等に得たことまでは示せません。', '環境の圧力と、交易・対立・権威の変化を区別するには、どんな証拠が必要でしょうか？']
    },
    sources:[{title:{en:'UNESCO: Great Zimbabwe',ja:'ユネスコ：グレート・ジンバブエ'},url:'https://whc.unesco.org/en/list/364/'}]
  },
  B:{
    difficulty:{
      en:['Minoan centres combined administration, storage and religion; later Greek cities organized authority differently. These cards compress different centuries and institutions.', 'Athenian political equality applied to citizen men, while imperial power could restrict other communities. Assembly does not mean universal inclusion.', 'Who financed maritime connections, and who bore the costs of conflict or compulsory work?'],
      ja:['ミノアの中心は行政・貯蔵・宗教を結びつけ、後のギリシアの都市は権威を別の形で組織しました。カードは異なる時代と制度を縮めています。', 'アテネの政治的平等は男性市民に適用され、帝国的な支配は他の共同体を制約しえました。集会は、全員の参加を意味しません。', '海のつながりに必要な費用はだれが払い、対立や義務的な労働の負担はだれが負ったのでしょうか？']
    },
    sources:[{title:{en:'UNESCO: Minoan Palatial Centres',ja:'ユネスコ：ミノア文明の宮殿の中心'},url:'https://whc.unesco.org/en/list/1733/'},{title:{en:'The Metropolitan Museum: Greek Art, Prehistoric to Classical',ja:'メトロポリタン美術館：先史時代から古典期のギリシア美術'},url:'https://resources.metmuseum.org/resources/metpublications/pdf/Greek_Art_From_Prehistoric_to_Classical.pdf'}]
  },
  C:{
    difficulty:{
      en:['Texts from Lagash record royal and temple responsibilities for canals and labor obligations. Irrigation involved recurring [[maintenance|maintenance]] and power over workers.', 'These arrangements changed across periods. One Irrigation or Laws card cannot represent access to land, obligations and disputes.', 'Who could demand work, and what might change if cultivators resisted those demands?'],
      ja:['ラガシュの文書は、運河に対する王と神殿の責任と労働の義務を記録しています。灌漑には継続的な[[maintenance|維持管理]]と労働者への権力が関わりました。', 'こうしたしくみは時代によって変わりました。一枚の灌漑や法律のカードでは、土地へのアクセス・義務・争いを表せません。', 'だれが労働を要求でき、耕作者がその要求に抵抗したら、何が変わったでしょうか？']
    },
    sources:[{title:{en:'Topoi research: Water Management of Mesopotamia',ja:'トポイ研究：メソポタミアの水管理'},url:'https://www.topoi.org/project/a-3-6/'},{title:{en:'The Metropolitan Museum: Cuneiform administrative tablet',ja:'メトロポリタン美術館：楔形文字の行政文書'},url:'https://www.metmuseum.org/art/collection/search/325500'}]
  },
  D:{
    difficulty:{
      en:['Planned streets, drains and shared standards show coordination. Undeciphered writing limits what we can establish about political authority.', 'Coordination does not prove monarchy. Architecture alone cannot identify who negotiated rules or controlled resources.', 'Compare household upkeep with large public projects. What evidence would establish who bore their costs?'],
      ja:['計画された道・排水・共通の規格は、協力の調整を示します。文字が未解読のため、政治的権威について確かめられることには限界があります。', '協力の調整は、王政の証明ではありません。建築だけでは、だれが規則を交渉し、資源を管理したか分かりません。', '家ごとの維持作業と大きな公共事業を比べてください。だれが費用を負ったか確かめるには、どんな証拠が必要でしょうか？']
    },
    sources:[{title:{en:'UNESCO: Archaeological Ruins at Moenjodaro',ja:'ユネスコ：モヘンジョ・ダロの遺跡'},url:'https://whc.unesco.org/en/list/138/'},{title:{en:'Jonathan Mark Kenoyer: Social power in Indus cities',ja:'ジョナサン・マーク・ケノイヤー：インダス都市の社会的権力'},url:'https://www.harappa.com/content/uncovering-keys-lost-indus-cities'}]
  },
  E:{
    difficulty:{
      en:['Research maps a water network repeatedly expanded and modified. Keeping it usable required work beyond initial construction.', 'Researchers link climate stress to infrastructure failures. That is an interacting mechanism, rather than climate determining one inevitable outcome.', 'Which workers and users bore maintenance costs, and how could different decisions alter their exposure to harm?'],
      ja:['研究は、くり返し拡張・変更された水のネットワークを示しています。使い続けるには、最初の建設以外にも作業が必要でした。', '研究者は、気候の圧力と設備の故障の関連を示しています。複数の要因が関わるしくみであり、気候が必然の結果を決めたという意味ではありません。', '維持の費用を負った労働者や利用者はだれで、別の決定なら被害を受けやすさはどう変わったでしょうか？']
    },
    sources:[{title:{en:'Fletcher and colleagues: The water management network of Angkor',ja:'フレッチャーら：アンコールの水管理ネットワーク'},url:'https://www.cambridge.org/core/journals/antiquity/article/abs/water-management-network-of-angkor-cambodia/EC4E312C23A724E6B629B4A252FF15D9'},{title:{en:'University of Sydney: Greater Angkor Project research',ja:'シドニー大学：大アンコール・プロジェクトの研究'},url:'https://www.sydney.edu.au/news-opinion/news/2018/10/18/climate-stress-will-make-cities-more-vulnerable--new-angkor-rese.html'}]
  },
  F:{
    difficulty:{
      en:['Ritual bronze production, royal tombs and ancestor consultation linked specialist skill with elite authority.', 'Sacrificial remains show severe burdens distributed unequally. A technical achievement is not evidence that everyone benefited.', 'How might access to ritual objects or records affect a ruler’s legitimacy and opponents’ ability to challenge it?'],
      ja:['儀礼の青銅器生産・王墓・祖先への問いかけは、専門技能と支配層の権威を結びつけました。', '犠牲者の遺骨は、深刻な負担が不平等に分配されたことを示します。技術の達成は、全員が利益を得た証拠ではありません。', '儀礼の道具や記録を利用できることは、王の正当性と、それに異議を唱える力にどう関わったでしょうか？']
    },
    sources:[{title:{en:'UNESCO: Yin Xu',ja:'ユネスコ：殷墟'},url:'https://whc.unesco.org/en/list/1114/'}]
  },
  G:{
    difficulty:{
      en:['Excavations at Giza show organized provisioning for a large workforce. Stone building required food, transport and administration over many years.', 'Masonry does not automatically create a reservoir, and a reservoir does not remove unequal access to water. The event rule abstracts both.', 'Who organized labor and supplied food, and how could those obligations compete with a household’s own needs?'],
      ja:['ギザの発掘は、大きな労働力に食料を供給する組織を示します。石の建築には、長年の食料・輸送・行政が必要でした。', '石工術だけで貯水池が生まれるわけではなく、貯水池だけで水へのアクセスの不平等がなくなるわけでもありません。イベントの規則は両方を省略しています。', 'だれが労働を組織し食料を供給し、その義務は家ごとの必要とどう競合したでしょうか？']
    },
    sources:[{title:{en:'Ancient Egypt Research Associates: Pyramids and Protein',ja:'古代エジプト研究協会：ピラミッドと食料供給'},url:'https://aeraweb.org/pyramids-and-protein/'},{title:{en:'Ancient Egypt Research Associates: Feeding Pyramid Workers',ja:'古代エジプト研究協会：ピラミッド労働者を養う'},url:'https://aeraweb.org/feeding-pyramid-workers/'}]
  },
  H:{
    difficulty:{
      en:['Seasonal water management and knowledge of eel life cycles sustained [[aquaculture|aquaculture]] over generations. One Irrigation card cannot represent that expertise.', 'Knowledge transmitted through Elders and collective practice supported complex engineering without the kingdom-centred sequence implied by this tree.', 'What cooperation and obligations could sustain maintenance, and what does this case reveal about the model’s assumptions?'],
      ja:['季節ごとの水管理とウナギの生活周期の知識が、何世代にもわたり[[aquaculture|水産養殖]]を支えました。一枚の灌漑カードでは、その専門知識を表せません。', '長老と共同の実践を通じて伝わる知識が、王国を中心とするツリーの順序によらず、複雑な工学を支えました。', 'どんな協力と義務が維持管理を支え、この例はモデルの前提について何を示すでしょうか？']
    },
    sources:[{title:{en:'UNESCO: Budj Bim Cultural Landscape',ja:'ユネスコ：バッジ・ビムの文化的景観'},url:'https://whc.unesco.org/en/list/1577/'}]
  },
  I:{
    difficulty:{
      en:['Teotihuacan’s planned districts and modified river required coordination at urban scale. Palenque’s monuments expressed the ideology of its rulers.', 'These cases involved different institutions and dates. Pooling their developments into one list hides who controlled work, land and ritual.', 'Which comparison is justified by material evidence, and which similarity exists only because the game uses broad labels?'],
      ja:['テオティワカンの計画された地区と変更された川には、都市規模での調整が必要でした。パレンケの建築は、支配層の思想を表しました。', '両者は制度と時代が異なります。発展を一つの一覧にまとめると、だれが労働・土地・儀礼を管理したか見えなくなります。', '物的証拠が支える比較はどれで、ゲームの大まかな名前だけが生む類似はどれでしょうか？']
    },
    sources:[{title:{en:'UNESCO: Teotihuacan',ja:'ユネスコ：テオティワカン'},url:'https://whc.unesco.org/en/list/414/'},{title:{en:'UNESCO: Palenque',ja:'ユネスコ：パレンケ'},url:'https://whc.unesco.org/en/list/411/'}]
  },
  J:{
    difficulty:{
      en:['Caral’s ceremonial centre and the much later Inca road network belong to different societies separated by thousands of years.', 'The Andean road system connected settlements, storage and administration across difficult terrain. A Construction card removes its continuing logistical burden.', 'Who could require contributions, and how might local communities experience an empire differently from its administrators?'],
      ja:['カラルの儀礼の中心と、ずっと後のインカの道路網は、数千年へだたった別の社会に属します。', 'アンデスの道路は、難しい地形を通じて居住地・貯蔵・行政を結びました。建設のカードは、継続する輸送の負担を省いています。', 'だれが負担を要求でき、地域の共同体と行政を担う人々では、帝国の経験がどう異なったでしょうか？']
    },
    sources:[{title:{en:'UNESCO: Sacred City of Caral-Supe',ja:'ユネスコ：カラル・スーペの聖なる都市'},url:'https://whc.unesco.org/en/list/1269/'},{title:{en:'UNESCO: Qhapaq Ñan, Andean Road System',ja:'ユネスコ：カパック・ニャン、アンデスの道路網'},url:'https://whc.unesco.org/en/list/1459/'}]
  },
  K:{
    difficulty:{
      en:['Norse food combined herding with marine hunting; trade in imported materials involved elite control and, later, a royal monopoly.', 'Thule communities used specialized Arctic transport, storage and cooperative hunting. The same coast supported different strategies and social arrangements.', 'Norse depopulation has several possible explanations. What evidence could separate climate effects from political and economic changes?'],
      ja:['ノルド人は家畜の飼育と海獣の狩猟を組み合わせ、輸入品の交易には支配層の管理と、後には王の独占が関わりました。', 'チューレの共同体は、北極に適した輸送・貯蔵・共同狩猟を使いました。同じ海岸でも、異なる戦略と社会のしくみがありました。', 'ノルド人の居住が終わった理由には、複数の可能性があります。気候の影響と政治・経済の変化を区別するには、どんな証拠が必要でしょうか？']
    },
    sources:[{title:{en:'National Museum of Denmark: Norse Greenland',ja:'デンマーク国立博物館：ノルド人のグリーンランド'},url:'https://natmus.dk/organisation/forskning-og-kulturarv/nyere-tid-og-verdens-kulturer/etnografisk-samling/arktisk-forskning/prehistory-of-greenland/norse/'},{title:{en:'National Museum of Denmark: Thule culture',ja:'デンマーク国立博物館：チューレ文化'},url:'https://natmus.dk/organisation/forskning-og-kulturarv/nyere-tid-og-verdens-kulturer/etnografisk-samling/arktisk-forskning/prehistory-of-greenland/thule/'},{title:{en:'National Museum of Denmark: Norse settlement and uncertainty',ja:'デンマーク国立博物館：ノルド人の居住と未解決の問題'},url:'https://natmus.dk/historisk-viden/verden/nordatlanten/nordboerne-i-groenland/'}]
  }
};
for (const [point, context] of Object.entries(historicalContext)) Object.assign(regions[point].reveal, context);

// Approximate climate about 4,000 years ago (around 2000 BCE), applied to the modern station
// averages as a temperature shift and a rainfall factor. These are coarse classroom estimates
// from published palaeoclimate research, not reconstructed monthly values.
const pastClimate = {
  A:{ temp:0, rain:1.1, en:'Probably similar to today, perhaps a little wetter. A stalagmite from Cold Air Cave shows rainfall changing quickly from century to century.', ja:'今とほぼ同じで、少し雨が多かった可能性があります。コールド・エア洞窟の石筍は、雨の量が百年ごとに大きく変わったことを示します。', source:['Holmgren and colleagues: a Holocene climate record from Cold Air Cave','ホルムグレンら：コールド・エア洞窟の完新世の気候記録','https://www.sciencedirect.com/science/article/abs/pii/S0031018298002235'] },
  B:{ temp:0, rain:1.1, en:'Probably similar to today, but slightly wetter. The eastern Mediterranean was slowly becoming drier during this period.', ja:'今とほぼ同じですが、少し雨が多かったと考えられます。東地中海は、この時代にゆっくり乾燥していきました。', source:['Roberts and colleagues: eastern Mediterranean mid-Holocene transition (2011)','ロバーツら：中期完新世の東地中海の変化（2011年）','https://journals.sagepub.com/doi/10.1177/0959683610386819'] },
  C:{ temp:0, rain:0.7, en:'Around 2200 BCE, a severe drought lasted about 300 years. Dust records show it; this chart shows that drought, with about 30% less rain.', ja:'紀元前2200年ごろ、約300年続く深刻な干ばつがありました。ちりの記録が示し、この図は雨が約30%少ない状態を表します。', source:['Cullen and colleagues: climate change and the Akkadian empire (Geology, 2000)','カレンら：気候変化とアッカド帝国（2000年）','https://leilan.yale.edu/sites/default/files/publications/article-specific/cullen2000_0.pdf'] },
  D:{ temp:0, rain:1.2, en:'The summer monsoon was probably stronger than today, then weakened. Rivers fed by monsoon rain later became seasonal or dried up.', ja:'夏のモンスーンは今より強かったと考えられ、その後弱まりました。モンスーンの雨に頼る川は、後に季節的になったり、かれたりしました。', source:['Giosan and colleagues: fluvial landscapes of the Harappan civilization (PNAS, 2012)','ジオサンら：ハラッパー文明の河川景観（2012年）','https://www.pnas.org/doi/10.1073/pnas.1112743109'] },
  E:{ temp:0, rain:1.1, en:'The monsoon was strongest before about 3300 BCE. By 2000 BCE it was probably only a little wetter than today.', ja:'モンスーンは紀元前3300年ごろより前に最も強くなりました。紀元前2000年ごろは、今より少し雨が多い程度だったと考えられます。', source:['Penny: the Holocene history of the Tonle Sap (2006)','ペニー：トンレサップ湖の完新世の歴史（2006年）','https://www.sciencedirect.com/science/article/abs/pii/S0277379105001241'] },
  F:{ temp:1.5, rain:1.2, en:'Warmer and wetter than today. Pollen near Anyang shows a warm, humid period that ended with cooling and drying after about 2500 BCE.', ja:'今より暖かく、雨も多かったです。安陽付近の花粉は、紀元前2500年ごろ以後に寒冷化と乾燥で終わる、暖かく湿った時期を示します。', source:['A pollen-based reconstruction of Holocene rainfall in the Anyang area (2024)','安陽地域の花粉による完新世の降水量の復元（2024年）','https://www.sciencedirect.com/science/article/abs/pii/S1040618224001769'] },
  G:{ temp:0, rain:1, en:'Local rain was already almost zero. The Sahara had become a desert after about 5300 BCE, pushing people towards the Nile.', ja:'地元の雨は、すでにほとんど降りませんでした。紀元前5300年ごろ以後にサハラが砂漠になり、人々はナイル川へ移りました。', source:['Kuper and Kröpelin: climate-controlled Holocene occupation in the Sahara (Science, 2006)','クーパー、クレペリン：サハラの気候と人の居住（2006年）','https://www.science.org/doi/10.1126/science.1130989'] },
  H:{ temp:0, rain:1.1, en:'A little wetter than today, but changing. After about 3000 BCE, El Niño droughts became more frequent in south-eastern Australia.', ja:'今より少し雨が多かったものの、変化の途中でした。紀元前3000年ごろ以後、オーストラリア南東部ではエルニーニョの干ばつが増えました。', source:['The Holocene hypsithermal in the Australian region (2022)','オーストラリア地域の完新世の温暖期（2022年）','https://www.sciencedirect.com/science/article/pii/S2666033422000144'] },
  I:{ temp:0, rain:0.85, en:'Drier than today. Lakes in central Mexico were low between about 3700 and 1800 BCE, before wetter conditions returned.', ja:'今より乾燥していました。メキシコ中央部の湖は、紀元前3700〜1800年ごろ水位が低く、その後雨が多くなりました。', source:['Metcalfe and colleagues: climate change in Mexico, a review (2000)','メトカーフら：メキシコの気候変化の総説（2000年）','https://www.sciencedirect.com/science/article/abs/pii/S0277379199000220'] },
  J:{ temp:0, rain:1, en:'The coast was already a desert. El Niño events were rare between about 3800 and 900 BCE, so disasters from sudden coastal rain were less frequent.', ja:'海岸はすでに砂漠でした。紀元前3800〜900年ごろはエルニーニョがまれで、急な大雨の災害が少なかったです。', source:['Sandweiss and colleagues: reconstructing Holocene El Niño in coastal Peru (PNAS, 2020)','サンドワイスら：ペルー海岸の完新世のエルニーニョ（2020年）','https://pmc.ncbi.nlm.nih.gov/articles/PMC7165442/'] },
  K:{ temp:2, rain:1, en:'Summers were about 2–3 °C warmer than today between 4000 and 2000 BCE, and the ice sheet was smaller. Cooling began after that.', ja:'紀元前4000〜2000年ごろ、夏は今より約2〜3℃暖かく、氷床は小さかったです。その後、寒冷化が始まりました。', source:['Axford and colleagues: past warmth during the Holocene Thermal Maximum in Greenland (2021)','アクスフォードら：完新世の温暖期のグリーンランド（2021年）','https://www.annualreviews.org/content/journals/10.1146/annurev-earth-081420-063858'] }
};
for (const [point,{ temp, rain, en, ja, source:[sen,sja,url] }] of Object.entries(pastClimate)) regions[point].climate.past = { tempShift:temp, rainFactor:rain, note:{ en, ja }, source:{ title:{ en:sen, ja:sja }, url } };

export const points = Object.keys(regions);
// The Pacific-centred world map (NASA Blue Marble, equirectangular), like slide 16.
// `left` is the longitude at the left edge; `top`/`bottom` are the latitudes shown.
export const worldMap = { left:-17.5, top:80, bottom:-56, image:'/assets/world-map.webp' };

// Longer geographical readings describe choices before the historical reveal.
// They deliberately withhold the names and outcomes of the historical examples.
const regionalContexts = {
  A:{en:[
    'The Zimbabwe Plateau lies inland in southern Africa, between the Zambezi basin to the north and the Limpopo basin to the south. Much of the land is high enough to be cooler than the surrounding lowlands. Granite hills interrupt open grassland and woodland; streams divide the landscape into smaller farming and grazing areas. The coast is several hundred kilometres away. An inland community can connect to coastal exchange. Moving goods there requires paths, carriers, supplies and agreements with people along the route.',
    'Rainfall is strongly seasonal. Summer rain supports crops and renews grazing, while the dry winter reduces surface water. A community must consider both the annual cycle and the possibility of several poor seasons. Keeping cattle can provide food, hides and a store of wealth, but herds require pasture, water and care. Farming and herding may support each other, yet they can also compete for land. Lower, warmer valleys bring different conditions, including diseases transmitted by tsetse flies that affect livestock.',
    'Useful materials are unevenly distributed. Local granite provides building stone, while deposits of gold and iron can support mining and metalworking. A deposit alone does not produce a useful tool: people must locate workable ore, supply fuel, learn techniques and move finished goods. Likewise, a stone wall requires experienced builders and a continuing food supply. Think about the connections between the plateau and neighbouring environments. Your starting place offers several possible livelihoods. Settlements concentrating on cattle, grain, mining or exchange need different arrangements for work, storage and access to resources.'
  ],ja:[
    'ジンバブエ高原はアフリカ南部の内陸にあり、北のザンベジ川流域と南のリンポポ川流域の間に位置します。周囲の低地より標高が高く、比較的すずしい土地です。草原と森林の中に花崗岩の丘があり、小川が農地や放牧地を分けています。海岸までは数百キロメートルあります。海岸との交流は可能ですが、道・運び手・食料と、通過する地域の人々との合意が必要です。',
    '雨には強い季節性があります。夏の雨は作物と牧草を育てますが、乾燥する冬には地表の水が減ります。毎年の季節の変化と、雨の少ない年が続く場合の両方を考える必要があります。牛は食料・皮・財産になりますが、草・水・世話を必要とします。農業と牧畜は互いに支え合う一方、土地をめぐって競合することもあります。暑い低地では、ツェツェバエがうつす家畜の病気など、高原とは異なる条件があります。',
    '資源は均等に分布していません。花崗岩は建築に使え、金や鉄の鉱床は採鉱と金属加工につながります。ただし、鉱床があるだけで道具ができるわけではありません。鉱石を探し、燃料を集め、技術を習得し、製品を運ぶ必要があります。石の壁も、熟練した作り手と食料の供給を必要とします。高原と周辺の環境のつながりに注目してください。牛・穀物・採鉱・交易のどれを重視するかによって、仕事・貯蔵・資源利用のしくみが変わります。'
  ]},
  B:{en:[
    'The Aegean is a network of islands, peninsulas and coastal valleys between the Greek mainland, Crete and western Anatolia. Mountains occupy much of the land, and sizeable plains are separated by steep slopes. Look at the map as a pattern of routes: a nearby island may be easier to reach by boat than a valley across a mountain ridge. At the same time, short distances do not make every crossing safe. Winds, storms, landing places and knowledge of local waters all affect movement.',
    'The climate has rainy winters and dry summers. Winter rain supplies springs and soil moisture, but summer crops can face water shortages. Olive trees and grape vines are suited to many dry slopes. Grain production needs suitable soils and enough water at the right time. Sheep and goats can use rough pasture that is difficult to cultivate. Fishing adds another source of food. These activities involve different seasons, skills and storage needs, so a household or settlement may combine several rather than depend on one.',
    'Stone is available in many places, while timber, metals and good agricultural land are distributed unevenly. Sea routes can connect communities with different products, but exchange depends on reliable boats, crews and trading partners. Building a larger vessel requires more than knowing how a sail works: suitable wood, specialist work and maintenance matter as well. Small areas of productive land can encourage people to use distant resources or protect local access more closely. The same coast could support fishing villages, trading ports or centres controlling surrounding farmland. Consider how your team would link scattered settlements and organize shared facilities without assuming that mountains must keep everyone politically separate.'
  ],ja:[
    'エーゲ海は、ギリシア本土・クレタ島・アナトリア西部の間に広がる、島・半島・海岸の谷のネットワークです。山が多く、大きな平野は急な斜面で分かれています。地図を移動経路として見てください。山を越えた谷より、船で近くの島へ行く方が容易な場合があります。ただし、近い海でも安全とは限りません。風・嵐・上陸できる場所と、海を知る経験が移動を左右します。',
    '冬は雨が多く、夏は乾燥します。冬の雨は泉や土に水を供給しますが、夏の作物は水不足に直面することがあります。オリーブやブドウは乾いた斜面でも育ちますが、穀物には適した土と必要な時期の水が必要です。羊やヤギは耕しにくい土地の草を利用できます。漁業も食料を供給します。それぞれ季節・技能・貯蔵の条件が異なるため、家や集落は複数の仕事を組み合わせることができます。',
    '石は多くの場所で得られますが、木材・金属・農地は均等にはありません。船は異なる産物を持つ共同体を結びます。ただし、交易には船・船員・取引相手との関係が必要です。大型船には帆の知識だけでなく、適した木材・専門技能・維持管理が必要になります。農地の少なさは、外の資源を利用する選択にも、地域の資源を厳しく管理する選択にもつながりえます。同じ海岸でも漁村・港・農地を支配する中心が成立できます。離れた集落をどう結ぶか考えてください。'
  ]},
  C:{en:[
    'Southern Mesopotamia is a broad alluvial plain formed by the Tigris and Euphrates rivers. These rivers carry water from wetter uplands through a region where local rainfall is often insufficient for dependable farming. Their channels have shifted over time, and the coast and marshes have also changed. The map shows the modern river system. It helps explain the relationship between uplands, plain and sea. Ancient settlement locations and river channels changed over time. A site beside water has different possibilities from land only a short distance away.',
    'River water is valuable, but its seasonal timing creates problems. Water can be scarce when fields need it, while spring floods may arrive near the harvest. Canals, embankments and drainage can redirect water and protect crops. They must also be cleared and repaired as sediment accumulates or banks fail. On a flat plain, one settlement’s use of water can affect another downstream. Repeated watering in a dry climate can leave salts behind, making soil management important alongside the construction of canals.',
    'Clay and reeds are abundant materials for containers, bricks, baskets and buildings. Timber, building stone and many metal ores are less readily available in the southern plain. Communities can develop local substitutes, obtain materials through exchange, or combine the two. Boats can move bulky goods on suitable waterways, but transport also depends on changing channels and connections to distant suppliers. Food storage, specialist crafts and record keeping become useful when people manage shared supplies. Consider what your settlement would produce locally, which materials it would seek elsewhere, and how neighbours would agree about water and work. The river offers opportunities, but organizing access is a social decision.'
  ],ja:[
    'メソポタミア南部は、チグリス川とユーフラテス川がつくった広い沖積平野です。川は雨の多い高地から水を運びますが、南部の雨だけでは安定した農業が難しい場所が多くあります。川の流路・海岸・湿地は長い時間の中で変わりました。地図は現代の水系なので、古代の集落の正確な配置ではなく、高地・平野・海の関係を理解するために使ってください。水辺と、そこから少し離れた土地では、暮らしの条件が異なります。',
    '川の水は重要ですが、季節のタイミングに問題があります。畑に水が必要な時期には不足し、春の洪水は収穫のころに来る場合があります。水路・堤防・排水で水を誘導し、作物を守ることができます。ただし、土砂がたまったり、岸が壊れたりするので、清掃と修理が必要です。平らな土地では、上流の取水が下流に影響します。乾燥した気候で繰り返し水を引くと、土に塩が残ることもあり、水路の建設と土の管理の両方が重要です。',
    '粘土と葦は、器・れんが・かご・建物に利用できます。南部の平野では、木材・建築用の石・多くの金属鉱石は手に入りにくい資源です。地元の材料で代用する方法と、交換で得る方法を組み合わせられます。船は重い荷物を運べますが、流路の変化や遠くの供給者との関係にも左右されます。共同の物資を扱う場合、貯蔵・専門的な手工業・記録が役立ちます。何を地元で作り、何を外から得て、水と仕事の分担をどう決めるか考えてください。'
  ]},
  D:{en:[
    'The Indus region connects mountain valleys, river plains, dry inland areas and an Arabian Sea coast. Water enters the Indus from snow and ice in the high mountains and from rainfall across its basin. Conditions vary greatly: a riverbank, a desert edge and a coastal settlement do not share the same farming or transport options. The activity uses one starting point to represent part of this larger region. Read the map alongside the climate chart, which describes a modern station rather than every place in the basin.',
    'Summer monsoon rain and seasonal river flows affect when land can be planted and how much water is available. Floods can renew soils but also damage houses and change routes. River channels are not permanently fixed. Farmers can choose different crops, planting seasons and locations to spread risk; wells and other forms of water management can supplement access. Such choices require knowledge of local conditions. A large river is therefore both a resource and a source of uncertainty. Settlements need ways to respond when water behaves differently from expected.',
    'Clay supports pottery and brick making, while cotton can be spun and woven. Different parts of the wider region provide stones such as carnelian, shells, timber and metals. Obtaining these materials can link river settlements with coastal or upland communities. Moving goods efficiently also requires containers, routes and agreed measures. Shared building standards can make construction easier, but someone must learn and maintain them. Think about how a settlement would secure drinking water, handle waste and connect craft producers to food supplies. Its organisation could rely on households, neighbourhood cooperation, influential specialists or larger authorities. Good planning is not itself evidence that only one form of government can work here.'
  ],ja:[
    'インダス地域には、山の谷・川の平野・乾燥した内陸・アラビア海の海岸があります。インダス川の水は、高山の雪や氷と、流域の雨から来ます。川辺・砂漠の縁・海岸では、農業や輸送の条件が大きく異なります。この活動の開始地点は、広い地域の一部を代表しています。地図と気候図を合わせて読んでください。気候図は現代の一観測地点の数値であり、流域の全ての場所を表すわけではありません。',
    '夏のモンスーンと川の季節変化は、作付けの時期と水量に影響します。洪水は土を更新する一方、家を壊し、道を変えることもあります。川の流路も固定されていません。農民は、作物・植える時期・場所を組み合わせてリスクを分散できます。井戸などで水へのアクセスを補うことも可能ですが、そのためには地域の知識が必要です。大河は資源であると同時に不確実性の原因でもあり、予想と異なる水の動きに対応するしくみが必要になります。',
    '粘土は陶器とれんがに、綿花は糸と布に利用できます。広い地域には、カーネリアンなどの石・貝・木材・金属が異なる場所にあります。材料を得る活動は、川の集落と海岸や山の共同体を結びます。効率よく運ぶには、容器・経路・共通の尺度も役立ちます。建築の共通規格は作業を助けますが、学び維持する人が必要です。飲み水・排水・職人への食料供給をどう組織するか考えてください。家・近隣・専門家・大きな権威など、複数のしくみが考えられます。'
  ]},
  E:{en:[
    'The lower Mekong basin contains river channels, broad floodplains and the Tonle Sap lake in present-day Cambodia. During the wet season, high water in the Mekong can reverse the flow of the Tonle Sap River and expand the lake. During the dry season, water flows out again. Forested hills and upland areas surround parts of the plain. The boundary between land and water moves. A place suitable for farming or settlement in one season may be flooded in another.',
    'Rice cultivation depends on water arriving in useful amounts and at useful times. Fishing draws on the seasonal movement of fish and the changing habitats of the lake and wetlands. A community combining the two needs knowledge of both cycles. Reservoirs, canals and embankments can store or redirect water, but construction changes how water reaches neighbouring land. Too little water can harm crops, while excessive flows can erode channels or damage structures. Maintaining a network involves regular work as well as decisions about whose fields receive water first.',
    'Timber, fish, rice and building materials come from different environments within the wider region. Boats can connect communities when waterways are usable; paths on dry land and routes to uplands matter too. A settlement concentrating on large buildings or specialised crafts must obtain food and materials from elsewhere. Organising this supply may involve exchange, obligations to leaders, cooperation between villages or a mixture of arrangements. Start by identifying the seasonal water cycle, then consider how your team would store food, protect important routes and share maintenance. Large infrastructure may increase production, but a system depending on many connected parts also creates responsibilities that continue after construction ends.'
  ],ja:[
    'メコン川下流域には、川の流路・広い氾濫原・現在のカンボジアにあるトンレサップ湖があります。雨季にはメコン川の水位が高くなり、トンレサップ川の流れが逆転して湖が広がります。乾季には再び湖から水が流れ出します。平野の周囲には森林の丘や高地があります。陸と水の境界が動くため、ある季節に農地や集落に向く場所が、別の季節には水につかることがあります。',
    '稲作には、必要な時期に適した量の水が来ることが重要です。漁業は魚の季節移動と、湖や湿地の変化を利用します。両方を行う共同体には、それぞれの周期の知識が必要です。貯水池・水路・堤防は水をためたり誘導したりできますが、隣の土地に届く水にも影響します。水不足は作物を傷め、大量の水は水路を削り、設備を壊すことがあります。水のネットワークを維持するには、継続的な作業と、水を配る順序を決めるしくみが必要です。',
    '木材・魚・米・建築材料は、異なる環境から得られます。利用できる水路では船が共同体を結び、陸の道や高地への経路も重要です。大きな建築や専門的な手工業を重視する集落は、外から食料や材料を得る必要があります。供給には、交換・指導者への義務・村どうしの協力などを組み合わせられます。季節の水の周期を確認し、食料の貯蔵・経路の保護・維持作業の分担を考えてください。大きな設備は生産を増やす可能性がありますが、建設後も続く責任を生みます。'
  ]},
  F:{en:[
    'The middle and lower Yellow River region includes loess uplands, tributary valleys and extensive plains. Loess is fine sediment deposited by wind; it can be fertile and workable, but it is also vulnerable to erosion. The river carries large amounts of sediment from upstream. Its water and deposited soils help support farming, yet channels can shift and floodwaters can spread across low ground. The starting area is one part of a much larger basin, whose mountains, plains and northern grasslands offer different resources.',
    'Summer brings most of the rain, while winters are colder and drier. Millet is well suited to many northern farming environments, and people can combine cultivation with livestock, hunting and other food sources. The timing and reliability of rainfall affect harvests, grain stores and the work available for other activities. A strong harvest can support specialists, but a storage system also needs protected buildings and agreed access. Flood management and soil protection involve decisions across households and settlements because water and eroded soil cross local boundaries.',
    'Clay, stone and metal ores provide possibilities for pottery, construction and metalworking. Bronze production requires several materials, including copper and tin, together with fuel, mould making and skilled casting. These ingredients need not come from the same place. Exchange routes can connect workshops with distant supplies, while competition for those routes may matter as much as the local landscape. Consider how your team would provide food for specialists and decide who controls valuable finished objects. Knowledge of seasons, record keeping and shared ceremonies may help coordinate activities. The people who possess those skills can also gain authority. Your choices should explain both the material needs of production and the relationships that keep it working.'
  ],ja:[
    '黄河の中流・下流域には、黄土の高地・支流の谷・広い平野があります。黄土は風が運んだ細かい堆積物です。作物を育てやすく耕しやすい場所もありますが、侵食にも弱い土です。黄河は上流から大量の土砂を運びます。水と堆積した土は農業を支えますが、川が流路を変えたり、洪水が低地に広がったりすることがあります。開始地点は広い流域の一部であり、山・平野・北の草原には異なる資源があります。',
    '雨の多くは夏に降り、冬は寒く乾燥します。アワやキビは北部の多くの環境に向き、農業と家畜・狩猟などを組み合わせられます。雨の時期と安定性は、収穫・穀物の備蓄・ほかの仕事に使える労力を左右します。豊かな収穫は専門家を支えますが、貯蔵には安全な建物と利用の規則が必要です。水と流れた土は集落の境界を越えるため、洪水への対策や土の保護には、複数の家や集落の判断が関わります。',
    '粘土・石・金属鉱石は、陶器・建築・金属加工に利用できます。青銅には銅とすずなどの材料に加え、燃料・鋳型・熟練した鋳造技術が必要です。全てが同じ場所で得られるとは限りません。交易路は工房と遠くの供給地を結び、その支配をめぐる競争も重要になります。専門家への食料供給と、貴重な完成品を管理する人を考えてください。季節の知識・記録・共同の儀礼は作業の調整を助ける一方、その技能を持つ人の権威にもつながりえます。'
  ]},
  G:{en:[
    'The Nile Valley is a narrow band of cultivable land running through much drier surroundings. The river connects southern districts to the Mediterranean coast and spreads into a broad delta in the north. Its water comes largely from rainfall far upstream, especially in the Ethiopian highlands, rather than from rain over the Egyptian valley itself. The desert limits the amount of nearby farmland but also makes the river a clear transport corridor. Look for the relationship between the long valley, the delta and neighbouring desert routes.',
    'Before modern dams changed its flow, the Nile rose seasonally and flooded areas beside the river. Flooding deposited sediment and supplied moisture for cultivation. The cycle was relatively regular, but the height and reach of a flood varied: a low flood could leave fields dry, and a high one could damage settlements. Farmers needed to judge when to plant and harvest and how to distribute water. Basin banks, channels and storage could improve access, yet all required maintenance and knowledge passed between seasons.',
    'Grain, livestock, papyrus and fish supported everyday life, while limestone, granite and other stone provided building materials. Gold and some other valuable materials came from routes extending beyond the main farming strip. The river’s northward current and commonly northerly winds could assist movement in different directions, although sailing still required skill and favourable conditions. A project using many workers needs food, fuel, tools and transport as well as stone. Think about how your team would organize these supplies and manage a harvest that is larger or smaller than expected. The valley makes communication possible across long distances. It does not decide who should govern, collect resources or control the work of others.'
  ],ja:[
    'ナイル川流域は、乾燥した土地を通る、細長い耕作可能な帯です。川は南の地域と地中海岸を結び、北では広いデルタに分かれます。水の多くは、エジプトの谷に降る雨ではなく、特にエチオピア高原など、遠い上流の雨から来ます。砂漠は近くの農地を限る一方、川を主要な輸送路にします。長い谷・デルタ・周囲の砂漠を通る道の関係に注目してください。',
    '現代のダムが流れを変える前、ナイル川は季節的に増水し、川辺の土地を浸していました。洪水は堆積物と水分を農地に供給しました。周期は比較的規則的でも、洪水の高さと広がりは毎年同じではありません。少なければ畑が乾き、多すぎれば集落が壊れることがあります。農民は作付け・収穫・配水の時期を判断する必要がありました。堤・水路・貯蔵は役立ちますが、維持作業と季節を越えて伝える知識が必要です。',
    '穀物・家畜・パピルス・魚は生活を支え、石灰岩や花崗岩などの石は建築に使えます。金などの資源には、主な農地の外へ延びる経路も関わります。北へ流れる川と、よく北から吹く風は、異なる方向への移動を助けますが、航行には技能と適した条件が必要です。多数の人を使う事業には、石だけでなく食料・燃料・道具・輸送が必要になります。供給と、予想より多い・少ない収穫をどう管理するか考えてください。川は長距離の連絡を可能にしますが、統治や徴収の方法までは決めません。'
  ]},
  H:{en:[
    'South-eastern Australia includes volcanic plains, wetlands, woodlands and a nearby coast. Around the starting area, old lava flows created a stony landscape in which water gathers in lakes, shallow depressions and connected channels. Rain and seasonal water levels change the habitats available to fish and other animals. This is not an empty landscape waiting to become useful: people can develop detailed knowledge of its soils, plants, waterways and seasonal movements. The map shows the wider region; smaller wetlands and constructed channels need a more local view.',
    'Food can come from aquatic resources, gathered plants, hunting and exchange with neighbouring communities. Managing these resources differs from growing wheat or keeping cattle. People may guide water, create holding areas, control when they harvest and protect places where food species reproduce. Such work depends on observing ecological cycles over time. A wetland rich in food during one season still requires plans for other seasons. Dry periods, unusually high water and excessive harvesting can change what is available. Knowledge and agreed practices are valuable resources in their own right.',
    'Volcanic stone can be used for structures, while plant fibres, wood and animal materials can supply tools, containers and shelters. The region does not offer the same large domesticated livestock as parts of Africa or Eurasia. Its food systems can still be complex. More than one form of settlement, mobility and cooperation is possible. Think about how your team would share access to wetlands, organise work and pass skills to the next generation. Connections between households and neighbouring peoples can support exchange without requiring a central kingdom. Choose developments for what they enable locally. Water management can produce aquatic food as well as irrigate grain fields in suitable places.'
  ],ja:[
    'オーストラリア南東部には、火山の平野・湿地・森林・近くの海岸があります。開始地点の周囲では、古い溶岩流が石の多い地形をつくり、湖・浅いくぼ地・つながる水路に水が集まります。雨と季節の水位が、魚やほかの動物の生息地を変えます。この土地は、人に利用されるのを待つ空白ではありません。土・植物・水路・季節の移動について、詳しい知識を育てることができます。地図は広域を示し、小さな湿地や人工の水路には、さらに詳しい地図が必要です。',
    '食料は、水辺の生物・植物の採集・狩猟・近隣との交換から得られます。その管理は小麦栽培や牛の飼育とは異なります。水を誘導し、生物をとどめる場所をつくり、採る時期を調整し、繁殖する場所を守ることもできます。これには長期の生態の観察が必要です。ある季節に豊かな湿地でも、ほかの季節への備えが必要になります。乾燥・高い水位・採りすぎは資源を変えるので、知識と共通の実践そのものが重要な資源になります。',
    '火山の石は構造物に、植物の繊維・木・動物の材料は道具・容器・住まいに使えます。アフリカやユーラシアの一部と同じ大型の家畜がいなくても、食料のしくみが単純になるわけではありません。定住・移動・協力には複数の形があります。湿地の利用・作業の分担・次の世代への技能の伝達をどう組織するか考えてください。家や近隣の人々のつながりは、中央の王国がなくても交換を支えます。水路は穀物畑の灌漑だけでなく、水産物の管理にも使えることに注目してください。'
  ]},
  I:{en:[
    'Mesoamerica contains high volcanic valleys, tropical lowlands, coastal plains and mountain corridors. The starting point in central Mexico lies far above sea level. Areas towards the Gulf and the southern lowlands can be much warmer and wetter. A climate chart for the highlands cannot describe the entire region. Rivers and lakes support local farming and movement, but there is no single long waterway connecting all communities. Travel between environments often involves crossing slopes or forested land, which makes the choice of routes important.',
    'Maize, beans and squash can form complementary parts of cultivation and diet. Rainfall, soil condition and planting seasons influence the harvest. Different places also offer fishing, gathered plants and other food sources. Without large domestic animals for pulling carts, people carry many loads themselves. This affects how far bulky materials can be transported and how much food travellers need. It does not prevent long-distance exchange, but it changes its organisation. Food production, carrying work and construction must be balanced within the same labour supply.',
    'Volcanic areas provide obsidian, whose sharp edges make useful cutting tools. Building stone comes from different geological settings; cacao grows in suitable tropical environments rather than everywhere in the highlands. Producing a valued object can connect several communities through access to raw material, skilled work and movement. A settlement may maintain diverse local livelihoods or become a specialist centre dependent on wider networks. Think about how your team would organise water, obtain resources from contrasting environments and support people whose main work is craft production. Shared calendars, exchange relationships and public gatherings may help coordinate these activities. The region allows several paths of development. Different societies need not use the same institutions even when they work with similar materials.'
  ],ja:[
    'メソアメリカには、高い火山の谷・熱帯低地・海岸平野・山を通る経路があります。メキシコ中央部の開始地点は標高が高く、メキシコ湾岸や南の低地は、より暑く雨の多い環境です。高地の気候図だけで地域全体を説明することはできません。川や湖は農業と地域の移動を支えますが、全ての共同体をつなぐ一本の長い川はありません。異なる環境へ行くには、斜面や森林を通ることが多く、経路の選択が重要です。',
    'トウモロコシ・豆・カボチャは、栽培と食生活の中で互いを補えます。雨・土・作付けの時期が収穫に影響します。場所によって漁業・植物の採集なども食料を供給します。荷車を引く大型の家畜がいないため、多くの荷物は人が運びます。そのため、重い材料を運べる距離と、旅に必要な食料を考える必要があります。長距離交易が不可能なのではなく、その組織の形が変わります。食料生産・運搬・建築は、同じ労力を分け合う仕事です。',
    '火山の地域には、鋭い刃になる黒曜石があります。建築用の石は地質によって異なり、カカオは熱帯の適した場所で育つため、高地のどこでも得られるわけではありません。材料・熟練した仕事・輸送が複数の共同体を結びます。集落は多様な生業を組み合わせることも、広いネットワークに頼る専門の中心になることもできます。水の管理・異なる環境の資源・職人の食料をどう確保するか考えてください。共通の暦・交換関係・集まりは作業を助けますが、同じ材料から同じ制度が生まれるとは限りません。'
  ]},
  J:{en:[
    'The Pacific coast of Peru lies beside the high Andes, creating sharp environmental differences over relatively short distances. The coast is extremely dry, but rivers descending from the mountains create cultivable valleys. Offshore, cold, nutrient-rich water supports abundant marine life. Inland, slopes rise through different temperature zones towards high plateaux and snowy peaks. The map brings these environments together; the coastal climate chart describes only one of them. A community’s access to a river mouth, an irrigable valley or high pasture changes the resources it can use.',
    'Coastal fields depend on water arriving from upstream rather than dependable local rain. In the mountains, rainfall, frost and steep slopes affect cultivation, and different crops suit different elevations. Potatoes thrive in many highland settings, while llamas and alpacas supply transport, fibre and food. Llamas carry packs but do not perform the same work as oxen pulling heavy carts. Fishing and farming can complement one another through exchange. A drought upstream or changes in ocean conditions can therefore affect communities whose immediate surroundings appear very different.',
    'Terraces, canals, paths and storage facilities can make these environments more usable, but each requires appropriate design and repeated care. Steep terrain increases the work of transport; earthquakes and intense rain can damage structures. Connections between coastal and highland communities may supply goods unavailable locally, such as cotton, fish, wool or potatoes. People can organise those connections through household exchange, agreements between communities or larger authorities. Consider how your team would move and store food, maintain important routes and distribute work across seasons. A large coordinated network is one possible strategy, while smaller arrangements might provide flexibility. The presence of difficult mountains does not itself decide which organisation people will choose or whose interests it will serve.'
  ],ja:[
    'ペルーの太平洋岸は高いアンデスに接し、比較的短い距離で環境が大きく変わります。海岸は非常に乾燥していますが、山から下る川が耕作できる谷をつくります。沖合の冷たく栄養の多い水は豊かな海の生物を支えます。内陸では、斜面が異なる気温の帯を通って、高原や雪の峰へ上がります。地図はこれらを合わせて示しますが、海岸の気候図はその一つだけを表します。河口・灌漑できる谷・高地の牧草へのアクセスが、利用できる資源を変えます。',
    '海岸の畑は、地域の雨ではなく上流から届く水に頼ります。山では雨・霜・急な斜面が農業を左右し、標高によって適した作物が異なります。ジャガイモは多くの高地に適し、リャマとアルパカは輸送・繊維・食料を供給します。リャマは荷物を背負いますが、重い荷車を引く牛と同じ働きはしません。交換によって、漁業と農業は互いを補えます。上流の干ばつや海の変化が、見かけの異なる環境の共同体にも影響する可能性があります。',
    '段々畑・水路・道・貯蔵施設は土地を利用しやすくしますが、設計と繰り返す手入れが必要です。急な地形は輸送の労力を増やし、地震や大雨は構造物を壊すことがあります。海岸と高地のつながりは、綿・魚・毛・ジャガイモなど、地元にない産物を供給します。家の交換・共同体の合意・広い権威など、複数の方法で組織できます。食料を運び貯める方法、道の維持、季節ごとの仕事を考えてください。大きなネットワークと小規模な協力には異なる利点があり、山だけで組織の形が決まるわけではありません。'
  ]},
  K:{en:[
    'Greenland is dominated by an ice sheet, but its coasts include fjords, islands and areas of exposed land. The activity begins near the sheltered fjords of the south-west, where summer grass can grow. Conditions here differ from the far north and the open outer coast. Distances are large, and steep land and water separate possible settlement sites. The sea can act as a route as well as a barrier, depending on weather, ice and the equipment people use. Read the regional map before treating the whole island as one uniform environment.',
    'The growing season is short and summers remain cool. Keeping cattle, sheep or goats requires enough fodder to carry them through long winters. Gathering hay competes with other seasonal work, and an unexpectedly cold or dry summer can reduce the amount stored. Marine animals and fish provide different possibilities, but hunting depends on knowledge of their movements, safe transport and suitable tools. Food preservation and storage can bridge periods when fresh supplies are uncertain. A community concentrating on herding will therefore organise time and resources differently from one concentrating on marine hunting.',
    'Large timber is scarce. Driftwood, locally available shrubs, stone, turf, bone and skins can be used in different combinations, while exchange can provide imported materials. Long-distance connections require boats and partners willing to make the journey. A valuable export such as ivory can help obtain supplies but also tie a settlement to distant demand. Decide which needs your team can meet locally and which depend on others. Consider winter food, transport, shelters and the sharing of knowledge. More than one way of living is possible along this coast. Survival depends on combining ecological experience, technology, cooperation and connections. Communities can combine farming and hunting in different ways.'
  ],ja:[
    'グリーンランドの大部分は氷床ですが、海岸にはフィヨルド・島・氷に覆われない土地があります。活動は、夏に草が育つ南西部の穏やかなフィヨルド付近から始まります。ここは極北や外海に面した海岸とは条件が異なります。距離が大きく、急な地形と水が集落に適した場所を分けます。海は経路にも障害にもなり、天候・氷・使う装備によって変わります。島全体を一つの環境と考える前に、地域の地図を読んでください。',
    '植物の成長期は短く、夏もすずしい気候です。牛・羊・ヤギを飼うには、長い冬を越える飼料が必要です。干し草づくりはほかの季節の仕事と競合し、予想より寒い・乾いた夏には備蓄が減ります。海獣や魚も資源になりますが、狩猟には生物の移動の知識・安全な輸送・適した道具が必要です。保存と貯蔵は、新しい食料が得られない時期を支えます。そのため、牧畜を重視する共同体と海の狩猟を重視する共同体では、時間と資源の組織が異なります。',
    '大きな木材は少ない土地です。流木・低木・石・芝土・骨・皮を組み合わせて使い、交易で材料を補うこともできます。遠距離のつながりには船と、旅を引き受ける相手が必要です。牙などの輸出品は物資を得る助けになりますが、遠くの需要に集落を結びつけます。何を地元で満たし、何を外に頼るか決めてください。冬の食料・輸送・住まい・知識の共有を考えましょう。この海岸には複数の生活方法があり、生態の経験・技術・協力・つながりの組み合わせが重要です。'
  ]}
};
for (const [point,context] of Object.entries(regionalContexts)) regions[point].context = context;

const mapReferences = {
  A:{bounds:[25,-24,36,-14],labels:[[-16,28,'Zambezi River','ザンベジ川','water'],[-22,31,'Limpopo River','リンポポ川','water'],[-19.2,30,'Zimbabwe Plateau','ジンバブエ高原','area'],[-20,35,'Indian Ocean','インド洋','water']]},
  B:{bounds:[20,32,30,41],labels:[[37.8,23.7,'Greek mainland','ギリシア本土','area'],[35.2,24.6,'Crete','クレタ島','area'],[37,26,'Aegean Sea','エーゲ海','water'],[39,29,'Western Anatolia','アナトリア西部','area']]},
  C:{bounds:[35,27,50,38],labels:[[33.6,44.2,'Tigris River','チグリス川','water'],[31.7,42.8,'Euphrates River','ユーフラテス川','water'],[35.5,47,'Zagros Mountains','ザグロス山脈','mountain'],[28.5,49,'Persian Gulf','ペルシア湾','water'],[30.5,47,'Southern marshes','南部の湿地','area']]},
  D:{bounds:[61,20,80,36],labels:[[29,69,'Indus River','インダス川','water'],[24,67,'Arabian Sea','アラビア海','water'],[34,76,'Himalaya','ヒマラヤ','mountain'],[26,73,'Thar Desert','タール砂漠','area'],[31.5,73.5,'Punjab plains','パンジャーブ平野','area']]},
  E:{bounds:[100,8,110,18],labels:[[14.7,106,'Mekong River','メコン川','water'],[12.9,104,'Tonle Sap','トンレサップ湖','water'],[10,106.5,'Mekong delta','メコン・デルタ','area'],[11.6,102.5,'Cardamom Mountains','カルダモン山脈','mountain']]},
  F:{bounds:[105,30,122,41],labels:[[35.5,110.5,'Yellow River','黄河','water'],[37.5,107.7,'Loess Plateau','黄土高原','area'],[35.8,116.5,'North China Plain','華北平原','area'],[37.8,119.5,'Bohai Sea','渤海','water'],[34,108,'Qinling Mountains','秦嶺山脈','mountain']]},
  G:{bounds:[27,20,37,33],labels:[[26.6,31.8,'Nile River','ナイル川','water'],[31,31,'Nile delta','ナイル・デルタ','area'],[31.9,30,'Mediterranean Sea','地中海','water'],[25,28.8,'Western Desert','西部砂漠','area'],[25.2,35.7,'Red Sea','紅海','water']]},
  H:{bounds:[139,-40,147,-34],labels:[[-38,142,'Volcanic plains','火山の平野','area'],[-37,145,'Great Dividing Range','グレートディバイディング山脈','mountain'],[-39,143.5,'Southern Ocean','南極海','water'],[-38.2,141.7,'Wetlands and lakes','湿地と湖','water']]},
  I:{bounds:[-104,13,-86,24],labels:[[19.5,-99,'Central highlands','中央高地','area'],[21,-91.5,'Yucatán Peninsula','ユカタン半島','area'],[22,-94,'Gulf of Mexico','メキシコ湾','water'],[14.5,-100,'Pacific Ocean','太平洋','water'],[15.5,-90.5,'Southern highlands','南部高地','mountain']]},
  J:{bounds:[-82,-19,-68,-3],labels:[[-10,-75,'Andes','アンデス山脈','mountain'],[-11,-80,'Pacific Ocean','太平洋','water'],[-13,-76.5,'Coastal desert','海岸砂漠','area'],[-16,-69.5,'Lake Titicaca','チチカカ湖','water'],[-5,-71,'Eastern lowlands','東の低地','area']]},
  K:{bounds:[-58,58,-35,69],labels:[[65,-43,'Greenland ice sheet','グリーンランド氷床','area'],[62,-55,'Labrador Sea','ラブラドル海','water'],[60.5,-36.5,'North Atlantic','北大西洋','water'],[64.2,-51.7,'Western fjords','西部のフィヨルド','area'],[61.7,-46,'Southern fjords','南部のフィヨルド','area']]}
};
for (const [point,map] of Object.entries(mapReferences)) {
  regions[point].mapKey=point;
  regions[point].mapBounds=map.bounds;
  regions[point].mapLabels=map.labels.map(([lat,lon,en,ja,kind])=>({lat,lon,label:{en,ja},kind}));
}

// Each reading paragraph carries the indices of the sources supporting it.
// Sources are historical evidence, not explanations of a team's game outcome.
const historicalReadings = {
  A:{sources:[
    ['UNESCO: Great Zimbabwe','ユネスコ：グレート・ジンバブエ','https://whc.unesco.org/en/list/364/'],
    ['Michell House, University of Cape Town: cattle supply research (2020)','ケープタウン大学、ミシェル・ハウス：牛の供給の研究（2020年）','https://open.uct.ac.za/handle/11427/32684'],
    ['British Museum: East African exports and imported coins','大英博物館：東アフリカの輸出品と輸入貨幣','https://www.britishmuseum.org/sites/default/files/2021-05/Money_Gallery_LPG_2020_Room_68.pdf'],
    ['University of Cape Town: research on Great Zimbabwe settlement and population (2017)','ケープタウン大学：集落と人口の研究（2017年）','https://science.uct.ac.za/articles/2017-06-15-lessons-sustainability-ancient-society-great-zimbabwe']
  ],reading:[
    ['Great Zimbabwe was a major Shona settlement and political centre in southern Africa. Its best-known monumental building phases date approximately to 1100–1450 CE, although occupation and connections with the place extend beyond those dates. The site includes the Hill Complex, the Great Enclosure and settlements in the surrounding valley. These were not all built at once. Their arrangement records a long history of construction and use, with places for residence, gathering and ritual. The name Zimbabwe is associated with houses of stone in the Shona language. The site remains an important part of Zimbabwean cultural heritage.',
     'グレート・ジンバブエは、アフリカ南部のショナの大きな集落・政治の中心でした。有名な石造建築の主な時期は、およそ1100〜1450年ですが、居住と土地との関係はその前後にも続きます。丘の複合施設・大囲壁・谷の集落があり、全てが同時に造られたわけではありません。配置は、住居・集まり・儀礼の場所を含む、長い建設と利用の歴史を示します。名称はショナ語の「石の家」と関係し、現在もジンバブエの文化遺産の重要な一部です。',[0]],
    ['Builders fitted granite blocks into walls without mortar. The Great Enclosure contains carefully laid courses of stone, decorated sections and a tall conical tower. Excavations also document houses made with earth-based materials inside and around the stone enclosures. This combination matters: the surviving stone monuments were part of a lived settlement, rather than the entire city. Soapstone bird sculptures are associated with the site’s ceremonial life. UNESCO also notes potsherds and ironware, evidence of farming, herding and craft production by an Iron Age Shona population. Walls, passageways, household spaces and objects provide different kinds of evidence about daily activity and authority. The precise uses of particular structures remain matters of archaeological interpretation.',
     '建築者は、モルタルを使わず花崗岩の石を組み合わせました。大囲壁には整然と積んだ石・装飾・高い円錐の塔があります。発掘では、囲壁の中や周囲に土を使った家も確認されています。残る石の建築は、生活する集落の一部でした。ソープストーンの鳥の像は、儀礼と関係します。ユネスコは、土器の破片と鉄器も記しており、鉄器時代のショナの人々の農業・牧畜・手工業を示します。壁・通路・住居・品物は、日常の活動と権威について異なる証拠を与えます。ただし、個々の構造の正確な用途には、考古学上の解釈が関わります。',[0]],
    ['Cattle were important to food production, wealth and social relationships. Researchers have investigated how animals reached the settlement by measuring chemical signatures in archaeological cattle teeth. A University of Cape Town doctoral study found that some animals had grown up near the site. Many came from lower-lying areas farther south. This evidence points to connections between different grazing environments rather than a herd confined to the city itself. Food supply therefore involved people and places outside the monumental centre. The study adds a concrete method for examining movement: the landscape leaves measurable traces in the animals people raised.',
     '牛は食料・財産・社会関係に重要でした。研究者は、発掘された牛の歯の化学的な特徴を測り、集落へ来るまでの移動を調べています。ケープタウン大学の博士研究では、近くで育った牛も、さらに南の低地で育った牛も確認されました。これは、都市だけで飼う群れではなく、異なる放牧環境を結ぶ関係を示します。食料の供給には、石造の中心の外にいる人と土地も関わりました。動物に残る測定可能な特徴から、その移動を調べられます。',[1]],
    ['In the fourteenth century, Great Zimbabwe was the principal city of a state extending over gold-rich plateaux. Gold connected the inland region with Indian Ocean commerce. Traders on the East African coast, including those at Kilwa, obtained gold from the Zimbabwe region, alongside other exports such as ivory. Imported beads, ceramics and coins document chains of exchange linking southern Africa to much wider networks. These finds do not mean every trader travelled from Zimbabwe to China or India in one journey: goods could pass through several intermediaries. The British Museum’s East African trade displays place Zimbabwean gold beside imported coins and coastal objects. These show how inland production and port-based exchange formed connected parts of commerce.',
     '14世紀のグレート・ジンバブエは、金の豊かな高原に広がる国家の中心都市でした。金は内陸とインド洋の交易を結びました。キルワなど東アフリカ沿岸の商人は、ジンバブエ地域の金や象牙などを得ていました。輸入されたビーズ・陶磁器・貨幣は、南部アフリカと広いネットワークのつながりを示します。ただし、品物は仲介者を経由できるため、全ての商人が中国やインドまで一度に旅したという意味ではありません。大英博物館の展示は、金・輸入貨幣・海岸の品物を合わせ、内陸の生産と港の交易の関係を示しています。',[0,2]],
    ['The history of the settlement is still being revised. Older accounts often described a very large population exhausting nearby land and abandoning the city. Research reported by the University of Cape Town in 2017 used household and settlement evidence to argue for a smaller population. It questioned a simple environmental-collapse account. Its authors also argued that occupation did not cease completely when political importance changed. This is a disagreement about evidence and interpretation, rather than a settled story of one drought destroying a city. Great Zimbabwe’s history includes households, regional food supply, changing centres of power and international connections across several centuries.',
     '集落の歴史の説明は、現在も見直されています。古い説明には、大人口が周囲の土地を使い尽くし、都市を放棄したというものがあります。ケープタウン大学が2017年に紹介した研究は、家と集落の証拠から、より少ない人口を推定し、単純な環境崩壊の説明を疑問視しました。政治的重要性が変化しても、居住が完全に終わったわけではないとも論じています。一度の干ばつで都市が消えたという確定した物語ではありません。家の暮らし・食料供給・権力の中心の変化・国際的な関係を含む長い歴史です。',[3]]
  ]},
  B:{sources:[
    ['UNESCO: Minoan Palatial Centres','ユネスコ：ミノア文明の宮殿の中心','https://whc.unesco.org/en/list/1733/'],
    ['The Metropolitan Museum: Ancient Greek Colonization and Trade','メトロポリタン美術館：古代ギリシアの植民と交易','https://www.metmuseum.org/essays/ancient-greek-colonization-and-trade-and-their-influence-on-greek-art'],
    ['The Metropolitan Museum: Greek Art, Prehistoric to Classical','メトロポリタン美術館：先史時代から古典期のギリシア美術','https://resources.metmuseum.org/resources/metpublications/pdf/Greek_Art_From_Prehistoric_to_Classical.pdf'],
    ['The Metropolitan Museum: Athenian Vase Painting','メトロポリタン美術館：アテネの壺絵','https://www.metmuseum.org/essays/athenian-vase-painting-black-and-red-figure-techniques']
  ],reading:[
    ['Bronze Age Crete and the later Greek city-states belong to different periods. On Crete, communities conventionally called Minoan developed large palatial centres, including Knossos, Phaistos and Malia. The six centres recognised by UNESCO represent building and use between about 1900 and 1100 BCE within a longer history. Their courtyards, rooms, workshops and storage facilities combined administrative, economic and religious activities. Calling them palaces does not mean their organisation was identical to a modern royal residence. Archaeologists study their layouts, objects and rebuilding phases to understand how goods and people moved through these important centres.',
     '青銅器時代のクレタ島と、後のギリシア都市国家は、異なる時代の例です。ミノアと呼ばれる社会は、クノッソス・ファイストス・マリアなどに大きな宮殿の中心を築きました。ユネスコの六遺跡は、長い歴史の中で、およそ紀元前1900〜1100年の建設と利用を示します。中庭・部屋・工房・貯蔵施設は、行政・経済・宗教の活動を結びました。「宮殿」は現代の王の住宅と同じ組織を意味しません。配置・品物・再建の段階から、人と物の動きを研究します。',[0]],
    ['Crete participated in maritime exchanges with other Mediterranean societies, including Egypt and communities on the Greek mainland. Early writing systems are preserved in the palatial centres: Cretan Hieroglyphic, Linear A and, in a later phase, Linear B. Their presence records administrative practices, but the scripts and languages are not interchangeable. Hydraulic installations and carefully organised storage show that technical knowledge was embedded in buildings and routines. Painted walls and ritual objects add evidence of cultural life. The island’s central location made connections possible, while the archaeological material documents how people actually developed and used those connections.',
     'クレタ島は、エジプトやギリシア本土を含む地中海の社会と海で交流しました。宮殿の中心には、クレタ象形文字・線文字A・後の段階の線文字Bが残ります。行政の実践を示しますが、文字体系と言語は同じではありません。水の設備と貯蔵の配置は、技術知識が建物と日常の仕事に組み込まれていたことを示します。壁画と儀礼の品物も文化の証拠です。島の位置が可能にした交流を、人々が実際にどう利用したかを考古資料から調べられます。',[0]],
    ['Much later, during the first millennium BCE, Greek-speaking communities formed numerous city-states. From approximately the eighth century BCE, settlers established new communities around the Mediterranean and Black Sea. These were not simply branches of one united Greek country. Seafaring connected different cities, and the Greek alphabet developed through contact with Phoenician writing. The Metropolitan Museum documents how travelling craftspeople and imported objects influenced techniques such as jewellery making and metalworking. Maritime movement carried skills and styles as well as goods. Cities could exchange products and ideas while keeping different political institutions and pursuing competing interests.',
     'ずっと後の紀元前一千年紀には、ギリシア語を使う共同体が多数の都市国家をつくりました。紀元前8世紀ごろから、地中海と黒海の周囲に新しい集落が成立します。一つの統一国の支部ではありません。航海が都市を結び、フェニキアの文字との接触からギリシアのアルファベットが発達しました。移動する職人や輸入品は、宝飾や金属加工の技術に影響しました。船は商品だけでなく技能と様式も運びました。都市は異なる政治制度と利害を持ちながら交流できました。',[1]],
    ['In fifth-century BCE Athens, male citizens participated in assemblies, courts and other public institutions. Women, enslaved people and resident foreigners did not hold the same political rights. Athens also led an alliance that developed into an empire, so participation within the city coexisted with domination over others. Drama, historical writing and arguments about government flourished in this setting. These practices belonged to particular communities with defined rights and obligations; they were not an automatic result of living beside the sea. The surviving buildings, texts and artworks help reconstruct both public institutions and the unequal society in which they operated.',
     '紀元前5世紀のアテネでは、男性市民が集会・法廷などに参加しました。女性・奴隷とされた人・居住する外国人には同じ政治的権利がありませんでした。アテネが率いた同盟は帝国化したため、都市内の参加と他都市への支配が共存しました。演劇・歴史の記述・統治についての議論は、この環境で発達しました。海辺に住むだけで自動的に生まれたのではなく、特定の権利と義務を持つ社会の実践です。建築・文書・美術品から、制度と社会の不平等を調べられます。',[2]],
    ['Athenian pottery provides another detailed example of specialist production. Black-figure and red-figure painters decorated vessels used for drinking, storage and other purposes. Potters and painters depended on prepared clay, shaping skills and carefully controlled firing. Changes in the firing atmosphere produced the characteristic dark and red surfaces, rather than simply applying modern black paint. Many vessels circulated beyond Athens, so their distribution helps trace exchange alongside artistic preferences. A painted pot is evidence of several connected activities: obtaining material, skilled production, use and movement. It also shows that technologies with a familiar name can involve substantial and distinctive knowledge.',
     'アテネの陶器は、専門的な生産の具体例です。黒像式・赤像式の画家は、飲用・貯蔵などに使う器を装飾しました。粘土の準備・成形・焼成の調整が必要です。黒と赤の表面は、現代の黒い絵具を塗るだけではなく、焼く時の空気の条件を変えて生み出されました。器はアテネの外にも運ばれ、その分布は交易と美術の好みの証拠になります。一つの壺には、材料の調達・熟練した生産・使用・移動がつながっています。',[3]]
  ]},
  C:{sources:[
    ['The Metropolitan Museum: The Origins of Writing','メトロポリタン美術館：文字の起源','https://www.metmuseum.org/essays/the-origins-of-writing'],
    ['Topoi research: Water Management in Third-Millennium Mesopotamia','トポイ研究：紀元前三千年紀のメソポタミアの水管理','https://www.topoi.org/project/a-3-6/'],
    ['The Metropolitan Museum: tablet recording copper-knife distribution','メトロポリタン美術館：銅のナイフの配分を記す粘土板','https://www.metmuseum.org/art/collection/search/325500'],
    ['The Metropolitan Museum: The Akkadian Period','メトロポリタン美術館：アッカド時代','https://www.metmuseum.org/essays/the-akkadian-period-ca-2350-2150-b-c'],
    ['Penn Museum: Samuel Noah Kramer on the Ur-Nammu law code (1953)','ペン博物館：サミュエル・ノア・クレイマーによるウル・ナンム法典（1953年）','https://www.penn.museum/documents/publications/bulletin/17-2/law_love_hymn_prayer_word.pdf'],
    ['Penn Museum: C. Leonard Woolley, The Royal Tombs of Ur of the Chaldees (1928)','ペン博物館：レナード・ウーリー「ウルの王墓」（1928年）','https://www.penn.museum/sites/journal/9049/']
  ],reading:[
    ['Cities grew in southern Mesopotamia during the fourth millennium BCE. Uruk became a particularly large urban centre, surrounded by smaller settlements and agricultural land. Its major buildings and early clay records belong to a period often called the Uruk period. Sumer was a region containing several cities, not one state that remained unified throughout its history. Different cities had their own rulers and important temples. Archaeological evidence shows specialised work and large institutions alongside farming households. The concentration of people and activities brought together food production, construction, administration and exchange within a closely connected landscape.',
     '紀元前四千年紀、メソポタミア南部で都市が成長しました。ウルクは特に大きな中心となり、周囲に小さな集落と農地がありました。主要な建築と初期の粘土の記録は、ウルク期と呼ばれる時代に属します。シュメールは複数の都市を含む地域であり、歴史を通じて一つの統一国だったわけではありません。都市ごとに王や重要な神殿がありました。考古資料は、農家とともに専門の仕事と大きな組織が存在したことを示します。食料・建設・行政・交易が密接につながりました。',[0]],
    ['Artificial watering supported cultivation where rainfall alone was insufficient. Texts from Lagash in the later third millennium BCE describe a network of main canals, smaller channels, regulators and field embankments. Water passed through several levels before reaching cultivated land. Royal inscriptions refer especially to major construction, while temple administrative records document work around fields and smaller structures. This distinction gives historians evidence of different responsibilities within the same water system. It also shows that irrigation was a continuing activity involving water distribution and repairs. Digging a canal began this continuing work.',
     '雨だけでは足りない土地では、人工の配水が耕作を支えました。紀元前三千年紀後半のラガシュの文書は、主要な運河・小水路・水量を調整する設備・畑の堤を記しています。水は複数の段階を通って農地に届きました。王の碑文は主に大工事を、神殿の行政記録は畑と小規模な構造の作業を伝えます。同じ水系の中の異なる責任を示す証拠です。灌漑は、最初に水路を掘って終わる事業ではなく、配水と修理を続ける活動でした。',[1]],
    ['Lagash’s records also describe who supplied labour. Rulers could mobilise people through temple organisations for large canal projects. Some dependants who held agricultural land owed work on irrigation, making service a form of labour obligation connected to access to resources. Temples managed their own fields, dikes and distributors. These arrangements linked food production to political and religious institutions in a specific time and place. They were not identical across all Mesopotamian history. The texts allow historians to examine the practical work of managing a river landscape together with the authority to demand that work.',
     'ラガシュの記録は、労働を供給する人も伝えます。王は神殿の組織を通して、大きな運河の工事に人を動員できました。農地を持つ一部の従属者は灌漑の仕事を負い、資源へのアクセスと労働の義務が結びついていました。神殿は自分の畑・堤・配水設備も管理しました。特定の時代と場所で、食料生産・政治・宗教がつながったしくみです。メソポタミアの全歴史で同じだったわけではありません。文書から、実際の管理作業と労働を要求する権威を調べられます。',[1]],
    ['Writing developed around 3300 BCE as part of changing administrative practices. Early tablets recorded quantities and transactions; over time signs became the wedge-shaped script called cuneiform. A tablet excavated at Nippur, now in the Metropolitan Museum, records quantities of copper knives issued to named individuals. It dates to approximately 2600–2350 BCE and was found in a temple setting. This small object connects an imported or processed material with tools, named recipients and record keeping. Clay was therefore not only a building and pottery resource: it also became a durable medium for managing information about people and goods. Royal graves at Ur from the same broad period held a chariot harnessed to two asses. One grave also held a gaming board with pieces and dice.',
     '文字は紀元前3300年ごろ、行政の実践の変化の一部として発達しました。初期の粘土板は数量と取引を記し、後にくさび形の楔形文字になりました。ニップルの神殿で発掘され、現在メトロポリタン美術館にある粘土板は、名前のある人々に配った銅のナイフの数を記します。およそ紀元前2600〜2350年の資料です。材料・道具・受け取る人・記録が一つの小さな物でつながります。粘土は建築や器だけでなく、人と物の情報を管理する媒体でもありました。同じころのウルの王墓には、2頭のロバをつないだ車と、駒とさいころのそろった盤上遊戯の盤が納められていました。',[2,5]],
    ['Political organisation also changed. In the later third millennium BCE, rulers of Akkad brought several Mesopotamian cities and wider territories under an expanding monarchy. This period is associated with royal images and inscriptions asserting power beyond a single city. It followed earlier urban developments rather than beginning them. Later, Ur-Nammu, founder of the Third Dynasty of Ur, issued a law code. Samuel Kramer identified a copy from Nippur as the oldest law code then known. Local farming, craft production and temple institutions continued within changing political arrangements. Cuneiform later served many languages and purposes, including literature, law and scholarship. The regional history thus includes cities, changing states and increasingly varied uses of technical knowledge. The same rivers supported societies with different relationships of authority over time.',
     '政治の組織も変化しました。紀元前三千年紀後半、アッカドの王は複数の都市と広い領域を、拡大する王権の下に置きました。王の像や碑文は、一都市を超える権力を主張します。これは初期の都市の後の展開であり、都市を初めて生み出したわけではありません。その後、ウル第三王朝を開いたウル・ナンムは法典を定めました。サミュエル・クレイマーは、ニップル出土の写本を当時知られた最古の法典と確認しています。農業・手工業・神殿は政治の変化の中でも続きました。楔形文字は、後に多くの言語と、文学・法律・学問にも使われます。同じ川でも、時代によって権威の関係は異なりました。',[3,4]]
  ]},
  D:{sources:[
    ['Harappa Archaeological Research Project scholars: introduction to the Indus civilisation','ハラッパー考古学研究者：インダス文明の紹介','https://www.harappa.com/content/brief-introduction-ancient-indus-civilization'],
    ['UNESCO: Archaeological Ruins at Moenjodaro','ユネスコ：モヘンジョ・ダロの遺跡','https://whc.unesco.org/en/list/138/'],
    ['Jonathan Mark Kenoyer: Uncovering the Keys to the Lost Indus Cities','ジョナサン・マーク・ケノイヤー：インダス都市の社会的権力','https://www.harappa.com/content/uncovering-keys-lost-indus-cities'],
    ['UNESCO: Dholavira, a Harappan City','ユネスコ：ハラッパーの都市ドーラビーラ','https://whc.unesco.org/en/list/1645/'],
    ['Jonathan Mark Kenoyer: Wheeled Vehicles of the Indus Valley Civilization','ジョナサン・マーク・ケノイヤー：インダス文明の車両','https://www.harappa.com/content/wheeled-vehicles-indus-valley-civilization']
  ],reading:[
    ['The Indus, or Harappan, urban civilisation flourished approximately between 2600 and 1900 BCE across parts of present-day Pakistan and north-west India. Harappa and Mohenjo-daro were major cities, but the wider region also contained many smaller settlements with different environments and activities. Harappa’s settlement history began before the mature urban period. Its buildings record change over time, rather than a city created in a single moment. Archaeologists identify widespread connections through recurring objects, building practices and measures. These similarities suggest shared knowledge and interaction across a large region. They do not establish that every settlement was organised in exactly the same way.',
     'インダス文明（ハラッパー文明）の都市は、およそ紀元前2600〜1900年、現在のパキスタンとインド北西部に広がりました。ハラッパーとモヘンジョ・ダロは大都市ですが、異なる環境と仕事を持つ小集落も多数ありました。ハラッパーの居住は成熟した都市期より前に始まり、建物は時間をかけた変化を示します。共通する品物・建築・尺度から、広い交流を確認できます。ただし、全ての集落が同一の方法で組織されていたという証明ではありません。',[0]],
    ['At Mohenjo-daro, streets intersected in planned patterns, and buildings used large numbers of baked bricks. Wells, bathing areas and drains demonstrate sustained attention to water and sanitation. The Great Bath is one especially striking structure, but its precise social and ritual uses remain open to interpretation. Houses and neighbourhood facilities provide evidence alongside monumental buildings. Maintaining such a city involved the repeated work of residents, builders and people handling water and waste. The surviving layout lets researchers trace practical relationships between domestic spaces and shared infrastructure. The identities of the people directing particular projects can remain unknown.',
     'モヘンジョ・ダロでは、道が計画的に交差し、多くの焼いたれんがが建築に使われました。井戸・沐浴の場所・排水は、水と衛生への継続的な取り組みを示します。大浴場は特に目立ちますが、社会的・儀礼的な用途には解釈が必要です。大建築だけでなく家と近隣の設備も証拠になります。都市の維持には、住民・建築者・水や廃棄物を扱う人の繰り返す仕事が関わりました。指揮した人物が分からなくても、住居と共同設備の関係を調べられます。',[1]],
    ['Specialists produced stone beads, ceramics, metal objects and seals. Preparing valued materials required detailed techniques rather than simply collecting a finished resource. Standardised weights and widely shared craft traditions helped connect producers and users. Kenoyer’s work examines how skill, access to materials and the circulation of objects could be related to social power. Objects bearing short inscriptions are evidence of writing or symbol use, but the Indus script remains undeciphered. Researchers therefore compare where objects were made, used and discarded. Readable royal histories are unavailable to explain who controlled production or exchange.',
     '専門家は石のビーズ・陶器・金属の品物・印章を作りました。価値ある材料の加工には詳しい技術が必要です。共通の分銅と手工業の伝統は、作り手と利用者を結びました。ケノイヤーの研究は、技能・材料へのアクセス・品物の流通と社会的権力の関係を調べます。短い銘文のある物は文字や記号の証拠ですが、インダス文字は未解読です。そのため研究者は、読める王の歴史だけに頼らず、生産・使用・廃棄された場所を比べて権力を探ります。',[2]],
    ['Indus communities also participated in long-distance exchange. Objects made in the Indus region have been recovered in Mesopotamia. Its texts refer to Meluhha, commonly connected by scholars with the Indus world. They describe trade with seafaring peoples of Magan and Meluhha, sometimes involving tons of copper. Regional routes linked inland cities, uplands and the coast, bringing together materials from different environments. Terracotta models of carts with solid wheels became much more common in the Harappan period. Kenoyer argues that these bullock carts were a local development. A shared material culture can therefore reflect both local production and wider relationships. It does not require imagining a single journey carrying every object directly from its source to its final destination.',
     'インダスの共同体は長距離交易にも参加しました。インダスで作った物はメソポタミアでも見つかり、そこの文書にあるメルッハという地名は、研究者によってインダス世界と結びつけられています。文書は、マガンとメルッハの航海する人々との交易を記し、時には何トンもの銅が取引されました。地域の経路は内陸の都市・高地・海岸を結び、異なる環境の材料を集めました。車輪の付いた土製の車の模型はハラッパー期に大きく増え、ケノイヤーはこの牛車を地域で発達した技術と論じます。共通の物質文化は、地域の生産と広い関係の両方を反映できます。全ての物が産地から目的地へ直接運ばれたと考える必要はありません。',[0,4]],
    ['Dholavira, in the drier environment of Kutch, offers a further example of local adaptation. Its planned settlement included elaborate water collection and storage, distinct urban areas and fortifications. Builders made extensive use of stone. The existence of several forms of water management within the Indus region is important: a well, a drain and a reservoir solve different problems. Archaeological layouts demonstrate coordination, but coordination alone does not identify a king or prove one central government ruled all cities. Historians reconstruct this society through material evidence. Questions about political authority and religious beliefs must be distinguished from what the buildings directly establish.',
     '乾燥したカッチ地方のドーラビーラは、地域に合わせた工夫の別の例です。計画された都市には、集水と貯水の設備・異なる区画・防御施設があり、建材として石が広く使われました。井戸・排水・貯水池は別の問題に対応するため、水管理を一つとみなすことはできません。都市の配置は協力の調整を示しますが、それだけで王の存在や全都市を支配する中央政府を証明しません。建物が直接示す事実と、政治的権威や信仰についての問いを区別して、物的な証拠から社会を復元します。',[2,3]]
  ]},
  E:{sources:[
    ['UNESCO: Angkor','ユネスコ：アンコール','https://whc.unesco.org/en/list/668/'],
    ['Fletcher and colleagues: The Water Management Network of Angkor','フレッチャーら：アンコールの水管理ネットワーク','https://www.cambridge.org/core/journals/antiquity/article/abs/water-management-network-of-angkor-cambodia/EC4E312C23A724E6B629B4A252FF15D9'],
    ['University of Sydney: climate stress and infrastructure research (2018)','シドニー大学：気候の圧力と設備の研究（2018年）','https://www.sydney.edu.au/news-opinion/news/2018/10/18/climate-stress-will-make-cities-more-vulnerable--new-angkor-rese.html'],
    ['French School of Asian Studies (EFEO): Corpus of Khmer Inscriptions','フランス極東学院：クメール碑文集成','https://cik.efeo.fr/']
  ],reading:[
    ['Angkor was the centre of successive Khmer capitals in present-day Cambodia between the ninth and fifteenth centuries CE. UNESCO describes a Khmer Empire that, from the ninth to the fourteenth centuries, encompassed much of South-east Asia. Angkor was not just a single temple or one city plan. The landscape contains temples, residential areas, routes and water-management structures constructed and modified over many generations. Angkor Wat and the Bayon are especially well-known monuments, but a much larger inhabited landscape surrounded them. UNESCO’s account identifies both hydraulic structures and communication routes as important parts of the site. Agriculture and settlement were therefore connected to the monumental centres, rather than taking place in a separate world outside their history.',
     'アンコールは、9〜15世紀、現在のカンボジアで続いたクメールの都の中心でした。ユネスコは、9〜14世紀のクメール帝国が東南アジアの広い範囲に及んだと説明します。一つの神殿や一つの都市計画だけではありません。何世代もかけて造り変えた神殿・住居・道・水管理の構造があります。アンコール・ワットとバイヨンは有名ですが、その周囲にはさらに広い居住地がありました。ユネスコは水の設備と交通路の両方を重要な要素としています。農業と居住は、大建築の中心と同じ歴史の中でつながっていました。',[0]],
    ['Mapping by the Greater Angkor Project identified a large, connected system of canals, reservoirs, embankments and related structures. These facilities intercepted, stored and distributed water across a broad area. Their arrangement changed as settlements and projects expanded; later builders worked with infrastructure inherited from earlier periods. Reservoirs known as barays are conspicuous features, but smaller channels and banks also affected the movement of water. Research treats this as a network rather than a collection of isolated monuments. To understand one structure, archaeologists need to establish where water entered it, where it went next and how neighbouring components worked together.',
     '大アンコール・プロジェクトの地図調査は、水路・貯水池・堤などの大きなネットワークを確認しました。設備は広い地域で水を受け、ため、配りました。集落と事業が広がるにつれて配置は変わり、後の建築者は前の時代の設備を利用しました。バライと呼ばれる大貯水池だけでなく、小水路と堤も水の動きを変えました。一つの設備を理解するには、水がどこから入り、次にどこへ進み、隣の設備とどう働いたかを調べる必要があります。',[1]],
    ['Monumental building in brick and stone was connected to political and religious life. Temples expressed relationships between rulers, divine powers and the wider community. Stone inscriptions in Sanskrit and Old Khmer are the main written source for Khmer history from the fifth to fourteenth centuries. Khmer architecture drew on traditions from the Indian subcontinent while developing distinctive local forms. The surviving plans, carvings and buildings record changing religious practices and royal projects across different reigns. Angkor Wat and the Bayon therefore should not be read as products of one unchanging belief system. These monuments also belonged to a ranked society. Their materials and design document considerable craft knowledge, while their distribution and scale help researchers investigate the organisation of resources and authority.',
     'れんがと石の大建築は政治と宗教に関わりました。神殿は王・神聖な力・共同体の関係を表しました。サンスクリット語と古クメール語で石に刻まれた碑文は、5〜14世紀のクメールの歴史を知る主な文字資料です。クメールの建築はインド亜大陸の伝統を取り入れ、独自の形を発達させました。配置・彫刻・建物は、王の治世ごとに変わる宗教の実践と事業を記録します。アンコール・ワットとバイヨンを、一つの変わらない信仰の産物と読むことはできません。社会には身分の違いもありました。材料と設計は手工業の知識を、規模と分布は資源と権威の組織を調べる証拠になります。',[0,3]],
    ['Research reported by the University of Sydney in 2018 examined how extreme weather affected the water network. Evidence indicates a transition from prolonged drought to unusually wet conditions during the fourteenth century. Computer analysis used mapped connections between channels and other structures to examine how unusually large flows could disturb water distribution. A failure in one part could redirect water and affect other parts downstream. This proposed mechanism links climate conditions to the particular design and condition of infrastructure. It is more specific than saying that a city disappeared because the weather became bad.',
     'シドニー大学が2018年に紹介した研究は、極端な天候が水のネットワークに及ぼす影響を調べました。14世紀には長い干ばつから異常に雨の多い時期へ変わった証拠があります。地図上の設備のつながりを使った計算は、大きな流量が配水を乱す過程を調べました。一部分の故障が水を別の方向へ流し、下流にも影響する可能性があります。この説明は、気候と設備の設計・状態を結びます。単に「悪い天候で都市が消えた」とするより具体的なしくみです。',[2]],
    ['Angkor’s urban population and political importance changed substantially in the later medieval period. The site continued to have religious and cultural significance. The water-network study identifies a possible contribution to those changes, not proof that climate was the only cause of every political decision. Its evidence concerns a built system that had developed over centuries and remained dependent on older components. Researchers can investigate how long-term construction created both useful connections and points exposed to disruption. Today, Khmer communities continue to live in the Angkor landscape, and preservation must account for inhabited places as well as historic monuments.',
     '中世後期、アンコールの都市人口と政治的重要性は大きく変わりましたが、宗教的・文化的な意味は続きました。水系の研究は変化の一要因を示すもので、全ての政治的判断の原因が気候だけだったと証明しません。何世紀もかけて発達し、古い部分にも依存した設備を調べています。長期の建設が有用なつながりと、混乱を受けやすい場所の両方をつくった過程を研究できます。現在もクメールの共同体が住み、遺跡の保存には住民の暮らしも関わります。',[0,2]]
  ]},
  F:{sources:[
    ['UNESCO: Yin Xu','ユネスコ：殷墟','https://whc.unesco.org/en/list/1114/'],
    ['Columbia University: Oracle-Bone Inscriptions of the Late Shang','コロンビア大学：殷後期の甲骨文','https://afe.easia.columbia.edu/main_pop/ps/ps_china-oracle-bone-general.htm'],
    ['Columbia University and The Metropolitan Museum: The Great Bronze Age of China','コロンビア大学・メトロポリタン美術館：中国の青銅器時代','https://afe.easia.columbia.edu/special/china_4000bce_bronze.htm'],
    ['The Metropolitan Museum: Shang oracle bone','メトロポリタン美術館：殷の甲骨','https://www.metmuseum.org/art/collection/search/42045'],
    ['Emma Goodliffe, British Library: records of a lunar eclipse on a Shang oracle bone','エマ・グッドリフ（大英図書館）：殷の甲骨に記された月食','https://scroll.in/article/801747/records-of-a-lunar-eclipse-from-more-than-3000-years-ago']
  ],reading:[
    ['The Shang dynasty is conventionally dated to approximately 1600–1046 BCE. Its later capital at Yin Xu, near present-day Anyang, provides particularly rich archaeological evidence from the last centuries of Shang rule. Excavations have identified palatial foundations, ancestral shrines, workshops and royal tombs. Rammed earth and timber were important building materials. The remains occupy areas on both sides of the Huan River, showing an organised capital rather than a single isolated royal building. The evidence from this late capital is especially detailed. It cannot provide a complete record of every community across the whole Yellow River basin.',
     '殷（商）は通常、およそ紀元前1600〜1046年に位置づけられます。現在の安陽付近にある後期の都・殷墟には、王朝最後の数世紀の豊かな考古資料があります。宮殿の基礎・祖先の祭祀施設・工房・王墓が発掘され、版築と木材が重要な建材でした。遺構は洹河の両岸に広がり、一つの王の建物だけでなく、組織された都を示します。詳しい証拠ですが、黄河全域の全ての共同体の完全な記録ではありません。',[0]],
    ['Bronze vessels were used in ceremonies associated with rulers and ancestors. Their forms and decoration required skilled preparation of models and moulds as well as metal casting. The Chinese Bronze Age developed a distinctive piece-mould method: separate mould sections were assembled around a core to shape the vessel. Producing a large or elaborate object involved coordinated stages and controlled materials. These vessels were not simply everyday cooking pots made stronger. They belonged to ceremonial practices in which valuable objects, offerings and elite status were connected. Museum collections preserve examples through which researchers study workshop techniques and changing styles.',
     '青銅の器は、王と祖先に関わる儀礼で使われました。形と装飾には、模型・鋳型の準備と鋳造の技能が必要です。中国の青銅器時代には、分割した鋳型を芯の周囲に組み立てる独特の方法が発達しました。大きく複雑な器には、複数の工程と材料の管理が必要です。単に丈夫になった日常の鍋ではなく、価値ある物・供物・支配層の地位を結ぶ儀礼の道具でした。博物館の品物から、工房の技術と様式の変化を研究できます。',[2]],
    ['Shang diviners used cattle shoulder blades and turtle shells to seek guidance. They prepared pits in the material and applied heat, producing cracks that were interpreted in relation to questions. Inscriptions could record the question, the interpretation and sometimes the eventual outcome. Topics included harvests, weather, warfare, illness and offerings to ancestors. The king and diviners hoped to understand ancestral will and the power of the high deity Di. The surviving inscriptions preserve an early mature Chinese writing system. They record specific decisions and concerns of the court, including its religious practices. Celestial events mattered too. A bone in the British Library records a lunar eclipse datable to 27 December 1192 BCE. Eclipses were treated as bad omens.',
     '殷の占い手は牛の肩甲骨とカメの甲羅を使いました。くぼみを作って熱を加え、できたひびを質問に照らして読みました。銘文には質問・判断・実際の結果が記されることもあります。収穫・天候・戦争・病気・祖先への供物が話題になりました。王と占い手は、祖先の意志と最高神「帝」の力を知ろうとしました。甲骨文は成熟した初期の漢字体系と、抽象的な信仰だけでなく、宮廷の具体的な判断と関心を残しています。天体の出来事も重要でした。大英図書館の甲骨には紀元前1192年12月27日と特定できる月食が記され、日食や月食は悪い前兆とされました。',[1,4]],
    ['Oracle bones also provide a particular viewpoint on society. They mostly preserve matters important to kings and their associates. Ordinary people did not leave an equally detailed written account in the same collection. An inscribed bone now in the Metropolitan Museum is a surviving object within this larger practice. Its physical material, cut marks and writing can be examined alongside excavated contexts and translated inscriptions. Scholars must bring these forms of evidence together. The court’s records illuminate the relationship between writing, ritual and decision making. Archaeological remains help investigate activities and people less visible in royal questions.',
     '甲骨は特定の立場から社会を伝えます。主に王と周囲の人の関心を残し、同じ資料の中に一般の人々の詳しい記録が等しくあるわけではありません。メトロポリタン美術館の甲骨も、この実践の中の一つです。材料・刻み・文字を、発掘の位置と翻訳された銘文と合わせて調べられます。宮廷の記録は、文字・儀礼・判断の関係を示し、考古資料は王の質問には見えにくい人々の活動を調べる手がかりになります。',[1,3]],
    ['Royal tombs contained bronze vessels, jade, bone carvings, ceramics and weapons. At Yin Xu, the tomb of Fu Hao survived without the extensive ancient looting affecting many other royal burials. It held more than 200 bronze weapons and tools. A Columbia University and Metropolitan Museum guide describes Shang kings frequently riding out to hunt and fight wars. Chariot pits and sacrificial human remains give further evidence of elite power and its human consequences. Objects of exceptional workmanship existed alongside unequal status and violent practices. These are facts documented in the archaeological record, not evidence that every person enjoyed the prosperity associated with royal monuments. Around 1046 BCE, Zhou rulers defeated the Shang, beginning another political period while many technical and cultural traditions continued in changed settings.',
     '王墓には青銅器・玉・骨の彫刻・陶器・武器が納められました。殷墟の婦好墓は、多くの王墓と異なり大規模な古代の盗掘を受けずに残り、200点以上の青銅の武器と道具がありました。コロンビア大学とメトロポリタン美術館の資料は、殷の王がしばしば狩りと戦争に出かけたと説明します。戦車の穴と人間の犠牲の遺骨は、支配層の権力と人的な影響の証拠です。優れた工芸と、身分の不平等・暴力が共存しました。王の建築の豊かさは、全員の利益の証明ではありません。紀元前1046年ごろ、周が殷を破って新しい政治の時代になり、多くの技術と文化は変わった環境で続きました。',[0,2]]
  ]}
};
for (const [point,content] of Object.entries(historicalReadings)) {
  regions[point].reveal.sources=content.sources.map(([en,ja,url])=>({title:{en,ja},url}));
  regions[point].reveal.reading=content.reading.map(([en,ja,sources])=>({text:{en,ja},sources}));
}

const furtherHistoricalReadings = {
  G:{sources:[
    ['UNESCO: Memphis and the Pyramid Fields','ユネスコ：メンフィスとピラミッド地帯','https://whc.unesco.org/en/list/86/'],
    ['Ancient Egypt Research Associates: Feeding Pyramid Workers','古代エジプト研究協会：ピラミッド労働者への食料供給','https://aeraweb.org/feeding-pyramid-workers/'],
    ['Ancient Egypt Research Associates: Pyramids and Protein','古代エジプト研究協会：ピラミッドと動物性食料','https://aeraweb.org/pyramids-and-protein/'],
    ['The Metropolitan Museum: Egypt in the Old Kingdom','メトロポリタン美術館：エジプト古王国','https://www.metmuseum.org/essays/egypt-in-the-old-kingdom-ca-2649-2150-b-c'],
    ['J. G. Manning: State and irrigation in ancient Egypt (Annales, 2017; English abstract)','J・G・マニング：古代エジプトの国家と灌漑（『アナール』2017年、英語要旨あり）','https://www.cambridge.org/core/journals/annales-histoire-sciences-sociales/article/etat-et-irrigation-en-egypte-antique/AA22F009BDD39BDF2287A391781D88E9'],
    ['Figure from “Date Palm Status and Perspective in Egypt”: irrigation technology in ancient Egypt','「エジプトのナツメヤシの現状と展望」の図：古代エジプトの灌漑技術','https://www.researchgate.net/figure/rrigation-technology-in-ancient-Egypt-a-Drawing-water-in-pots-from-a-lily-pond-From_fig1_274383273'],
    ['Pierre Tallet and Gregory Marouard: The Harbor Facilities of King Khufu on the Red Sea Shore (2016)','ピエール・タレ、グレゴリー・マルアール：紅海沿岸のクフ王の港湾施設（2016年）','https://www.jstor.org/stable/10.5913/jarce.52.2016.a009'],
    ['Sandra Postel, WaterHistory.org: Egypt’s Nile Valley Basin Irrigation','サンドラ・ポステル（WaterHistory.org）：ナイル渓谷の湛水灌漑','https://www.waterhistory.org/histories/nile/']
  ],reading:[
    ['Egyptian political unification is conventionally placed around 3100 BCE. In the Old Kingdom, approximately the third millennium BCE, kings organised major monuments around Memphis, the capital, and its burial landscapes. Giza’s pyramids belonged to royal funerary complexes with temples, rather than standing alone as unexplained stone mountains. Temples at Memphis honoured gods such as Ptah, a creator god and patron of craftsmanship. Later Old Kingdom kings built sun temples. UNESCO’s account also records craft workshops and dockyards around the city’s palaces and temples. These projects represent one period within a much longer history of changing dynasties and centres.',
     'エジプトの政治的統一は、通常、紀元前3100年ごろに位置づけられます。紀元前三千年紀を中心とする古王国では、王は都メンフィスと周辺の墓地景観に大きな建築を組織しました。ギザのピラミッドは、神殿を含む王の葬祭施設の一部です。メンフィスの神殿は、創造の神で職人の守護神でもあるプタハなどの神々をまつり、古王国後半の王は太陽神殿も建てました。ユネスコの説明は、宮殿と神殿の周囲にあった工房と造船所も記しています。これらの事業は、王朝と中心が変わり続けた長い歴史の中の一時期です。',[0,3]],
    ['Agriculture depended on the Nile’s annual flood. Earthen banks divided the floodplain into basins, and sluices let floodwater in. The water stood for about a month, then drained away, and farmers planted in the fresh silt. A macehead from about 3100 BCE shows a king cutting a ditch with a hoe. Manning argues that water control was mostly local and diffuse, despite an ideology of central royal control. Water-lifting devices came later. A Theban tomb painting of about 1450 BCE shows gardeners carrying water in pots. The counterweighted shaduf, already used in Mesopotamia, appeared in Egypt after about 1500 BCE.',
     '農業はナイル川の毎年の洪水に支えられました。土の堤が氾濫原を盆地に分け、水門から洪水の水を入れました。水を約1か月ためてから流し出し、農民は新しい泥に作物を植えました。紀元前3100年ごろの棍棒頭には、くわで溝を掘る王の姿があります。マニングは、王が中央で管理するという考え方とは異なり、実際の水の管理は主に地域ごとに分散していたと論じます。水をくみ上げる道具は後の時代です。紀元前1450年ごろのテーベの墓の絵は、つぼで水を運ぶ庭師を描いています。メソポタミアですでに使われていた重り付きのシャドゥーフは、紀元前1500年ごろより後にエジプトに現れました。',[4,5,7]],
    ['Writing recorded this work. Wadi al-Jarf, on the Red Sea coast, is Egypt’s oldest known harbour. Excavators led by Pierre Tallet and Gregory Marouard found papyri there from late in Khufu’s reign. Logs kept by a team of sailors describe shipping limestone blocks from the Tura quarries to the Giza pyramid site. The harbour also launched royal expeditions across the Gulf of Suez to the copper and turquoise mines of Sinai. Excavators found storage galleries, about a hundred stone anchors and some of the largest pottery kilns known from pharaonic Egypt.',
     'この仕事は文字でも記録されました。紅海沿岸のワディ・エル・ジャルフはエジプトで知られる最古の港で、ピエール・タレとグレゴリー・マルアールの調査団は、クフ王の治世後半のパピルスを発見しました。船乗りの一団の業務日誌は、トゥラの石切り場からギザのピラミッドの現場へ石灰岩のブロックを船で運んだことを記しています。港は、スエズ湾を渡ってシナイ半島の銅とトルコ石の鉱山へ向かう王の遠征の出発地でもありました。貯蔵用の回廊、約100個の石のいかり、ファラオ時代で最大級の土器の窯も見つかっています。',[6]],
    ['Excavations at the workers’ settlement near the Giza pyramids show how builders were fed. Ancient Egypt Research Associates found bakeries with large ceramic mixing vessels and many fragments of bread moulds. Experiments investigate how the pots were heated. Bread and beer formed important parts of royal labour rations, so feeding builders meant growing, transporting, storing and repeatedly preparing grain. The bakeries were several small facilities with specialised equipment, comparable to household and estate production, rather than one enormous factory. A bread mould is evidence of production, although it does not preserve every step of the recipe.',
     'ギザのピラミッド近くの労働者の集落の発掘は、建築者の食料の用意を示します。古代エジプト研究協会は、大きな陶器の混ぜる器と多くのパン型の破片があるパン焼き場を確認し、器の加熱方法を実験で調べています。パンとビールは王の事業の配給で重要だったため、建築者を養うには穀物の栽培・輸送・貯蔵・繰り返す調理が必要でした。パン焼き場は一つの巨大な工場ではなく、専門の道具を持つ複数の小施設で、家や所領の生産に似ています。パン型は生産の証拠ですが、全ての調理手順を残すわけではありません。',[1]],
    ['Animal bones add another line of evidence. Large quantities of cattle, sheep and goat remains at the settlement show that meat was supplied as well as grain. Many came from young male animals, supporting a system that sent selected livestock from farming areas to the royal building centre. At Kom el-Hisn in the Nile Delta, by contrast, researchers found cattle raising but relatively few prime animals eaten locally. Some livestock was probably sent elsewhere. Comparing sites shows monumental construction embedded in relationships between herders, farmers, transport, administrators and workers in different places.',
     '動物の骨も別の証拠です。集落にある多くの牛・羊・ヤギの骨は、穀物だけでなく肉も供給されたことを示します。若い雄が多いことは、農業地域から選んだ家畜を王の建築の中心へ送るしくみを支持します。反対に、ナイル・デルタのコム・エル・ヒスンでは牛の飼育の痕跡がある一方、食用に適した年齢の牛を地元で消費した骨は少なく、一部の家畜をほかの場所へ送ったと考えられます。遺跡を比べると、大建築が各地の牧畜民・農民・輸送・行政・労働者の関係の中にあったことが分かります。',[2]]
  ]},
  H:{sources:[
    ['UNESCO: Budj Bim Cultural Landscape','ユネスコ：バッジ・ビムの文化的景観','https://whc.unesco.org/en/list/1577/'],
    ['Australian Department of Climate Change, Energy, the Environment and Water: Budj Bim','オーストラリア環境担当省：バッジ・ビム','https://www.dcceew.gov.au/parks-heritage/heritage/places/world/budj-bim'],
    ['Gunditjmara-owned Budj Bim Cultural Landscape: Our Culture','グンディッジマラ運営、バッジ・ビム：私たちの文化','https://www.budjbim.com.au/about-us/our-culture/'],
    ['Parks Victoria: Budj Bim National Park','ビクトリア州公園局：バッジ・ビム国立公園','https://www.parks.vic.gov.au/places-to-see/parks/budj-bim-national-park']
  ],reading:[
    ['Budj Bim is part of the traditional Country of the Gunditjmara people in south-western Victoria, Australia. Archaeological evidence documents an aquaculture landscape developed over at least 6,600 years, within a much longer human relationship with this Country. The World Heritage property includes Budj Bim, Kurtonitj and Tyrendarra, connected by the volcanic landscape and cultural practices. Lava flows created rock formations, wetlands and water routes that people deliberately modified. This history concerns a living Indigenous society whose knowledge and connections continue today. Community accounts explain the continuing meaning of archaeological places and practices.',
     'バッジ・ビムは、オーストラリアのビクトリア州南西部にある、グンディッジマラの伝統的な土地です。考古資料は少なくとも6600年にわたる水産養殖の景観を示し、人と土地の関係はさらに長く続きます。世界遺産はバッジ・ビム・クルトニチ・ティレンダラを含み、火山の景観と文化の実践で結ばれています。溶岩流が岩・湿地・水の経路をつくり、人々はそれを意図的に変えました。現在も知識とつながりを持つ、生活する先住民社会の歴史です。',[0]],
    ['Gunditjmara engineers built stone channels, weirs, dams and ponds to guide water and manage kooyang, the short-finned eel. The structures worked together: waterways could direct migrating eels towards places where they were held and harvested. Their operation depended on seasonal flows and knowledge of the animal’s life cycle. Volcanic stone was therefore used within a planned food-production system, not only as a convenient material for shelter. The physical remains record repeated changes and maintenance over a long period. Researchers examine both the constructed features and their relationship to the surrounding hydrological and ecological system.',
     'グンディッジマラの技術者は、石の水路・せき・ダム・池を造り、コーヤン（短いひれのウナギ）と水を管理しました。設備は組み合わさり、移動するウナギを、保持し採取する場所へ導けました。季節の水と生物の生活周期の知識が必要です。火山の石は住まいだけでなく、計画された食料生産のしくみに使われました。遺構は長期の変更と維持を記録します。研究者は構造物と、周囲の水・生態の関係を合わせて調べます。',[0]],
    ['Woven baskets were placed in weirs to capture eels, while holding areas allowed food to be managed across time. The Australian heritage account describes modified channels bringing water and eels into ponds, where animals could grow before harvesting. Knowledge included basket making, stone construction and judging conditions at particular places. The work brought together several materials and skills. This system developed without the grain agriculture and large domesticated livestock familiar from some other regions. The evidence documents purposeful environmental management and a productive base for social life over many generations.',
     '編んだかごをせきに置いてウナギを捕り、保持する場所で食料を時間をかけて管理しました。オーストラリアの遺産の説明は、水路が水とウナギを池へ導き、採取前に育てられたことを伝えます。かごづくり・石の建設・場所ごとの条件の判断を結ぶ知識でした。穀物農業や大型の家畜に依存しなくても、複数の材料と技能を合わせた生産です。意図的な環境管理と、何世代も社会生活を支えた生産の基盤が証拠に残っています。',[1]],
    ['For Gunditjmara people, Country includes spiritual relationships, responsibilities and remembered histories as well as physical resources. Budj Bim is an Ancestral Being whose presence is expressed in the volcanic landscape. The community’s own cultural account connects places, stories and continuing practices. Knowledge is passed through Elders and collective activity, including storytelling and other cultural forms. These are sources of historical understanding alongside scientific investigation of structures and sediments. The landscape involves more than engineering. Its custodians identify spiritual relationships and responsibilities as part of the same place and history.',
     'グンディッジマラにとって土地は、物的な資源だけでなく、精神的な関係・責任・記憶する歴史を含みます。バッジ・ビムは祖先的な存在であり、その姿が火山の景観に表れています。共同体自身の文化の説明は、場所・物語・継続する実践を結びます。知識は長老と共同の活動を通じ、物語などの文化の形で伝わります。構造物や土砂の科学的研究とともに、歴史を知る根拠になります。土地の管理者が同じ場所と歴史の一部とする関係も重要です。',[2]],
    ['The landscape has also experienced disruption and restoration. Colonial-era drainage altered traditional water flows, and the lake was extensively drained during the twentieth century. A cultural weir built at Tae Rak in 2010 helped restore water through parts of the aquaculture system. Gunditjmara ownership and management, recognition of native title, and ranger programmes support continuing care for the area. Contemporary management combines customary knowledge with scientific research and monitoring. The restored water flows and current cultural activities show that heritage here includes renewed use and responsibility. The structures remain connected to their custodians.',
     '土地は中断と回復も経験しました。植民地時代以後の排水は水の流れを変え、20世紀には湖が大きく排水されました。2010年、テー・ラクに造られた文化的なせきが、水産養殖の一部へ水を戻しました。グンディッジマラの所有と管理・先住権の承認・レンジャーの活動が、継続する手入れを支えます。現在の管理は伝統的な知識と科学的な調査・観察を組み合わせています。回復した流れと文化活動は、人から切り離した遺構の保存だけでなく、再び使うことと責任も遺産に含むことを示します。',[0,1,3]]
  ]},
  I:{sources:[
    ['The Metropolitan Museum: Olmec Art','メトロポリタン美術館：オルメカの美術','https://www.metmuseum.org/essays/olmec-art'],
    ['UNESCO: Teotihuacan','ユネスコ：テオティワカン','https://whc.unesco.org/en/list/414/'],
    ['UNESCO: Palenque','ユネスコ：パレンケ','https://whc.unesco.org/en/list/411/'],
    ['The Metropolitan Museum: Reading a Classic Maya Monument','メトロポリタン美術館：古典期マヤの石碑を読む','https://www.metmuseum.org/perspectives/tortuguero'],
    ['Smithsonian National Museum of the American Indian: Maya Calendar Knowledge','スミソニアン国立アメリカ・インディアン博物館：マヤの暦の知識','https://www.si.edu/newsdesk/releases/national-museum-american-indian-launch-website-maya-calendar-system-and-year-2012']
  ],reading:[
    ['Mesoamerica was home to several societies with different languages, places and histories. The Olmec centres of San Lorenzo and La Venta belong mainly to the period approximately 1200–400 BCE on the Gulf Coast. Builders created large platforms and gathering areas, while artists worked stone and ceramics. Basalt used for colossal heads and jade used for smaller objects could travel substantial distances. The Metropolitan Museum identifies craft exchange and movement of materials as important to these works. We do not know the personal identities of the rulers portrayed in many sculptures, and some questions about their institutions remain unresolved.',
     'メソアメリカには、言語・場所・歴史の異なる複数の社会がありました。湾岸のサン・ロレンソとラ・ベンタなどのオルメカの中心は、主に紀元前1200〜400年の例です。大きな基壇と集まる場所が造られ、職人は石と陶器を加工しました。巨大な頭像の玄武岩や小品の玉は、遠くから運ばれることがありました。美術館の研究は材料の移動と手工業の交流を重視します。多くの像の人物名は分からず、制度にも未解決の問いがあります。',[0]],
    ['Teotihuacan developed much later in the highland valley north-east of present-day Mexico City. Between roughly the first and seventh centuries CE, it became a major urban centre. It had large monuments, residential districts and a highly organised plan. The Avenue of the Dead formed a main axis, while the course of the San Juan River was modified within the city. Pyramids and temples occupied only part of the inhabited area. Residential compounds, streets and workshops make it possible to study daily life beyond the ceremonial centre. The city’s scale depended on coordinated building and connections to its surrounding region.',
     'テオティワカンは、現在のメキシコ・シティの北東の高地の谷で、ずっと後に発達しました。およそ1〜7世紀に、大建築・住居の地区・組織された配置を持つ大都市になりました。「死者の大通り」が主軸となり、サン・フアン川の流路も変えられました。ピラミッドと神殿は居住域の一部です。共同住宅・道・工房から、儀礼の中心以外の日常生活も調べられます。都市の規模は建設の調整と周囲とのつながりに支えられていました。',[1]],
    ['Teotihuacan’s architecture and art influenced other parts of Mesoamerica. Its characteristic building forms and imagery appear in wider cultural exchanges. Influence does not mean every place became an identical copy of the city. Archaeological interpretation examines whether a particular object or style signals migration, trade, political contact or local imitation. The urban centre underwent major changes during the later first millennium CE, including destruction of important buildings. Its later reputation as a sacred place belongs to another phase of its history. The name Teotihuacan itself comes from later Nahua traditions, rather than a recovered original name used by the city’s builders.',
     'テオティワカンの建築と美術は、メソアメリカのほかの地域にも影響しました。ただし、影響があることは、全ての場所が同じ都市の複製になったという意味ではありません。品物や様式が移住・交易・政治的な接触・模倣のどれを示すかを調べます。紀元一千年紀後半には、重要な建物の破壊など都市が大きく変わりました。後の聖地としての名声は別の時代です。テオティワカンという名前も後のナワの伝統に由来し、建築者の元の名前が判明したわけではありません。',[1]],
    ['Maya societies occupied parts of southern Mexico and Central America and should be distinguished from both the Olmec centres and Teotihuacan. Palenque, in present-day Chiapas, became a powerful regional capital by around the sixth century CE. Its major buildings include palaces and temples, with sculpted reliefs and inscriptions related to rulers and religious life. UNESCO notes construction techniques and drainage methods that allowed thinner walls and larger interiors. Residential and productive areas surrounded the monumental centre. Palenque provides evidence of a particular royal dynasty, while other Maya cities had their own histories. The region was not governed continuously by one Maya ruler or a single unchanging political institution.',
     'マヤの諸社会はメキシコ南部と中央アメリカにあり、オルメカやテオティワカンと区別する必要があります。現在のチアパス州のパレンケは、6世紀ごろまでに強い地域の都になりました。宮殿・神殿・彫刻・銘文は、王と宗教の生活に関わります。ユネスコは、壁を薄くし室内を広げた建築技術と排水の方法にも注目しています。大建築の周囲には住居と生産の地区があります。パレンケは特定の王朝の証拠を残しますが、ほかのマヤ都市には別の歴史があります。全地域が、一人の王や一つの変わらない制度で統治され続けたわけではありません。',[2]],
    ['Maya writing, calendrical knowledge and carved monuments recorded named rulers, dates and events. Mathematics, including a sign for zero, and astronomical observation supported several interlocking calendars. These sources can be read together with buildings and objects. They enable a different kind of historical reconstruction from societies whose inscriptions remain undeciphered. They also express the interests of the people who commissioned them, especially elites celebrating authority and ancestry. Calendar and ritual activities were connected to cultural knowledge and political life. The three examples offer distinct evidence: Olmec sculpture and exchanged materials, Teotihuacan’s urban landscape, and Maya inscriptions alongside architecture. They cover different periods and should be compared as named societies.',
     'マヤの文字・暦・石碑は、王の名前・日付・出来事を記録しました。ゼロの記号を含む数学と天体の観測は、組み合わせて使う複数の暦を支えました。建物と品物と合わせて読めるため、未解読の文字を持つ社会とは異なる方法で歴史を復元できます。ただし、制作を依頼した人、特に権威と祖先を強調する支配層の関心も表します。暦と儀礼は文化知識と政治に関わりました。この三例は、オルメカの彫刻と材料の交換、テオティワカンの都市景観、マヤの銘文と建築という異なる証拠を提供します。時代と社会名を区別して比較する必要があります。',[2,3,4]]
  ]},
  J:{sources:[
    ['UNESCO: Sacred City of Caral-Supe','ユネスコ：カラル・スーペの聖なる都市','https://whc.unesco.org/en/list/1269/'],
    ['UNESCO: Qhapaq Ñan, Andean Road System','ユネスコ：カパック・ニャン、アンデスの道路網','https://whc.unesco.org/en/list/1459/'],
    ['Textile Museum of Canada: Inka','カナダ織物博物館：インカ','https://textilemuseum.ca/cloth_clay/resources/inka-2.html'],
    ['The Metropolitan Museum: Andean Textiles','メトロポリタン美術館：アンデスの織物','https://www.metmuseum.org/essays/andean-textiles'],
    ['Smithsonian Magazine: First City in the New World? (2002)','スミソニアン誌：新世界最初の都市か（2002年）','https://www.smithsonianmag.com/history/first-city-in-the-new-world-66643778/'],
    ['Smithsonian Magazine: Farming Like the Incas (2011)','スミソニアン誌：インカのような農業（2011年）','https://www.smithsonianmag.com/history/farming-like-the-incas-70263217/']
  ],reading:[
    ['Caral was an early urban and ceremonial centre in Peru’s Supe Valley during the third millennium BCE. Its major remains date thousands of years before the Inca Empire. The settlement overlooked a river valley within the dry coastal environment and contained monumental platform mounds, sunken circular courts and residential areas. Buildings developed through several phases rather than being completed all at once. Their design records substantial planning and coordinated construction. UNESCO describes Caral as an important example of early settlement organisation in the Americas. Its architectural forms influenced other coastal communities over a long period.',
     'カラルは、紀元前三千年紀、ペルーのスーペ渓谷にあった初期の都市・儀礼の中心です。主要な遺構はインカ帝国より数千年早い時代に属します。乾いた海岸環境の川の谷を望み、大きな基壇・低く掘った円形の広場・住居を含みます。建物は複数の段階で発達し、計画と共同の建設を示します。ユネスコはアメリカ大陸の初期の集落組織の重要な例とし、その建築の形が海岸のほかの共同体に長く影響したと説明します。',[0]],
    ['Caral’s large courts and platforms indicate spaces for gatherings and ceremonial activity. Archaeologists investigate these structures alongside ordinary occupation areas to understand the relationships between public activity and daily life. The organisation of the settlement is visible in its spatial pattern. Buildings do not preserve a complete account of everyone involved in their construction. Ruth Shady’s team concluded that farmers diverted river water through canals to grow squash, beans and cotton. Cotton textiles and bone flutes were also found. Shady proposes that Caral exchanged cotton, needed for fishing nets, for fish from coastal communities. The site provides evidence of complex social life long before the later imperial networks for which the Andes are often best known.',
     'カラルの大きな広場と基壇は、集まりと儀礼の場所を示します。考古学者は普通の居住域と合わせ、公共の活動と日常の関係を調べます。集落の配置から組織が見えますが、建物は建設に関わった全員の説明を残しません。ルース・シャディの調査団は、農民が川の水を水路で引き、カボチャ・豆・綿を育てたと結論づけました。綿の織物や骨の笛も見つかっています。シャディは、漁網に必要な綿を海岸の共同体の魚と交換したと考えています。アンデスでよく知られる後の帝国のネットワークより、はるか前の複雑な社会生活を示す証拠です。',[0,4]],
    ['The Inca Empire expanded during the fifteenth century CE, with Cusco as its capital. Its road network, Qhapaq Ñan, incorporated routes developed by earlier Andean communities and reached across mountains, valleys, deserts and other environments. UNESCO describes a network exceeding 30,000 kilometres. Roads connected towns, production centres and sacred places, while associated structures provided accommodation and storage. The network served communication, movement of supplies and defence as well as exchange. Its achievement was not only the construction of a path: it was the organisation of many linked routes and facilities across a very large territory.',
     '15世紀、インカ帝国はクスコを都として拡大しました。道路網カパック・ニャンは、以前のアンデスの共同体が造った経路も取り込み、山・谷・砂漠などに広がりました。ユネスコは3万キロメートルを超えるネットワークと説明します。道は都市・生産地・聖地を結び、宿泊と貯蔵の施設もありました。交易だけでなく連絡・物資の移動・防衛にも使われました。一つの道の建設だけでなく、広い領域の経路と設備を組織する事業でした。',[1]],
    ['Different terrain required different engineering solutions. The road system included steps, retaining structures, bridges and drainage arrangements appropriate to particular places. Its four main routes began from Cusco and connected with smaller networks. The organisation linked political centres with local communities, while the associated buildings helped manage movement and supplies. The surviving heritage sites represent selected parts of this much larger system. Research on the network therefore combines individual structures with regional routes and evidence of state organisation. Maintaining connections across an empire involved continuing work on paths and facilities, not just the initial decision to connect two settlements.',
     '地形によって異なる工学的な方法が必要でした。階段・擁壁・橋・排水を場所に合わせて使いました。四つの主経路はクスコから始まり、小さな道路網へつながりました。政治の中心と地域の共同体を結び、施設は移動と物資の管理を助けました。世界遺産は、さらに大きな全体の一部を代表しています。研究は個々の設備・広域の経路・国家の組織の証拠を合わせます。帝国をつなぐには、初めて道を造るだけでなく、道と施設の仕事を続ける必要がありました。',[1]],
    ['Textiles were also important to Inca political and economic life. Communities could owe labour and production to the state, including road work, cultivation of state fields and weaving. Fine textiles carried social and political meaning rather than being only practical clothing. Specialist skills connected fibre preparation, spinning, dyes and weaving. Herded alpacas supplied fibre for particularly fine cloth. Farmers cut terraces into steep slopes and built cisterns and irrigation canals. At the empire’s height, terraces covered about a million hectares in Peru. Knotted cords called khipu served as record-keeping devices. The Textile Museum of Canada describes labour obligations as part of imperial control, alongside exchange and distribution. This later system should be distinguished from Caral’s much earlier settlement. Both involved organised work, but their dates, institutions and material evidence belong to separate histories, with many intervening Andean societies.',
     '織物もインカの政治と経済に重要でした。共同体は、道路の仕事・国家の畑の耕作・織物などの労働と生産を負うことがありました。精巧な布は、衣服としてだけでなく社会的・政治的な意味を持ちました。繊維の準備・紡績・染色・織りの技能を結び、飼育したアルパカの繊維は特に精巧な布に使われました。農民は急な斜面に段々畑を造り、貯水槽と灌漑用の水路を築きました。帝国の最盛期には、段々畑はペルーで約100万ヘクタールに及びました。キープと呼ぶ結び目のあるひもは、記録の道具でした。カナダ織物博物館は、交換と配分とともに、労働の義務を帝国の支配の一部と説明します。この後の制度と、はるか前のカラルは区別する必要があります。間には多くのアンデスの社会がありました。',[2,3,5]]
  ]},
  K:{sources:[
    ['National Museum of Denmark: Norse Greenland','デンマーク国立博物館：ノルド人のグリーンランド','https://natmus.dk/organisation/forskning-og-kulturarv/nyere-tid-og-verdens-kulturer/etnografisk-samling/arktisk-forskning/prehistory-of-greenland/norse/'],
    ['National Museum of Denmark: Thule Culture','デンマーク国立博物館：チューレ文化','https://natmus.dk/organisation/forskning-og-kulturarv/nyere-tid-og-verdens-kulturer/etnografisk-samling/arktisk-forskning/prehistory-of-greenland/thule/'],
    ['National Museum of Denmark: Norse Settlement and Unresolved Questions','デンマーク国立博物館：ノルド人の居住と未解決の問題','https://natmus.dk/historisk-viden/verden/nordatlanten/nordboerne-i-groenland/'],
    ['UNESCO: Kujataa, Norse and Inuit Farming','ユネスコ：クジャター、ノルド人とイヌイットの農業','https://whc.unesco.org/en/list/1536/']
  ],reading:[
    ['Norse settlers from Iceland established farms in south-western Greenland around 985 CE. The areas called the Eastern and Western Settlements were both on the island’s western side, at different latitudes. Farms occupied places with pasture and fresh water, and people kept cattle, sheep and goats. Animal remains also show extensive use of marine resources, particularly seals, as well as hunting on land. The settlement economy was therefore a combination of herding and hunting rather than farming alone. Turf, stone and other available materials were used for buildings adapted to these local conditions.',
     'ノルド人の移住者は、985年ごろ、アイスランドからグリーンランド南西部へ来て農場をつくりました。「東入植地」と「西入植地」は、両方とも島の西側で、緯度が異なる地域です。牧草と真水のある場所で牛・羊・ヤギを飼いました。動物の骨は、陸の狩猟と、特にアザラシなど海の資源の利用も示します。農業だけでなく、牧畜と狩猟を組み合わせた経済でした。芝土・石などの材料で、地域の条件に合う建物を造りました。',[0]],
    ['Norse Greenland was connected to Europe through exchange. Written sources describe imports of iron and timber and exports including hides, rope and walrus tusks. Large farms and churches occupied important positions in a ranked society. The National Museum of Denmark relates social standing to control of resources and religious status. Trade was initially associated with influential farmers; after affiliation with the Norwegian crown in 1261, royal arrangements affected commerce. Walrus ivory linked Arctic hunting to distant demand. Such connections brought useful materials while placing Greenlandic communities within wider political and economic relationships.',
     'ノルド人のグリーンランドは、交換でヨーロッパとつながりました。文書は鉄・木材の輸入と、皮・縄・セイウチの牙などの輸出を伝えます。大農場と教会は、身分のある社会で重要な位置にありました。デンマーク国立博物館は、地位を資源の支配と宗教的身分に関係づけます。初めの交易には有力農民が関わり、1261年にノルウェー王権と結ばれた後は、王の制度も交易に影響しました。牙は北極の狩猟と遠い需要を結び、物資と政治・経済の関係をもたらしました。',[0]],
    ['Ancestors of Inuit communities associated with the archaeological term Thule reached Greenland around 1200 CE, following movements eastward through the Arctic. Their histories should be distinguished from the Norse settlement chronology. They used materials such as bone, antler, skins, driftwood and stone to produce equipment suited to Arctic environments. Marine hunting was central, while the mix of resources varied by location. Larger settlements and whale-hunting evidence point to coordinated work, and storage helped bridge periods of scarce food. Movement between places could form part of a food strategy, rather than every community remaining permanently at one farm.',
     '考古学でチューレと呼ぶイヌイットの祖先の共同体は、北極を東へ移動し、1200年ごろグリーンランドへ来ました。ノルド人の入植の年代とは区別します。骨・角・皮・流木・石で、北極に適した装備を作りました。海の狩猟が重要でも、資源の組み合わせは場所によって異なりました。大きな集落と捕鯨の証拠は共同の仕事を示し、貯蔵は食料の少ない時期を支えました。一つの農場に永久にとどまるだけでなく、移動も食料を得る方法になりました。',[1]],
    ['Objects found in archaeological contexts indicate contact between Norse and Inuit-related communities, but the character and extent of those encounters remain debated. Material can move through exchange, reuse and other processes, so an imported object does not by itself reconstruct an entire relationship. Norse settlements ceased to be inhabited during the later medieval period. A recorded wedding at Hvalsey in 1408 is among the last written evidence, while archaeology extends occupation later into the fifteenth century. Researchers investigate interacting climatic, social and economic changes. The end of settlement is not explained securely by one simple event or an assumption that Norse people never adapted.',
     '発掘された品物は、ノルド人とイヌイットに関わる共同体の接触を示しますが、出会いの性質と規模には議論があります。物は交換・再利用などで移動するため、一品だけで関係全体は復元できません。ノルド人の居住は中世後期に終わりました。1408年のフヴァルセイの結婚の記録は最後の文書証拠の一つですが、考古資料は15世紀のさらに後まで居住を示します。気候・社会・経済の変化が研究され、一つの出来事や「適応しなかった」という仮定だけでは確かな説明になりません。',[0,2]],
    ['Greenland’s history continued after the Norse settlements ended. Inuit communities developed changing patterns of hunting, movement and exchange across the coast. From the eighteenth century onward, Inuit farming developed in southern Greenland. UNESCO describes this later farming in the cultural landscape at Kujataa. This later farming should not be projected back onto every medieval Thule community. The heritage record places Norse farming and later Inuit farming in distinct periods, each combining land use with marine resources. Across these histories, the same island supported changing practices, with ecological knowledge and social relationships continuing to develop over time.',
     'ノルド人の居住が終わった後も、グリーンランドの歴史は続きました。イヌイットの共同体は海岸で狩猟・移動・交換の方法を変えていきました。ずっと後の18世紀以後、南部のイヌイットの農業は、ユネスコがクジャターで紹介する景観の一部になりました。後の農業を中世の全てのチューレ共同体に当てはめることはできません。遺産の記録はノルド人と後のイヌイットの農業を別の時代とし、両方で陸と海の資源を組み合わせたと説明します。知識と社会関係は、同じ島で変化し続けました。',[1,3]]
  ]}
};
for (const [point,content] of Object.entries(furtherHistoricalReadings)) {
  regions[point].reveal.sources=content.sources.map(([en,ja,url])=>({title:{en,ja},url}));
  regions[point].reveal.reading=content.reading.map(([en,ja,sources])=>({text:{en,ja},sources}));
}

regions.H.reveal.when={en:'Aquaculture from at least 6,600 years ago; a living culture today',ja:'少なくとも6600年前からの水産養殖。現在も続く文化'};
regions.H.reveal.had=['masonry','craft','engineering','history'];
regions.B.reveal.examples=[
  {name:{en:'Minoan palatial centres on Crete',ja:'クレタ島のミノアの宮殿の中心'},when:{en:'about 1900–1100 BCE',ja:'紀元前1900〜1100年ごろ'},had:['sailing','trade','writing','craft','construction','engineering']},
  {name:{en:'Greek city-states, including Athens',ja:'アテネなどのギリシア都市国家'},when:{en:'first millennium BCE; Athens especially fifth century BCE',ja:'紀元前一千年紀。特に紀元前5世紀のアテネ'},had:['pottery','sailing','trade','writing','craft','empire','philosophy','poetry','history']}
];
regions.I.reveal.examples=[
  {name:{en:'Olmec centres: San Lorenzo and La Venta',ja:'オルメカの中心：サン・ロレンソとラ・ベンタ'},when:{en:'about 1200–400 BCE',ja:'紀元前1200〜400年ごろ'},had:['pottery','craft','masonry','construction','trade']},
  {name:{en:'Teotihuacan',ja:'テオティワカン'},when:{en:'about first–seventh centuries CE',ja:'およそ1〜7世紀'},had:['craft','masonry','construction','engineering','trade']},
  {name:{en:'Maya cities: Palenque',ja:'マヤの都市：パレンケ'},when:{en:'especially sixth–eighth centuries CE',ja:'特に6〜8世紀'},had:['craft','masonry','construction','engineering','writing','math','astrology','history','theology']}
];
regions.J.reveal.examples=[
  {name:{en:'Caral in the Supe Valley',ja:'スーペ渓谷のカラル'},when:{en:'third millennium BCE',ja:'紀元前三千年紀'},had:['irrigation','masonry','construction','craft','trade']},
  {name:{en:'The Inca Empire',ja:'インカ帝国'},when:{en:'especially fifteenth–early sixteenth centuries CE',ja:'特に15世紀〜16世紀初め'},had:['husbandry','irrigation','masonry','construction','engineering','craft','workforce','empire','history']}
];
regions.K.reveal.examples=[
  {name:{en:'Norse Greenlandic farming communities',ja:'グリーンランドのノルド人の農業共同体'},when:{en:'about 985–fifteenth century CE',ja:'985年ごろ〜15世紀'},had:['husbandry','sailing','masonry','trade','theology']},
  {name:{en:'Medieval Thule Inuit communities',ja:'中世のチューレ・イヌイットの共同体'},when:{en:'from about 1200 CE',ja:'1200年ごろから'},had:['craft','trade']}
];
// Single-example comparisons list only developments the reading above discusses.
regions.A.reveal.had=['husbandry','pottery','mining','iron','masonry','construction','trade','craft'];
regions.C.reveal.had=['irrigation','pottery','writing','wheel','math','laws','trade','empire','workforce','games'];
regions.D.reveal.had=['pottery','sailing','writing','wheel','masonry','math','construction','engineering','craft','trade'];
regions.E.reveal.had=['irrigation','writing','masonry','construction','engineering','craft','empire','theology'];
regions.F.reveal.had=['pottery','astrology','writing','bronze','wheel','construction','craft','tradition','theology'];
regions.G.reveal.had=['pottery','husbandry','mining','sailing','irrigation','writing','masonry','construction','craft','workforce','theology'];


// Fictional regional circumstances for the simulation, not asserted historical events.
Object.assign(regions.A.events,{
  7:{"en":"A violent summer storm damages paths and buildings on the plateau.","ja":"夏の激しい嵐で、高原の道や建物が傷みます。"},
  8:{"en":"Caravans stop using your route to the coast. Supplies from distant trading partners become harder to obtain.","ja":"隊商が海岸へ向かう道を使わなくなります。遠くの交易相手から物を手に入れることが難しくなります。"},
  9:{"en":"Farmers and herders disagree about who should repair shared water points during the dry season.","ja":"乾季に共同の水場をだれが修理するかをめぐり、農民と牧畜民の意見が分かれます。"},
  10:{"en":"Your community finds workable iron ore near the plateau. Using it will require fuel, tools and skilled labour.","ja":"共同体が高原の近くで加工できる鉄鉱石を見つけます。利用には燃料・道具・熟練した労働が必要です。"},
  11:{"en":"Experienced metalworkers arrive from a neighbouring valley. They offer to train apprentices and organise shared workshops.","ja":"近くの谷から経験のある金属加工職人が来ます。見習いを育て、共同の工房をまとめることを提案します。"},
  12:{"en":"Farming, herding and trading communities gather. People exchange knowledge about storage, tools and organising seasonal work.","ja":"農業・牧畜・交易を行う共同体が集まります。貯蔵・道具・季節ごとの仕事のまとめ方について知識を交換します。"}
});
Object.assign(regions.B.events,{
  7:{"en":"A powerful sea storm damages boats, landing places and buildings along your coast.","ja":"海の激しい嵐が、海岸の船・船着き場・建物に被害を与えます。"},
  8:{"en":"Your usual island trading partner closes its harbour. Your community must find another way to obtain supplies.","ja":"いつもの交易相手の島が港を閉じます。共同体は物資を得る別の方法を探す必要があります。"},
  9:{"en":"Fishing households and merchants disagree about how much labour each should contribute to repairing the harbour.","ja":"港の修理にそれぞれどれほど労働を出すかについて、漁業を行う家と商人の意見が分かれます。"},
  10:{"en":"A new clay deposit is found near the coast. Potters could use it if workers can move it safely.","ja":"海岸の近くで新しい粘土の層が見つかります。安全に運べれば、陶工が利用できます。"},
  11:{"en":"Skilled boatbuilders arrive from another island. They offer to share workshop practices and teach younger workers.","ja":"別の島から熟練した船大工が来ます。工房での仕事の進め方を共有し、若い働き手に教えることを提案します。"},
  12:{"en":"Visitors gather at a coastal meeting place. Sailors, farmers and craftspeople share ideas about travel, storage and cooperation.","ja":"海岸の集会場所に訪問者が集まります。船乗り・農民・職人が、移動・貯蔵・協力について考えを交換します。"}
});
Object.assign(regions.C.events,{
  7:{"en":"A sudden storm damages canals and mud-brick buildings. Your community must organise repairs before the next planting season.","ja":"突然の嵐で水路と日干しれんがの建物が傷みます。次の種まきまでに修理をまとめる必要があります。"},
  8:{"en":"A neighbouring town blocks your usual trading route. Grain and building materials can no longer arrive as expected.","ja":"近くの町がいつもの交易路をふさぎます。穀物や建築材料が予定どおり届かなくなります。"},
  9:{"en":"Upstream and downstream households disagree about their contributions to clearing a shared canal.","ja":"共同の水路をさらう作業への負担について、上流と下流の家の意見が分かれます。"},
  10:{"en":"Workers find a useful clay deposit beside a riverbank. It could supply pottery and bricks for your community.","ja":"働き手が川岸で役立つ粘土の層を見つけます。共同体の陶器やれんがの材料にできます。"},
  11:{"en":"Experienced craftspeople arrive from another river town. They offer to teach apprentices and coordinate shared production.","ja":"別の川沿いの町から経験のある職人が来ます。見習いへの指導と共同生産の調整を提案します。"},
  12:{"en":"Neighbouring settlements meet after the harvest. People exchange ideas about canals, recordkeeping and organising shared work.","ja":"収穫後に近くの集落が集まります。水路・記録・共同作業のまとめ方について考えを交換します。"}
});
Object.assign(regions.D.events,{
  7:{"en":"A strong monsoon storm damages paths, wells and buildings across the river plain.","ja":"強いモンスーンの嵐で、川沿いの平野の道・井戸・建物が傷みます。"},
  8:{"en":"A route through the neighbouring hills becomes unavailable. Your community receives fewer imported materials.","ja":"近くの丘を通る道が使えなくなります。共同体に届く外部の材料が減ります。"},
  9:{"en":"Households disagree about who should clean shared drains and maintain wells before the rainy season.","ja":"雨季の前に共同の排水路を掃除し、井戸を維持する責任について、家ごとの意見が分かれます。"},
  10:{"en":"A riverbank exposes a clay deposit suitable for firing. Your community could use it for vessels or building materials.","ja":"川岸に、焼いて利用できる粘土の層が現れます。器や建築材料に使える可能性があります。"},
  11:{"en":"Skilled beadmakers visit your settlement. They offer to train apprentices and organise supplies for a shared workshop.","ja":"熟練した玉づくりの職人が集落を訪れます。見習いを育て、共同の工房の材料をまとめることを提案します。"},
  12:{"en":"Visitors meet at a riverside gathering. Farmers and craftspeople compare methods of measuring, storing goods and organising exchange.","ja":"川辺の集まりに訪問者が来ます。農民と職人が、測定・貯蔵・交換の進め方を比べます。"}
});
Object.assign(regions.E.events,{
  7:{"en":"A powerful wet-season storm damages channels, roads and wooden buildings around the lake.","ja":"雨季の強い嵐で、湖の周りの水路・道・木造の建物が傷みます。"},
  8:{"en":"Your usual river landing becomes inaccessible. Supplies from communities farther downstream no longer arrive regularly.","ja":"いつもの川の船着き場が使えなくなります。下流の共同体から物資が定期的に届かなくなります。"},
  9:{"en":"Fishing and farming households disagree about who should maintain channels connecting fields and wetlands.","ja":"田畑と湿地を結ぶ水路をだれが維持するかについて、漁業と農業を行う家の意見が分かれます。"},
  10:{"en":"Your community identifies usable building stone in nearby hills. Moving it requires carriers, food and suitable routes.","ja":"共同体が近くの丘で使える建築用の石を見つけます。運搬には運び手・食料・適した道が必要です。"},
  11:{"en":"Experienced water-management workers arrive from a neighbouring community. They offer to share skills and organise maintenance teams.","ja":"近くの共同体から水管理の経験がある働き手が来ます。技術を共有し、維持管理の作業班をまとめることを提案します。"},
  12:{"en":"Communities gather beside the lake. People share knowledge about seasonal water, fishing, rice cultivation and coordinating work.","ja":"湖のほとりに共同体が集まります。季節ごとの水・漁業・稲作・仕事の調整について知識を交換します。"}
});
Object.assign(regions.F.events,{
  7:{"en":"A severe summer storm damages embankments, paths and buildings along the river.","ja":"夏の激しい嵐で、川沿いの堤・道・建物が傷みます。"},
  8:{"en":"Your main trading route across the plain closes. Supplies of materials from distant communities become unreliable.","ja":"平野を通る主な交易路が閉じます。遠くの共同体から材料が届くかどうか、不確かになります。"},
  9:{"en":"Settlements disagree about dividing the work of repairing an embankment that protects several farming areas.","ja":"複数の農地を守る堤の修理作業をどう分担するかについて、集落の意見が分かれます。"},
  10:{"en":"Workers discover accessible metal ore in nearby hills. Turning it into tools will require fuel and specialist knowledge.","ja":"働き手が近くの丘で採り出せる金属の鉱石を見つけます。道具にするには燃料と専門知識が必要です。"},
  11:{"en":"Experienced metalworkers visit from another settlement. They offer to train apprentices and organise a common supply of materials.","ja":"別の集落から経験のある金属加工職人が訪れます。見習いを育て、材料の共同調達をまとめることを提案します。"},
  12:{"en":"A seasonal gathering brings together river and upland communities. People share ideas about tools, grain storage and shared responsibilities.","ja":"季節の集まりで川沿いと高地の共同体が会います。道具・穀物の貯蔵・共同の責任について考えを交換します。"}
});
Object.assign(regions.G.events,{
  7:{"en":"An unusually strong storm damages boats, river landings and buildings beside the Nile.","ja":"例年より強い嵐で、ナイル川沿いの船・船着き場・建物が傷みます。"},
  8:{"en":"A trading partner stops sending boats along your usual route. Imported supplies arrive less often.","ja":"交易相手がいつもの航路に船を送らなくなります。外部の物資が届く回数が減ります。"},
  9:{"en":"Households disagree about their contributions to moving grain and repairing a shared landing place.","ja":"穀物の運搬と共同の船着き場の修理にどれほど労働を出すかについて、家ごとの意見が分かれます。"},
  10:{"en":"Your community finds a usable stone outcrop near the valley. Quarrying and transporting it require coordinated work.","ja":"共同体が谷の近くで利用できる石の露頭を見つけます。切り出しと運搬には仕事の調整が必要です。"},
  11:{"en":"Skilled boatbuilders arrive from another riverside settlement. They offer to teach apprentices and coordinate shared workshops.","ja":"別の川沿いの集落から熟練した船大工が来ます。見習いを教え、共同の工房を調整することを提案します。"},
  12:{"en":"Neighbouring communities gather after the harvest. People exchange knowledge about boats, storage, measurement and organising river transport.","ja":"収穫後に近くの共同体が集まります。船・貯蔵・測定・川の輸送のまとめ方について知識を交換します。"}
});
Object.assign(regions.H.events,{
  7:{"en":"A fierce storm damages paths and stone water channels across the volcanic plain.","ja":"激しい嵐で、火山の平野の道と石の水路が傷みます。"},
  8:{"en":"Your usual exchange route to a neighbouring community becomes unavailable. Important materials no longer arrive regularly.","ja":"近くの共同体へ向かういつもの交換の道が使えなくなります。大切な材料が定期的に届かなくなります。"},
  9:{"en":"Neighbouring groups disagree about sharing maintenance work on channels and routes around the wetlands.","ja":"水路の維持と湿地の周りの道の手入れをどう分担するかについて、近くの集団の意見が分かれます。"},
  10:{"en":"Your community finds accessible basalt suitable for tools and stonework. Using it requires skilled shaping and careful transport.","ja":"共同体が道具や石組みに使える玄武岩を見つけます。利用には熟練した加工と慎重な運搬が必要です。"},
  11:{"en":"Visitors from a neighbouring community offer skills in gathering and craft production. They propose teaching through shared practice.","ja":"近くの共同体から来た人々が、採集と手工業の技能を共有します。共同の実践を通じて教えることを提案します。"},
  12:{"en":"Neighbouring peoples gather near the wetlands. Participants exchange ecological knowledge, craft skills and ways of coordinating seasonal activities.","ja":"湿地の近くに隣接する人々が集まります。自然環境の知識・手工業の技能・季節の活動の調整方法を交換します。"}
});
Object.assign(regions.I.events,{
  7:{"en":"An intense rainstorm damages hillside paths and buildings. Your community must organise repairs across steep ground.","ja":"強い雨の嵐で、山腹の道や建物が傷みます。急な土地で修理をまとめる必要があります。"},
  8:{"en":"A neighbouring community blocks your usual route between the highlands and lowlands. Imported materials become harder to obtain.","ja":"近くの共同体が高地と低地を結ぶいつもの道をふさぎます。外部の材料を手に入れることが難しくなります。"},
  9:{"en":"Households disagree about dividing carrying work between food supplies and a shared building project.","ja":"食料の運搬と共同の建築作業に運び手をどう振り分けるかについて、家ごとの意見が分かれます。"},
  10:{"en":"Your community locates usable obsidian near a volcanic outcrop. Skilled workers could shape it into sharp tools.","ja":"共同体が火山の露頭の近くで利用できる黒曜石を見つけます。熟練した働き手が鋭い道具に加工できます。"},
  11:{"en":"Experienced craftspeople arrive from another settlement. They offer to train apprentices and organise the movement of workshop supplies.","ja":"別の集落から経験のある職人が来ます。見習いを育て、工房への材料の運搬をまとめることを提案します。"},
  12:{"en":"Communities from different environments meet at a gathering. People exchange knowledge about cultivation, tools, calendars and shared work.","ja":"異なる環境の共同体が集まりで会います。栽培・道具・暦・共同作業について知識を交換します。"}
});
Object.assign(regions.J.events,{
  7:{"en":"A powerful mountain storm damages hillside routes and buildings. Supplies cannot reach every settlement easily.","ja":"山の強い嵐で、山腹の道や建物が傷みます。すべての集落へ簡単に物資を届けられなくなります。"},
  8:{"en":"Your usual route between the coast and highlands closes. Exchange with communities in other altitude zones becomes unreliable.","ja":"海岸と高地を結ぶいつもの道が閉じます。標高の異なる地域の共同体との交換が不確かになります。"},
  9:{"en":"Households disagree about dividing their labour between maintaining mountain paths and preparing fields for planting.","ja":"山道の維持と種まきの準備に労働をどう分けるかについて、家ごとの意見が分かれます。"},
  10:{"en":"Your community finds accessible building stone near the valley. Shaping and moving it will require skilled, coordinated work.","ja":"共同体が谷の近くで切り出せる建築用の石を見つけます。加工と運搬には熟練した働き手と仕事の調整が必要です。"},
  11:{"en":"Skilled weavers arrive from another valley. They offer to teach apprentices and organise shared access to fibres and dyes.","ja":"別の谷から熟練した織り手が来ます。見習いを教え、繊維や染料の共同利用をまとめることを提案します。"},
  12:{"en":"Coastal and highland communities meet to exchange goods and knowledge. People discuss food storage, transport and organising seasonal work.","ja":"海岸と高地の共同体が物と知識を交換するために会います。食料の貯蔵・運搬・季節の仕事について話し合います。"}
});
Object.assign(regions.K.events,{
  7:{"en":"A fierce coastal storm damages boats, shelters and landing places along the fjord.","ja":"海岸の激しい嵐で、フィヨルド沿いの船・住まい・船着き場が傷みます。"},
  8:{"en":"Ice blocks a usual coastal exchange route. Materials from neighbouring settlements no longer arrive regularly.","ja":"氷がいつもの海岸沿いの交換の航路をふさぎます。近くの集落から材料が定期的に届かなくなります。"},
  9:{"en":"Households disagree about sharing work between repairing boats, maintaining stores and preparing for the next hunting season.","ja":"船の修理・貯蔵設備の維持・次の狩猟の季節の準備をどう分担するかについて、家ごとの意見が分かれます。"},
  10:{"en":"Your community finds usable soapstone near the coast. Skilled workers could shape it into practical vessels.","ja":"共同体が海岸の近くで利用できる石けん石を見つけます。熟練した働き手が実用的な器に加工できます。"},
  11:{"en":"Experienced craftspeople arrive from another coastal settlement. They offer to share boat-making practices and teach younger workers.","ja":"別の海岸の集落から経験のある職人が来ます。船づくりの方法を共有し、若い働き手に教えることを提案します。"},
  12:{"en":"Neighbouring communities gather beside a sheltered fjord. People exchange knowledge about travel, marine resources, storage and cooperation.","ja":"波の穏やかなフィヨルドのほとりに近くの共同体が集まります。移動・海の資源・貯蔵・協力について知識を交換します。"}
});

// Every historical comparison is at least as old as about 2000 BCE. These readings replace the
// later societies used earlier (Great Zimbabwe, classical Greece, Angkor, the Shang, the Maya and
// Teotihuacan, the Inca, Norse Greenland). Each paragraph cites the sources supporting it.
const earlyHistories = {
  A:{ name:['The Matobo Hills foragers','マトボの丘の狩猟採集民'], when:['rock art from at least 11,000 BCE; farming arrived much later','少なくとも紀元前1万1000年からの岩絵。農業はずっと後に伝わる'],
    had:['archery','mysticism'],
    sources:[
      ['UNESCO: Matobo Hills','ユネスコ：マトボの丘群','https://whc.unesco.org/en/list/306/'],
      ['British Museum African Rock Art project: Zimbabwe','大英博物館アフリカ岩絵プロジェクト：ジンバブエ','https://africanrockart.britishmuseum.org/country/zimbabwe/'],
    ],
    reading:[
      ['The Matobo Hills in south-western Zimbabwe are a landscape of granite domes, boulders and natural rock shelters. People have used these shelters for an extremely long time. UNESCO describes human occupation from the early Stone Age into historical times. This reading focuses on foraging communities who lived here thousands of years before farming arrived. They built no cities or monuments. Instead, they returned to familiar shelters across the seasons. Their history must be read mainly from stone tools, food remains, pigments and paintings.',
       'ジンバブエ南西部のマトボの丘は、花こう岩の丸い丘・巨石・自然の岩かげが広がる土地です。人々は、とても長い間この岩かげを使ってきました。ユネスコは、石器時代の初めから歴史時代まで人が住んだと説明します。この文章は、農業が伝わる何千年も前に暮らした狩猟採集の共同体を扱います。都市や大建築は造りませんでした。季節ごとに、なじみの岩かげへ戻りました。その歴史は、主に石器・食べ物の残り・顔料・絵から読み取ります。',[0]],
      ['The hills hold one of the highest concentrations of rock art in southern Africa, dating back at least 13,000 years. The British Museum’s African Rock Art project records thousands of painted sites across Zimbabwe. Most figures are painted in a single colour. Human figures are shown hunting, walking and dancing, sometimes in groups of up to forty people. Kudu, zebra and other antelopes are the most common animals. The paintings show what mattered to their makers, not a complete record of daily life.',
       'マトボの丘には、少なくとも1万3000年前までさかのぼる、南部アフリカで最も密集した岩絵があります。大英博物館のアフリカ岩絵プロジェクトは、ジンバブエ全体で何千もの絵の場所を記録しています。多くの人物や動物は一色で描かれています。人は狩り・歩く姿・踊りの場面で描かれ、40人ほどの集団もあります。動物ではクーズー、シマウマなどのレイヨウが多く描かれます。絵は作り手にとって大切なものを示し、日々の生活の完全な記録ではありません。',[0,1]],
      ['Men in the paintings usually carry bows and arrows. Hunting with bows required skilled toolmaking and close knowledge of animal behaviour. Elephants are sometimes shown being hunted by groups of men, which suggests cooperation. Yet painted animals seem to carry meaning beyond food. Many are surrounded by dots, flecks or networks of lines. Researchers therefore read these images as part of belief and ritual, not simply as hunting records.',
       '絵の中の男性は、たいてい弓と矢を持っています。弓での狩りには、道具作りの技術と動物の行動の深い知識が必要でした。ゾウを男性の集団で狩る場面もあり、協力を示しています。しかし、描かれた動物は食べ物以上の意味を持つようです。多くの動物の周りには、点や線の網目があります。そのため研究者は、絵を単なる狩りの記録ではなく、信仰と儀礼の一部として読みます。',[1]],
      ['Some scenes have been interpreted as trance-like rituals, similar to those known from South Africa. Figures crouch, dance in groups, bleed from the nose or share animal features. Geometric signs such as wavy lines and dots often appear with them. One distinctive Zimbabwean motif, called a formling, is an oblong shape divided into clusters. Its meaning is still debated. These interpretations remain careful arguments, because the painters left no written explanations.',
       '一部の場面は、南アフリカで知られるものに似た、トランスの儀礼と解釈されています。人物はしゃがんだり、集団で踊ったり、鼻から血を流したり、動物の特徴を持ったりしています。波線や点などの幾何学的な記号も、よく一緒に描かれます。ジンバブエ独特の「フォームリング」は、いくつもの部分に分かれた細長い形です。その意味は、まだ議論されています。描いた人々は文字で説明を残さなかったため、解釈は慎重な議論にとどまります。',[1]],
      ['Over time, farming societies of the Iron Age came to replace the foraging communities. UNESCO notes that the archaeology and rock art together give a very full picture of this change. The hills also remain sacred today. Shrines linked to the Mwari religion, which may date back to the Iron Age, are still used by local communities. The Matobo rocks are seen as the seat of god and of ancestral spirits. The landscape therefore connects very old foraging traditions with living religious practice.',
       'やがて、鉄器時代の農業社会が狩猟採集の共同体に取って代わりました。ユネスコは、考古資料と岩絵を合わせると、この変化がよく分かると説明します。丘は今も聖なる場所です。鉄器時代にさかのぼる可能性のあるムワリ信仰の聖地は、今も地域の人々に使われています。マトボの岩は、神と祖先の霊がいる場所と考えられています。この土地は、とても古い狩猟採集の伝統と、今も続く信仰を結びつけています。',[0]],
      ['Studying the paintings is difficult. Weathering has faded many of them, and visitors cause further slight damage. At Pomongwe Cave, experiments in the 1920s coated paintings with linseed oil, which darkened the images. Large-scale excavations have taken place in some caves, and others could still produce evidence. UNESCO notes that the hills were occupied, at least from time to time, over at least 500,000 years. The paintings are only the most visible part of that long history.',
       '絵の研究は簡単ではありません。風化で多くの絵が薄れ、訪問者による小さな傷もあります。ポモングウェ洞くつでは、1920年代に絵に亜麻仁油をぬる実験が行われ、絵が黒ずみました。いくつかの洞くつでは大規模な発掘が行われ、ほかの洞くつにも証拠が残っている可能性があります。ユネスコによると、丘は少なくとも50万年の間、ときどき人に使われてきました。絵は、その長い歴史の最も目に見える部分にすぎません。',[0]]
    ]},
  B:{ name:['The Early Bronze Age Cyclades','初期青銅器時代のキクラデス諸島'], when:['about 3200–2000 BCE','紀元前3200〜2000年ごろ'],
    had:['pottery','sailing','mining','bronze','craft','trade'],
    sources:[
      ['Museum of Cycladic Art: Cycladic Art visiting guide','キクラデス美術館：キクラデス美術の展示ガイド','https://cycladic.gr/en/ektheseis/kykladiki-techni/visiting-guide/'],
      ['National Archaeological Museum, Athens: “frying pan” with an incised ship, Chalandriani (photograph)','アテネ国立考古学博物館：船が刻まれた「フライパン」形の土器（写真）','https://commons.wikimedia.org/wiki/File:Clay_%22frying-pan%22_(%22skillet%E2%80%9C)_vessel_with_incised_decoration_of_a_ship_and_fish_%22Feminine%22_type_Chalandriani,_Syros_Early_Cycladic_II_period_(Keros-Syros_culture),_2800-2300_BCE_NAM_Athens.jpg'],
    ],
    reading:[
      ['The Cyclades are a ring of small islands in the central Aegean Sea. During the Early Bronze Age, about 3200 to 2000 BCE, these islands supported a distinctive culture. Archaeologists call it the Early Cycladic culture. Its settlements were small, but there were many of them. The island communities developed metalworking and trade, creating a network for exchanging ideas. This was centuries before the great palaces of Crete and long before classical Athens.',
       'キクラデス諸島は、エーゲ海の中央に輪のように並ぶ小さな島々です。紀元前3200〜2000年ごろの初期青銅器時代、これらの島々には独特の文化がありました。考古学者はこれを初期キクラデス文化と呼びます。集落は小さいものの、数は多くありました。島の共同体は金属加工と交易を発達させ、考えを交換するネットワークをつくりました。これはクレタ島の大宮殿より何百年も前、古典期のアテネよりずっと前のことです。',[0]],
      ['The islands were poor in farmland but rich in minerals. The Museum of Cycladic Art lists obsidian, emery, copper, silver and, above all, marble. Obsidian is a volcanic glass that breaks into very sharp blades. Visitors to the museum can see obsidian blades from the island of Melos. Emery is a hard stone, useful for grinding and polishing marble. Metalworkers made tools and weapons, including triangular bronze daggers.',
       '島々は農地が少ない一方で、鉱物が豊かでした。キクラデス美術館は、黒曜石・エメリー・銅・銀、そして何より大理石を挙げています。黒曜石は火山ガラスで、とても鋭い刃になります。博物館では、メロス島の黒曜石の刃を見ることができます。エメリーはかたい石で、大理石をけずり、みがくのに役立ちました。金属職人は、三角形の青銅の短剣などの道具や武器を作りました。',[0]],
      ['Moving these materials between islands required boats. Clay objects called frying pans come from cemeteries such as Chalandriani on the island of Syros. Some are decorated with incised spirals. One vessel in Athens shows a long ship with many oars, alongside fish. The original use of these objects is unknown. Whatever their purpose, the ship images show that seafaring mattered to the people who made them.',
       '島から島へ材料を運ぶには、船が必要でした。「フライパン」と呼ばれる土器は、シロス島のハランドリアニなどの墓地から見つかっています。うずまき模様が刻まれたものもあります。アテネにある一つの土器には、たくさんのかいを持つ長い船と魚が刻まれています。これらの土器の本来の用途は分かっていません。用途が何であっても、船の絵は、作った人々にとって航海が大切だったことを示します。',[0,1]],
      ['Marble carving was the islanders’ most characteristic art. The best-known works are figurines, mostly of nude women with arms folded across the body. The earliest examples are simple and violin-shaped. Later, with the help of metal tools, carvers produced the more detailed canonical type. A few large sculptures are over a metre high and may have stood in open-air sanctuaries. Male figures also exist, including a hunter or warrior and a seated cup-bearer.',
       '大理石の彫刻は、島の人々の最も特徴的な芸術でした。最も有名なのは小さな像で、多くは腕を体の前で組んだ裸の女性です。最も古いものは単純で、バイオリンのような形です。後に金属の道具を使い、より細かな「カノニカル型」が作られました。高さ1メートルを超える大きな像もあり、屋外の聖所に立っていた可能性があります。狩人または戦士の像や、座って杯を持つ男性の像もあります。',[0]],
      ['Most figurines come from graves, though some were found in settlements. Their meaning remains uncertain because no written sources survive. Scholars have suggested a fertility goddess, worshippers, guides for the dead, or objects used in rites of passage. Looting in the 1950s and 1960s destroyed much evidence about where figurines were placed. On the island of Keros, many objects seem to have been deliberately broken and deposited in rituals. The evidence shows skilled craft and shared ritual practices across many islands.',
       '多くの像は墓から見つかっていますが、集落から出たものもあります。文字の資料が残っていないため、意味ははっきりしません。研究者は、豊かさの女神、祈る人、死者の案内役、人生の節目の儀式に使う物などの説を出しています。1950〜60年代の盗掘で、像がどこに置かれていたかという証拠の多くが失われました。ケロス島では、多くの品物が儀式でわざと割られ、納められたようです。証拠は、多くの島に共通する熟練の技と儀式を示しています。',[0]],
      ['Everyday and ceremonial vessels were made in both clay and marble. The museum displays cylindrical clay boxes, round flasks, and marble bowls and cups. One marble vessel is known as the Dove vase. Carving vessels from hard stone took great skill and time. The archaeologist Christos Tsountas, a founder of Greek prehistoric archaeology, first named this Early Cycladic culture. He also excavated the cemetery at Chalandriani on Syros.',
       '日常と儀式の器は、土と大理石の両方で作られました。博物館には、円筒形の土の箱、丸い小びん、大理石の鉢や杯が展示されています。大理石の器の一つは「ハトの器」と呼ばれています。かたい石から器をけずり出すには、高い技術と長い時間が必要でした。ギリシアの先史考古学を始めたクリストス・ツンタスが、初期キクラデス文化と名づけました。彼はシロス島のハランドリアニの墓地も発掘しました。',[0,1]]
    ]},
  E:{ name:['Khok Phanom Di','コック・パノム・ディ'], when:['about 2000–1500 BCE','紀元前2000〜1500年ごろ'],
    had:['pottery','craft','trade'],
    sources:[
      ['Charles Higham: Social Organisation at Khok Phanom Di, Central Thailand, 2000–1500 B.C. (Arts Asiatiques, 1989)','チャールズ・ハイアム：タイ中部コック・パノム・ディの社会組織、紀元前2000〜1500年（1989年）','https://os.pennds.org/archaeobib_filestore/pdf_articles/ArtsAsiatiques/1989_44_1_Higham.pdf'],
    ],
    reading:[
      ['Khok Phanom Di is a large mound in the valley of the Bang Pakong River, about 80 km east of present-day Bangkok. It lies west of the Tonle Sap region, in the same monsoon lowlands of mainland Southeast Asia. About 4,000 years ago, the site stood near the mouth of an estuary. The sea was then about two metres higher than today, and mangrove forests lined the shore. People lived and buried their dead here between about 2000 and 1500 BCE.',
       'コック・パノム・ディは、現在のバンコクの東約80キロ、バンパコン川の谷にある大きな丘です。トンレサップ湖の地域の西にあり、同じ東南アジア大陸部のモンスーンの低地に位置します。約4000年前、この場所は河口の近くにありました。当時の海は今より約2メートル高く、海岸にはマングローブの林が続いていました。人々は紀元前2000〜1500年ごろ、ここに住み、死者を葬りました。',[0]],
      ['The community lived from the estuary and its surroundings. Excavators found abundant shellfish, fish, crabs and turtles. Rice remains appear from the lowest layers, as chaff in the soil and as impressions on pottery. Two burials even preserved stomach contents of rice and small fish. Whether the rice was grown at the site, collected wild, or both, was still being studied. Pollen cores nearby show rice-field weeds increasing at times of burning.',
       '共同体は、河口とその周りの資源で暮らしました。発掘では、たくさんの貝・魚・カニ・カメが見つかりました。米の痕跡は一番下の層からあり、土の中のもみがらや、土器に残った跡として見つかります。二つの墓には、米と小魚の胃の内容物まで残っていました。米をここで育てたのか、野生の米を集めたのか、その両方なのかは、研究が続いています。近くの花粉の記録は、焼かれた時期に田の雑草が増えたことを示します。',[0]],
      ['Tools reveal how people worked. The most common artefact after pottery and shell jewellery was a knife made from a freshwater shell. Analysis of its wear suggested that it was used to harvest rice. People also used stone adzes, heavy granite hoes and sandstone grinding stones. The stone came from some distance away, so it was probably obtained through exchange. Bone fish-hooks and harpoons show that fishing remained important.',
       '道具から、人々の仕事が分かります。土器と貝の装身具に次いで多いのは、淡水の貝で作ったナイフでした。すり減り方の分析から、稲の収穫に使われたと考えられます。人々は石のおの、重い花こう岩のくわ、砂岩のすり石も使いました。石は離れた場所から来ていたため、交換で手に入れたと考えられます。骨の釣り針ともりは、漁が大切であり続けたことを示します。',[0]],
      ['Khok Phanom Di was a centre of pottery making. Clay anvils used to shape vessels appear from the earliest to the latest layers. Burnishing pebbles gave pots a smooth, shiny surface. The richest grave belonged to an adult woman, known as Burial 15. A clay anvil and burnishing pebbles lay near her ankle. She was also buried with very large numbers of shell disc beads. Her burial suggests that skilled potters could hold high status.',
       'コック・パノム・ディは、土器作りの中心でした。器の形を整える土の当て具は、最も古い層から最も新しい層まで見つかります。みがき石は、土器の表面をなめらかで光るように仕上げました。最も豊かな墓は大人の女性のもので、「15号墓」と呼ばれます。足首の近くには、土の当て具とみがき石が置かれていました。とても多くの貝の円盤形ビーズも一緒に葬られていました。この墓は、熟練した土器作りの人が高い地位を持てたことを示します。',[0]],
      ['The burials also show changing social organisation over about twenty generations. Earlier graves were grouped together in clusters. Later, individual graves became much richer. When the sea retreated from the site, the burial tradition ended, and the area was used as a pottery workshop. Khok Phanom Di shows a coastal community combining foraging, rice and specialised craft long before any kingdom existed in the region.',
       '墓は、約20世代の間に社会のしくみが変わったことも示します。初めのころの墓は、いくつかの集まりにまとまっていました。後には、一人ひとりの墓がずっと豊かになりました。海がこの場所から遠ざかると、葬る習慣は終わり、そこは土器の工房として使われました。コック・パノム・ディは、この地域に王国ができるずっと前に、採集・米・専門の手工業を組み合わせた海辺の共同体を示しています。',[0]],
      ['Ornaments were made from many materials. Burials contained shell beads and bracelets, turtle-shell ornaments and bangles of grey slate-like stone. Shell bead styles changed over time, from funnel and barrel shapes to I-shaped and finally H-shaped beads. One area held a raised burial structure built from timber and clay over many layers of levelled fill. Large fish such as barramundi entered the estuary to spawn, giving a seasonal food source.',
       '装身具は、さまざまな材料で作られました。墓には、貝のビーズや腕輪、カメの甲羅の飾り、灰色の板のような石の腕輪がありました。貝のビーズの形は、じょうご形やたる形から、I字形、そして最後にH字形へと変わりました。ある場所には、何層もの平らにした土の上に、木と土で造った高い墓の構造がありました。バラマンディなどの大きな魚は産卵のため河口に入り、季節の食べ物になりました。',[0]]
    ]},
  F:{ name:['Taosi and Shimao','陶寺と石峁'], when:['about 2300–1800 BCE','紀元前2300〜1800年ごろ'],
    examples:[
      { name:['Taosi, southern Shanxi','山西省南部の陶寺'], when:['about 2300–1900 BCE','紀元前2300〜1900年ごろ'], had:['pottery','astrology','construction'] },
      { name:['Shimao, northern Shaanxi','陝西省北部の石峁'], when:['about 2300–1800 BCE','紀元前2300〜1800年ごろ'], had:['masonry','construction','craft','trade','defense'] }
    ],
    sources:[
      ['Astronomical function and date of the Taosi observatory (Science in China, 2009)','陶寺の観象台の天文学的な機能と年代（2009年）','https://link.springer.com/article/10.1007/s11433-009-0017-1'],
      ['Institute for the History of Natural Sciences, Chinese Academy of Sciences: the Taosi observatory','中国科学院自然科学史研究所：陶寺の観象台','https://english.ihns.ac.cn/NE/NAE/201309/t20130929_110205.html'],
      ['Li Jaang and colleagues: When peripheries were centres, the Shimao-centred polity (Antiquity, 2018)','李旻ら：周辺が中心だったとき、石峁を中心とする政体（2018年）','https://www.cambridge.org/core/journals/antiquity/article/abs/when-peripheries-were-centres-a-preliminary-study-of-the-shimaocentred-polity-in-the-loess-highland-china/EA48B7FEF5512D41D615DC3480DE0DDC'],
      ['National Geographic: carvings and evidence of human sacrifice at Shimao (2020)','ナショナル ジオグラフィック：石峁の彫刻と人身供犠の証拠（2020年）','https://www.nationalgeographic.com/history/article/mysterious-carvings-evidence-human-sacrifice-uncovered-ancient-city-china'],
      ['Capital Museum, Beijing: painted pottery plate with dragon design, Taosi (photograph)','首都博物館：陶寺の竜の文様の彩色土器（写真）','https://commons.wikimedia.org/wiki/File:Pottery_plate_with_dragon_design,_Neolithic,_Taosi_Culture,_Taosi_site,_Xiangfen,_Shanxi.jpg'],
    ],
    reading:[
      ['Long before the first Chinese dynasties known from writing, large walled settlements already existed in northern China. This reading compares two Late Neolithic sites from about 2300 to 1800 BCE. Taosi lies in southern Shanxi, in the Fen River valley. Shimao lies much further north, in the loess hills of northern Shaanxi. Both were major centres, but they were separate communities with their own histories. Archaeology, not written records, provides almost all of the evidence.',
       '文字で知られる中国の最初の王朝よりずっと前から、中国北部には大きな城壁の集落がありました。この文章は、紀元前2300〜1800年ごろの新石器時代後期の二つの遺跡を比べます。陶寺は山西省南部の汾河の谷にあります。石峁はずっと北の、陝西省北部の黄土の丘にあります。どちらも大きな中心地でしたが、それぞれ別の歴史を持つ共同体でした。証拠のほとんどは、文字の記録ではなく考古学から得られています。',[1,2]],
      ['At Taosi, archaeologists excavated a semi-circular platform of stamped earth inside the city site. A curved wall around it was cut by twelve narrow gaps. Researchers tested whether sunrise seen through these gaps marked the seasons. Radiocarbon dates place the structure around 2100 BCE. At that date, the half-risen sun at the summer and winter solstices would have appeared inside particular slots. The study argues that the platform was an observatory for tracking the solar year.',
       '陶寺では、都市の遺跡の中で、土をつき固めた半円形の基壇が発掘されました。その周りの曲がった壁には、12のせまいすき間があります。研究者は、すき間から見える日の出が季節を示すかどうかを調べました。放射性炭素年代は、この構造を紀元前2100年ごろとしています。その時代、夏至と冬至には、半分のぼった太陽が特定のすき間の中に見えたはずです。研究は、この基壇が太陽の一年を知るための観象台だったと論じています。',[0,1]],
      ['The Chinese Academy of Sciences describes the platform as possibly the earliest astronomical observatory known in China. Its conclusion rests on careful measurements, but questions about who used it, and how, remain open. Taosi potters also made painted vessels. One plate, now in Beijing’s Capital Museum, is decorated with a coiled, dragon-like creature. Such objects suggest that images later important in Chinese culture had early local forms.',
       '中国科学院は、この基壇を中国で知られる最も古い天文観測所かもしれないと説明しています。この結論は慎重な測定にもとづきますが、だれがどのように使ったかは、まだ分かっていません。陶寺の土器職人は、色をぬった器も作りました。北京の首都博物館にある一枚の皿には、とぐろを巻いた竜のような生き物が描かれています。後の中国文化で大切になる図像が、早くから地域の形で現れていた可能性を示します。',[1,4]],
      ['Shimao was even larger. National Geographic reports more than 10 km of stone walls surrounding a stepped platform about 70 m high. Elites lived on its top tier, with a palace complex, a water reservoir and craft workshops. The defensive system included gates flanked by towers, one-way baffle gates and projecting bastions. The walls required about 125,000 cubic metres of stone. Builders placed wooden beams inside them as reinforcement.',
       '石峁はさらに大きな遺跡でした。ナショナル ジオグラフィックは、高さ約70メートルの段になった基壇を、10キロメートル以上の石の壁が囲むと伝えています。支配層は最上段に住み、そこには宮殿・貯水池・工房がありました。防御のしくみには、塔にはさまれた門、一方向にしか入れない門、張り出した稜堡がありました。壁には約12万5000立方メートルの石が必要でした。建設者は、補強のため壁の中に木の梁を入れました。',[3]],
      ['Jade pieces were set into Shimao’s walls, although the nearest jade source was very far away. About seventy relief sculptures of serpents, monsters and half-human beasts decorated the site. Under the eastern wall, archaeologists found 80 human skulls in six pits, probably from sacrifices when the wall was built. The Antiquity study argues that by 2000 BCE the loess highland was a political and economic heartland of China.',
       '石峁の壁には玉の破片がはめこまれていましたが、最も近い玉の産地はとても遠くにありました。ヘビ・怪物・半人半獣の約70の浮き彫りの彫刻が、遺跡を飾っていました。東の壁の下では、六つの穴から80の人の頭骨が見つかり、壁を造るときの供犠によるものと考えられています。『アンティクイティ』の研究は、紀元前2000年ごろまでに、黄土高原が中国の政治と経済の中心地だったと論じています。',[2,3]],
      ['Shimao covered about 400 hectares, making it the largest known Neolithic settlement in China. Its population probably ranged between 10,000 and 20,000 people. Some of its art and technology shows links with the northern steppe. The Antiquity study notes that symbols later linked with Central Plains civilisation appeared here first. Taosi and Shimao therefore show several important centres, rather than one single place where Chinese civilisation began.',
       '石峁の面積は約400ヘクタールで、中国で知られる最大の新石器時代の集落です。人口は1万〜2万人だったと考えられます。美術や技術の一部は、北の草原地帯とのつながりを示します。『アンティクイティ』の研究は、後に中原の文明と結びつく象徴が、ここで先に現れたと指摘します。陶寺と石峁は、中国の文明が一つの場所だけで始まったのではなく、いくつもの重要な中心があったことを示します。',[2,3]]
    ]},
  I:{ name:['The first farmers of Mesoamerica','メソアメリカの最初の農民'], when:['about 8000–2000 BCE','紀元前8000〜2000年ごろ'],
    had:['craft'],
    sources:[
      ['Piperno and Flannery: the earliest archaeological maize from highland Mexico (PNAS, 2001)','パイパーノ、フラナリー：メキシコ高地の最古の考古学的なトウモロコシ（2001年）','https://pmc.ncbi.nlm.nih.gov/articles/PMC29388/'],
      ['Piperno and colleagues: starch grain and phytolith evidence for early maize in the Central Balsas valley (PNAS, 2009)','パイパーノら：中部バルサス川流域の初期のトウモロコシのでんぷん粒と植物ケイ酸体（2009年）','https://www.pnas.org/doi/10.1073/pnas.0812525106'],
    ],
    reading:[
      ['Long before cities or pyramids, people in Mesoamerica began to change the plants they gathered. This reading covers the Archaic period, roughly 8000 to 2000 BCE. People lived in small groups that hunted, gathered wild foods and gradually cultivated a few plants. Over thousands of years, some of these plants became crops that later fed great cities. Few objects survive from this period, so careful scientific methods are essential.',
       '都市やピラミッドよりずっと前に、メソアメリカの人々は、集めていた植物を変え始めました。この文章は、およそ紀元前8000〜2000年のアルカイック期を扱います。人々は小さな集団で暮らし、狩りをし、野生の食べ物を集め、少しずつ一部の植物を育てました。何千年もかけて、その一部は後に大都市を支える作物になりました。この時代の物はほとんど残っていないため、慎重な科学的方法が欠かせません。',[0,1]],
      ['Guilá Naquitz is a small, dry cave in the Oaxaca Valley of southern Mexico. Its dry conditions preserved plant remains for thousands of years. The cave has yielded the earliest physical evidence for the domestication of two major American crops: squash and maize. Researchers dated maize cobs from the cave directly to about 6,250 years ago. At that time, these were the oldest maize cobs known in the Americas.',
       'ギラ・ナキツは、メキシコ南部のオアハカ盆地にある、小さく乾いた洞くつです。乾燥のため、植物の残りが何千年も保存されました。この洞くつからは、カボチャとトウモロコシという、アメリカ大陸の二つの主な作物が栽培化された最も古い実物の証拠が見つかっています。研究者は、洞くつのトウモロコシの穂軸を直接測り、約6250年前のものとしました。当時、それはアメリカ大陸で知られる最も古い穂軸でした。',[0]],
      ['Maize descends from a wild grass called teosinte. Genetic studies point to wild teosinte populations of the Central Balsas River valley as its ancestors. This warm, seasonally dry region lies south-west of Mexico City. Researchers working at a rock shelter there found starch grains and tiny silica bodies from maize on stone grinding tools. They dated this evidence to about 8,700 years ago.',
       'トウモロコシは、テオシントという野生の草から生まれました。遺伝子の研究は、中部バルサス川流域の野生のテオシントが祖先だと示しています。この地域は暖かく、季節によって乾燥し、メキシコ・シティの南西にあります。そこの岩かげを調べた研究者は、石のすり道具に残ったトウモロコシのでんぷん粒と、小さなケイ酸の粒を見つけました。この証拠は約8700年前のものとされています。',[0,1]],
      ['Domestication was slow. Wild teosinte has small, hard seeds, very unlike modern corn. People planted and harvested selected plants over many generations, gradually changing them. Early crops were added to hunting and gathering rather than replacing them at once. Mesoamerica therefore did not begin with a single invention of farming. It began with a long series of choices, repeated by many small communities.',
       '栽培化はゆっくり進みました。野生のテオシントの種は小さくかたく、今のトウモロコシとはまったく違います。人々は何世代にもわたって選んだ植物を植え、収穫し、少しずつ変えていきました。初期の作物は、狩りや採集をすぐに置きかえたのではなく、それに加えられました。つまり、メソアメリカの農業は一度の発明で始まったのではありません。多くの小さな共同体がくり返した、長い選択の積み重ねから始まりました。',[0,1]],
      ['Archaeologists study this period with methods suited to tiny evidence. Radiocarbon dating can be applied directly to a single cob or seed. Starch grains preserved on grinding stones show which plants people processed. Changes in seed size, cob shape or rind thickness reveal human selection. These techniques show a society without monuments or writing that nonetheless transformed the plants of a continent.',
       '考古学者は、とても小さな証拠に合った方法でこの時代を調べます。放射性炭素年代は、一本の穂軸や一粒の種に直接使えます。すり石に残ったでんぷん粒は、人々がどの植物を加工したかを示します。種の大きさ、穂軸の形、皮の厚さの変化は、人による選択を示します。これらの方法は、大建築も文字もない社会が、大陸の植物を大きく変えたことを示しています。',[0,1]],
      ['Where maize began has been debated. One model placed its origin in the Tehuacán Valley of Puebla, at 1,000 to 1,500 m altitude. Genetic evidence instead favours the lower Balsas region. Much of the Balsas receives 1,200 to 1,600 mm of rain a year and averages 20 to 28 °C. If maize began there, its first cultivators lived in a tropical deciduous forest, not a cool highland valley. New finds can still change this picture.',
       'トウモロコシがどこで始まったかは議論されてきました。ある説は、標高1000〜1500メートルのプエブラ州テワカン盆地を起源としました。しかし遺伝子の証拠は、より低いバルサス地域を支持しています。バルサスの多くの場所では、年に1200〜1600ミリの雨が降り、平均気温は20〜28℃です。そこで始まったなら、最初に育てた人々は、すずしい高地ではなく熱帯の落葉樹林に住んでいました。新しい発見によって、この見方が変わる可能性もあります。',[0]],
      ['Guilá Naquitz shows how much depends on preservation. In most places, plant remains rot quickly and disappear. In a dry cave, seeds, rinds and cobs can survive for thousands of years. Archaeologists therefore know more about a few dry caves than about the many open camps where people also lived. Students should remember that the earliest surviving evidence is not always the earliest thing that happened.',
       'ギラ・ナキツは、保存の条件がどれほど大切かを示します。多くの場所では、植物の残りはすぐにくさって消えます。乾いた洞くつでは、種・皮・穂軸が何千年も残ることがあります。そのため考古学者は、人々が住んだ多くの野外のキャンプより、少数の乾いた洞くつについて多くを知っています。最も古く残った証拠が、必ずしも最も早く起きたことではないと覚えておきましょう。',[0,1]]
    ]},
  J:{ name:['Caral and the Supe Valley','カラルとスーペ渓谷'], when:['from about 2600 BCE','紀元前2600年ごろから'],
    had:['irrigation','masonry','construction','craft','trade'],
    sources:[
      ['UNESCO: Sacred City of Caral-Supe','ユネスコ：カラル・スーペの聖なる都市','https://whc.unesco.org/en/list/1269/'],
      ['Smithsonian Magazine: First City in the New World? (2002)','スミソニアン誌：新世界最初の都市か（2002年）','https://www.smithsonianmag.com/history/first-city-in-the-new-world-66643778/'],
    ],
    reading:[
      ['Caral was an early urban and ceremonial centre in the Supe Valley of Peru. Its major buildings were constructed during the third millennium BCE, thousands of years before the Inca Empire. The settlement overlooked a river valley in the dry coastal desert. It contained monumental platform mounds, sunken circular courts and residential areas. UNESCO describes Caral as the most developed example of settlement in the earliest phase of civilisation in the Americas.',
       'カラルは、ペルーのスーペ渓谷にあった初期の都市と儀礼の中心でした。主な建物は紀元前三千年紀に造られ、インカ帝国より何千年も前のものです。集落は、乾いた海岸砂漠の中の川の谷を見下ろしていました。大きな基壇、低く掘った円形の広場、住居の地区がありました。ユネスコは、カラルをアメリカ大陸の文明の最も初期の段階で、最も発達した集落の例と説明しています。',[0]],
      ['Archaeologist Ruth Shady’s team concluded that farmers diverted river water through canals to grow squash, beans and cotton. Cotton seeds, fibres and textiles were found in nearly every excavated building. Remains of anchovies and sardines show that Caral’s people ate fish from the coast, about 23 km away. Shady proposes that Caral exchanged cotton, needed for fishing nets, for fish and shellfish from coastal communities.',
       '考古学者ルース・シャディの調査団は、農民が川の水を水路で引き、カボチャ・豆・綿を育てたと結論づけました。綿の種・繊維・織物は、発掘したほぼすべての建物から見つかりました。カタクチイワシやイワシの骨は、約23キロ離れた海岸の魚を食べていたことを示します。シャディは、漁網に必要な綿を、海岸の共同体の魚や貝と交換したと考えています。',[0,1]],
      ['Caral’s builders used a distinctive technique. Workers filled woven reed bags, called shicras, with stones from a hillside quarry about 1.5 km away. They stacked the bags inside retaining walls to raise the platforms. Radiocarbon dates on these reeds gave an age of about 4,600 years. The largest structure, the Pirámide Mayor, has a broad staircase rising from a sunken circular plaza.',
       'カラルの建設者は、独特の方法を使いました。労働者は「シクラ」と呼ばれる編んだ草の袋に、約1.5キロ離れた丘の石切り場の石を詰めました。袋を擁壁の内側に積み上げ、基壇を高くしました。この草の放射性炭素年代は、約4600年前を示しました。最大の建物「ピラミデ・マヨール」には、低く掘った円形広場から上る広い階段があります。',[1]],
      ['Caral was a preceramic city: its people did not make fired pottery. Dried gourds served as containers and as floats for fishing nets. Shady’s team found a hierarchy in housing, with well-kept rooms on the pyramids, ground-level complexes for craftworkers and poorer outlying homes. Thousands of labourers would have been needed for the monuments. Shady interprets Caral as a trade centre linking the coast, mountains and forests.',
       'カラルは土器以前の都市で、人々は焼いた土器を作りませんでした。乾かしたひょうたんを、入れ物や漁網の浮きに使いました。シャディの調査団は住まいの序列を見つけました。ピラミッドの上の手入れされた部屋、地上の職人の住居、周辺の質素な家です。大建築には何千人もの労働者が必要だったはずです。シャディは、カラルを海岸・山・森を結ぶ交易の中心と考えています。',[1]],
      ['UNESCO highlights Caral’s early use of the quipu, knotted cords used as a recording device. In the sunken amphitheatre, Shady’s team found 32 flutes made from pelican and condor bones. They also found 37 cornets of deer and llama bone. These suggest music in public ceremonies. Caral’s platform mounds and sunken courts influenced later settlements along the Peruvian coast for many centuries.',
       'ユネスコは、カラルで早くからキープが使われたことに注目しています。キープは、結び目のあるひもで作る記録の道具です。低く掘った円形の劇場では、ペリカンとコンドルの骨で作った32本の笛と、シカとリャマの骨の37本の角笛が見つかりました。公の儀式で音楽が演奏されたことを示します。カラルの基壇と円形の広場は、何世紀にもわたってペルー海岸の後の集落に影響しました。',[0,1]],
      ['Caral covered about 60 hectares of pyramids, plazas and homes, about 190 km north of Lima. In 2001, Shady, Jonathan Haas and Winifred Creamer reported its early dates in the journal Science. They described the Supe Valley as home to some of the earliest population centres and large public buildings in South America. Shady found no traces of maize or other grains that could be stored. She concluded that Caral’s trade did not depend on stockpiles of food.',
       'カラルは、リマの北約190キロにあり、ピラミッド・広場・住居が約60ヘクタールに広がっていました。2001年、シャディ、ジョナサン・ハース、ウィニフレッド・クリーマーは、雑誌『サイエンス』でその古い年代を発表しました。彼らは、スーペ渓谷を南アメリカで最も早い人口の集中と大きな公共建築の場所の一つと説明しました。シャディは、トウモロコシなど貯蔵できる穀物の痕跡を見つけませんでした。そのため、カラルの交易は食料のたくわえに頼っていなかったと考えました。',[1]]
    ]},
  K:{ name:['The first Greenlanders: Saqqaq and Independence I','最初のグリーンランドの人々：サカックとインデペンデンスI'], when:['about 2500–800 BCE','紀元前2500〜800年ごろ'],
    had:['mining','craft','trade'],
    sources:[
      ['National Museum of Denmark: the Saqqaq culture','デンマーク国立博物館：サカック文化','https://natmus.dk/organisation/forskning-og-kulturarv/nyere-tid-og-verdens-kulturer/etnografisk-samling/arktisk-forskning/prehistory-of-greenland/saqqaq/'],
      ['National Museum of Denmark: Independence I','デンマーク国立博物館：インデペンデンスI文化','https://natmus.dk/organisation/forskning-og-kulturarv/nyere-tid-og-verdens-kulturer/etnografisk-samling/arktisk-forskning/prehistory-of-greenland/independence-i/'],
    ],
    reading:[
      ['The first people known to have lived in Greenland arrived about 4,500 years ago, spreading from the Canadian High Arctic. Archaeologists group them into cultures named after sites. Independence I groups lived in the far north, and the Saqqaq culture in the west and south-east. Independence I people arrived in Peary Land around 2400 BCE. The Saqqaq culture lasted roughly from 2500 to 800 BCE.',
       'グリーンランドに住んだことが知られる最初の人々は、約4500年前、カナダの高緯度北極地方から広がってきました。考古学者は、遺跡の名前をつけた文化に分けています。インデペンデンスIの集団は北の果てに、サカック文化の人々は西部と南東部に住みました。インデペンデンスIの人々は、紀元前2400年ごろピアリー・ランドに来ました。サカック文化は、およそ紀元前2500〜800年まで続きました。',[0,1]],
      ['Independence I people lived in one of the harshest environments on Earth, an Arctic desert. They hunted muskox, seals, foxes, fish, birds and polar bears. Their dwellings were tents with a central passage and a square stone hearth, large enough for four to six people. Sites often had five or more dwellings, suggesting working groups of twenty to thirty. No dwellings stand out as special, and signs of rank are lacking.',
       'インデペンデンスIの人々は、地球で最も厳しい環境の一つ、北極の砂漠に住みました。ジャコウウシ・アザラシ・キツネ・魚・鳥・ホッキョクグマを狩りました。住まいは、中央に通路と四角い石の炉があるテントで、4〜6人が入れる大きさでした。遺跡には五つ以上の住まいがあることが多く、20〜30人の作業集団を示します。特別な住まいはなく、身分の差を示すものも見つかっていません。',[1]],
      ['The Saqqaq culture is the best known. Frozen rubbish layers at the site of Qeqertasussuk in Disko Bay preserved bones of 45 animal species, as well as berries. Saqqaq hunters took large whales, seals, caribou, birds, cod and Arctic char. Some sites were used all year, while others were bases for fishing or caribou hunting. People followed a complex seasonal cycle across their territories.',
       'サカック文化は最もよく知られています。ディスコ湾のケケルタスススク遺跡の凍ったごみの層には、45種の動物の骨とベリーが残っていました。サカックの狩人は、大きなクジラ・アザラシ・カリブー・鳥・タラ・ホッキョクイワナをとりました。一年中使われた遺跡もあれば、漁やカリブー狩りの拠点だった遺跡もあります。人々は、なわばりの中で複雑な季節の移動をくり返しました。',[0]],
      ['Saqqaq toolmakers preferred a grey metamorphosed slate called killiaq. It came only from the Disko Bay and Nuussuaq area, where huge extraction sites have been found. Yet killiaq tools appear throughout the Saqqaq area, showing exchange over long distances. Wood, bone, antler, ivory and skin artefacts preserved in frozen layers show excellent craftsmanship. Driftwood had piled up on beaches for thousands of years, so it was plentiful.',
       'サカックの道具作りの人々は、「キリアク」という灰色の変成した粘板岩を好みました。キリアクはディスコ湾とヌースアク地域だけでとれ、そこでは大きな採掘場が見つかっています。それでも、キリアクの道具はサカックの地域全体で見つかり、遠くまでの交換を示します。凍った層に残った木・骨・角・牙・皮の品物は、すぐれた技術を示します。流木は何千年も浜にたまっていたため、豊富にありました。',[0]],
      ['Saqqaq homes varied from tent rings to dwellings with a central passage, about six metres long. These probably housed two families or one extended family. At places rich in migrating whales, seals or caribou, sites contain dozens of dwellings used at the same time. People seem to have gathered in large groups during the peak hunting season. No Saqqaq graves are known, so much about their beliefs remains unknown.',
       'サカックの住まいには、テントの跡から、長さ約6メートルの中央通路のある住居まで、さまざまな形がありました。二つの家族か、一つの大家族が住んだと考えられます。移動するクジラ・アザラシ・カリブーが多い場所には、同時に使われた何十もの住まいがある遺跡があります。人々は、狩りが最も盛んな季節に大きな集団で集まったようです。サカックの墓は見つかっていないため、信仰については分からないことが多くあります。',[0]],
      ['Later Saqqaq households used soapstone lamps. Good soapstone occurs only in a few districts, yet lamps are found at most sites on the west coast, suggesting exchange. By contrast, Independence I sites have no soapstone lamps or pots. Studies of where tools and stone chips lay inside Saqqaq dwellings suggest that men and women may have used different areas. Over time, Saqqaq groups seem to have formed regional groups with their own territories.',
       '後期のサカックの家では、滑石のランプが使われました。良い滑石は一部の地域にしかありませんが、西海岸のほとんどの遺跡でランプが見つかり、交換を示します。反対に、インデペンデンスIの遺跡には、滑石のランプや鍋がありません。サカックの住まいの中の道具や石くずの位置の研究は、男性と女性が別の場所を使った可能性を示します。サカックの人々は、時間とともに、なわばりを持つ地域の集団をつくったようです。',[0,1]]
    ]}
};
for (const [point,{ name, when, had, examples, sources, reading }] of Object.entries(earlyHistories)) {
  const reveal = regions[point].reveal;
  reveal.name = { en:name[0], ja:name[1] }; reveal.when = { en:when[0], ja:when[1] };
  reveal.sources = sources.map(([en,ja,url]) => ({ title:{ en, ja }, url }));
  reveal.reading = reading.map(([en,ja,cited]) => ({ text:{ en, ja }, sources:cited }));
  if (examples) { reveal.examples = examples.map(item => ({ name:{ en:item.name[0], ja:item.name[1] }, when:{ en:item.when[0], ja:item.when[1] }, had:item.had })); reveal.had = [...new Set(examples.flatMap(item => item.had))]; }
  else { delete reveal.examples; reveal.had = had; }
}
