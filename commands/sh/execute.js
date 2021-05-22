/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, classes} = _local
const {translate} = config


module.exports = function(message, settings, command, contentParams) {
    return new Promise((resolve, reject) => {
        try {
            const {champions} = _local
            const userId = message.author.id
            const prop = settings.getProp()
            const {lang} = prop
            const modifierList = ['-f'] // список доступных модификаторов

            // Queue	"Team Deathmatch" | Queue	"Onslaught"
            const gameModeTypes = {
                ranked: ['ranked', 'ранкед'],
                siege: ['siege', 'казуал', 'обычка', 'осада'],
                deathmatch: ['tdm', 'тдм', 'deathmatch'],
                onslaught: ['onslaught', 'натиск']
            }
            const championRoles = {
                support: ['support', 'поддержка', 'sup', 'heal', 'хил', 'healer'],
                flanker: ['flanker', 'фланг', 'flank'],
                frontline: ['frontline', 'танк', 'tank'],
                damage: ['damage', 'урон', 'dmg']
            }

            const params = contentParams.split(' ')
            const [firstParam, secondParam, thirdParam, fourthParam] = params

            // страница которую будем отображать
            const page = isFinite(firstParam) && firstParam > 0 && firstParam < 6 ? firstParam :
                isFinite(secondParam) && secondParam > 0 && secondParam < 6 ? secondParam :
                isFinite(thirdParam) && thirdParam > 0 && thirdParam < 6 ? thirdParam :
                isFinite(fourthParam) && fourthParam > 0 && fourthParam < 6 ? fourthParam : false

            const pageShow = prop.page = Math.floor(page) || 1

            // получаем модификатор
            const modifier = modifierList.find(mod => mod === firstParam || mod === secondParam || mod === thirdParam || mod === fourthParam) || false


            const errParams = {
                ru: `Не верно указаны параметры команды. Смотрите ${'!'}${'hh'} ${'sh'} - для получения детальной информации.`,
                en: `The command parameters are specified incorrectly. See ${'!'}${'hh'} ${'sh'} - for more detailed information.`
            }
            let userNameOrId, filterData

            if (fourthParam) {
                // если указано 4 параметра то первый параметр это пользователь, а ДРУГОЙ это тип фильтра

                userNameOrId = firstParam
                if (modifier === fourthParam) {
                    if (page === thirdParam) {
                        filterData = secondParam
                    } else if (page === secondParam) {
                        filterData = thirdParam
                    } else {
                        // ERR
                        return reject(errParams)
                    }
                } else if (modifier === thirdParam) {
                    if (page === fourthParam) {
                        filterData = secondParam
                    } else if (page === secondParam) {
                        filterData = fourthParam
                    } else {
                        // ERR
                        return reject(errParams)
                    }
                } else if (modifier === secondParam) {
                    if (page === fourthParam) {
                        filterData = thirdParam
                    } else if (page === thirdParam) {
                        filterData = fourthParam
                    } else {
                        // ERR
                        return reject(errParams)
                    }
                } else {
                    // ERR
                    return reject(errParams)
                }
            } else if (thirdParam) {
                /**
                 * если указано 3 параметра:
                 *      если указан page и modifier то ДРУГОЙ (первый) параметр это пользователь
                 *      если указан page или modifier то первый параметр это пользователь, а ДРУГОЙ это тип фильтра
                 */

                if (page && modifier) {
                    userNameOrId = firstParam
                } else if (page || modifier) {
                    userNameOrId = firstParam
                    if (page === thirdParam || modifier === thirdParam) {
                        filterData = secondParam
                    } else {
                        filterData = thirdParam
                    }
                } else {
                    // ERR
                    return reject(errParams)
                }
            } else if (secondParam) {
                /**
                 * если указано 2 параметра:
                 *      если есть page и modifier то пользователь равен ME
                 *      если есть page или modifier то пользователь равен ДРУГОМУ
                 *      если нет page и modifier то первый параметр это пользователь, а второй это тип фильтра
                 */

                if (page && modifier) {
                    userNameOrId = 'me'
                } else if (page || modifier) {
                    userNameOrId = firstParam
                } else {
                    userNameOrId = firstParam
                    filterData = secondParam
                }
            } else if (firstParam) {
                /**
                 * если указан 1 параметр:
                 *      если это page или modifier то пользователь равен ME
                 *      иначе пользователь равен этому параметру
                 */

                if (page || modifier) {
                    userNameOrId = 'me'
                } else {
                    userNameOrId = firstParam
                }
            }

            // тип матча
            const modeType = filterData ? gameModeTypes.find((modeName, mode) => {
                return mode.find(type => type === filterData.toLowerCase()) ? modeName : false
            }) : false

            // имя чемпиона
            const championType = champions.getByAliases(filterData || '')

            // роль чемпиона
            const championRole = championRoles.find((roleName, roles) => {
                return roles.find(role => role === filterData) ? roleName : false
            })




            // const cXname = championType ? championType.Name : ''
            // console.log(`modeType: ${modeType}; cXname: ${cXname}; role: ${championRole}; pageShow: ${pageShow}; modifier: ${modifier};`)
            command.getStats(userId, userNameOrId)
            .then(body => {
                const matches = body.getmatchhistory.json
                // console.log(`Всего: ${matches.length}`)

                // если указан тип матча то фильтруем по нему
                if (modeType) {
                    matches.filterRemove(match => {
                        return new RegExp(`^([a-z ]+)?${modeType}([a-z ]+)?$`, 'i').test(match.Queue)
                    })
                }
                // console.log(`modeType: ${matches.length}`)

                // если указан фильт по чемпиону то фильтруем
                if (championType) {
                    matches.filterRemove(match => {
                        return champions.getByName(match.Champion).Name === championType.Name
                    })
                }
                // console.log(`championType: ${matches.length}`)

                // если указана роль чемпиона
                if (championRole) {
                    matches.filterRemove(match => {
                        return champions.getByName(match.Champion).role.en === championRole
                    })
                }
                // console.log(`championRole: ${matches.length}`)

                // берем нужную страницу
                const matchesPage = matches.slice((pageShow-1)*10, (pageShow-1)*10+10)

                if (!matchesPage.length) return reject({
                    err_msg: {
                        ru: 'Матчи игрока не найдены.',
                        en: 'Player matches not found.'
                    }
                })

                // рисуем
                const draw = command.draw(matchesPage, prop, body.getmatchhistory.last_update)
                if (!draw.status) return reject(draw)

                const canvas = draw.canvas
                const buffer = canvas.toBuffer('image/png') // buffer image
                const news = config.news[lang]

                const showOldStatsText = {
                    ru: '__**Вам будут показаны данные последнего удачного запроса.**__',
                    en: '__**You will be shown the details of the last successful request.**__'
                }

                const replayOldText = body.getmatchhistory.old ?
                        `${body.getmatchhistory.new.err_msg[lang]}\n${showOldStatsText[lang]}\n` : ''

                // список id показаных матчей
                const matchesIds = matchesPage.map(match => match.Match)
                const fullMatchInfo = getFullMatchInfo(matches) // получаем полную статистику матча | matches matchesOld
                // console.log(matchesIds)
                const matchesInfoDefault = {
                    ru: `\`\`\`md\n* <For>[${draw.name}](${draw.id})\n\n` +
                        `[Матчи](${(pageShow-1)*10}-${matchesIds.length*(pageShow-1)+10}) [Всего](${matches.length})\n` + 
                        `# ID матчей:\n` + matchesIds.map((id, i) => `[${i+1+(pageShow-1)*10}](${id})`).join('; ') + ';',
                    en: `\`\`\`md\n* <For>[${draw.name}](${draw.id})\n\n` +
                        `[Matches](${(pageShow-1)*10}-${matchesIds.length*(pageShow-1)+10}) [Total](${matches.length})\n` + 
                        `# ID matches:\n` + matchesIds.map((id, i) => `[${i+1+(pageShow-1)*10}](${id})`).join('; ') + ';'
                        
                }

                const matchesInfo = modifier == '-f' ? 
                    ({
                        ru: matchesInfoDefault.ru + `\n\n# Статистика по ролям:\n` +
                            `* <Role>[КДА](Винрейт) <info: damage / healing / defense>:\n${fullMatchInfo.stats('roles').ru}` +
                            `\n# Статистика по типу очереди матчей:\n* <Queue>[КДА](Винрейт) <info: damage / healing / def>:\n` +
                            `${fullMatchInfo.stats('queue').ru}\n${fullMatchInfo.total.ru}`,
                        en: matchesInfoDefault.en + `\n\n# Statistics by roles:\n` +
                            `* <Role>[K/D/A](Winrate) <info: damage / healing / defense>:\n${fullMatchInfo.stats('roles').en}` +
                            `\n# Match queue type statistics:\n* <Queue>[K/D/A](Winrate) <info: damage / healing / def>:\n` +
                            `${fullMatchInfo.stats('queue').en}\n${fullMatchInfo.total.en}`
                    }[lang] + '```') : ( matchesInfoDefault[lang] + '```')
                

                message.channel.send(`${news}${replayOldText}${message.author}${matchesInfo}`, {files: [buffer]})
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
                        log_msg: `Ошибка отправки сообщения готового ответа команды "sh" (<@${userId}>).`,
                        content: message.content,
                        params: contentParams
                    })
                })
            })
            .catch(err => {
                if (err.err_msg !== undefined) return reject(err) // проброс ошибки если есть описание
                return reject({
                    err,
                    log_msg: `Ошибка вызова "sh.getStats" команды для пользователя (<@${userId}>).`,
                    err_msg: {
                        ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                        en: 'Something went wrong... Try again or report this error to the bot creator.'
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
                log_msg: 'sh.execute'
            })
        }
    })
}


