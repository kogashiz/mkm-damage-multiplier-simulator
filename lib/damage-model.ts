export type SkillKey = 'normal' | 'ultimate' | 'passive' | 'passive2'
export type DamageCategory = 'normal' | 'skill' | 'special'
export type DamageType = 'physical' | 'magic' | 'defense-ignoring'

export type DamageSource =
  | {
      kind: 'attack-coefficient'
      levelSource: SkillKey
      coefficientsByLevel: number[]
    }
  | {
      kind: 'current-enemy-hp'
      levelSource: SkillKey
      hpRatio: number
      maxAttackCoefficientsByLevel: number[]
    }

export type DamageComponent = {
  id: string
  skill: SkillKey
  trigger: 'normal-attack' | 'ultimate' | 'passive'
  label: string
  category: DamageCategory
  damageType: DamageType
  hitCount: number
  activationCondition?: {
    kind: 'after-normal-attacks'
    count: number
  }
  activeWindowSeconds?: number
  source: DamageSource
}

export type CharacterEffect = {
  id: string
  skill: SkillKey
  kind: 'attack-speed-up'
  trigger: 'passive' | 'after-consecutive-normal-attack-damage'
  values: number[]
  durationSeconds: number
  maxStacks: number
}

export type SkillLevels = Record<SkillKey, number>

export type ResolvedDamageComponent = Omit<DamageComponent, 'source'> &
  (
    | {
        sourceKind: 'attack-coefficient'
        coefficientPerHit: number
        coefficientTotal: number
      }
    | {
        sourceKind: 'current-enemy-hp'
        hpRatio: number
        maxAttackCoefficient: number
      }
  )

export type ResolvedCharacterEffect = Omit<CharacterEffect, 'values'> & {
  value: number
}

export type CalculatedDamageComponent =
  | (Extract<ResolvedDamageComponent, { sourceKind: 'attack-coefficient' }> & {
      appliedDefense: number
      damagePerHit: number
      damageTotal: number
    })
  | (Extract<ResolvedDamageComponent, { sourceKind: 'current-enemy-hp' }> & {
      appliedDefense: null
      damagePerHit: null
      damageTotal: null
    })

export type DamageCalculationContext = {
  finalAttack: number
  enemyDef: number
  enemyMdf: number
  isBreak: boolean
  damageMultiplier: number
  ultimateMultiplier: number
}

function valueAt(values: number[], level: number, description: string) {
  const value = values[level - 1]
  if (value === undefined) {
    throw new RangeError(`${description} has no value for level ${level}`)
  }
  return value
}

export function resolveDamageComponents(components: DamageComponent[], levels: SkillLevels) {
  return components.map((component): ResolvedDamageComponent => {
    const level = levels[component.source.levelSource]
    const { source, ...metadata } = component
    if (source.kind === 'attack-coefficient') {
      const coefficientPerHit = valueAt(source.coefficientsByLevel, level, component.id)
      return {
        ...metadata,
        sourceKind: source.kind,
        coefficientPerHit,
        coefficientTotal: coefficientPerHit * component.hitCount,
      }
    }

    return {
      ...metadata,
      sourceKind: source.kind,
      hpRatio: source.hpRatio,
      maxAttackCoefficient: valueAt(
        source.maxAttackCoefficientsByLevel,
        level,
        component.id,
      ),
    }
  })
}

export function resolveCharacterEffects(effects: CharacterEffect[], levels: SkillLevels) {
  return effects.map((effect): ResolvedCharacterEffect => ({
    id: effect.id,
    skill: effect.skill,
    kind: effect.kind,
    trigger: effect.trigger,
    value: valueAt(effect.values, levels[effect.skill], effect.id),
    durationSeconds: effect.durationSeconds,
    maxStacks: effect.maxStacks,
  }))
}

export function calculateDamageComponents(
  components: ResolvedDamageComponent[],
  context: DamageCalculationContext,
): CalculatedDamageComponent[] {
  return components.map((component) => {
    if (component.sourceKind === 'current-enemy-hp') {
      return {
        ...component,
        appliedDefense: null,
        damagePerHit: null,
        damageTotal: null,
      }
    }

    const appliedDefense =
      component.damageType === 'physical'
        ? context.enemyDef
        : component.damageType === 'magic'
          ? context.enemyMdf
          : 0
    const ultimateMultiplier = component.skill === 'ultimate' ? context.ultimateMultiplier : 1
    const breakMultiplier = context.isBreak ? 1.5 : 1
    const otherMultiplier = context.damageMultiplier * ultimateMultiplier * breakMultiplier
    const defenseAdjustedAttack = context.finalAttack - appliedDefense
    const minimumAttack = component.damageType === 'defense-ignoring' ? defenseAdjustedAttack : context.finalAttack * 0.05
    const damagePerHit =
      Math.max(defenseAdjustedAttack, minimumAttack) *
      component.coefficientPerHit *
      otherMultiplier

    return {
      ...component,
      appliedDefense,
      damagePerHit,
      damageTotal: damagePerHit * component.hitCount,
    }
  })
}

export function createStandardDamageComponents(
  normal: number[],
  ultimate: number[],
  passive: number[],
): DamageComponent[] {
  return [
    {
      id: 'normal',
      skill: 'normal',
      trigger: 'normal-attack',
      label: '通常攻撃',
      category: 'normal',
      damageType: 'physical',
      hitCount: 1,
      source: {
        kind: 'attack-coefficient',
        levelSource: 'normal',
        coefficientsByLevel: normal,
      },
    },
    {
      id: 'ultimate',
      skill: 'ultimate',
      trigger: 'ultimate',
      label: '必殺技',
      category: 'skill',
      damageType: 'physical',
      hitCount: 1,
      source: {
        kind: 'attack-coefficient',
        levelSource: 'ultimate',
        coefficientsByLevel: ultimate,
      },
    },
    {
      id: 'passive',
      skill: 'passive',
      trigger: 'passive',
      label: 'パッシブ1',
      category: 'skill',
      damageType: 'physical',
      hitCount: 1,
      source: {
        kind: 'attack-coefficient',
        levelSource: 'passive',
        coefficientsByLevel: passive,
      },
    },
  ]
}
