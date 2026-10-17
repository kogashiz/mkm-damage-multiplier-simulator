export type CharacterClass = 'fury' | 'umbra' | 'endura'

export const CLASS_LABELS: Record<CharacterClass, string> = {
  fury: 'フューリー',
  umbra: 'アンブラ',
  endura: 'エンデュア',
}

export const CLASS_ORDER: CharacterClass[] = ['fury', 'umbra', 'endura']

export const MAX_SKILL_LEVEL = 10

export type Character = {
  id: string
  name: string
  className: CharacterClass
  image: string
  defaultAtk: number
  /** 攻撃力に対するダメージ係数（Lv1 の値 + Lvごとの上昇量） */
  normal: { base: number; perLevel: number }
  ultimate: { base: number; perLevel: number }
  passive: {
    base: number
    perLevel: number
    /** 対象に付与する攻撃力バフ（Lv1の値 + Lvごとの上昇量、割合） */
    buffBase: number
    buffPerLevel: number
  }
}

/**
 * サンプルデータ。係数は計算フロー確認用の仮の値です。
 */
export const CHARACTERS: Character[] = [
  {
    id: 'zoya',
    name: 'ゾーヤ',
    className: 'fury',
    image: '/characters/zoya.png',
    defaultAtk: 100,
    normal: { base: 1.2, perLevel: 0.12 },
    ultimate: { base: 4.5, perLevel: 0.45 },
    passive: { base: 0.8, perLevel: 0.08, buffBase: 0.1, buffPerLevel: 0.02 },
  },
  {
    id: 'nox',
    name: 'NOX',
    className: 'fury',
    image: '/characters/nox.png',
    defaultAtk: 100,
    normal: { base: 1.35, perLevel: 0.135 },
    ultimate: { base: 5.2, perLevel: 0.52 },
    passive: { base: 1.0, perLevel: 0.1, buffBase: 0.08, buffPerLevel: 0.015 },
  },
  {
    id: 'yao',
    name: '曜',
    className: 'fury',
    image: '/characters/yao.png',
    defaultAtk: 100,
    normal: { base: 1.1, perLevel: 0.11 },
    ultimate: { base: 6.0, perLevel: 0.6 },
    passive: { base: 0.6, perLevel: 0.06, buffBase: 0.12, buffPerLevel: 0.02 },
  },
  {
    id: 'raven',
    name: 'レイヴン',
    className: 'umbra',
    image: '/characters/raven.png',
    defaultAtk: 100,
    normal: { base: 1.5, perLevel: 0.15 },
    ultimate: { base: 4.8, perLevel: 0.48 },
    passive: { base: 1.2, perLevel: 0.12, buffBase: 0.05, buffPerLevel: 0.01 },
  },
  {
    id: 'shade',
    name: 'シェイド',
    className: 'umbra',
    image: '/characters/shade.png',
    defaultAtk: 100,
    normal: { base: 1.25, perLevel: 0.125 },
    ultimate: { base: 5.5, perLevel: 0.55 },
    passive: { base: 0.9, perLevel: 0.09, buffBase: 0.15, buffPerLevel: 0.025 },
  },
  {
    id: 'brute',
    name: 'ブルート',
    className: 'endura',
    image: '/characters/brute.png',
    defaultAtk: 100,
    normal: { base: 0.9, perLevel: 0.09 },
    ultimate: { base: 3.0, perLevel: 0.3 },
    passive: { base: 0.5, perLevel: 0.05, buffBase: 0.2, buffPerLevel: 0.03 },
  },
  {
    id: 'mira',
    name: 'ミラ',
    className: 'endura',
    image: '/characters/mira.png',
    defaultAtk: 100,
    normal: { base: 1.0, perLevel: 0.1 },
    ultimate: { base: 3.6, perLevel: 0.36 },
    passive: { base: 0.7, perLevel: 0.07, buffBase: 0.18, buffPerLevel: 0.02 },
  },
]

export const CHARACTER_MAP: Record<string, Character> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c]),
)
