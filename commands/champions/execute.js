/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {Discord, config, classes, utils} = _local
const {sendToChannel} = utils
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (userId, settings, command, nameOrId, typeSort) => {
    try {
        const prop = settings.getProp()
        const {lang} = prop
        if (nameOrId && nameOrId.mentionToId) nameOrId = nameOrId.mentionToId()

        if ( /[\-\_]/.test(nameOrId) ) throw {
            err: 'Попытка смотреть консольный ак',
            status: false,
            err_msg: {
                ru: `Консольные аккаунты доступны только по ID.\n=\nИспользуйте команду !search для поиска нужного аккаунта.`,
                en: `Console accounts are available only by ID.\n=\nUse the command !search to find the desired account.`
            }
        }

        if ( /[\`\~\!\@\#\$\%\^\&\*\(\)\=\+\[\]\{\}\;\:\'\"\\\|\?\/\.\>\,\< ]/.test(nameOrId) ) throw {
            err: 'Введен не корректный ник',
            status: false,
            err_msg: {
                ru: `Введите корректный Ник или id аккаунта Paladins.`,
                en: `Enter the correct Nickname or Paladins account id.`
            }
        }

        const body = await command.getStats(userId, nameOrId)
        const {getchampionranks} = body

        const hideInfoParams = (body.playerId || body.playerName || nameOrId || 'me') + ''
        const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: hideInfoParams, inline: true}]

        const {ChampionsStats} = classes
        const champions = new ChampionsStats(getchampionranks.data)

        if (champions.error) throw {
            body,
            err_msg: {
                ru: 'Чемпионы не найдены.',
                en: 'No champions found.'
            }
        }

        // сортируем
        champions.sortType(typeSort)

        // рисуем
        const draw = await command.draw(champions, prop, getchampionranks.lastUpdate)
        if (!draw.status) throw draw

        const canvas = draw.canvas
        const buffer = canvas.toBuffer('image/png') // buffer image
        const news = config.news[lang]

        const showOldStatsText = {
            ru: 'Аккаунт скрыт или API временно не работает.\n__**Вам будут показаны данные последнего удачного запроса.**__',
            en: 'The account is hidden or the API is temporarily not working.\n__**You will be shown the details of the last successful request.**__'
        }

        const replayOldText = body.getchampionranks.old ?
                `${showOldStatsText[lang]}\n` : ''

        const matchesInfo = `\`\`\`md\n[${body.playerName}](${body.playerId})<${typeSort||''}>\`\`\``

        const statsImg = await sendToChannel(config.chImg, {files: [buffer]})
        const attachment = statsImg.attachments.last()

        const buttonsLine_1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('menu')
            .setLabel({en: 'Menu', ru: 'Меню'}[lang])
            .setStyle('DANGER')
            .setEmoji('<:menu:943824092635758632>')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('champions')
            .setLabel({en: 'Refresh', ru: 'Обновить'}[lang])
            .setStyle('SUCCESS')
            .setEmoji('<:refresh_mix:943814451226873886>')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('champion')
            .setLabel({en: 'Choose a champion', ru: 'Выбрать чемпиона'}[lang])
            .setStyle('SECONDARY')
            .setEmoji('<:champion:943440471601061888>')
        )

        const buttonsLine_2 = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('champions_sort')
                .setPlaceholder({en: 'Sorted by...', ru: 'Сортировать по...'}[lang])
                .addOptions([
                    {
                        label: {en: 'Level', ru: 'Уровню'}[lang],
                        description: {en: 'Sort by level', ru: 'Сортировать по уровню'}[lang],
                        value: 'lvl',
                        emoji: '<:lvl:943865190452178984>'
                    },
                    {
                        label: {en: 'Winrate', ru: 'Винрейт'}[lang],
                        description: {en: 'Sort by winrate', ru: 'Сортировать по винрейту'}[lang],
                        value: 'winrate',
                        emoji: '<:stats:943819417131839501>'
                    },
                    {
                        label: {en: 'Time', ru: 'Времени'}[lang],
                        description: {en: 'Sort by the time of the game on the champion', ru: 'Сортировать по времени игры на чемпионе'}[lang],
                        value: 'time',
                        emoji: '<:time:943836999771623475>'
                    },
                    {
                        label: {en: 'K/D/A', ru: 'K/D/A'}[lang],
                        description: {en: 'Sort by K/D/A', ru: 'Сортировать по K/D/A'}[lang],
                        value: 'kda',
                        emoji: '<:rip:943864073248993290>'
                    }
                ])
        )

        return {
            content: `${news}${replayOldText}${matchesInfo}`,
            components: [buttonsLine_1, buttonsLine_2],
            embeds: [{
                color: '2F3136',
                image: {
                    url: attachment.url
                },
                fields: hideInfo
            }]
        }
    } catch (err) {
        console.log(JSON.stringify(err))
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'Какая-то непредвиденная ошибка поидее'
        }
    }
}