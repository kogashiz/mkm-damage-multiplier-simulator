'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Info, Plus, RefreshCw, X } from 'lucide-react'
import {
  CHARACTER_MAP,
  CLASS_LABELS,
  MAX_EXCLUSIVE_LEVEL,
  MAX_SHACKLE,
  MAX_SKILL_LEVEL,
} from '@/lib/characters'
import { currentUltimateName, type SigilSlot, type SlotState } from '@/lib/calc'
import { MAX_SIGIL_LEVEL, SIGIL_PARTS, SIGIL_SET_MAP, type SigilPart } from '@/lib/sigils'
import { InfoModal } from './info-modal'
import { RebuildModal } from './rebuild-modal'
import { SigilSelectModal, SigilSetModal } from './sigil-modals'

type MemberOption = { slotIndex: number; name: string }

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
const SKILL_LEVELS = range(1, MAX_SKILL_LEVEL)
const SHACKLE_LEVELS = range(0, MAX_SHACKLE)
const EXCLUSIVE_LEVELS = range(0, MAX_EXCLUSIVE_LEVEL)
const SIGIL_LEVELS = range(1, MAX_SIGIL_LEVEL)

const fieldClass =
  'h-9 w-full rounded-none border border-accent/60 bg-input px-2 font-mono text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'

const infoButtonClass =
  'grid size-7 shrink-0 place-items-center rounded-full border border-accent bg-background/80 text-accent shadow-[0_0_12px_-2px_var(--accent)] transition hover:bg-accent hover:text-accent-foreground'

export function CharacterSlot({
  index,
  slot,
  memberOptions,
  onOpenSelect,
  onChange,
  onClear,
}: {
  index: number
  slot: SlotState
  memberOptions: MemberOption[]
  onOpenSelect: () => void
  onChange: (patch: Partial<SlotState>) => void
  onClear: () => void
}) {
  const character = slot.characterId ? CHARACTER_MAP[slot.characterId] : null
  const slotLabel = String(index + 1).padStart(2, '0')

  return (
    <article
      aria-label={`スロット${slotLabel}: ${character?.name ?? '未選択'}`}
      className="cyber-clip-lg relative flex h-[44rem] flex-col border border-border bg-card"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-primary">{slotLabel}</span>
          <span
            className={`border px-3 py-0.5 text-sm ${
              character ? 'border-accent/70 font-bold' : 'border-border text-muted-foreground'
            }`}
          >
            {character?.name ?? '未選択'}
          </span>
        </div>
        {character && (
          <div className="flex items-center gap-1">
            <span className="mr-1 font-mono text-[10px] tracking-widest text-muted-foreground">
              {CLASS_LABELS[character.className]}
            </span>
            <button
              type="button"
              onClick={onClear}
              className="grid size-7 place-items-center text-muted-foreground transition hover:bg-primary/15 hover:text-primary"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">{character.name}を編成から外す</span>
            </button>
          </div>
        )}
      </div>

      {character ? (
        <FilledSlot
          index={index}
          slot={slot}
          memberOptions={memberOptions}
          onOpenSelect={onOpenSelect}
          onChange={onChange}
        />
      ) : (
        <button
          type="button"
          onClick={onOpenSelect}
          className="group cyber-grid relative grid flex-1 place-items-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        >
          <span className="flex flex-col items-center gap-3">
            <span className="grid size-16 place-items-center border border-dashed border-accent/60 text-accent transition group-hover:border-primary group-hover:bg-primary/10 group-hover:text-primary">
              <Plus className="size-8" aria-hidden="true" />
            </span>
            <span className="text-xs tracking-widest text-muted-foreground">キャラクターを選択</span>
          </span>
        </button>
      )}
    </article>
  )
}

