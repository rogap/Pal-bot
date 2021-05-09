/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config} = _local


module.exports = function(message, settings, command, contentParams) {
    return new Promise((resolve, reject) => {
        const userId = message.author.id
        const {lang} = settings

        command.getStats(userId, contentParams)
        .then(body => {
            const data = body.result
            if (data) { // если запрос был на поулчение данных
                const replyText = {ru: `#Ваши сохраненные данные:\n`, en: `#Your saved data:\n`}
                if (data.hz_player_name) replyText.ru += `[Никнейм](${data.hz_player_name}); `
                if (data.hz_player_name) replyText.en += `[Nicname](${data.hz_player_name}); `
                if (data.paladins_id) replyText.ru += `[paladins id](${data.paladins_id}); `
                if (data.paladins_id) replyText.en += `[paladins id](${data.paladins_id}); `

                if (!data.hz_player_name && !data.paladins_id) { // если данных нет
                    replyText.ru = 'Данных нет.'
                    replyText.en = 'No data.'
                    message.channel.sendWarning(replyText[lang])
                    .then(mess => {
                        return resolve(mess)
                    })
                    .catch(err => {
                        if (err.err_msg !== undefined) return reject(err) // проброс ошибки если есть описание
                        return reject({
                            err,
                            err_msg: {
                                ru: 'Ошибка отправки результата команды (данных нет).',
                                en: 'Error sending command result (no data).'
                            },
                            log_msg: `Ошибка отправки сообщения готового овтета команды "me" (данных нет) (<@${userId}>).`,
                            content: message.content,
                            params: contentParams
                        })
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
    })
}