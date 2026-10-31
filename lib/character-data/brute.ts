import { defineCharacter, linearLevels } from '../character-model'

export const brute = defineCharacter({
  id: 'brute',
  name: 'ブルート',
  className: 'endura',
  image: '/characters/brute.png',
  defaultAtk: 100,
  normal: linearLevels(0.9, 0.09),
  ultimate: linearLevels(3.0, 0.3),
  ultimateName: '鉄壁の咆哮',
  passive: linearLevels(0.5, 0.05),
  passiveBuff: linearLevels(0.2, 0.03),
  passive2: linearLevels(0.08, 0.015),
  madnessDmgPct: 0.06,
  exclusive: { base: 0.3, perLevel: 0.03 },
  rebuildUlts: ['鋼鉄の城砦', '鋼鉄の突撃'],
})
