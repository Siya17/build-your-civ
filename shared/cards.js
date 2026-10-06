// The two development trees from the Week 2 slides (adapted from Civilization VI).
// Arrows are `parents`: every chosen parent is required to unlock a card. `col`/`row` place each card
// where the slide draws it. Japanese names match the slide; {漢字|かな} adds furigana.
export const tech = [
  { id:'pottery', icon:'🏺', col:0, row:2, parents:[], en:'Pottery', ja:'{陶器|とうき}',
  },
  { id:'husbandry', icon:'🐑', col:0, row:4, parents:[], en:'Animal Husbandry', ja:'{畜産|ちくさん}',
  },
  { id:'mining', icon:'⛏️', col:0, row:6, parents:[], en:'Mining', ja:'{採鉱|さいこう}',
  },
  { id:'sailing', icon:'⛵', col:1, row:0, parents:['pottery'], en:'Sailing', ja:'{帆走|はんそう}',
  },
  { id:'astrology', icon:'☀️', col:1, row:1, parents:['pottery'], en:'Astrology', ja:'{占星術|せんせいじゅつ}',
  },
  { id:'irrigation', icon:'💧', col:1, row:2, parents:['pottery'], en:'Irrigation', ja:'{灌漑|かんがい}',
  },
  { id:'writing', icon:'✍️', col:1, row:3, parents:['pottery'], en:'Writing', ja:'{筆記|ひっき}',
  },
  { id:'archery', icon:'🏹', col:1, row:4, parents:['husbandry'], en:'Archery', ja:'{弓術|きゅうじゅつ}',
  },
  { id:'bronze', icon:'⚒️', col:1, row:5, parents:['mining'], en:'Bronze Working', ja:'{青銅器|せいどうき}',
  },
  { id:'shipbuilding', icon:'🚢', col:2, row:0, parents:['sailing'], en:'Shipbuilding', ja:'{造船|ぞうせん}',
  },
  { id:'navigation', icon:'⭐', col:2, row:1, parents:['sailing','astrology'], en:'Celestial Navigation', ja:'{天文航法|てんもんこうほう}',
  },
  { id:'currency', icon:'🪙', col:2, row:3, parents:['writing'], en:'Currency', ja:'{通貨|つうか}',
  },
  { id:'horseback', icon:'🐎', col:2, row:4, parents:['archery'], en:'Horseback Riding', ja:'{騎乗|きじょう}',
  },
  { id:'iron', icon:'🔩', col:2, row:5, parents:['bronze'], en:'Iron Working', ja:'{鉄器|てっき}',
  },
  { id:'masonry', icon:'🧱', col:1, row:6, parents:['mining'], en:'Masonry', ja:'{石工術|せっこうじゅつ}',
  },
  { id:'wheel', icon:'🛞', col:1, row:7, parents:['mining'], en:'Wheel', ja:'{車輪|しゃりん}',
  },
  { id:'math', icon:'📐', col:3, row:3, parents:['currency'], en:'Mathematics', ja:'{数学|すうがく}',
  },
  { id:'construction', icon:'🏛️', col:2, row:6, parents:['masonry','wheel'], en:'Construction', ja:'{建設|けんせつ}',
  },
  { id:'engineering', icon:'⚙️', col:3, row:7, parents:['iron','wheel'], en:'Engineering', ja:'{工学|こうがく}',
  }
];

export const civic = [
  { id:'laws', icon:'⚖️', col:0, row:4, parents:[], en:'Code of Laws', ja:'法律の{成文化|せいぶんか}',
  },
  { id:'craft', icon:'🧵', col:1, row:2, parents:['laws'], en:'Craftsmanship', ja:'{手工業|しゅこうぎょう}',
  },
  { id:'trade', icon:'🤝', col:1, row:6, parents:['laws'], en:'Foreign Trade', ja:'外国{貿易|ぼうえき}',
  },
  { id:'tradition', icon:'🛡️', col:2, row:0, parents:['craft'], en:'Military Tradition', ja:'{軍事|ぐんじ}{伝統|でんとう}',
  },
  { id:'workforce', icon:'👥', col:2, row:3, parents:['craft'], en:'State Workforce', ja:'{官吏|かんり}組織',
  },
  { id:'empire', icon:'🏙️', col:2, row:6, parents:['trade'], en:'Early Empire', ja:'初期{帝国|ていこく}',
  },
  { id:'mysticism', icon:'✨', col:2, row:8, parents:['trade'], en:'Mysticism', ja:'{神秘|しんぴ}主義',
  },
  { id:'games', icon:'🎲', col:3, row:2, parents:['workforce'], en:'Games and Recreation', ja:'{娯楽|ごらく}と{遊戯|ゆうぎ}',
  },
  { id:'philosophy', icon:'💬', col:3, row:4, parents:['workforce','empire'], en:'Political Philosophy', ja:'政治{哲学|てつがく}',
  },
  { id:'poetry', icon:'🎭', col:3, row:6, parents:['empire'], en:'Drama and Poetry', ja:'{演劇|えんげき}と{詩|し}',
  },
  { id:'training', icon:'🎯', col:4, row:0, parents:['tradition','games'], en:'Military Training', ja:'{軍事|ぐんじ}{訓練|くんれん}',
  },
  { id:'defense', icon:'🏰', col:4, row:3, parents:['games','philosophy'], en:'Defensive Tactics', ja:'{防御|ぼうぎょ}{戦術|せんじゅつ}',
  },
  { id:'history', icon:'📜', col:4, row:5, parents:['philosophy','poetry'], en:'Recorded History', ja:'記録された歴史',
  },
  { id:'theology', icon:'🌙', col:4, row:8, parents:['poetry','mysticism'], en:'Theology', ja:'{神学|しんがく}',
  }
];

