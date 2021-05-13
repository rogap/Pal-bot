/**
 * позволяет удобно получать данные о чемпионах игрока
 */


const AbstractChampion = require('./AbstractChampion.js')
const _local = process._local


module.exports = class ChampionsStats extends AbstractChampion {
    #champions
    #roles = {
        frontline: [],
        support: [],
        damage: [],
        flanker: []
    }

    constructor(champions) {
        super()
        if (!champions || !champions.length) {
            this.error = true
            return; // если чемпионво нет то ошибка
        }
        const CHAMPIONS = _local.champions
        this.player_id = champions[0].player_id
        this.timePlayRole = {
            frontline: 0,
            support: 0,
            damage: 0,
            flanker: 0
        } // время сыгранное на каждой роли (минут)

        this.wins = 0
        this.losses = 0

        this.kills = 0
        this.deaths = 0
        this.assists = 0

        champions.forEach(champ => {
            const CHAMP = CHAMPIONS.getByName(champ.champion) // чемпион с дефолтными данными которые не нужно менять!
            champ.__proto__ = CHAMP
            champ.winrate = (champ.Wins / (champ.Wins + champ.Losses) * 100).toFixed(0) // %
            champ.kda = ((champ.Kills + champ.Assists / 2) / (champ.Deaths + 1)).toFixed(2)
            champ.exp = this.parseExp(champ.Worshippers)

            delete champ.champion
            delete champ.ret_msg
            delete champ.player_id
            delete champ.champion_id

            const role = champ.role.en
            this.#roles[role].push(champ)
            this.timePlayRole[role] += champ.Minutes

            this.wins += champ.Wins
            this.losses += champ.Losses

            this.kills += champ.Kills
            this.deaths += champ.Deaths
            this.assists += champ.Assists
        })

        this.#champions = champions
        this.size = champions.length
        this.winrate = (this.wins / (this.wins + this.losses) * 100).toFixed(0) // %
        this.kda = ((this.kills + this.assists / 2) / (this.deaths + 1)).toFixed(2)
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

    sort(type='Minutes') {
        if ( !(type in this.#champions[0]) ) throw new ReferenceError(`Обьект чемпиона не имеет параметра "${type}".`)
        return this.#champions.sort((ch1, ch2) => ch2[type] - ch1[type])
    }

    sortType(type) {
        if (!type) return this.#champions
        const funcSort = { // функции сортировки
            lvl: (a, b) => b.Rank - a.Rank,
            winrate: (a, b) => {
                const a_win = (a.Wins / (a.Wins + a.Losses) * 100) || 0
                const b_win = (b.Wins / (b.Wins + b.Losses) * 100) || 0
                return b_win - a_win
            },
            time: (a, b) => b.Minutes - a.Minutes,
            kda: (a, b) => {
                const a_kda = (a.Kills + a.Assists / 2) / (a.Deaths + 1)
                const b_kda = (b.Kills + b.Assists / 2) / (b.Deaths + 1)
                return b_kda - a_kda
            }
        }

        const func = funcSort[type]
        return this.#champions = func ? this.#champions.sort(func) : this.#champions
    }

    get roles() {
        return this.#roles
    }

    // получает чемпиона по имени
    getByName(nameSearch) { // такая же функция как у ChampionsManager (можно создать еще 1 класс)
        nameSearch = this.constructor.nameNormalize(nameSearch)
        return this.#champions.find(champion => {
            // перебираем все варрианты языков для имени чемпиона
            for (let lang in champion.name) {
                const name = champion.name[lang]
                if ( this.constructor.nameNormalize(name) == nameSearch ) return true
            }
            return false
        })
    }

    // получает чемпиона по псевдониму или имени
    getByAliases(nameSearch) { // такая же функция как у ChampionsManager (можно создать еще 1 класс)
        nameSearch = this.constructor.nameNormalize(nameSearch)
        const byName = this.getByName(nameSearch)
        if (byName) return byName // если найден по имени то возвращаем его

        return this.#champions.find(champion => {
            return champion.aliases.find(champAliases => champAliases === nameSearch)
        })
    }

    each(callback) {
        return this.#champions.forEach(callback)
    }
}