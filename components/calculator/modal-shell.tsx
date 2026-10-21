'use client'

import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

const SIZES = {
  sm: 'w-[min(32rem,calc(100vw-2rem))]',
  md: 'w-[min(44rem,calc(100vw-2rem))]',
  lg: 'w-[min(64rem,calc(100vw-2rem))]',
}

export function ModalShell({
  open,
  onClose,
  eyebrow,
  title,
  actions,
  size = 'md',
  children,
}: {
  open: boolean
  onClose: () => void
  eyebrow: string
  title: React.ReactNode
  actions?: React.ReactNode
  size?: keyof typeof SIZES
  children: React.ReactNode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className={`${SIZES[size]} m-auto max-h-[calc(100dvh-2rem)] max-w-none border border-primary/50 bg-card p-0 text-foreground shadow-[0_0_60px_-10px_var(--primary)] backdrop:bg-black/75 backdrop:backdrop-blur-sm open:flex open:flex-col`}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
          <h2 id={titleId} className="truncate font-bold">
            {title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center text-muted-foreground transition hover:bg-primary/15 hover:text-primary"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">閉じる</span>
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{open && children}</div>
    </dialog>
  )
}

/** テキスト内の {v} / {b} をハイライトされた値に置き換える */
export function Templated({ text, values }: { text: string; values: Record<string, string> }) {
  const parts = text.split(/(\{[a-z]\})/g)
  return (
    <>
      {parts.map((part, i) => {
        const key = part.match(/^\{([a-z])\}$/)?.[1]
        if (key && values[key] !== undefined) {
          return (
            <span key={i} className="font-mono font-bold text-primary">
              {values[key]}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