// The slide-derived IDs and arrows stay stable. The reading supplies historical
// context rather than treating those arrows as universal historical prerequisites.
const developmentReadings = {
  pottery: {
    summary:{en:'Shaping and firing clay vessels for cooking, storage, exchange, and ritual use.',ja:'{粘土|ねんど}を成形して焼き、調理・貯蔵・交換・儀礼に使う容器を作る技術。'},
    what:{en:'Pottery turns clay into durable vessels through shaping, drying, and controlled firing. Makers need suitable clay, water, fuel, and knowledge of heat. Vessels support cooking, storage, serving, and sometimes exchange or ritual. Their shapes reflect different tasks, including keeping grain dry or heating food. Production can remain household work or become a specialist craft. Reliable containers may support larger food reserves, but firing consumes fuel and vessels can break. Access to clay does not remove the need for skill, time, and arrangements for sharing supplies.',ja:'陶器は、粘土を成形し、乾燥させ、火の温度を調整して焼くことで作られます。適した粘土・水・燃料と、加熱についての知識が必要です。容器は調理・貯蔵・配膳に使われ、交換や儀礼にも用いられます。穀物を乾いた状態に保つ器と、食べ物を加熱する器では、形や作り方が異なります。家族が作る場合も、専門の職人が作る場合もあります。安定した容器は食料の備蓄を助けますが、焼成には燃料が必要で、器は割れることもあります。粘土があるだけでは十分ではありません。技術を学ぶ時間や、材料を分け合う取り決めも重要です。'}
  },
  husbandry: {
    summary:{en:'Managing domesticated animals for food, materials, transport, or agricultural work.',ja:'家畜を管理し、食料・材料・運搬・農作業に利用する営み。'},
    what:{en:'Animal husbandry involves breeding, feeding, protecting, and managing domesticated animals. Different species provide different combinations of meat, milk, hides, fiber, transport, and work. Herds need water, grazing land or fodder, and care during illness or difficult seasons. People must decide where animals can graze and who owns their products. Herding may involve seasonal movement rather than permanent settlement. Animals can provide reserves of wealth, but disease or drought can destroy those reserves. Their benefits depend on local ecology, suitable species, and cooperation over shared pasture.',ja:'畜産は、家畜の繁殖・給餌・保護・管理を行う営みです。動物の種類によって、肉・乳・皮・繊維・運搬・労働力など、得られるものが異なります。水や放牧地、飼料が必要で、病気や厳しい季節には世話が増えます。どこで草を食べさせるか、生産物をだれが所有するかという取り決めも必要です。牧畜には、定住ではなく季節ごとの移動を伴う場合もあります。家畜は富の蓄えになりますが、病気や干ばつで失われる可能性があります。その価値は、地域の生態系、利用できる動物、共有の放牧地をめぐる協力に左右されます。'}
  },
  mining: {
    summary:{en:'Extracting stone and mineral deposits for tools, building materials, and metal production.',ja:'道具・建築材料・金属の生産に使う石や鉱物を採取する営み。'},
    what:{en:'Mining extracts useful minerals and stone from deposits at the surface or underground. Workers need to locate deposits, remove material, and separate useful pieces from waste. The work may require tools, supports, ventilation, and transport. Metal ore usually needs further processing before it becomes a usable metal. Mining can connect remote deposits with workshops and trading networks. It also raises questions about control of land, labor, and valuable materials. A rich deposit offers an opportunity, but difficult access, dangerous work, or limited fuel can restrict its use.',ja:'採鉱では、地表や地下の鉱床から、役に立つ鉱物や石を取り出します。鉱床を見つけ、材料を掘り出し、有用な部分を不要なものから分ける知識が必要です。道具のほか、坑道の支え・換気・運搬が必要になることもあります。金属の鉱石は、採取しただけでは金属として使えず、さらに処理しなければなりません。鉱山は、離れた地域の工房や交易網を結びつけることがあります。同時に、土地・労働・貴重な材料をだれが管理するかという問題も生まれます。豊かな鉱床があっても、アクセスの難しさ、危険な作業、燃料不足が利用を制限します。'}
  },
  sailing: {
    summary:{en:'Using wind to move vessels and carry people or goods across water.',ja:'風の力で船を動かし、水上で人や物を運ぶ技術。'},
    what:{en:'Sailing uses wind acting on a sail to move a vessel across water. Sailors need boats, sails, ropes, and knowledge of winds, currents, and safe landing places. Crews coordinate steering, handling sails, and loading cargo. Rivers and coasts can make heavy transport easier than movement over land. Water routes may connect communities that mountains or deserts separate. Sailing also brings risks from storms, unfamiliar waters, and seasonal winds. Useful waterways create possibilities for exchange, while skill, suitable vessels, and agreements with other communities shape actual access.',ja:'帆走は、帆に受ける風の力で船を動かす技術です。船・帆・綱に加え、風・海流・安全な着岸場所の知識が必要です。乗組員は、操船、帆の操作、荷物の積み込みを協力して行います。川や海岸の航路では、重い物を陸上より運びやすいことがあります。山や砂漠で隔てられた集団を、水路が結びつける場合もあります。一方で、嵐、未知の水域、季節風は危険をもたらします。水路は交換の可能性を生みますが、実際に利用できるかどうかは、技術、適切な船、ほかの集団との取り決めに左右されます。'}
  },
  astrology: {
    summary:{en:'Interpreting celestial patterns as signs, often alongside observation and calendar keeping.',ja:'天体の動きを意味のある兆候として解釈する営み。観測や暦づくりとも結びつきます。'},
    what:{en:'Astrology interprets the positions or movements of celestial bodies as signs concerning people, rulers, or events. This differs from observing the sky to describe its motions. In some historical settings, these practices developed together with calendars and record keeping. Observers needed repeated measurements, memory or written records, and ways to interpret patterns. Their interpretations could influence ritual or political decisions. Knowledge of seasons could also serve practical purposes. Keeping these activities distinct helps us examine how useful observation and religious interpretation could coexist without treating them as identical.',ja:'占星術は、天体の位置や動きを、人・支配者・出来事に関わる兆候として解釈する営みです。天体の運動そのものを観測して説明することとは区別されます。ただし、歴史上の一部の社会では、こうした営みが暦づくりや記録とともに発達しました。観測者には、繰り返し測定する技能、記憶や記録、動きの規則性を解釈する方法が必要でした。その解釈が、儀礼や政治の判断に影響することもありました。季節についての知識は、実用的な目的にも役立ちます。観測と宗教的な解釈を区別すると、両者の結びつきと違いを考えられます。'}
  },
  irrigation: {
    summary:{en:'Directing water toward crops through channels, storage, or other managed systems.',ja:'水路や貯水設備などを使い、作物に水を届ける技術。'},
    what:{en:'Irrigation supplies water to crops when rainfall alone is insufficient or unreliable. Systems can include channels, reservoirs, diversion structures, and smaller household arrangements. Builders need knowledge of slopes, water flow, soils, and seasonal change. Users must also maintain structures and decide when different fields receive water. Irrigation can increase production, but poorly managed systems may cause waterlogging or salt accumulation. Cooperation might involve households, local councils, or larger authorities. The presence of a river does not determine which arrangement people choose, or whether everyone receives an equal share.',ja:'灌漑は、雨だけでは不足する、または雨が不安定なときに、作物へ水を届ける技術です。水路・貯水池・取水施設のほか、世帯単位の小さな設備もあります。建設には、傾斜・水の流れ・土壌・季節変化についての知識が必要です。利用者は設備を維持し、どの畑にいつ水を送るかも決めます。生産を増やせる一方、管理が不適切だと水はけの悪化や塩の蓄積が起こります。協力の形には、家族、地域の会議、より大きな権力組織などがあります。川があるだけで、協力の形や水の公平な配分が決まるわけではありません。'}
  },
  writing: {
    summary:{en:'Representing language with signs to preserve and communicate information.',ja:'言語を記号で表し、情報を保存したり伝えたりする技術。'},
    what:{en:'Writing represents language through visible signs that people learn to produce and interpret. Different systems use different relationships between signs, sounds, and meanings. Writers need suitable materials and training, whether using clay, stone, ink, or other media. Records can preserve transactions, instructions, stories, and claims about authority. They can make administration easier across time and distance. However, access to literacy may remain limited, giving trained writers influence. Written records also preserve selected viewpoints. Societies without writing can maintain sophisticated knowledge through oral traditions, performance, and material practices.',ja:'文字は、目に見える記号によって言語を表す技術です。人々は、記号を書く方法と読み取る方法を学びます。文字体系によって、記号・音・意味の関係は異なります。粘土・石・墨など、使う材料に適した道具と訓練が必要です。記録は取引・指示・物語・権威に関する主張を保存し、時間や距離を超えた管理を助けます。ただし、読み書きできる人が限られると、その技能を持つ人が影響力を得る場合があります。記録に残るのは、選ばれた視点でもあります。文字を使わない社会も、口承・演技・物を使う実践によって、高度な知識を伝えることができます。'}
  },
  archery: {
    summary:{en:'Making and using bows and arrows for hunting, defense, or organized fighting.',ja:'弓と矢を作り、狩猟・防衛・組織的な戦闘に使う技術。'},
    what:{en:'Archery uses stored energy in a bent bow to launch an arrow. Makers need appropriate materials for the bow, string, shaft, and point. Effective use requires practice, maintenance, and knowledge of range and conditions. Bows may serve hunting, protection, competition, or organized fighting. The purposes depend on the society rather than on the weapon alone. Skilled archers can influence access to food and the ability to defend settlements. Organizing armed groups also raises questions about leadership and control. Archery developed in varied settings and does not historically require animal husbandry.',ja:'弓術は、曲げた弓に蓄えた力で矢を飛ばす技術です。弓・弦・矢の軸・矢じりには、それぞれ適した材料が必要です。効果的に使うには、練習、手入れ、射程や環境についての知識が欠かせません。弓は狩猟・防衛・競技・組織的な戦闘に使われますが、用途は道具だけではなく社会の選択によって決まります。熟練した射手は、食料の確保や集落の防衛に影響します。武装した集団を組織すると、指導者や統制の問題も生まれます。弓術はさまざまな環境で発達しており、歴史上、畜産が必須の前提だったわけではありません。'}
  },
  bronze: {
    summary:{en:'Producing and shaping copper alloys for tools, weapons, and valued objects.',ja:'銅を主成分とする合金を作り、道具・武器・貴重な品に加工する技術。'},
    what:{en:'Bronze working produces and shapes copper alloys, commonly made by combining copper with tin. Workers need metal supplies, fuel, furnaces or hearths, and knowledge of casting or hammering. Different mixtures and treatments affect an object’s properties. Tools, weapons, vessels, and ornaments can support practical work and displays of status. Copper and tin deposits may be far apart, encouraging long-distance supply relationships. Specialist workshops can concentrate skill and valuable materials. Production depends on more than finding ore: it also requires transport, reliable partners, and sustained access to fuel.',ja:'青銅器の製作では、銅を主成分とする合金を作り、加工します。代表的な方法は、銅にすずを混ぜることです。金属の供給、燃料、炉、鋳造や鍛造の知識が必要です。混ぜる割合や加工の方法によって、完成品の性質が変わります。道具・武器・容器・装飾品は実用に役立つだけでなく、地位を示す品にもなります。銅とすずの産地が離れていると、遠距離の供給関係が重要になります。専門の工房には、技能や価値のある材料が集まります。鉱石を見つけるだけでは十分ではなく、運搬、信頼できる相手、継続的な燃料の確保も必要です。'}
  },
  shipbuilding: {
    summary:{en:'Designing and constructing vessels suited to particular cargoes, waters, and journeys.',ja:'荷物・水域・旅の目的に合わせて船を設計し、建造する技術。'},
    what:{en:'Shipbuilding designs and constructs vessels suited to particular waters, loads, and journeys. Builders must consider stability, buoyancy, strength, propulsion, and the availability of materials. Wooden vessels may require timber, joinery, fibers, and waterproofing, while other traditions use different materials. Larger ships can carry more cargo but need more workers and maintenance. Construction may involve specialist knowledge passed between generations. A capable vessel can extend exchange and political connections. Its usefulness still depends on crews, safe landing places, supplies, and cooperation along the route rather than size alone.',ja:'造船は、水域・積荷・旅の目的に合う船を設計し、建造する技術です。安定性・浮力・強度・推進方法と、使える材料を考える必要があります。木造船には木材、接合の技術、繊維、防水処理が必要ですが、別の材料を用いる伝統もあります。大型の船は多くの荷物を運べる一方、より多くの作業者や維持管理が必要です。専門知識が、世代を超えて伝えられることもあります。適した船は、交換や政治的なつながりを広げます。ただし、大きさだけで有用性は決まりません。乗組員、着岸場所、物資、航路沿いの協力関係も重要です。'}
  },
  navigation: {
    summary:{en:'Using celestial observations with environmental knowledge to estimate direction and position.',ja:'天体の観測と環境の知識を組み合わせ、方向や位置を判断する技術。'},
    what:{en:'Celestial navigation uses observations of the sun, stars, or other celestial bodies to help determine direction or position. Navigators combine these observations with knowledge of seasons, winds, currents, and local signs. Methods can rely on learned patterns, instruments, calculations, or combinations of these. Training and repeated journeys build experience that a single observation cannot supply. Navigation may make longer voyages more reliable and connect distant communities. It does not eliminate storms or uncertainty. Different maritime traditions developed sophisticated methods, including approaches maintained through oral teaching and practical apprenticeship.',ja:'天文航法では、太陽・星などの天体を観測して、方向や位置の判断に役立てます。航海者は、季節・風・海流・地域の兆候についての知識も組み合わせます。方法には、学習した規則性、道具、計算、またはそれらの組み合わせがあります。訓練と繰り返しの航海で得る経験は、一度の観測では得られません。航法は長い旅の確実性を高め、遠くの集団を結びつけますが、嵐や不確実性をなくすわけではありません。各地の海洋文化は高度な方法を発達させました。その中には、口頭での教えや実地の見習いによって伝えられる方法もあります。'}
  },
  currency: {
    summary:{en:'Using accepted means of payment and measures of value to organize transactions.',ja:'受け入れられた支払い手段や価値の尺度を使い、取引を行う仕組み。'},
    what:{en:'Currency provides an accepted means of payment within a community or trading network. It may take forms such as coins or other recognized objects. People also need ways to assess value, verify payments, and settle obligations. Currency can simplify some exchanges and help account for taxes, wages, or debts. Its use depends on trust and acceptance rather than material alone. Different forms of money can coexist with gifts, credit, and direct exchange. Those who control issuance or access to payment may gain influence, while prices and debts can create unequal pressures.',ja:'通貨は、共同体や交易網の中で受け入れられる支払いの手段です。硬貨など、認められた物の形を取ることがあります。価値を評価し、支払いを確認し、義務を清算する方法も必要です。通貨は一部の交換を簡単にし、税・賃金・借金を記録する助けになります。ただし、その利用は材料だけではなく、信頼と受け入れによって成り立ちます。貨幣は、贈与・信用・直接交換と並存することもあります。発行や支払い手段へのアクセスを管理する人が影響力を得る一方、価格や借金が人々に不均等な負担を与える場合もあります。'}
  },
  horseback: {
    summary:{en:'Training and riding horses to support movement, communication, herding, or warfare.',ja:'馬を訓練して乗り、移動・連絡・牧畜・戦争に利用する技術。'},
    what:{en:'Horseback riding depends on trained horses, riding skills, and knowledge of animal care. Horses require feed, water, suitable terrain, and protection from disease or exhaustion. Riders may carry messages, manage herds, hunt, trade, or take part in warfare. Faster movement can change connections between settlements and the reach of political power. Access to horses and training can also distinguish particular groups from others. Benefits vary with local conditions; mountains, disease environments, and scarce fodder create limits. Riding involves continuing care and social arrangements as well as speed.',ja:'騎乗には、訓練された馬、乗る技能、動物の世話についての知識が必要です。馬には飼料・水・適した地形が必要で、病気や疲労への対策も欠かせません。乗り手は、連絡、群れの管理、狩猟、交易、戦争などに馬を利用します。速い移動は、集落間のつながりや政治権力の届く範囲を変えます。馬や訓練へのアクセスが、特定の集団をほかの人々と区別する場合もあります。利益は地域の条件によって変わり、山地、病気、飼料不足は制約になります。騎乗は速さだけでなく、継続的な世話と社会的な取り決めを伴います。'}
  },
  iron: {
    summary:{en:'Processing iron ores and forging metal into tools, weapons, and other objects.',ja:'鉄鉱石を処理し、金属を鍛えて道具・武器などにする技術。'},
    what:{en:'Iron working involves extracting iron from ore and shaping it into useful objects. Production requires fuel, controlled furnace conditions, and skilled processing and forging. Iron’s properties vary with impurities, carbon content, and treatment, so it is not automatically better than bronze. Ore may be widespread while usable fuel, expertise, or workshop capacity remains limited. Iron tools can support farming, crafts, and warfare, but access is a social question as well as a technical one. Expanding production depends on reliable supplies, trained workers, and arrangements for distributing the finished objects.',ja:'鉄器の製作では、鉱石から鉄を取り出し、使える物に加工します。燃料、炉の状態を調整する技術、精錬や鍛造の技能が必要です。鉄の性質は、不純物・炭素の量・処理によって変わり、青銅より必ず優れているわけではありません。鉱石が広く存在しても、燃料・専門知識・工房の能力が不足することがあります。鉄の道具は農業・手工業・戦争を助けますが、だれが使えるかは技術だけではなく社会の問題です。生産を拡大するには、安定した供給、訓練された作業者、完成品を配分する仕組みが必要です。'}
  },
  masonry: {
    summary:{en:'Selecting, shaping, transporting, and assembling stone for durable structures.',ja:'石を選び、加工し、運び、組み合わせて建造物を作る技術。'},
    what:{en:'Masonry constructs buildings and other structures from stone, sometimes with mortar and sometimes without it. Workers select suitable stone, shape pieces, and arrange them so loads remain stable. Quarrying and transport may require considerable labor even where stone is abundant. Walls, houses, terraces, and monuments serve different purposes and scales. Larger projects can bring together specialist builders and wider groups of workers. Finished structures may express authority or collective identity. Their durability depends on design and maintenance, while who supplies labor and controls the structure remains a political question.',ja:'石工術は、石を組み合わせて建物やほかの構造物を作る技術です。接着材を使う場合も、使わない場合もあります。適した石を選び、加工し、重さを安定して支える配置を考えなければなりません。石が豊富でも、採石や運搬には多くの労働が必要なことがあります。壁・住宅・段々畑・記念建造物では、目的も規模も異なります。大きな工事には専門家と多くの作業者が関わります。完成品は権威や集団の一体感を表す場合もあります。耐久性は設計と維持管理に左右され、労働をだれが担い、施設をだれが管理するかは政治的な問題です。'}
  },
  wheel: {
    summary:{en:'Using rotating wheels in transport or production where materials and surfaces allow.',ja:'材料や地面の条件に合わせ、回転する輪を運搬や生産に使う技術。'},
    what:{en:'The wheel enables different mechanisms, including wheeled transport and some pottery techniques. These uses involve different designs, skills, and supporting equipment. A cart needs strong wheels, axles, a frame, and a means of pulling it. Routes must support its weight and allow movement across the terrain. Wheels can reduce effort for some loads, but steep slopes, mud, or broken ground limit their usefulness. Transport also depends on maintenance and access to routes. Wheeled vehicles are one possible solution among many, including boats, pack animals, and human carriers.',ja:'車輪は、車両による運搬や一部の製陶技術など、異なる仕組みに利用されます。それぞれに別の設計・技能・設備が必要です。荷車には、丈夫な車輪・車軸・車体と、引く力が必要です。道はその重さを支え、地形の中を移動できる状態でなければなりません。車輪は一部の荷物を運ぶ負担を減らしますが、急斜面・泥・荒れた地面では有用性が限られます。運搬は手入れや道を使う権利にも左右されます。車両は、船、荷物を運ぶ動物、人による運搬など、多くの方法のうちの一つです。'}
  },
  math: {
    summary:{en:'Developing ways to count, measure, calculate, and reason about quantities and patterns.',ja:'数量や規則性を数え、測り、計算し、考える方法を発達させる営み。'},
    what:{en:'Mathematics develops methods for counting, measuring, calculating, and reasoning about patterns. Communities may use these methods for land, construction, calendars, exchange, or distributing supplies. Knowledge can be recorded in writing or taught through speech and practical activity. People need shared units and ways to check results when calculations guide collective work. Specialists may gain influence by assessing taxes, boundaries, or quantities. Mathematical knowledge can also be studied for its own interest. Its development follows many paths and does not historically depend on the invention of currency.',ja:'数学は、数える・測る・計算する・規則性を考える方法を発達させる営みです。土地、建築、暦、交換、物資の配分などに利用されます。知識は文字で記録される場合も、言葉や実践を通して教えられる場合もあります。計算が共同作業の判断に使われるときには、共有の単位や結果を確認する方法が必要です。税、境界、数量を判断する専門家が影響力を持つこともあります。一方、数学はそれ自体への関心から研究されることもあります。発達の道筋は多様であり、歴史上、通貨の発明が必須の前提だったわけではありません。'}
  },
  construction: {
    summary:{en:'Organizing materials, designs, workers, and maintenance for substantial building projects.',ja:'大きな建築事業のために、材料・設計・労働・維持管理を調整する営み。'},
    what:{en:'Construction organizes the work needed to create buildings and other substantial structures. Projects require designs, materials, tools, transport, and workers with different skills. People must coordinate tasks, provide supplies, and address problems during building. Roads, reservoirs, homes, and public buildings can support different social needs. Decisions about location and access affect who benefits from a project. Organizers may use paid work, shared obligations, or compulsory labor. Building at a large scale does not demonstrate a particular government by itself. We must examine how people organized and maintained the work.',ja:'建設は、建物や大きな構造物を作るための作業を調整する営みです。設計、材料、道具、運搬、異なる技能を持つ作業者が必要です。仕事の順序を決め、物資を供給し、工事中の問題に対応します。道路・貯水池・住宅・公共建築は、それぞれ異なる社会的な需要に応えます。場所や利用条件の決定によって、利益を得る人も変わります。労働の集め方には、報酬、共同体の義務、強制労働などがあります。大規模な建造物があるだけでは、特定の政府の存在は証明できません。作業をどう組織し、維持したかを調べる必要があります。'}
  },
  engineering: {
    summary:{en:'Applying technical knowledge to design, test, and maintain structures or connected systems.',ja:'技術の知識を使い、構造物やつながった仕組みを設計・試験・維持する営み。'},
    what:{en:'Engineering applies knowledge of materials, forces, and processes to practical problems. It can involve bridges, water systems, machines, earthworks, or other connected structures. Makers test ideas, learn from failures, and adapt designs to local conditions. Reliable systems need continuing inspection, repair, and people who understand their operation. Some projects involve specialists, while others draw on knowledge widely shared within a community. Engineering can expand possibilities but also create dependence on maintenance. Sophisticated technical systems need not require iron tools, wheeled vehicles, or a centralized state in every historical setting.',ja:'工学は、材料・力・工程についての知識を、実際の問題に応用する営みです。橋、水の管理、機械、土木施設など、つながった構造物を扱います。作り手は考えを試し、失敗から学び、地域の条件に合わせて設計を変えます。安定した仕組みには、点検・修理と、働き方を理解する人々が必要です。専門家が関わる事業も、共同体で共有された知識を使う事業もあります。工学は可能性を広げますが、維持管理への依存も生みます。歴史上、高度な技術体系に、鉄器・車両・中央集権の国家が常に必要だったわけではありません。'}
  },
  laws: {
    summary:{en:'Setting down legal rules that define obligations, penalties, and claims to authority.',ja:'義務・罰・権威に関する法の規則を書き定める営み。'},
    what:{en:'A code of laws sets down legal rules concerning property, debts, injury, or family relationships. Recording rules can make official claims more durable and visible. Interpreters and authorities still decide how rules apply and how disputes are handled. A written code does not prove that everyone knows, follows, or receives equal treatment under it. Rules may distinguish people by status, gender, or other categories. Legal traditions can also operate through custom and oral practice. We should examine who defines the rules, who enforces them, and who can challenge decisions.',ja:'法の成文化は、財産・借金・傷害・家族関係などについて、法の規則を書き定める営みです。記録することで、公的な主張が残りやすく、見える形になります。ただし、規則をどう適用し、争いをどう処理するかは、解釈する人や権力者が判断します。法典があっても、全員が内容を知り、守り、平等に扱われるとは限りません。地位・性別などによって扱いが異なる場合があります。法の伝統は、慣習や口頭の実践によっても成り立ちます。規則をだれが決め、執行し、判断に異議を唱えられるかを考える必要があります。'}
  },
  craft: {
    summary:{en:'Developing skilled production through practice, teaching, and access to materials.',ja:'練習・指導・材料の確保によって、専門的な生産の技能を発達させる営み。'},
    what:{en:'Craftsmanship develops skill in making objects such as textiles, vessels, tools, or ornaments. Learning involves practice, observation, and knowledge of materials and techniques. Makers may work within households, workshops, or wider networks of specialists. More specialized production can depend on others providing food and raw materials. Objects may meet everyday needs or communicate identity, wealth, and authority. Control of supplies and access to training can affect who becomes a maker. Craft knowledge can be shared, protected, or contested. It develops in many social arrangements, without requiring a written legal code.',ja:'手工業では、織物・容器・道具・装飾品などを作る技能を発達させます。学習には、練習、観察、材料や技法についての知識が必要です。作り手は、家庭、工房、専門家の広いネットワークで働くことがあります。専門化が進むと、食料や原材料をほかの人に供給してもらう必要も生まれます。品物は日常の需要を満たすだけでなく、集団の特徴、富、権威を表します。材料や訓練へのアクセスによって、だれが職人になれるかも変わります。技能は共有されることも、保護されることも、争われることもあります。手工業は多様な社会で発達し、法の成文化を必須としません。'}
  },
  trade: {
    summary:{en:'Maintaining exchanges of goods and knowledge between different communities or regions.',ja:'異なる共同体や地域の間で、物や知識を継続的に交換する営み。'},
    what:{en:'Foreign trade exchanges goods across community or regional boundaries. Exchange can involve direct transactions, intermediaries, gifts, or continuing relationships of obligation. Traders need transport, information about partners, and ways to negotiate value and access. Trade can provide scarce materials and connect communities with new knowledge. It may also make people dependent on routes or partners beyond their control. Those who manage exchange can gain wealth or influence. Contact can carry disease or conflict as well as benefits. Its effects depend on relationships and conditions rather than exchange alone.',ja:'外国貿易は、共同体や地域の境界を越えて物を交換する営みです。直接の取引、仲介、贈与、継続的な義務の関係など、さまざまな形があります。運搬、相手についての情報、価値や利用条件を交渉する方法が必要です。交易は不足する材料や新しい知識をもたらしますが、自分たちで管理できない航路や相手への依存も生みます。交換を管理する人が、富や影響力を得る場合があります。接触は利益だけでなく、病気や対立をもたらすこともあります。その結果は、交換そのものだけではなく、関係や状況によって変わります。'}
  },
  tradition: {
    summary:{en:'Passing on collective practices, values, and memories associated with armed conflict.',ja:'武力による対立に関わる習慣・価値観・記憶を、集団で伝える営み。'},
    what:{en:'Military tradition transmits practices, values, and memories associated with armed conflict. Stories, ceremonies, expectations of service, and recognized skills can shape how people understand fighting. These traditions may support defense, strengthen group identity, or justify expansion. Their meanings can differ for fighters, rulers, families, and communities facing attack. Maintaining a tradition requires teaching and social recognition rather than weapons alone. It may give particular groups prestige or obligations unavailable to others. A tradition does not tell us whether warfare is inevitable, or whether all members support the same military goals.',ja:'軍事伝統は、武力による対立に関わる習慣・価値観・記憶を伝えます。物語、儀礼、従軍への期待、認められた技能が、戦いの理解を形づくります。防衛を支え、集団の一体感を強め、領土拡大を正当化する場合もあります。その意味は、戦う人、支配者、家族、攻撃される集団によって異なります。伝統の維持には、武器だけでなく、指導や社会的な承認が必要です。特定の集団に名誉や義務を与えることもあります。ただし、軍事伝統があるだけで戦争が不可避になるわけではなく、全員が同じ軍事目標を支持するとも限りません。'}
  },
  workforce: {
    summary:{en:'Using state institutions to organize workers, supplies, and continuing administrative tasks.',ja:'国家の組織を使い、労働者・物資・継続的な管理の仕事を調整する仕組み。'},
    what:{en:'A state workforce organizes labor and supplies through institutions connected to a governing authority. Officials may record obligations, assign tasks, collect resources, and oversee construction or maintenance. Workers can participate through payment, public duties, or coercion. Such organization may support projects beyond the capacity of individual households. It can also concentrate decisions and impose unequal burdens. Administrative ability depends on information, cooperation, and arrangements for provisioning workers. Large collective projects can exist without this particular institution. We therefore need evidence of state organization rather than assuming it from a structure’s size.',ja:'官吏組織は、統治権力と結びつく制度を通して、労働や物資を調整します。役人は義務を記録し、仕事を割り当て、資源を集め、建設や維持管理を監督します。参加の形には、報酬、公的な義務、強制があります。こうした組織は、一つの世帯ではできない事業を支えますが、判断の集中や不均等な負担も生みます。管理の能力には、情報、協力、作業者への物資供給が必要です。大規模な共同事業は、この制度がなくても成立する場合があります。建造物の大きさから推測するだけでなく、国家による組織化の証拠を調べる必要があります。'}
  },
  empire: {
    summary:{en:'Extending political control over different territories and communities from a dominant center.',ja:'有力な中心から、異なる土地や共同体へ政治的な支配を広げる仕組み。'},
    what:{en:'An empire extends political control over different territories and communities from a dominant center. Control may involve military force, tribute, officials, alliances, or negotiated relationships with local leaders. The center needs ways to communicate, gather resources, and manage resistance across distance. Empires can connect markets and spread practices, while also imposing demands and unequal status. People within them may experience rule very differently. Political control is rarely uniform or secure everywhere. Expansion raises questions about whose interests shape policy, who supplies resources, and how subordinate communities respond.',ja:'帝国は、有力な中心から異なる土地や共同体へ政治的な支配を広げる仕組みです。軍事力、貢納、役人、同盟、地域の指導者との交渉などを通して支配します。中心には、遠距離の連絡、資源の収集、抵抗への対応が必要です。帝国は市場や習慣を結びつける一方、人々に要求や不平等な地位を課す場合もあります。同じ帝国内でも、支配の経験は集団ごとに異なります。政治的な統制は、どこでも均一で安定しているとは限りません。政策がだれの利益を優先し、だれが資源を提供し、従属する共同体がどう対応するかを考える必要があります。'}
  },
  mysticism: {
    summary:{en:'Seeking direct experience of sacred reality through practices interpreted within particular traditions.',ja:'特定の伝統の中で理解される実践を通して、聖なるものを直接経験しようとする営み。'},
    what:{en:'Mysticism concerns experiences understood as direct contact with sacred or ultimate reality. Practices may include contemplation, prayer, disciplined attention, or other activities within particular traditions. Their meanings depend on the community and cannot be reduced to a single universal belief. People may learn practices from others and debate the authority of reported experiences. Mysticism is not simply another name for all rituals or for specialist religious leaders. Consider how such practices might influence shared meanings, personal commitments, or authority, without assuming every society organizes them in the same way.',ja:'神秘主義は、聖なるものや究極の実在との直接的な接触として理解される経験に関わります。特定の伝統の中で、瞑想、祈り、注意を集中させる訓練などが行われることがあります。その意味は共同体によって異なり、一つの普遍的な信仰にはまとめられません。人々は実践を学び、経験の語りにどのような権威があるかを議論する場合もあります。神秘主義は、すべての儀礼や宗教指導者の別名ではありません。共有の意味、個人の責任感、権威にどう影響するかを考えましょう。どの社会も同じ形で組織するとは限りません。'}
  },
  games: {
    summary:{en:'Organizing play, competition, and leisure through shared practices and agreed rules.',ja:'共有の習慣やルールを通して、遊び・競争・余暇の活動を行う営み。'},
    what:{en:'Games and recreation include activities people undertake for enjoyment, competition, sociability, or other shared purposes. Participants may need agreed rules, equipment, spaces, and time away from other work. Activities can teach skills, create relationships, or reinforce identities. They can also mark differences in status or exclude people from participation. Organizers decide who may join and how disputes are settled. Festivals and competitions may overlap with political or religious occasions. Recreation is part of social life, but its effects depend on access, meanings, and the arrangements that sustain it.',ja:'娯楽と遊戯には、楽しみ、競争、交流などの共有の目的で行う活動が含まれます。ルール、道具、場所、ほかの仕事を離れる時間が必要な場合があります。技能を教え、人間関係や集団の一体感を作ることもありますが、地位の違いを示したり、参加できない人を生んだりする場合もあります。主催者は、だれが参加できるか、争いをどう解決するかを決めます。祭りや競技は、政治や宗教の行事と重なることもあります。娯楽は社会生活の一部ですが、その結果は、参加の機会、意味、活動を支える仕組みによって変わります。'}
  },
  philosophy: {
    summary:{en:'Examining authority, justice, obligations, and the organization of collective decisions.',ja:'権威・公正・義務・共同の決定の仕組みについて考える営み。'},
    what:{en:'Political philosophy examines questions about authority, justice, obligations, and collective decisions. People may ask who should govern, what makes rule legitimate, and how leaders should be held accountable. Discussion can draw on experience, argument, stories, or established traditions. It may challenge existing arrangements or defend them. The ability to participate depends on social conditions and access to debate. Political ideas do not automatically produce the institutions they propose. Their influence depends on supporters, opponents, and opportunities to act. Reflection on power can occur without an empire or a state workforce.',ja:'政治哲学は、権威・公正・義務・共同の決定について考える営みです。だれが統治すべきか、支配を正当と認める根拠は何か、指導者の責任をどう問うかを考えます。経験、議論、物語、伝統などが考察の材料になります。既存の仕組みを批判する場合も、支持する場合もあります。議論に参加できるかは、社会の条件や機会に左右されます。政治の考えが生まれても、提案した制度が自動的に実現するわけではありません。支持者、反対者、行動の機会が影響します。権力についての考察は、帝国や官吏組織がなくても可能です。'}
  },
  poetry: {
    summary:{en:'Using performance and carefully shaped language to communicate experiences, memories, and ideas.',ja:'演技や工夫された言葉を使い、経験・記憶・考えを伝える営み。'},
    what:{en:'Drama and poetry shape language, performance, and sometimes music to communicate experiences and ideas. They can preserve memories, explore moral questions, entertain audiences, or challenge authority. Performers need skills, practice, and occasions where others can listen or watch. Works may circulate orally, through writing, or through repeated performance. Patrons and audiences can influence what is expressed and whose experiences receive attention. Different groups may interpret the same work differently. These arts do not require an empire; their forms and social roles develop within many kinds of communities.',ja:'演劇と詩は、言葉、演技、時には音楽を工夫して、経験や考えを伝えます。記憶を残し、道徳的な問いを考え、観客を楽しませ、権威を批判することもあります。演じる人には技能と練習が必要で、聞いたり見たりする機会も必要です。作品は口頭、文字、繰り返しの上演によって伝わります。支援者や観客が、何を表現し、だれの経験を取り上げるかに影響します。同じ作品でも、集団によって解釈が異なる場合があります。こうした芸術に帝国は必須ではありません。さまざまな共同体の中で、異なる形と役割が発達します。'}
  },
  training: {
    summary:{en:'Developing coordinated fighting skills through organized practice, instruction, and provisioning.',ja:'組織的な練習・指導・物資供給によって、協調して戦う技能を育てる営み。'},
    what:{en:'Military training develops skills and coordination for organized armed activity. Training can involve handling weapons, moving together, following signals, and preparing for particular conditions. Participants need time, instructors, equipment, and continuing supplies. Regular practice may improve cooperation, but it also requires resources diverted from other work. Leaders decide who is trained and what duties they owe. Trained forces may protect communities or strengthen a ruler’s power over them. Understanding this development requires examining recruitment, discipline, and purpose rather than assuming that greater fighting ability benefits everyone equally.',ja:'軍事訓練は、組織的な武装活動のために、技能と協調を育てる営みです。武器の扱い、集団での移動、合図への対応、特定の環境への準備などを練習します。時間、指導者、装備、継続的な物資が必要です。練習は協力を高めますが、ほかの仕事に使える資源も消費します。指導者は、だれを訓練し、どんな義務を負わせるかを決めます。訓練された部隊は共同体を守る場合も、支配者が人々を統制する力を強める場合もあります。戦う力が全員に同じ利益を与えると考えず、募集、規律、目的を調べる必要があります。'}
  },
  defense: {
    summary:{en:'Planning how people, positions, and structures work together to protect a community.',ja:'人・場所・施設をどう組み合わせて共同体を守るかを計画する営み。'},
    what:{en:'Defensive tactics plan how people and positions work together to resist threats. Plans may use terrain, warning systems, fortified places, movement, or negotiated access to routes. Communities need information about threats and ways to communicate during uncertainty. Defenses require training and sometimes construction or continuing maintenance. They can reduce danger for some people while shifting risk toward others. Deciding what to protect reveals priorities about land, supplies, and populations. Effective defense involves organization and judgment, rather than simply possessing a wall or following one fixed historical sequence.',ja:'防御戦術は、人と場所を組み合わせて脅威に対応する計画です。地形、警報、防御施設、移動、道を使う条件の交渉などを利用する場合があります。脅威についての情報と、不確かな状況で連絡する方法が必要です。訓練のほか、建設や継続的な維持管理が必要になることもあります。ある人々の危険を減らす一方、別の人々へ危険を移す場合もあります。何を守るかという決定には、土地、物資、人々についての優先順位が表れます。効果的な防衛には、壁だけでなく組織と判断が必要です。一つの決まった歴史の順序があるわけではありません。'}
  },
  history: {
    summary:{en:'Preserving and interpreting accounts of the past, including their purposes and viewpoints.',ja:'過去についての記録を残し、その目的や視点を考えて解釈する営み。'},
    what:{en:'Recorded history preserves accounts of the past in forms that others can revisit. These can include written narratives, inscriptions, lists, images, or other deliberate records. Communities also preserve historical knowledge through oral traditions and material practices. Creating an account involves choosing events, sources, and ways to explain them. Authors and institutions may use the past to support identity or authority. Surviving records need comparison and interpretation rather than automatic acceptance. We should ask whose experience is described, what evidence supports it, and which perspectives are difficult to recover.',ja:'記録された歴史は、他の人が後から確かめられる形で、過去についての説明を残します。文章、碑文、一覧、画像などの意図的な記録があります。共同体は、口承や物を使う実践によっても歴史の知識を伝えます。記録を作るときには、出来事、資料、説明の仕方が選ばれます。著者や組織は、集団の一体感や権威を支えるために過去を用いる場合もあります。残った記録は、そのまま信じるのではなく、比較し、解釈する必要があります。だれの経験が説明され、どんな証拠があり、どの視点を取り戻しにくいかを問いましょう。'}
  },
  theology: {
    summary:{en:'Examining and explaining religious ideas, including sacred authority, meaning, and obligations.',ja:'聖なる権威・意味・義務など、宗教の考えを検討し説明する営み。'},
    what:{en:'Theology examines and explains religious ideas, including questions about sacred reality, obligations, and the meaning of human life. Its forms vary between traditions, and not every society uses this category. People may interpret inherited teachings, debate disagreements, or connect beliefs with ethical expectations. Teaching can involve oral discussion, commentary, or written texts. Theology is an activity of reflection, rather than a belief such as honoring ancestors or worshipping one deity. It also differs from organizing religious offices. Its relationship with authority depends on who interprets teachings and how others respond.',ja:'神学は、聖なる実在、義務、人間の生の意味など、宗教の考えを検討し説明する営みです。その形は伝統によって異なり、どの社会にも同じ分類があるわけではありません。受け継いだ教えを解釈し、意見の違いを議論し、信仰と倫理的な期待を結びつける場合があります。教える方法には、口頭の議論、解説、文章があります。神学は考察の活動であり、祖先を敬うことや一つの神を信じることのような信仰内容そのものではありません。宗教上の役職を組織することとも区別されます。権威との関係は、だれが教えを解釈し、人々がどう応じるかによって変わります。'}
  }
};
for (const card of [...tech, ...civic]) Object.assign(card, developmentReadings[card.id]);

export const trees = { tech, civic };
export const treeIds = ['tech','civic'];
export const cardById = Object.fromEntries([...tech, ...civic].map(card => [card.id, card]));
export const treeOf = id => tech.some(card => card.id === id) ? 'tech' : civic.some(card => card.id === id) ? 'civic' : '';
// Cards that list this one as an arrow parent.
export const childrenOf = id => [...tech, ...civic].filter(card => card.parents.includes(id));

// One dependency rule serves the engine, tree view, removal cascades and event gains.
export const missingParents = (chosen, id) => Object.hasOwn(cardById,id) ? cardById[id].parents.filter(parent => !chosen.includes(parent)) : [];
export const parentsMet = (chosen, id) => Object.hasOwn(cardById,id) && missingParents(chosen,id).length === 0;
export function prerequisiteIds(id) {
  const ancestors = new Set();
  const visit = current => { for (const parent of cardById[current]?.parents ?? []) if (!ancestors.has(parent)) { ancestors.add(parent); visit(parent); } };
  visit(id);
  return [...ancestors];
}
