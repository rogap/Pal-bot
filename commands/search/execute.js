/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {Discord, config, classes, utils} = _local
const {sendToChannel} = utils
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (userId, settings, command, userNameOrId, pageShow=1) => {
    try {
        const prop = settings.getProp()
        const {lang} = prop
        const news = config.news[lang]
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

        if (!isFinite(pageShow) || pageShow > 1000) return {
            content: {
                en: 'Invalid page value specified.',
                ru: 'Указано не корректное значение страницы.'
            }[lang]
        }

        if (!userNameOrId || 
            !/^[^\d\<\>\!\@\#\$\%\^\&\*\(\)\+\=\\\|\/\?\.\,\'\"\`\;\:][^\<\>\!\@\#\$\%\^\&\*\(\)\+\=\\\|\/\?\.\,\'\"\`\;\:]+$/.test(userNameOrId)
        ) return {
            content: {en: 'An invalid name was entered for the search.', ru: 'Введено не корректное имя для поиска.'}[lang]
        }

        const buttonsLine_1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('menu')
            .setLabel({en: 'Menu', ru: 'Меню'}[lang])
            .setStyle('DANGER')
            .setEmoji('<:menu:943824092635758632>')
        )

        const body = await command.getStats(userId, userNameOrId)
        const {searchplayers} = body
        const searchPlayerList = searchplayers.data

        const hideInfoParams = (userNameOrId|| 'me') + ''
        const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: hideInfoParams, inline: true}]
        const showOldStatsText = {
            ru: 'Аккаунт скрыт или API временно не работает.\n__**Вам будут показаны данные последнего удачного запроса.**__',
            en: 'The account is hidden or the API is temporarily not working.\n__**You will be shown the details of the last successful request.**__'
        }

        const replayOldText = body.searchplayers.old ?
                `${showOldStatsText[lang]}\n` : ''

        const matchesInfo = `\`\`\`md\n[search](${userNameOrId})\`\`\``
        const pageCount = Math.ceil( searchPlayerList.length / 20 )

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

        if (!searchPlayerList || !searchPlayerList.length) return {
            content: `${news}${replayOldText}${matchesInfo}${{en: 'No players were found.', ru: 'Игроков не найдено.'}[lang]}`,
            components: [buttonsLine_1],
            embeds: [{
                color: '2F3136',
                fields: hideInfo
            }]
        }

        let repText = '```md\n[Name](hz_name)[player_id](portal)\n> >\n'
        for (let i = 0 + (pageShow - 1) * 20; i < searchPlayerList.length && i < 20 * pageShow; i++) {
            const user = searchPlayerList[i]
            const portal = config.platforms[user.portal_id] || user.portal_id
            repText += `${i + 1}. [${user.Name}](${user.hz_player_name}) [${user.player_id}](${portal})\n`
        }

        if (searchPlayerList.length > 20) {
            repText += {
                ru: `> >\n# Показаны не все игроки. Страница ${pageShow} из ${pageCount}\n`,
                en: `> >\n# Not all players are shown. Page ${pageShow} of ${pageCount}\n`
            }[lang]
        }
        repText += '```'

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
        for (let i = 0; i < searchPlayerList.length;) {
            i += 20
            const j = (i / 20) + ''
            if (j < 25) {
                pageOptions[0].push({
                    label: {en: `Page`, ru: `Страница`}[lang],
                    // description: {en: `Go to the specified page`, ru: `Перейти на указанную страницу`}[lang],
                    value: j,
                    emoji: emojiNumbers[j - 1]
                })
            } else {
                if (j == 25) pageOptions.push([])
                pageOptions[1].push({
                    label: {en: `Page`, ru: `Страница`}[lang],
                    // description: {en: `Go to the specified page`, ru: `Перейти на указанную страницу`}[lang],
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
                        .setCustomId(`se_page_${i}`)
                        .setPlaceholder({en: 'Go to the page...', ru: 'Перейти на страницу...'}[lang])
                        .addOptions(opt)
                )
            )
        }

        if (pageOpt.length > 3) pageOpt.splice(3)

        return {
            content: `${news}${replayOldText}${matchesInfo}${repText}`,
            components: [buttonsLine_1, ...pageOpt],
            embeds: [{
                color: '2F3136',
                fields: hideInfo
            }]
        }
    } catch (err) {
        console.log(JSON.stringify(err))
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Ошибка при формировании ответа. Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Error when forming the response. Try again or report this error to the bot creator.'
            },
            log_msg: 'Какая-то непредвиденная ошибка поидее'
        }
    }
}