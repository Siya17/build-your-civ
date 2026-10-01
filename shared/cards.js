// The two development trees from the Week 2 slides (adapted from Civilization VI).
// Arrows are `parents`: every chosen parent is required to unlock a card. `col`/`row` place each card
// where the slide draws it. Japanese names match the slide; {漢字|かな} adds furigana.
export const tech = [
  { id:'pottery', icon:'🏺', col:0, row:2, parents:[], en:'Pottery', ja:'{陶器|とうき}',
    what:{ en:'Pots made from clay and baked in a fire. People cook in them and keep food and water in them.', ja:'{粘土|ねんど}を焼いて作る入れ物です。料理をしたり、食べ物や水を入れておいたりできます。' } },
  { id:'husbandry', icon:'🐑', col:0, row:4, parents:[], en:'Animal Husbandry', ja:'{畜産|ちくさん}',
    what:{ en:'Keeping animals such as cattle, sheep or goats. They give meat, milk, wool and work.', ja:'牛・羊・ヤギなどの動物を育てます。肉・ミルク・毛・仕事の力が手に入ります。' } },
  { id:'mining', icon:'⛏️', col:0, row:6, parents:[], en:'Mining', ja:'{採鉱|さいこう}',
    what:{ en:'Digging useful stone and metal ore out of the ground.', ja:'地面から、役に立つ石や金属をふくむ{鉱石|こうせき}を{掘|ほ}り出します。' } },
  { id:'sailing', icon:'⛵', col:1, row:0, parents:['pottery'], en:'Sailing', ja:'{帆走|はんそう}',
    what:{ en:'Boats with sails. People travel and carry goods on rivers and along coasts.', ja:'{帆|ほ}のついた船です。川や海岸に沿って移動し、物を運びます。' } },
  { id:'astrology', icon:'☀️', col:1, row:1, parents:['pottery'], en:'Astrology', ja:'{占星術|せんせいじゅつ}',
    what:{ en:'Watching the sun, moon and stars to plan the year and to explain the world.', ja:'太陽・月・星を観察して、一年の予定を立てたり、世界を説明したりします。' } },
  { id:'irrigation', icon:'💧', col:1, row:2, parents:['pottery'], en:'Irrigation', ja:'{灌漑|かんがい}',
    what:{ en:'Canals and ditches that bring water to fields, so crops can grow.', ja:'水路を作って畑に水を引き、作物を育てます。' } },
  { id:'writing', icon:'✍️', col:1, row:3, parents:['pottery'], en:'Writing', ja:'{筆記|ひっき}',
    what:{ en:'Signs that record words, numbers and agreements, so they last.', ja:'言葉・数・約束を記号で書き残します。' } },
  { id:'archery', icon:'🏹', col:1, row:4, parents:['husbandry'], en:'Archery', ja:'{弓術|きゅうじゅつ}',
    what:{ en:'Bows and arrows for hunting and for defence.', ja:'弓と矢を使って、狩りをしたり、身を守ったりします。' } },
  { id:'bronze', icon:'⚒️', col:1, row:6, parents:['mining'], en:'Bronze Working', ja:'{青銅器|せいどうき}',
    what:{ en:'Melting copper and tin together to make strong tools and weapons.', ja:'銅とすずを{溶|と}かして混ぜ、{丈夫|じょうぶ}な道具や武器を作ります。' } },
  { id:'shipbuilding', icon:'🚢', col:2, row:0, parents:['sailing'], en:'Shipbuilding', ja:'{造船|ぞうせん}',
    what:{ en:'Large, strong ships for long trips across the open sea.', ja:'広い海を長く旅するための、大きくて丈夫な船を作ります。' } },
  { id:'navigation', icon:'⭐', col:2, row:1, parents:['sailing','astrology'], en:'Celestial Navigation', ja:'{天文航法|てんもんこうほう}',
    what:{ en:'Using the stars to find the way at sea, far from land.', ja:'陸が見えない海の上で、星を見て方向を知ります。' } },
  { id:'currency', icon:'🪙', col:2, row:2, parents:['writing'], en:'Currency', ja:'{通貨|つうか}',
    what:{ en:'Money: a thing of shared value that people use to buy and sell.', ja:'お金です。みんなが価値を認めるもので、物を売ったり買ったりします。' } },
  { id:'horseback', icon:'🐎', col:2, row:3, parents:['archery'], en:'Horseback Riding', ja:'{騎乗|きじょう}',
    what:{ en:'Riding horses to travel fast, carry news and hunt.', ja:'馬に乗って速く移動したり、知らせを運んだり、狩りをしたりします。' } },
  { id:'iron', icon:'🔩', col:2, row:4, parents:['bronze'], en:'Iron Working', ja:'{鉄器|てっき}',
    what:{ en:'Tools made of iron. Iron ore is common, so many people can own tools.', ja:'鉄で道具を作ります。鉄の鉱石は多いので、多くの人が道具を持てます。' } },
  { id:'masonry', icon:'🧱', col:2, row:6, parents:['mining'], en:'Masonry', ja:'{石工術|せっこうじゅつ}',
    what:{ en:'Cutting and fitting stone to build walls, houses and monuments.', ja:'石を切って組み合わせ、{壁|かべ}・家・記念の建物を作ります。' } },
  { id:'wheel', icon:'🛞', col:2, row:7, parents:['mining'], en:'Wheel', ja:'{車輪|しゃりん}',
    what:{ en:'Wheels for carts and for making pots. Carts move heavy loads on flat, open ground.', ja:'車輪のついた{荷車|にぐるま}で重い物を運んだり、ろくろで器を作ったりします。平らな土地で役に立ちます。' } },
  { id:'math', icon:'📐', col:3, row:2, parents:['currency'], en:'Mathematics', ja:'{数学|すうがく}',
    what:{ en:'Counting, measuring and calculating. It helps with land, trade, building and calendars.', ja:'数を数え、長さや広さを{測|はか}り、計算します。土地・交易・建築・{暦|こよみ}に役立ちます。' } },
  { id:'construction', icon:'🏛️', col:3, row:4, parents:['masonry','wheel'], en:'Construction', ja:'{建設|けんせつ}',
    what:{ en:'Planning big projects with many workers, such as walls, roads and temples.', ja:'たくさんの人で、{城壁|じょうへき}・道・神殿などの大きな工事を計画します。' } },
  { id:'engineering', icon:'⚙️', col:3, row:6, parents:['iron','wheel'], en:'Engineering', ja:'{工学|こうがく}',
    what:{ en:'Designing machines and large systems, such as bridges, water pipes and canals.', ja:'橋・水道・運河など、大きなしくみや機械を{設計|せっけい}します。' } }
];

