/**
 * классы
 */


const path = require('path')
const pathToDefaultCommands = path.join(__dirname, '..', 'commands', 'main.js')
const Command = require('./Command.js')


module.exports = class CommandsManager {
    #commands = [] // пока не уверен нужно ли показывать это все сразу или нет
    #default = require(pathToDefaultCommands) // дефолтные значения всех команд

    constructor(commandSettingList) {
        // commandSettingList - обьект, ключами которого являются названия команд, а значение это массив (possibly)
        // создает дефолтные команды если ничего не указано,
        // если указаны то создает указанные команды по подобию дефолта и добавляет нехватающие команды

        let count = 0
        for (const commandName in this.#default) {
            count++
            const comSetting = commandSettingList ? commandSettingList[commandName] : undefined
            const com = this.#default[commandName]

            // если есть натсройки команды то изменяем их
            if (comSetting) com.possibly = comSetting // (только это и можно поменять в самой команде)
            this.add( new Command(com) )
        }

        this.size = count
        // this.list = this.#commands // для теста
    }

    get(commandName) {
        // получает команду если она есть (вместо проверки можно использовать)
        return this.#commands.find(com => com.possibly.some(name => name == commandName))
    }

    getByName(commandName) {
        return this.#commands.find(com => com.name == commandName)
    }

    add(command) {
        this.#commands.push(command)
        return this
    }
}