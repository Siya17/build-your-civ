// A–K are approximate broad areas on the supplied classroom map, not precise sites.
// Fact text is deliberately limited to physical geography; artwork is imaginative.
export const locations = {
  A:{region:{en:'Central African forest region',ja:'中央アフリカの森林地帯'},scene:'forest',facts:{en:['The Congo Basin contains a vast tropical rainforest.','Dense vegetation and waterways shape travel.','Consider how a river could help and complicate movement.'],ja:['コンゴ盆地には広大な熱帯雨林があります。','密な植生と水路は移動に影響します。','川が移動を助ける点と難しくする点を考えよう。']},source:'https://science.nasa.gov/earth/earth-observatory/reshaping-the-forests-around-kisangani-154817/'},
  B:{region:{en:'Western Mediterranean coast',ja:'西地中海沿岸'},scene:'coast',facts:{en:['Sea, mountains, and coastal valleys lie close together.','The northern Moroccan coast is greener than the inland desert.','Consider how coastlines might connect communities.'],ja:['海・山・沿岸の谷が近接しています。','モロッコ北部の海岸は内陸の砂漠より緑が豊かです。','海岸線が地域同士をどう結ぶか考えよう。']},source:'https://science.nasa.gov/earth/earth-observatory/where-europe-meets-africa-5360/'},
  C:{region:{en:'Eastern Mediterranean and Anatolia',ja:'東地中海とアナトリア'},scene:'plateau',facts:{en:['The region includes a high plateau, steppes, and mountains.','Routes across uplands can differ from coastal routes.','Consider how terrain might shape travel.'],ja:['この地域には高原、草原、山地があります。','高地を通る道と海岸の道は異なります。','地形が移動にどう影響するか考えよう。']},source:'https://science.nasa.gov/earth/earth-observatory/goreme-national-park-turkey-38876/'},
  D:{region:{en:'Arabian Peninsula',ja:'アラビア半島'},scene:'dunes',facts:{en:['Parts of the peninsula contain extensive sand dunes.','Rain is scarce across the Empty Quarter.','Consider how routes and water access might matter.'],ja:['半島の一部には広大な砂丘があります。','ルブアルハリ砂漠では雨が少ないです。','道と水へのアクセスがどう重要になるか考えよう。']},source:'https://science.nasa.gov/earth/earth-observatory/ar-rub-al-khali-sand-sea-arabian-peninsula-50744/'},
  E:{region:{en:'South Asian river plains',ja:'南アジアの河川平野'},scene:'plain',facts:{en:['Large rivers cross broad, flat plains.','Seasonal monsoon rain can replenish water and cause floods.','Consider how a community might prepare for both.'],ja:['大きな川が広く平らな平野を流れます。','季節風の雨は水を補う一方、洪水も起こします。','その両方にどう備えるか考えよう。']},source:'https://science.nasa.gov/earth/earth-observatory/monsoon-floods-inundate-eastern-india-7944/'},
  F:{region:{en:'Central Asian steppe and desert',ja:'中央アジアの草原と砂漠'},scene:'steppe',facts:{en:['Grass-covered plateaus and dry deserts occur across this broad region.','Wind can lift dust from sparsely vegetated land.','Consider water and travel across open terrain.'],ja:['この広い地域には草に覆われた高原と乾燥した砂漠があります。','植生の少ない土地では風が砂ぼこりを巻き上げます。','開けた地形での水と移動を考えよう。']},source:'https://science.nasa.gov/earth/earth-observatory/mongolia-1559/'},
  G:{region:{en:'Sahel grassland region',ja:'サヘルの草原地帯'},scene:'savanna',facts:{en:['Grasslands lie between the Sahara and wetter forests.','Rainfall varies strongly by season and year.','Consider ways to handle uncertain water supplies.'],ja:['草原はサハラ砂漠と湿った森林の間にあります。','降雨量は季節や年によって大きく変わります。','不安定な水の供給にどう対応するか考えよう。']},source:'https://science.nasa.gov/earth/earth-observatory/vegetation-and-rainfall-in-the-sahel-7277/'},
  H:{region:{en:'Northern Australia',ja:'オーストラリア北部'},scene:'outback',facts:{en:['Northern coasts receive seasonal monsoon rain.','Rainfall often decreases toward the continental interior.','Consider how wet and dry seasons affect travel.'],ja:['北部の海岸には季節風による雨が降ります。','降雨量は大陸の内陸へ向かうほど少なくなりがちです。','雨季と乾季が移動にどう影響するか考えよう。']},source:'https://science.nasa.gov/earth/earth-observatory/wunthurru-heavy-rains-in-northern-australia-3130/'},
  I:{region:{en:'Western North American mountains',ja:'北アメリカ西部の山地'},scene:'cascades',facts:{en:['Coast, mountains, and dry interior can lie close together.','Mountains can create a rain shadow.','Consider how crossing a range changes access to water.'],ja:['海岸、山地、乾燥した内陸部が近接することがあります。','山脈は雨陰を作ることがあります。','山を越えると水へのアクセスがどう変わるか考えよう。']},source:'https://science.nasa.gov/earth/earth-observatory/oregon-rain-shadow-79247/'},
  J:{region:{en:'Andes and Pacific coast',ja:'アンデス山脈と太平洋岸'},scene:'andes',facts:{en:['High Andes rise near a dry Pacific coast.','Ocean clouds can meet the coastal desert.','Consider routes between shore and mountain valleys.'],ja:['高いアンデス山脈が乾燥した太平洋岸の近くにそびえます。','海からの雲が海岸砂漠に接することがあります。','海岸と山の谷を結ぶ道を考えよう。']},source:'https://science.nasa.gov/earth/earth-observatory/ocean-clouds-meet-peru-83796/'},
  K:{region:{en:'Greenland and Arctic coast',ja:'グリーンランドと北極圏の海岸'},scene:'ice',facts:{en:['A vast ice sheet covers much of Greenland.','Coastal areas include fjords and steep changes in elevation.','Consider how ice and sea routes affect travel.'],ja:['グリーンランドの大部分を広大な氷床が覆います。','沿岸にはフィヨルドと急な高低差があります。','氷と海路が移動にどう影響するか考えよう。']},source:'https://science.nasa.gov/earth/earth-observatory/topography-of-greenland-5118/'}
};

