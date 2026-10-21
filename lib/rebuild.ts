export type RebuildMods = {
  atkFlat?: number
  hpFlat?: number
  atkPct?: number
  dmgPct?: number
  ultDmgPct?: number
  ultimateName?: string
  ultimateScale?: number
}

export type RebuildRow = {
  id: string
  stage: 1 | 2
  kind: 'stage' | 'check' | 'radio'
  /** ラジオボタンの排他グループ */
  group?: string
  cost: number | null
  costCap?: number
  title: string
  effect: string
  mods: RebuildMods
}

export const STAGE_LABELS = { 1: 'I', 2: 'II' } as const

export function buildRebuild(name: string, ultA: string, ultB: string): RebuildRow[] {
  const ultText = (ult: string) =>
    `${name}はエネルギーを自動的に回復せず、必殺技発動時に局長エネルギーを消費するようになる。必殺技が【${ult}】に切り替わり、さらに枷【共感】で必殺技の局長エネルギーを1点減少するようになる。局長権能【限界突破】を所持している場合、${name}は毎秒限界突破値を6点獲得する。`

  return [
    {
      id: 's1',
      stage: 1,
      kind: 'stage',
      cost: null,
      costCap: 4,
      title: 'コスト上限：4',
      effect: '深化：HP + 500　ATK + 10',
      mods: { hpFlat: 500, atkFlat: 10 },
    },
    {
      id: 'phys',
      stage: 1,
      kind: 'check',
      cost: 1,
      title: '物理ダメージ・再構築',
      effect: '物理ダメージが7.5%アップする',
      mods: { dmgPct: 0.075 },
    },
    {
      id: 'atk',
      stage: 1,
      kind: 'check',
      cost: 3,
      title: 'ATK・再構築',
      effect: 'ATKが4.5%アップする',
      mods: { atkPct: 0.045 },
    },
    {
      id: 'ultA',
      stage: 1,
      kind: 'radio',
      group: 'ult',
      cost: 3,
      title: `${ultA}・選択`,
      effect: ultText(ultA),
      mods: { ultimateName: ultA, ultimateScale: 1.2 },
    },
    {
      id: 'ultB',
      stage: 1,
      kind: 'radio',
      group: 'ult',
      cost: 3,
      title: `${ultB}・選択`,
      effect: ultText(ultB),
      mods: { ultimateName: ultB, ultimateScale: 1.1 },
    },
    {
      id: 's2',
      stage: 2,
      kind: 'stage',
      cost: null,
      costCap: 8,
      title: 'コスト上限：8',
      effect: '深化：HP + 550　ATK + 10',
      mods: { hpFlat: 550, atkFlat: 10 },
    },
    {
      id: 'ultDmg',
      stage: 2,
      kind: 'check',
      cost: 2,
      title: '必殺ダメージ・再構築',
      effect: '必殺技ダメージが10%アップする',
      mods: { ultDmgPct: 0.1 },
    },
  ]
}

const STAGE_ROW_ID: Record<1 | 2, string> = { 1: 's1', 2: 's2' }

/** 段階行が選択されていない段階の効果は選択できない（II は I が前提） */
export function isRowSelectable(row: RebuildRow, selected: string[]) {
  if (row.kind === 'stage') return row.stage === 1 || selected.includes(STAGE_ROW_ID[1])
  return selected.includes(STAGE_ROW_ID[row.stage])
}

export function toggleRow(rows: RebuildRow[], selected: string[], row: RebuildRow): string[] {
  const has = selected.includes(row.id)
  if (row.kind === 'radio') {
    const others = rows.filter((r) => r.group === row.group).map((r) => r.id)
    return [...selected.filter((id) => !others.includes(id)), row.id]
  }
  if (!has) return [...selected, row.id]
  if (row.kind === 'stage') {
    const removedStages = rows.filter((r) => r.stage >= row.stage).map((r) => r.id)
    return selected.filter((id) => !removedStages.includes(id))
  }
  return selected.filter((id) => id !== row.id)
}

export function summarizeRebuild(rows: RebuildRow[], selected: string[]) {
  const active = rows.filter((r) => selected.includes(r.id))
  const mods: Required<Omit<RebuildMods, 'ultimateName'>> & { ultimateName: string | null } = {
    atkFlat: 0,
    hpFlat: 0,
    atkPct: 0,
    dmgPct: 0,
    ultDmgPct: 0,
    ultimateScale: 1,
    ultimateName: null,
  }
  let costUsed = 0
  let costCap = 0
  for (const r of active) {
    mods.atkFlat += r.mods.atkFlat ?? 0
    mods.hpFlat += r.mods.hpFlat ?? 0
    mods.atkPct += r.mods.atkPct ?? 0
    mods.dmgPct += r.mods.dmgPct ?? 0
    mods.ultDmgPct += r.mods.ultDmgPct ?? 0
    mods.ultimateScale *= r.mods.ultimateScale ?? 1
    if (r.mods.ultimateName) mods.ultimateName = r.mods.ultimateName
    costUsed += r.cost ?? 0
    costCap = Math.max(costCap, r.costCap ?? 0)
  }
  return { mods, costUsed, costCap }
}
