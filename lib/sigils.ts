export const SIGIL_PARTS = ['I', 'II', 'III'] as const
export type SigilPart = 0 | 1 | 2

export const MAX_SIGIL_LEVEL = 5

export type SigilStatKind = 'atkPct' | 'hpPct' | 'critPct'

export type SigilSet = {
  id: string
  name: string
  image: string
  setEffect: {
    text: string
    dmgPct?: number
    ultDmgPct?: number
  }
}

/** 部位ごとのメインステータス（Lv1 の値 + Lvごとの上昇量、割合） */
export const PART_STATS: Record<SigilPart, { kind: SigilStatKind; label: string; base: number; perLevel: number }> = {
  0: { kind: 'atkPct', label: 'ATK', base: 0.03, perLevel: 0.006 },
  1: { kind: 'hpPct', label: 'HP', base: 0.05, perLevel: 0.01 },
  2: { kind: 'critPct', label: 'クリティカル率', base: 0.05, perLevel: 0.008 },
}

/**
 * サンプルデータ。部位ごとに選択できる刻印は独立しています。
 */
export const SIGIL_SETS: SigilSet[] = [
  {
    id: 'embrace',
    name: '亡者の抱擁',
    image: '/sigils/embrace.png',
    setEffect: { text: 'コアが破壊された敵に対するダメージが40%アップする。' },
  },
  {
    id: 'rift',
    name: '魂の亀裂',
    image: '/sigils/rift.png',
    setEffect: { text: '与ダメージが15%アップする。', dmgPct: 0.15 },
  },
  {
    id: 'echo',
    name: '回廊響音',
    image: '/sigils/echo.png',
    setEffect: { text: '必殺技ダメージが20%アップする。', ultDmgPct: 0.2 },
  },
]

export const SIGIL_SET_MAP: Record<string, SigilSet> = Object.fromEntries(SIGIL_SETS.map((s) => [s.id, s]))

/** 部位ごとに選択可能な刻印セット */
export const PART_OPTIONS: Record<SigilPart, string[]> = {
  0: ['embrace', 'rift', 'echo'],
  1: ['embrace', 'rift', 'echo'],
  2: ['embrace', 'rift', 'echo'],
}

export const sigilStatAt = (part: SigilPart, lv: number) => {
  const stat = PART_STATS[part]
  return stat.base + stat.perLevel * (lv - 1)
}

/** 3部位がすべて同じセットで揃っている場合、そのセットを返す */
export function activeSet(sigils: { setId: string | null }[]): SigilSet | null {
  const [first] = sigils
  if (!first?.setId) return null
  return sigils.every((s) => s.setId === first.setId) ? SIGIL_SET_MAP[first.setId] : null
}
