/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {Discord, config, utils} = _local
const {sendToChannel} = utils
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (userId, settings, command, userNameOrId, pageShow, championType, championRole, modeType, modifier) => {
    try {
        // console.log(userNameOrId, pageShow, championType, championRole, modeType, modifier)
        const {champions} = _local
        const prop = settings.getProp()
        const {lang, params} = prop
        const isFull = params?.sh?.full // || modifier == '-f'
        if (userNameOrId && userNameOrId.mentionToId) userNameOrId = userNameOrId.mentionToId()

        if ( /[\`\~\!\@\#\$\%\^\&\*\(\)\=\+\[\]\{\}\;\:\'\"\\\|\?\/\.\>\,\< ]/.test(userNameOrId) ) {
            throw {
                err: 'Введен не корректный ник',
                status: false,
                err_msg: {
                    ru: `Введите корректный Ник или id аккаунта Paladins.`,
                    en: `Enter the correct Nickname or Paladins account id.`
                }
            }
        }

        if (modeType == 'all') modeType = null
        if (championRole == 'all') championRole = championType = null

        const body = await command.getStats(userId, userNameOrId)
        if (!body.status) throw body
        const getmatchhistory = body.getmatchhistory
        const matches = getmatchhistory.data
        const hasMatchesNoFilter = !!matches.length

        const hideInfoParams = (body.playerId || body.playerName || userNameOrId || 'me') + ''
        const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: hideInfoParams, inline: true}]

        // если указан тип матча то фильтруем по нему
        if (modeType) {
            matches.filterRemove(match => {
                return new RegExp(`^([a-z ]+)?${modeType}([a-z ]+)?$`, 'i').test(match.Queue)
            })
        }

        // если указан фильтр по чемпиону то фильтруем
        if (championType) {
            matches.filterRemove(match => {
                return champions.getByName(match.Champion).Name.en.toLowerCase() === championType.toLowerCase()
            })
        }

        // если указана роль чемпиона
        if (championRole) {
            matches.filterRemove(match => {
                return champions.getByName(match.Champion).role.en.toLowerCase() === championRole.toLowerCase()
            })
        }

        // берем нужную страницу
        const matchesPage = matches.slice((pageShow-1)*10, (pageShow-1)*10+10)

        const buttonsLine_1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('menu')
            .setLabel({en: 'Menu', ru: 'Меню'}[lang])
            .setStyle('DANGER')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('history')
            .setLabel({en: 'Refresh', ru: 'Обновить'}[lang])
            .setStyle('SUCCESS')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('history_full')
            .setLabel({en: 'Show more', ru: 'Показать больше'}[lang])
            .setStyle(isFull ? 'SUCCESS' : 'PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('history_filters')
            .setLabel({en: 'Filters', ru: 'Фильтры'}[lang])
            .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('history_reset')
            .setLabel({en: 'Reset filters', ru: 'Сбросить фильтры'}[lang])
            .setStyle('DANGER')
            .setDisabled(!(params?.sh?.full || params?.sh?.mode || params?.sh?.champion))
        )

        if (!matchesPage.length || !matchesPage[0].Queue) {
            return {
                content: {
                    ru: `Матчи игрока не найдены${hasMatchesNoFilter ? ' (из-за наложеных фильтров)' : ''}.`,
                    en: `Player matches not found${hasMatchesNoFilter ? ' (because of the imposed filters)' : ''}.`
                }[lang],
                components: [buttonsLine_1],
                embeds: [{
                    color: '2F3136',
                    fields: hideInfo
                }]
            }
        }

        prop.page = pageShow
        // рисуем
        const draw = await command.draw(matchesPage, prop, getmatchhistory.lastUpdate)
        if (!draw.status) throw draw

        const canvas = draw.canvas
        const buffer = canvas.toBuffer('image/png') // buffer image
        const news = config.news[lang]

        const showOldStatsText = {
            ru: 'Аккаунт скрыт или API временно не работает.\n__**Вам будут показаны данные последнего удачного запроса.**__',
            en: 'The account is hidden or the API is temporarily not working.\n__**You will be shown the details of the last successful request.**__'
        }

        const replayOldText = body.getmatchhistory.old ?
                `${showOldStatsText[lang]}\n` : ''

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

        const matchesInfo = isFull ? 
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

        const pageListOpt = []
        for (let i = 0; i < matches.length; i+=10) {
            const page = (i / 10 + 1) + ''
            pageListOpt.push({
                label: {en: `Page ${page}`, ru: `Страница ${page}`}[lang],
                description: {en: `Shows the history of matches from the specified page`, ru: `Покажет историю матчей с указанной страницы`}[lang],
                value: page
            })
        }

        const buttonsLine_2 = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('history_page')
                .setPlaceholder({en: 'Select a page', ru: 'Выберите страницу'}[lang])
                .addOptions(pageListOpt)
        )

        const matchListOpt = []
        for (let i = 0; i < matchesPage.length && i < 10; i++) {
            const match = matchesPage[i]
            const num = (i+1) + (pageShow-1) * 10
            matchListOpt.push({
                label: {en: `Match number ${num}`, ru: `Матч номер ${num}`}[lang],
                description: {en: 'Shows the statistics of the specified match', ru: 'Покажет статистику указанного матча'}[lang],
                value: match.Match + '_' + num
            })
        }

        const buttonsLine_3 = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('last')
                .setPlaceholder({en: 'Show the match history', ru: 'Показать историю матча'}[lang])
                .addOptions(matchListOpt)
        )

        const statsImg = await sendToChannel(config.chImg, {files: [buffer]})
        const attachment = statsImg.attachments.last()

        return {
            content: `${news}${replayOldText}${matchesInfo}`,
            components: [buttonsLine_1, buttonsLine_2, buttonsLine_3],
            embeds: [{
                color: '2F3136',
                image: {
                    url: attachment.url
                },
                fields: hideInfo
            }]
        }
    } catch(err) {
        console.log(JSON.stringify(err))
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'sh.execute'
        }
    }
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
        const matchQueue = match.Queue || ''
        const queueName = matchQueue.toLowerCase()
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