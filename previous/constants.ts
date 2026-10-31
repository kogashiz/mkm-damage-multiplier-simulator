/**
 * 攻撃種別の定義
 */
export const ATTACK_TYPE = Object.freeze({
    NORMAL: 'NORMAL',         // 通常攻撃
    ULT: 'ULT', // 必殺技
    ALL: 'ALL',               // 通常攻撃、必殺技、パッシブなどすべての場合 そんなのないかも
    NOT_ATTACK: 'NOT_ATTACK',             // 通常ATKなどのステータス、パッシブステータス
    // ULT_SKILL: 'ULT_SKILL',   // 必殺技（即時発動ダメージ等）
    // PASSIVE: 'PASSIVE'        // パッシブ技
});

/**
 * 計算項目の大カテゴリ（どの補正リストに格納するか）
 */
export const EFFECT_CATEGORY = Object.freeze({
    ATK: 'atkMods',               // 最終ATK
    DEF: 'defMods',               // 最終DEF（物理防御）
    MDF: 'mdfMods',               // 最終MDF（魔法抵抗）
    DAMAGE_COEF: 'damageMods',    // ダメージ係数 (スキル倍率など)
    CRIT: 'critMods',             // クリティカル
    ETC: 'etcMods'                // その他補正 (与ダメ/被ダメ/コア等)
});

/**
 * 効果タイプ（Enum風定数）
 * 計算式上のルールに合わせて定義
 */
export const EFFECT_TYPE = Object.freeze({
    // --- 1. 最終ATK ---
    BASE_ATK: 'BASE_ATK',               // 基礎ATK
    ATK_UP: 'ATK_UP',                   // ATKアップ (%)
    ATK_DOWN: 'ATK_DOWN',               // ATKダウン (%)

    // --- 2. 最終DEF（物理防御） ---
    BASE_DEF: 'BASE_DEF',               // 基礎物理防御 (DEF)
    // DEF_UP: 'DEF_UP',                   // DEFアップ (%) コンビクトの能力上昇は敵と関係ないので
    DEF_DOWN: 'DEF_DOWN',               // 敵DEFダウン (%) -> 例: NOXパッシブ2
    PHYSICAL_PENETRATION_DOWN: 'PHYSICAL_PENETRATION_DOWN', // 物理貫通 (%)

    // --- 3. 最終MDF（魔法抵抗） ---
    BASE_MDF: 'BASE_MDF',               // 基礎魔法抵抗 (MDF)
    // MDF_UP: 'MDF_UP',                   // MDFアップ (%)
    MDF_DOWN: 'MDF_DOWN',               // 敵MDFダウン (%)
    MAGIC_PENETRATION_DOWN: 'MAGIC_PENETRATION_DOWN',       // 魔法貫通 (%)

    // --- 4. ダメージ係数 ---
    BASE_DAMAGE_COEF: 'BASE_DAMAGE_COEF', // 基礎ダメージ係数
    DAMAGE_COEF_UP: 'DAMAGE_COEF_UP',     // ダメージ係数アップ

    // --- 5. クリティカル --- 変わるかも
    CRIT_RATE_UP: 'CRIT_RATE_UP',       // クリティカル率アップ
    CRIT_DAMAGE_UP: 'CRIT_DAMAGE_UP',   // クリティカルダメージアップ

    // --- 6. その他補正 (ダメUP・被ダメUP枠) --- 変わるかも
    ALL_DAMAGE_UP: 'ALL_DAMAGE_UP',         // 全ダメージアップ (%)
    NORMAL_DAMAGE_UP: 'NORMAL_DAMAGE_UP',   // 通常攻撃ダメージアップ (%)
    ULT_DAMAGE_UP: 'ULT_DAMAGE_UP',         // 必殺技ダメージアップ (%)
    TAKEN_DAMAGE_UP: 'TAKEN_DAMAGE_UP',           // 被ダメージアップ (%)
    CORE_BREAKING_DAMAGE_UP: 'CORE_BREAKING_DAMAGE_UP'  // コアブレイク中の被ダメージ補正
    // PHYSICAL_TAKEN_DAMAGE_UP: 'PHYSICAL_TAKEN_DAMAGE_UP', // 物理被ダメージアップ (%) 分け方分かってないのであとで
    // PHYSICAL_DAMAGE_UP: 'PHYSICAL_DAMAGE_UP', // 物理ダメージアップ (%)
    // MAGIC_DAMAGE_UP: 'MAGIC_DAMAGE_UP',     // 魔法ダメージアップ (%)
});

