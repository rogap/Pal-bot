/**
 * загружает команды бота
 */


const fs = require('fs')
const path = require('path')
const _local = process._local
const timeStart = new Date() // время старта загрузки


module.exports = new Promise((resolve, reject) => {
    const pathToCommands = path.join(__dirname, '..', 'commands')
    fs.readdir(pathToCommands, (err, files) => {
        if (err) return reject(err)

        files.forEach(file => {
            fs.readdir(path.join(pathToCommands, file), (err, scripts) => {
                const main = scripts.find(script => script == 'main.js')
                if (!main) throw new Error(`main.js from ${file} Not Found`)

                const command = require(path.join(pathToCommands, file, 'main.js'))
                local.commands.push(command)
            })
        })

        // сортируем команды в указанном порядке по order
        _local.commands.sort((a, b) => a.order - b.order)



        // files = files.filter(file => { // фильтруем не нужные файлы (быть не должно)
        //     return file.endsWith(".js")
        // })
        // .map(file => { // загружаем
        //     return require(path.join(pathToCommands, file))
        // })

        // сортируем команды в указанном порядке по order
        // files.sort((a, b) => a.order - b.order)

        // _local.commands = files
        console.log(`Команды загруженны (${_local.commands.length}) (${new Date - timeStart}ms)`)
        return resolve({status: true})
    });
})


// будет использовать некоторые методы класса Command
// будет содержать список команд для конкретного пользователя/сервера/дефолтные
// 
class Commands { // что-то вроде менеджера команд
    constructor() {
        // this.message = message
        // this.authorId = message.author.id

        this.prefix = prefix
        this.lang = lang
        this.content = content
        this.timezone = timezone
        this.backgrounds = backgrounds
        this.type = 'user' // user/server/default
        // this.commands = createCommands()
        // this.params = // будет парсится this.parse()
    }

    get(content=this.content) {
        // получает команду (возвращает обьект класса команды)
    }

    execute() {
        // тут ли будет выполняться команда?
        // либо сделать функцию которая сама определяет что нужно делать и вернет данные коорые нужно будет просто вставить в 
        // message.reply или куда там
    }

    // parse() {
    //     // парсит content определяя где команда а где параметры
    // }
}


// когда будут загружаться настройки для пользователя или сервера
// что если создавать их класом
// или все они будут помещены в класс который будет иметь метод поиска - это лучше чем делать отдельный метод и
// крепить его туда