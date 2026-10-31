import { CHARACTER_MAP, valueAt, type BuffTargetMode, type Character } from './characters'
import {
  calculateDamageComponents,
  resolveCharacterEffects,
  resolveDamageComponents,
  type CalculatedDamageComponent,
  type ResolvedCharacterEffect,
  type SkillLevels,
} from './damage-model'
import { summarizeRebuild } from './rebuild'
import { activeSets, MAX_RIFT_STACKS, sigilPartStat, type SigilPart } from './sigils'

export type SigilSlot = { setId: string | null; lv: number }

export type SlotState = {
  characterId: string | null
  atk: string
  madness: boolean
  shackle: number
  exclusiveLv: number
  normalLv: number
  ultimateLv: number
  passiveLv: number
  /** パッシブバフの対象スロット番号（自分自身を含む） */
  passiveTarget: number
  passive2Lv: number
  passive2Target: number
  defeatedEnemyCount: number
  singleEnemyInRange: boolean
  riftStacks: number
  sigils: SigilSlot[]
  /** 適用中の再構築の行ID */
  rebuild: string[]
}

export type SlotResult = {
  slotIndex: number
  character: Character
  atk: number
  buffRate: number
  effectiveAtk: number
  dmgBonus: number
  ultimateName: string
  normal: number
  ultimate: number
  passive: number
  damageComponents: CalculatedDamageComponent[]
  effects: ResolvedCharacterEffect[]
  sigilStats: {
    atkPct: number
    hpPct: number
    attackSpeedPct: number
    initialEnergy: number
  }
}

export type EnemySettings = {
  def: number
  mdf: number
  isBreak: boolean
}

export const DEFAULT_ENEMY_SETTINGS: EnemySettings = {
  def: 0,
  mdf: 0,
  isBreak: false,
}

export const SLOT_COUNT = 6

export function createEmptySlot(slotIndex: number): SlotState {
  return {
    characterId: null,
    atk: '',
    madness: false,
    shackle: 0,
    exclusiveLv: 0,
    normalLv: 1,
    ultimateLv: 1,
    passiveLv: 1,
    passiveTarget: slotIndex,
    passive2Lv: 1,
    passive2Target: slotIndex,
    defeatedEnemyCount: 0,
    singleEnemyInRange: false,
    riftStacks: 0,
    sigils: [0, 1, 2].map(() => ({ setId: null, lv: 1 })),
    rebuild: [],
  }
}

export function currentUltimateName(character: Character, rebuild: string[]) {
  return summarizeRebuild(character.rebuild, rebuild).mods.ultimateName ?? character.ultimateName
}

function resolvePartyBuffs(slots: SlotState[]) {
  const buffs = new Array<number>(slots.length).fill(0)
  const resolveTargets = (mode: BuffTargetMode, selectedTarget: number, self: number) => {
    if (mode === 'self') return [self]
    if (mode === 'all') return slots.flatMap((slot, index) => (slot.characterId ? [index] : []))
    if (mode === 'none' || mode === 'enemy-all') return []
    return [slots[selectedTarget]?.characterId ? selectedTarget : self]
  }

  slots.forEach((slot, index) => {
    const character = slot.characterId ? CHARACTER_MAP[slot.characterId] : null
    if (!character) return
    const passiveBuff = valueAt(character.passiveBuff, slot.passiveLv)
    const passive2Buff = character.passive2Buff
      ? valueAt(character.passive2Buff, slot.passive2Lv)
      : valueAt(character.passive2, slot.passive2Lv)
    resolveTargets(character.passiveBuffTargetMode, slot.passiveTarget, index).forEach((target) => {
      buffs[target] += passiveBuff
    })
    resolveTargets(character.passive2TargetMode, slot.passive2Target, index).forEach((target) => {
      buffs[target] += passive2Buff
    })
  })

  return buffs
}

