export const SIGIL_PARTS = ['I', 'II', 'III'] as const
export type SigilPart = 0 | 1 | 2

export const MAX_SIGIL_LEVEL = 10
export const MAX_RIFT_STACKS = 3

export type SigilStatKind = 'atkPct' | 'hpPct' | 'attackSpeedPct'

export type SigilPartStat = {
  kind: SigilStatKind
  label: string
  base: number
  max: number
}

export type SigilSet = {
  id: string
  name: string
  image: string
  requiredParts: number
  partStats: Partial<Record<SigilPart, SigilPartStat>>
  setEffect: {
    text: string
    breakDamagePct?: number
    normalAttackDefenseReductionPct?: number
    maxStacks?: number
    durationSeconds?: number
    initialEnergy?: number
  }
}

export const SIGIL_SETS: SigilSet[] = [
  {
    id: 'embrace',
    name: '亡者の抱擁',
    image: '/sigils/embrace.png',
    requiredParts: 3,
    partStats: {
      0: { kind: 'atkPct', label: 'ATK', base: 0.03, max: 0.06 },
      1: { kind: 'hpPct', label: 'HP', base: 0.05, max: 0.1 },
      2: { kind: 'atkPct', label: 'ATK', base: 0.03, max: 0.06 },
    },
    setEffect: {
      text: 'コアが破壊された敵に対するダメージが40%アップする。',
      breakDamagePct: 0.4,
    },
  },
  {
    id: 'rift',
    name: '魂の亀裂',
    image: '/sigils/rift.png',
    requiredParts: 2,
    partStats: {
      0: { kind: 'atkPct', label: 'ATK', base: 0.03, max: 0.06 },
      1: { kind: 'hpPct', label: 'HP', base: 0.05, max: 0.2 },
    },
    setEffect: {
      text: '通常攻撃ダメージを与えると、敵のDEFが4%ダウンする。5秒間継続し、最大3回までスタック可能。',
      normalAttackDefenseReductionPct: 0.04,
      maxStacks: MAX_RIFT_STACKS,
      durationSeconds: 5,
    },
  },
  {
    id: 'echo',
    name: '回廊響音',
    image: '/sigils/echo.png',
    requiredParts: 1,
    partStats: {
      2: { kind: 'attackSpeedPct', label: '攻撃速度', base: 0.05, max: 0.1 },
    },
    setEffect: {
      text: '戦闘開始時、エネルギーを8点獲得する。',
      initialEnergy: 8,
    },
  },
]

export const SIGIL_SET_MAP: Record<string, SigilSet> = Object.fromEntries(
  SIGIL_SETS.map((set) => [set.id, set]),
)

export const PART_OPTIONS: Record<SigilPart, string[]> = {
  0: SIGIL_SETS.filter((set) => set.partStats[0]).map((set) => set.id),
  1: SIGIL_SETS.filter((set) => set.partStats[1]).map((set) => set.id),
  2: SIGIL_SETS.filter((set) => set.partStats[2]).map((set) => set.id),
}

export function sigilPartStat(setId: string, part: SigilPart, level: number) {
  const stat = SIGIL_SET_MAP[setId]?.partStats[part]
  if (!stat) return null
  const boundedLevel = Math.max(1, Math.min(MAX_SIGIL_LEVEL, level))
  const progress = (boundedLevel - 1) / (MAX_SIGIL_LEVEL - 1)
  return { ...stat, value: stat.base + (stat.max - stat.base) * progress }
}

/** Returns the set bonuses currently active from their required number of parts. */
export function activeSets(sigils: { setId: string | null }[]) {
  return SIGIL_SETS.filter(
    (set) => sigils.filter((sigil) => sigil.setId === set.id).length >= set.requiredParts,
  )
}
