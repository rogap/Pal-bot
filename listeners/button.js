/**
 * обработчик сообщений
 */


const _local = process._local
const {Discord, client, config, utils, classes, stegcloak, commandsUsed} = _local
const {sendToChannel} = utils
const {Button, ButtonsManager} = classes


client.ws.on('INTERACTION_CREATE', async data => {
    let _mess = null
    let _lang = config.lang
    try {
        if ( !_local.launched ) return; // если бот не запущен до конца
        if ( data.application_id != client.user.id ) return; // если кнопка не текущего бота
        if ( !data.message ) return;
        // console.log(data.data.custom_id)

        const authorId = data.member ? data.member.user ? data.member.user.id : data.user.id : data.user.id

        const embeds = data.message.embeds
        if (!embeds) return; // нет embeds
        const embed = embeds[0]
        if (!embed) return; // нет embed
        const embedDescription = embed.description
        if (!embedDescription) return; // поле не заполнено
        const match = embedDescription.match(/^\|\|(?<steg>.+?)\|\|$/)
        if (!match) return; // если ничего не найдено
        const matchGroups = match.groups
        if (!matchGroups) return;
        const steg = matchGroups.steg
        const stegReveal = stegcloak.reveal(steg, config.stegPass)
        const hideObjInfo = JSON.parse(stegReveal)
        // console.log(hideObjInfo)

        // тут над будет выслать скрытое сообщение "вызовите свою команду меню"
        if (hideObjInfo.owner != authorId) {
            return client.__defer(data)
        }

        // console.log(data.message.embeds)
        // data.guild_id
        // data.channel_id
        // console.log(data.member.user)

        const buttonData = data.data
        const ch = await client.channels.fetch(data.channel_id)
        if (!ch) return;
        const message = new Discord.Message(client, data.message, ch)
        _mess = message
        const settings = message.getSettings(authorId) // получаем обьект настроек для текущего пользователя
        // console.log(settings)
        _lang = settings.lang

        const getCustomIdList = buttonData.custom_id.split('_')
        const customNameCommand = getCustomIdList[0] || ''
        const customIdList = getCustomIdList.splice(1)
        const command = settings.commands.getByName(customNameCommand)
        if (!command) return; // команда не найдена

        // можно проверить права (а можно и не проверять), но лучше проверить

        // выводим в консоль отладочные данные
        let guildName = 'ls'
        const guild = message.guild
        if (guild) guildName = guild.name
        if (!command.owner) console.log(`>B> ${guildName} <#${message.channel.id}> <@${authorId}>\ \n> ${buttonData.custom_id}`)

        const hideInfo = stegcloak.hide(JSON.stringify(hideObjInfo), config.stegPass, config.stegText)
        // console.log(data.message.components)

        client.__defer(data).catch(console.log)

        await message.edit({
            content: `<@${hideObjInfo.owner}> ` + {
                ru: 'Идет обработка команды, пожалуйста подождите...',
                en: 'The command is being processed, please wait...'}[_lang],
            components: [],
            embed: {
                description: `||${hideInfo}||`,
                color: '2F3136'
            }
        })

        command.buttonExecute(message, hideObjInfo, customIdList, settings, command, data)
        .then(res => {
            if (res && res.status === 1) {
                const commandName = res.name

                // увеличиваем число использований команды, только удачные и не админские
                if (!command.owner && commandName) {
                    if (!commandsUsed.commands[commandName]) commandsUsed.commands[commandName] = 0
                    commandsUsed.commands[commandName]++
                    commandsUsed.count++
                }

                if (!command.owner) console.log(`Команда успешно выполнена (<@${authorId}>).`)
            } else if (res && res.status === 2) {
                if (!command.owner) console.log(`Был осуществлен переход внутри меню (<@${authorId}>).`)
            } else {
                console.log('Какая-то ошибка поидее...')
            }
        })
        .catch(err => {
            console.log(err)

            if (_mess && err) {
                const errText = err.err_msg || {
                    ru: 'Необработанная ошибка, вы можете сообщить о ней на сервере бота.',
                    en: `An unhandled error, you can report it on the bot's server.`
                }

                const btn_discord = new Button()
                .setLabel({ru: 'Дискорд бота', en: 'Bot discord'}[_lang])
                .setURL('https://discord.gg/C2phgzTxH9')

                const btn_menu = new Button()
                .setLabel({ru: 'Меню', en: 'Menu'}[_lang])
                .setStyle(4)
                .setId('pal')

                const buttonList = new ButtonsManager([btn_discord, btn_menu])

                _mess.edit({
                    content: errText[_lang],
                    components: buttonList.get()
                })
                .catch(console.log)
            }

            if (err && err.log_msg) { // отправка логов на сервер бота (уведомления)
                sendToChannel(config.chLog, err.log_msg)
                .catch(console.log)
            }
        })
    } catch(err) {
        console.log(err)

        if (_mess && err) {
            const errText = err.err_msg || {ru: 'Непредвиденная ошибка...', en: 'Unforeseen error ...'}

            const btn_discord = new Button()
            .setLabel({ru: 'Дискорд бота', en: 'Bot discord'}[_lang])
            .setURL('https://discord.gg/C2phgzTxH9')

            const btn_menu = new Button()
            .setLabel({ru: 'Меню', en: 'Menu'}[_lang])
            .setStyle(4)
            .setId('pal')

            const buttonList = new ButtonsManager([btn_discord, btn_menu])

            _mess.edit({
                content: errText[_lang],
                components: buttonList.get()
            })
            .catch(console.log)
        }

        if (err && err.log_msg) { // отправка логов на сервер бота (уведомления)
            sendToChannel(config.chLog, err.log_msg)
            .catch(console.log)
        }
    }
})