import { CHARACTER_MAP, type Character } from './characters'

export type SlotState = {
  characterId: string | null
  atk: string
  normalLv: number
  ultimateLv: number
  passive1Lv: number
  passive2Lv: number
  /** パッシブバフの対象スロット番号（自分自身を含む） */
  passive1Target: number
  passive2Target: number
}

export type SlotResult = {
  slotIndex: number
  character: Character
  atk: number
  buffRate: number
  effectiveAtk: number
  normal: number
  ultimate: number
  passive1: number
  passive2: number
}

export const SLOT_COUNT = 6

export function createEmptySlot(slotIndex: number): SlotState {
  return {
    characterId: null,
    atk: '',
    normalLv: 1,
    ultimateLv: 1,
    passive1Lv: 1,
    passive2Lv: 1,
    passive1Target: slotIndex,
    passive2Target: slotIndex,
  }
}

const coefAt = (base: number, perLevel: number, lv: number) => base + perLevel * (lv - 1)

export function calculateParty(slots: SlotState[]): SlotResult[] {
  const buffs = new Array<number>(slots.length).fill(0)

  slots.forEach((slot, index) => {
    const character = slot.characterId ? CHARACTER_MAP[slot.characterId] : null
    if (!character) return
    const passive1Target = slots[slot.passive1Target]?.characterId ? slot.passive1Target : index
    const passive2Target = slots[slot.passive2Target]?.characterId ? slot.passive2Target : index
    buffs[passive1Target] += coefAt(character.passive1.buffBase, character.passive1.buffPerLevel, slot.passive1Lv)
    buffs[passive2Target] += coefAt(character.passive2.buffBase, character.passive2.buffPerLevel, slot.passive2Lv)
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
        passive1: coefAt(character.passive1.base, character.passive1.perLevel, slot.passive1Lv) * amp,
        passive2: coefAt(character.passive2.base, character.passive2.perLevel, slot.passive2Lv) * amp,
      },
    ]
  })
}