// Fictional people around 3000 BCE in rough hide or plant-fiber wraps. These
// interpretations do not identify a named culture or historical population.
export const characters = {
  A:{en:'Forest community',ja:'森の共同体'},B:{en:'Coastal community',ja:'海岸の共同体'},
  C:{en:'Highland community',ja:'高地の共同体'},D:{en:'Desert community',ja:'砂漠の共同体'},
  E:{en:'River community',ja:'川の共同体'},F:{en:'Steppe community',ja:'草原の共同体'},
  G:{en:'Grassland community',ja:'サヘルの共同体'},H:{en:'Monsoon coast community',ja:'北部海岸の共同体'},
  I:{en:'Mountain community',ja:'山地の共同体'},J:{en:'Andean community',ja:'アンデスの共同体'},
  K:{en:'Arctic community',ja:'北極圏の共同体'}
};

export const outcomes = {
  steward:{title:{en:'Protect what you have',ja:'今あるものを守る'},benefit:{en:'Careful storage can help a community face uncertainty.',ja:'丁寧な保存は不安定な時期への備えになります。'},tradeoff:{en:'Staying close to home may limit new connections.',ja:'近くにとどまると新しいつながりは少なくなるかもしれません。'}},
  explore:{title:{en:'Seek new connections',ja:'新しいつながりを探す'},benefit:{en:'Mapping routes can open paths to other places.',ja:'道を記録すると別の場所へ行きやすくなります。'},tradeoff:{en:'Travel takes time and can be uncertain.',ja:'移動には時間がかかり、不確実さもあります。'}},
  share:{title:{en:'Share the reserves',ja:'蓄えを分ける'},benefit:{en:'Neighbors may become partners in hard times.',ja:'困難な時に近隣の人々と協力できるかもしれません。'},tradeoff:{en:'Your own stores become smaller.',ja:'自分たちの蓄えは少なくなります。'}},
  reserve:{title:{en:'Keep local reserves',ja:'地域の蓄えを保つ'},benefit:{en:'Your community keeps supplies for future needs.',ja:'将来に備えて資源を残せます。'},tradeoff:{en:'Neighbors may receive less help.',ja:'近隣の人々に渡せる支援は少なくなります。'}},
  exchange:{title:{en:'Open an exchange route',ja:'交易路を開く'},benefit:{en:'Goods and ideas can move between communities.',ja:'物や考えが地域間を行き来できます。'},tradeoff:{en:'Agreements take work and may be unequal.',ja:'合意には努力が必要で、不平等も起こりえます。'}},
  guard:{title:{en:'Set rules for the route',ja:'道のルールを定める'},benefit:{en:'Clear rules can make journeys more predictable.',ja:'明確なルールは移動を予測しやすくします。'},tradeoff:{en:'Rules may restrict who can travel.',ja:'ルールによって移動できる人が限られるかもしれません。'}}
};