// 表示用・デバッグ用 日本語ラベルマップ
export const EFFECT_TYPE_LABEL = Object.freeze({
    // --- 1. 最終ATK ---
    [EFFECT_TYPE.BASE_ATK]: '基礎ATK',
    [EFFECT_TYPE.ATK_UP]: 'ATKアップ',
    [EFFECT_TYPE.ATK_DOWN]: 'ATKダウン',

    // --- 2. 最終DEF（物理防御） ---
    [EFFECT_TYPE.BASE_DEF]: '基礎物理防御 (DEF)',
    [EFFECT_TYPE.DEF_DOWN]: '敵DEFダウン',
    [EFFECT_TYPE.PHYSICAL_PENETRATION_DOWN]: '物理貫通',

    // --- 3. 最終MDF（魔法抵抗） ---
    [EFFECT_TYPE.BASE_MDF]: '基礎魔法抵抗 (MDF)',
    [EFFECT_TYPE.MDF_DOWN]: '敵MDFダウン',
    [EFFECT_TYPE.MAGIC_PENETRATION_DOWN]: '魔法貫通',

    // --- 4. ダメージ係数 ---
    [EFFECT_TYPE.BASE_DAMAGE_COEF]: '基礎ダメージ係数',
    [EFFECT_TYPE.DAMAGE_COEF_UP]: 'ダメージ係数アップ',

    // --- 5. クリティカル ---
    [EFFECT_TYPE.CRIT_RATE_UP]: 'クリティカル率アップ',
    [EFFECT_TYPE.CRIT_DAMAGE_UP]: 'クリティカルダメージアップ',

    // --- 6. その他補正 ---
    [EFFECT_TYPE.ALL_DAMAGE_UP]: '全ダメージアップ',
    [EFFECT_TYPE.NORMAL_DAMAGE_UP]: '通常攻撃ダメージアップ',
    [EFFECT_TYPE.ULT_DAMAGE_UP]: '必殺技ダメージアップ',
    [EFFECT_TYPE.TAKEN_DAMAGE_UP]: '被ダメージアップ',
    [EFFECT_TYPE.CORE_BREAKING_DAMAGE_UP]: 'コアブレイク中被ダメージ補正'
});

/**
 * パーセント数値を小数（割合）に安全に変換するヘルパー関数
 * 例: pct(15) -> 0.15
 * 例: pct(1.5) -> 0.015
 * 
 * @param {number} percentValue - パーセント値 (15% なら 15)
 * @returns {number} 小数値 (0.15)
 */
export function toRatio(percentValue: number) {
    return percentValue / 100;
}

/**
 * 効果（Buff）オブジェクトを標準フォーマットで生成するファクトリ関数
 * @param {string} effectType - EFFECT_TYPEのいずれか
 * @param {number} value - 補正値 (toRatioなどで割合化した数値)
 * @param {Object} options - オプション (targetTypeなど)
 * @returns {Object} 標準化されたModオブジェクト
 */
export function createBuffMod(attackType: any, effectType: string | number, buffRatio: number, scope = 'SELF') {
    return {
        attackType: attackType,
        effectType: effectType,
        effectTypeLabel: EFFECT_TYPE_LABEL[effectType as keyof typeof EFFECT_TYPE_LABEL],
        buffRatio: buffRatio,
        scope // 'SELF' (自分のみ) | 'ALL'（全体) | 'TARGET' (コンビクト指定) など
    };
}
