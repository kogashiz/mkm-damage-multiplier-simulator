import { Convict } from './Convict.js';

// パーティとして保持する値
export class Party {
    convicts: any[] = [];
    commBuffs: {
        atkMods: any[]; // 最終ATK補正
        defMods: any[]; // 最終DEF補正
        damageMods: any[]; // ダメージ係数
        critMods: any[]; // クリティカル補正
        etcMods: any[]; // その他補正
    };
    constructor() {
        this.convicts = []; // コンビクトたち
        this.commBuffs = {
            atkMods: [],      // 最終ATK補正
            defMods: [],      // 最終DEF補正
            damageMods: [],   // ダメージ係数
            critMods: [],     // クリティカル補正
            etcMods: []       // その他補正
        };
    }

    addConvict(convict: any) {
        this.convicts.push(convict);
        this.addCommBuffs(convict.name, convict.getBuffMods());
    }

    addCommBuffs(name: any, buffs: any) {
        if (!buffs) return;

        Object.keys(buffs).forEach(category => {
            if (!(this.commBuffs as any)[category]) return;

            const categoryBuffs = buffs[category];
            if (!Array.isArray(categoryBuffs)) return;

            categoryBuffs.forEach(mod => {
                if (mod.scope === 'ALL') {
                    (this.commBuffs as any)[category].push({
                        ...mod,
                        sourceName: name
                    });
                }
            })
        })
    }

    getCommBuffs() {
        return this.commBuffs;
    }

    calculatePartyDamage(enemyDef: any, isCoreBroken: any) {
        return this.convicts.map(convict => {
            const damage = convict.calculateOneHitFinalAttackDamage(convict, this.commBuffs, enemyDef, isCoreBroken);
            return {
                name: convict.name,
                baseAtk: convict.baseAtk,
                damage: damage,
            }
        })
    }
}