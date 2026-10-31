import { defineCharacter, linearLevels } from '../character-model'

export const mira = defineCharacter({
  id: 'mira',
  name: 'ミラ',
  className: 'endura',
  image: '/characters/mira.png',
  defaultAtk: 100,
  normal: linearLevels(1.0, 0.1),
  ultimate: linearLevels(3.6, 0.36),
  ultimateName: '聖鏡の加護',
  passive: linearLevels(0.7, 0.07),
  passiveBuff: linearLevels(0.18, 0.02),
  passive2: linearLevels(0.07, 0.012),
  madnessDmgPct: 0.06,
  exclusive: { base: 0.28, perLevel: 0.025 },
  rebuildUlts: ['鏡界の祝福', '鏡界の断罪'],
})
