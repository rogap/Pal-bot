/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes


module.exports = function(message, settings, command, contentParams) {
    return new Promise((resolve, reject) => {
        const userId = message.author.id
        const prop = settings.getProp()
        const {lang} = prop

        const params = contentParams.split(' ')
        let [nameOrId, matchNumber] = params

        if (isFinite(nameOrId)) {
            matchNumber = nameOrId
            nameOrId = 'me'
        }

        const number = isFinite(matchNumber) ? 
            matchNumber < 1 ? 1 : matchNumber > 50 ? 50 : Math.floor(matchNumber) : 1

        command.getStats(userId, nameOrId, number)
        .then(body => {
            const draw = command.draw(body, prop)
            if (!draw.status) return reject(draw)

            const canvas = draw.canvas
            const buffer = canvas.toBuffer('image/png') // buffer image
            const news = config.news[lang]

            const showOldStatsText = {
                ru: '__**Вам будут показаны данные последнего удачного запроса.**__',
                en: '__**You will be shown the details of the last successful request.**__'
            }

            const replayOldText = body.getmatchdetails.old ?
                    `${body.getmatchdetails.new.err_msg[lang]}\n${showOldStatsText[lang]}\n` : ''

            const matchInfo = `\`\`\`md\n[]()<id ${draw.matchId}>\`\`\``

            message.channel.send(`${news}${replayOldText}${message.author}${matchInfo}`, {files: [buffer]})
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
                    log_msg: `Ошибка отправки сообщения готового ответа команды "sm" (<@${userId}>).`,
                    content: message.content,
                    params: contentParams
                })
            })
        })
        .catch(err => {
            if (err.err_msg !== undefined) return reject(err) // проброс ошибки если есть описание
            return reject({
                err,
                log_msg: `Ошибка вызова "sm.getStats" команды для пользователя (<@${userId}>).`,
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