/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {Discord, config, stegcloak, utils} = _local
const {sendToChannel} = utils
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (userId, settings, command, userNameOrId, matchId, matchNumber) => {
    try {
        const prop = settings.getProp()
        const {lang, params} = prop
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
            .setCustomId('history')
            .setLabel({en: 'Back to history', ru: 'Назад к истории'}[lang])
            .setStyle('SECONDARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId(`last_prev_${matchNumber}`)
            .setLabel({en: 'Previous match', ru: 'Предыдущий матч'}[lang])
            .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId(`last_next_${matchNumber}`)
            .setLabel({en: 'Next match', ru: 'Следующий матч'}[lang])
            .setStyle('PRIMARY')
        )

        if ( (matchId && !isFinite(matchId)) || 
            (matchId && (matchId+'').length < 9) || 
            (matchNumber && !isFinite(matchNumber)) || 
            (matchNumber && matchNumber > 50)
        ) {
            const hideInfoParams = (userNameOrId || 'me') + ''
            const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: hideInfoParams, inline: true}]
            return {
                content: `:warning::warning::warning: \`\`\`fix\n
                    ${{en: 'Incorrect data was entered.', ru: 'Введены не корректные данные.'}[lang]}\`\`\``,
                components: [buttonsLine_1],
                embeds: [{
                    color: '2F3136',
                    fields: hideInfo
                }]
            }
        }

        // console.log(`userNameOrId: ${userNameOrId}; matchNumber: ${matchNumber}; modifier: ${modifier}`)
        console.log(userId, userNameOrId, matchId, matchNumber)
        const body = await command.getStats(userId, userNameOrId, matchId, matchNumber)
        // console.log(body)
        const {getmatchdetails} = body
        const match = getmatchdetails.data

        if (!match.length) {
            // если нет матчей
            const news = config.news[lang]
            const hideInfoParams = (body.playerId || body.playerName || userNameOrId || 'me') + ''
            const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: hideInfoParams, inline: true}]

            return {
                content: `${news}${{
                    ru: '**У игрока нет матчей.**',
                    en: '**The player has no matches.**'
                }[lang]}`,
                components: [buttonsLine_1],
                embeds: [{
                    color: '2F3136',
                    fields: hideInfo
                }]
            }
        }

        const draw = await command.draw(body, prop)
        if (!draw.status) throw draw

        const canvas = draw.canvas
        const buffer = canvas.toBuffer('image/png') // buffer image
        const news = config.news[lang]

        const showOldStatsText = {
            ru: 'Аккаунт скрыт или API временно не работает.\n__**Вам будут показаны данные последнего удачного запроса.**__',
            en: 'The account is hidden or the API is temporarily not working.\n__**You will be shown the details of the last successful request.**__'
        }

        const replayOldText = getmatchdetails.old ?
                `${showOldStatsText[lang]}\n` : ''

        const matchInfoText = match.map((pl, i) => `${i+1}. [${pl.Reference_Name}](${pl.playerName})<id ${pl.playerId}> ` +
                `[${config.platforms[pl.playerPortalId]}](${pl.playerPortalUserId})`).join('\n')

        const statsImg = await sendToChannel(config.chImg, {files: [buffer]})
        const attachment = statsImg.attachments.last()

        const hideInfoParams = (body.playerId || body.playerName || userNameOrId || 'me') + ''
        const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: hideInfoParams, inline: true}]
        const matchInfo = `\`\`\`md\n[]()<id ${draw.matchId}>\n\n${matchInfoText}\`\`\``

        return {
            content: `${news}${replayOldText}${matchInfo}`,
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
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'sm.execute'
        }
    }
}