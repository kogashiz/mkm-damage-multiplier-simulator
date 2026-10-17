
// バフオブジェクトの buffRatio を % 表示に変換するヘルパー関数
export function formatBuffsForDebug(buffs: any) {
    if (!buffs) return {};
    
    // オブジェクトを深かいコピーして元のデータを壊さないようにする
    const formatted = JSON.parse(JSON.stringify(buffs));

    Object.keys(formatted).forEach(category => {
        if (Array.isArray(formatted[category])) {
            formatted[category].forEach(mod => {
                if (typeof mod.buffRatio === 'number') {
                    // 表示用のパーセント文字列を追加（小数1桁など）
                    mod.displayRatio = `${(mod.buffRatio * 100).toFixed(1)}%`;
                }
            });
        }
    });

    return formatted;
}
