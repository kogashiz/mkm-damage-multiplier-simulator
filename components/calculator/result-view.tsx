import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import type { SlotResult } from '@/lib/calc'
import { CLASS_LABELS } from '@/lib/characters'
import { AppHeader } from './app-header'

const fmt = (n: number) => n.toFixed(2)

export function ResultView({ results, onClose }: { results: SlotResult[]; onClose: () => void }) {
  return (
    <div className="min-h-dvh">
      <AppHeader
        subtitle="計算後結果画面"
        action={
          <button
            type="button"
            onClick={onClose}
            className="cyber-clip flex items-center gap-2 border border-primary bg-primary/15 px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-primary hover:text-primary-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="text-balance">結果を閉じて再設定する</span>
          </button>
        }
      />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">
        <h2 className="sr-only">計算結果</h2>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <li key={r.slotIndex}>
              <ResultCard result={r} />
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs text-muted-foreground text-pretty">
          {'※ 倍率 = スキル係数 × (実効ATK ÷ 入力ATK) × (1 + 与ダメージ増加)。実効ATK = (ATK + 再構築ATK) × (1 + バフ + 刻印ATK% + 再構築ATK%)。係数はサンプル値です。'}
        </p>
      </main>
    </div>
  )
}

function ResultCard({ result }: { result: SlotResult }) {
  const { character } = result
  const rows = [
    { label: '通常倍率', value: result.normal },
    { label: `必殺倍率【${result.ultimateName}】`, value: result.ultimate },
    { label: 'パッシブ1倍率', value: result.passive },
  ]

  return (
    <article className="cyber-clip-lg animate-in fade-in slide-in-from-bottom-2 border border-border bg-card duration-500">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-primary">{String(result.slotIndex + 1).padStart(2, '0')}</span>
          <h3 className="border border-accent/70 px-3 py-0.5 text-sm font-bold">{character.name}</h3>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
          {CLASS_LABELS[character.className]}
        </span>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden border-b border-border">
        <Image
          src={character.image || '/placeholder.svg'}
          alt={`${character.name}の立ち絵`}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">ATK</p>
            <p className="font-mono text-2xl font-bold">{result.atk}</p>
          </div>
          {result.buffRate > 0 && (
            <p className="border border-accent/60 bg-background/70 px-2 py-0.5 font-mono text-xs text-accent">
              {`BUFF +${(result.buffRate * 100).toFixed(1)}%`}
            </p>
          )}
        </div>
      </div>

      <dl className="divide-y divide-border px-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between py-3">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-primary [text-shadow:0_0_12px_color-mix(in_oklab,var(--primary)_60%,transparent)]">
                {fmt(row.value)}
              </span>
              <span className="text-sm">倍</span>
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between py-3">
          <dt className="text-xs text-muted-foreground">実効ATK</dt>
          <dd className="font-mono text-sm">{fmt(result.effectiveAtk)}</dd>
        </div>
      </dl>
    </article>
  )
}
