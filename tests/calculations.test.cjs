require('./register-typescript.cjs')

const assert = require('node:assert/strict')
const test = require('node:test')
const { calculateParty, createEmptySlot } = require('../lib/calc.ts')
const { CHARACTER_MAP, CLASS_LABELS, CLASS_ORDER } = require('../lib/characters.ts')
const { activeSets, sigilPartStat } = require('../lib/sigils.ts')
const { isRowSelectable } = require('../lib/rebuild.ts')

function createSlot(slotIndex, characterId, overrides = {}) {
  return {
    ...createEmptySlot(slotIndex),
    characterId,
    atk: '100',
    ...overrides,
  }
}

function component(result, id) {
  const found = result.damageComponents.find((entry) => entry.id === id)
  assert.ok(found, `Expected damage component "${id}"`)
  return found
}

test('character registry uses Wiki-sourced coefficients and special effect metadata', () => {
  assert.deepEqual(Object.keys(CHARACTER_MAP), ['gao', 'zoya', 'nox', 'yao', 'bianca', 'margaret', 'll', 'jerena', 'celine'])
  assert.deepEqual(CHARACTER_MAP.zoya.normal, [0.83, 0.89, 0.95, 1.01, 1.08, 1.15, 1.23, 1.31, 1.4, 1.5])
  assert.equal(CHARACTER_MAP.zoya.damageComponents.length, 5)
  assert.equal(CHARACTER_MAP.zoya.passiveBuffTargetMode, 'none')
  assert.equal(CHARACTER_MAP.nox.normal[0], 0.9)
  assert.equal(CHARACTER_MAP.nox.passive2TargetMode, 'enemy-all')
})

test('L.L. and Jerena use existing passive target selectors and only calculate normal attacks', () => {
  const ll = CHARACTER_MAP.ll
  assert.equal(ll.image, '/characters/ll.png')
  assert.equal(ll.passiveBuffTargetMode, 'select-one')
  assert.equal(ll.passive2TargetMode, 'self')
  assert.deepEqual(ll.normal, [0.63, 0.73, 0.79, 0.86, 0.93, 1, 1.08, 1.17, 1.26])
  assert.equal(ll.damageComponents[0].damageType, 'defense-ignoring')
  assert.equal(ll.damageComponents[0].damageAttribute, null)
  assert.equal(ll.damageComponents[0].damageAttackKind, 'normal-attack-damage')

  const jerena = CHARACTER_MAP.jerena
  assert.equal(jerena.image, '/characters/jerena.png')
  assert.equal(jerena.passiveBuffTargetMode, 'select-one')
  assert.equal(jerena.passive2TargetMode, 'select-one')
  assert.deepEqual(jerena.normal, [0.66, 0.77, 0.83, 0.9, 0.97, 1.05, 1.13, 1.22, 1.32])
  assert.equal(jerena.damageComponents[0].damageType, 'magic')
  assert.equal(jerena.damageComponents[0].damageAttribute, null)
  assert.equal(jerena.damageComponents[0].damageAttackKind, 'normal-attack-damage')
  assert.equal(jerena.passiveBuffAffectsAttack, false)
  assert.equal(jerena.passive2BuffAffectsAttack, false)
  assert.deepEqual(jerena.passiveBuff, [0.2, 0.233, 0.252, 0.272, 0.294, 0.317, 0.343, 0.37, 0.4])
  assert.deepEqual(jerena.passive2AdditionalBuff, [0.125, 0.146, 0.157, 0.17, 0.184, 0.198, 0.214, 0.231, 0.25])

  const [llResult, jerenaResult] = calculateParty([
    createSlot(0, 'll', { passiveLv: 9, passiveTarget: 1 }),
    createSlot(1, 'jerena', { passiveLv: 9, passive2Lv: 9, passiveTarget: 0, passive2Target: 0 }),
  ])
  assert.equal(llResult.buffRate, 0)
  assert.equal(jerenaResult.buffRate, 0)
  assert.deepEqual(
    llResult.damageComponents.map(({ damageType }) => damageType),
    ['defense-ignoring'],
  )
  assert.deepEqual(
    jerenaResult.damageComponents.map(({ damageType }) => damageType),
    ['magic'],
  )
})

