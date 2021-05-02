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

    get healers() {
        return {
            list: [],
            names: []
        }
    }

    get tanks() {
        return {
            list: [],
            names: []
        }
    }

    get damages() {
        return {
            list: [],
            names: []
        }
    }

    get flanks() {
        return {
            list: [],
            names: []
        }
    }

    get champions() {
        return {
            list: [],
            names: []
        }
    }

    sort(type) { // type or function??!!
        //
    }

    avatars(type) {
        // возвращает аватарки чемпионов
    }

    random(role) {}

    // добавляет чемпиона в базу класса
    add(champion) {
        this.#champions.push(champion)
        this.size = this.#champions.length

        // после добавления чемпиона можно сортировать массив что бы они были по алфавиту (engl)
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