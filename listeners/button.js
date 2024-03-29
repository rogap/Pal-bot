/**
 * обработчик сообщений
 */


const _local = process._local
const {Discord, client, config, utils, classes, commandsUsed} = _local
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord
const {sendToChannel} = utils
const {Button, ButtonsManager} = classes


client.on('interactionCreate', async interaction => {
    try {
        if (!_local.launched) return; // если бот не запущен до конца
        if (interaction.user.bot) return; // пропускаем ботов
        const isButton = interaction.isButton()
        if (!isButton && !interaction.isSelectMenu()) return;

        const authorId = interaction.user.id
        const settings = interaction.message.getSettings(authorId) // получаем обьект настроек для текущего пользователя
        const {lang} = settings
        const embeds = interaction.message.embeds

        const replyNotEmbed = {
            ru: `<@${authorId}>\n"Embed" был удален - вызовите команду заново.`,
            en: `<@${authorId}>\n"Embed" has been deleted - call the command again.`
        }[lang]

        if (!embeds) return await interaction.reply({content: replyNotEmbed, ephemeral: true}) // нет embeds
        const embed = embeds[0]
        if (!embed) return await interaction.reply({content: replyNotEmbed, ephemeral: true}) // нет embed

        const fields = embed.fields
        if (!fields) return await interaction.reply({content: replyNotEmbed, ephemeral: true}) // нет embed
        const fieldOwner = fields[0]?.value?.mentionToId()
        const fieldFor = fields[1]?.value
        if (!fieldOwner || !fieldFor) return await interaction.reply({content: replyNotEmbed, ephemeral: true}) // нет embed

        const hideObjInfo = {
            owner: fieldOwner,
            params: fieldFor
        }

        const [commandName, commandBranch_1, commandBranch_2, commandBranch_3] = interaction.customId.split('_')
        const branches = [commandBranch_1, commandBranch_2, commandBranch_3]
        const values = interaction.values // выбранные эллементы у select menu
        const command = settings.commands.get(commandName)
        if (!command) return; // команда не найдена

        // тут над будет выслать скрытое сообщение "вызовите свою команду меню"
        if (hideObjInfo.owner != authorId) {
            if (command.canAll) {
                if (isButton) return await interaction.reply({
                    content: `<@${authorId}>\n` + {
                        ru: 'Для того чтобы пользоваться кнопками вам нужно вызвать свою команду (нельзя нажимать на чужие кнопки).' + 
                        '\n**Введите в чат `!menu` или `/menu` Либо воспользуйтесь командой помощи `!hh`**',
                    en: `In order to use the buttons, you need to call your command (you can not click on other people's buttons).` +
                        '\nEnter `!menu` or `/menu` into the chat Or use the help command `!hh`'
                    }[lang], // можно выдать кнопку с предложением вызвать команду
                    ephemeral: true
                })
            } else {
                return await interaction.reply({
                    content: `<@${authorId}>\n` + {
                        ru: 'Для того чтобы пользоваться кнопками вам нужно вызвать свою команду (нельзя нажимать на чужие кнопки).' + 
                            '\n**Введите в чат `!menu` или `/menu` Либо воспользуйтесь командой помощи `!hh`**',
                        en: `In order to use the buttons, you need to call your command (you can not click on other people's buttons).` +
                            '\nEnter `!menu` or `/menu` into the chat Or use the help command `!hh`'
                    }[lang], // можно выдать кнопку с предложением вызвать команду
                    ephemeral: true
                })
            }
        }

        // можно проверить права (а можно и не проверять), но лучше проверить

        // выводим в консоль отладочные данные
        let guildName = 'ls'
        const guild = interaction.message.guild
        if (guild) guildName = guild.name
        if (!command.owner) console.log(`>B> ${guildName} <#${interaction.channel.id}> <@${authorId}>\ \n> ${commandName}`)

        const hideInfo = [{name: 'owner', value: `<@${fieldOwner}>`, inline: true}, {name: 'for', value: fieldFor, inline: true}]

        if (command.canAll) {
            if (isButton) {
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
                        color: '2F3136',
                        fields: hideInfo
                    }
                }).catch(console.log)
            }
        } else {
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
                    color: '2F3136',
                    fields: hideInfo
                }
            }).catch(console.log)
        }

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
                .setEmoji('<:menu:943824092635758632>')
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
            console.log(JSON.stringify(err2))
        }

        if (err && err.log_msg) { // отправка логов на сервер бота (уведомления)
            try {
                if (err?.err) console.log(JSON.stringify(err.err))
                await sendToChannel(config.chLog, err.log_msg)
            } catch(err3) {
                console.log('\nОШИБКА ОТПРАВКИ ЛОГОВ НА СЕРВЕР БОТА:\n')
                console.log(err3)
            }
        }
    }
})