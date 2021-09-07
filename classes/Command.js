/**
 * классы
 */


const _local = process._local
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
        this.slashName = params.slashName
        this.path = params.path

        params.files.forEach(filename => {
            const pathToCommand = params.path
            this[filename] = require(path.join(pathToCommand, `${filename}.js`))
        })
    }

    get(text) {
        // проверяет есть ли текущая команда в строке (без префикса) и возвращает ее имя либо false/undefined
        const commandName = (text.match(/^[a-zа-я]+/i) || [])[0]
        if (!commandName) return false
        return this.possibly.find(name => name == commandName)
    }

    has(text) {
        // проверяет есть ли текущая команда в строке (без префикса) и возвращает ее имя либо false/undefined
        const commandName = (text.match(/^[^\s]+/i) || [])[0]
        if (!commandName) return false
        return this.possibly.some(name => name == commandName)
    }

    // добавляет использование команды в статистику
    async used() {
        const model = _local.models.commandsStats
        const find = await model.find()
        const corrent = find.length - 1
        const lastDay = find[corrent < 0 ? 0 : corrent]
        const date = new Date()
        const newDayNow = !lastDay ? true : new Date(lastDay.date).getUTCDate() != new Date().getUTCDate()

        let servers = 0
        let users = 0
        _local.client.guilds.cache.forEach(guild => {
            servers++
            users += guild.memberCount
        })

        let usedCommands = lastDay && !newDayNow ? lastDay.usedCommands : 0
        usedCommands++
        const timeWork = date - _local.timeStart
        const commandsStats = lastDay && !newDayNow ? lastDay.commandsStats : {}
        if (!commandsStats[this.name]) commandsStats[this.name] = 0
        commandsStats[this.name]++

        if (!lastDay || newDayNow) {
            // если данных нет то сейвим (или новый день)
            const save = new model({
                servers,
                users,
                usedCommands,
                commandsStats,
                // limitAPI,
                timeWork,
                date
            })

            await save.save()
        } else {
            // если есть данные то изменяем их и сохраняем (старый день)
            await model.findByIdAndUpdate(lastDay._id, {
                servers,
                users,
                usedCommands,
                commandsStats,
                // limitAPI,
                timeWork,
                // date
            })
        }
    }
}