class _temp {
    constructor() {
        this.win = 0
        this.lose = 0
        this.kills = 0
        this.deaths = 0
        this.assists = 0
        this.damage = 0
        this.healing = 0
        this.damage_mitigated = 0
    }

    get fullStats() {
        return `[${this.kda}](${this.winrate}) ${this.info}`
    }

    get winrate() {
        if (this.win == 0 && this.lose == 0) return '- 0/0'
        const prosent = (this.win / (this.win + this.lose) * 100).toFixed(0) || 0
        const prosentText = isFinite(prosent) ? `${prosent}%` : '0%'
        return `${prosentText} ${this.win}/${this.lose}`
    }

    get kda() {
        return `${this.kills}/${this.deaths}/${this.assists}`
    }

    get info() {
        return `<info: ${this.damage.goDot()} / ${this.healing.goDot()} / ${this.damage_mitigated.goDot()}>`
    }
}


class _tempGlobal extends _temp {
    constructor() {
        super()
        this.roles = {
            flanker: new _temp(),
            support: new _temp(),
            frontline: new _temp(),
            damage: new _temp()
        }

        this.queue = {
            ranked: new _temp(),
            siege: new _temp(),
            deathmatch: new _temp(),
            onslaught: new _temp()
        }
    }

    get total() {
        return {
            ru: `# Всего\n* [К/Д/А](${this.kda}); [Винрейт](${this.winrate});\n` +
                `* [Урона](${this.damage.goDot()}); [Исцеления](${this.healing.goDot()}); [Защиты](${this.damage_mitigated.goDot()});`,
            en: `# Total\n* [K/D/A](${this.kda}); [Winrate](${this.winrate});\n` +
                `* [Damage](${this.damage.goDot()}); [Healing](${this.healing.goDot()}); [Defense](${this.damage_mitigated.goDot()});`
        }
    }

