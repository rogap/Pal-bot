/**
 * классы
 */


const NameNormalize = require('./NameNormalize.js')


module.exports = class ChampionsManager extends NameNormalize {
    #champions = []
    constructor() {
        super()
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

    add(champion) {
        // добавляет чемпиона в базу класса
        this.#champions.push(champion)

        // после добавления чемпиона можно сортировать массив что бы они были по алфавиту (engl)
    }

    getById(id) {
        // получает чемпиона по id
        return this.#champions.find(champion => champion.id == id)
    }

    getByName(name) {
        // получает чемпиона по имени
        name = ChampionsManager.nameNormalize(name)
        return this.#champions.find(champion => ChampionsManager.nameNormalize(champion.Name) == name)
    }
}