/**
 * обработчик сообщений
 */


const _local = process._local
const { client, config, utils } = _local
const { sendSite } = utils
const userUsed = {} // использование команд пользователями (не публикуется, нужно для предотвращения спама)
const serverUsed = {} // использование команд серверами (не публикуется, нужно для предотвращения спама)
const allUsed = {count: 0, commands: {}} // использование команд (анонимное, публикуется, используется в общей статистики)
_local.console = {userUsed, serverUsed, allUsed} // что бы смотреть из консоли
// структура ->
// const d = { // для предотвращения частого использования команд пользователем
//     "123456789012345678": {
//         lastUsed: new Date(), // время последнего использования команды
//         count: 0,
//         commands: {
//             ss: 2,
//             sc: 1
//         }
//     }
// }
// const d1 = { // для предотвращения частого использования команд пользователем
//     "123456789012345678": {
//         lastUsed: new Date(), // время последнего использования команды
//         count: 0,
//         commands: {
//             ss: 1,
//             sl: 2
//         }
//     }
// }
// const d2 = {
//     "123456789012345678": {
//         count: 0,
//         commands: {}
//     }
// }



/**
 * когда получаем сообщение то сначала отсеиваим спам
 * затем нужно понять какие настройки будем применять - user/server/default
 * получаем обьект настроек (это не класс)
 */
client.on('message', message => {
    try {
        if ( !_local.launched ) return; // если бот не запущен до конца
        if ( message.author.bot ) return; // если сообщение от бота то игнорим

        const authorId = message.author.id
        // если включен режим тестирования
        if ( config.testing && !authorId.isOwner() ) return;
        const content = message.parseContent()
        const settings = getSettings(message) // получаем обьект настроек для текущего пользователя
        const {lang, prefix} = settings
        // console.log(settings)
        // console.log(settings.commands.list[0])

        if ( !content.startsWith(prefix) ) return; // если нет префикса то выход
        const cont = content.cut(prefix)

        const command = settings.commands.get(cont)
        if (!command) return; // команда не найдена
        // console.log(command)

        // если команда только для админов и это не админ то выходим
        if ( command.owner && !message.isOwner() ) return;

        if ( !message.hasPerm(command.permissions) ) {
            // если нет прав то сообщаем об этом на канале (если можем)
            if ( !message.hasPerm('SEND_MESSAGES') ) return;
            const replyErr = {
                ru: `Не хватает прав для выполнения команды (${command.permissions}).`,
                en: `Insufficient rights to execute command (${command.permissions}).`
            }
            return message.sendWarning(replyErr[lang])
        }

        // выводим в консоль отладочные данные
        let guildName = "ls"
        const guild = message.guild
        if (guild) guildName = guild.name
        console.log(`> ${guildName} <#${message.channel.id}> <@${authorId}>\ \n> ${content}`)

        const contentParams = message.getContent()
        console.log(contentParams)

        // запускаем печатание и сразу же отменяем
        message.channel.startTyping()
        message.channel.stopTyping()

        command.execute(message, settings, command, contentParams)
        .then(res => {
            console.log(`Команда успешно выполнена (<@${authorId}>).`)
        })
        .catch(err => {
            // сделать норм обработчик ошибок (не проброс)
            console.log(err)
            const errText = err.err_msg || {ru: 'Необработанная ошибка...', en: 'Unhandled error ...'}
            message.sendWarning(errText[lang])
            .catch(err => {
                console.log(err)
            })
        })
    } catch(err) {
        // сделать норм обработчик ошибок
        console.log(err)
    }
})



/**
 * получает настройки и команды которые доступны (подходят) пользователю
 * @param {Object} message 
 * @returns {Object} - setting {}
 */
