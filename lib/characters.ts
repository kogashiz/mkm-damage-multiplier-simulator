import { buildRebuild, type RebuildRow } from './rebuild'

export type CharacterClass = 'fury' | 'umbra' | 'endura'

export const CLASS_LABELS: Record<CharacterClass, string> = {
  fury: 'フューリー',
  umbra: 'アンブラ',
  endura: 'エンデュア',
}

export const CLASS_ORDER: CharacterClass[] = ['fury', 'umbra', 'endura']

export const MAX_SKILL_LEVEL = 10
export const MAX_SHACKLE = 5
export const MAX_EXCLUSIVE_LEVEL = 5

type Scaling = { base: number; perLevel: number }

/**
 * テキスト内の {v} はスキル係数、{b} はバフ値に置き換えて表示されます。
 */
export type Character = {
  id: string
  name: string
  className: CharacterClass
  image: string
  defaultAtk: number
  trait: string
  madness: { text: string; dmgPct: number }
  normal: Scaling & { text: string }
  ultimate: Scaling & { name: string; text: string }
  passive: Scaling & { buffBase: number; buffPerLevel: number; text: string }
  passive2: { buffBase: number; buffPerLevel: number; text: string }
  shackles: { name: string; text: string }[]
  exclusive: Scaling & { text: string }
  rebuild: RebuildRow[]
}

type CharacterSeed = Pick<Character, 'id' | 'name' | 'className' | 'image' | 'defaultAtk'> & {
  normal: Scaling
  ultimate: Scaling & { name: string }
  passive: Scaling & { buffBase: number; buffPerLevel: number }
  passive2: { buffBase: number; buffPerLevel: number }
  madnessDmgPct: number
  exclusive: Scaling
  rebuildUlts: [string, string]
  overrides?: Partial<Pick<Character, 'trait' | 'shackles'>> & {
    madnessText?: string
    normalText?: string
    ultimateText?: string
    passiveText?: string
    passive2Text?: string
    exclusiveText?: string
  }
}

function defineCharacter(seed: CharacterSeed): Character {
  const { name, overrides = {} } = seed
  const role = CLASS_LABELS[seed.className]
  return {
    id: seed.id,
    name,
    className: seed.className,
    image: seed.image,
    defaultAtk: seed.defaultAtk,
    trait: overrides.trait ?? `${role}のコンビクト。与ダメージが5%アップし、…`,
    madness: {
      text: overrides.madnessText ?? '与ダメージが{v}アップし、…',
      dmgPct: seed.madnessDmgPct,
    },
    normal: {
      ...seed.normal,
      text: overrides.normalText ?? `${name}は毎回敵1体に自身のATK {v}の物理ダメージを与える。`,
    },
    ultimate: {
      ...seed.ultimate,
      text:
        overrides.ultimateText ??
        `${name}はスキル範囲内の全ての敵に自身のATKの{v}の物理ダメージを与える。`,
    },
    passive: {
      ...seed.passive,
      text:
        overrides.passiveText ??
        `${name}は自身のATK {v}の追加ダメージを与え、指定した味方のATKが{b}アップする。`,
    },
    passive2: {
      ...seed.passive2,
      text: overrides.passive2Text ?? `${name}は戦闘開始時、指定した味方のATKが{b}アップする。`,
    },
    shackles: overrides.shackles ?? [
      { name: '転覆', text: '必殺技の継続時間が5秒延長する' },
      { name: '枷共鳴 I', text: '通常攻撃ダメージが5%アップする' },
      { name: 'エンカウント', text: `${name}の周囲に敵が1体のみ存在する場合、与ダメージが20%アップする。` },
      { name: '枷共鳴 II', text: '必殺技ダメージが10%アップする' },
      { name: '解放', text: '必殺技のクールタイムが2秒短縮する' },
    ],
    exclusive: { ...seed.exclusive, text: overrides.exclusiveText ?? '被ダメージが{v}ダウン' },
    rebuild: buildRebuild(name, ...seed.rebuildUlts),
  }
}

/**
 * サンプルデータ。係数とテキストは計算フロー確認用の仮の値です。
 */
