import { defineCharacter, linearLevels } from '../character-model'

const NORMAL_COEFFICIENTS = [0.83, 0.89, 0.95, 1.01, 1.08, 1.15, 1.23, 1.31, 1.4, 1.5]
const ULTIMATE_COEFFICIENTS = [5, 5.34, 5.6, 6.08, 6.5, 6.93, 7.4, 7.9, 8.43, 9]
const ENHANCED_NORMAL_FIRST_SECOND = [2.49, 2.66, 2.84, 3.03, 3.24, 3.46, 3.69, 3.94, 4.21, 4.49]
const ENHANCED_NORMAL_THIRD = [1.14, 1.22, 1.3, 1.39, 1.48, 1.58, 1.69, 1.81, 1.93, 2.06]

export const zoya = defineCharacter({
  id: 'zoya',
  name: 'ゾーヤ',
  className: 'fury',
  image: '/characters/zoya.png',
  defaultAtk: 100,
  normal: NORMAL_COEFFICIENTS,
  ultimate: ULTIMATE_COEFFICIENTS,
  ultimateName: '怒りの軍団',
  passive: Array(10).fill(0.02),
  passiveBuff: [0.3, 0.314, 0.328, 0.343, 0.359, 0.376, 0.393, 0.411, 0.43, 0.45],
  passiveBuffTargetMode: 'none',
  passive2: [0.01, 0.01, 0.012, 0.013, 0.014, 0.015, 0.016, 0.017, 0.018, 0.02],
  passive2TargetMode: 'none',
  passive2Buff: Array(10).fill(0),
  traitDmgPct: 0.05,
  traitCoreBrokenDmgPct: 0.05,
  madnessDmgPct: 0.1,
  madnessCoreBrokenDmgPct: 0.1,
  combat: {
    normalDamagePctByShackle: [0, 0, 0.05, 0.05, 0.05, 0.1],
    singleEnemyDamagePctByShackle: [0, 0, 0, 0.2, 0.2, 0.2],
  },
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
      id: 'ultimate',
      skill: 'ultimate',
      trigger: 'ultimate',
      label: '必殺技発動',
      category: 'skill',
      damageType: 'physical',
      hitCount: 1,
      source: {
        kind: 'attack-coefficient',
        levelSource: 'ultimate',
        coefficientsByLevel: ULTIMATE_COEFFICIENTS,
      },
    },
    {
      id: 'ultimate-enhanced-normal-first-second',
      skill: 'ultimate',
      trigger: 'ultimate',
      label: '強化通常攻撃 第1・2撃',
      category: 'normal',
      damageType: 'physical',
      hitCount: 2,
      activeWindowSeconds: 15,
      source: {
        kind: 'attack-coefficient',
        levelSource: 'ultimate',
        coefficientsByLevel: ENHANCED_NORMAL_FIRST_SECOND,
      },
    },
    {
      id: 'ultimate-enhanced-normal-third',
      skill: 'ultimate',
      trigger: 'ultimate',
      label: '強化通常攻撃 第3撃',
      category: 'normal',
      damageType: 'physical',
      hitCount: 3,
      activeWindowSeconds: 15,
      source: {
        kind: 'attack-coefficient',
        levelSource: 'ultimate',
        coefficientsByLevel: ENHANCED_NORMAL_THIRD,
      },
    },
    {
      id: 'passive1-current-hp',
      skill: 'passive',
      trigger: 'normal-attack',
      label: 'パッシブ1 追加ダメージ',
      category: 'special',
      damageType: 'defense-ignoring',
      hitCount: 1,
      activationCondition: { kind: 'after-normal-attacks', count: 2 },
      source: {
        kind: 'current-enemy-hp',
        levelSource: 'passive',
        hpRatio: 0.02,
        maxAttackCoefficientsByLevel: [0.3, 0.314, 0.328, 0.343, 0.359, 0.376, 0.393, 0.411, 0.43, 0.45],
      },
    },
  ],
  effects: [
    {
      id: 'passive2-attack-speed',
      skill: 'passive2',
      kind: 'attack-speed-up',
      trigger: 'after-consecutive-normal-attack-damage',
      values: [0.01, 0.011, 0.012, 0.013, 0.014, 0.015, 0.016, 0.017, 0.018, 0.02],
      durationSeconds: 4,
      maxStacks: 15,
    },
  ],
  exclusive: {
    base: 0,
    perLevel: 0,
    valuesByLevel: [0, 0.3, 0.35, 0.4],
  },
  rebuildUlts: ['怒りの軍臨', '疾鋒の軍臨'],
  overrides: {
    trait: '物理攻撃に長けたコンビクト。与ダメージが5%アップし、コアが破壊されている敵に対するダメージが5%アップする。',
    madnessText: '与ダメージが10%アップし、コアが破壊されている敵に対するダメージが10%アップする。',
    normalText: 'ゾーヤは敏捷な体術で攻撃し、毎回敵1体に自身のATK {v}の物理ダメージを与える。',
    ultimateText:
      'ゾーヤは全ての力を爆発させ、スキル範囲内の全ての敵に自身のATKの{v}の物理ダメージを与え、【恐怖】状態を付与する。継続時間は3秒。…',
    passiveText:
      '通常攻撃を2回行うごとに、次の通常攻撃で敵の現在HPの{v}の防御無視ダメージを追加で与える。このダメージは自身のATKの{b}を超過しない。',
    passive2Text:
      '通常攻撃で連続ダメージを与えた後、攻撃速度が{b}アップする。4秒間継続し、最大15回までスタック可能。',
    exclusiveText:
      '必殺技の継続時間中、ゾーヤの被ダメージが{v}ダウンし、制御効果を無効化する。',
    shackles: [
      { name: '転覆', text: '必殺技の継続時間が5秒延長する。' },
      { name: '枷共鳴 I', text: '通常攻撃ダメージが5%アップする。' },
      { name: 'エンカウント', text: '周囲十字マス範囲内に敵が1体のみ存在する場合、与ダメージが20%アップする。' },
      { name: '共感', text: '必殺技のエネルギー消費が5点減少する。' },
      { name: '枷共鳴 II', text: '通常攻撃ダメージが5%アップする。' },
    ],
  },
})
