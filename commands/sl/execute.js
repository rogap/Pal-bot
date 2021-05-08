/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, classes} = _local
const {translate} = config


module.exports = async function(message, settings, command, contentParams) {
    return new Promise(async (resolve, reject) => {
        try {
            const {champions} = _local
            const userId = message.author.id
            const prop = settings.getProp()
            const {lang, timezone} = prop

            const params = contentParams.split(' ')
            const [firstParam, secondParam, thirdParam,] = params

            /**
             * если нет третьего параметра то:
             *  1. не указан ник, но указан чемпион и номер
             *  2. не указан номер но указан ник и чемпион
             *      если номер не найден среди параметров, то занчит первый параметр это ник, а второй это чемпион
             *      если номер найден, то вторым параметром из известных будет имя чемпиона
             * 
             * если есть только 1 параметр, то это полюбому должен быть чемпион
             * 
             * если указано 3 параметра то первым полюбому будет ник/id/me, а остальные 2 -> сначала найдем число
             */

            const number = isFinite(firstParam) && firstParam > 0 && firstParam < 7 ? firstParam :
                isFinite(secondParam) && secondParam > 0 && secondParam < 7 ? secondParam :
                isFinite(thirdParam) && thirdParam > 0 && thirdParam < 7 ? thirdParam : undefined

            const nameOrId = thirdParam !== undefined && thirdParam !== '' ? firstParam : // если есть все 3 параметра то первый 100% ник
                secondParam === undefined || secondParam === '' ? 'me' : // если есть только 1 параметр то он полюбому должен быть чемпионом
                number ? 'me' : firstParam

            const championOfParam = firstParam !== number && firstParam !== nameOrId ? firstParam :
                secondParam !== number && secondParam !== nameOrId ? secondParam :
                thirdParam !== number && thirdParam !== nameOrId ? thirdParam : undefined

            // console.log(`nameOrId: ${nameOrId}; championOfParam: ${championOfParam}; number: ${number}`)
            const champion = champions.getByAliases(championOfParam)

            if (!champion) return reject({
                err_msg: {
                    ru: 'Укажите имя чемпиона корректно.',
                    en: `Enter the champion's name correctly.`
                }
            })

            const body = await command.getStats(userId, nameOrId)
            // console.log(body)
            const {getplayerloadouts} = body
            // фильтруем оставляя нужного чемпиона
            const loadouts = getplayerloadouts.json.filter(ld => ld.ChampionId == champion.id)
            // console.log(champion.id, loadouts)

            if (!loadouts.length) return reject({
                err_msg: {
                    ru: 'Колоды для указанного чемпиона не найдены.',
                    en: 'No decks found for the specified champion.'
                }
            })

            const news = config.news[lang]
            const showOldStatsText = {
                ru: '__**Вам будут показаны данные последнего удачного запроса.**__',
                en: '__**You will be shown the details of the last successful request.**__'
            }

            const replayOldText = body.getplayerloadouts.old ?
                    `${body.getplayerloadouts.new.err_msg[lang]}\n${showOldStatsText[lang]}\n` : ''

            // если пользователь не указал колоду, а выбрать нужно ( их > 1)
            if (!number && loadouts.length > 1) {
                let repText = {
                    ru: `\`\`\`md\n# Выберите одну из колод:\n* [№](имя колоды)\n`,
                    en: `\`\`\`md\n# Choose one of the decks:\n* [№](deck name)\n`
                }[lang]
                for (let i = 0; i < loadouts.length; i++) {
                    repText += `[${i+1}](${loadouts[i].DeckName})\n`
                }

                repText += `> >\n`
                repText += {
                    ru: `# Что бы выбрать нужную колоду допишите ее номер после имени чемпиона. Пример:\n`,
                    en: `# To select the desired deck, add its number after the name of the champion. Example:\n`
                }[lang]
                repText += `!sl me ${champion.Name} 1\n`
                const lastUpdate = getplayerloadouts.last_update.updateToDate(timezone).toText()
                const nextUpdate = getplayerloadouts.last_update.getNextUpdate('getplayerloadouts', timezone)
                const updateTex = `${translate.Loadouts[lang]}: ${lastUpdate} | ${translate.Update[lang]}: ${nextUpdate}`
                repText += `* ${updateTex}`
                repText += `\`\`\``
                const sendResult =  await message.channel.send(`${news}${replayOldText}${message.author}${repText}`)
                return resolve(sendResult)
            }

            const numberDecks = Math.floor(number) || 0 // выбираем первую колоду если она одна
            const loadout = loadouts[numberDecks - 1] // выбираем колоду
            if (!loadout) return reject({
                err_msg: {
                    ru: `Указанной колоды нет, у пользователя ${loadouts.length} колод.`,
                    en: `There is no specified deck, the user has ${loadouts.length} decks.`
                }
            })

            // рисуем
            const draw = command.draw(loadout, champion, prop, getplayerloadouts.last_update)
            if (!draw.status) return reject(draw)

            const canvas = draw.canvas
            const buffer = canvas.toBuffer('image/png') // buffer image

            const sendResult =  await message.channel.send(`${news}${replayOldText}${message.author}`, {files: [buffer]})
            return resolve(sendResult)
        } catch(err) {
            if (err.err_msg !== undefined) return reject(err)
            // иначе другая ошибка, но поидее такой не должно быть
            return reject({
                err,
                log_msg: 'Ошибка при выполнении sl.execute.',
                err_msg: {
                    ru: 'Произошла ошибка во время выполнения команды (execute).\n' +
                        'Воспользуйтесь командой позже или получите информацию на сервере бота.',
                    en: 'An error occurred while executing the command (execute).\n' +
                        `Use the command later or get the information on the bot's server.`
                }
            })
        }
    })
}