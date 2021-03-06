/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config} = _local


module.exports = function(message, settings, command, contentParams='') {
    return new Promise((resolve, reject) => {
        try {
            const userId = message.author.id
            const {lang, prefix} = settings
            const comHH = settings.commands.getByName('hh').possibly[0]
            const comME = command.possibly[0]

            const check = contentParams === '' ? true : /^(([0-9]{6,9})|([^0-9].+))$/i.test(contentParams) &&
                !/[\`\~\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\]\{\}\;\:\'\"\\\|\?\/\.\>\,\< ]/.test(contentParams)

            if (!check) return reject({
                err_msg: {
                    ru: `Введите корректный Ник или id аккаунта Paladins.\n` +
                        `=Вы можете получить помощь на сервере бота, командой ${prefix}${comHH} или ${prefix}${comHH} ${comME}`,
                    en: `Enter the correct Nickname or Paladins account id.\n` +
                        `=You can get help on the bot's server, by command ${prefix}${comHH} or ${prefix}${comHH} ${comME}`
                }
            })

            command.getStats(userId, contentParams)
            .then(body => {
                // console.log(body)
                const data = body.result
                if (data && contentParams === '') { // если запрос был на получение данных
                    const replyText = {ru: `#Ваши сохраненные данные:\n`, en: `#Your saved data:\n`}
                    if (data.hz_player_name) replyText.ru += `[Никнейм](${data.hz_player_name}); `
                    if (data.hz_player_name) replyText.en += `[Nicname](${data.hz_player_name}); `
                    if (data.paladins_id) replyText.ru += `[paladins id](${data.paladins_id}); `
                    if (data.paladins_id) replyText.en += `[paladins id](${data.paladins_id}); `

                    if (!data.hz_player_name && !data.paladins_id) { // если данных нет
                        return reject({
                            err_msg: {
                                ru: 'Ошибка получения - у вас нет сохраненного ника.\n' +
                                    `=Вы можете получить помощь на сервере бота, командой ${prefix}${comHH} или ${prefix}${comHH} ${comME}`,
                                en: `Receiving error - you don't have a saved nickname.\n` +
                                    `=You can get help on the bot's server, by command ${prefix}${comHH} or ${prefix}${comHH} ${comME}`
                            }
                        })
                    } else { // если есть данные то отправляем их
                        message.channel.send(`${message.author}\`\`\`md\n${replyText[lang]}\`\`\``)
                        .then(mess => {
                            return resolve(mess)
                        })
                        .catch(err => {
                            if (err.err_msg !== undefined) return reject(err) // проброс ошибки если есть описание
                            return reject({
                                err,
                                err_msg: {
                                    ru: 'Ошибка отправки результата команды (данные есть).',
                                    en: 'Error sending command result (data is available).'
                                },
                                log_msg: `Ошибка отправки сообщения готового овтета команды "me" (данные есть) (<@${userId}>).`,
                                content: message.content,
                                params: contentParams
                            })
                        })
                    }
                } else if (contentParams === '') {
                    // если нет данных
                    return reject({
                        err_msg: {
                            ru: 'Вы еще не сохранили свой никнейм.\n' +
                                `=Вы можете получить помощь на сервере бота, командой ${prefix}${comHH} или ${prefix}${comHH} ${comME}`,
                            en: `You haven't saved your nickname yet.\n` +
                                `=You can get help on the bot's server, by command ${prefix}${comHH} or ${prefix}${comHH} ${comME}`
                        }
                    })
                } else { // если запрос был на сохранение данных
                    const replyText = {
                        ru: 'Ваш никнейм успешно записан!',
                        en: 'Your nickname has been successfully registered!'
                    }
                    message.sendCheckIn(replyText[lang]) // эту часть удалить можно (переписать на await) -->
                    .then(mess => {
                        return resolve(mess)
                    })
                    .catch(err => {
                        if (err.err_msg !== undefined) return reject(err) // проброс ошибки если есть описание
                        return reject({
                            err,
                            err_msg: {
                                ru: 'Ошибка отправки результата команды (ник записан).',
                                en: 'Error sending command result (nickname recorded).'
                            },
                            log_msg: `Ошибка отправки сообщения готового овтета команды "me" (ник записан) (<@${userId}>).`,
                            content: message.content,
                            params: contentParams
                        })
                    })
                    // по сюда (потому что тут нужен resolve и return mess) <--
                }
            })
            .catch(err => {
                if (err.err_msg !== undefined) return reject(err) // проброс ошибки если есть описание
                return reject({
                    err,
                    err_msg: {
                        ru: 'Ошибка получения данных с сайта.',
                        en: 'Error retrieving data from the site.'
                    },
                    log_msg: `Ошибка вызова "me.getStats" команды для пользователя (<@${userId}>).`,
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
                log_msg: 'me.execute'
            })
        }
    })
}