export const civic = [
  { id:'laws', icon:'⚖️', col:0, row:4, parents:[], en:'Code of Laws', ja:'法律の{成文化|せいぶんか}',
    what:{ en:'Shared rules that everyone knows and follows.', ja:'みんなが知っていて、守るルールを決めます。' } },
  { id:'craft', icon:'🧵', col:1, row:2, parents:['laws'], en:'Craftsmanship', ja:'{手工業|しゅこうぎょう}',
    what:{ en:'Some people become skilled makers of cloth, pots, tools or jewellery.', ja:'布・器・道具・かざりを作る、{腕|うで}のいい{職人|しょくにん}が生まれます。' } },
  { id:'trade', icon:'🤝', col:1, row:6, parents:['laws'], en:'Foreign Trade', ja:'外国{貿易|ぼうえき}',
    what:{ en:'Exchanging goods with other peoples, near and far.', ja:'近くや遠くの人々と、物を交換します。' } },
  { id:'tradition', icon:'🛡️', col:2, row:0, parents:['craft'], en:'Military Tradition', ja:'{軍事|ぐんじ}{伝統|でんとう}',
    what:{ en:'A warrior culture with heroes, training and honour.', ja:'{戦士|せんし}の文化です。{英雄|えいゆう}・訓練・{名誉|めいよ}を大切にします。' } },
  { id:'workforce', icon:'👥', col:2, row:3, parents:['craft'], en:'State Workforce', ja:'{官吏|かんり}組織',
    what:{ en:'Officials organise workers, food and materials for big shared projects.', ja:'役人が、大きな共同作業のために、人・食べ物・材料をまとめます。' } },
  { id:'empire', icon:'🏙️', col:2, row:6, parents:['trade'], en:'Early Empire', ja:'初期{帝国|ていこく}',
    what:{ en:'One centre rules many towns and peoples.', ja:'一つの中心が、多くの町や人々を{治|おさ}めます。' } },
  { id:'mysticism', icon:'✨', col:2, row:8, parents:['trade'], en:'Mysticism', ja:'{神秘|しんぴ}主義',
    what:{ en:'Rituals, spirits and holy places that give life meaning.', ja:'{儀式|ぎしき}・{霊|れい}・{聖|せい}なる場所が、生活に意味をあたえます。' } },
  { id:'games', icon:'🎲', col:3, row:2, parents:['workforce'], en:'Games and Recreation', ja:'{娯楽|ごらく}と{遊戯|ゆうぎ}',
    what:{ en:'Festivals, sports and games that bring people together.', ja:'祭り・スポーツ・遊びが、人々を結びつけます。' } },
  { id:'philosophy', icon:'💬', col:3, row:4, parents:['workforce','empire'], en:'Political Philosophy', ja:'政治{哲学|てつがく}',
    what:{ en:'Thinking and arguing about power: who should rule, and how.', ja:'だれが、どのように治めるべきかを考え、話し合います。' } },
  { id:'poetry', icon:'🎭', col:3, row:6, parents:['empire'], en:'Drama and Poetry', ja:'{演劇|えんげき}と{詩|し}',
    what:{ en:'Stories, songs, plays and poems that share ideas and memories.', ja:'物語・歌・{劇|げき}・詩で、考えや思い出を伝えます。' } },
  { id:'training', icon:'🎯', col:4, row:1, parents:['tradition','games'], en:'Military Training', ja:'{軍事|ぐんじ}{訓練|くんれん}',
    what:{ en:'Regular, organised practice for soldiers.', ja:'{兵士|へいし}が、計画を立ててくり返し練習します。' } },
  { id:'defense', icon:'🏰', col:4, row:3, parents:['games','philosophy'], en:'Defensive Tactics', ja:'{防御|ぼうぎょ}{戦術|せんじゅつ}',
    what:{ en:'Plans and walls that protect towns from attack.', ja:'町を{攻撃|こうげき}から守るための計画や壁です。' } },
  { id:'history', icon:'📜', col:4, row:5, parents:['philosophy','poetry'], en:'Recorded History', ja:'記録された歴史',
    what:{ en:'Keeping the past in an organised way, in writing or in memory.', ja:'過去のできごとを、決まった方法で書き残したり、覚えたりします。' } },
  { id:'theology', icon:'🌙', col:4, row:7, parents:['poetry','mysticism'], en:'Theology', ja:'{神学|しんがく}',
    what:{ en:'Organised ideas about gods, belief and how to live well.', ja:'神・{信仰|しんこう}・正しい生き方についての、まとまった考えです。' } }
];

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
