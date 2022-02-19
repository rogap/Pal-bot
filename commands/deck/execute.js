/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {Discord, config, utils} = _local
const {sendToChannel} = utils
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (userId, settings, command, userNameOrId, champion, number) => {
    try {
        const {champions} = _local
        const prop = settings.getProp()
        const {lang, timezone} = prop
        if (userNameOrId && userNameOrId.mentionToId) userNameOrId = userNameOrId.mentionToId()

        if ( /[\-\_]/.test(userNameOrId) ) throw {
            err: 'Попытка смотреть консольный ак',
            status: false,
            err_msg: {
                ru: `Консольные аккаунты доступны только по ID.\n=\nИспользуйте команду !search для поиска нужного аккаунта.`,
                en: `Console accounts are available only by ID.\n=\nUse the command !search to find the desired account.`
            }
        }

        if ( /[\`\~\!\@\#\$\%\^\&\*\(\)\=\+\[\]\{\}\;\:\'\"\\\|\?\/\.\>\,\< ]/.test(userNameOrId) ) throw {
            err: 'Введен не корректный ник',
            status: false,
            err_msg: {
                ru: `Введите корректный Ник или id аккаунта Paladins.`,
                en: `Enter the correct Nickname or Paladins account id.`
            }
        }

        const body = await command.getStats(userId, userNameOrId)
        // console.log(body)
        const {getplayerloadouts} = body
        const championList = [...new Set( getplayerloadouts.data?.map(lod => lod.ChampionName) || [] )].map(name => champions.getByName(name))
        if (championList[0] == undefined) championList.shift()

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
            .setCustomId('deck')
            .setLabel({en: 'To the selection of champions (Refresh)', ru: 'К выбору чемпионов (Обновить)'}[lang])
            .setStyle('SECONDARY')
            .setEmoji('<:refresh_mix:943814451226873886>')
        )

        const roleIcons = {
            flanker: '<:flank:943440471823360010>',
            damage: '<:damage:943440471554924554>',
            support: '<:support:943440471924023328>',
            frontline: '<:frontline:943440471743672320>'
        }
        const championsFilterOpts = []
        championList.forEach((champion, i) => {
            const count = Math.floor(i / 25) // массив по счету
            if (!(i % 25)) championsFilterOpts.push([]) // новый массив
            championsFilterOpts[count].push({
                label: {en: champion.Name.en, ru: champion.Name.ru}[lang],
                description: {en: `Show the decks of the selected champion`, ru: `Показать колоды выбранного чемпиона`}[lang],
                value: champion.name.en,
                emoji: roleIcons[champion.role.en]
            })
        })
        const championsOpt = []
        championsFilterOpts.forEach((optList, i) => {
            championsOpt.push(
                new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId(`deck_champion_${i}`)
                        .setPlaceholder({en: 'Choose a champion', ru: 'Выбрать чемпиона'}[lang])
                        .addOptions(optList)
                )
            )
        })

        if (!champion) {
            const hideInfoParams = (userNameOrId || 'me') + ''
            const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: hideInfoParams, inline: true}]
            return {
                content: {en: 'Choose a champion.', ru: 'Выберите чемпиона.'}[lang],
                components: [buttonsLine_1, ...championsOpt],
                embeds: [{
                    color: '2F3136',
                    fields: hideInfo
                }]
            }
        }

        // фильтруем оставляя нужного чемпиона
        const loadouts = getplayerloadouts.data.filter(ld => ld.ChampionId == champion.id)

        const hideInfoParams = (body.playerId || body.playerName || userNameOrId || 'me') + ''
        const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: hideInfoParams, inline: true}]

        if (!loadouts.length) return {
            content: {
                ru: `Колоды для ${champion.Name.en} не найдены.`,
                en: `No decks were found for ${champion.Name.en}.`
            }[lang],
            components: [buttonsLine_1, ...championsOpt],
            embeds: [{
                color: '2F3136',
                fields: hideInfo
            }]
        }

        const news = config.news[lang]
        const showOldStatsText = {
            ru: 'Аккаунт скрыт или API временно не работает.\n__**Вам будут показаны данные последнего удачного запроса.**__',
            en: 'The account is hidden or the API is temporarily not working.\n__**You will be shown the details of the last successful request.**__'
        }

        const replayOldText = body.getplayerloadouts.old ?
                `${showOldStatsText[lang]}\n` : ''

        const emojiNumbers = [
            '<:1_:943870598541615114>', '<:2_:943870598789079060>', '<:3_:943870598545801218>',
            '<:4_:943870598667436083>', '<:5_:943870598625497089>', '<:6_:943870598550007829>'
        ]
        // если пользователь не указал колоду, а выбрать нужно ( их > 1)
        const buttonList = []
        if (loadouts.length > 5) {
            const buttonsLine_2 = new MessageActionRow()
            const buttonsLine_3 = new MessageActionRow()
            for (let i = 0; i < loadouts.length; i++) {
                const loadout = loadouts[i]
                const bt = i >= 3 ? buttonsLine_3 : buttonsLine_2
                bt.addComponents(
                    new MessageButton()
                    .setCustomId(`deck_card_${i+1}_${champion.id}`)
                    .setLabel(loadout.DeckName || 'null')
                    .setStyle('SECONDARY')
                    .setEmoji(emojiNumbers[i])
                )
            }
            buttonList.push(buttonsLine_2)
            buttonList.push(buttonsLine_3)
        } else {
            const buttonsLine_2 = new MessageActionRow()
            for (let i = 0; i < loadouts.length; i++) {
                const loadout = loadouts[i]
                buttonsLine_2.addComponents(
                    new MessageButton()
                    .setCustomId(`deck_card_${i+1}_${champion.id}`)
                    .setLabel(loadout.DeckName || 'null')
                    .setStyle('PRIMARY')
                    .setEmoji(emojiNumbers[i])
                )
            }
            buttonList.push(buttonsLine_2)
        }

        if (!number && loadouts.length > 1) {
            const componentsEnd = [buttonsLine_1]
            if (buttonList.length) componentsEnd.push(...buttonList)
            return {
                content: {
                    ru: `Выберите одну из колод:`,
                    en: `Choose one of the decks:`
                }[lang],
                components: componentsEnd,
                embeds: [{
                    color: '2F3136',
                    fields: hideInfo
                }]
            }
        }

        const numberDecks = Math.floor(number) || 1 // выбираем первую колоду если она одна
        const loadout = loadouts[numberDecks - 1] // выбираем колоду
        if (!loadout) {
            const componentsEnd = [buttonsLine_1]
            if (buttonList.length) componentsEnd.push(...buttonList)
            return {
                content: {
                    ru: `Указанной колоды нет, у пользователя ${loadouts.length} колод.\nВыберите одну из колод:`,
                    en: `There is no specified deck, the user has ${loadouts.length} decks.\nChoose one of the decks:`
                }[lang],
                components: componentsEnd,
                embeds: [{
                    color: '2F3136',
                    fields: hideInfo
                }]
            }
        }

        // рисуем
        const draw = await command.draw(loadout, champion, prop, getplayerloadouts.lastUpdate)
        if (!draw.status) throw draw

        const canvas = draw.canvas
        const buffer = canvas.toBuffer('image/png') // buffer image
        const statsImg = await sendToChannel(config.chImg, {files: [buffer]})
        const attachment = statsImg.attachments.last()

        const matchesInfo = `\`\`\`md\n[${body.playerName}](${body.playerId})<${champion?.name?.en||''} ${draw.name}>\`\`\``

        const componentsEnd = [buttonsLine_1]
        if (buttonList.length) componentsEnd.push(...buttonList)
        return {
            content: `${news}${replayOldText}${matchesInfo}`,
            components: componentsEnd,
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
        if (err.err_msg !== undefined) throw err
        // иначе другая ошибка, но поидее такой не должно быть
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'sl.execute'
        }
    }
}