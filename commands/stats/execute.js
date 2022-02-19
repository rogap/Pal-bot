/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {Discord, config, utils} = _local
const {sendToChannel} = utils
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (userId, settings, command, nameOrId, modifier, consoleStats=false) => {
    try {
        const prop = settings.getProp()
        const {lang, params} = prop
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

        const body = await command.getStats(userId, nameOrId, modifier)
        if (!body.status) throw body

        const draw = await command.draw(body, prop, consoleStats) // рисуем
        if (!draw.status) throw draw

        const canvas = draw.canvas
        const buffer = canvas.toBuffer('image/png') // buffer image
        const news = config.news[lang]

        const showOldStatsText = {
            ru: 'Аккаунт скрыт или API временно не работает.\n__**Вам будут показаны данные последнего удачного запроса.**__',
            en: 'The account is hidden or the API is temporarily not working.\n__**You will be shown the details of the last successful request.**__'
        }

        const replayOldText = body.getplayer.old ?
                `${showOldStatsText[lang]}\n` :
            body.getchampionranks.old ?
                `${showOldStatsText[lang]}\n` : ''

        const playerInfo = `\`\`\`md\n[${draw.name}](${draw.id})\`\`\``

        const hideInfoParams = (draw.id || draw.name || nameOrId || 'me') + ''
        const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: hideInfoParams, inline: true}]

        // const consoleStats = params?.ss?.console || false
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
            .setCustomId('stats' + (consoleStats ? '_console' : ''))
            .setLabel({en: 'Refresh', ru: 'Обновить'}[lang])
            .setStyle('SUCCESS')
            .setEmoji('<:refresh_mix:943814451226873886>')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('stats' + (consoleStats ? '' : '_console'))
            .setLabel((consoleStats ? {en: 'Show PC stats', ru: 'Показать статистику PC'} : 
                {en: 'Show console stats', ru: 'Показать статистику консоли'})[lang])
            // .setStyle(consoleStats ? 'SUCCESS' : 'PRIMARY')
            .setStyle('SECONDARY')
            .setEmoji(consoleStats ? '<:mouse:943825037536952350>' : '<:console:943825037113303071>')
        )

        const statsImg = await sendToChannel(config.chImg, {files: [buffer]})
        const attachment = statsImg.attachments.last()

        return {
            content: `${news}${replayOldText}${playerInfo}`,
            components: [buttonsLine_1],
            embeds: [{
                color: '2F3136',
                image: {
                    url: attachment.url
                },
                fields: hideInfo
            }]
        }
    } catch(err) {
        console.log(JSON.stringify(err))
        if (err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'omething went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'ss.execute'
        }
    }
}