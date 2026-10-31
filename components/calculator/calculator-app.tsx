'use client'

import { useMemo, useState } from 'react'
import { CHARACTER_MAP } from '@/lib/characters'
import {
  DEFAULT_ENEMY_SETTINGS,
  SLOT_COUNT,
  calculateParty,
  createEmptySlot,
  type EnemySettings,
  type SlotState,
} from '@/lib/calc'
import { AppHeader } from './app-header'
import { CharacterSlot } from './character-slot'
import { CharacterSelectModal } from './character-select-modal'
import { ResultView } from './result-view'

function createInitialSlots(): SlotState[] {
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => createEmptySlot(i))
  slots[0] = {
    ...slots[0],
    characterId: 'zoya',
    atk: '300',
    madness: true,
    shackle: 2,
    exclusiveLv: 2,
    normalLv: 1,
    ultimateLv: 2,
    passiveLv: 3,
    passiveTarget: 1,
    passive2Lv: 4,
    passive2Target: 1,
  }
  slots[1] = { ...slots[1], characterId: 'nox', atk: '100', normalLv: 3, ultimateLv: 3, passiveLv: 3, passiveTarget: 1 }
  return slots
}

export function CalculatorApp() {
  const [slots, setSlots] = useState<SlotState[]>(createInitialSlots)
  const [enemy, setEnemy] = useState<EnemySettings>(DEFAULT_ENEMY_SETTINGS)
  const [selectingSlot, setSelectingSlot] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const results = useMemo(() => calculateParty(slots, enemy), [slots, enemy])
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
              exclusiveLv: s.characterId === characterId ? s.exclusiveLv : 0,
              rebuild: s.characterId === characterId ? s.rebuild : [],
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
        return {
          ...s,
          passiveTarget: s.passiveTarget === index ? i : s.passiveTarget,
          passive2Target: s.passive2Target === index ? i : s.passive2Target,
        }
      }),
    )
  }

  const usedIds = slots.flatMap((s, i) => (s.characterId && i !== selectingSlot ? [s.characterId] : []))
  const memberOptions = slots.flatMap((s, i) =>
    s.characterId ? [{ slotIndex: i, name: CHARACTER_MAP[s.characterId].name }] : [],
  )

  if (showResult) {
    return <ResultView results={results} enemy={enemy} onClose={() => setShowResult(false)} />
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

      <EnemySettingsPanel enemy={enemy} onChange={setEnemy} />

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

function EnemySettingsPanel({
  enemy,
  onChange,
}: {
  enemy: EnemySettings
  onChange: (enemy: EnemySettings) => void
}) {
  const updateDefense = (key: 'def' | 'mdf', value: string) => {
    const parsed = Number(value)
    onChange({ ...enemy, [key]: Number.isFinite(parsed) ? Math.max(0, parsed) : 0 })
  }

  return (
    <section
      aria-label="敵・戦闘状態"
      className="mx-auto mt-5 grid max-w-7xl grid-cols-1 gap-4 border border-border bg-card p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)]"
    >
      <EnemyDefenseField
        id="enemy-def"
        label="敵 DEF"
        note="物理ダメージで使用"
        value={enemy.def}
        onChange={(value) => updateDefense('def', value)}
      />
      <EnemyDefenseField
        id="enemy-mdf"
        label="敵 MDF"
        note="魔法ダメージで使用"
        value={enemy.mdf}
        onChange={(value) => updateDefense('mdf', value)}
      />
      <label className="flex min-h-14 cursor-pointer items-center gap-3 border border-border bg-background px-3 py-3 transition hover:border-primary/60">
        <input
          type="checkbox"
          checked={enemy.isBreak}
          onChange={(event) => onChange({ ...enemy, isBreak: event.target.checked })}
          className="size-5 accent-primary"
        />
        <span className="font-bold">Break中</span>
      </label>
    </section>
  )
}

function EnemyDefenseField({
  id,
  label,
  note,
  value,
  onChange,
}: {
  id: string
  label: string
  note: string
  value: number
  onChange: (value: string) => void
}) {
  return (
    <label htmlFor={id} className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1">
      <span className="text-sm">{label}</span>
      <span className="row-span-2 text-right text-xs text-muted-foreground">{note}</span>
      <input
        id={id}
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 min-w-0 border border-accent/60 bg-input px-3 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  )
}