function getSettings(message) { // unify
    const authorId = message.author.id
    const userSettings = _local.usersSettings.get(authorId)
    // console.log(userSettings, userSettings.commands.list[0])

    // если есть настройки пользователя и включен приоритет
    if (userSettings && userSettings.only == 1) return userSettings

    const guild = message.guild
    if (guild) {
        // console.log('in guild')
        const guildSettings = _local.guildsSettings.get(guild.id)
        // console.log(guildSettings, guild.id)
        // если есть настройки сервера
        if (guildSettings) {
            // console.log('guild has settings')
            // если пользователь изменял себе другие параметры (не команды) то вернем их тут перекрыв серверные настройки
            if (userSettings) {
                // console.log('add user setting in guild setting')
                // guildSettings.type // хз какой должен быть type в таком случае
                if ('lang' in userSettings) guildSettings.lang = userSettings.lang
                if ('timezone' in userSettings) guildSettings.timezone = userSettings.timezone
                if ('backgrounds' in userSettings) guildSettings.backgrounds = userSettings.backgrounds
            }
            return guildSettings
        }
    }

    // если есть настройки пользователя и не включен приоритет
    if (userSettings) return userSettings

    return { // дефолтный обьект настроек для пользователя
        id: authorId,
        type: 'default', // users
        lang: config.lang,
        timezone: config.timezone,
        prefix: config.prefix,
        only: null,
        commands: _local.commands,
        backgrounds: config.backgrounds
    }
}





client.on("message", message => {
    return;
    if ( !_local.launched ) return; // если бот не запущен до конца
    if ( message.author.bot ) return; // если сообщение от бота то игнорим
    const _prop = {}
    message._prop = _prop

    const authorId = message.author.id
    // если включен режим тестирования
    if ( config.testing && !authorId.isOwner() ) return;
    const content = message.content.replace(/^[\\]+/, "").replace(/[\n\r]+/g, " ").trim()

    // проверяем есть ли настройки пользователя
    const userSettings = config.userSettings[authorId]
    if ( userSettings && userSettings.only == 1 ) {
        // если есть настройки и включен приоритет
        const userCommands = userSettings.commands || _local.commands
        _prop.prefix = userSettings.prefix || config.prefix
        _prop.lang = userSettings.lang || config.lang
        _prop.timezone = userSettings.timezone || config.timezone
        _prop.backgrounds = userSettings.backgrounds || config.backgrounds
        _prop.typeSetting = "user" // тип настроек и данных котоыре использует бот

        if ( !content.checkPrefix(_prop.prefix) ) return; // если нет префикса то выходим
        console.log("(пользователь) - обнаружен префикс - приоритет")
        const cont = content.cut(_prop.prefix)
        return executeCommand(message, cont, userCommands)
    }

    // проверяем есть ли настройки сервера (если сообщение отправленно на сервере)
    const guild = message.guild
    if ( guild ) {
        const guildSettings = config.guildSettings[guild.id]
        if ( guildSettings ) {
            // если есть настройки сервера
            const guildCommands = guildSettings.commands || _local.commands
            _prop.prefix = guildSettings.prefix || config.prefix
            _prop.lang = guildSettings.lang || config.lang
            _prop.timezone = guildSettings.timezone || config.timezone
            _prop.backgrounds = guildSettings.backgrounds || config.backgrounds
            _prop.typeSetting = "server" // тип настроек и данных которые использует бот

            if ( !content.checkPrefix(_prop.prefix) ) return; // если нет префикса то выходим
            console.log("(сервер) - обнаружен префикс")
            const cont = content.cut(_prop.prefix)
            return executeCommand(message, cont, guildCommands)
        }
    }

    if ( userSettings ) {
        // если есть настройки и не включен приоритет
        const userCommands = userSettings.commands || _local.commands
        _prop.prefix = userSettings.prefix || config.prefix
        _prop.lang = userSettings.lang || config.lang
        _prop.timezone = userSettings.timezone || config.timezone
        _prop.backgrounds = userSettings.backgrounds || config.backgrounds
        _prop.typeSetting = "user" // тип настроек и данных котоыре использует бот

        if ( !content.checkPrefix(_prop.prefix) ) return; // если нет префикса то выходим
        console.log("(пользователь) - обнаружен префикс")
        const cont = content.cut(_prop.prefix)
        return executeCommand(message, cont, userCommands)
    }

    _prop.prefix = config.prefix
    if ( !content.checkPrefix(_prop.prefix) ) return; // если нет префикса то выходим
    console.log("(стандарт) - обнаружен префикс")

    const defaultCommands = _local.commands
    _prop.lang = config.lang
    _prop.timezone = config.timezone
    _prop.backgrounds =  config.backgrounds
    _prop.typeSetting = "default" // тип настроек и данных котоыре использует бот

    const cont = content.cut(_prop.prefix)
    return executeCommand(message, cont, defaultCommands)
})



