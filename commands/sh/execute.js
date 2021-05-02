/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, classes} = _local
const {translate} = config


module.exports = function(message, settings, command, contentParams) {
    return new Promise((resolve, reject) => {
        const {champions} = _local
        const userId = message.author.id
        const prop = settings.getProp()
        const {lang} = prop

        // Queue	"Team Deathmatch" | Queue	"Onslaught"
        const gameModeTypes = {
            ranked: ['ranked', 'ранкед'],
            siege: ['siege', 'казуал', 'обычка'],
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
        const [nameOrId, champOrType1, champOrType2, pageOrNot] = params // champOrType может быть любой порядок

        // тип матча
        const modeType = gameModeTypes.find((modeName, mode) => {
            return mode.find(type => type === champOrType1 || type === champOrType2) ? modeName : false
        })
        // имя чемпиона
        const championType = champions.getByAliases(champOrType1 || '') || champions.getByAliases(champOrType2 || '')
        // роль чемпиона
        const championRole = championRoles.find((roleName, roles) => {
            return roles.find(role => role === champOrType1 || role === champOrType2) ? roleName : false
        })
        const pageNum = isFinite(pageOrNot) ? pageOrNot :
            isFinite(champOrType2) ? champOrType2 :
            isFinite(champOrType1) ? champOrType1 : 1
        // страница которую будем отображать
        const page = pageNum < 1 ? 1 : pageNum > 5 ? 5 : Math.floor(pageNum)
        prop.page = page

        // console.log(`modeType: ${modeType}; championRole: ${championRole}; page: ${page}`)
        command.getStats(userId, nameOrId)
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
            const matchesPage = matches.slice((page-1)*10, (page-1)*10+10)

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
            // console.log(matchesIds)
            const matchesInfo = `\`\`\`md\n* <For>[${draw.name}](${draw.id})\n\n` +
                `[${translate.Matches[lang]}](${(page-1)*10}-${matchesIds.length*(page-1)+10}) [${translate.Total[lang]}](${matches.length})` +
                `\n# ID ${{ru: 'матчей', en: 'matches'}[lang]}:\n` +
                matchesIds.map((id, i) => `[${i+1+(page-1)*10}](${id})`).join('; ') + ';```'

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
                    ru: '',
                    en: ''
                },
                content: message.content,
                params: contentParams
            })
        })
    })
}