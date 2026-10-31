import { CHARACTER_MAP, coefAt, valueAt, type BuffTargetMode, type Character } from './characters'
import { summarizeRebuild } from './rebuild'
import { activeSet, sigilStatAt, type SigilPart } from './sigils'

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
    sigils: [0, 1, 2].map(() => ({ setId: null, lv: 1 })),
    rebuild: [],
  }
}

export function currentUltimateName(character: Character, rebuild: string[]) {
  return summarizeRebuild(character.rebuild, rebuild).mods.ultimateName ?? character.ultimateName
}

export function calculateParty(slots: SlotState[]): SlotResult[] {
  const buffs = new Array<number>(slots.length).fill(0)
  const resolveTargets = (mode: BuffTargetMode, selectedTarget: number, self: number) => {
    if (mode === 'self') return [self]
    if (mode === 'all') return slots.flatMap((slot, index) => (slot.characterId ? [index] : []))
    return [slots[selectedTarget]?.characterId ? selectedTarget : self]
  }

  slots.forEach((slot, index) => {
    const character = slot.characterId ? CHARACTER_MAP[slot.characterId] : null
    if (!character) return
    const passiveBuff = valueAt(character.passiveBuff, slot.passiveLv)
    const passive2Buff = valueAt(character.passive2, slot.passive2Lv)
    resolveTargets(character.passiveBuffTargetMode, slot.passiveTarget, index).forEach((target) => {
      buffs[target] += passiveBuff
    })
    resolveTargets(character.passive2TargetMode, slot.passive2Target, index).forEach((target) => {
      buffs[target] += passive2Buff
    })
  })

  return slots.flatMap((slot, index) => {
    const character = slot.characterId ? CHARACTER_MAP[slot.characterId] : null
    if (!character) return []

    const { mods } = summarizeRebuild(character.rebuild, slot.rebuild)
    const set = activeSet(slot.sigils)
    const sigilAtkPct = slot.sigils[0].setId ? sigilStatAt(0 as SigilPart, slot.sigils[0].lv) : 0

    const atk = Math.max(0, Number(slot.atk) || 0)
    const atkAmp = 1 + buffs[index] + sigilAtkPct + mods.atkPct
    const effectiveAtk = (atk + mods.atkFlat) * atkAmp
    const atkRatio = atk > 0 ? effectiveAtk / atk : atkAmp

    const dmgBonus = (slot.madness ? character.madness.dmgPct : 0) + mods.dmgPct + (set?.setEffect.dmgPct ?? 0)
    const dmgAmp = 1 + dmgBonus
    const ultAmp = (1 + mods.ultDmgPct + (set?.setEffect.ultDmgPct ?? 0)) * mods.ultimateScale

    return [
      {
        slotIndex: index,
        character,
        atk,
        buffRate: buffs[index],
        effectiveAtk,
        dmgBonus,
        ultimateName: mods.ultimateName ?? character.ultimateName,
        normal: valueAt(character.normal, slot.normalLv) * atkRatio * dmgAmp,
        ultimate: valueAt(character.ultimate, slot.ultimateLv) * atkRatio * dmgAmp * ultAmp,
        passive: valueAt(character.passive, slot.passiveLv) * atkRatio * dmgAmp,
      },
    ]
  })
}
