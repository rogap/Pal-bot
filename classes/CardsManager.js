/**
 * классы
 */


const _local = process._local
const {config} = _local


module.exports = class CardsManager {
    constructor() {
        this.size = 0
        this.list = []
    }

    get legendary() {
        // возвращает легендарные карты
    }

    get common() {
        // возвращает обычные карты
    }

    get ids() {
        // возвращает список id карт
    }

    names(lang=config.lang) {
        // возвращает список имен карт
    }

    getById(id) {
        return this.list.find(card => card.id == id)
    }

    getByName(name) {
        name = name.toLowerCase()
        return this.list.find(card => {
            let check = false
            for (let lang in config.langs) {
                if ( card.name[lang].toLowerCase() == name ) check = true
            }
            return check ? card : false
        })
    }

    add(card) {
        this.list.push(card)
        this.size = this.list.length
    }
}