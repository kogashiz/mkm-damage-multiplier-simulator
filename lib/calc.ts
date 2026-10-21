import { CHARACTER_MAP, coefAt, type Character } from './characters'
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
  return summarizeRebuild(character.rebuild, rebuild).mods.ultimateName ?? character.ultimate.name
}

export function calculateParty(slots: SlotState[]): SlotResult[] {
  const buffs = new Array<number>(slots.length).fill(0)
  const resolveTarget = (target: number, self: number) => (slots[target]?.characterId ? target : self)

  slots.forEach((slot, index) => {
    const character = slot.characterId ? CHARACTER_MAP[slot.characterId] : null
    if (!character) return
    buffs[resolveTarget(slot.passiveTarget, index)] += coefAt(
      character.passive.buffBase,
      character.passive.buffPerLevel,
      slot.passiveLv,
    )
    buffs[resolveTarget(slot.passive2Target, index)] += coefAt(
      character.passive2.buffBase,
      character.passive2.buffPerLevel,
      slot.passive2Lv,
    )
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
        ultimateName: mods.ultimateName ?? character.ultimate.name,
        normal: coefAt(character.normal.base, character.normal.perLevel, slot.normalLv) * atkRatio * dmgAmp,
        ultimate:
          coefAt(character.ultimate.base, character.ultimate.perLevel, slot.ultimateLv) * atkRatio * dmgAmp * ultAmp,
        passive: coefAt(character.passive.base, character.passive.perLevel, slot.passiveLv) * atkRatio * dmgAmp,
      },
    ]
  })
}
