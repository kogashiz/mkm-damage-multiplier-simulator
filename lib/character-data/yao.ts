import { defineCharacter, linearLevels } from '../character-model'

export const yao = defineCharacter({
  id: 'yao',
  name: '曜',
  className: 'fury',
  image: '/characters/yao.png',
  defaultAtk: 100,
  normal: linearLevels(1.1, 0.11),
  ultimate: linearLevels(6.0, 0.6),
  ultimateName: '烈陽斬',
  passive: linearLevels(0.6, 0.06),
  passiveBuff: linearLevels(0.12, 0.02),
  passive2: linearLevels(0.06, 0.01),
  madnessDmgPct: 0.08,
  exclusive: { base: 0.22, perLevel: 0.02 },
  rebuildUlts: ['灼陽の剣舞', '白陽の剣舞'],
})
