import { buildRebuild, type RebuildRow } from './rebuild'
import {
  createStandardDamageComponents,
  type CharacterEffect,
  type DamageComponent,
} from './damage-model'

export type CharacterClass = 'fury' | 'umbra' | 'endura'

export const CLASS_LABELS: Record<CharacterClass, string> = {
  fury: 'フューリー',
  umbra: 'アンブラ',
  endura: 'エンデュア',
}

export const CLASS_ORDER: CharacterClass[] = ['fury', 'umbra', 'endura']

export const MAX_SKILL_LEVEL = 10
export const MAX_SHACKLE = 5
export const MAX_EXCLUSIVE_LEVEL = 5

type Scaling = { base: number; perLevel: number }

export type BuffTargetMode = 'self' | 'all' | 'select-one' | 'none' | 'enemy-all'
export type CharacterCombatData = {
  coreBrokenDamagePct?: number
  physicalDefensePenetrationPct?: number
  madnessPhysicalDefensePenetrationPct?: number
  attackPerDefeatedEnemyPct?: number
  attackPerDefeatedEnemyCapByLevel?: number[]
  enemyDefenseReductionByLevel?: number[]
  normalDamagePctByShackle?: number[]
  singleEnemyDamagePctByShackle?: number[]
  exclusiveDamageCoefficients?: number[]
}

const linearLevels = (base: number, perLevel: number) =>
  Array.from({ length: MAX_SKILL_LEVEL }, (_, index) => base + perLevel * index)

/**
 * テキスト内の {v} はスキル係数、{b} はバフ値に置き換えて表示されます。
 */
export type Character = {
  id: string
  name: string
  className: CharacterClass
  image: string
  defaultAtk: number
  exclusiveMaxLevel: number
  trait: string
  traitDamagePct: number
  traitCoreBrokenDamagePct: number
  madness: { text: string; dmgPct: number }
  madnessCoreBrokenDamagePct: number
  normal: number[]
  normalText: string
  ultimate: number[]
  ultimateName: string
  ultimateText: string
  passive: number[]
  passiveBuff: number[]
  passiveBuffTargetMode: BuffTargetMode
  passiveText: string
  passive2: number[]
  passive2TargetMode: BuffTargetMode
  passive2Buff?: number[]
  passive2Text: string
  combat: CharacterCombatData
  damageComponents: DamageComponent[]
  effects: CharacterEffect[]
  shackles: { name: string; text: string }[]
  exclusive: Scaling & { text: string }
  rebuild: RebuildRow[]
}

export type CharacterSeed = Pick<Character, 'id' | 'name' | 'className' | 'image' | 'defaultAtk'> & {
  exclusiveMaxLevel?: number
  normal: number[]
  ultimate: number[]
  ultimateName: string
  passive: number[]
  passiveBuff: number[]
  passiveBuffTargetMode?: BuffTargetMode
  passive2: number[]
  passive2TargetMode?: BuffTargetMode
  passive2Buff?: number[]
  passive2BuffTargetMode?: BuffTargetMode
  damageComponents?: DamageComponent[]
  effects?: CharacterEffect[]
  madnessDmgPct: number
  traitDmgPct?: number
  traitCoreBrokenDmgPct?: number
  madnessCoreBrokenDmgPct?: number
  combat?: CharacterCombatData
  exclusive: Scaling
  rebuildUlts: [string, string]
  overrides?: Partial<Pick<Character, 'trait' | 'shackles'>> & {
    madnessText?: string
    normalText?: string
    ultimateText?: string
    passiveText?: string
    passive2Text?: string
    exclusiveText?: string
  }
}

export function defineCharacter(seed: CharacterSeed): Character {
  const { name, overrides = {} } = seed
  const role = CLASS_LABELS[seed.className]
  const damageComponents =
    seed.damageComponents ?? createStandardDamageComponents(seed.normal, seed.ultimate, seed.passive)
  return {
    id: seed.id,
    name,
    className: seed.className,
    image: seed.image,
    defaultAtk: seed.defaultAtk,
    exclusiveMaxLevel: seed.exclusiveMaxLevel ?? MAX_EXCLUSIVE_LEVEL,
    trait: overrides.trait ?? `${role}のコンビクト。与ダメージが5%アップし、…`,
    traitDamagePct: seed.traitDmgPct ?? 0,
    traitCoreBrokenDamagePct: seed.traitCoreBrokenDmgPct ?? 0,
    madness: {
      text: overrides.madnessText ?? '与ダメージが{v}アップし、…',
      dmgPct: seed.madnessDmgPct,
    },
    madnessCoreBrokenDamagePct: seed.madnessCoreBrokenDmgPct ?? 0,
    normal: seed.normal,
    normalText: overrides.normalText ?? `${name}は毎回敵1体に自身のATK {v}の物理ダメージを与える。`,
    ultimate: seed.ultimate,
    ultimateName: seed.ultimateName,
    ultimateText:
      overrides.ultimateText ??
      `${name}はスキル範囲内の全ての敵に自身のATKの{v}の物理ダメージを与える。`,
    passive: seed.passive,
    passiveBuff: seed.passiveBuff,
    passiveBuffTargetMode: seed.passiveBuffTargetMode ?? 'select-one',
    passiveText:
      overrides.passiveText ??
      `${name}は自身のATK {v}の追加ダメージを与え、指定した味方のATKが{b}アップする。`,
    passive2: seed.passive2,
    passive2TargetMode: seed.passive2TargetMode ?? 'select-one',
    passive2Buff: seed.passive2Buff,
    passive2Text: overrides.passive2Text ?? `${name}は戦闘開始時、指定した味方のATKが{b}アップする。`,
    combat: seed.combat ?? {},
    damageComponents,
    effects: seed.effects ?? [],
    shackles: overrides.shackles ?? [
      { name: '転覆', text: '必殺技の継続時間が5秒延長する' },
      { name: '枷共鳴 I', text: '通常攻撃ダメージが5%アップする' },
      { name: 'エンカウント', text: `${name}の周囲に敵が1体のみ存在する場合、与ダメージが20%アップする。` },
      { name: '枷共鳴 II', text: '必殺技ダメージが10%アップする' },
      { name: '解放', text: '必殺技のクールタイムが2秒短縮する' },
    ],
    exclusive: { ...seed.exclusive, text: overrides.exclusiveText ?? '被ダメージが{v}ダウン' },
    rebuild: buildRebuild(name, ...seed.rebuildUlts),
  }
}

export const coefAt = (base: number, perLevel: number, lv: number) => base + perLevel * (lv - 1)

export const valueAt = (values: number[], lv: number) => values[lv - 1]

export const formatPct = (n: number) => `${Number((n * 100).toFixed(2))}%`

export { linearLevels }
