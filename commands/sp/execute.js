/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes


module.exports = function(message, settings, command, contentParams) {
    return new Promise((resolve, reject) => {
        try {
            const userId = message.author.id
            const prop = settings.getProp()
            const {lang} = prop
            const [firstParam, secondParam] = contentParams.split(' ')
            const modifierList = ['-f'] // список доступных модификаторов

            // получаем модификатор
            const modifier = modifierList.find(mod => mod === firstParam || mod === secondParam)

            const nameOrIdOrDis = firstParam !== modifier ? firstParam :
                secondParam !== modifier ? secondParam : 'me'

            // console.log(`nameOrIdOrDis: ${nameOrIdOrDis}; modifier: ${modifier}`)
            command.getStats(userId, nameOrIdOrDis)
            .then(body => {
                // console.log(body)
                const {getplayerstatus} = body
                const data = getplayerstatus.json[0]
                const last_update = getplayerstatus.last_update
                // console.log(data, last_update)

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
                    return reject({
                        err_msg: {
                            ru: 'Неизвестная ошибка в данных Hi-Rez. Сообщите создателю бота.',
                            en: 'Unknown error in Hi-Rez data. Let the bot creator know.'
                        }
                    })
                }

                const matchId = data.Match

                if (replyText) {
                    // отправляем сообщение и завершаем скрипт
                    // тут еще отправляем новости
                    const news = config.news[lang]
                    message.channel.send(`${news}${message.author}\`\`\`yaml\n${replyText[lang]}\`\`\``)
                    .then(mess => {
                        return resolve(mess)
                    })
                    .catch(err => {
                        if (err.err_msg !== undefined) return reject(err) // проброс ошибки если есть описание
                        return reject({
                            err,
                            err_msg: {
                                ru: '',
                                en: ''
                            },
                            log_msg: `Ошибка отправки сообщения готового ответа команды "sp" (<@${userId}>).`,
                            content: message.content,
                            params: contentParams
                        })
                    })
                } else if (matchId) {
                    // если игрок в матче getmatchplayerdetails (data.match_queue_id)
                    const match = body.getmatchplayerdetails.json
                    // console.log(match)

                    const draw = command.draw(match, prop, last_update)
                    if (!draw.status) return reject(draw)

                    const canvas = draw.canvas
                    const buffer = canvas.toBuffer('image/png') // buffer image
                    const news = config.news[lang]

                    const showOldStatsText = {
                        ru: '__**Вам будут показаны данные последнего удачного запроса.**__',
                        en: '__**You will be shown the details of the last successful request.**__'
                    }

                    const replayOldText = body.getmatchplayerdetails.old ?
                        `${body.getmatchplayerdetails.new.err_msg[lang]}\n${showOldStatsText[lang]}\n` : ''

                    const matchesInfoText = modifier == '-f' ? match.map((player, i) => {
                            return `${i+1}. [${player.ChampionName}](${player.playerName})<id ${player.playerId}>` +
                                `[${config.platforms[player.playerPortalId]}](${player.playerPortalUserId})`
                        }).join('\n') :
                        match.map((player, i) => {
                            return `${i+1}. [${player.ChampionName}](${player.playerName})<id ${player.playerId}>`
                        }).join('\n')


                    const matchesInfo = `\`\`\`md\n[Match id](${draw.matchId})\n\n${matchesInfoText}\`\`\``
                    // match.map(player => `${player}`)
                    message.channel.send(`${news}${replayOldText}${message.author}${matchesInfo}`, {files: [buffer]})
                    .then(mess => {
                        return resolve(mess)
                    })
                    .catch(err => {
                        if (err.err_msg !== undefined) return reject(err) // проброс ошибки если есть описание
                        return reject({
                            err,
                            err_msg: {
                                ru: '',
                                en: ''
                            },
                            log_msg: `Ошибка отправки сообщения готового ответа команды "sp" (<@${userId}>).`,
                            content: message.content,
                            params: contentParams
                        })
                    })
                } else {
                    // такого быть не может (не должно)
                    return reject({
                        err_msg: {
                            ru: '',
                            en: ''
                        },
                        log_msg: `Ошибка! ОТВЕТ КОТОРОГО БЫТЬ НЕ ДОЛЖНО "sp" (<@${userId}>).`,
                        content: message.content,
                        params: contentParams
                    })
                }
            })
            .catch(err => {
                if (err.err_msg !== undefined) return reject(err) // проброс ошибки если есть описание
                return reject({
                    err,
                    log_msg: `Ошибка вызова "sp.getStats" команды для пользователя (<@${userId}>).`,
                    err_msg: {
                        ru: '',
                        en: ''
                    },
                    content: message.content,
                    params: contentParams
                })
            })
        } catch(err) {
            if (err && err.err_msg !== undefined) return reject(err)
            return reject({
                err,
                err_msg: {
                    ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                    en: 'Something went wrong... Try again or report this error to the bot creator.'
                },
                log_msg: 'sp.execute'
            })
        }
    })
}