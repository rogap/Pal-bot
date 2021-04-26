/**
 * классы
 */


const AbstractChampion = require('./AbstractChampion.js')
const path = require('path')
const { loadImage } = require('canvas')


module.exports = class Champion extends AbstractChampion {
    constructor(champion) {
        super()
        this.id = champion.id
        this.lore = champion.Lore
        this.Name = this.constructor.nameNormalize(champion.Name['en'])
        this.name = champion.Name // тут обьект, не забываем
        this.role = champion.Roles
        this.title = champion.Title
        this.pantheon = champion.Pantheon
        this.cards = champion.Cards
        this.speed = champion.Speed
        this.health = champion.Health
        this.ability = champion.ability

        // каждый чемпион может иметь псевдонимы (короткие имена)
        // их так же можно разместить в текстовом файле в папке чемпиона (где картинки)
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