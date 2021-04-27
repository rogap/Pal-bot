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
            let replyText
            const data = body.result
            if (data) { // если запрос был на поулчение данных
                replyText = {ru: `#Ваши сохраненные данные:\n`, en: `#Your saved data:\n`}
                if (data.hz_player_name) replyText.ru += `[Никнейм](${data.hz_player_name}); `
                if (data.hz_player_name) replyText.en += `[Nicname](${data.hz_player_name}); `
                if (data.paladins_id) replyText.ru += `[paladins id](${data.paladins_id}); `
                if (data.paladins_id) replyText.en += `[paladins id](${data.paladins_id}); `
                if (!data.hz_player_name && !data.paladins_id) {
                    replyText.ru += '> Данных нет.'
                    replyText.en += '> No data.'
                }
            } else { // если запрос был на сохранение данных
                replyText = {
                    ru: '#Ваш никнейм успешно записан!',
                    en: '#Your nickname has been successfully registered!'
                }
            }

            const news = config.news[lang]
            message.channel.send(`${news}${message.author}\`\`\`md\n${replyText[lang]}\`\`\``)
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
                    log_msg: `Ошибка отправки сообщения готового овтета команды "me" (<@${userId}>).`,
                    content: message.content,
                    params: contentParams
                })
            })
        })
        .catch(err => {
            if (err.err_msg !== undefined) return reject(err) // проброс ошибки если есть описание
            return reject({
                err,
                err_msg: {
                    ru: '',
                    en: ''
                },
                log_msg: `Ошибка вызова "me.getStats" команды для пользователя (<@${userId}>).`,
                content: message.content,
                params: contentParams
            })
        })
    })
}