// выполняет команду если это возможно
function executeCommand(message, content, commands) {
    // первым делом мы получаем команду
    // затем мы проверяем нужны ли права и хватает ли их что бы отправить сообщение
    // формируем параметры для команды и запускаем команду
    const userId = message.author.id
    const guild = message.guild
    let guildName = "ls"
    if (guild) guildName = guild.name
    const chId = message.channel.id
    
    const textStopSpam = {
        ru: `Антиспам: интервал между командами - ${config.requestLimit / 1000} секунд.`,
        en: `Antispam: interval between commands - ${config.requestLimit / 1000} seconds.`
    }

    const getting = getCommand(content, commands)
    // console.log("\n\ngetting:")
    // console.log(getting)
    if ( !getting ) return; // команда не найдена - выход
    const { command, commandName } = getting

    // console.log("Команда которую выполняем:")
    // console.log(command)
    if ( !command ) return; // команда не найдена - выход
    const contTemp = content.cut(commandName)
    // если contTemp не пуст и начинается не с пустой строки (нет пробела после команды) то пропускаем
    if ( contTemp.length != 0 && !contTemp.startsWith(" ") ) return;
    const cont = contTemp.trim()
    const lang = message._prop.lang

    // console.log(` + команда обнаружена: ${command.name}`)

    // если команда для админов и написал админ
    if ( command.owner ) {
        if ( !userId.isOwner() ) return; // если не админ то пропускаем
        message._prop.cont = cont
        message._prop.commands = commands
        message._prop.command = command
        message._prop.commandName = commandName

        // лимиты - админам не нужно
        // if ( !checkTimeLimit(message) ) return message.reply(textStopSpam[lang])
        // addUseCommand(message, command.name) // добавляем статистические данные

        return command.func(message)
    }

    const hasPerm = checkPermCommand(message, command)
    if ( !hasPerm ) {
        const permission = message.channel.permissionsFor(client.user).has("SEND_MESSAGES")
        if (!permission) return; // если нельзя писать сообщения то выход
        const textLang = {
            ru: "Недостаточно прав",
            en: "Not enough permission."
        }
        return message.reply(`${textLang[lang]} (${command.permissions}).`)
    }

    const params = cont.splitCont( (command.params[lang] || []).length )
    message._prop.cont = cont
    message._prop.commands = commands
    message._prop.command = command
    message._prop.commandName = commandName
    message.channel.startTyping() // запускаем печатание
	message.channel.stopTyping() // и сразу останавливаем (он будет печатать чутка, этого хватит)

    // лимиты
    if ( !checkTimeLimit(message) ) return message.reply(textStopSpam[lang])
    addUseCommand(message, command.name) // добавляем статистические данные

    console.log(`user: ${userId}; guild: ${guildName}; chId: ${chId}; func: ${command.name}; params: ${params}`)
    return command.func(message, ...params)
}


// делает поиск команды в указанном тексте из указаннного массива команд и возвращает команду
function getCommand(content, commands) {
    const cont = content.toLowerCase().trim()
    const command = commands.find(command => {
        const comName = command.commands.find(com => cont.startsWith(com))
        // если команда найдена то возвращаем ее
        if ( comName ) return command
    })

    if ( !command ) return;
    const commandName = command.commands.find(com => cont.startsWith(com))
    // обязательно ножно name что бы понять что вырезать
    return {command, commandName}
}


// проверяем права на отправку сообщений
function checkPermCommand(message, command) {
    const authorId = message.author.id
    if ( command.owner && authorId.isOwner() ) return true // админ команды выполняются в любом случае
    if ( command.owner && !authorId.isOwner() ) return false

    const type = message.channel.type // тип чата
    if (type != "dm" && type != "group") { // в личке проверять права не нужно
        // проверяем права которые нужны для исполнения команды
        return message.channel.permissionsFor(client.user).has(command.permissions)
    }
    return true
}



