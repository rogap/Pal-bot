/**
 * функция которая выполняет комнаду и отправляет результат пользователю (кнопки)
 */


const _local = process._local
const {client, config, classes, stegcloak, utils} = _local
const {Button, ButtonsManager} = classes
const {sendToChannel} = utils


module.exports = function(message, hideObjInfo, customIdList, settings, command, data) {
    return new Promise(async (resolve, reject) => {
        try {
            const {owner, params} = hideObjInfo
            const prop = settings.getProp()
            const {lang} = prop

            const body = await command.getStats(owner, params)
            const matches = body.getmatchhistory.json

            const pageModifire = customIdList.find(el => /^ch-page([1-5])$/i.test(el)) || ''
            const pageShow = pageModifire.replace(/^ch-page([1-5])$/i, '$1') || 1
            prop.page = pageShow
            // берем нужную страницу
            const matchesPage = matches.slice((pageShow-1)*10, (pageShow-1)*10+10)

            if (!matchesPage.length) return reject({ // это не должно быть ошибкой!
                err_msg: {
                    ru: 'Матчи игрока не найдены.',
                    en: 'Player matches not found.'
                }
            })

            const draw = command.draw(matchesPage, prop, body.getmatchhistory.last_update) // рисуем
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

            const matchesInfo = customIdList.has('ch-sh_full') ? 
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

            // отправляем картинку на канал сервера что бы потом можно было взять ее url
            // да, да, вот так тупо приходится делать, дискорд не позволяет редачить файлы, но можно редачить ссылки
            const messImg = await sendToChannel(config.chImg, {files: [buffer]})
            const attachment = messImg.attachments.last()
            const hideInfo = stegcloak.hide(JSON.stringify(hideObjInfo), config.stegPass, config.stegText)

            const btn_ch_page_1 = new Button()
            .setLabel({ru: 'Стр 1', en: 'Page 1'}[lang])
            .setStyle(pageShow == 1 ? 3 : 1)
            .setId('sh_ch-page1')
            .setDisabled(matches.length < 1 || pageShow == 1)

            const btn_ch_page_2 = new Button()
            .setLabel({ru: 'Стр 2', en: 'Page 2'}[lang])
            .setStyle(pageShow == 2 ? 3 : 1)
            .setId('sh_ch-page2')
            .setDisabled(matches.length < 10 || pageShow == 2)

            const btn_ch_page_3 = new Button()
            .setLabel({ru: 'Стр 3', en: 'Page 3'}[lang])
            .setStyle(pageShow == 3 ? 3 : 1)
            .setId('sh_ch-page3')
            .setDisabled(matches.length < 20 || pageShow == 3)

            const btn_ch_page_4 = new Button()
            .setLabel({ru: 'Стр 4', en: 'Page 4'}[lang])
            .setStyle(pageShow == 4 ? 3 : 1)
            .setId('sh_ch-page4')
            .setDisabled(matches.length < 30 || pageShow == 4)

            const btn_ch_page_5 = new Button()
            .setLabel({ru: 'Стр 5', en: 'Page 5'}[lang])
            .setStyle(pageShow == 5 ? 3 : 1)
            .setId('sh_ch-page5')
            .setDisabled(matches.length < 40 || pageShow == 5)

            // кнопки для получения статы матча (sm) --->
            const btnMatchesList1 = []
            const btnMatchesList2 = []
            for (let i = 0; i < matchesPage.length; i++) {
                const num = (pageShow - 1) * 10 + i + 1 // матч по счету
                const matchId = matchesPage[i].Match

                const btn_match = new Button()
                .setLabel(`№ ${num}`)
                .setStyle(1)
                .setId(`sm_match${matchId}`)

                if (i < 5) {
                    btnMatchesList1.push(btn_match)
                } else {
                    btnMatchesList2.push(btn_match)
                }
            }
            const btnMatchesList = btnMatchesList2.length ? [btnMatchesList1, btnMatchesList2] : [btnMatchesList1]

            const btn_option_filters = new Button()
            .setLabel({ru: 'Опции/Фильтры', en: 'Options/Filters'}[lang])
            .setStyle(1)
            .setId('sh_filters') // суда не нужно добавлять какая страница выбрана!
            .setDisabled(true)

            const btn_update = new Button()
            .setLabel({ru: 'Обновить', en: 'Update'}[lang])
            .setStyle(3)
            .setId('sh')

            const btn_menu = new Button()
            .setLabel({ru: 'Меню', en: 'Menu'}[lang])
            .setStyle(4)
            .setId('pal')

            const buttonList = new ButtonsManager([
                [btn_ch_page_1, btn_ch_page_2, btn_ch_page_3, btn_ch_page_4, btn_ch_page_5],
                ...btnMatchesList,
                [btn_option_filters, btn_update, btn_menu]
            ])

            const sendResult = await message.edit({
                content: `${news}${replayOldText}<@${owner}>${matchesInfo}`,
                components: buttonList.get(),
                embed: {
                    description: `||${hideInfo}||`,
                    color: '2F3136',
                    image: {
                        url: attachment.url
                    }
                }
            })
            return resolve({status: 1, name: 'sh', message: sendResult})
        } catch(err) {
            if (err && (err.err_msg !== undefined || err.log_msg !== undefined)) return reject(err)
            return reject({
                err,
                err_msg: {
                    ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                    en: 'Something went wrong... Try again or report this error to the bot creator.'
                },
                log_msg: 'sh.buttonExecute'
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