export const CHARACTERS: Character[] = [
  defineCharacter({
    id: 'zoya',
    name: 'ゾーヤ',
    className: 'fury',
    image: '/characters/zoya.png',
    defaultAtk: 100,
    normal: { base: 0.83, perLevel: 0.083 },
    ultimate: { base: 5.0, perLevel: 0.5, name: '怒りの軍団' },
    passive: { base: 0.8, perLevel: 0.08, buffBase: 0.1, buffPerLevel: 0.02 },
    passive2: { buffBase: 0.05, buffPerLevel: 0.01 },
    madnessDmgPct: 0.1,
    exclusive: { base: 0.25, perLevel: 0.025 },
    rebuildUlts: ['怒りの軍臨', '疾鋒の軍臨'],
    overrides: {
      trait: '物理攻撃に長けたコンビクト。与ダメージが5%アップし、…',
      normalText: 'ゾーヤは敏捷な体術で攻撃し、毎回敵1体に自身のATK {v}の物理ダメージを与える。',
      ultimateText:
        'ゾーヤは全ての力を爆発させ、スキル範囲内の全ての敵に自身のATKの{v}の物理ダメージを与え、【恐怖】状態を付与する。継続時間は3秒。…',
      passiveText:
        'ゾーヤは通常攻撃を2回行うごとに、次の通常攻撃で追加で自身のATK {v}の防御無視ダメージを与え、指定した味方のATKが{b}アップする。',
      passive2Text: 'ゾーヤは通常攻撃で連続ダメージを与えた後、指定した味方のATKが{b}アップする。',
    },
  }),
  defineCharacter({
    id: 'nox',
    name: 'NOX',
    className: 'fury',
    image: '/characters/nox.png',
    defaultAtk: 100,
    normal: { base: 1.35, perLevel: 0.135 },
    ultimate: { base: 5.2, perLevel: 0.52, name: '深淵の夜幕' },
    passive: { base: 1.0, perLevel: 0.1, buffBase: 0.08, buffPerLevel: 0.015 },
    passive2: { buffBase: 0.04, buffPerLevel: 0.01 },
    madnessDmgPct: 0.12,
    exclusive: { base: 0.2, perLevel: 0.02 },
    rebuildUlts: ['永夜の顕現', '黒影の顕現'],
  }),
  defineCharacter({
    id: 'yao',
    name: '曜',
    className: 'fury',
    image: '/characters/yao.png',
    defaultAtk: 100,
    normal: { base: 1.1, perLevel: 0.11 },
    ultimate: { base: 6.0, perLevel: 0.6, name: '烈陽斬' },
    passive: { base: 0.6, perLevel: 0.06, buffBase: 0.12, buffPerLevel: 0.02 },
    passive2: { buffBase: 0.06, buffPerLevel: 0.01 },
    madnessDmgPct: 0.08,
    exclusive: { base: 0.22, perLevel: 0.02 },
    rebuildUlts: ['灼陽の剣舞', '白陽の剣舞'],
  }),
  defineCharacter({
    id: 'raven',
    name: 'レイヴン',
    className: 'umbra',
    image: '/characters/raven.png',
    defaultAtk: 100,
    normal: { base: 1.5, perLevel: 0.15 },
    ultimate: { base: 4.8, perLevel: 0.48, name: '黒羽の葬送' },
    passive: { base: 1.2, perLevel: 0.12, buffBase: 0.05, buffPerLevel: 0.01 },
    passive2: { buffBase: 0.03, buffPerLevel: 0.008 },
    madnessDmgPct: 0.1,
    exclusive: { base: 0.18, perLevel: 0.02 },
    rebuildUlts: ['鴉羽の嵐', '鴉羽の刃'],
  }),
  defineCharacter({
    id: 'shade',
    name: 'シェイド',
    className: 'umbra',
    image: '/characters/shade.png',
    defaultAtk: 100,
    normal: { base: 1.25, perLevel: 0.125 },
    ultimate: { base: 5.5, perLevel: 0.55, name: '影縫い' },
    passive: { base: 0.9, perLevel: 0.09, buffBase: 0.15, buffPerLevel: 0.025 },
    passive2: { buffBase: 0.05, buffPerLevel: 0.01 },
    madnessDmgPct: 0.1,
    exclusive: { base: 0.2, perLevel: 0.02 },
    rebuildUlts: ['朧影の呪縛', '幽影の呪縛'],
  }),
  defineCharacter({
    id: 'brute',
    name: 'ブルート',
    className: 'endura',
    image: '/characters/brute.png',
    defaultAtk: 100,
    normal: { base: 0.9, perLevel: 0.09 },
    ultimate: { base: 3.0, perLevel: 0.3, name: '鉄壁の咆哮' },
    passive: { base: 0.5, perLevel: 0.05, buffBase: 0.2, buffPerLevel: 0.03 },
    passive2: { buffBase: 0.08, buffPerLevel: 0.015 },
    madnessDmgPct: 0.06,
    exclusive: { base: 0.3, perLevel: 0.03 },
    rebuildUlts: ['鋼鉄の城砦', '鋼鉄の突撃'],
  }),
  defineCharacter({
    id: 'mira',
    name: 'ミラ',
    className: 'endura',
    image: '/characters/mira.png',
    defaultAtk: 100,
    normal: { base: 1.0, perLevel: 0.1 },
    ultimate: { base: 3.6, perLevel: 0.36, name: '聖鏡の加護' },
    passive: { base: 0.7, perLevel: 0.07, buffBase: 0.18, buffPerLevel: 0.02 },
    passive2: { buffBase: 0.07, buffPerLevel: 0.012 },
    madnessDmgPct: 0.06,
    exclusive: { base: 0.28, perLevel: 0.025 },
    rebuildUlts: ['鏡界の祝福', '鏡界の断罪'],
  }),
]

export const CHARACTER_MAP: Record<string, Character> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c]),
)

export const coefAt = (base: number, perLevel: number, lv: number) => base + perLevel * (lv - 1)

export const formatPct = (n: number) => `${Number((n * 100).toFixed(2))}%`
