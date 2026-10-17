import { CHARACTER_MAP, type Character } from './characters'

export type SlotState = {
  characterId: string | null
  atk: string
  normalLv: number
  ultimateLv: number
  passiveLv: number
  /** パッシブバフの対象スロット番号（自分自身を含む） */
  passiveTarget: number
}

export type SlotResult = {
  slotIndex: number
  character: Character
  atk: number
  buffRate: number
  effectiveAtk: number
  normal: number
  ultimate: number
  passive: number
}

export const SLOT_COUNT = 6

export function createEmptySlot(slotIndex: number): SlotState {
  return {
    characterId: null,
    atk: '',
    normalLv: 1,
    ultimateLv: 1,
    passiveLv: 1,
    passiveTarget: slotIndex,
  }
}

const coefAt = (base: number, perLevel: number, lv: number) => base + perLevel * (lv - 1)

export function calculateParty(slots: SlotState[]): SlotResult[] {
  const buffs = new Array<number>(slots.length).fill(0)

  slots.forEach((slot, index) => {
    const character = slot.characterId ? CHARACTER_MAP[slot.characterId] : null
    if (!character) return
    const target = slots[slot.passiveTarget]?.characterId ? slot.passiveTarget : index
    buffs[target] += coefAt(character.passive.buffBase, character.passive.buffPerLevel, slot.passiveLv)
  })

  return slots.flatMap((slot, index) => {
    const character = slot.characterId ? CHARACTER_MAP[slot.characterId] : null
    if (!character) return []
    const atk = Math.max(0, Number(slot.atk) || 0)
    const amp = 1 + buffs[index]
    return [
      {
        slotIndex: index,
        character,
        atk,
        buffRate: buffs[index],
        effectiveAtk: atk * amp,
        normal: coefAt(character.normal.base, character.normal.perLevel, slot.normalLv) * amp,
        ultimate: coefAt(character.ultimate.base, character.ultimate.perLevel, slot.ultimateLv) * amp,
        passive: coefAt(character.passive.base, character.passive.perLevel, slot.passiveLv) * amp,
      },
    ]
  })
}