// проверяем может ли пользователь использовать команду (временной лимит)
function checkTimeLimit(message) {
    const authorId = message.author.id
    const user = userUsed[authorId]
    if ( !user) {
        userUsed[authorId] = {lastUsed: new Date(), count: 0, commands: {}}
        return true
    }
    console.log( new Date() - user.lastUsed, config.requestLimit )
    const check = new Date() - user.lastUsed > config.requestLimit
    if (check) user.lastUsed = new Date()
    return check
}



/**
 * добавляет статистические данные в обьекты userUsed, serverUsed, allUsed
 * @param {*} message - обьект сообщения дискорда
 * @param {*} commandName - имя команды
 */
function addUseCommand(message, commandName) {
    const userId = message.author.id
    const guild = message.guild
    let guildId = guild ? guild.id : false

    let user = userUsed[userId]
    if ( !user ) user = userUsed[userId] = {lastUsed: null, count: 0, commands: {}}

    let server = serverUsed[guildId]
    if ( !server ) server = serverUsed[guildId] = {count: 0, commands: {}}

    if ( user.commands[commandName] ) {
        user.commands[commandName]++
    } else {
        user.commands[commandName] = 1
    }
    user.count++

    if ( server.commands[commandName] ) {
        server.commands[commandName]++
    } else {
        server.commands[commandName] = 1
    }
    server.count++

    if ( allUsed.commands[commandName] ) {
        allUsed.commands[commandName]++
    } else {
        allUsed.commands[commandName] = 1
    }
    allUsed.count++
}



// отправляет статистические данные на сайт
function sendStatsToSite() {
    let servers = 0
    let users = 0
	client.guilds.cache.forEach(guild => {
		servers++
		users += guild.memberCount
	})

    // сделать клон и отправить его
    // очистить локальные данные
    // если удачно то забить, если не удачно то сумирует клон с локальными данными (может новые появились данные там) и повторяем с начала все

    // копируем/клонирует данные
    const cloneUserUsed = Object.assign({}, userUsed)
    const cloneServerUsed = Object.assign({}, serverUsed)
    const cloneAllUsed = Object.assign({}, allUsed)

    // очищаем
    userUsed.clear()
    serverUsed.clear()
    allUsed.count = 0
    allUsed.commands = {}

    sendSite({
        method: "POST",
        url: config.urlApi,
        json: true,
        form: {
            token: config.dbToken,
            command: "botStats",
            params: {
                servers,
                users,
                timeWork: new Date() - _local.timeStart,
                userUsed: cloneUserUsed,
                serverUsed: cloneServerUsed,
                allUsed: cloneAllUsed
            }
        }
    })
    .then(res => {
        const body = res.body
        console.log("body:")
        console.log(body)
        console.log("end body")
    })
    .catch(e => {
        console.log(e)
        // если неудачно то сумируем данные клонов с настоящими
        sumObj(cloneUserUsed, userUsed)
        sumObj(cloneServerUsed, serverUsed)
        // sumObj(cloneAllUsed, allUsed) // тут нужна другая функция ибо тут сразу commands
    })
}



// добавляет данные из клона к локальному обьекту когда передача данных не удалась
function sumObj(clone, old) {
    for (let key in clone) {
        const value = clone[key] // обьект user или guild

        if ( !old[key] ) old[key] = {count: 0}
        const valueOld = old[key] // обьект user или guild

        if ( value.count ) valueOld.count += value.count
        if ( value.lastUsed ) valueOld.lastUsed = valueOld.lastUsed || null

        const valueCom = value.commands
        // перебираем команды если есть
        if ( valueCom ) {
            for (let keyCom in valueCom) {
                const valCom = valueCom[keyCom]
                const valComOld = valueOld.commands[keyCom]
                if ( valCom ) {
                    if ( valComOld == undefined) valueOld.commands[keyCom] = 0
                    valueOld.commands[keyCom] += valCom
                }
            }
        }
    }
}



// setTimeout(sendStatsToSite, 10000) // отправляем данные на сайт каждую минуту