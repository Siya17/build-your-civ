// Selected academic vocabulary, disciplinary concepts and unfamiliar names.
// Region text marks them as [[id|shown text]]. `popup[lang]` controls whether a
// marked term opens support; elementary wording renders as normal text.
// `img` (optional) is a path under /assets/regions/.
import { tech, civic } from './cards.js';
export const glossary = {
  plateau:{ en:['plateau','A large area of flat land, high above the sea.'], ja:['{高原|こうげん}','海から高い場所にある、広く平らな土地。'] },
  granite:{ en:['granite','A very hard grey or pink rock. It is good for building.'], ja:['{花崗岩|かこうがん}','とてもかたい、灰色やピンク色の岩。建物に向いています。'], img:'A/granite.webp' },
  tsetse:{ en:['tsetse fly','An African fly. Its bite carries a disease that kills cattle and horses.'], ja:['ツェツェバエ','アフリカのハエ。かまれると、牛や馬が死ぬ病気がうつります。'] },
  mortar:{ en:['mortar','A wet mix of sand, lime or mud. It holds stones or bricks together.'], ja:['モルタル','砂・{石灰|せっかい}・泥などをまぜたもの。石やれんがをくっつけます。'] },
  mediterranean:{ en:['Mediterranean climate','A climate with hot, dry summers and mild, wet winters.'], ja:['{地中海性気候|ちちゅうかいせいきこう}','夏は暑くかわいていて、冬はおだやかで雨が多い気候。'] },
  marble:{ en:['marble','A smooth, beautiful stone, often white. It is used for buildings and statues.'], ja:['{大理石|だいりせき}','白いことが多い、なめらかで美しい石。建物や{像|ぞう}に使われます。'], img:'B/marble.webp' },
  citystate:{ en:['city-state','A city that rules itself and the land around it, like a small country.'], ja:['{都市国家|としこっか}','一つの都市とそのまわりの土地が、小さな国のように自分たちで{治|おさ}めるもの。'] },
  wetland:{ en:['wetland','Low land that is wet for most of the year, such as a marsh or a shallow lake.'], ja:['{湿地|しっち}','一年の大半が水でしめっている、低い土地。ぬまや浅い湖など。'] },
  salt:{ en:['salt in the soil','When water dries up on a field, salt stays in the soil. Too much salt kills crops.'], ja:['{塩害|えんがい}','畑の水が{蒸発|じょうはつ}すると、塩が土にのこります。塩が多すぎると作物がかれます。'] },
  cuneiform:{ en:['cuneiform','Writing made by pressing a cut reed into wet clay. The marks look like small wedges.'], ja:['{楔形|くさびがた}文字','葦のペンをぬれた{粘土|ねんど}に押しつけて書く文字。くさびのような形です。'], img:'C/reveal-2.webp' },
  ziggurat:{ en:['ziggurat','A huge stepped platform of mud bricks, with a temple on top.'], ja:['ジッグラト','日干しれんがを階段のように積んだ大きな台。上に神殿がありました。'], img:'C/reveal-1.webp' },
  monsoon:{ en:['monsoon','A seasonal wind. It brings a very rainy season and a dry season.'], ja:['モンスーン','季節によって向きが変わる風。雨の多い季節と、かわいた季節をもたらします。'] },
  carnelian:{ en:['carnelian','A red-orange stone. People polish it to make beads.'], ja:['カーネリアン','赤やオレンジ色の石。みがいてビーズにします。'], img:'D/carnelian.webp' },
  reservoir:{ en:['reservoir','A large pond or lake that people make to store water.'], ja:['{貯水池|ちょすいち}','水をためるために人がつくった、大きな池や湖。'] },
  loess:{ en:['loess','Very fine yellow soil, carried by the wind. It is rich and easy to dig.'], ja:['{黄土|おうど}','風で運ばれた、とても細かい黄色い土。{栄養|えいよう}が多く、{掘|ほ}りやすいです。'] },
  oraclebone:{ en:['oracle bone','An animal bone or turtle shell used to ask the ancestors a question. The question and answer were carved on it.'], ja:['{甲骨|こうこつ}','{祖先|そせん}に質問するために使った、動物の骨やカメの{甲羅|こうら}。質問と答えがきざまれました。'], img:'F/reveal-2.webp' },
  silt:{ en:['silt','Fine, rich mud that a river leaves on the land after a flood.'], ja:['{肥沃|ひよく}な泥','洪水のあと、川が土地にのこす、細かく栄養の多い泥。'], img:'G/silt.webp' },
  pharaoh:{ en:['pharaoh','The title of the kings of ancient Egypt.'], ja:['ファラオ','古代エジプトの王のよび名。'] },
  lava:{ en:['lava','Hot, melted rock that comes out of a volcano. It becomes hard stone when it cools.'], ja:['{溶岩|ようがん}','火山から出る、とけた熱い岩。冷えると、かたい石になります。'], img:'H/stone.webp' },
  obsidian:{ en:['obsidian','Black volcanic glass. Its broken edges are sharper than steel.'], ja:['{黒曜石|こくようせき}','火山でできた黒いガラス。割れたところは、鉄より{鋭|するど}くなります。'], img:'I/obsidian.webp' },
  elnino:{ en:['El Niño','Every few years, the Pacific Ocean becomes warmer. It brings heavy rain to some places and drought to others.'], ja:['エルニーニョ','数年に一度、太平洋の海があたたかくなること。大雨になる場所や、{干|かん}ばつになる場所が出ます。'] },
  khipu:{ en:['khipu','A group of knotted strings. The Inca used the type and place of each knot to record numbers and information.'], ja:['キープ','結び目のついたひもの束。インカは、結び目の種類と位置で、数や情報を記録しました。'], img:'J/reveal-2.webp' },
  icesheet:{ en:['ice sheet','A huge, thick layer of ice that covers land for thousands of years.'], ja:['{氷床|ひょうしょう}','何千年も陸をおおっている、とても大きく厚い氷。'] },
  fjord:{ en:['fjord','A long, narrow arm of the sea between high cliffs. Glaciers made it.'], ja:['フィヨルド','高いがけにはさまれた、細長い入り江。{氷河|ひょうが}がけずってできました。'] },
  resilience:{ en:['resilience','The ability to absorb a shock and continue essential activities, sometimes by changing how a system works.'], ja:['回復力','危機を受け止め、必要な活動を続ける力。以前の状態に戻るだけでなく、しくみを変える場合もあります。'], category:'academic' },
  causation:{ en:['causal mechanism','The process linking a cause to an outcome. A sequence of events alone does not establish that process.'], ja:['因果のしくみ','原因が結果につながる過程。出来事が順番に起きただけでは、その過程が確かめられたことにはなりません。'], category:'academic' },
  coordination:{ en:['coordination problem','A situation where people need compatible actions, but reaching or maintaining agreement is difficult.'], ja:['協力を調整する課題','人々の行動をそろえる必要があるのに、合意を作ったり守ったりすることが難しい状況。'], category:'academic' },
  tradeoff:{ en:['tradeoff','Improving one objective can make another harder to achieve. Identify both objectives and who experiences the cost.'], ja:['トレードオフ','一つの目標を優先すると、別の目標が達成しにくくなる関係。目標と負担する人を区別します。'], category:'academic' },
  coercion:{ en:['coercion','Making people act through force or threats, rather than agreement freely given.'], ja:['強制','自由な合意ではなく、力や脅しによって人に行動させること。'], category:'academic' },
  opportunitycost:{ en:['opportunity cost','The benefit of the best feasible alternative you give up when making a choice.'], ja:['機会費用','ある選択によって失う、実現可能な最良の別案の利益。'], category:'academic' },
  contingency:{ en:['historical contingency','Outcomes depend on particular circumstances and sequences. Different choices or encounters could have produced another path.'], ja:['歴史の偶有性','結果が個別の状況や出来事の順序に左右されること。別の選択や出会いなら、別の道もありえました。'], category:'academic' },
  legitimacy:{ en:['legitimacy','Recognition that authority or a rule is acceptable or justified. This differs from simply having the force to impose it.'], ja:['正当性','権威や規則を受け入れられる、または正しいと認めること。力で従わせる能力とは区別します。'], category:'academic' },
  distribution:{ en:['distributional effects','How benefits, burdens and risks fall on different groups, rather than on society as a single unit.'], ja:['分配への影響','利益・負担・リスクが各集団にどう及ぶか。社会全体を一つとして扱うだけでは見えない違いです。'], category:'academic' },
  counterfactual:{ en:['counterfactual','A reasoned alternative to what happened. Keep relevant conditions fixed and explain what change could alter the outcome.'], ja:['反実仮想','実際と異なる展開を、理由を示して考える方法。関係する条件を固定し、何を変えると結果が変わるか説明します。'], category:'academic' },
  institution:{ en:['institution','Durable rules, roles and practices that organize social relationships. An institution need not be a building or a state.'], ja:['制度','社会の関係を組織する、継続的な規則・役割・慣行。建物や国家だけを指すわけではありません。'], category:'academic' },
  specialization:{ en:['specialization','Concentrating work or knowledge in particular roles. It can improve skills while increasing dependence on other people.'], ja:['専門化','特定の役割に仕事や知識を集中させること。技能が高まる一方、他者への依存も増える場合があります。'], category:'academic' },
  surplus:{ en:['surplus','Production beyond immediate consumption needs. Its storage and control can shape cooperation and inequality.'], ja:['余剰','すぐに消費する必要を超えた生産物。だれが保管し管理するかが、協力や不平等に関わります。'], category:'academic' },
  maintenance:{ en:['maintenance','Recurring work needed to keep a system functioning, beyond the effort of constructing it.'], ja:['維持管理','しくみを動かし続けるための、くり返し必要な作業。最初に建設する労力とは別に必要です。'], category:'academic' },
  aquaculture:{ en:['aquaculture','Managing aquatic environments to cultivate or harvest fish and other organisms; practices vary across societies and periods.'], ja:['水産養殖','魚などを育てたり収穫したりするために、水の環境を管理すること。方法は社会や時代によって異なります。'], category:'technical' },
  vulnerability:{ en:['vulnerability','Exposure to harm and limited ability to respond. Different groups can be vulnerable to the same shock in different ways.'], ja:['脆弱性','被害を受けやすく、対応する力が限られていること。同じ危機でも、集団によって弱点は異なります。'], category:'academic' }
};

