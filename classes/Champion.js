/**
 * классы
 */


const NameNormalize = require('./NameNormalize.js')
const path = require('path')
const { loadImage } = require('canvas')
const _local = process._local
const {config} = _local


module.exports = class Champion extends NameNormalize {
    #data // обьект данных чемпиона

    constructor(champion) {
        super()
        this.#data = champion
        this.id = champion.id
        this.lore = champion.Lore
        this.Name = Champion.nameNormalize(champion.Name['en'])
        this.name = champion.Name
        this.roles = champion.Roles
        this.title = champion.Title
        this.pantheon = champion.Pantheon
        this.cards = champion.Cards
    }

    get ability() {
        return [
            this.#data.Ability_1,
            this.#data.Ability_2,
            this.#data.Ability_3,
            this.#data.Ability_4,
            this.#data.Ability_5
        ]
    }

    loadIcon() { // загружает иконку чемпиона
        const pathToIcon = path.join(__dirname, '..', 'img', 'champions', this.Name, 'icon.jpg')
        return new Promise((resolve, reject) => {
            loadImage(pathToIcon)
            .then(img => {
                this.icon = img
                return resolve(img)
            })
            .catch(err => reject(err))
        })
    }

    // get() {
    //     // возвращает весь обьект данных чемпиона
    //     return this.#data
    // }
}


// нужно скачать все карты чемпионов и распределить по папкам