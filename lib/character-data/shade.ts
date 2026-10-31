import { defineCharacter, linearLevels } from '../character-model'

export const shade = defineCharacter({
  id: 'shade',
  name: 'シェイド',
  className: 'umbra',
  image: '/characters/shade.png',
  defaultAtk: 100,
  normal: linearLevels(1.25, 0.125),
  ultimate: linearLevels(5.5, 0.55),
  ultimateName: '影縫い',
  passive: linearLevels(0.9, 0.09),
  passiveBuff: linearLevels(0.15, 0.025),
  passive2: linearLevels(0.05, 0.01),
  madnessDmgPct: 0.1,
  exclusive: { base: 0.2, perLevel: 0.02 },
  rebuildUlts: ['朧影の呪縛', '幽影の呪縛'],
})
