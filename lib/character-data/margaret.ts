import { defineCharacter } from '../character-model'
import type { DamageComponent } from '../damage-model'

const NORMAL_COEFFICIENTS = [0.56, 0.65, 0.71, 0.76, 0.82, 0.89, 0.96, 1.04, 1.12]
const STATUE_COEFFICIENTS = [1.28, 1.49, 1.61, 1.74, 1.88, 2.03, 2.19, 2.37, 2.56]
const GUARDIAN_CRIT_VALUES = [0.048, 0.056, 0.0604, 0.0653, 0.0705, 0.0762, 0.0823, 0.0888, 0.096]
const GUARDIAN_CRIT_PER_GUARD = [0.003, 0.0035, 0.0037, 0.004, 0.0044, 0.0047, 0.0051, 0.0055, 0.006]
const PHYSICAL_DAMAGE_TAKEN_VALUES = [0.05, 0.0583, 0.063, 0.068, 0.0735, 0.0793, 0.0857, 0.0925, 0.1]
const PHYSICAL_DAMAGE_TAKEN_AFTER_GUARD = [0.075, 0.0875, 0.0945, 0.102, 0.1102, 0.119, 0.1286, 0.1388, 0.15]

const DAMAGE_COMPONENTS: DamageComponent[] = [
  {
    id: 'normal',
    skill: 'normal',
    trigger: 'normal-attack',
    label: '通常攻撃',
    category: 'normal',
    damageType: 'physical',
    damageAttribute: null,
    damageAttackKind: 'normal-attack-damage',
    hitCount: 1,
    source: {
      kind: 'attack-coefficient',
      levelSource: 'normal',
      coefficientsByLevel: NORMAL_COEFFICIENTS,
    },
  },
  {
    id: 'peace-sculpture',
    skill: 'ultimate',
    trigger: 'ultimate',
    label: '平和の彫像攻撃（周期発動・未計算）',
    category: 'normal',
    damageType: 'physical',
    damageAttribute: null,
    damageAttackKind: 'normal-attack-damage',
    calculationEnabled: false,
    hitCount: 1,
    source: {
      kind: 'attack-coefficient',
      levelSource: 'ultimate',
      coefficientsByLevel: STATUE_COEFFICIENTS,
    },
  },
]

export const margaret = defineCharacter({
  id: 'margaret',
  name: 'マルガリータ',
  className: 'catalyst',
  image: '/characters/margaret.png',
  defaultAtk: 240,
  calculationNote:
    '通常攻撃のみ計算します。パッシブ1の対象選択で【護衛者】を指定できますが、クリティカル率や護衛マーク消費による効果は計算しません。必殺技・彫像の周期攻撃・パッシブ2も表示のみです。',
  skillMaxLevels: { normal: 9, ultimate: 9, passive: 9, passive2: 9 },
  normal: NORMAL_COEFFICIENTS,
  ultimate: STATUE_COEFFICIENTS,
  ultimateName: '平和の彫像',
  passive: GUARDIAN_CRIT_VALUES,
  passiveBuff: GUARDIAN_CRIT_PER_GUARD,
  passiveBuffAffectsAttack: false,
  passiveBuffTargetMode: 'select-one',
  passive2: PHYSICAL_DAMAGE_TAKEN_VALUES,
  passive2Buff: PHYSICAL_DAMAGE_TAKEN_AFTER_GUARD,
  passive2TargetMode: 'none',
  madnessDmgPct: 0,
  damageComponents: DAMAGE_COMPONENTS,
  exclusive: {
    base: 0,
    perLevel: 0,
    valuesByLevel: [0, 0, 0, 0],
    secondaryValuesByLevel: [0, 1, 2, 3],
  },
  rebuildRows: [],
  overrides: {
    trait:
      '戦闘開始時、前方の味方1名を【護衛者】状態にする。前方に味方がいない場合は自身が【護衛者】状態になる。【護衛】マークを所持している間、2.5秒ごとに【平和の彫像】が自身の【破綻】マークを1つ消去する。エネルギー回復速度が15%アップする。',
    madnessText: '狂瞳深化の追加ステータス情報はWikiに記載がありません。',
    normalText: '扇子で攻撃し、毎回敵1体に自身のATKの{v}の物理ダメージを与える。',
    ultimateText:
      '指定範囲内の敵に【破綻】マークを付与し、中央に【平和の彫像】を召喚する。【護衛者】状態の味方は【護衛】マークを12スタック獲得する。必殺技は2回までチャージ可能。彫像は20秒間存在し、周囲3×3マスの敵に自身のATKの{v}の物理ダメージを与えて【破綻】マークを付与する。この彫像の攻撃は通常攻撃ダメージとして扱われる。',
    passiveText:
      '【護衛者】状態の味方のクリティカル率が{v}アップする。【護衛】マークを1スタック消費するごとに、さらに{b}アップする（最大24回）。',
    passive2Text:
      '【平和の彫像】の周囲3×3マス内の敵が受ける物理ダメージが{v}アップする。【護衛行動】発動後、さらに{b}アップする。継続時間は2秒。',
    exclusiveText:
      '【平和の彫像】が消滅すると【平和の羽】を1枚生成する。マルガリータが拾うと、コアが最も多くむき出しになっている敵にコアダメージを1点与える。専属刻印Lv2で平和の羽の同時存在上限が2枚、Lv3で3枚になる。',
    shackles: [
      {
        name: '普照',
        text: '必殺技とパッシブ2【平和的抑止】の範囲が菱形に拡大する。【護衛行動】発動後、敵の被物理ダメージ上昇量が2倍になる。',
      },
      { name: 'エネルギー充填 I', text: '戦闘開始時、エネルギーを10点獲得する。' },
      {
        name: '諫言',
        text: '【護衛者】状態の味方は、【破綻】マークが付与された敵に対するダメージが24%アップする。',
      },
      {
        name: '互恵',
        text: '【護衛】マークを2スタック消費するごとに、マルガリータと【護衛者】状態の味方がエネルギーを1点獲得する。',
      },
      { name: 'エネルギー充填 II', text: '戦闘開始時、エネルギーを10点獲得する。' },
    ],
  },
})
