/**
 * обработчик сообщений
 */


const _local = process._local
const {client, config, utils, classes, commandsUsed} = _local
const {sendSite, sendToChannel} = utils


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
        if ( config.testing && !message.isOwner() ) return;
        const content = message.parseContent()
        const settings = message.getSettings() // получаем обьект настроек для текущего пользователя
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
        if (!command.owner) console.log(`> ${guildName} <#${message.channel.id}> <@${authorId}>\ \n> ${content}`)

        // fix guild ????? - delete this fix !
        if (command.name == 'pal' && guild && guild.id == '412269547215650817') return await message.reply('Сори, пока эту команду тут отключу из-за бага...')

        const contentParams = message.getContent(command.owner)
        if (!command.owner) console.log(contentParams)

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

            if (!command.owner) console.log(`Команда успешно выполнена (<@${authorId}>).`)
        })
        .catch(err => {
            console.log(err)
            const errText = err.err_msg || {ru: 'Необработанная ошибка...', en: 'Unhandled error ...'}
            message.sendWarning(errText[lang])
            .catch(err => {
                if (!command.owner) console.log('~OWNER~')
                console.log(err)
            })

            if (err && err.log_msg) { // отправка логов на сервер бота (уведомления)
                sendToChannel(config.chLog, err.log_msg)
                .catch(err => {
                    if (!command.owner) console.log('~OWNER~')
                    console.log(err)
                })
            }
        })
    } catch(err) {
        // сделать норм обработчик ошибок
        console.log(err)
        const errText = err.err_msg || {ru: 'Непредвиденная ошибка...', en: 'Unforeseen error ...'}
        message.sendWarning(errText[lang])
        .catch(err => {
            console.log(err)
        })

        if (err && err.log_msg) { // отправка логов на сервер бота (уведомления)
            sendToChannel(config.chLog, err.log_msg)
            .catch(err => {
                console.log(err)
            })
        }
    }
})


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