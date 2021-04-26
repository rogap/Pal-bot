/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config} = _local


module.exports = function(message, settings, command) {
    return new Promise((resolve, reject) => {
        const userId = message.author.id
        const prop = settings.getProp()
        const {lang} = prop

        const contentFull = message.parseContent().cut(prop.prefix)
        const contentParams = command.getContent(contentFull)
        console.log(`contentParams = ${contentParams}`)
        /* думаю нет смысла проверять кол-во параметров, а просто брать нужное их кол-во или еще как-то
        там где параметр 1 или 0 то вообще можно не распарсивать и позволять ставить пробелы
        единственное ограничение какое можно сделать это длина параметр(а/ов)
        const paramsList = contentParams.split(' ')
        if ( paramsList.length > 1 ) return message.reply({
            'ru': '',
            // сообщить об ошибке что должно быть либо 0 параметров либо 1. А еще можно выдать мануал по этой команде сразу.
            'en': ''
        }[lang]).catch(err => console.log('Обработать ошибку отправки сообщения...'))
        */

        command.getStats(userId, contentParams) // если параметр не указан то paramsList[0] будет равен пустой строке, не будет ли ошибки в запросе?
        .then(body => {
            const draw = command.draw(body, prop) // рисуем
            if (!draw.status) return reject(draw)

            const canvas = draw.canvas
            const buffer = canvas.toBuffer('image/png') // buffer image
            const news = config.news[lang]

            let replayOldText = '' // показываем если есть старая стата во время тех работ
            if (body.getplayer.old) {
                replayOldText = `${body.getplayer.new.err_msg[lang]}\n`
            } else if (body.getchampionranks.old) {
                replayOldText = `${body.getchampionranks.new.err_msg[lang]}\n`
            }

            message.channel.send(`${news}${replayOldText}${message.author}`, {files: [buffer]})
            .then(mess => {
                return resolve(mess)
            })
            .catch(err => {
                return reject({
                    err,
                    err_msg: {
                        ru: '',
                        en: ''
                    },
                    log_msg: `Ошибка отправки сообщения готового ответа команды (<@${userId}>).`,
                    content: message.content,
                    params: contentParams
                })
            })
        })
        .catch(err => {
            if (err.err_msg !== undefined) return reject(err)
            return reject({
                err,
                log_msg: `Ошибка вызова "getStats" команды для пользователя (<@${userId}>).`,
                err_msg: {
                    ru: '',
                    en: ''
                },
                content: message.content,
                params: contentParams
            })
        })
    })
}