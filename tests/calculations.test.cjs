require('./register-typescript.cjs')

const assert = require('node:assert/strict')
const test = require('node:test')
const { calculateParty, createEmptySlot } = require('../lib/calc.ts')
const { CHARACTER_MAP } = require('../lib/characters.ts')

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
  assert.deepEqual(Object.keys(CHARACTER_MAP), ['zoya', 'nox', 'yao', 'raven', 'shade', 'brute', 'mira'])
  assert.deepEqual(CHARACTER_MAP.zoya.normal, [0.83, 0.89, 0.95, 1.01, 1.08, 1.15, 1.23, 1.31, 1.4, 1.5])
  assert.equal(CHARACTER_MAP.zoya.damageComponents.length, 5)
  assert.equal(CHARACTER_MAP.zoya.passiveBuffTargetMode, 'none')
  assert.equal(CHARACTER_MAP.nox.normal[0], 0.9)
  assert.equal(CHARACTER_MAP.nox.passive2TargetMode, 'enemy-all')
})

test('Zoya no longer applies non-existent attack buffs', () => {
  const [result] = calculateParty([createSlot(0, 'zoya')])
  assert.equal(result.buffRate, 0)
})

test('sigil and rebuild modifiers feed attack, normal, and ultimate multipliers', () => {
  const zoya = createSlot(0, 'zoya', {
    madness: true,
    sigils: [0, 1, 2].map(() => ({ setId: 'rift', lv: 1 })),
    rebuild: ['s1', 'atk', 'phys', 'ultDmg', 'ultA'],
  })
  const [result] = calculateParty([zoya])

  assert.ok(Math.abs(result.effectiveAtk - 118.25) < 1e-10)
  assert.ok(Math.abs(result.dmgBonus - 0.375) < 1e-10)
  assert.equal(result.ultimateName, '怒りの軍臨')
  assert.ok(Math.abs(result.normal - 0.83 * 1.1825 * 1.375) < 1e-10)
  assert.ok(Math.abs(result.ultimate - 5 * 1.1825 * 1.375 * 1.32) < 1e-10)
})

test('damage components apply enemy defense, Break, and minimum damage', () => {
  const zoya = createSlot(0, 'zoya', { madness: true })
  const [result] = calculateParty([zoya], { def: 1000, mdf: 50, isBreak: true })
  const normal = component(result, 'normal')

  assert.equal(normal.appliedDefense, 1000)
  assert.ok(Math.abs(normal.damagePerHit - 100 * 0.05 * 0.83 * 1.15 * 1.5) < 1e-10)
  assert.equal(component(result, 'passive1-current-hp').damageTotal, null)
})

test('Zoya applies core-broken and shackle conditions only when selected', () => {
  const zoya = createSlot(0, 'zoya', {
    shackle: 3,
    singleEnemyInRange: true,
  })
  const [result] = calculateParty([zoya], {
    def: 0,
    mdf: 0,
    isBreak: false,
    isCoreBroken: true,
  })
  assert.ok(Math.abs(component(result, 'normal').damagePerHit - 0.83 * 100 * 1.05 * 1.05 * 1.2 * 1.05) < 1e-10)
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
    isCoreBroken: false,
  })

  assert.ok(Math.abs(noxResult.effectiveAtk - 115) < 1e-10)
  assert.equal(component(noxResult, 'normal').appliedDefense, 85)
  assert.equal(component(allyResult, 'normal').appliedDefense, 85)
  assert.equal(component(noxResult, 'exclusive-ultimate-damage').coefficientPerHit, 6)
})
