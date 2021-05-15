/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config} = _local


module.exports = function(message, settings, command, contentParams) {
    return new Promise((resolve, reject) => {
        try {
            const userId = message.author.id
            const prop = settings.getProp()
            const {lang} = prop

            command.getStats(userId, contentParams) // если параметр не указан то paramsList[0] будет равен пустой строке, не будет ли ошибки в запросе?
            .then(body => {
                const draw = command.draw(body, prop) // рисуем
                if (!draw.status) return reject(draw)

                const canvas = draw.canvas
                const buffer = canvas.toBuffer('image/png') // buffer image
                const news = config.news[lang]

                const showOldStatsText = {
                    ru: '__**Вам будут показаны данные последнего удачного запроса.**__',
                    en: '__**You will be shown the details of the last successful request.**__'
                }

                const replayOldText = body.getplayer.old ?
                        `${body.getplayer.new.err_msg[lang]}\n${showOldStatsText[lang]}\n` :
                    body.getchampionranks.old ?
                        `${body.getchampionranks.new.err_msg[lang]}\n${showOldStatsText[lang]}\n` : ''

                const playerInfo = `\`\`\`md\n[${draw.name}](${draw.id})\`\`\``
                message.channel.send(`${news}${replayOldText}${playerInfo}${message.author}`, {files: [buffer]})
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
                        log_msg: `Ошибка отправки сообщения готового ответа команды "ss" (<@${userId}>).`,
                        content: message.content,
                        params: contentParams
                    })
                })
            })
            .catch(err => {
                if (err.err_msg !== undefined) return reject(err) // проброс ошибки если есть описание
                return reject({
                    err,
                    log_msg: `Ошибка вызова "ss.getStats" команды для пользователя (<@${userId}>).`,
                    err_msg: {
                        ru: '',
                        en: ''
                    },
                    content: message.content,
                    params: contentParams
                })
            })
        } catch(err) {
            if (err.err_msg !== undefined) return reject(err)
            return reject({
                err,
                err_msg: {
                    ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                    en: 'omething went wrong... Try again or report this error to the bot creator.'
                },
                log_msg: 'ss.execute'
            })
        }
    })
}