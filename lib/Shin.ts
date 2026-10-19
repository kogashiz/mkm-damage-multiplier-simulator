import { ATTACK_TYPE, EFFECT_TYPE, toRatio, createBuffMod } from './constants.js';
import { Convict } from './Convict.js';

/**
 * シズ
 */
export class Shin extends Convict {
    // 通常攻撃は回復なのでスキップ

    // 必殺技 とりあえず侵蝕状態で設定（最大値）
    static ULT_SKILL_PCT = Object.freeze([
        0,
        13.5,
        14.6,
        15.7,
        17.0,
        18.4,
        19.8,
        21.4,
        23.1,
        25.0,
        27.0,
    ]);

    // パッシブ1 覗き見る真実
    static PAS1_SKILL_PCT = Object.freeze([
        0,
        2.0,
        2.2,
        2.3,
        2.5,
        2.7,
        2.9,
        3.2,
        3.4,
        3.7,
        4.0,
    ]);

    // パッシブ2は不朽陣営だけなので一旦スキップ

    constructor() {
        super("shin", "シズ", 135, 579, 0.77, 60);
    }

    // バフ補正
    getBuffMods() {
        const buffs: any = {
            atkMods: [],      // 最終ATK補正
            defMods: [],      // 最終DEF補正
            damageMods: [],   // ダメージ係数
            critMods: [],     // クリティカル補正
            etcMods: []       // その他補正
        };

        // 特性 M値関連のためスキップ
        
        // 狂瞳深化 M値関連のためスキップ

        // ATK補正（通常ステータスのATK含む）
        buffs.atkMods.push(
            createBuffMod(ATTACK_TYPE.NOT_ATTACK, EFFECT_TYPE.BASE_ATK, this.baseAtk)
        );

        // 通常攻撃 回復なのでスキップ
        
        // 必殺技 ATKアップ
        const ultPercent = Shin.ULT_SKILL_PCT[this.ultLv];
        buffs.damageMods.push(
            createBuffMod(ATTACK_TYPE.NORMAL, EFFECT_TYPE.ATK_UP, toRatio(ultPercent), 'ALL')
        );

        // パッシブ1 通常攻撃ダメージアップ 最大10スタック溜まっているとする
        const pas1Percent = Shin.PAS1_SKILL_PCT[this.pas1Lv];
        buffs.defMods.push(
            createBuffMod(ATTACK_TYPE.NOT_ATTACK, EFFECT_TYPE.NORMAL_DAMAGE_UP, toRatio(pas1Percent) * 10, 'ALL')
        );

        // パッシブ2 不朽限定なのでスキップ
        
        return buffs;
    }


}
