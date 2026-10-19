import { ATTACK_TYPE, EFFECT_TYPE } from './constants.js';

// 基底クラス（まだあるとよくなるプログラムの流れがわかってない）
export class Convict {
    id: string;
    name: any;
    baseAtkLv1: any;
    baseAtkLv90: any;
    attackSpeed: any;
    ultEnergyCost: any;
    level: number;
    baseAtk: number;
    normalLv: number;
    ultLv: number;
    pas1Lv: number;
    pas2Lv: number;
    /**
     * @param {string} id - キャラID
     * @param {string} name - キャラ名
     * @param {number} baseAtkLv1 - Lv1時点の基礎攻撃力（固定値）
     * @param {number} baseAtkLv90 - Lv90時点の基礎攻撃力（固定値）
     * @param {string} pas1Name - パッシブ1の名前
     * @param {string} pas2Name - パッシブ2の名前
     */
    // 各キャラ固有のステータス、子クラスから初期値を設定する
    constructor(id: string, name: any, baseAtkLv1: any, baseAtkLv90: any, attackSpeed: any, ultEnergyCost: any) {
        this.id = id;
        this.name = name;
        this.baseAtkLv1 = baseAtkLv1;
        this.baseAtkLv90 = baseAtkLv90;
        this.attackSpeed = attackSpeed;
        this.ultEnergyCost = ultEnergyCost;

        // 画面からの入力値を保持する、super()した直後は未初期化状態のため、初期値-1とする
        // 多分ここに追加：専属とか刻印とか
        this.level = -1;
        this.baseAtk = -1;
        this.normalLv = -1;
        this.ultLv = -1;
        this.pas1Lv = -1;
        this.pas2Lv = -1;
    }

    /**
     * 画面で入力された育成ステータスを更新・保持する
     */
    setUserData(level: number, normalLv: number, ultLv: number, pas1Lv: number, pas2Lv: number) {
        this.level = level;
        this.baseAtk = this.calculateBaseAtk(level);
        this.normalLv = normalLv;
        this.ultLv = ultLv;
        this.pas1Lv = pas1Lv;
        this.pas2Lv = pas2Lv;
    }

    /** 画面で入力したレベルに応じた攻撃力の計算  線形想定 */
    calculateBaseAtk(level: number) {
        const atkPerLv = (this.baseAtkLv90 - this.baseAtkLv1) / 89;
        const absentAtkLv = 90 - this.level;
        return Math.floor(this.baseAtkLv90 - (atkPerLv * absentAtkLv));
    }

    /** スキル効果の取得（子クラスで上書きする）⇒ 用途よくわかってないので一旦コメントアウト */
    getBuffMods() {
        return {
            atkMods: [],      // ATKアップ、ATKダウン
            defMods: [],      // DEF/MDFアップ、DEF/MDFダウン、物理/魔法貫通※mdf用まだ作ってない
            damageMods: [],   // 基礎ダメージ係数、ダメージ係数アップ
            critMods: [],     // クリティカルダメージアップ
            etcMods: []       // ダメージアップ系、被ダメージアップ系、ダメージダウン系、被ダメージダウン系、コア状態被ダメージ補正
        };
    }

    // ダメージ計算で使う最終的なATKの計算
    calculateFinalAtk(convict: any, commBuffs: any) {
        const selfAtkMods = convict.getBuffMods()?.atkMods ?? [];
        const commAtkMods = commBuffs?.atkMods ?? [];
        const atkMods = selfAtkMods.concat(commAtkMods);
        // atkModsのEFFECT_TYPEを見て、基礎atkを足し引きする
        
        // とりあえず0番目を返す TODO
        return atkMods[0];
    }

    // ダメージ計算で使う最終的なDEFの計算
    calculateFinalDef(convict: any, commBuffs: any, enemyDef: number) {
        const selfDefMods = convict.getBuffMods()?.defMods ?? [];
        const commDefMods = commBuffs?.defMods ?? [];
        const defMods: any[] = selfDefMods.concat(commDefMods);
        let totalDefDown = 0;
        let totalPhyDown = 0;
        for (const mod of defMods) {
            // DEFダウン
            if (mod.effectType === EFFECT_TYPE.DEF_DOWN) {
                totalDefDown += mod.buffRatio;
                continue;
            }
            // 物理貫通
            if (mod.effectType === EFFECT_TYPE.PHYSICAL_PENETRATION_DOWN) {
                totalPhyDown += mod.buffRatio;
                continue;
            }
        }
        return enemyDef * (1 - totalDefDown) * (1 - totalPhyDown);
    }

