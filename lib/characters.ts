import { nox } from './character-data/nox'
import { yao } from './character-data/yao'
import { zoya } from './character-data/zoya'
import type { Character } from './character-model'

export {
  CLASS_LABELS,
  CLASS_ORDER,
  MAX_EXCLUSIVE_LEVEL,
  MAX_SHACKLE,
  MAX_SKILL_LEVEL,
  coefAt,
  formatPct,
  valueAt,
  type BuffTargetMode,
  type Character,
  type CharacterClass,
} from './character-model'

/** キャラクター定義を追加するときは、キャラ別ファイルをここに登録する。 */
export const CHARACTERS: Character[] = [zoya, nox, yao]

export const CHARACTER_MAP: Record<string, Character> = Object.fromEntries(
  CHARACTERS.map((character) => [character.id, character]),
)
