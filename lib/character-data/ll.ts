import { defineCharacter } from '../character-model'
import type { DamageComponent } from '../damage-model'

const NORMAL_COEFFICIENTS = [0.63, 0.73, 0.79, 0.86, 0.93, 1, 1.08, 1.17, 1.26]
const SKILL_DAMAGE_VALUES = [0.15, 0.175, 0.189, 0.204, 0.22, 0.238, 0.257, 0.278, 0.3]
const ENERGY_RECOVERY_VALUES = [0.1, 0.117, 0.126, 0.136, 0.147, 0.159, 0.171, 0.185, 0.2]

const DAMAGE_COMPONENTS: DamageComponent[] = [
  {
    id: 'normal',
    skill: 'normal',
    trigger: 'normal-attack',
    label: '通常攻撃',
    category: 'normal',
    damageType: 'defense-ignoring',
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

export const ll = defineCharacter({
  id: 'll',
  name: 'L.L.',
  className: 'catalyst',
  image: '/characters/ll.png',
  defaultAtk: 240,
  calculationNote:
    '通常攻撃のみ計算します。【タマちゃん】所持者へのATK・スキルダメージ支援、エネルギー付与・回復は表示のみで、計算には反映しません。',
  skillMaxLevels: { normal: 9, ultimate: 9, passive: 9, passive2: 9 },
  normal: NORMAL_COEFFICIENTS,
  ultimate: Array(9).fill(0),
  ultimateName: 'エネルギー付与',
  passive: SKILL_DAMAGE_VALUES,
  passiveBuff: Array(9).fill(0),
  passiveBuffTargetMode: 'select-one',
  passive2: ENERGY_RECOVERY_VALUES,
  passive2Buff: Array(9).fill(0),
  passive2TargetMode: 'self',
  madnessDmgPct: 0,
  damageComponents: DAMAGE_COMPONENTS,
  exclusive: {
    base: 0,
    perLevel: 0,
    valuesByLevel: [0, 0, 0, 0],
  },
  rebuildRows: [],
  overrides: {
    trait:
      '戦闘開始時に【タマちゃん】を召喚する。【タマちゃん】の所持者は同時に1名まで。【タマちゃん】所持者のATKがL.L.のATKの10%分アップする。この効果は【タマちゃん】が移動するまで継続する。',
    madnessText: '狂瞳深化による追加効果はWikiに記載されていません。',
    normalText: 'エナジーを集めて攻撃し、敵1体に自身のATKの{v}の防御無視ダメージを与える。',
    ultimateText:
      '味方1名を指定し、エネルギーを付与して【タマちゃん】を所持させる。Lv1〜9のエネルギー付与量は9、9、10、10、10、11、11、11、12点。エネルギー消費は33、31、30、29、28、27、26、25、24点。この必殺技は2回までチャージ可能。',
    passiveText:
      '【タマちゃん】を所持するコンビクトのスキルダメージが{v}アップする。【タマちゃん】が離れると、5秒後に効果が解除される。',
    passive2Text:
      '局長権能を使用するたび、L.L.のエネルギー回復速度が{v}アップする。継続時間は8秒。',
    exclusiveText:
      '【タマちゃん】は味方全員の溢れたエネルギーを毎秒最大3点まで収集し、最大6点まで保存する。必殺技発動時、指定した味方に保存分を付与する。専属刻印Lv2・Lv3では収集割合が30%・40%、保存上限が7・8点に上昇する。',
    shackles: [
      { name: '溺海', text: '必殺技で指定されたコンビクトがエネルギーを追加で4点獲得する。' },
      { name: '枷共鳴 I', text: 'エネルギー回復速度が7.5%アップする。' },
      {
        name: '中毒',
        text: '戦闘開始時、局長エネルギーを1点獲得する。L.L.が戦場にいる間、局長権能を使用すると味方全員のATKが3%アップする（最大5スタック）。',
      },
      { name: '元気満タン', text: '戦闘開始時、L.L.がエネルギーを18点獲得する。' },
      { name: '枷共鳴 II', text: 'エネルギー回復速度が7.5%アップする。' },
    ],
  },
})
