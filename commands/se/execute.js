/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {Discord, config, stegcloak, classes, utils} = _local
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
            .setCustomId('pal')
            .setLabel({en: 'Menu', ru: 'Меню'}[lang])
            .setStyle('DANGER')
        )
        // .addComponents(
        //     new MessageButton()
        //     .setCustomId('se')
        //     .setLabel({en: 'Update', ru: 'Обновить'}[lang])
        //     .setStyle('SUCCESS')
        // )

        const body = await command.getStats(userId, userNameOrId)
        const {searchplayers} = body
        const searchPlayerList = searchplayers.data

        const hideObjInfo = {
            owner: userId,
            params: userNameOrId
        }
        const hideInfo = stegcloak.hide(JSON.stringify(hideObjInfo), config.stegPass, config.stegText)
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
                    description: `||${hideInfo}||`,
                    color: '2F3136'
                }]
            }
        }

        if (!searchPlayerList || !searchPlayerList.length) return {
            content: `${news}${replayOldText}${matchesInfo}${{en: 'No players were found.', ru: 'Игроков не найдено.'}[lang]}`,
            components: [buttonsLine_1],
            embeds: [{
                description: `||${hideInfo}||`,
                color: '2F3136'
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

        const pageOptions = [[]]
        for (let i = 0; i < searchPlayerList.length;) {
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
                        .setCustomId('se_page')
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
                description: `||${hideInfo}||`,
                color: '2F3136'
            }]
        }
    } catch (err) {
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