function FilledSlot({
  index,
  slot,
  memberOptions,
  onOpenSelect,
  onChange,
}: {
  index: number
  slot: SlotState
  memberOptions: MemberOption[]
  onOpenSelect: () => void
  onChange: (patch: Partial<SlotState>) => void
}) {
  const character = CHARACTER_MAP[slot.characterId as string]
  const idPrefix = `slot-${index}`
  const [infoOpen, setInfoOpen] = useState(false)
  const [setInfoOpen2, setSetInfoOpen] = useState(false)
  const [rebuildOpen, setRebuildOpen] = useState(false)
  const [sigilPart, setSigilPart] = useState<SigilPart | null>(null)

  const updateSigil = (part: number, patch: Partial<SigilSlot>) =>
    onChange({ sigils: slot.sigils.map((s, i) => (i === part ? { ...s, ...patch } : s)) })

  const rebuildApplied = slot.rebuild.length > 0
  const ultimateName = currentUltimateName(character, slot.rebuild)

  const targetSelect = (id: string, label: string, value: number, key: 'passiveTarget' | 'passive2Target') => (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="shrink-0 text-xs text-muted-foreground">{'自 ⇒'}</span>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange({ [key]: Number(e.target.value) })}
        className={`${fieldClass} min-w-0`}
      >
        {memberOptions.map((m) => (
          <option key={m.slotIndex} value={m.slotIndex}>
            {m.slotIndex === index ? '自' : m.name}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <>
      <div className="group relative aspect-[16/9] w-full shrink-0 overflow-hidden border-b border-border bg-secondary">
        <Image
          src={character.image || '/placeholder.svg'}
          alt={`${character.name}の立ち絵`}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-[50%_20%] transition duration-500 group-hover:scale-105"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <button
          type="button"
          onClick={onOpenSelect}
          className="absolute right-2 top-2 flex items-center gap-1.5 border border-border bg-background/85 px-2 py-1 text-xs transition hover:border-primary hover:text-primary focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <RefreshCw className="size-3" aria-hidden="true" />
          キャラ変更
        </button>
        <button type="button" onClick={() => setInfoOpen(true)} className={`${infoButtonClass} absolute bottom-2 right-2`}>
          <Info className="size-4" aria-hidden="true" />
          <span className="sr-only">{character.name}の情報を表示</span>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <section aria-label="基本設定" className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-border p-4">
          <button
            type="button"
            aria-pressed={slot.madness}
            onClick={() => onChange({ madness: !slot.madness })}
            className={`cyber-clip flex h-9 items-center justify-center gap-2 border text-sm font-bold transition ${
              slot.madness
                ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_18px_-4px_var(--primary)]'
                : 'border-border bg-muted text-muted-foreground hover:border-accent/60 hover:text-foreground'
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${slot.madness ? 'bg-primary-foreground' : 'bg-muted-foreground/60'}`}
            />
            狂瞳深化
          </button>
          <LabeledField id={`${idPrefix}-atk`} label="ATK" mono>
            <input
              id={`${idPrefix}-atk`}
              type="number"
              inputMode="numeric"
              min={0}
              value={slot.atk}
              onChange={(e) => onChange({ atk: e.target.value })}
              className={`${fieldClass} text-right`}
            />
          </LabeledField>
          <LabeledField id={`${idPrefix}-shackle`} label="枷">
            <NumberSelect
              id={`${idPrefix}-shackle`}
              value={slot.shackle}
              options={SHACKLE_LEVELS}
              onChange={(v) => onChange({ shackle: v })}
            />
          </LabeledField>
          <LabeledField id={`${idPrefix}-exclusive`} label="専属刻印">
            <NumberSelect
              id={`${idPrefix}-exclusive`}
              value={slot.exclusiveLv}
              options={EXCLUSIVE_LEVELS}
              format={(v) => (v === 0 ? '—' : String(v))}
              onChange={(v) => onChange({ exclusiveLv: v })}
            />
          </LabeledField>
        </section>

        <section aria-label="スキル" className="flex flex-col gap-3 border-b border-border p-4">
          <SkillRow
            id={`${idPrefix}-normal`}
            label="通常Lv"
            value={slot.normalLv}
            onChange={(v) => onChange({ normalLv: v })}
            target={<TargetText />}
          />
          <SkillRow
            id={`${idPrefix}-ult`}
            label="必殺Lv"
            value={slot.ultimateLv}
            onChange={(v) => onChange({ ultimateLv: v })}
            target={<TargetText />}
          />
          <SkillRow
            id={`${idPrefix}-passive`}
            label="パッシブ1Lv"
            value={slot.passiveLv}
            onChange={(v) => onChange({ passiveLv: v })}
            target={targetSelect(`${idPrefix}-passive-target`, 'パッシブ1バフ対象', slot.passiveTarget, 'passiveTarget')}
          />
          <SkillRow
            id={`${idPrefix}-passive2`}
            label="パッシブ2Lv"
            value={slot.passive2Lv}
            onChange={(v) => onChange({ passive2Lv: v })}
            target={targetSelect(
              `${idPrefix}-passive2-target`,
              'パッシブ2バフ対象',
              slot.passive2Target,
              'passive2Target',
            )}
          />
        </section>

        <section aria-labelledby={`${idPrefix}-sigil-title`} className="border-b border-border p-4">
          <div className="mb-3 flex items-center gap-2">
            <h3 id={`${idPrefix}-sigil-title`} className="text-sm font-bold">
              罪の刻印
            </h3>
            <button type="button" onClick={() => setSetInfoOpen(true)} className={infoButtonClass}>
              <Info className="size-4" aria-hidden="true" />
              <span className="sr-only">罪の刻印の効果を表示</span>
            </button>
          </div>
          <ul className="grid grid-cols-3 gap-3">
            {slot.sigils.map((s, i) => {
              const set = s.setId ? SIGIL_SET_MAP[s.setId] : null
              const part = SIGIL_PARTS[i]
              return (
                <li key={i} className="flex flex-col items-center gap-1.5">
                  <span className="font-mono text-xs text-accent">{part}</span>
                  <button
                    type="button"
                    onClick={() => setSigilPart(i as SigilPart)}
                    className="group relative grid aspect-square w-full place-items-center overflow-hidden border border-border bg-secondary transition hover:border-primary hover:shadow-[0_0_16px_-4px_var(--primary)]"
                  >
                    {set ? (
                      <Image src={set.image || '/placeholder.svg'} alt="" fill sizes="120px" className="object-cover" />
                    ) : (
                      <Plus className="size-6 text-muted-foreground transition group-hover:text-primary" aria-hidden="true" />
                    )}
                    <span className="sr-only">{`部位${part}の刻印を選択（現在：${set?.name ?? '未装着'}）`}</span>
                  </button>
                  <span className="w-full truncate text-center text-[11px] text-muted-foreground">
                    {set?.name ?? '未装着'}
                  </span>
                  <div className="flex w-full items-center gap-1">
                    <label htmlFor={`${idPrefix}-sigil-${i}`} className="font-mono text-xs">
                      Lv
                    </label>
                    <NumberSelect
                      id={`${idPrefix}-sigil-${i}`}
                      value={s.lv}
                      options={SIGIL_LEVELS}
                      onChange={(v) => updateSigil(i, { lv: v })}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-label="再構築" className="flex items-center gap-3 p-4">
          <span className="text-sm font-bold">再構築</span>
          <button
            type="button"
            onClick={() => setRebuildOpen(true)}
            className={`relative size-11 shrink-0 overflow-hidden border transition hover:border-primary hover:shadow-[0_0_16px_-4px_var(--primary)] ${
              rebuildApplied ? 'border-primary' : 'border-border'
            }`}
          >
            <Image src="/rebuild-icon.png" alt="" fill sizes="44px" className="object-cover" />
            <span className="sr-only">再構築を設定</span>
          </button>
          <div className="min-w-0">
            {rebuildApplied && (
              <span className="mb-0.5 inline-block bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                適用中
              </span>
            )}
            <p className="truncate text-sm">
              <span className={rebuildApplied ? 'font-bold' : 'text-muted-foreground'}>{ultimateName}</span>
              <span className="ml-2 text-xs text-muted-foreground">{'自 ⇒ 自'}</span>
            </p>
          </div>
        </section>
      </div>

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} character={character} slot={slot} />
      <SigilSetModal open={setInfoOpen2} onClose={() => setSetInfoOpen(false)} sigils={slot.sigils} />
      <SigilSelectModal
        part={sigilPart}
        current={sigilPart === null ? null : slot.sigils[sigilPart].setId}
        onSelect={(setId) => {
          if (sigilPart !== null) updateSigil(sigilPart, { setId })
          setSigilPart(null)
        }}
        onClose={() => setSigilPart(null)}
      />
      <RebuildModal
        open={rebuildOpen}
        onClose={() => setRebuildOpen(false)}
        character={character}
        applied={slot.rebuild}
        onApply={(ids) => {
          onChange({ rebuild: ids })
          setRebuildOpen(false)
        }}
      />
    </>
  )
}

function LabeledField({
  id,
  label,
  mono,
  children,
}: {
  id: string
  label: string
  mono?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className={`shrink-0 text-sm ${mono ? 'font-mono tracking-widest' : ''}`}>
        {label}
      </label>
      {children}
    </div>
  )
}

function NumberSelect({
  id,
  value,
  options,
  onChange,
  format = String,
}: {
  id: string
  value: number
  options: number[]
  onChange: (value: number) => void
  format?: (v: number) => string
}) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(Number(e.target.value))} className={fieldClass}>
      {options.map((v) => (
        <option key={v} value={v}>
          {format(v)}
        </option>
      ))}
    </select>
  )
}

function SkillRow({
  id,
  label,
  value,
  onChange,
  target,
}: {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  target: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[6rem_4.5rem_1fr] items-center gap-3">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <NumberSelect id={id} value={value} options={SKILL_LEVELS} onChange={onChange} />
      <div className="min-w-0">{target}</div>
    </div>
  )
}

function TargetText() {
  return <span className="text-xs text-muted-foreground">{'自 ⇒ 自'}</span>
}
