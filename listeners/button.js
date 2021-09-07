/**
 * обработчик сообщений
 */


const _local = process._local
const {Discord, client, config, utils, classes, stegcloak, commandsUsed} = _local
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord
const {sendToChannel} = utils
const {Button, ButtonsManager} = classes


client.on('interactionCreate', async interaction => {
    try {
        if (!_local.launched) return; // если бот не запущен до конца
        if (interaction.user.bot) return; // пропускаем ботов
        if (!interaction.isButton() && !interaction.isSelectMenu()) return;
        console.log('click')

        const authorId = interaction.user.id
        const embeds = interaction.message.embeds

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
            return await interaction.reply({
                content: 'Скрытая команда - вызовите свое меню', // можно выдать кнопку с предложением вызвать команду
                ephemeral: true
            })
        }

        const settings = interaction.message.getSettings(authorId) // получаем обьект настроек для текущего пользователя
        // console.log(settings)
        const {lang} = settings

        const [commandName, commandBranch_1, commandBranch_2, commandBranch_3] = interaction.customId.split('_')
        const branches = [commandBranch_1, commandBranch_2, commandBranch_3]
        const values = interaction.values // выбранные эллементы у select menu
        const command = settings.commands.getByName(commandName)
        if (!command) return; // команда не найдена

        // можно проверить права (а можно и не проверять), но лучше проверить

        // выводим в консоль отладочные данные
        let guildName = 'ls'
        const guild = interaction.message.guild
        if (guild) guildName = guild.name
        if (!command.owner) console.log(`>B> ${guildName} <#${interaction.channel.id}> <@${authorId}>\ \n> ${commandName}`)

        const hideInfo = stegcloak.hide(JSON.stringify(hideObjInfo), config.stegPass, config.stegText)

        // тут нужно добавить в массив ( new Set ) то что это сообщение уже редачится и что бы его нажатия игнорились !!!
        await interaction.deferUpdate().catch(console.log) // откладываем ответ

        const buttonsLine_1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setURL(config.discordInvate)
            .setLabel({en: 'Help', ru: 'Помощь'}[lang])
            .setStyle('LINK')
        )

        await interaction.editReply({
            content: `<@${hideObjInfo.owner}> ` + {
                ru: 'Идет обработка команды, пожалуйста подождите...',
                en: 'The command is being processed, please wait...'}[lang],
            components: [buttonsLine_1],
            embed: {
                description: `||${hideInfo}||`,
                color: '2F3136'
            }
        }).catch(console.log)

        // тут из 'массива' уже можно удалить эти данные

        const res = await command.button(interaction, settings, command, hideObjInfo, branches, values)
        if (res && res.status === 1) {
            await command.used()
            if (!command.owner) console.log(`Команда успешно выполнена (<@${authorId}>).`)
        } else if (res && res.status === 2) {
            if (!command.owner) console.log(`Был осуществлен переход внутри команды (${command.name}) (<@${authorId}>).`)
        } else {
            console.log('Какая-то ошибка поидее...')
        }
    } catch(err) {
        console.log(err)
        const authorId = interaction.user.id
        const settings = Discord.Message.prototype.getSettings.call(interaction, authorId) // получаем обьект настроек для текущего пользователя
        const {lang} = settings
        try {
            // создаем кнопку меню и кнопку помощи
            const buttonsLine_1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('pal')
                .setLabel({en: 'Menu', ru: 'Меню'}[lang])
                .setStyle('DANGER')
            )
            .addComponents(
                new MessageButton()
                .setURL(config.discordInvate)
                .setLabel({en: 'Help', ru: 'Помощь'}[lang])
                .setStyle('LINK')
            )

            const errText = err.err_msg || {ru: 'Неизвестная ошибка...', en: 'Unknown error...'}

            await interaction.editReply({
                content: errText[lang],
                components: [buttonsLine_1]
            })
        } catch(err2) {
            console.log('\nОШИБКА ОТПРАВКИ error-button СООБЩЕНИЯ:\n')
            console.log(err2)
        }

        if (err && err.log_msg) { // отправка логов на сервер бота (уведомления)
            try {
                await sendToChannel(config.chLog, err.log_msg)
            } catch(err3) {
                console.log('\nОШИБКА ОТПРАВКИ ЛОГОВ НА СЕРВЕР БОТА:\n')
                console.log(err3)
            }
        }
    }
})