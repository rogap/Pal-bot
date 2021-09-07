/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {Discord, config, classes, stegcloak, utils} = _local
const {sendToChannel} = utils
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (userId, settings, command, userNameOrId) => {
    try {
        const prop = settings.getProp()
        const {lang} = prop
        const writeList = new Set([424, 425, 427, 428, 437, 444, 452, 453, 469])
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

        const body = await command.getStats(userId, userNameOrId)
        const {getplayerstatus} = body
        const data = getplayerstatus.json[0]
        const lastUpdate = getplayerstatus.lastUpdate

        const buttonsLine_1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('pal')
            .setLabel({en: 'Menu', ru: 'Меню'}[lang])
            .setStyle('DANGER')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('sp')
            .setLabel({en: 'Update', ru: 'Обновить'}[lang])
            .setStyle('SUCCESS')
        )

        const hideObjInfo = {
            owner: userId,
            params: body.playerId || body.playerName || userNameOrId || 'me'
        }
        const hideInfo = stegcloak.hide(JSON.stringify(hideObjInfo), config.stegPass, config.stegText)
        const matchId = data.Match

        if (data.Match != 0 && !writeList.has(data.match_queue_id)) {
            // текущая очередь не поддерживается
            return {
                content: {en: 'A player in the match lobby. The current mode is not supported.', 
                    ru: 'Игрок в лобби матча. Текущий режим не поддерживается.'}[lang],
                components: [buttonsLine_1],
                embeds: [{
                    description: `||${hideInfo}||`,
                    color: '2F3136'
                }]
            }
        }

        let replyText = ''
        if (data.status === 0) {
            replyText = {
                ru: 'Игрок Offline.',
                en: 'Player Offline.'
            }
        } else if (data.status === 1) {
            replyText = {
                ru: 'Игрок находится в меню игры.',
                en: 'The player is in the game menu.'
            }
        } else if (data.status === 2) {
            replyText = {
                ru: 'Игрок выбирает чемпиона или загружается в матч.',
                en: 'The player selects a champion or loads into the match.'
            }
        } else if (data.status === 3) {
            // ниче не делаем
        } else if (data.status === 4) {
            replyText = {
                ru: 'Игрок Online, но блокирует трансляцию состояния игрока.',
                en: `The player is Online, but blocks the broadcast of the player's state.`
            }
        } else if (data.status === 5) {
            replyText = {
                ru: 'Игрок не найден.',
                en: 'Player not found.'
            }
        } else {
            // неизвестная ошибка - status должен быть !
            throw {
                err_msg: {
                    ru: 'Неизвестная ошибка в данных Hi-Rez. Сообщите создателю бота.',
                    en: 'Unknown error in Hi-Rez data. Let the bot creator know.'
                }
            }
        }

        if (replyText) {
            // отправляем сообщение и завершаем скрипт
            // тут еще отправляем новости
            const news = config.news[lang]
            return {
                content: `${news}\`\`\`yaml\n${replyText[lang]}\`\`\``,
                components: [buttonsLine_1],
                embeds: [{
                    description: `||${hideInfo}||`,
                    color: '2F3136'
                }]
            }
        } else if (matchId) {
            // если игрок в матче getmatchplayerdetails (data.match_queue_id)
            const match = body.getmatchplayerdetails.json
            // console.log(match)

            const draw = await command.draw(match, prop, lastUpdate)
            if (!draw.status) throw draw

            const canvas = draw.canvas
            const buffer = canvas.toBuffer('image/png') // buffer image
            const news = config.news[lang]

            const showOldStatsText = {
                ru: '__**Вам будут показаны данные последнего удачного запроса.**__',
                en: '__**You will be shown the details of the last successful request.**__'
            }

            const replayOldText = body.getmatchplayerdetails.old ?
                `${body.getmatchplayerdetails.new.err_msg[lang]}\n${showOldStatsText[lang]}\n` : ''

            const matchesInfoText = match.map((player, i) => {
                    return `${i+1}. [${player.ChampionName}](${player.playerName})<id ${player.playerId}>` +
                        `[${config.platforms[player.playerPortalId]}](${player.playerPortalUserId})`
                }).join('\n')


            const matchesInfo = `\`\`\`md\n[Match id](${draw.matchId})\n\n${matchesInfoText}\`\`\``
            const statsImg = await sendToChannel(config.chImg, {files: [buffer]})
            const attachment = statsImg.attachments.last()

            return {
                content: `${news}${replayOldText}${matchesInfo}`,
                components: [buttonsLine_1],
                embeds: [{
                    description: `||${hideInfo}||`,
                    color: '2F3136',
                    image: {
                        url: attachment.url
                    }
                }]
            }
        }
    } catch(err) {
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'sp.execute'
        }
    }
}