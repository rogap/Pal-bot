/**
 * классы
 */


const path = require('path')
const pathToDefaultCommands = path.join(__dirname, '..', 'commands', 'main.js')
const Command = require('./Command.js')


module.exports = class CommandsManager {
    #commands = [] // пока не уверен нужно ли показывать это все сразу или нет
    static default = require(pathToDefaultCommands) // дефолтные значения всех команд

    constructor(commandSettingList={}) {
        // commandSettingList - обьект, ключами которого являются названия команд, а значение это массив (possibly)
        // создает дефолтные команды если ничего не указано,
        // если указаны то создает указанные команды по подобию дефолта и добавляет нехватающие команды

        let count = 0
        for (const commandName in CommandsManager.default) {
            count++
            const comSetting = commandSettingList ? commandSettingList[commandName] : undefined
            const com = Object.assign({}, CommandsManager.default[commandName])

            // если есть натсройки команды то изменяем их
            if (comSetting) com.possibly = comSetting // (только это и можно поменять в самой команде)
            this.add( new Command(com) )
        }

        this.size = count
        // this.list = this.#commands // для теста
    }

    get(text) {
        // получает команду если она есть (вместо проверки можно использовать)
        text = text.toLowerCase()
        return this.#commands.find(com => com.has(text))
    }

    getByName(commandName) {
        commandName = commandName.toLowerCase()
        return this.#commands.find(com => com.name == commandName)
    }

    has(text) {
        text = text.toLowerCase()
        return this.#commands.some(com => com.has(text))
    }

    add(command) {
        this.#commands.push(command)
        return this
    }

    // перебирает все команды
    each(callback) {
        this.#commands.forEach(com => callback(com)) 
    }
}