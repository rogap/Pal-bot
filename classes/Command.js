/**
 * классы
 */

/*
module.exports = class Command {
    constructor({name, commands, params, info, detail, draw, owner, permissions, order}) {
        this.name = name
        this.commands = commands
        this.params = params
        this.info = info
        this.detail = detail
        this.draw = draw
        this.owner = owner
        this.permissions = permissions
        this.order = order
        // this.type = 'draw' // draw/text - тип команды который она возвращает (картинку или текстовое содержимое)
        // возможно еще стоит определить куда (лс или не важно куда)
    }

    has(str) {
        // проверяет есть ли текущая команда в строке (без префикса)
        str = str.tolowercase()
        return this.commands.some(name => str.startsWith(name))
    }

    checkPerm() {
        // проверяет права
    }

    // оно нужно не тут...
    // sendUser() {
    //     // будет отправлять результат выполнения команды
    // }

    // sendChannel() {
    //     // будет отправлять результат выполнения команды
    // }
}
*/

const path = require('path')


module.exports = class Command {
    constructor(params) {
        this.name = params.name
        this.possibly = params.possibly
        this.order = params.order
        this.permissions = params.permissions
        this.owner = params.owner

        params.files.forEach(filename => {
            const pathToCommand = params.path
            this[filename] = require(path.join(pathToCommand, `${filename}.js`))
        })
    }

    get(commandName) {
        // получает команду точно по название
        commandName = commandName.tolowercase()
        return this.possibly.find(name => name == commandName)
    }

    has(text) {
        // проверяет есть ли текущая команда в строке (без префикса) и возвращает ее, если есть
        text = text.tolowercase()
        return this.possibly.find(name => name.startsWith(text))
    }
}