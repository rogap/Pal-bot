/**
 * обработчик сообщений
 */


const _local = process._local
const { client, config, utils } = _local
const { sendSite } = utils
const commandsUsed = {commands: {}, count: 0} // список команд и кол-во их использований (для статистики)


/**
 * когда получаем сообщение то сначала отсеиваим спам
 * затем нужно понять какие настройки будем применять - user/server/default
 * получаем обьект настроек (это не класс)
 */
client.on('message', async message => {
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

            // увеличиваем число использований команды, только удачные и не админские
            if (!command.owner) {
                if (!commandsUsed.commands[command.name]) commandsUsed.commands[command.name] = 0
                commandsUsed.commands[command.name]++
                commandsUsed.count++
            }

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


// отправляет статистические данные на сайт
function sendStatsToSite() {
    let servers = 0
    let users = 0
	client.guilds.cache.forEach(guild => {
		servers++
		users += guild.memberCount
	})

    const cloneCommandsUsed = Object.assign({}, commandsUsed.commands)
    const cloneCommandsUsedCount = commandsUsed.count
    for (let key in commandsUsed.commands) {
        commandsUsed.commands[key] = 0 // очищаем данные
    }
    commandsUsed.count = 0
    const timeWork = new Date() - _local.timeStart

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
                timeWork,
                allUsed: {
                    commands: cloneCommandsUsed,
                    count: cloneCommandsUsedCount
                }
            }
        }
    })
    .then(res => {
        const body = res.body
        console.log(body)
    })
    .catch(e => {
        console.log(e)
        for (let key in commandsUsed.commands) {
            commandsUsed.commands[key] += cloneCommandsUsed[key] // возвращаем старые данные в обьект
        }
        commandsUsed.count += cloneCommandsUsedCount
    })
}


setInterval(sendStatsToSite, 60000) // отправляем данные на сайт каждую минуту