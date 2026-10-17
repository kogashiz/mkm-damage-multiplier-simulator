'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { CHARACTERS, CLASS_LABELS, CLASS_ORDER, type CharacterClass } from '@/lib/characters'

export function CharacterSelectModal({
  open,
  slotIndex,
  usedIds,
  onSelect,
  onClose,
}: {
  open: boolean
  slotIndex: number | null
  usedIds: string[]
  onSelect: (characterId: string) => void
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [activeClass, setActiveClass] = useState<CharacterClass>('fury')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const visible = CHARACTERS.filter((c) => c.className === activeClass)

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="select-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="m-auto w-[min(56rem,calc(100vw-2rem))] max-w-none border border-primary/50 bg-card p-0 text-foreground shadow-[0_0_60px_-10px_var(--primary)] backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Select Convict</p>
          <h2 id="select-title" className="font-bold">
            コンビクト選択
            {slotIndex !== null && (
              <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                {`SLOT ${String(slotIndex + 1).padStart(2, '0')}`}
              </span>
            )}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center text-muted-foreground transition hover:bg-primary/15 hover:text-primary"
        >
          <X className="size-5" aria-hidden="true" />
          <span className="sr-only">閉じる</span>
        </button>
      </div>

      <div role="tablist" aria-label="職種" className="flex border-b border-border">
        {CLASS_ORDER.map((cls) => {
          const selected = cls === activeClass
          return (
            <button
              key={cls}
              type="button"
              role="tab"
              id={`tab-${cls}`}
              aria-selected={selected}
              aria-controls="select-panel"
              onClick={() => setActiveClass(cls)}
              className={`relative flex-1 px-4 py-3 text-sm transition sm:flex-none sm:px-8 ${
                selected
                  ? 'bg-primary/15 font-bold text-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {CLASS_LABELS[cls]}
              {selected && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-primary shadow-[0_0_8px_var(--primary)]"
                />
              )}
            </button>
          )
        })}
      </div>

      <div
        id="select-panel"
        role="tabpanel"
        aria-labelledby={`tab-${activeClass}`}
        className="max-h-[60dvh] overflow-y-auto p-5"
      >
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {visible.map((c) => {
            const used = usedIds.includes(c.id)
            return (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={used}
                  onClick={() => onSelect(c.id)}
                  className="group block w-full text-left outline-none disabled:cursor-not-allowed"
                >
                  <span className="mb-1.5 block text-sm font-bold">{c.name}</span>
                  <span className="relative block aspect-[3/4] overflow-hidden border border-border bg-secondary transition group-hover:border-primary group-hover:shadow-[0_0_20px_-4px_var(--primary)] group-focus-visible:border-primary group-focus-visible:ring-2 group-focus-visible:ring-primary group-disabled:border-border group-disabled:shadow-none">
                    <Image
                      src={c.image || '/placeholder.svg'}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 200px, 45vw"
                      className="object-cover object-top transition duration-500 group-hover:scale-105 group-disabled:grayscale group-disabled:group-hover:scale-100"
                    />
                    {used && (
                      <span className="absolute inset-0 grid place-items-center bg-background/70 font-mono text-xs tracking-widest text-primary">
                        編成中
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </dialog>
  )
}
