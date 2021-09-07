/**
 * классы
 */


const AbstractChampion = require('./AbstractChampion.js')


module.exports = class ChampionsManager extends AbstractChampion {
    #champions = []
    constructor() {
        super()
        this.size = 0
    }

    static getRole(role) {
        return role.replace(/Paladins /i, '').replace(/[ ]/ig, '').trim().toLowerCase()
    }

    get championsByRole() {
        const supports = [],
            frontlines = [],
            damages = [],
            flanks = []

        this.#champions.forEach(champion => {
            if (champion.role.en == 'flanker') flanks.push(champion)
            if (champion.role.en == 'damage') damages.push(champion)
            if (champion.role.en == 'support') supports.push(champion)
            if (champion.role.en == 'frontline') frontlines.push(champion)
        })

        return {
            supports,
            frontlines,
            damages,
            flanks
        }
    }

    get supports() {
        return []
    }

    get frontlines() {
        return []
    }

    get damages() {
        return []
    }

    get flanks() {
        return []
    }

    get champions() {
        return this.#champions
    }

    sort(type) { // type or function??!!
        //
    }

    random(role) {}

    // добавляет чемпиона в базу класса
    add(champion) {
        if ( this.getById(champion.id) ) return false
        this.#champions.push(champion)
        this.size = this.#champions.length
        return this
    }

    getById(id) {
        // получает чемпиона по id
        return this.#champions.find(champion => champion.id == id)
    }

    // получает чемпиона по имени
    getByName(nameSearch) {
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
    getByAliases(nameSearch) {
        nameSearch = this.constructor.nameNormalize(nameSearch)
        const byName = this.getByName(nameSearch)
        if (byName) return byName // если найден по имени то возвращаем его

        return this.#champions.find(champion => {
            return champion.aliases.find(champAliases => champAliases === nameSearch)
        })
    }
}