/**
 * классы
 */


const _local = process._local
const {config} = _local
const AbstractChampion = require('./AbstractChampion.js')


module.exports = class CardsManager {
    #cards
    constructor() {
        this.#cards = new Map()
        this.size = 0
    }

    // получить все карты чемпиона
    getByChampion(nameOrId) {
        const championId = isFinite(nameOrId) ? nameOrId : null
        const championName = typeof(nameOrId) == 'string' ? AbstractChampion.nameNormalize(nameOrId) : null
        const cardsList = []
        if (championId) {
            this.#cards.forEach(card => {
                if (card.championId == championId) cardsList.push(card)
            })
        } else {
            this.#cards.forEach(card => {
                if (AbstractChampion.nameNormalize(card.championName.en) == championName) cardsList.push(card)
            })
        }
        return cardsList
    }

    // получить карту по id
    get(id) {
        // return this.list.find(card => card.id == id)
        return this.#cards.get(id)
    }

    // получить карту по имени
    // getByName(name) {
    //     name = name.toLowerCase()
    //     return this.list.find(card => {
    //         let check = false
    //         for (let lang in config.langs) {
    //             if ( card.name[lang].toLowerCase() == name ) check = true
    //         }
    //         return check ? card : false
    //     })
    // }

    add(card) {
        if ( this.#cards.get(card.id) ) return false
        this.#cards.set(card.id, card)
        this.size = this.#cards.size
        return this

        // if ( this.get(card.id) ) return false // карта уже есть
        // this.list.push(card)
        // this.size = this.list.length
        // return card
    }
}