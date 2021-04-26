/**
 * классы
 */


const path = require('path')


module.exports = class Command {
    constructor(params) {
        this.name = params.name
        this.possibly = params.possibly
        this.order = params.order
        this.permissions = params.permissions
        this.owner = params.owner
        this.params = params.params
        this.info = params.info

        params.files.forEach(filename => {
            const pathToCommand = params.path
            this[filename] = require(path.join(pathToCommand, `${filename}.js`))
        })
    }

    get(text) {
        // проверяет есть ли текущая команда в строке (без префикса) и возвращает ее имя либо false/undefined
        text = text.toLowerCase()
        const commandName = (text.match(/^[a-zа-я]+/i) || [])[0]
        if (!commandName) return false
        return this.possibly.find(name => name == commandName)
    }

    has(text) {
        // проверяет есть ли текущая команда в строке (без префикса) и возвращает ее имя либо false/undefined
        text = text.toLowerCase()
        const commandName = (text.match(/^[^\s]+/i) || [])[0]
        if (!commandName) return false
        return this.possibly.some(name => name == commandName)
    }

    getContent(text) {
        return text.cut(this.get(text)).trim()
    }
}