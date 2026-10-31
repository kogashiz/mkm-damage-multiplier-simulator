import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import type { EnemySettings, SlotResult } from '@/lib/calc'
import { CLASS_LABELS } from '@/lib/characters'
import { AppHeader } from './app-header'

const fmt = (n: number) => n.toFixed(2)

export function ResultView({
  results,
  enemy,
  onClose,
}: {
  results: SlotResult[]
  enemy: EnemySettings
  onClose: () => void
}) {
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
        <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 border border-border bg-card px-4 py-3 text-sm">
          <span>
            敵 DEF <strong className="font-mono">{fmt(enemy.def)}</strong>
          </span>
          <span>
            敵 MDF <strong className="font-mono">{fmt(enemy.mdf)}</strong>
          </span>
          <span className={enemy.isBreak ? 'font-bold text-primary' : 'text-muted-foreground'}>
            {enemy.isBreak ? 'Break中' : 'Breakなし'}
          </span>
        </div>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <li key={r.slotIndex}>
              <ResultCard result={r} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

function ResultCard({ result }: { result: SlotResult }) {
  const { character } = result
  const rows = [
    { skill: 'normal', label: '通常倍率', value: result.normal },
    { skill: 'ultimate', label: `必殺倍率【${result.ultimateName}】`, value: result.ultimate },
    { skill: 'passive', label: 'パッシブ1倍率', value: result.passive },
  ].filter((row) =>
    character.damageComponents.some(
      (component) => component.calculationEnabled !== false && component.skill === row.skill,
    ),
  )

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
        {!character.calculationSupported && (
          <div className="py-4 text-sm leading-relaxed text-muted-foreground">
            このコンビクトの倍率・ダメージ計算は未対応です。スキル情報と効果の選択・表示のみ利用できます。
          </div>
        )}
        {character.calculationSupported &&
          rows.map((row) => (
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
        {character.calculationSupported &&
          result.damageComponents.map((component) => (
            <div key={component.id} className="flex items-baseline justify-between gap-3 py-3">
              <dt className="text-sm text-muted-foreground">
                {component.label}
                {(component.damageAttribute !== undefined ||
                  component.damageAttackKind !== undefined) && (
                  <span className="mt-1 block text-[10px]">
                    {component.damageType === 'physical'
                      ? '物理'
                      : component.damageType === 'magic'
                        ? '魔法'
                        : '防御無視'}
                    {' / '}
                    {component.damageAttribute ?? '属性なし'}
                    {' / '}
                    {component.damageAttackKind === 'normal-attack-damage'
                      ? '通常攻撃ダメージ'
                      : 'スキルダメージ'}
                  </span>
                )}
              </dt>
              <dd className="text-right">
                {component.sourceKind === 'current-enemy-hp' ? (
                  <span className="text-sm text-muted-foreground">
                    敵HP {(component.hpRatio * 100).toFixed(0)}%（ATK上限{' '}
                    {fmt(component.maxAttackCoefficient)}倍）
                  </span>
                ) : component.damageTotal !== null && component.damagePerHit !== null ? (
                  <>
                    <p className="mb-1 text-xs text-muted-foreground">
                      係数 {fmt(component.coefficientPerHit * 100)}%
                      {component.hitCount > 1 &&
                        `（合計 ${fmt(component.coefficientTotal * 100)}%）`}
                    </p>
                    {component.hitCount > 1 && (
                      <span className="mr-2 text-xs text-muted-foreground">
                        {component.hitCount}H 合計
                      </span>
                    )}
                    <span className="font-mono text-xl font-bold text-primary [text-shadow:0_0_12px_color-mix(in_oklab,var(--primary)_60%,transparent)]">
                      {fmt(component.damageTotal)}
                    </span>
                    <span className="ml-1 text-xs">ダメージ</span>
                    {component.hitCount > 1 && component.damagePerHit !== null && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        1H {fmt(component.damagePerHit)}
                      </p>
                    )}
                  </>
                ) : null}
              </dd>
            </div>
          ))}
        {character.calculationSupported && character.calculationNote && (
          <div className="py-3 text-xs leading-relaxed text-muted-foreground">
            {character.calculationNote}
          </div>
        )}
        {character.calculationSupported && (
          <div className="flex items-baseline justify-between py-3">
            <dt className="text-xs text-muted-foreground">実効ATK</dt>
            <dd className="font-mono text-sm">{fmt(result.effectiveAtk)}</dd>
          </div>
        )}
        {(result.sigilStats.atkPct > 0 ||
          result.sigilStats.hpPct > 0 ||
          result.sigilStats.attackSpeedPct > 0 ||
          result.sigilStats.initialEnergy > 0) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 py-3 text-xs text-muted-foreground">
            {result.sigilStats.atkPct > 0 && (
              <span>罪の刻印 ATK +{(result.sigilStats.atkPct * 100).toFixed(1)}%</span>
            )}
            {result.sigilStats.hpPct > 0 && (
              <span>罪の刻印 HP +{(result.sigilStats.hpPct * 100).toFixed(1)}%</span>
            )}
            {result.sigilStats.attackSpeedPct > 0 && (
              <span>罪の刻印 攻撃速度 +{(result.sigilStats.attackSpeedPct * 100).toFixed(1)}%</span>
            )}
            {result.sigilStats.initialEnergy > 0 && (
              <span>開始時エネルギー +{result.sigilStats.initialEnergy}</span>
            )}
          </div>
        )}
      </dl>
    </article>
  )
}
