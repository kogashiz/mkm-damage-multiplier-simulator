import Image from 'next/image'
import { Plus, RefreshCw, X } from 'lucide-react'
import { CHARACTER_MAP, CLASS_LABELS, MAX_SKILL_LEVEL } from '@/lib/characters'
import type { SlotState } from '@/lib/calc'

type MemberOption = { slotIndex: number; name: string }

const LEVELS = Array.from({ length: MAX_SKILL_LEVEL }, (_, i) => i + 1)

const fieldClass =
  'h-9 w-full rounded-none border border-accent/60 bg-input px-2 font-mono text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:border-border disabled:opacity-50'

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
  const disabled = !character
  const slotLabel = String(index + 1).padStart(2, '0')
  const idPrefix = `slot-${index}`

  return (
    <article
      aria-label={`スロット${slotLabel}: ${character?.name ?? '未選択'}`}
      className="cyber-clip-lg relative flex h-full flex-col border border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
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

      <button
        type="button"
        onClick={onOpenSelect}
        className="group relative aspect-[4/3] w-full overflow-hidden border-b border-border bg-secondary outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        {character ? (
          <>
            <Image
              src={character.image || '/placeholder.svg'}
              alt={`${character.name}の立ち絵`}
              fill
              sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
              className="object-cover object-top transition duration-500 group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"
            />
            <span className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-background/80 px-2 py-1 text-xs opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              <RefreshCw className="size-3" aria-hidden="true" />
              キャラ変更
            </span>
          </>
        ) : (
          <span className="cyber-grid absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center border border-dashed border-accent/60 text-accent transition group-hover:border-primary group-hover:bg-primary/10 group-hover:text-primary">
              <Plus className="size-8" aria-hidden="true" />
            </span>
            <span className="sr-only">キャラクターを選択</span>
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="grid grid-cols-[6.5rem_1fr] items-center gap-3">
          <label htmlFor={`${idPrefix}-atk`} className="font-mono text-sm tracking-widest">
            ATK
          </label>
          <input
            id={`${idPrefix}-atk`}
            type="number"
            inputMode="numeric"
            min={0}
            value={slot.atk}
            disabled={disabled}
            onChange={(e) => onChange({ atk: e.target.value })}
            placeholder="—"
            className={`${fieldClass} text-right`}
          />
        </div>

        <div className="h-px bg-border" aria-hidden="true" />

        <SkillRow
          id={`${idPrefix}-normal`}
          label="通常Lv"
          value={slot.normalLv}
          disabled={disabled}
          onChange={(v) => onChange({ normalLv: v })}
          target={character ? <TargetText to="自" /> : null}
        />
        <SkillRow
          id={`${idPrefix}-ult`}
          label="必殺Lv"
          value={slot.ultimateLv}
          disabled={disabled}
          onChange={(v) => onChange({ ultimateLv: v })}
          target={character ? <TargetText to="自" /> : null}
        />
        <SkillRow
          id={`${idPrefix}-passive`}
          label="パッシブ1Lv"
          value={slot.passive1Lv}
          disabled={disabled}
          onChange={(v) => onChange({ passive1Lv: v })}
          target={
            character ? (
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="shrink-0 text-xs text-muted-foreground">{'自 ⇒'}</span>
                <label htmlFor={`${idPrefix}-passive-target`} className="sr-only">
                  パッシブバフ対象
                </label>
                <select
                  id={`${idPrefix}-passive-target`}
                  value={slot.passive1Target}
                  onChange={(e) => onChange({ passive1Target: Number(e.target.value) })}
                  className={`${fieldClass} min-w-0`}
                >
                  {memberOptions.map((m) => (
                    <option key={m.slotIndex} value={m.slotIndex}>
                      {m.slotIndex === index ? '自' : m.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null
          }
        />
        <SkillRow
          id={`${idPrefix}-passive2`}
          label="パッシブ2Lv"
          value={slot.passive2Lv}
          disabled={disabled}
          onChange={(v) => onChange({ passive2Lv: v })}
          target={
            character ? (
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="shrink-0 text-xs text-muted-foreground">{'自 ⇒'}</span>
                <label htmlFor={`${idPrefix}-passive2-target`} className="sr-only">
                  パッシブ2バフ対象
                </label>
                <select
                  id={`${idPrefix}-passive2-target`}
                  value={slot.passive2Target}
                  onChange={(e) => onChange({ passive2Target: Number(e.target.value) })}
                  className={`${fieldClass} min-w-0`}
                >
                  {memberOptions.map((m) => (
                    <option key={m.slotIndex} value={m.slotIndex}>
                      {m.slotIndex === index ? '自' : m.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null
          }
        />
      </div>
    </article>
  )
}

function SkillRow({
  id,
  label,
  value,
  disabled,
  onChange,
  target,
}: {
  id: string
  label: string
  value: number
  disabled: boolean
  onChange: (value: number) => void
  target: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[6.5rem_4.5rem_1fr] items-center gap-3">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={fieldClass}
      >
        {LEVELS.map((lv) => (
          <option key={lv} value={lv}>
            {lv}
          </option>
        ))}
      </select>
      <div className="min-w-0">{target}</div>
    </div>
  )
}

function TargetText({ to }: { to: string }) {
  return <span className="text-xs text-muted-foreground">{`自 ⇒ ${to}`}</span>
}