    // ダメージ計算で使う最終的なダメージ係数の計算
    calculateFinalDamageMult(convict: any, commBuffs: any, attackType: any) {
        const selfDamageMods = convict.getBuffMods()?.damageMods ?? [];
        const commDamageMods = commBuffs?.damageMods ?? [];
        const damageMods: any[] = selfDamageMods.concat(commDamageMods);
        // 通常攻撃なら通常攻撃のスキル倍率、必殺技ならそのスキル倍率をそれぞれ返す
        const matchedMod = damageMods.find(mod => mod.attackType === attackType);
        // もし該当の倍率がなければ、エラーを示すために-1を返す
        return matchedMod.buffRatio ? matchedMod.buffRatio : -1;
    }

    // ダメージ計算で使う最終的なクリティカル補正の計算
    calculateFinalCriticalMult(convict: any, commBuffs: any) {
        return 1; // dummy
    }

    // ダメージ計算で使う最終的なその他色々補正の計算
    calculateFinalEtcMult(convict: any, commBuffs: any, isCoreBroken: any) {
        const selfEtcMods = convict.getBuffMods()?.etcMods ?? [];
        const commEtcMods = commBuffs?.etcMods ?? [];
        const etcMods: any[] = selfEtcMods.concat(commEtcMods);
        // バフの種類ごとに数値を足し算
        const typeSums = etcMods.reduce((acc, mod) => {
            // コアブレイク状態ではない場合、コア破壊時のバフは除く
            if (!isCoreBroken && mod.effectType === EFFECT_TYPE.CORE_BREAKING_DAMAGE_UP) {
                return acc;
            }

            acc[mod.effectType] = (acc[mod.effectType] || 0) + mod.buffRatio;
            return acc;
        }, {});

        // バフの種類が異なるときは数値を乗算する
        return Object.values(typeSums).reduce((total: any, sumRatio: any) => {
            return total * (1 + sumRatio)
        }, 1);
    }

    /**
     * ダメージ計算式。共通
     */
    calculateOneHitFinalDamage(convict: any, commBuffs: any, attackType: string, enemyDef: number, isCoreBroken: undefined) {
        // 1. 最終ATKの算出
        const finalAtk = this.calculateFinalAtk(convict, commBuffs);

        // 2. 最終DEF/MDFの算出
        const finalDef = this.calculateFinalDef(convict, commBuffs, enemyDef);
        // const finalMdf = calculateFinalMdf(convict);

        // 3. 最終ダメージ係数の算出
        const finalDamageMult = this.calculateFinalDamageMult(convict, commBuffs, attackType);

        // 4. クリティカル補正の算出
        const finalCriticalMult = this.calculateFinalCriticalMult(convict, commBuffs);

        // 5. その他補正の算出
        const etcMult: any = this.calculateFinalEtcMult(convict, commBuffs, isCoreBroken);

        // 6. 最終ダメージ
        // = (最終ATK - 最終DEF/MDF) × ダメージ係数 × クリティカル × その他補正
        const finalDamage = (finalAtk - finalDef) * finalDamageMult * finalCriticalMult * etcMult

        return finalDamage;
    }

    // 通常攻撃ダメージ
    calculateOneHitFinalAttackDamage(convict: { getBuffMods: (() => { (): any; new(): any; etcMods: never[]; }) | (() => { (): any; new(): any; atkMods: number[]; }) | (() => { (): any; new(): any; defMods: never[]; }) | (() => { (): any; new(): any; damageMods: never[]; }); }, commBuffs: { atkMods?: never[]; defMods?: never[]; damageMods?: never[]; etcMods?: never[]; }, enemyDef: number, isCoreBroken: undefined) {
        return this.calculateOneHitFinalDamage(convict, commBuffs, ATTACK_TYPE.NORMAL, enemyDef, isCoreBroken)
    }

    // // 必殺技ダメージ
    // calculateOneHitFinalUltDamage(convict: { getBuffMods: (() => { (): any; new(): any; etcMods: never[]; }) | (() => { (): any; new(): any; atkMods: number[]; }) | (() => { (): any; new(): any; defMods: never[]; }) | (() => { (): any; new(): any; damageMods: never[]; }); }) {
    //     return this.calculateOneHitFinalDamage(convict, commBuffs, ATTACK_TYPE.ULT, 1, isCoreBroken)
    // }


}