test('Gao is registered with Wiki normal coefficients and leaves unsupported effects display-only', () => {
  const gao = CHARACTER_MAP.gao
  assert.equal(gao.className, 'endura')
  assert.equal(gao.image, '/characters/gao.png')
  assert.equal(gao.defaultAtk, 644)
  assert.deepEqual(gao.normal, [0.98, 1.12, 1.2, 1.28, 1.37, 1.46, 1.56, 1.66, 1.77])
  assert.deepEqual(gao.ultimate, [0.15, 0.175, 0.189, 0.204, 0.22, 0.238, 0.257, 0.278, 0.3])
  assert.deepEqual(gao.passive, [0.12, 0.14, 0.151, 0.163, 0.176, 0.19, 0.206, 0.222, 0.24])
  assert.deepEqual(gao.passive2, [0.04, 0.047, 0.05, 0.054, 0.059, 0.063, 0.069, 0.074, 0.08])
  assert.equal(gao.passiveBuffAffectsAttack, false)
  assert.equal(gao.passive2BuffAffectsAttack, false)
  assert.equal(gao.passive2TargetMode, 'all')
  assert.equal(gao.damageComponents.length, 1)
  assert.equal(gao.damageComponents[0].damageType, 'physical')
  assert.equal(gao.damageComponents[0].damageAttribute, null)
  assert.equal(gao.damageComponents[0].damageAttackKind, 'normal-attack-damage')
  assert.equal(gao.rebuild.length, 0)

  const [result] = calculateParty([createSlot(0, 'gao', { passiveLv: 9, passive2Lv: 9 })])
  assert.equal(result.buffRate, 0)
  assert.ok(Math.abs(component(result, 'normal').damagePerHit - 98) < 1e-10)
  assert.equal(result.damageComponents.some((entry) => entry.skill === 'ultimate'), false)
})

test('Celine is registered with Wiki skill coefficients and only calculates magic normal attacks', () => {
  const celine = CHARACTER_MAP.celine
  assert.equal(celine.className, 'catalyst')
  assert.equal(celine.image, '/characters/celine.png')
  assert.equal(celine.defaultAtk, 240)
  assert.deepEqual(celine.normal, [0.62, 0.72, 0.78, 0.84, 0.91, 0.98, 1.06, 1.15, 1.24])
  assert.deepEqual(celine.passive, [0.03, 0.035, 0.038, 0.041, 0.044, 0.048, 0.051, 0.056, 0.06])
  assert.deepEqual(celine.passiveBuff, [0.005, 0.006, 0.006, 0.007, 0.007, 0.008, 0.009, 0.009, 0.01])
  assert.deepEqual(celine.passive2, [0.4, 0.47, 0.5, 0.54, 0.59, 0.63, 0.69, 0.74, 0.8])
  assert.equal(celine.passiveBuffAffectsAttack, false)
  assert.equal(celine.passive2BuffAffectsAttack, false)
  assert.equal(celine.damageComponents.length, 1)
  assert.equal(celine.damageComponents[0].damageType, 'magic')
  assert.equal(celine.damageComponents[0].damageAttribute, null)
  assert.equal(celine.damageComponents[0].damageAttackKind, 'normal-attack-damage')
  assert.equal(celine.rebuild.length, 0)
  assert.match(celine.passiveText, /書籍/)
  assert.match(celine.passive2Text, /回復/)
  assert.match(celine.exclusive.text, /コアダメージ/)

  const [result] = calculateParty([createSlot(0, 'celine')])
  assert.equal(result.buffRate, 0)
  assert.ok(Math.abs(component(result, 'normal').damagePerHit - 62) < 1e-10)
  assert.equal(result.damageComponents.some((entry) => entry.skill === 'ultimate'), false)
})

test('convict selection lists all classes in the requested order', () => {
  assert.deepEqual(CLASS_ORDER, ['endura', 'fury', 'umbra', 'reticle', 'arcane', 'catalyst'])
  assert.deepEqual(
    CLASS_ORDER.map((className) => CLASS_LABELS[className]),
    ['エンデュア', 'フューリー', 'アンブラ', 'レチクル', 'アーケイン', 'カタリシス'],
  )
})

