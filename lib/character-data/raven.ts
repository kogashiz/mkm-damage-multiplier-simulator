import { defineCharacter, linearLevels } from '../character-model'

export const raven = defineCharacter({
  id: 'raven',
  name: 'レイヴン',
  className: 'umbra',
  image: '/characters/raven.png',
  defaultAtk: 100,
  normal: linearLevels(1.5, 0.15),
  ultimate: linearLevels(4.8, 0.48),
  ultimateName: '黒羽の葬送',
  passive: linearLevels(1.2, 0.12),
  passiveBuff: linearLevels(0.05, 0.01),
  passive2: linearLevels(0.03, 0.008),
  madnessDmgPct: 0.1,
  exclusive: { base: 0.18, perLevel: 0.02 },
  rebuildUlts: ['鴉羽の嵐', '鴉羽の刃'],
})
