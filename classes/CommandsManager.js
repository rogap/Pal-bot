/**
 * классы
 */


const path = require('path')
const pathToCommands = path.join(__dirname, '..', 'commands')
const Command = require('./Command.js')


module.exports = class CommandsManager {
    #commands = [] // пока не уверен нужно ли показывать это все сразу или нет
    #default = { // дефолтные значения всех команд
        ss: {
            name: 'ss',
            possibly: ['ss', 'стата'],
            order: 5,
            permissions: ["SEND_MESSAGES", "ATTACH_FILES"],
            owner: false,
            path: path.join(pathToCommands, 'ss'),
            files: ['detail', 'draw'] // список файлов которые нужно будет загрузить для команды
        }
    }

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