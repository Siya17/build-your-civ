// Argument scaffolds use the team's evidence without supplying a causal conclusion.
import { regions } from '../shared/regions.js';
import { cardById } from '../shared/cards.js';
import { before } from '../shared/game.js';
import { dictionary } from '../shared/i18n.js';

const plain = text => String(text ?? '').replace(/\[\[[a-z]+\|([^\]]+)\]\]/g,'$1').replace(/\[\[([a-z]+)\]\]/g,'$1').replace(/\{([^{}|]+)\|[^{}]+\}/g,'$1');
const name = (id, lang) => id ? plain(cardById[id]?.[lang] ?? id) : '…';

export const eventPromptKind = state => {
  const id = state.event?.id ?? state.event?.roll;
  return [6,10,11,12].includes(id) ? 'opportunity' : id === 3 ? 'choice' : 'adverse';
};

export function starters(key, state, lang) {
  const ja = lang === 'ja', L = dictionary[lang], region = regions[state.mapPoint];
  if (!region) return [];
  const place = plain(region.name[lang]);
  const science = name(state.tech[0] ?? before(state, 'tech')[0], lang);
  const society = name(state.civic[0] ?? before(state, 'civic')[0], lang);
  const chip = (group, value) => value ? plain(L[`chips_${group}`][value] ?? value) : '…';
  switch (key) {
    case 'eventAnswer': {
      const title = state.event ? plain(L[`event${state.event.id ?? state.event.roll}`]) : (ja ? 'イベント' : 'the event');
      const kind = eventPromptKind(state);
      if (kind === 'opportunity') return ja ? [
        `${title}によって、…という機会が生まれました。`,
        '…と…という発達が、…という方法で役立ちます。',
        '最も利益を得るのは…です。ただし、…という問題は残ります。'
      ] : [
        `${title} created an opportunity to …`,
        'Our developments … and … could help by …',
        'The people who benefit most are …; however, … remains a problem.'
      ];
      if (kind === 'choice') return ja ? [
        '私たちは…という対応を選びました。理由は…です。',
        '…と…という発達が、判断を…という方法で支えました。',
        '利点は…で、リスクは…です。新しく来た人々には…と見えるかもしれません。'
      ] : [
        'We chose to … because …',
        'Our developments … and … supported this choice by …',
        'One benefit is … and one risk is …; the newcomers might see our response as …'
      ];
      return ja ? [
        `${title}は、社会の…に影響しました。`,
        '…と…という発達は、…という方法で役立ちました。または、役立たなかった理由は…です。',
        '最も困難を受けたのは…です。…という問題が残ります。'
      ] : [
        `${title} affected our society by …`,
        'Our developments … and … helped by …, or offered little protection because …',
        'The greatest difficulty fell on …; one remaining problem is …'
      ];
    }
    case 'geographyAnswer': return ja ? [
      `${place}の…という特徴が、${science}の選択に影響しました。`,
      'この特徴のため、人々は…ができました。または、…ができませんでした。',
      'この特徴は、…という点で利点であり、…という点で制約です。'
    ] : [
      `The feature … in ${place} shaped our choice of ${science} because …`,
      'Because of this feature, people could … or could not …',
      'It was an advantage because …, and a limit because …'
    ];
    case 'governmentAnswer': {
      const government = chip('government', state.government);
      return ja ? [
        `${government}は、…という仕事をまとめるのに合っています。`,
        '決定するのは…です。…の意見は反映されにくいかもしれません。',
        '不公平な決定には、…という方法で異議を唱えられます。'
      ] : [
        `${government} suits us because it can organize …`,
        'Decisions are made by …, while … may have little influence.',
        'People could challenge an unfair decision by …'
      ];
    }
    case 'economyAnswer': {
      const activities = state.economy.map(value => chip('economy', value)).join(ja ? '・' : ', ') || '…';
      return ja ? [
        `${activities}の中では、…を…より優先します。資源と発達が示す理由は…です。`,
        '利益を得るのは…で、リスクを負うのは…です。',
        'イベントは、…の重要性を示しました。後回しになる有用な別案は…です。'
      ] : [
        `Among ${activities}, we prioritize … over … because our resources and developments …`,
        'This benefits …, while … carries the risk of …',
        'The event showed …; a useful alternative receiving less attention is …'
      ];
    }
    case 'beliefAnswer': {
      const beliefs = state.beliefs === 'other' ? (ja ? '私たちの信仰' : 'Our belief') : chip('beliefs', state.beliefs);
      return ja ? [
        `${beliefs}：人々は…を聖なるものと考えます。`,
        '毎年…に、…で…という儀式を行い、…が導きます。',
        'この儀式は…を結びつけます。異なる考えを持つ人は…と扱われるかもしれません。'
      ] : [
        `${beliefs}: our people treat … as sacred.`,
        'Every … at …, people hold a ritual where …; it is led by …',
        'The ritual brings together …; people who disagree might be treated …'
      ];
    }
    case 'shapeAnswer': return ja ? [
      '…という人々の一日は、…から始まります。',
      `${science}は…という点で暮らしを楽にします。`,
      `しかし、${society}のために、…という負担があります。`
    ] : [
      'A day for … begins with …',
      `${science} makes their life easier because …`,
      `However, ${society} makes it harder because …`
    ];
    case 'notChosenAnswer': return ja ? [
      '…は選べましたが、…を優先しました。理由は…です。',
      '私たちは…を得ましたが、別案で得られた…をあきらめました。',
      'もし…という状況が変われば、…を選び直します。理由は…です。'
    ] : [
      'We could have chosen …, but preferred … because …',
      'We gained …, while giving up the alternative benefit of …',
      'If … changed, we would reconsider because …'
    ];
    case 'historyDifferenceAnswer': return ja ? [
      'チームは…を選びましたが、歴史の例では…が説明されています。',
      '文章の…という証拠から、違いの理由は…と考えられます。',
      '地理だけでなく、…という関係や選択も重要でした。'
    ] : [
      'Our team chose …, while the historical example describes …',
      'The evidence … in the reading suggests one reason for the difference: …',
      'Alongside geography, the relationship or choice … mattered because …'
    ];
    case 'historyWorkAnswer': return ja ? [
      '歴史の…という事業や実践を選びます。',
      '材料の…、知識の…、労働の…が必要でした。',
      '人々は…について協力する必要があり、…という課題に直面しました。'
    ] : [
      'The historical project or practice we chose is …',
      'It required the materials …, the knowledge …, and the work of …',
      'People needed to cooperate over …; one challenge was …'
    ];
    case 'historyOmissionAnswer': return ja ? [
      '歴史の文章にある…という要素を、活動は表していません。',
      'その要素を取り入れると、…という決定に影響します。',
      '私たちは…を変えるでしょう。理由は…です。'
    ] : [
      'The historical aspect … appears in the reading but is not represented in this activity.',
      'Including it would affect our decision about …',
      'We would change … because …'
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
