/**
 * классы
 */


module.exports = class ChampionsManager {
    #champions = []
    constructor() {}

    static nameNormalize(name) {
        // делает первую букву большой и убирает лишние символы (включая пробелы)
        name = name.replace(/[-`' ]+/g, "")
        return name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase()
    }

    add(champion) {
        // добавляет чемпиона в базу класса
        this.#champions.push(champion)
    }

    getById(id) {
        // поулчает чемпиона по id
        return this.#champions.find(champion => champion.id == id)
    }

    getByName(name) {
        // получает чемпиона по имени
        name = ChampionsManager.nameNormalize(name)
        return this.#champions.find(champion => ChampionsManager.nameNormalize(champion.Name) == name)
    }
}