test('Bianca is registered with Wiki display data and partial calculation support', () => {
  const bianca = CHARACTER_MAP.bianca
  assert.equal(bianca.className, 'reticle')
  assert.equal(bianca.image, '/characters/bianca.png')
  assert.equal(bianca.calculationSupported, true)
  assert.deepEqual(bianca.normal, [0.9, 0.97, 1.05, 1.13, 1.22, 1.32, 1.43, 1.54, 1.67, 1.8])
  assert.deepEqual(bianca.ultimate, [1.5, 1.75, 1.89, 2.04, 2.21, 2.38, 2.57, 2.78, 3])
  assert.deepEqual(bianca.passiveBuff, [0.06, 0.07, 0.076, 0.082, 0.088, 0.095, 0.103, 0.111, 0.12])
  assert.deepEqual(bianca.passive2, [0.045, 0.052, 0.057, 0.061, 0.066, 0.071, 0.077, 0.083, 0.09])
  assert.equal(bianca.skillMaxLevels.normal, 10)
  assert.match(bianca.madness.text, /ビアンカは\[破綻\]マークを付与した敵に対するダメージが20%アップする。/)
  assert.doesNotMatch(bianca.trait, /破綻/)
  assert.equal(bianca.madness.dmgPct, 0.2)
  assert.equal(bianca.madnessRequiresWeakspotMark, true)
  assert.equal(bianca.damageComponents[0].damageType, 'physical')
  assert.equal(bianca.damageComponents[0].damageAttribute, null)
  assert.equal(bianca.damageComponents[0].damageAttackKind, 'normal-attack-damage')
  assert.equal(bianca.damageComponents[1].damageType, 'physical')
  assert.equal(bianca.damageComponents[1].damageAttribute, null)
  assert.equal(bianca.damageComponents[1].damageAttackKind, 'skill-damage')
  assert.equal(bianca.damageComponents[1].hitCountInput, 'weakspot-removal-successes')
  assert.equal(bianca.rebuild.length, 18)
  assert.equal(bianca.rebuild[bianca.rebuild.length - 1].stage, 4)
  assert.equal(isRowSelectable(bianca.rebuild.find((row) => row.id === 's2'), []), false)
  assert.equal(isRowSelectable(bianca.rebuild.find((row) => row.id === 's2'), ['s1']), true)
  assert.equal(isRowSelectable(bianca.rebuild.find((row) => row.id === 's4'), ['s1', 's2']), false)
  assert.equal(isRowSelectable(bianca.rebuild.find((row) => row.id === 's4'), ['s1', 's2', 's3']), true)
})

test('Bianca calculates physical normal and Focus damage from mark conditions', () => {
  const bianca = createSlot(0, 'bianca', {
    passiveLv: 1,
    ultimateLv: 1,
    madness: true,
    weakspotMarked: false,
    weakspotRemovalSuccesses: 2,
    exclusiveLv: 1,
  })
  const [unmarked] = calculateParty([bianca], { def: 0, mdf: 0, isBreak: false })
  assert.ok(Math.abs(component(unmarked, 'normal').damagePerHit - 100 * 1.06 * 0.9 * 1.05) < 1e-10)
  assert.ok(
    Math.abs(component(unmarked, 'focus').damageTotal - 100 * 1.06 * 1.5 * 1.05 * 1.1 * 2) <
      1e-10,
  )

  const [marked] = calculateParty([{ ...bianca, weakspotMarked: true }], {
    def: 0,
    mdf: 0,
    isBreak: true,
  })
  assert.ok(Math.abs(marked.dmgBonus - 0.25) < 1e-10)
  assert.ok(
    Math.abs(
      component(marked, 'focus').damageTotal -
        100 * 1.06 * 1.5 * 1.25 * 1.05 * 1.1 * 1.5 * 2,
    ) < 1e-10,
  )
})

test('Bianca does not calculate Focus hits without successful mark removals', () => {
  const [result] = calculateParty([createSlot(0, 'bianca')], { def: 0, mdf: 0, isBreak: false })
  assert.equal(result.damageComponents.some((entry) => entry.id === 'focus'), false)
})

