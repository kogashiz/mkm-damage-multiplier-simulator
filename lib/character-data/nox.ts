import { defineCharacter } from '../character-model'

const NORMAL_COEFFICIENTS = [0.9, 0.96, 1.02, 1.09, 1.16, 1.24, 1.32, 1.41, 1.51, 1.61]
const ULTIMATE_COEFFICIENTS = [1.58, 1.68, 1.8, 1.92, 2.05, 2.19, 2.34, 2.5, 2.67, 2.85]
const PASSIVE1_VALUES = Array(10).fill(0.006)
const PASSIVE1_CAPS = [0.15, 0.16, 0.17, 0.18, 0.19, 0.2, 0.22, 0.24, 0.27, 0.3]
const PASSIVE2_VALUES = [0.15, 0.16, 0.171, 0.182, 0.195, 0.208, 0.222, 0.237, 0.253, 0.27]
const EXCLUSIVE_ULTIMATE_COEFFICIENTS = [0, 6, 7, 8]

export const nox = defineCharacter({
  id: 'nox',
  name: 'NOX',
  className: 'fury',
  image: '/characters/nox.png',
  defaultAtk: 100,
  normal: NORMAL_COEFFICIENTS,
  ultimate: ULTIMATE_COEFFICIENTS,
  ultimateName: '深淵の夜幕',
  passive: PASSIVE1_VALUES,
  passiveBuff: PASSIVE1_CAPS,
  passiveBuffTargetMode: 'none',
  passive2: PASSIVE2_VALUES,
  passive2TargetMode: 'enemy-all',
  passive2Buff: Array(10).fill(0),
  madnessDmgPct: 0,
  traitDmgPct: 0.05,
  traitCoreBrokenDmgPct: 0.05,
  combat: {
    madnessPhysicalDefensePenetrationPct: 0.15,
    attackPerDefeatedEnemyPct: 0.006,
    attackPerDefeatedEnemyCapByLevel: PASSIVE1_CAPS,
    enemyDefenseReductionByLevel: PASSIVE2_VALUES,
    normalDamagePctByShackle: [0, 0, 0.05, 0.05, 0.05, 0.1],
    exclusiveDamageCoefficients: EXCLUSIVE_ULTIMATE_COEFFICIENTS,
  },
  exclusive: {
    base: 0,
    perLevel: 0,
    valuesByLevel: [0, 6, 7, 8],
  },
  rebuildUlts: ['永夜の顕現', '黒影の顕現'],
  damageComponents: [
    {
      id: 'normal',
      skill: 'normal',
      trigger: 'normal-attack',
      label: '通常攻撃',
      category: 'normal',
      damageType: 'physical',
      hitCount: 1,
      source: {
        kind: 'attack-coefficient',
        levelSource: 'normal',
        coefficientsByLevel: NORMAL_COEFFICIENTS,
      },
    },
    {
      id: 'ultimate-enhanced-attack',
      skill: 'ultimate',
      trigger: 'ultimate',
      label: '消沈の剣気（1回分）',
      category: 'normal',
      damageType: 'physical',
      hitCount: 1,
      activeWindowSeconds: 20,
      source: {
        kind: 'attack-coefficient',
        levelSource: 'ultimate',
        coefficientsByLevel: ULTIMATE_COEFFICIENTS,
      },
    },
  ],
  overrides: {
    trait: '与ダメージが5%アップし、コアが破壊されている敵に対するダメージが5%アップする。',
    madnessText: '物理貫通が15%アップする。',
    normalText: '大剣を振り回して攻撃し、毎回敵1体に自身のATKの{v}の物理ダメージを与える。',
    ultimateText:
      '20秒間、通常攻撃を強化する。期間中、エネルギーは自動回復しない。強化攻撃【消沈の剣気】は範囲内の敵に自身のATKの{v}の物理ダメージを与える。',
    passiveText:
      '敵を撃退するたびにATKが{v}アップする。最大{b}までスタック可能。',
    passive2Text: '戦場にいる間、全ての敵のDEFを{b}ダウンさせる。',
    shackles: [
      { name: 'アッシュタイド', text: '必殺技中に敵を撃退すると、継続時間が1秒延長する（最大8秒）。' },
      { name: '枷共鳴 I', text: '通常攻撃ダメージが5%アップする。' },
      { name: '幽冥降臨', text: '必殺技中、パッシブ「幽冥戦慄」の効果が50%アップする。' },
      { name: '元気満タン', text: '戦闘開始時、エネルギーを15点獲得する。' },
      { name: '枷共鳴 II', text: '通常攻撃ダメージが5%アップする。' },
    ],
    exclusiveText:
      '必殺技発動時、周囲3×3マス範囲内の敵に自身のATKの{v}の物理ダメージとコアダメージ1を与える。敵1体にダメージを与えるごとに必殺技終了まで被ダメージが10%ダウンする（最大5回）。',
  },
})
