/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {Discord, config, classes, utils} = _local
const {sendToChannel} = utils
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (userId, settings, command, userNameOrId, champion) => {
    try {
        const prop = settings.getProp()
        const {lang} = prop
        const news = config.news[lang]
        if (userNameOrId && userNameOrId.mentionToId) userNameOrId = userNameOrId.mentionToId()

        if ( /[\`\~\!\@\#\$\%\^\&\*\(\)\=\+\[\]\{\}\;\:\'\"\\\|\?\/\.\>\,\< ]/.test(userNameOrId) ) {
            throw {
                err: 'Введен не корректный ник',
                status: false,
                err_msg: {
                    ru: `Введите корректный Ник или id аккаунта Paladins.`,
                    en: `Enter the correct Nickname or Paladins account id.`
                }
            }
        }

        const buttonsLine_1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('menu')
            .setLabel({en: 'Menu', ru: 'Меню'}[lang])
            .setStyle('DANGER')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('champion')
            .setLabel({en: 'Update', ru: 'Обновить'}[lang])
            .setStyle('SUCCESS')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('champions')
            .setLabel({en: 'To the statistics of champions', ru: 'К статистике чемпионов'}[lang])
            .setStyle('PRIMARY')
        )

        const championsFilterOpts = []
        _local.champions.champions.forEach((champion, i) => {
            const count = Math.floor(i / 25) // массив по счету
            if (!(i % 25)) championsFilterOpts.push([]) // новый массив
            championsFilterOpts[count].push({
                label: {en: champion.Name.en, ru: champion.Name.ru}[lang],
                description: {en: `Filter by the selected champion`, ru: `Фильтр по выбранному чемпиону`}[lang],
                value: champion.name.en
            })
        })
        const championsOpt = []
        championsFilterOpts.forEach((optList, i) => {
            championsOpt.push(
                new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId(`champion_champion_${i}`)
                        .setPlaceholder({en: 'Select a champion', ru: 'Выберите чемпиона'}[lang])
                        .addOptions(optList)
                )
            )
        })

        if (!champion) {
            const hideInfoParams = (userNameOrId || 'me') + ''
            const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: hideInfoParams, inline: true}]

            return {
                content: `${news}${{
                    ru: `Выберите чемпиона`,
                    en: `Choose a champion`
                }[lang]}`,
                components: [buttonsLine_1, ...championsOpt],
                embeds: [{
                    color: '2F3136',
                    fields: hideInfo
                }]
            }
        }

        const body = await command.getStats(userId, userNameOrId)
        const {getchampionranks} = body

        const hideInfoParams = (body.playerId || body.playerName || userNameOrId || 'me') + ''
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

        const drawChampion = champions.getByName(champion.name.en)
        if (!drawChampion) return {
            content: `${news}${{
                ru: `У вас нет статистики ${champion?.name?.en}.`,
                en: `You have no statistics ${champion?.name?.en}.`
            }[lang]}`,
            components: [buttonsLine_1, ...championsOpt],
            embeds: [{
                color: '2F3136',
                fields: hideInfo
            }]
        }
        const draw = await command.draw(drawChampion, prop, getchampionranks.lastUpdate)
        if (!draw.status) throw draw

        const canvas = draw.canvas
        const buffer = canvas.toBuffer('image/png') // buffer image

        const showOldStatsText = {
            ru: 'Аккаунт скрыт или API временно не работает.\n__**Вам будут показаны данные последнего удачного запроса.**__',
            en: 'The account is hidden or the API is temporarily not working.\n__**You will be shown the details of the last successful request.**__'
        }

        const replayOldText = body.getchampionranks.old ?
                `${showOldStatsText[lang]}\n` : ''

        const matchesInfo = `\`\`\`md\n[${body.playerName}](${body.playerId})<${champion?.name?.en||''}>\`\`\``

        const statsImg = await sendToChannel(config.chImg, {files: [buffer]})
        const attachment = statsImg.attachments.last()

        return {
            content: `${news}${replayOldText}${matchesInfo}`,
            components: [buttonsLine_1, ...championsOpt],
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
                ru: 'Ошибка при формировании ответа. Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Error when forming the response. Try again or report this error to the bot creator.'
            },
            log_msg: 'Какая-то непредвиденная ошибка поидее'
        }
    }
}