    stats(type) {
        if (!type) throw {err_msg: {ru: '', en: ''}}
        let text = ''
        for (let typeName in this[type]) {
            const temp = this[type][typeName]
            const typeNameUpCase = typeName.slice(0, 1).toUpperCase() + typeName.slice(1)
            text += `<${typeNameUpCase}>${temp.fullStats}\n`
        }
        return {
            ru: text,
            en: text
        }
    }
}


function getFullMatchInfo(matches) {
    const obj = new _tempGlobal()
    const {champions} = _local
    // console.log(`matches.length: ${matches.length}`)
    matches.forEach(match => {
        // console.log(match, match.Queue)
        const queueName = match.Queue.toLowerCase()
        const queue = queueName.indexOf('ranked') != -1 ? 'ranked' :
            queueName.indexOf('siege') != -1 ? 'siege' :
            queueName.indexOf('deathmatch') != -1 ? 'deathmatch' :
            queueName.indexOf('onslaught') != -1 ? 'onslaught' : false

        const status = match.Win_Status === 'Loss' ? 'lose' : 'win'
        const kills = match.Kills
        const deaths = match.Deaths
        const assists = match.Assists
        const damage = match.Damage
        const healing = match.Healing
        const damage_mitigated = match.Damage_Mitigated

        // глобальные данные
        obj[status]++
        obj.kills += kills
        obj.deaths += deaths
        obj.assists += assists
        obj.damage += damage
        obj.healing += healing
        obj.damage_mitigated += damage_mitigated

        if (queue) { // если катка из очереди которую мы трекаем
            obj.queue[queue][status]++
            obj.queue[queue].kills += kills
            obj.queue[queue].deaths += deaths
            obj.queue[queue].assists += assists
            obj.queue[queue].damage += damage
            obj.queue[queue].healing += healing
            obj.queue[queue].damage_mitigated += damage_mitigated
        }

        const champion = champions.getByName(match.Champion)
        if (champion) { // если есть чемпион
            const role = champion.role.en
            if (role) { // если найдена роль
                obj.roles[role][status]++
                obj.roles[role].kills += kills
                obj.roles[role].deaths += deaths
                obj.roles[role].assists += assists
                obj.roles[role].damage += damage
                obj.roles[role].healing += healing
                obj.roles[role].damage_mitigated += damage_mitigated
            }
        }
    })
    return obj
}