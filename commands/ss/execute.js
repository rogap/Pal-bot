/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {Discord, config, stegcloak, utils} = _local
const {sendToChannel} = utils
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (userId, settings, command, nameOrId, modifier) => {
    try {
        const prop = settings.getProp()
        const {lang, params} = prop
        if (nameOrId && nameOrId.mentionToId) nameOrId = nameOrId.mentionToId()

        if ( /[\`\~\!\@\#\$\%\^\&\*\(\)\=\+\[\]\{\}\;\:\'\"\\\|\?\/\.\>\,\< ]/.test(nameOrId) ) {
            throw {
                err: 'Введен не корректный ник',
                status: false,
                err_msg: {
                    ru: `Введите корректный Ник или id аккаунта Paladins.`,
                    en: `Enter the correct Nickname or Paladins account id.`
                }
            }
        }

        const body = await command.getStats(userId, nameOrId, modifier)
        if (!body.status) throw body

        const draw = await command.draw(body, prop) // рисуем
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

        const hideObjInfo = {
            owner: userId,
            params: draw.id || draw.name || nameOrId || 'me'
        }
        const hideInfo = stegcloak.hide(JSON.stringify(hideObjInfo), config.stegPass, config.stegText)

        const consoleStats = params?.ss?.console || false
        const buttonsLine_1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('pal')
            .setLabel({en: 'Menu', ru: 'Меню'}[lang])
            .setStyle('DANGER')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('ss' + (consoleStats ? '_console' : ''))
            .setLabel({en: 'Update', ru: 'Обновить'}[lang])
            .setStyle('SUCCESS')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('ss' + (consoleStats ? '' : '_console'))
            .setLabel({en: 'Console stats', ru: 'Статистика консоли'}[lang])
            .setStyle(consoleStats ? 'SUCCESS' : 'PRIMARY')
        )

        const statsImg = await sendToChannel(config.chImg, {files: [buffer]})
        const attachment = statsImg.attachments.last()

        return {
            content: `${news}${replayOldText}${playerInfo}`,
            components: [buttonsLine_1],
            embeds: [{
                description: `||${hideInfo}||`,
                color: '2F3136',
                image: {
                    url: attachment.url
                }
            }]
        }
    } catch(err) {
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