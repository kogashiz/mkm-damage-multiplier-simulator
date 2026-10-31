import { defineCharacter } from '../character-model'
import type { DamageComponent } from '../damage-model'

const NORMAL_COEFFICIENTS = [0.98, 1.12, 1.2, 1.28, 1.37, 1.46, 1.56, 1.66, 1.77]
const ULTIMATE_CRITICAL_RATE_VALUES = [0.15, 0.175, 0.189, 0.204, 0.22, 0.238, 0.257, 0.278, 0.3]
const PASSIVE_DEFENSE_VALUES = [0.12, 0.14, 0.151, 0.163, 0.176, 0.19, 0.206, 0.222, 0.24]
const PASSIVE_ATTACK_BUFF_VALUES = [0.04, 0.047, 0.05, 0.054, 0.059, 0.063, 0.069, 0.074, 0.08]

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
]

export const gao = defineCharacter({
  id: 'gao',
  name: 'ガオ',
  className: 'endura',
  image: '/characters/gao.png',
  defaultAtk: 644,
  calculationNote:
    '通常攻撃のみ計算します。必殺技のコアダメージ・クリティカル率、七星の召喚と防御、味方の範囲内ATK支援、専属刻印と再構築の効果は表示のみで計算には含めません。再構築は2種類の経路があるため選択UIには登録していません。',
  skillMaxLevels: { normal: 9, ultimate: 9, passive: 9, passive2: 9 },
  normal: NORMAL_COEFFICIENTS,
  ultimate: ULTIMATE_CRITICAL_RATE_VALUES,
  ultimateName: '獅子舞の祝儀',
  passive: PASSIVE_DEFENSE_VALUES,
  passiveBuff: Array(9).fill(0),
  passiveBuffAffectsAttack: false,
  passiveBuffTargetMode: 'self',
  passive2: PASSIVE_ATTACK_BUFF_VALUES,
  passive2TargetMode: 'all',
  passive2BuffAffectsAttack: false,
  madnessDmgPct: 0,
  damageComponents: DAMAGE_COMPONENTS,
  exclusive: {
    base: 0,
    perLevel: 0,
    valuesByLevel: [0, 0.06, 0.08, 0.1],
  },
  rebuildRows: [],
  overrides: {
    trait:
      '防御に長け、敵を同時に2体ブロックできる。移動後、元の位置に【七星】を召喚する（20秒に1回）。【七星】は最大1体で、敵を2体ブロックし、通常攻撃を行わず、6回攻撃を受けると消滅する。ガオの必殺技に合わせて【七星】も必殺技を発動する。',
    madnessText: '狂瞳深化の追加ステータス情報はWikiに記載がありません。',
    normalText: '獅子頭を振って攻撃し、敵1体に自身のATKの{v}の物理ダメージを与える。',
    ultimateText:
      '高く飛んで祝儀袋をくわえ、着地後に範囲内の敵へ1点のコアダメージを与える。範囲内の味方のクリティカル率が{v}アップする。継続時間は10秒。',
    passiveText: '【七星】が戦場に存在する間、ガオのDEFが{v}アップする。',
    passive2Text: 'ガオが戦場にいる間、スキル範囲内の味方のATKが{v}アップする。',
    exclusiveText:
      '専属必殺【獅子堂々】を追加する（使用後5秒のクールタイム）。味方1名に【宝珠】を付与し、所持者の与ダメージが{v}アップする。最大2スタック、所持者は同時に1名まで。専属刻印Lv2・Lv3で与ダメージ上昇量が8%・10%になる。',
    shackles: [
      { name: '安寧守備', text: '【七星】がパッシブ【招福獅子舞】の効果を獲得する。ただしバフはスタック不可。' },
      { name: '枷共鳴 I', text: 'DEFが5%アップする。' },
      {
        name: '激励',
        text: '必殺技発動時、範囲内の味方のATKが12%アップする。10秒継続、スタック不可。',
      },
      { name: '共感', text: '必殺技のエネルギー消費が3点減少する。' },
      { name: '枷共鳴 II', text: 'DEFが5%アップする。' },
    ],
  },
})
