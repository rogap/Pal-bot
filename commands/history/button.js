/**
 * функция которая выполняет комнаду и отправляет результат пользователю (кнопки)
 */


const _local = process._local
const {Discord, client, config, stegcloak} = _local
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (interaction, settings, command, hideObjInfo, branches, values) => {
    try {
        const {champions} = _local
        const userId = interaction.user.id
        const prop = settings.getProp()
        const {lang, params} = prop
        const userNameOrId = hideObjInfo.params
        const typeValue = new Set(branches)

        const prefFull = params?.sh?.full || null
        const nowFull = typeValue.has('full')
        if (nowFull) { // если есть изменения
            await settings.setParams('sh', 'full', !prefFull, userId)
        }

        const prefChampion = params?.sh?.champion || null // чемпион или роль
        const prefChampType = prefChampion ? champions.getByName(prefChampion) ? 'champion' : 'role' : null
        const prefMode = params?.sh?.mode || null
        // console.log(`prefChampion: ${prefChampion}; prefChampType: ${prefChampType}`)

        const pageShow = typeValue.has('page') ? values[0] : 1
        const modifier = typeValue.has('full') ? '-f' : null
        const championRole = typeValue.has('role') ? values[0] : (prefChampType == 'role' ? prefChampion : null)
        const modeType = typeValue.has('queue') ? values[0] : (prefMode || null)
        const championType = typeValue.has('champion') ? values[0] : (prefChampType == 'champion' ? prefChampion : null)

        // console.log(`championRole: ${championRole}; modeType: ${modeType}; championType: ${championType}`)
        if (championType && prefChampion != championType) await settings.setParams('sh', 'champion', championType, userId)
        if (championRole && prefChampion != championRole) await settings.setParams('sh', 'champion', championRole, userId)
        if (modeType && prefMode != modeType) await settings.setParams('sh', 'mode', modeType, userId)

        if (typeValue.has('filters')) {
            // нужно открыть меню с фильтрами
            const buttonsLine_1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('pal')
                .setLabel({en: 'Menu', ru: 'Меню'}[lang])
                .setStyle('DANGER')
                .setEmoji('<:menu:943824092635758632>')
            )
            .addComponents(
                new MessageButton()
                .setCustomId('sh')
                .setLabel({en: 'Back to matches', ru: 'Назад к матчам'}[lang])
                .setStyle('SECONDARY')
                .setEmoji('<:history:943818397009985597>')
            )
            .addComponents(
                new MessageButton()
                .setCustomId('sh_filterchampions')
                .setLabel({en: 'Filter by champion', ru: 'Фильтр по чемпиону'}[lang])
                .setStyle('SECONDARY')
                .setEmoji('<:filter:943854779648581652>')
            )

            const buttonsLine_2 = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                .setCustomId('sh_role')
                .setPlaceholder({en: 'Filter by roles', ru: 'Фильтр по ролям'}[lang])
                .addOptions([
                    {
                        label: {en: 'All', ru: 'Все'}[lang],
                        description: {en: 'Show games only in the specified queue', ru: 'Показать игры только указанного режима'}[lang],
                        value: 'all',
                        emoji: '<:champions:943447650647310356>'
                    },
                    {
                        label: {en: 'Support', ru: 'Поддержка'}[lang],
                        description: {en: 'Show games only for the specified role', ru: 'Показать игры только указанной роли'}[lang],
                        value: 'support',
                        emoji: '<:support:943440471924023328>'
                    },
                    {
                        label: {en: 'Frontline', ru: 'Танк'}[lang],
                        description: {en: 'Show games only for the specified role', ru: 'Показать игры только указанной роли'}[lang],
                        value: 'frontline',
                        emoji: '<:frontline:943440471743672320>'
                    },
                    {
                        label: {en: 'Flanker', ru: 'Фланг'}[lang],
                        description: {en: 'Show games only for the specified role', ru: 'Показать игры только указанной роли'}[lang],
                        value: 'flanker',
                        emoji: '<:flank:943440471823360010>'
                    },
                    {
                        label: {en: 'Damage', ru: 'Урон'}[lang],
                        description: {en: 'Show games only for the specified role', ru: 'Показать игры только указанной роли'}[lang],
                        value: 'damage',
                        emoji: '<:damage:943440471554924554>'
                    }
                ])
            )

            const buttonsLine_3 = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                .setCustomId('sh_queue')
                .setPlaceholder({en: 'Filter by queue', ru: 'Фильтр по режиму'}[lang])
                .addOptions([
                    {
                        label: {en: 'All', ru: 'Все'}[lang],
                        description: {en: 'Show games only in the specified queue', ru: 'Показать игры только указанного режима'}[lang],
                        value: 'all'
                    },
                    {
                        label: {en: 'Ranked', ru: 'Ранкед'}[lang],
                        description: {en: 'Show games only in the specified queue', ru: 'Показать игры только указанного режима'}[lang],
                        value: 'ranked'
                    },
                    {
                        label: {en: 'Siege', ru: 'Осада'}[lang],
                        description: {en: 'Show games only in the specified queue', ru: 'Показать игры только указанного режима'}[lang],
                        value: 'siege'
                    },
                    {
                        label: {en: 'Deathmatch', ru: 'Бой насмерть'}[lang],
                        description: {en: 'Show games only in the specified queue', ru: 'Показать игры только указанного режима'}[lang],
                        value: 'deathmatch'
                    },
                    {
                        label: {en: 'Onslaught', ru: 'Натиск'}[lang],
                        description: {en: 'Show games only in the specified queue', ru: 'Показать игры только указанного режима'}[lang],
                        value: 'onslaught'
                    }
                ])
            )

            const iter =  await interaction.editReply({
                content: {en: 'Filters', ru: 'Фильтры'}[lang],
                components: [buttonsLine_1, buttonsLine_2, buttonsLine_3]
            })

            return {
                status: 2,
                name: 'sh',
                interaction: iter
            }
        } else if (typeValue.has('filterchampions')) {
            // если фильтр по чемпионам
            const buttonsLine_1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('pal')
                .setLabel({en: 'Menu', ru: 'Меню'}[lang])
                .setStyle('DANGER')
                .setEmoji('<:menu:943824092635758632>')
            )
            .addComponents(
                new MessageButton()
                .setCustomId('sh_filters')
                .setLabel({en: 'Back to filters', ru: 'Назад к фильтрам'}[lang])
                .setStyle('SECONDARY')
                .setEmoji('<:filter:943854779648581652>')
            )
            .addComponents(
                new MessageButton()
                .setCustomId('sh')
                .setLabel({en: 'Back to matches', ru: 'Назад к матчам'}[lang])
                .setStyle('SECONDARY')
                .setEmoji('<:history:943818397009985597>')
            )

            const roleIcons = {
                flanker: '<:flank:943440471823360010>',
                damage: '<:damage:943440471554924554>',
                support: '<:support:943440471924023328>',
                frontline: '<:frontline:943440471743672320>'
            }
            const championsFilterOpts = []
            champions.champions.forEach((champion, i) => {
                const count = Math.floor(i / 25) // массив по счету
                if (!(i % 25)) championsFilterOpts.push([]) // новый массив
                championsFilterOpts[count].push({
                    label: {en: champion.Name.en, ru: champion.Name.ru}[lang],
                    description: {en: `Filter by the selected champion`, ru: `Фильтр по выбранному чемпиону`}[lang],
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
                            .setCustomId(`sh_champion_${i}`)
                            .setPlaceholder({en: 'Select a champion', ru: 'Выберите чемпиона'}[lang])
                            .addOptions(optList)
                    )
                )
            })

            const iter =  await interaction.editReply({
                content: {en: 'Filters', ru: 'Фильтры'}[lang],
                components: [buttonsLine_1, ...championsOpt]
            })

            return {
                status: 2,
                name: 'sh',
                interaction: iter
            }
        } else if (typeValue.has('reset')) {
            // сбрасываем фильтры
            await settings.setParams('sh', 'champion', null, userId)
            await settings.setParams('sh', 'mode', null, userId)
            await settings.setParams('sh', 'full', null, userId)

            const exe =  await command.execute(userId, settings, command, userNameOrId, pageShow, null, null, null, null)
            const iter =  await interaction.editReply(exe)

            return {
                status: 1,
                name: 'sh',
                interaction: iter
            }
        }

        // console.log(branches, values)

        const exe =  await command.execute(userId, settings, command, userNameOrId, pageShow, championType, championRole, modeType, modifier)
        const iter =  await interaction.editReply(exe)

        return {
            status: 1,
            name: 'sh',
            interaction: iter
        }
    } catch(err) {
        console.log(JSON.stringify(err))
        if (err && (err.err_msg !== undefined || err.log_msg !== undefined)) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'sh.button'
        }
    }
}