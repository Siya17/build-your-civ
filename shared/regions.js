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
      trade:['free',{ en:'Traders on the Indian Ocean coast want gold and ivory.', ja:'インド洋の海岸の商人が、金や{象牙|ぞうげ}をほしがっています。' }],
      sailing:['hard',{ en:'The sea is far away, and the rivers have rocks and rapids.', ja:'海は遠く、川には岩や急な流れがあります。' }],
      horseback:['impossible',{ en:'No horses live in southern Africa, and tsetse flies carry a disease that kills them.', ja:'アフリカ南部には馬がいません。ツェツェバエがうつす病気で、馬は死んでしまいます。' }]
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
      mining:['hard',{ en:'The plain has no metal ore and almost no stone.', ja:'平野には金属の{鉱石|こうせき}がなく、石もほとんどありません。' }],
      masonry:['hard',{ en:'Builders have mud and reeds, but almost no stone.', ja:'泥と葦はあっても、石はほとんどありません。' }]
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
      horseback:['hard',{ en:'No wild horses live here. They must come from far away.', ja:'ここには野生の馬がいません。遠くから連れて来る必要があります。' }],
      masonry:['hard',{ en:'The river plain has little stone, so people bake bricks instead.', ja:'平野には石が少ないので、かわりにれんがを焼きます。' }]
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
      horseback:['hard',{ en:'Hot, wet forests and floods are hard for horses. Elephants work better here.', ja:'暑くしめった森や洪水は、馬には大変です。ここでは{象|ぞう}のほうが役に立ちます。' }]
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
      { id:'metal', en:'Copper and tin', ja:'銅とすず', text:{ en:'Copper, tin and lead ores can be found in the region.', ja:'この地域では、銅・すず・{鉛|なまり}の{鉱石|こうせき}が見つかります。' } }
    ],
    challenge:{
      en:['The river floods often. Sometimes it moves to a completely new path.', 'Dry winds can blow the soft soil away.', 'Winters are very cold.'],
      ja:['川はよくあふれ、まったく新しい道に変わることもあります。', 'かわいた風で、やわらかい土が飛ばされることがあります。', '冬はとても寒いです。']
    },
    prices:{
      pottery:['free',{ en:'Fine loess soil makes good clay, and it is easy to dig.', ja:'細かい黄土はよい粘土になり、掘りやすいです。' }],
      bronze:['free',{ en:'Copper, tin and lead can all be found in the region.', ja:'銅・すず・鉛が、すべてこの地域で見つかります。' }],
      sailing:['hard',{ en:'The river is shallow, full of mud, and often changes its path.', ja:'川は浅く、泥が多く、流れる道がよく変わります。' }]
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
    tagline:{ en:'A narrow green strip through a desert. The river floods every summer, on time.', ja:'砂漠をつらぬく細い緑の土地です。川は毎年夏、決まった時期にあふれます。' },
    land:{
      en:['The Nile flows north through the desert to the Mediterranean Sea.', 'Every summer, the river floods its banks, on time, and leaves a layer of rich [[silt|silt]].', 'Beyond the green strip, there is only desert on both sides.'],
      ja:['ナイル川は砂漠の中を北へ流れ、地中海に注ぎます。', '毎年夏、川は決まった時期にあふれ、[[silt|{肥沃|ひよく}な泥]]をのこします。', '緑の土地の外は、両側とも砂漠です。']
    },
    climate:{ station:'Luxor', source:'NOAA 1991–2020',
      temp:[15,17,21,28,31,33,34,34,31,27,21,16], rain:[3,0,2,0,1,0,0,0,0,1,0,0],
      summary:{ en:'Hot, and almost no rain all year. The water comes from rain far to the south, not from local rain.', ja:'一年中暑く、雨はほとんど降りません。水は、はるか南で降る雨から来ます。' } },
    resources:[
      { id:'silt', en:'Fertile silt', ja:'{肥沃|ひよく}な泥', text:{ en:'Every year, the flood leaves new, rich mud on the fields.', ja:'洪水が毎年、畑に新しい栄養のある泥を運びます。' } },
      { id:'papyrus', en:'Papyrus', ja:'パピルス', text:{ en:'This tall reed grows by the river. People make paper, boats and rope from it.', ja:'川べりに生える背の高い草です。紙・船・ロープが作れます。' } },
      { id:'stone', en:'Building stone', ja:'建物用の石', text:{ en:'Cliffs of limestone and granite line the valley.', ja:'谷の両側には、{石灰岩|せっかいがん}や花崗岩のがけがあります。' } },
      { id:'gold', en:'Gold to the south', ja:'南の金', text:{ en:'There are gold mines in the desert to the south.', ja:'南の砂漠に金の{鉱山|こうざん}があります。' } }
    ],
    challenge:{
      en:['Almost no rain falls. Nearly all life depends on one river.', 'If the flood is too low, crops fail. If it is too high, it destroys villages.'],
      ja:['雨はほとんど降りません。生活のほぼすべてが、一本の川にかかっています。', '洪水が少なすぎると作物が育たず、多すぎると村がこわされます。']
    },
    prices:{
      irrigation:['free',{ en:'The river floods every summer, on time, and leaves rich mud.', ja:'川は毎年夏、決まった時期にあふれ、栄養のある泥をのこします。' }],
      sailing:['free',{ en:'The river flows north, and the wind blows south. Boats can go both ways.', ja:'川は北へ流れ、風は南へふきます。船はどちらの方向にも進めます。' }],
      horseback:['hard',{ en:'No horses live here, and the narrow valley has little grass for them.', ja:'ここには馬がいません。せまい谷には、馬のための草も少ないです。' }]
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
      horseback:['impossible',{ en:'There are no horses in Australia.', ja:'オーストラリアには馬がいません。' }]
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
      masonry:['free',{ en:'Hard stone is everywhere in the mountains.', ja:'山には、かたい石がどこにでもあります。' }],
      wheel:['hard',{ en:'The slopes are very steep, and no animal is big enough to pull a cart.', ja:'斜面はとても急で、荷車を引けるほど大きな動物もいません。' }],
      horseback:['impossible',{ en:'There are no horses in the Americas, and llamas are too small to ride.', ja:'アメリカ大陸には馬がいません。リャマは小さすぎて乗れません。' }]
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
      pottery:['hard',{ en:'There is little clay, and almost no wood to fire a kiln.', ja:'粘土が少なく、焼くための木もほとんどありません。' }],
      husbandry:['hard',{ en:'Cows and sheep need hay for about seven months of winter.', ja:'牛や羊には、約7か月の冬の間、ほし草が必要です。' }],
      irrigation:['hard',{ en:'Summers are short and cool, and the ground is frozen most of the year.', ja:'夏は短くすずしく、一年の大半は地面がこおっています。' }],
      mining:['hard',{ en:'Ice covers most of the land and its rocks.', ja:'土地と岩のほとんどが、氷におおわれています。' }],
      shipbuilding:['hard',{ en:'No trees grow big enough. Builders have only driftwood.', ja:'大きく育つ木がありません。使えるのは流木だけです。' }],
      trade:['hard',{ en:'Europe is very far, and sea ice can block ships.', ja:'ヨーロッパはとても遠く、海氷が船の行く手をふさぎます。' }],
      empire:['hard',{ en:'Very few people can live here, and homes are far apart.', ja:'ここでくらせる人はとても少なく、家どうしも遠く離れています。' }]
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

export const points = Object.keys(regions);
// The Pacific-centred world map (NASA Blue Marble, equirectangular), like slide 16.
// `left` is the longitude at the left edge; `top`/`bottom` are the latitudes shown.
export const worldMap = { left:-17.5, top:80, bottom:-56, image:'/assets/world-map.webp' };
