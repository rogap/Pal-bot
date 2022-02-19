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

        if ( /[\-\_]/.test(nameOrId) ) throw {
            err: 'Попытка смотреть консольный ак',
            status: false,
            err_msg: {
                ru: `Консольные аккаунты доступны только по ID.\n=\nИспользуйте команду !search для поиска нужного аккаунта.`,
                en: `Console accounts are available only by ID.\n=\nUse the command !search to find the desired account.`
            }
        }

        if ( /[\`\~\!\@\#\$\%\^\&\*\(\)\=\+\[\]\{\}\;\:\'\"\\\|\?\/\.\>\,\< ]/.test(nameOrId) ) throw {
            err: 'Введен не корректный ник',
            status: false,
            err_msg: {
                ru: `Введите корректный Ник или id аккаунта Paladins.`,
                en: `Enter the correct Nickname or Paladins account id.`
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
            .setEmoji('<:menu:943824092635758632>')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('friends')
            .setLabel({en: 'Update', ru: 'Обновить'}[lang])
            .setStyle('SUCCESS')
            .setEmoji('<:refresh_mix:943814451226873886>')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('friends_block')
            .setLabel((!isBlockUsers ? 
                {en: 'Show blocked users', ru: 'Показать заблокированных'} : 
                {en: 'Show friends', ru: 'Показать друзей'})[lang])
            .setStyle('SECONDARY')
            .setEmoji(isBlockUsers ? '<:friends:943449946428960798>' : '<:friends_block:943841179693367296>')
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

        const emojiNumbers = [
            '<:1_:943870598541615114>', '<:2_:943870598789079060>', '<:3_:943870598545801218>',
            '<:4_:943870598667436083>', '<:5_:943870598625497089>', '<:6_:943870598550007829>',
            '<:7_:943870598935883776>', '<:8_:943870598470332487>', '<:9_:943870599023960154>',
            '<:10:943870599040729098>', '<:11:943915152158384128>', '<:12:943915152116433007>',
            '<:13:943915152573624380>', '<:14:943915152523284531>', '<:15:943915152108044298>',
            '<:16:943915152183554168>', '<:17:943915152535863326>', '<:18:943915152430989382>',
            '<:19:943915152489717770>', '<:20:943915152674291722>', '<:21:943915207569342565>',
            '<:22:943915209024761906>', '<:23:943915209431609394>', '<:24:943915209725210665>',
            '<:25:943915209658093648>', '<:26:943915209611964446>', '<:27:943915209263808613>',
            '<:28:943915209704243210>', '<:29:943915209704222740>', '<:30:943915209502900334>',
            '<:31:943915209255436350>', '<:32:943915209221894177>', '<:33:943915209649709056>',
            '<:34:943915209343500400>', '<:35:943915209200898091>', '<:36:943915209679077526>',
            '<:37:943915209888763914>', '<:38:943915209964261426>', '<:39:943915209851027466>',
            '<:40:943915209511305287>', '<:41:943915209603567628>', '<:42:943915209859411999>',
            '<:43:943915209691643965>', '<:44:943915209733578812>', '<:45:943915209809100890>',
            '<:46:943915209486118944>', '<:47:943915209741959188>', '<:48:943915209792319498>',
            '<:49:943915209821675591>', '<:50:943915209788100708>'
        ]
        const pageOptions = [[]]
        for (let i = 0; i < friends.length;) {
            i += 20
            const j = (i / 20) + ''
            if (j < 25) {
                pageOptions[0].push({
                    label: {en: `Page`, ru: `Страница`}[lang],
                    // description: {en: `Go to page ${j}`, ru: `Перейти на страницу ${j}`}[lang],
                    value: j,
                    emoji: emojiNumbers[j - 1]
                })
            } else {
                if (j == 25) pageOptions.push([])
                pageOptions[1].push({
                    label: {en: `Page`, ru: `Страница`}[lang],
                    // description: {en: `Go to page ${j}`, ru: `Перейти на страницу ${j}`}[lang],
                    value: j,
                    emoji: emojiNumbers[j - 1]
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
                        .setCustomId(`friends_page_${i}`)
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