// This is an editorial support selection (roughly B2–C2 / N2–N1), not a claim
// that CEFR or JLPT certifies an exact level for every disciplinary term.
for (const entry of Object.values(glossary)) {
  entry.category ??= 'technical';
  entry.popup = { en:true, ja:true };
}
// Card-detail headings can support unfamiliar disciplinary names. Basic card
// names remain plain even though their descriptions are available in the detail.
const elementary = new Set(['writing','sailing','wheel','math','games']);
for (const card of [...tech, ...civic]) glossary[card.id] ??= {
  en:[card.en, card.what.en], ja:[card.ja, card.what.ja], category:'technical',
  popup:{ en:!elementary.has(card.id), ja:!elementary.has(card.id) }
};

const names = {
  greatzimbabwe:{ en:['Great Zimbabwe','A Shona urban and political centre in southern Africa, built between the eleventh and fifteenth centuries.'], ja:['グレート・ジンバブエ','アフリカ南部にある、11〜15世紀のショナの都市・政治の中心。'] },
  minoan:{ en:['Minoan','Bronze Age communities on Crete, known from archaeological sites such as Knossos and their Mediterranean connections.'], ja:['ミノア','クノッソスなどの遺跡と地中海の交流から知られる、青銅器時代のクレタ島の社会。'] },
  sumer:{ en:['Sumer','The southern Mesopotamian region where cities such as Uruk developed; it was not one permanent unified state.'], ja:['シュメール','ウルクなどの都市が発達したメソポタミア南部の地域。つねに一つの統一国家だったわけではありません。'] },
  harappan:{ en:['Harappan','A name for the Indus civilization, derived from the archaeological site of Harappa.'], ja:['ハラッパー','遺跡ハラッパーに由来する、インダス文明の名称。'] },
  khmer:{ en:['Khmer','The people and language associated with the Angkor kingdoms and present-day Cambodia.'], ja:['クメール','アンコールの諸王国と現在のカンボジアに関わる人々・言語の名称。'] },
  shang:{ en:['Shang','A Bronze Age dynasty in China. Its late capital at Anyang preserves royal tombs, workshops and oracle-bone records.'], ja:['殷（商）','中国の青銅器時代の王朝。後期の都である安陽には、王墓・工房・甲骨の記録が残ります。'] },
  gunditjmara:{ en:['Gunditjmara','The Aboriginal people whose Country includes Budj Bim; their knowledge and relationships with this landscape continue today.'], ja:['グンディッジマラ','バッジ・ビムを含む土地の先住民。土地に関する知識と関係は、現在も続いています。'] },
  teotihuacan:{ en:['Teotihuacan','A large ancient city in central Mexico, distinct from the Maya and from the much later Aztec empire.'], ja:['テオティワカン','メキシコ中部の大きな古代都市。マヤや、ずっと後のアステカ帝国とは区別します。'] },
  caral:{ en:['Caral','An early urban and ceremonial centre in the Supe Valley of Peru, thousands of years before the Inca empire.'], ja:['カラル','ペルーのスーペ渓谷にある、初期の都市・儀礼の中心。インカ帝国より数千年早い時代です。'] },
  norse:{ en:['Norse','Medieval Scandinavian-speaking communities, including settlers who established farms in southern Greenland.'], ja:['ノルド人','中世のスカンディナヴィアの言語を使う人々。グリーンランド南部に農場を築いた移住者も含みます。'] },
  thule:{ en:['Thule','An archaeological label for ancestors of Inuit communities; their Arctic technologies and settlement histories differed from Norse farming.'], ja:['チューレ','イヌイットの祖先に関する考古学上の名称。北極の技術と居住の歴史は、ノルド人の農業とは異なります。'] }
};
for (const [id, entry] of Object.entries(names)) glossary[id] = { ...entry, category:'name', popup:{en:true,ja:true} };
