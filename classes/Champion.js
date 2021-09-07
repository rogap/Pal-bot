/**
 * классы
 */


const AbstractChampion = require('./AbstractChampion.js')
const _local = process._local
const path = require('path')
const fs = require('fs')
// const { loadImage } = require('canvas')


module.exports = class Champion extends AbstractChampion {
    constructor(champion) {
        super()
        this.id = champion.id
        this.lore = champion.Lore
        this.name = this.constructor.nameNormalize(champion.Name) // тут обьект, не забываем
        this.Name = champion.Name // тут обьект, не забываем
        this.role = champion.Roles
        this.title = champion.Title
        this.speed = champion.Speed
        this.health = champion.Health
    }

    // загружает иконку чемпиона
    async loadIcon() {
        const pathToIcon = path.join(_local.path, 'champions', this.name.en, 'icon.jpg')
        // const img = await loadImage(pathToIcon)
        return this.icon = pathToIcon
    }

    // загружает превдонимы чемпионов (альтернативные имена)
    async loadAliases() {
        const pathToNamesList = path.join(_local.path, 'champions', this.name.en, 'aliases')
        const aliases = await fs.readFileSync(pathToNamesList)
        this.aliases = aliases.toString().split(' ').map(champName => champName.trim())
        return this.aliases
    }
}