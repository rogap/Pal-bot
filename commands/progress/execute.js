/**
 * функция которая выполняет комнаду принимая данные
 */


const _local = process._local
const {Discord, config, utils, classes} = _local
const {translate} = config
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (userId, settings, command, contentParams, typeValue) => {
    try {
        const {lang, params} = settings
        let nameOrId = contentParams || userId
        const news = config.news[lang]
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

        const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: nameOrId, inline: true}]

        // получаем данные с БД
        const model = _local.models.commandProgress
        const data = await model.find({discordId: settings.id}).lean ()
        if (data.length > 1) console.log('КАКОГОТО ХРЕНА БОЛЕЕ 1 СТАТЫ ЧЕМПИОНОВ (commandProgress)')
        const commandProgress = data[0]

        let replayText = ''
        if (typeValue == 'save') {
            // получем данные от хайрезов
            const body = await command.getStats(userId, nameOrId)
            if (!body.status) throw body
            const {getchampionranks, getplayer, playerId} = body
            const stats = getplayer.data
            const champions = getchampionranks.data

            if (commandProgress) {
                // данные есть, обновляем
                await model.findByIdAndUpdate(commandProgress._id, {
                    accauntId: playerId,
                    stats,
                    champions,
                    date: Date.prototype.utc(),
                })
            } else {
                // данных нет, записываем
                const save = await new model({
                    discordId: settings.id,
                    accauntId: playerId,
                    stats,
                    champions,
                    date: Date.prototype.utc(),
                })
                await save.save()
            }

            replayText = {en: 'The data has been successfully saved.', ru: 'Данные успешно сохранены.'}[lang]
        } else if (typeValue == 'compare') {
            if (!commandProgress) throw {err_msg: {en: 'There is no saved data.', ru: 'Нет сохраненных данных.'}}

            // получем данные от хайрезов
            const body = await command.getStats(userId, commandProgress ? commandProgress.accauntId : nameOrId)
            if (!body.status) throw body
            const {getchampionranks, getplayer, playerId} = body
            const stats = getplayer.data
            const champions = getchampionranks.data

            const {ChampionsStats} = classes
            const oldChampions = new ChampionsStats(commandProgress.champions)
            const newChampions = new ChampionsStats(champions)

            if (oldChampions.error || newChampions.error) throw {
                err_msg: {
                    ru: 'Чемпионы не найдены.',
                    en: 'No champions found.'
                }
            }

            const textChampionsOld = `[${translate.Kills[lang]}](${oldChampions.kills})\n` +
                `[${translate.Deaths[lang]}](${oldChampions.deaths})\n` + 
                `[${translate.Assists[lang]}](${oldChampions.assists})\n` + 
                `[KDA](${oldChampions.kda})\n` + 
                `[${translate.Wins[lang]}](${commandProgress.stats.Wins || oldChampions.wins})\n` + 
                `[${translate.Losses[lang]}](${commandProgress.stats.Losses || oldChampions.losses})\n` + 
                `[${translate.Winrate[lang]}](${oldChampions.winrate}%)\n`

            const maxLen = textChampionsOld.split(/\n/).sort((a, b) => a.length < b.length)[0].length + 4
            const oldStats = textChampionsOld.split(/\n/).map(el => {
                const arr = []
                arr.length = maxLen - el.length
                // arr.fill(' ')
                return el + arr.join(' ')
            })

            const textChampionsNew = `[${oldChampions.kills < newChampions.kills ? '⤴️' : '⤵️'}](${newChampions.kills})\n` + 
            `[${oldChampions.deaths < newChampions.deaths ? '⤴️' : '⤵️'}](${newChampions.deaths})\n` + 
            `[${oldChampions.assists < newChampions.assists ? '⤴️' : '⤵️'}](${newChampions.assists})\n` + 
            `[${oldChampions.kda < newChampions.kda ? '⤴️' : '⤵️'}](${newChampions.kda})\n` + 
            `[${(commandProgress.stats.Wins || oldChampions.wins) < (stats.Wins || newChampions.wins) ? '⤴️' : '⤵️'}](${stats.Wins || newChampions.wins})\n` + 
            `[${(commandProgress.stats.Losses || oldChampions.losses) < (stats.Losses || newChampions.losses) ? '⤴️' : '⤵️'}](${stats.Losses || newChampions.losses})\n` + 
            `[${oldChampions.winrate < newChampions.winrate ? '⤴️' : '⤵️'}](${newChampions.winrate}%)\n`

            const tempNewStats = textChampionsNew.split(/\n/)
            const newStats = oldStats.map((el, i) => el + tempNewStats[i]).join('\n')

            replayText = '```md\n' + 
                `# For player id: ${commandProgress.accauntId}\n\n` + 
                newStats.trim() + `\n\n# Saved: ${new Date(commandProgress.date).toText()} (UTC) ` + '```'
        } else {
            // ничего не делаем
        }

        const buttonsLine_1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('progress_compare')
            .setLabel({en: 'Compare', ru: 'Сравнить'}[lang])
            .setStyle('SUCCESS')
            // .setDisabled(!commandProgress)
        )
        .addComponents(
            new MessageButton()
            .setCustomId('progress_save')
            .setLabel({en: 'Save', ru: 'Сохранить'}[lang])
            .setStyle('SUCCESS')
        )

        const buttonsLine_2 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('menu')
            .setLabel({en: 'Menu', ru: 'Меню'}[lang])
            .setStyle('DANGER')
        )

        return {
            content: `${news}${replayText}`,
            components: [buttonsLine_1, buttonsLine_2],
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
            log_msg: 'progress.execute'
        }
    }
}