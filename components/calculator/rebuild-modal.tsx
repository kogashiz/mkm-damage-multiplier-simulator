'use client'

import { useState } from 'react'
import type { Character } from '@/lib/characters'
import { STAGE_LABELS, isRowSelectable, summarizeRebuild, toggleRow } from '@/lib/rebuild'
import { ModalShell } from './modal-shell'

export function RebuildModal({
  open,
  onClose,
  character,
  applied,
  onApply,
}: {
  open: boolean
  onClose: () => void
  character: Character
  applied: string[]
  onApply: (ids: string[]) => void
}) {
  return (
    <ModalShell open={open} onClose={onClose} eyebrow="Rebuild" title={`再構築　${character.name}`} size="lg">
      <RebuildEditor character={character} initial={applied} onApply={onApply} />
    </ModalShell>
  )
}

function RebuildEditor({
  character,
  initial,
  onApply,
}: {
  character: Character
  initial: string[]
  onApply: (ids: string[]) => void
}) {
  const [draft, setDraft] = useState<string[]>(initial)
  const rows = character.rebuild
  const { costUsed, costCap } = summarizeRebuild(rows, draft)
  const over = costUsed > costCap

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/95 px-5 py-3 backdrop-blur">
        <p className="font-mono text-xs text-muted-foreground">
          {'COST '}
          <span className={`text-base font-bold ${over ? 'text-primary' : 'text-foreground'}`}>{costUsed}</span>
          {` / ${costCap}`}
          {over && <span className="ml-2 font-sans text-primary">コスト上限を超えています</span>}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDraft([])}
            className="border border-border px-4 py-1.5 text-sm font-bold text-muted-foreground transition hover:border-accent hover:text-accent"
          >
            リセット
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="cyber-clip bg-primary px-6 py-1.5 text-sm font-bold text-primary-foreground shadow-[0_0_20px_-6px_var(--primary)] transition hover:bg-accent"
          >
            適用
          </button>
        </div>
      </div>

      <div className="overflow-x-auto p-5">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-primary/60 text-left text-xs text-muted-foreground">
              <th scope="col" className="w-12 px-3 py-2 font-medium">
                適用
              </th>
              <th scope="col" className="w-12 px-2 py-2 font-medium">
                段階
              </th>
              <th scope="col" className="w-14 px-2 py-2 font-medium">
                COST
              </th>
              <th scope="col" className="w-48 px-2 py-2 font-medium">
                名称
              </th>
              <th scope="col" className="px-2 py-2 font-medium">
                効果
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const checked = draft.includes(row.id)
              const selectable = isRowSelectable(row, draft)
              const inputId = `rebuild-${character.id}-${row.id}`
              return (
                <tr
                  key={row.id}
                  className={`border-b border-border align-top transition ${
                    checked ? 'bg-primary/15' : row.kind === 'stage' ? 'bg-secondary/60' : ''
                  } ${selectable ? '' : 'opacity-40'}`}
                >
                  <td className="px-3 py-3">
                    <input
                      id={inputId}
                      type={row.kind === 'radio' ? 'radio' : 'checkbox'}
                      name={row.group ? `${character.id}-${row.group}` : undefined}
                      checked={checked}
                      disabled={!selectable}
                      onChange={() => setDraft((d) => toggleRow(rows, d, row))}
                      className="size-4 cursor-pointer accent-[var(--primary)] disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="px-2 py-3 font-mono text-accent">{STAGE_LABELS[row.stage]}</td>
                  <td className="px-2 py-3 font-mono">{row.cost ?? ''}</td>
                  <td className="px-2 py-3">
                    <label htmlFor={inputId} className={`font-bold ${selectable ? 'cursor-pointer' : ''}`}>
                      {row.title}
                    </label>
                    {row.kind === 'radio' && (
                      <span className="mt-1 block font-mono text-[10px] text-muted-foreground">いずれか1つ</span>
                    )}
                  </td>
                  <td className="px-2 py-3 leading-relaxed text-pretty text-muted-foreground">{row.effect}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-muted-foreground text-pretty">
          {'※ 各段階の効果は、その段階（コスト上限行）を適用している場合のみ選択できます。× で閉じると変更は破棄されます。'}
        </p>
      </div>
    </div>
  )
}
