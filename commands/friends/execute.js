/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {Discord, config, classes, utils} = _local
const {sendToChannel} = utils
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (userId, settings, command, nameOrId, pageShow, search) => {
    try {
        const prop = settings.getProp()
        const {lang, params} = prop
        const isBlockUsers = params?.sf?.block
        const news = config.news[lang]
        const body = await command.getStats(userId, nameOrId)
        const {getfriends} = body
        const accaunts = getfriends.data || []
        if (nameOrId && nameOrId.mentionToId) nameOrId = nameOrId.mentionToId()

        if ( /[\`\~\!\@\#\$\%\^\&\*\(\)\=\+\[\]\{\}\;\:\'\"\\\|\?\/\.\>\,\< ]/.test(nameOrId) ) {
            throw {
                err: 'Введен не корректный ник',
                status: false,
                err_msg: {
                    ru: `Введите корректный Ник или id аккаунта Paladins.`,
                    en: `Enter the correct Nickname or Paladins account id.`
                }
            }
        }

        const friends = accaunts.filter(user => {
            const name = user.name || ''
            const id = user.player_id || ''
            // с учетом сортировки, если есть
            const reg = new RegExp(`${search}`, 'i')
            const typeShow = isBlockUsers ? 'Blocked' : 'Friend'
            if (search) return user.status === typeShow && (name.match(reg) || (id+'').match(search))
            return user.status === typeShow // без учета сортирвоки
        })

        const hideInfoParams = (body.playerId || body.playerName || nameOrId || 'me') + ''
        const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: hideInfoParams, inline: true}]

        const buttonsLine_1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('menu')
            .setLabel({en: 'Menu', ru: 'Меню'}[lang])
            .setStyle('DANGER')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('friends')
            .setLabel({en: 'Update', ru: 'Обновить'}[lang])
            .setStyle('SUCCESS')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('friends_block')
            .setLabel((!isBlockUsers ? 
                {en: 'Show blocked users', ru: 'Показать заблокированных'} : 
                {en: 'Show friends', ru: 'Показать друзей'})[lang])
            .setStyle('PRIMARY')
        )

        if (!friends.length) {
            return {
                content: {
                    ru: `Друзья не найдены.`,
                    en: `No friends found.`
                }[lang],
                components: [buttonsLine_1],
                embeds: [{
                    color: '2F3136',
                    fields: hideInfo
                }]
            }
        }

        const pageCount = Math.ceil( friends.length / 20 )
        if ( pageCount < pageShow ) {
            return {
                content: {
                    ru: `У пользователя ${pageCount} страниц.`,
                    en: `The user has ${pageCount} pages.`
                }[lang],
                components: [buttonsLine_1],
                embeds: [{
                    color: '2F3136',
                    fields: hideInfo
                }]
            }
        }

        let answerText = {
            ru: `\`\`\`md\n# Всего ${friends.length} друзей (${pageCount} страниц)\n[id](name)<portal flag>\n> >\n`,
            en: `\`\`\`md\n# Total ${friends.length} friends (${pageCount} pages)\n[id](name)<portal flag>\n> >\n`
        }[lang]
        for (let i = 0 + (pageShow - 1) * 20; friends.length > i && i < 20 * pageShow; i++) {
            const user = friends[i]
            const portal = config.platforms[user.portal_id] || user.portal_id
            const flag = user.friend_flags == 1 ? {ru: 'в друзьях', en: 'in friends'}[lang] :
                user.friend_flags == 2 ? {ru: 'исходящая заявка', en: 'outgoing request'}[lang] : user.friend_flags

            answerText += `${i + 1}. [${user.player_id}](${user.name})<${portal} ${flag}>\n`
        }

        if (friends.length > 20) {
            answerText += {
                ru: `> >\n# Показаны не все друзья. Страница ${pageShow} из ${pageCount}\n`,
                en: `> >\n# Not all friends are shown. Page ${pageShow} of ${pageCount}\n`
            }[lang]
        }
        // const time = getfriends.last_update.updateToDate(timezone).toText()
        // const timeUpdate = getfriends.last_update.getNextUpdate('getfriends', timezone)
        // answerText += {
        //     ru: `> >\r\n* Друзья: ${time} | Обновится: ${timeUpdate} | timezone: ${timezone}`,
        //     en: `> >\r\n* Friends: ${time} | Updated: ${timeUpdate} | timezone: ${timezone}`
        // }[lang]
        answerText += '```'

        const pageOptions = [[]]
        for (let i = 0; i < friends.length;) {
            i += 20
            const j = (i / 20) + ''
            if (j < 25) {
                pageOptions[0].push({
                    label: {en: `Page ${j}`, ru: `Страница ${j}`}[lang],
                    description: {en: `Go to the specified page`, ru: `Перейти на указанную страницу`}[lang],
                    value: j
                })
            } else {
                if (j == 25) pageOptions.push([])
                pageOptions[1].push({
                    label: {en: `Page ${j}`, ru: `Страница ${j}`}[lang],
                    description: {en: `Go to the specified page`, ru: `Перейти на указанную страницу`}[lang],
                    value: j
                })
            }
        }

        const pageOpt = []
        for (let i = 0; i < pageOptions.length; i++) {
            const opt = pageOptions[i]
            pageOpt.push(
                new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('sf_page')
                        .setPlaceholder({en: 'Go to the page...', ru: 'Перейти на страницу...'}[lang])
                        .addOptions(opt)
                )
            )
        }

        return {
            content: `${news}${answerText}`,
            components: [buttonsLine_1, ...pageOpt],
            embeds: [{
                color: '2F3136',
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
            log_msg: 'sf.execute'
        }
    }
}