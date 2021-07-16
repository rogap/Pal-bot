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
        this.recharge = card.recharge_seconds
    }

    get() {
        return this.#data
    }

    // получает описание карты на указанном языке и убирая 'scale' подстявляя нужно значение исходя из уровня карты
    getDescriptionLvl(lvl, lang) {
        const desc = this.description[lang].replace(/^\[[а-яa-z -]+\] /i, '') // убираем принадлежность (то что в [...])
        const matchArr = desc.match(/\{scale ?= ?([0-9\.]+)\|(-?[0-9\.]+)\}/i)
        if (!matchArr) return false // поидее такого быть не должно

        let scaleText = +matchArr[1]
        for (let i = 1; i < lvl; i++) {
            scaleText += +matchArr[2]
        }

        // фиксим до 2 точек и если 2 нуля в конце то убираем их
        scaleText = scaleText.toFixed(2)
        if (scaleText.slice(-2) == "00") scaleText = scaleText.slice(0, -3)
        return desc.replace(/\{scale=[0-9\.]+\|-?[0-9\.]+\}/i, scaleText)
    }

    loadImg() { // загружает картинку карты
        const format = this.type == 'common' ? 'jpg' : 'png'
        const pathImg = path.join(__dirname, '..', 'champions', this.championName, 'cards', this.type, `${this.id}.${format}`)
        return new Promise((resolve, reject) => {
            loadImage(pathImg)
            .then(img => {
                // if (this.type !== 'common') this.img = img // сохраняем только легендарки
                return resolve(img)
            })
            .catch(err => reject(err))
        })
    }
}