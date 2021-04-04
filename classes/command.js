module.exports = class {
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
    }

    has(str) {
        // проверяет есть ли текущая команда в строке (без префикса)
        str = str.tolowercase()
        return this.commands.some(name => str.startsWith(name))
    }
}