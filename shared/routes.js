// A final decision for one team's civilization. No turns or other teams are involved.
// Each prerequisite group is OR; technology AND civic groups must both be satisfied.
export const civilizationRoutes = [
  {id:'local', icon:'⌂', tech:[], civic:[],
    en:'Deepen our roots', ja:'地域を育てる',
    description:{en:'Keep improving life at home before reaching farther.',ja:'遠くへ進む前に、地域の暮らしを充実させる。'},
    tradeoff:{en:'Local needs come first; distant exchange waits.',ja:'地域の課題を優先し、遠方との交流は後にする。'}},
  {id:'land', icon:'↗', tech:['wheel','horseback'], civic:['trade','trade_accord','route_stewards'],
    en:'Open a caravan route', ja:'陸の交易路を開く',
    description:{en:'Carry goods and ideas overland to another community.',ja:'陸路で物資や考えを別の共同体へ運ぶ。'},
    tradeoff:{en:'Travel connects people, but maintaining roads takes work.',ja:'道は人々を結ぶが、維持には労力がかかる。'}},
  {id:'water', icon:'≈', tech:['sailing'], civic:['trade','trade_accord','mutual_aid'],
    en:'Launch a water route', ja:'水の交流路を開く',
    description:{en:'Use boats to exchange supplies along rivers or coasts.',ja:'川や沿岸で船を使い、物資を交換する。'},
    tradeoff:{en:'Boats carry more, but weather can interrupt journeys.',ja:'船は多くを運べるが、天候で移動が止まることもある。'}},
  {id:'knowledge', icon:'✧', tech:['writing'], civic:['philosophy','history'],
    en:'Build a learning network', ja:'学びの交流網を築く',
    description:{en:'Share records and ideas with neighboring communities.',ja:'記録や考えを近隣の共同体と共有する。'},
    tradeoff:{en:'Shared learning needs time for teaching and listening.',ja:'共に学ぶには、教え合い、聞き合う時間が必要になる。'}}
];

export const routeById = id => civilizationRoutes.find(route => route.id === id);
export function routeEligibility(state, route) {
  const has = kind => !route[kind].length || route[kind].some(id => state[kind]?.includes(id));
  return {tech:has('tech'), civic:has('civic'), unlocked:!!state.mapPoint && has('tech') && has('civic')};
}
export const routeUnlocked = (state, id) => {
  const route = routeById(id);
  return !!route && routeEligibility(state, route).unlocked;
};
