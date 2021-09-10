/**
 * классы
 */


const _local = process._local
const path = require('path')


module.exports = class Card {
    constructor(card) {
        this.id = card.ItemId
        this.type = this.getType(card.item_type)
        this.championId = card.champion_id
        this.name = card.DeviceName
        this.championName = _local.champions.getById(this.championId).name
        this.description = card.Description
        this.shortDesc = card.ShortDesc
        this.recharge = card.recharge_seconds
    }

    getType(item_type) {
        return item_type.match(/talents/i) ? 'legendary' : 'common'
    }

    // получает описание карты на указанном языке и убирая 'scale' подстявляя нужно значение исходя из уровня карты
    getDescriptionLvl(lvl, lang) {
        const desc = this.description[lang].replace(/^\[[а-яa-z -]+\] /i, '') // убираем принадлежность (то что в [...])
        const matchArr = desc.match(/\{scale ?= ?([0-9\.]+)\|(-?[0-9\.]+)s?\}/i)
        if (!matchArr) return false // поидее такого быть не должно

        let scaleText = +matchArr[1]
        for (let i = 1; i < lvl; i++) {
            scaleText += +matchArr[2]
        }

        // фиксим до 2 точек и если 2 нуля в конце то убираем их
        scaleText = scaleText.toFixed(2)
        if (scaleText.slice(-2) == "00") scaleText = scaleText.slice(0, -3)

        const retDesc = desc.replace(/\{scale ?= ?([0-9\.]+)\|(-?[0-9\.]+)s?\}/i, scaleText)
        if ( retDesc.match(/\{scale ?= ?([0-9\.]+)\|(-?[0-9\.]+)s?\}/i) ) {
            const matchArr = retDesc.match(/\{scale ?= ?([0-9\.]+)\|(-?[0-9\.]+)s?\}/i)
            if (!matchArr) return false // поидее такого быть не должно

            let scaleText = +matchArr[1]
            for (let i = 1; i < lvl; i++) {
                scaleText += +matchArr[2]
            }

            // фиксим до 2 точек и если 2 нуля в конце то убираем их
            scaleText = scaleText.toFixed(2)
            return retDesc.replace(/\{scale ?= ?([0-9\.]+)\|(-?[0-9\.]+)s?\}/i, scaleText)
        }
        return retDesc
    }

    async loadImg() { // загружает картинку карты
        const format = this.type == 'common' ? 'jpg' : 'png'
        const pathImg = path.join(_local.path, 'champions', this.championName.en, 'cards', this.type, `${this.id}.${format}`)
        return this.img = pathImg
    }
}