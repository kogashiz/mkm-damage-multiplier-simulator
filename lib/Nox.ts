import { ATTACK_TYPE, EFFECT_TYPE, toRatio, createBuffMod } from './Constants.js';
import { Convict } from './Convict.js';

/**
 * NOX（子クラス）の実装例
 * 各コンビクトの初期ステータス、スキルレベルに応じた倍率を保持
 */
export class Nox extends Convict {
    // 固有値
    // 通常攻撃 スキルレベル倍率 Lv1〜Lv10（Index 0は1始まりにするためのダミー）
    static NORMAL_SKILL_PCT = Object.freeze([
        0,   // Lv0 (未使用)
        90,  // Lv1
        96,  // Lv2
        102, // Lv3
        109, // Lv4
        116, // Lv5
        124, // Lv6
        132, // Lv7
        141, // Lv8
        151, // Lv9
        161  // Lv10
    ]);

    // 必殺技 安息日 倍率は以下に書いた、具体的なダメージへのかかり方は後で考える
    static ULT_SKILL_PCT = Object.freeze([
        0,   // Lv0 (未使用)
        158, // Lv1
        169, // Lv2
        180, // Lv3
        192, // Lv4
        205, // Lv5
        219, // Lv6
        234, // Lv7
        250, // Lv8
        267, // Lv9
        285  // Lv10
    ]);

    // パッシブ1 魂の侵蝕
    static PAS1_SKILL_PCT = Object.freeze([
        0,   // Lv0 (未使用)
        15, // Lv1
        16, // Lv2
        17, // Lv3
        18, // Lv4
        19, // Lv5
        20, // Lv6
        22, // Lv7
        24, // Lv8
        27, // Lv9
        30  // Lv10
    ]);

    // パッシブ2 幽冥戦慄
    static PAS2_SKILL_PCT = Object.freeze([
        0,    // Lv0 (未使用)
        15,   // Lv1
        16,   // Lv2
        17.1, // Lv3
        18.2, // Lv4
        19.5, // Lv5
        20.8, // Lv6
        22.2, // Lv7
        23.7, // Lv8
        25.3, // Lv9
        27    // Lv10
    ]);

    constructor() {
        // super()で親を初期化。id, name(ゲーム中の正式名表記), lv1atk, lv90atk, 攻撃速度, エネルギー消費
        super("nox", "NOX", 145, 622, 0.86, 45);
    }

    /**
     * NOX固有のバフ補正
     * 通常攻撃、必殺技、パッシブ１、パッシブ２のうち、補正がある項目を抜き出す
     * ↑だけだと足りないかも。専属、特性、狂瞳深化はいるか、他も？⇒後でやる
    */
    getBuffMods() {
        const buffs: any = {
            atkMods: [],      // 最終ATK補正
            defMods: [],      // 最終DEF補正
            damageMods: [],   // ダメージ係数
            critMods: [],     // クリティカル補正
            etcMods: []       // その他補正
        };

        // 特性 
        // 与ダメージ5%UP
        buffs.etcMods.push(
            createBuffMod(ATTACK_TYPE.NOT_ATTACK, EFFECT_TYPE.TAKEN_DAMAGE_UP, toRatio(5))
        );
        // コア破壊時与ダメージ5%UP
        buffs.etcMods.push(
            createBuffMod(ATTACK_TYPE.NOT_ATTACK, EFFECT_TYPE.CORE_BREAKING_DAMAGE_UP, toRatio(5))
        );
        
        // 狂瞳深化
        // 物理貫通15%UP
        buffs.defMods.push(
            createBuffMod(ATTACK_TYPE.NOT_ATTACK, EFFECT_TYPE.PHYSICAL_PENETRATION_DOWN, toRatio(15))
        );

        // ATK補正（通常ステータスのATK含む）
        buffs.atkMods.push(
            createBuffMod(ATTACK_TYPE.NOT_ATTACK, EFFECT_TYPE.BASE_ATK, this.baseAtk)
        );

        // 通常攻撃（通常攻撃のスキル倍率のこと）
        const normalPercent = Nox.NORMAL_SKILL_PCT[this.normalLv];
        buffs.damageMods.push(
            createBuffMod(ATTACK_TYPE.NORMAL, EFFECT_TYPE.BASE_DAMAGE_COEF, toRatio(normalPercent))
        );

        // 必殺技 ややこしいのであとで TODO


        // パッシブ1 ややこしいし頻出バフじゃないのでもっと後回し


        // パッシブ2 DEFダウン（そういえば再構築でバフ変わるけど一旦無視）
        const pas2Percent = Nox.PAS2_SKILL_PCT[this.pas2Lv];
        buffs.defMods.push(
            createBuffMod(ATTACK_TYPE.NOT_ATTACK, EFFECT_TYPE.DEF_DOWN, toRatio(pas2Percent), 'ALL')
        );
                
        
        return buffs;
    }

}
