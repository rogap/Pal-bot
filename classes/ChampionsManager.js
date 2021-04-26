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

    add(champion) {
        // добавляет чемпиона в базу класса
        this.#champions.push(champion)
        this.size = this.#champions.length

        // после добавления чемпиона можно сортировать массив что бы они были по алфавиту (engl)
    }

    getById(id) {
        // получает чемпиона по id
        return this.#champions.find(champion => champion.id == id)
    }

    getByName(name) {
        // получает чемпиона по имени
        name = this.constructor.nameNormalize(name)
        return this.#champions.find(champion => this.constructor.nameNormalize(champion.Name) == name)
    }
}