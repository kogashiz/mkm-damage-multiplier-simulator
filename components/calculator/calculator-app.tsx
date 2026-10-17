'use client'

import { useMemo, useState } from 'react'
import { CHARACTER_MAP } from '@/lib/characters'
import { SLOT_COUNT, calculateParty, createEmptySlot, type SlotState } from '@/lib/calc'
import { AppHeader } from './app-header'
import { CharacterSlot } from './character-slot'
import { CharacterSelectModal } from './character-select-modal'
import { ResultView } from './result-view'

function createInitialSlots(): SlotState[] {
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => createEmptySlot(i))
  slots[0] = { characterId: 'zoya', atk: '100', normalLv: 3, ultimateLv: 3, passiveLv: 3, passiveTarget: 1 }
  slots[1] = { characterId: 'nox', atk: '100', normalLv: 3, ultimateLv: 3, passiveLv: 3, passiveTarget: 1 }
  return slots
}

export function CalculatorApp() {
  const [slots, setSlots] = useState<SlotState[]>(createInitialSlots)
  const [selectingSlot, setSelectingSlot] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const results = useMemo(() => calculateParty(slots), [slots])
  const filledCount = results.length

  const updateSlot = (index: number, patch: Partial<SlotState>) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  const assignCharacter = (characterId: string) => {
    if (selectingSlot === null) return
    const character = CHARACTER_MAP[characterId]
    setSlots((prev) =>
      prev.map((s, i) =>
        i === selectingSlot
          ? {
              ...s,
              characterId,
              atk: s.characterId ? s.atk : String(character.defaultAtk),
              passiveTarget: s.characterId ? s.passiveTarget : i,
            }
          : s,
      ),
    )
    setSelectingSlot(null)
  }

  const clearSlot = (index: number) => {
    setSlots((prev) =>
      prev.map((s, i) => {
        if (i === index) return createEmptySlot(i)
        if (s.passiveTarget === index) return { ...s, passiveTarget: i }
        return s
      }),
    )
  }

  const usedIds = slots.flatMap((s, i) => (s.characterId && i !== selectingSlot ? [s.characterId] : []))
  const memberOptions = slots.flatMap((s, i) =>
    s.characterId ? [{ slotIndex: i, name: CHARACTER_MAP[s.characterId].name }] : [],
  )

  if (showResult) {
    return <ResultView results={results} onClose={() => setShowResult(false)} />
  }

  return (
    <div className="min-h-dvh">
      <AppHeader
        subtitle="表示・設定画面"
        action={
          <button
            type="button"
            onClick={() => setShowResult(true)}
            disabled={filledCount === 0}
            className="cyber-clip bg-primary px-8 py-2.5 text-sm font-bold tracking-widest text-primary-foreground shadow-[0_0_24px_-4px_var(--primary)] transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            計算
          </button>
        }
      >
        <p className="font-mono text-xs text-muted-foreground">
          編成 <span className="text-primary">{filledCount}</span> / {SLOT_COUNT}
        </p>
      </AppHeader>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
        <h2 className="sr-only">パーティ設定</h2>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot, i) => (
            <li key={i}>
              <CharacterSlot
                index={i}
                slot={slot}
                memberOptions={memberOptions}
                onOpenSelect={() => setSelectingSlot(i)}
                onChange={(patch) => updateSlot(i, patch)}
                onClear={() => clearSlot(i)}
              />
            </li>
          ))}
        </ul>
      </main>

      <CharacterSelectModal
        open={selectingSlot !== null}
        slotIndex={selectingSlot}
        usedIds={usedIds}
        onSelect={assignCharacter}
        onClose={() => setSelectingSlot(null)}
      />
    </div>
  )
}
