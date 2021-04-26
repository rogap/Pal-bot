/**
 * классы
 */


const AbstractChampion = require('./AbstractChampion.js')
const path = require('path')
const { loadImage } = require('canvas')


module.exports = class Card extends AbstractChampion {
    #data

    constructor(card) {
        super()
        this.#data = card
        this.id = this.#data.card_id2
        this.type = this.#data.rarity.toLowerCase()
        this.championId = this.#data.champion_id
        this.championName = this.constructor.nameNormalize(this.#data.champion_name)
        this.name = card.card_name
        this.description = card.card_description
    }

    get() {
        return this.#data
    }

    loadImg() { // загружает картинку карты
        const format = this.type == 'common' ? 'jpg' : 'png'
        const pathImg = path.join(__dirname, '..', 'img', 'champions', this.championName, 'cards', this.type, `${this.id}.${format}`)
        return new Promise((resolve, reject) => {
            loadImage(pathImg)
            .then(img => {
                this.img = img
                return resolve(img)
            })
            .catch(err => reject(err))
        })
    }
}