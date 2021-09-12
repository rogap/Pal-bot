/**
 * функция которая выполняет комнаду принимая данные
 */


const _local = process._local
const {Discord, config, utils} = _local
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord
const {sendSite} = utils
const randomUseragent = require('random-useragent')
const steamKey = config.steamKey
const steamAPIUrl = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?format=json&appid=444090&key=${steamKey}`


module.exports = async (userId, settings, contentParams) => {
    try {
        // const userId = message.author.id
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

        const steamCountPlayers = await getSteamData()
        const steamInfo = {
            ru: `Онлайн Steam игроков: ${steamCountPlayers}.`,
            en: `Online Steam Players: ${steamCountPlayers}.`
        }

        const buttonsLine_1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('set')
            .setLabel({en: 'Options', ru: 'Настройки'}[lang])
            .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('pal')
            .setLabel({en: 'Update', ru: 'Обновить'}[lang])
            .setStyle('SUCCESS')
        )
        .addComponents(
            new MessageButton()
            .setURL(config.siteUrl)
            .setLabel({en: 'Site Stats', ru: 'Сайт статистики'}[lang])
            .setStyle('LINK')
            .setDisabled(true)
        )
        .addComponents(
            new MessageButton()
            .setURL(config.discordInvate)
            .setLabel({en: 'Help', ru: 'Помощь'}[lang])
            .setStyle('LINK')
        )

        const consoleStats = params?.ss?.console || false
        const buttonsLine_2 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('ss' + (consoleStats ? '_console' : ''))
            .setLabel({en: 'Account stats', ru: 'Статистика аккаунта'}[lang])
            .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('sp')
            .setLabel({en: 'Status in game', ru: 'Статус в игре'}[lang])
            .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('sf')
            .setLabel({en: 'Friends', ru: 'Друзья'}[lang])
            .setStyle('PRIMARY')
        )

        const buttonsLine_3 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('sh')
            .setLabel({en: 'History', ru: 'История'}[lang])
            .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('st')
            .setLabel({en: 'Champions', ru: 'Чемпионы'}[lang])
            .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('sl')
            .setLabel({en: 'Decks', ru: 'Колоды'}[lang])
            .setStyle('PRIMARY')
        )

        return {
            content: `${news}\n${steamInfo[lang]}`,
            components: [buttonsLine_1, buttonsLine_2, buttonsLine_3],
            embeds: [{
                color: '2F3136',
                fields: hideInfo
            }]
        }
    } catch(err) {
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'pal.execute'
        }
    }
}


async function getSteamData() {
    try {
        const steamData = await sendSite({
            url: steamAPIUrl,
            method: 'GET',
            json: true,
            headers: {
                'User-Agent': randomUseragent.getRandom()
            }
        })
        const body = steamData.body
        const count = body.response.player_count

        return count
    } catch(err) {
        console.log(err)
        return '-err-'
    }
}