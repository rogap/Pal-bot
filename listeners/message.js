/**
 * обработчик сообщений
 */


const _local = process._local
const {Discord, client, config, utils, classes, commandsUsed} = _local
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord
const {sendSite, sendToChannel} = utils


/**
 * когда получаем сообщение то сначала отсеиваим спам
 * затем нужно понять какие настройки будем применять - user/server/default
 * получаем обьект настроек (это не класс)
 */
client.on('messageCreate', async message => {
    try {
        if ( !_local.launched ) return; // если бот не запущен до конца
        if ( message.author.bot ) return; // если сообщение от бота то игнорим

        const authorId = message.author.id
        // если включен режим тестирования
        if ( config.testing && !message.isOwner() ) return;
        const content = message.getContent()
        const settings = message.getSettings() // получаем обьект настроек для текущего пользователя
        const {lang, prefix} = settings
        // console.log(settings)
        // console.log(settings.commands.list[0])

        if ( !content.startsWith(prefix) && !content.startsWith(`<@!${client.user.id}>`) ) return; // если нет префикса то выход
        const cont = content.startsWith(prefix) ? content.cut(prefix) : content.cut(`<@!${client.user.id}>`)
        // console.log(content, content.startsWith(prefix), prefix, cont)

        if (!cont && !content.startsWith(prefix)) { // если просто упоминание, то вызываем меню!!!
            const command = settings.commands.get('menu')
            const contentParams = cont.parseContent(command.owner)
            if (!command.owner) console.log(contentParams)

            // запускаем печатание и сразу же отменяем
            message.channel.sendTyping().catch(console.log)

            // выполняем команду
            await command.command(message, settings, command, contentParams)

            // увеличиваем число использований команды, только удачные и не админские
            await command.used()
            if (!command.owner) console.log(`Команда успешно выполнена (<@${authorId}>).`)
            return;
        }

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
            return await message.sendWarning(replyErr[lang])
        }

        // выводим в консоль отладочные данные
        let guildName = "ls"
        const guild = message.guild
        if (guild) guildName = guild.name
        if (!command.owner) console.log(`> ${guildName} <#${message.channel.id}> <@${authorId}>\ \n> ${cont}`)

        const contentParams = cont.parseContent(command.owner)
        if (!command.owner) console.log(contentParams)

        // запускаем печатание и сразу же отменяем
        message.channel.sendTyping().catch(console.log)

        // выполняем команду
        await command.command(message, settings, command, contentParams)

        // увеличиваем число использований команды, только удачные и не админские
        await command.used()
        if (!command.owner) console.log(`Команда успешно выполнена (<@${authorId}>).`)
    } catch(err) {
        console.log(err, 'ERR777')
        const errText = err.err_msg || {ru: 'Неизвестная ошибка...', en: 'Unknown error...'}
        try {
            const settings = message.getSettings() // получаем обьект настроек для текущего пользователя
            const {lang} = settings
            // создаем кнопку меню и кнопку помощи
            const buttonsLine_1 = new MessageActionRow()
            // .addComponents( // без embed не пашет
            //     new MessageButton()
            //     .setCustomId('pal')
            //     .setLabel({en: 'Menu', ru: 'Меню'}[lang])
            //     .setStyle('PRIMARY')
            // )
            .addComponents(
                new MessageButton()
                .setURL(config.discordInvate)
                .setLabel({en: 'Help', ru: 'Помощь'}[lang])
                .setStyle('LINK')
            )
            await message.sendWarning(errText[lang], {components: [buttonsLine_1]})
        } catch(err2) {
            console.log('\nОШИБКА ОТПРАВКИ sendWarning СООБЩЕНИЯ:\n')
            console.log(JSON.stringify(err2))
        }
        try {
            if (!err || !err.log_msg) return; // отправка логов на сервер бота (уведомления)
            if (err?.err) console.log(JSON.stringify(err.err))
            await sendToChannel(config.chLog, err.log_msg)
        } catch(err3) {
            console.log('\nОШИБКА ОТПРАВКИ ЛОГОВ НА СЕРВЕР БОТА:\n')
            console.log(err3)
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


// setInterval(sendStatsToSite, 60000) // отправляем данные на сайт каждую минуту