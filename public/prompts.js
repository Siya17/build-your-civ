// Argument scaffolds use the team's evidence without supplying a causal conclusion.
import { regions } from '../shared/regions.js';
import { cardById } from '../shared/cards.js';
import { before } from '../shared/game.js';
import { dictionary } from '../shared/i18n.js';

const plain = text => String(text ?? '').replace(/\[\[[a-z]+\|([^\]]+)\]\]/g,'$1').replace(/\[\[([a-z]+)\]\]/g,'$1').replace(/\{([^{}|]+)\|[^{}]+\}/g,'$1');
const name = (id, lang) => id ? plain(cardById[id]?.[lang] ?? id) : '…';

export function starters(key, state, lang) {
  const ja = lang === 'ja', L = dictionary[lang], region = regions[state.mapPoint];
  if (!region) return [];
  const place = plain(region.name[lang]);
  const science = name(state.tech[0] ?? before(state, 'tech')[0], lang);
  const society = name(state.civic[0] ?? before(state, 'civic')[0], lang);
  const chip = (group, value) => value ? plain(L[`chips_${group}`][value] ?? value) : '…';
  switch (key) {
    case 'eventAnswer': {
      const title = state.event ? plain(L[`event${state.event.roll}`]) : (ja ? 'イベント' : 'the event');
      return ja ? [
        `${title}への対応について、私たちの主張は…ということです。根拠は…です。`,
        '私たちのカードのうち、…と…が結果につながったしくみは…です。',
        '負担が大きかったのは…という集団です。別の対応なら…'
      ] : [
        `Our claim about our response to ${title} is …; the evidence is …`,
        'Two of our cards, … and …, affected the result through …',
        'The burden fell especially on …; a different response would …'
      ];
    }
    case 'geographyAnswer': return ja ? [
      `${place}では、…という制約が最も重要でした。なぜなら…`,
      `資源の…が${science}の利用に影響し、それが制度の…に影響しました。`,
      '同じ条件でも、…という選択が可能でした。違いを生むのは…'
    ] : [
      `In ${place}, the most important constraint was …, because …`,
      `The resource … shaped our use of ${science}, which affected the institution … through …`,
      'Under the same conditions, an alternative was …; the difference would come from …'
    ];
    case 'governmentAnswer': {
      const government = chip('government', state.government);
      return ja ? [
        `${government}を選ぶ根拠は、私たちのカードの…と…です。具体的には…`,
        '協力を調整するには…が必要です。しかし、権限を持たない…は…',
        '権力の乱用を抑える方法は…です。それにも…という限界があります。'
      ] : [
        `Two of our cards, … and …, make ${government} workable because …`,
        'The coordination problem is …; people without authority may …',
        'We would constrain abuses through …, although that safeguard could fail when …'
      ];
    }
    case 'economyAnswer': {
      const activities = state.economy.map(value => chip('economy', value)).join(ja ? '・' : ', ') || '…';
      return ja ? [
        `${activities}の優先順位について、私たちの主張は…です。資源とカードの根拠は…`,
        '…を優先すると、…の利益は増えますが、…の負担も増えます。',
        'イベントの結果は、この選択の…という弱点を示しました。'
      ] : [
        `Our priorities among ${activities} are …; resource and card evidence supports this because …`,
        'Prioritizing … benefits … but places the cost on …',
        'The event result exposed a vulnerability in this choice: …'
      ];
    }
    case 'beliefAnswer': {
      const beliefs = chip('beliefs', state.beliefs);
      return ja ? [
        `${beliefs}が協力に関わるしくみは…です。地域の…と${society}が根拠になります。`,
        '人々が自発的に共有する意味は…ですが、強制になりうるのは…です。',
        '別の集団にとって、この制度は…という意味を持つかもしれません。'
      ] : [
        `${beliefs} could affect cooperation through …; our local condition … and ${society} support this argument.`,
        'A shared meaning people might accept is …; coercion could arise when …',
        'For another group, the same institution might mean …'
      ];
    }
    case 'shapeAnswer': return ja ? [
      `${science}と${society}の関係について、私たちは…と主張します。`,
      '…から…へつながるしくみは…です。',
      '…という集団には、…という意図しない影響がありえます。この主張の限界は…'
    ] : [
      `We argue that ${science} and ${society} interact by …`,
      'The causal steps connecting … to … are …',
      'An unintended consequence for … could be …; our argument is limited by …'
    ];
    case 'notChosenAnswer': return ja ? [
      '実現可能だった別案は…です。選ばなかった理由は、…との比較で…',
      '選択によって失った利益は…であり、だれがそれを必要としたかというと…',
      'もし…という条件が変われば、私たちは決定を変えます。なぜなら…'
    ] : [
      'A feasible alternative was …; we rejected it in comparison with … because …',
      'The benefit we gave up was …, which mattered particularly to …',
      'If … changed, we would reverse our decision because …'
    ];
  }
  return [];
}

const words = {
  en:{
    eventAnswer:['[[resilience|resilience]]','[[vulnerability|vulnerability]]','[[distribution|distributional effects]]'],
    geographyAnswer:['[[causation|causal mechanism]]','[[institution|institution]]','[[counterfactual|counterfactual]]'],
    governmentAnswer:['[[coordination|coordination problem]]','[[legitimacy|legitimacy]]','[[coercion|coercion]]'],
    economyAnswer:['[[tradeoff|tradeoff]]','[[specialization|specialization]]','[[surplus|surplus]]','[[distribution|distributional effects]]'],
    beliefAnswer:['[[legitimacy|legitimacy]]','[[institution|institution]]','[[coercion|coercion]]'],
    shapeAnswer:['[[causation|causal mechanism]]','[[maintenance|maintenance]]','[[contingency|contingency]]'],
    notChosenAnswer:['[[opportunitycost|opportunity cost]]','[[counterfactual|counterfactual]]','[[contingency|contingency]]']
  },
  ja:{
    eventAnswer:['[[resilience|回復力]]','[[vulnerability|脆弱性]]','[[distribution|分配への影響]]'],
    geographyAnswer:['[[causation|因果のしくみ]]','[[institution|制度]]','[[counterfactual|反実仮想]]'],
    governmentAnswer:['[[coordination|協力を調整する課題]]','[[legitimacy|正当性]]','[[coercion|強制]]'],
    economyAnswer:['[[tradeoff|トレードオフ]]','[[specialization|専門化]]','[[surplus|余剰]]','[[distribution|分配への影響]]'],
    beliefAnswer:['[[legitimacy|正当性]]','[[institution|制度]]','[[coercion|強制]]'],
    shapeAnswer:['[[causation|因果のしくみ]]','[[maintenance|維持管理]]','[[contingency|偶有性]]'],
    notChosenAnswer:['[[opportunitycost|機会費用]]','[[counterfactual|反実仮想]]','[[contingency|偶有性]]']
  }
};
export const usefulWords = (key, lang) => words[lang]?.[key] ?? [];
