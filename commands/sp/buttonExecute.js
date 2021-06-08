/**
 * функция которая выполняет комнаду и отправляет результат пользователю (кнопки)
 */


const _local = process._local
const {client, config, classes, stegcloak, utils} = _local
const {Button, ButtonsManager} = classes
const {sendToChannel} = utils


module.exports = function(message, hideObjInfo, customIdList, settings, command, data) {
    return new Promise(async (resolve, reject) => {
        try {
            const {owner, params} = hideObjInfo
            const prop = settings.getProp()
            const {lang} = prop

            const body = await command.getStats(owner, params)
            const {getplayerstatus} = body
            const dataStats = getplayerstatus.json[0]
            const last_update = getplayerstatus.last_update
            const matchId = dataStats.Match

            const news = config.news[lang]
            const hideInfo = stegcloak.hide(JSON.stringify(hideObjInfo), config.stegPass, config.stegText)
            const embed = {
                description: `||${hideInfo}||`,
                color: '2F3136'
            }

            let content = ''
            let replyText = ''
            if (dataStats.status === 0) {
                replyText = {
                    ru: 'Игрок Offline.',
                    en: 'Player Offline.'
                }
            } else if (dataStats.status === 1) {
                replyText = {
                    ru: 'Игрок находится в меню игры.',
                    en: 'The player is in the game menu.'
                }
            } else if (dataStats.status === 2) {
                replyText = {
                    ru: 'Игрок выбирает чемпиона или загружается в матч.',
                    en: 'The player selects a champion or loads into the match.'
                }
            } else if (dataStats.status === 3) {
                // ниче не делаем
            } else if (dataStats.status === 4) {
                replyText = {
                    ru: 'Игрок Online, но блокирует трансляцию состояния игрока.',
                    en: `The player is Online, but blocks the broadcast of the player's state.`
                }
            } else if (dataStats.status === 5) {
                replyText = {
                    ru: 'Игрок не найден.',
                    en: 'Player not found.'
                }
            } else {
                // неизвестная ошибка - status должен быть !
                return reject({
                    err_msg: {
                        ru: 'Неизвестная ошибка в данных Hi-Rez. Сообщите создателю бота.',
                        en: 'Unknown error in Hi-Rez data. Let the bot creator know.'
                    }
                })
            }

            if (replyText) {
                // если ответ будет только в виде текстовой информации

                content = `${news}<@${owner}>\`\`\`yaml\n${replyText[lang]}\`\`\``
            } else if (matchId) {
                // если игрок в матче

                const match = body.getmatchplayerdetails.json
                const draw = command.draw(match, prop, last_update)
                if (!draw.status) return reject(draw)

                const canvas = draw.canvas
                const buffer = canvas.toBuffer('image/png') // buffer image
                // отправляем картинку на канал сервера что бы потом можно было взять ее url
                // да, да, вот так тупо приходится делать, дискорд не позволяет редачить файлы, но можно редачить ссылки
                const messImg = await sendToChannel(config.chImg, {files: [buffer]})
                const attachment = messImg.attachments.last()

                const showOldStatsText = {
                    ru: '__**Вам будут показаны данные последнего удачного запроса.**__',
                    en: '__**You will be shown the details of the last successful request.**__'
                }

                const replayOldText = body.getmatchplayerdetails.old ?
                    `${body.getmatchplayerdetails.new.err_msg[lang]}\n${showOldStatsText[lang]}\n` : ''

                const matchesInfoText = customIdList.has('ch-full') ? match.map((player, i) => {
                        return `${i+1}. [${player.ChampionName}](${player.playerName})<id ${player.playerId}>` +
                            `[${config.platforms[player.playerPortalId]}](${player.playerPortalUserId})`
                    }).join('\n') :
                    match.map((player, i) => {
                        return `${i+1}. [${player.ChampionName}](${player.playerName})<id ${player.playerId}>`
                    }).join('\n')


                const matchesInfo = `\`\`\`md\n[Match id](${draw.matchId})\n\n${matchesInfoText}\`\`\``
                content = `${news}${replayOldText}<@${owner}>${matchesInfo}`
                embed.image = {url: attachment.url}
            } else {
                // такого быть не может (не должно)
                return reject({
                    err_msg: {
                        ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                        en: 'Something went wrong... Try again or report this error to the bot creator.'
                    },
                    log_msg: `Ошибка! ОТВЕТ КОТОРОГО БЫТЬ НЕ ДОЛЖНО "sp" (<@${owner}>).`,
                    hideObjInfo
                })
            }

            const btn_update_id = customIdList.has('ch-full') ? 'sp_ch-full' : 'sp'
            const btn_update = new Button()
            .setLabel({ru: 'Обновить', en: 'Update'}[lang])
            .setStyle(3)
            .setId(btn_update_id)

            const btn_ch_full_label = customIdList.has('ch-full') ? 
                {ru: 'Доп инф (ВКЛ)', en: 'Add info (ON)'} :
                {ru: 'Доп инф (ВЫКЛ)', en: 'Add info (OFF)'}
            const btn_ch_full_style = customIdList.has('ch-full') ? 3 : 2
            const btn_ch_full_id = customIdList.has('ch-full') ? 'sp' : 'sp_ch-full'
            const btn_ch_full = new Button()
            .setLabel(btn_ch_full_label[lang])
            .setStyle(btn_ch_full_style)
            .setId(btn_ch_full_id)

            const btn_menu = new Button()
            .setLabel({ru: 'Меню', en: 'Menu'}[lang])
            .setStyle(4)
            .setId('pal')

            const buttonList = new ButtonsManager([btn_update, btn_ch_full, btn_menu])

            const sendResult = await message.edit({
                content,
                components: buttonList.get(),
                embed
            })
            return resolve({status: 1, name: 'sp', message: sendResult})
        } catch(err) {
            if (err && (err.err_msg !== undefined || err.log_msg !== undefined)) return reject(err)
            return reject({
                err,
                err_msg: {
                    ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                    en: 'Something went wrong... Try again or report this error to the bot creator.'
                },
                log_msg: 'sp.buttonExecute'
            })
        }
    })
}