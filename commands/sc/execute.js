/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes


module.exports = async function(message, settings, command, contentParams) {
    return new Promise(async (resolve, reject) => {
        try {
            const {champions} = _local
            const userId = message.author.id
            const prop = settings.getProp()
            const {lang} = prop

            const params = contentParams.split(' ')
            const [firstParam, secondParam] = params
            // может быть 1 параметр - чемпион
            const getChampionName = secondParam !== undefined && secondParam !== '' ? secondParam : firstParam
            const champion = champions.getByAliases(getChampionName)

            if (!champion) return reject({
                err_msg: {
                    ru: 'Введите корректное название чемпиона.',
                    en: 'Enter the correct champion name.'
                }
            })

            // не должны совпадать
            const nameOrId = firstParam !== getChampionName ? firstParam : 'me'
            // console.log(`nameOrId: ${nameOrId}; getChampionName: ${getChampionName}`)

            const body = await command.getStats(userId, nameOrId)
            // console.log(body)
            const {getchampionranks} = body
            const {ChampionsStats} = classes
            // console.log(getchampionranks)
            const champStats = new ChampionsStats(getchampionranks.json)

            if (champStats.error) return reject({
                body,
                err_msg: {
                    ru: 'Чемпионы не найдены или API Hi-Rez временно недоступно.',
                    en: 'No champions found or the Hi-Rez API is temporarily unavailable.'
                }
            })

            const drawChampion = champStats.getByName(champion.Name)
            if (!drawChampion) return reject({
                err_msg: {
                    ru: `У вас нет статистики ${getChampionName}.`,
                    en: `You have no statistics ${getChampionName}.`
                }
            })
            const draw = command.draw(drawChampion, prop, getchampionranks.last_update)
            if (!draw.status) return reject(draw)

            const canvas = draw.canvas
            const buffer = canvas.toBuffer('image/png') // buffer image
            const news = config.news[lang]

            const showOldStatsText = {
                ru: '__**Вам будут показаны данные последнего удачного запроса.**__',
                en: '__**You will be shown the details of the last successful request.**__'
            }

            const replayOldText = body.getchampionranks.old ?
                    `${body.getchampionranks.new.err_msg[lang]}\n${showOldStatsText[lang]}\n` : ''

            // const matchesInfo = ` ${drawChampion.lore[lang]}`
            const matchesInfo = ''

            const sendResult =  await message.channel.send(`${news}${replayOldText}${message.author}${matchesInfo}`, {files: [buffer]})
            return resolve(sendResult)
        } catch (err) {
            if (err && err.err_msg !== undefined) return reject(err)
            return reject({
                err,
                err_msg: {
                    ru: '',
                    en: ''
                },
                log_msg: 'Какая-то непредвиденная ошибка поидее'
            })
        }
    })
}