test('Margaret is registered with Wiki data and calculates only her normal attack', () => {
  const margaret = CHARACTER_MAP.margaret
  assert.equal(margaret.className, 'catalyst')
  assert.equal(margaret.image, '/characters/margaret.png')
  assert.equal(margaret.defaultAtk, 240)
  assert.deepEqual(margaret.normal, [0.56, 0.65, 0.71, 0.76, 0.82, 0.89, 0.96, 1.04, 1.12])
  assert.deepEqual(margaret.ultimate, [1.28, 1.49, 1.61, 1.74, 1.88, 2.03, 2.19, 2.37, 2.56])
  assert.equal(margaret.skillMaxLevels.normal, 9)
  assert.equal(margaret.damageComponents.length, 2)
  assert.equal(margaret.damageComponents[0].damageType, 'physical')
  assert.equal(margaret.damageComponents[0].damageAttribute, null)
  assert.equal(margaret.damageComponents[0].damageAttackKind, 'normal-attack-damage')
  assert.equal(margaret.damageComponents[1].damageType, 'physical')
  assert.equal(margaret.damageComponents[1].damageAttribute, null)
  assert.equal(margaret.damageComponents[1].damageAttackKind, 'normal-attack-damage')
  assert.equal(margaret.damageComponents[1].calculationEnabled, false)
  assert.equal(margaret.passiveBuffTargetMode, 'select-one')
  assert.equal(margaret.passiveBuffAffectsAttack, false)
  assert.equal(margaret.passive2TargetMode, 'none')
  assert.match(margaret.passive2Text, /【護衛行動】発動後/)
  assert.equal(margaret.rebuild.length, 0)

  const [normal] = calculateParty([createSlot(0, 'margaret', { normalLv: 1 })], {
    def: 0,
    mdf: 0,
    isBreak: false,
  })
  assert.ok(Math.abs(component(normal, 'normal').damagePerHit - 56) < 1e-10)
  assert.equal(normal.damageComponents.some((entry) => entry.skill === 'ultimate'), false)

  const [breaking] = calculateParty([createSlot(0, 'margaret', { normalLv: 9 })], {
    def: 0,
    mdf: 0,
    isBreak: true,
  })
  assert.ok(Math.abs(component(breaking, 'normal').damagePerHit - 112 * 1.5) < 1e-10)
})

test('Zoya no longer applies non-existent attack buffs', () => {
  const [result] = calculateParty([createSlot(0, 'zoya')])
  assert.equal(result.buffRate, 0)
})

test('sigil and rebuild modifiers feed attack, normal, and ultimate multipliers', () => {
  const zoya = createSlot(0, 'zoya', {
    madness: true,
    sigils: [
      { setId: 'rift', lv: 1 },
      { setId: 'rift', lv: 1 },
      { setId: null, lv: 1 },
    ],
    rebuild: ['s1', 'atk', 'phys', 'ultDmg', 'ultA'],
  })
  const [result] = calculateParty([zoya])

  assert.ok(Math.abs(result.effectiveAtk - 118.25) < 1e-10)
  assert.ok(Math.abs(result.dmgBonus - 0.225) < 1e-10)
  assert.equal(result.ultimateName, '怒りの軍臨')
  assert.ok(Math.abs(result.normal - 0.83 * 1.1825 * 1.225) < 1e-10)
  assert.ok(Math.abs(result.ultimate - 5 * 1.1825 * 1.225 * 1.32) < 1e-10)
})

test('damage components apply enemy defense, Break, and minimum damage', () => {
  const zoya = createSlot(0, 'zoya', { madness: true })
  const [result] = calculateParty([zoya], { def: 1000, mdf: 50, isBreak: true })
  const normal = component(result, 'normal')

  assert.equal(normal.appliedDefense, 1000)
  assert.ok(Math.abs(normal.damagePerHit - 100 * 0.05 * 0.83 * 1.15 * 1.15 * 1.5) < 1e-10)
  assert.equal(component(result, 'passive1-current-hp').damageTotal, null)
})

