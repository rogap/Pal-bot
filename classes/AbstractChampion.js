/**
 * абстрактный класс используемый только в наследовании
 */


module.exports = class AbstractChampion {
    static nameNormalize(name) {
        if (!name) return ''
        if (name.constructor === Object) {
            const obj = {}
            for (const lang in name) {
                obj[lang] = name[lang].replace(/[-`' ]+/g, "").toLowerCase()
            }
            return obj
        }
        return name.replace(/[-`' ]+/g, "").toLowerCase()
    }

    static nameFirstBig(name) {
        // делает первую букву большой и убирает лишние символы (включая пробелы)
        name = name.replace(/[-`' ]+/g, "")
        return name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase()
    }

    static getWinrate(wins, losses) {
        let procent = wins / (wins + losses) * 100
        if ( !isFinite(procent) ) procent = 0
        return procent.toFixed(0)
    }

    static getKDA(kills, deaths, assists) {
        return ((kills + assists / 2) / (deaths + 1)).toFixed(2)
    }

    /**
     * Преобразаует опыт в более детальную инфу
     * @param {Number} exp - опыт ирока или чемпиона
     * @return {Object} {
     * 		lvl - уровень
     * 		expTo - сколько осталось опыта до апа лвла
     * 		expFrom - сколько сейчас опыта (на текущем уровне)
     * 		expLvl - сколько требуется В ОБЩЕМ опыта для апа этого уровня
     * 		progress - кол-во проценков опыта уровня
     * 	}
     */
     parseExp(exp) {
        exp += 20000
        let lvl = 0
        let exp1to30 = 20000
        let expNeedToNextLvl = 0 // сколько опыта нужно до следующего лвла
        while (exp > exp1to30 && lvl < 50) { // с 1 по 30 лвл нужно каждый раз на 20 000 опыта больше
            exp -= exp1to30
            exp1to30 += 20000
            lvl++
        }
        expNeedToNextLvl = exp1to30 - exp

        const exptAfter48 = 1000000
        while (exp > exptAfter48) {
            exp -= exptAfter48
            lvl++
        }
        if ( lvl > 50 ) expNeedToNextLvl = exptAfter48 - exp
        const expLvl = lvl > 50 ? exptAfter48 : exp1to30 // сколько нужно опыта до следующего лвла (всего)
        const progress = (exp / expLvl * 100).toFixed(2)
        return {lvl: lvl || 1, expTo: expNeedToNextLvl, expFrom: exp, expLvl, progress}
    }
}