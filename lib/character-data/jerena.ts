import { defineCharacter } from '../character-model'
import type { DamageComponent } from '../damage-model'

const NORMAL_COEFFICIENTS = [0.66, 0.77, 0.83, 0.9, 0.97, 1.05, 1.13, 1.22, 1.32]
const CRITICAL_RATE_VALUES = [0.05, 0.058, 0.063, 0.068, 0.073, 0.079, 0.086, 0.093, 0.1]
const CRITICAL_DAMAGE_VALUES = [0.2, 0.233, 0.252, 0.272, 0.294, 0.317, 0.343, 0.37, 0.4]
const DAMAGE_PER_HP_CONSUMED_VALUES = [0.015, 0.017, 0.019, 0.02, 0.022, 0.024, 0.026, 0.028, 0.03]
const OVERHEAL_TO_ATTACK_VALUES = [0.035, 0.041, 0.044, 0.048, 0.051, 0.056, 0.06, 0.065, 0.07]
const ATTACK_BUFF_CAP_VALUES = [0.125, 0.146, 0.157, 0.17, 0.184, 0.198, 0.214, 0.231, 0.25]

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

export const jerena = defineCharacter({
  id: 'jerena',
  name: 'イェレナ',
  className: 'catalyst',
  image: '/characters/jerena.png',
  defaultAtk: 231,
  calculationNote:
    '通常攻撃のみ計算します。【雨滴】・【活性化】によるクリティカル、HP消費、吸血、ATK・与ダメージ支援は表示のみで、計算には反映しません。',
  skillMaxLevels: { normal: 9, ultimate: 9, passive: 9, passive2: 9 },
  normal: NORMAL_COEFFICIENTS,
  ultimate: Array(9).fill(0),
  ultimateName: '雨滴',
  passive: CRITICAL_RATE_VALUES,
  passiveBuff: CRITICAL_DAMAGE_VALUES,
  passiveBuffAffectsAttack: false,
  passiveBuffTargetMode: 'select-one',
  passive2: DAMAGE_PER_HP_CONSUMED_VALUES,
  passive2Buff: OVERHEAL_TO_ATTACK_VALUES,
  passive2BuffAffectsAttack: false,
  passive2AdditionalBuff: ATTACK_BUFF_CAP_VALUES,
  passive2TargetMode: 'select-one',
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
      '【雨滴】所持者の吸血効果が4%アップする。エネルギー回復速度が15%アップする。',
    madnessText: '狂瞳深化による追加効果はWikiに記載されていません。',
    normalText: 'ブレスレットで攻撃し、敵1体に自身のATKの{v}の魔法ダメージを与える。',
    ultimateText:
      '味方1名を指定し、【雨滴】マークを付与する。既に【雨滴】を所持している場合は【活性化】状態にする（10秒）。必殺技は最大2回までチャージ可能。',
    passiveText:
      '選択した味方が【雨滴】を所持している間、クリティカル率が{v}アップする。毎秒、最大HPの1.5%を消費する。【活性化】中はクリティカルダメージが{b}アップし、さらにイェレナのクリティカルダメージの同割合分が加算される（上限200%）。',
    passive2Text:
      '【活性化】状態中、吸血によるHP回復の溢れた分をATKに変換する（変換率{b}、上限はイェレナのATKの{c}）。また、【雨滴】所持者がHPを累計600点消費するたび、与ダメージが{v}アップする（最大10スタック）。',
    exclusiveText:
      '専属必殺【寒雨侵心】を追加する（1回の戦闘につき1回）。イェレナが【解放】状態に入り、雨滴所持者を即座に【活性化】する。専属刻印Lv1〜3で継続時間が10・12・15秒、活性化中のクリティカルダメージ効果が1.2・1.4・1.6倍になる。',
    shackles: [
      {
        name: '愛護',
        text: '【雨滴】所持者の最大数が1名増加する。戦闘開始時、正面と両側の味方からATKが最も高い1名に【雨滴】を付与する。',
      },
      { name: '枷共鳴 I', text: 'エネルギー回復速度が10%アップする。' },
      {
        name: '太陽が見えたなら',
        text: 'パッシブ【慈悲深き者の哀鳴】のATKバフ上限が15%アップし、【活性化】終了後も解除されなくなる。',
      },
      { name: '元気満タン', text: '戦闘開始時、イェレナがエネルギーを18点獲得する。' },
      { name: '枷共鳴 II', text: 'エネルギー回復速度が10%アップする。' },
    ],
  },
})