test('Zoya applies Break and shackle conditions only when selected', () => {
  const zoya = createSlot(0, 'zoya', {
    shackle: 3,
    singleEnemyInRange: true,
  })
  const [result] = calculateParty([zoya], {
    def: 0,
    mdf: 0,
    isBreak: true,
  })
  assert.ok(
    Math.abs(
      component(result, 'normal').damagePerHit -
        0.83 * 100 * 1.05 * 1.05 * 1.2 * 1.05 * 1.5,
    ) < 1e-10,
  )
})

test('NOX defeat stacks raise ATK, reduce enemy DEF, and calculate exclusive damage', () => {
  const nox = createSlot(0, 'nox', {
    passiveLv: 1,
    passive2Lv: 1,
    defeatedEnemyCount: 30,
    exclusiveLv: 1,
  })
  const ally = createSlot(1, 'zoya')
  const [noxResult, allyResult] = calculateParty([nox, ally], {
    def: 100,
    mdf: 0,
    isBreak: false,
  })

  assert.ok(Math.abs(noxResult.effectiveAtk - 115) < 1e-10)
  assert.equal(component(noxResult, 'normal').appliedDefense, 85)
  assert.equal(component(allyResult, 'normal').appliedDefense, 85)
  assert.equal(component(noxResult, 'exclusive-ultimate-damage').coefficientPerHit, 6)
})

test('exclusive engraving descriptions use the selected level values', () => {
  assert.deepEqual(CHARACTER_MAP.zoya.exclusive.valuesByLevel, [0, 0.3, 0.35, 0.4])
  assert.match(CHARACTER_MAP.zoya.exclusive.text, /\{v\}/)
  assert.deepEqual(CHARACTER_MAP.nox.exclusive.valuesByLevel, [0, 6, 7, 8])
  assert.match(CHARACTER_MAP.nox.exclusive.text, /\{v\}/)
})

test('crimebrand parts have set-specific level stats and set thresholds', () => {
  assert.equal(sigilPartStat('embrace', 0, 1).value, 0.03)
  assert.equal(sigilPartStat('embrace', 0, 10).value, 0.06)
  assert.equal(sigilPartStat('rift', 1, 10).value, 0.2)
  assert.equal(sigilPartStat('echo', 2, 10).value, 0.1)
  assert.deepEqual(
    activeSets([
      { setId: 'rift' },
      { setId: 'rift' },
      { setId: 'echo' },
    ]).map((set) => set.id),
    ['rift', 'echo'],
  )
})

test('Embrace increases damage during Break and Break applies the 1.5x multiplier', () => {
  const sigils = [0, 1, 2].map(() => ({ setId: 'embrace', lv: 1 }))
  const zoya = createSlot(0, 'zoya', { sigils })
  const [notBreaking] = calculateParty([zoya])
  const [breaking] = calculateParty([zoya], {
    def: 0,
    mdf: 0,
    isBreak: true,
  })

  assert.ok(Math.abs(notBreaking.normal - 0.83 * 1.06 * 1.05) < 1e-10)
  assert.ok(Math.abs(breaking.normal - 0.83 * 1.06 * 1.05 * 1.45 * 1.5) < 1e-10)
  assert.ok(
    Math.abs(
      component(breaking, 'normal').damagePerHit -
        component(notBreaking, 'normal').damagePerHit * 1.45 * 1.5,
    ) < 1e-10,
  )
})

test('Rift stacks reduce enemy DEF for the whole party and Echo adds shown stats', () => {
  const rift = createSlot(0, 'zoya', {
    riftStacks: 3,
    sigils: [
      { setId: 'rift', lv: 1 },
      { setId: 'rift', lv: 1 },
      { setId: null, lv: 1 },
    ],
  })
  const echo = createSlot(1, 'nox', {
    sigils: [
      { setId: null, lv: 1 },
      { setId: null, lv: 1 },
      { setId: 'echo', lv: 10 },
    ],
  })
  const [riftResult, echoResult] = calculateParty([rift, echo], {
    def: 100,
    mdf: 0,
    isBreak: false,
  })

  assert.equal(component(riftResult, 'normal').appliedDefense, 73)
  assert.equal(component(echoResult, 'normal').appliedDefense, 73)
  assert.equal(echoResult.sigilStats.attackSpeedPct, 0.1)
  assert.equal(echoResult.sigilStats.initialEnergy, 8)
})
