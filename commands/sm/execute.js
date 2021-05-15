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

            const params = contentParams.split(' ')
            const [firstParam, secondParam, thirdParam] = params
            const modifierList = ['-f'] // список доступных модификаторов

            //
            const nameOrIdOrDis = (isFinite(firstParam) && firstParam.length > 6) || firstParam === 'me' || (/^[^0-9\-]/i.test(firstParam) && firstParam !== undefined) ? firstParam :
                (isFinite(secondParam) && secondParam.length > 6) || secondParam === 'me' || (/^[^0-9\-]/i.test(secondParam) && secondParam !== undefined) ? secondParam :
                (isFinite(thirdParam) && thirdParam.length > 6) || thirdParam === 'me' || (/^[^0-9\-]/i.test(thirdParam) && thirdParam !== undefined) ? thirdParam : 'me'

            // матч по счету в итории матчей (не всегда нужен будет)
            const matchNumber = isFinite(firstParam) && firstParam > 1 && firstParam < 51 ? Math.floor(firstParam) :
                isFinite(secondParam) && secondParam > 1 && secondParam < 51 ? Math.floor(secondParam) :
                isFinite(thirdParam) && thirdParam > 1 && thirdParam < 51 ? Math.floor(thirdParam) : 1

            // получаем модификатор
            const modifier = modifierList.find(mod => mod === firstParam || mod === secondParam || mod === thirdParam)

            // console.log(`nameOrIdOrDis: ${nameOrIdOrDis}; matchNumber: ${matchNumber}; modifier: ${modifier}`)
            command.getStats(userId, nameOrIdOrDis, matchNumber)
            .then(body => {
                // console.log(body)
                const {getmatchdetails} = body
                const match = getmatchdetails.json
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

                const matchInfoText = modifier === '-f' ? // если вывести подробную инфу
                    match.map((pl, i) => `${i+1}. [${pl.Reference_Name}](${pl.playerName})<id ${pl.playerId}> ` +
                        `[${config.platforms[pl.playerPortalId]}](${pl.playerPortalUserId})`).join('\n') :
                    match.map((pl, i) => `${i+1}. [${pl.Reference_Name}](${pl.playerName})<id ${pl.playerId}>`).join('\n')

                const matchInfo = `\`\`\`md\n[]()<id ${draw.matchId}>\n\n${matchInfoText}\`\`\``
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
        } catch(err) {
            if (err && err.err_msg !== undefined) return reject(err)
            return reject({
                err,
                err_msg: {
                    ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                    en: 'Something went wrong... Try again or report this error to the bot creator.'
                },
                log_msg: 'sm.execute'
            })
        }
    })
}