function calculateSlotResult(
  slot: SlotState,
  slotIndex: number,
  buffRate: number,
  enemy: EnemySettings,
  enemyDef: number,
): SlotResult | null {
  const character = slot.characterId ? CHARACTER_MAP[slot.characterId] : null
  if (!character) return null

  const { mods } = summarizeRebuild(character.rebuild, slot.rebuild)
  const sets = activeSets(slot.sigils)
  const sigilStats = slot.sigils.reduce(
    (total, sigil, index) => {
      if (!sigil.setId) return total
      const stat = sigilPartStat(sigil.setId, index as SigilPart, sigil.lv)
      if (!stat) return total
      if (stat.kind === 'atkPct') total.atkPct += stat.value
      if (stat.kind === 'hpPct') total.hpPct += stat.value
      if (stat.kind === 'attackSpeedPct') total.attackSpeedPct += stat.value
      return total
    },
    { atkPct: 0, hpPct: 0, attackSpeedPct: 0, initialEnergy: 0 },
  )
  sigilStats.initialEnergy = sets.reduce(
    (total, set) => total + (set.setEffect.initialEnergy ?? 0),
    0,
  )

  const atk = Math.max(0, Number(slot.atk) || 0)
  const defeatedEnemyAtkPct =
    character.combat.attackPerDefeatedEnemyPct !== undefined &&
    character.combat.attackPerDefeatedEnemyCapByLevel
      ? Math.min(
          slot.defeatedEnemyCount * character.combat.attackPerDefeatedEnemyPct,
          valueAt(character.combat.attackPerDefeatedEnemyCapByLevel, slot.passiveLv),
        )
      : 0
  const atkAmp = 1 + buffRate + sigilStats.atkPct + mods.atkPct + defeatedEnemyAtkPct
  const effectiveAtk = (atk + mods.atkFlat) * atkAmp
  const atkRatio = atk > 0 ? effectiveAtk / atk : atkAmp

  const dmgBonus =
    character.traitDamagePct +
    (slot.madness ? character.madness.dmgPct : 0) +
    mods.dmgPct
  const dmgAmp = 1 + dmgBonus
  const ultAmp = (1 + mods.ultDmgPct) * mods.ultimateScale
  const normalDamagePct =
    character.combat.normalDamagePctByShackle?.[slot.shackle] ?? 0
  const singleEnemyDamagePct = slot.singleEnemyInRange
    ? character.combat.singleEnemyDamagePctByShackle?.[slot.shackle] ?? 0
    : 0
  const coreBrokenDamagePct =
    enemy.isBreak
      ? character.traitCoreBrokenDamagePct +
        (slot.madness ? character.madnessCoreBrokenDamagePct : 0) +
        (character.combat.coreBrokenDamagePct ?? 0) +
        sets.reduce((total, set) => total + (set.setEffect.breakDamagePct ?? 0), 0)
      : 0
  const attackDamageAmp = dmgAmp * (1 + coreBrokenDamagePct) * (1 + singleEnemyDamagePct)
  const normalDamageAmp = attackDamageAmp * (1 + normalDamagePct)
  const skillLevels: SkillLevels = {
    normal: slot.normalLv,
    ultimate: slot.ultimateLv,
    passive: slot.passiveLv,
    passive2: slot.passive2Lv,
  }
  const damageComponents = resolveDamageComponents(character.damageComponents, skillLevels)
  const exclusiveCoefficient = character.combat.exclusiveDamageCoefficients?.[slot.exclusiveLv]
  if (slot.exclusiveLv > 0 && exclusiveCoefficient !== undefined) {
    damageComponents.push({
      id: 'exclusive-ultimate-damage',
      skill: 'ultimate',
      trigger: 'ultimate',
      label: '専属刻印 必殺技追加攻撃',
      category: 'skill',
      damageType: 'physical',
      hitCount: 1,
      sourceKind: 'attack-coefficient',
      coefficientPerHit: exclusiveCoefficient,
      coefficientTotal: exclusiveCoefficient,
    })
  }

  return {
    slotIndex,
    character,
    atk,
    buffRate: buffRate + defeatedEnemyAtkPct,
    effectiveAtk,
    dmgBonus,
    ultimateName: mods.ultimateName ?? character.ultimateName,
    normal:
      valueAt(character.normal, slot.normalLv) *
      atkRatio *
      normalDamageAmp *
      (enemy.isBreak ? 1.5 : 1),
    ultimate:
      valueAt(character.ultimate, slot.ultimateLv) *
      atkRatio *
      attackDamageAmp *
      ultAmp *
      (enemy.isBreak ? 1.5 : 1),
    passive:
      valueAt(character.passive, slot.passiveLv) *
      atkRatio *
      attackDamageAmp *
      (enemy.isBreak ? 1.5 : 1),
    damageComponents: calculateDamageComponents(damageComponents, {
      finalAttack: effectiveAtk,
      enemyDef,
      enemyMdf: enemy.mdf,
      isBreak: enemy.isBreak,
      damageMultiplier: dmgAmp,
      ultimateMultiplier: ultAmp,
      normalDamageMultiplier: 1 + normalDamagePct,
      coreBrokenDamageMultiplier: (1 + coreBrokenDamagePct) * (1 + singleEnemyDamagePct),
      physicalDefensePenetrationPct:
        character.combat.physicalDefensePenetrationPct ??
        (slot.madness ? character.combat.madnessPhysicalDefensePenetrationPct : 0),
    }),
    effects: resolveCharacterEffects(character.effects, skillLevels),
    sigilStats: {
      atkPct: sigilStats.atkPct,
      hpPct: sigilStats.hpPct,
      attackSpeedPct: sigilStats.attackSpeedPct,
      initialEnergy: sigilStats.initialEnergy,
    },
  }
}

export function calculateParty(
  slots: SlotState[],
  enemy: EnemySettings = DEFAULT_ENEMY_SETTINGS,
): SlotResult[] {
  const buffs = resolvePartyBuffs(slots)
  const noxDefenseReduction = slots.reduce((reduction, slot) => {
    const character = slot.characterId ? CHARACTER_MAP[slot.characterId] : null
    const values = character?.combat.enemyDefenseReductionByLevel
    return values ? Math.max(reduction, valueAt(values, slot.passive2Lv)) : reduction
  }, 0)
  const riftDefenseReduction = slots.reduce((reduction, slot) => {
    const activeRift = activeSets(slot.sigils).find((set) => set.id === 'rift')
    return activeRift
      ? Math.max(
          reduction,
          Math.min(slot.riftStacks, activeRift.setEffect.maxStacks ?? MAX_RIFT_STACKS) *
            (activeRift.setEffect.normalAttackDefenseReductionPct ?? 0),
        )
      : reduction
  }, 0)
  const enemyDefenseReduction = Math.min(1, noxDefenseReduction + riftDefenseReduction)
  const effectiveEnemyDef = enemy.def * (1 - enemyDefenseReduction)
  return slots.flatMap((slot, index) => {
    const result = calculateSlotResult(slot, index, buffs[index], enemy, effectiveEnemyDef)
    return result ? [result] : []
  })
}
