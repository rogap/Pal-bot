/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, classes} = _local
const {translate} = config


module.exports = async function(message, settings, command, contentParams) {
    return new Promise(async (resolve, reject) => {
        try {
            const userId = message.author.id
            const prop = settings.getProp()
            const {lang} = prop
            const typeSortList = { // виды сортировок
                lvl: ['lvl', 'level', 'лвл', 'уровень'],
                winrate: ['winrate', 'винрейт'],
                time: ['time', 'время'],
                kda: ['kda', 'кда'],
                // match: ['match', 'matches', 'game', 'games', 'матч', 'матчи', 'игра', 'игры']
            }

            const params = contentParams.split(' ')
            const [nameOrId, typeSort] = params

            const checkTypeSort = typeSort === undefined || typeSort === '' ? true :
                typeSortList.find((typeName, typeList) => {
                return typeList.find(type => type === typeSort) ? true : false
            })

            // console.log(nameOrId, typeSort, checkTypeSort)
            if (!checkTypeSort) return reject({
                err_msg: {
                    ru: 'Указан неверный тип сортировки.',
                    en: 'Invalid sort type specified.'
                }
            })

            const body = await command.getStats(userId, nameOrId)
            const {getchampionranks} = body
            const {ChampionsStats} = classes
            const champions = new ChampionsStats(getchampionranks.json)

            if (champions.error) return reject({
                body,
                err_msg: {
                    ru: 'Чемпионы не найдены.',
                    en: 'No champions found.'
                }
            })

            // сортируем
            champions.sortType(typeSort)
            // if (typeSort) champions.sort(funcSort[typeSort])

            // рисуем
            const draw = command.draw(champions, prop, getchampionranks.last_update)
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