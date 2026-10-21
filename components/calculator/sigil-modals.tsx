import Image from 'next/image'
import { formatPct } from '@/lib/characters'
import type { SigilSlot } from '@/lib/calc'
import {
  PART_OPTIONS,
  PART_STATS,
  SIGIL_PARTS,
  SIGIL_SET_MAP,
  activeSet,
  sigilStatAt,
  type SigilPart,
} from '@/lib/sigils'
import { ModalShell } from './modal-shell'

export function SigilSelectModal({
  part,
  current,
  onSelect,
  onClose,
}: {
  part: SigilPart | null
  current: string | null
  onSelect: (setId: string | null) => void
  onClose: () => void
}) {
  const options = part === null ? [] : PART_OPTIONS[part]

  return (
    <ModalShell
      open={part !== null}
      onClose={onClose}
      eyebrow="Select Sigil"
      title={part === null ? '罪の刻印' : `罪の刻印　部位 ${SIGIL_PARTS[part]}`}
    >
      {part !== null && (
        <div className="p-5">
          <p className="mb-4 text-xs text-muted-foreground">
            {`メインステータス：${PART_STATS[part].label}　/　刻印を選択すると即時適用されます`}
          </p>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {options.map((id) => {
              const set = SIGIL_SET_MAP[id]
              const selected = id === current
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelect(id)}
                    className="group block w-full text-center outline-none"
                  >
                    <span
                      className={`relative block aspect-square overflow-hidden border bg-secondary transition group-hover:border-primary group-hover:shadow-[0_0_20px_-4px_var(--primary)] group-focus-visible:ring-2 group-focus-visible:ring-primary ${
                        selected ? 'border-primary shadow-[0_0_20px_-4px_var(--primary)]' : 'border-border'
                      }`}
                    >
                      <Image
                        src={set.image || '/placeholder.svg'}
                        alt=""
                        fill
                        sizes="200px"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-1.5 top-1.5 bg-background/80 px-1.5 font-mono text-xs text-primary">
                        {SIGIL_PARTS[part]}
                      </span>
                      {selected && (
                        <span className="absolute inset-x-0 bottom-0 bg-primary py-0.5 text-[10px] font-bold text-primary-foreground">
                          装着中
                        </span>
                      )}
                    </span>
                    <span className="mt-2 block text-sm font-bold">{set.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {current && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="mt-5 w-full border border-border py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              刻印を外す
            </button>
          )}
        </div>
      )}
    </ModalShell>
  )
}

export function SigilSetModal({
  open,
  onClose,
  sigils,
}: {
  open: boolean
  onClose: () => void
  sigils: SigilSlot[]
}) {
  const set = activeSet(sigils)

  return (
    <ModalShell open={open} onClose={onClose} eyebrow="Sigil Effects" title="罪の刻印　効果" size="sm">
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        {set && (
          <section className="border border-primary/60 bg-primary/10 p-4">
            <h3 className="font-bold">セット効果</h3>
            <p className="mt-1 font-mono text-xs text-accent">{`${set.name}　I・II・III`}</p>
            <p className="mt-2 text-sm leading-relaxed text-pretty">{set.setEffect.text}</p>
          </section>
        )}

        <ul className="flex flex-col gap-4">
          {sigils.map((s, i) => {
            const part = i as SigilPart
            const equipped = s.setId ? SIGIL_SET_MAP[s.setId] : null
            return (
              <li key={i} className="flex items-center gap-3">
                <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden border border-border bg-secondary font-mono text-xs text-muted-foreground">
                  {equipped ? (
                    <Image src={equipped.image || '/placeholder.svg'} alt="" fill sizes="48px" className="object-cover" />
                  ) : (
                    '—'
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold">
                    {SIGIL_PARTS[part]}
                    <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">
                      {equipped ? `${equipped.name}　Lv${s.lv}` : '未装着'}
                    </span>
                  </p>
                  <p className="text-sm font-bold">
                    {PART_STATS[part].label}
                    <span className={`ml-1 font-mono ${equipped ? 'text-primary' : 'text-muted-foreground'}`}>
                      {equipped ? formatPct(sigilStatAt(part, s.lv)) : '—'}
                    </span>
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </ModalShell>
  )
}
