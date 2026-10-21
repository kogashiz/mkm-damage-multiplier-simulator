import type { ReactNode } from 'react'

export function AppHeader({
  subtitle,
  action,
  children,
}: {
  subtitle: string
  action: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <div aria-hidden="true" className="h-10 w-1 bg-primary shadow-[0_0_12px_var(--primary)]" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
              Path to Nowhere / DMG Calc
            </p>
            <h1 className="text-lg font-bold leading-tight text-balance sm:text-xl">
              ダメージ倍率計算
              <span className="ml-2 text-sm font-normal text-muted-foreground">{subtitle}</span>
            </h1>
            {children}
          </div>
        </div>
        {action}
      </div>
    </header>
  )
}
