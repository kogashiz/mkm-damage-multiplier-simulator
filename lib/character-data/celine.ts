import { defineCharacter } from '../character-model'
import type { DamageComponent } from '../damage-model'

const NORMAL_COEFFICIENTS = [0.62, 0.72, 0.78, 0.84, 0.91, 0.98, 1.06, 1.15, 1.24]
const BOOK_DAMAGE_VALUES = [0.03, 0.035, 0.038, 0.041, 0.044, 0.048, 0.051, 0.056, 0.06]
const BOOK_HIT_DAMAGE_VALUES = [0.005, 0.006, 0.006, 0.007, 0.007, 0.008, 0.009, 0.009, 0.01]
const BOOK_HEAL_COEFFICIENTS = [0.4, 0.47, 0.5, 0.54, 0.59, 0.63, 0.69, 0.74, 0.8]

const DAMAGE_COMPONENTS: DamageComponent[] = [
  {
    id: 'normal',
    skill: 'normal',
    trigger: 'normal-attack',
    label: '通常攻撃',
    category: 'normal',
    damageType: 'magic',
    damageAttribute: null,
    damageAttackKind: 'normal-attack-damage',
    hitCount: 1,
    source: {
      kind: 'attack-coefficient',
      levelSource: 'normal',
      coefficientsByLevel: NORMAL_COEFFICIENTS,
    },
  },
]

export const celine = defineCharacter({
  id: 'celine',
  name: 'シーリン',
  className: 'catalyst',
  image: '/characters/celine.png',
  defaultAtk: 240,
  calculationNote:
    '通常攻撃のみ計算します。【書籍】マークのスタック・移転、攻撃速度／与ダメージ支援、回復、専属必殺の範囲魔法・コアダメージは表示のみで、計算には反映しません。',
  skillMaxLevels: { normal: 9, ultimate: 9, passive: 9, passive2: 9 },
  normal: NORMAL_COEFFICIENTS,
  ultimate: Array(9).fill(0),
  ultimateName: '知識の継承',
  passive: BOOK_DAMAGE_VALUES,
  passiveBuff: BOOK_HIT_DAMAGE_VALUES,
  passiveBuffAffectsAttack: false,
  passiveBuffTargetMode: 'none',
  passive2: BOOK_HEAL_COEFFICIENTS,
  passive2Buff: Array(9).fill(0),
  passive2BuffAffectsAttack: false,
  passive2TargetMode: 'none',
  madnessDmgPct: 0,
  damageComponents: DAMAGE_COMPONENTS,
  exclusive: {
    base: 0,
    perLevel: 0,
    valuesByLevel: [0, 0.2, 0.3, 0.4],
    secondaryValuesByLevel: [0, 4, 6, 8],
  },
  rebuildRows: [],
  overrides: {
    trait:
      '支援に長け、エネルギーを自動回復しない。戦闘開始時に【書籍】マークを2スタック獲得し、30秒ごとに1スタック獲得する。攻撃速度が15%アップする。',
    madnessText: '狂瞳深化の追加ステータス情報はWikiに記載がありません。',
    normalText: '手にした古文書のページを放って攻撃し、敵1体に自身のATKの{v}の魔法ダメージを与える。',
    ultimateText:
      '【書籍】マーク所持中に使用可能。自身以外の味方1名を指定し、自身の【書籍】マークを1スタックその味方に転移させる。この必殺技はエネルギーを消費しない。',
    passiveText:
      '味方は【書籍】マーク1スタックごとに与ダメージが{v}アップする。マーク所持者がダメージを与えると、追加で与ダメージが{b}アップする（3秒、最大20スタック）。',
    passive2Text:
      'シーリンが累計3回ダメージを与えるごとに、全ての【書籍】マーク所持者をシーリンのATKの{v}回復する。この効果は1秒につき最大1回発動する。',
    exclusiveText:
      '専属必殺【絶え間ない激流】を追加する（30秒クールタイム、1戦闘3回）。12秒間【心流】状態となり、全ての【書籍】マークのバフ効果を{v}強化する。マーク所持者の周囲3×3の敵に魔法ダメージとコアダメージ1点を与える。専属Lv1〜3のダメージ係数は400%・600%・800%。',
    shackles: [
      {
        name: '心に刻む',
        text: '【書籍】マークの最大スタック数が1増加する。戦闘開始時、味方全員が【書籍】マークを1スタック獲得する。',
      },
      {
        name: '枷共鳴 I',
        text: '【書籍】マーク1スタックごとに、攻撃速度が追加で3%アップする。',
      },
      {
        name: '探求',
        text: '味方は【書籍】マーク1スタックごとにATKが10%アップする。',
      },
      {
        name: '博識',
        text: 'シーリンが【書籍】マークを獲得する間隔が5秒短縮する。',
      },
      {
        name: '枷共鳴 II',
        text: '【書籍】マーク1スタックごとに、攻撃速度が追加で3%アップする。',
      },
    ],
  },
})
