import { nox } from './character-data/nox'
import { bianca } from './character-data/bianca'
import { margaret } from './character-data/margaret'
import { ll } from './character-data/ll'
import { jerena } from './character-data/jerena'
import { gao } from './character-data/gao'
import { celine } from './character-data/celine'
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
export const CHARACTERS: Character[] = [gao, zoya, nox, yao, bianca, margaret, ll, jerena, celine]

export const CHARACTER_MAP: Record<string, Character> = Object.fromEntries(
  CHARACTERS.map((character) => [character.id, character]),
)
