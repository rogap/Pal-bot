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

        const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: nameOrId, inline: true}]

        const steamCountPlayers = await getSteamData()
        const steamInfo = {
            ru: `Онлайн Steam игроков: ${steamCountPlayers}.`,
            en: `Online Steam Players: ${steamCountPlayers}.`
        }

        const buttonsLine_1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('setting')
            .setLabel({en: 'Options', ru: 'Настройки'}[lang])
            .setStyle('SECONDARY')
            .setEmoji('🛠️')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('menu')
            .setLabel({en: 'Refresh', ru: 'Обновить'}[lang])
            .setStyle('SUCCESS')
            .setEmoji('<:refresh_mix:943814451226873886>')
        )
        // .addComponents(
        //     new MessageButton()
        //     .setURL(config.siteUrl)
        //     .setLabel({en: 'Site Stats', ru: 'Сайт статистики'}[lang])
        //     .setStyle('LINK')
        //     .setDisabled(true)
        // )
        .addComponents(
            new MessageButton()
            .setCustomId('help')
            .setLabel({en: 'Help', ru: 'Помощь'}[lang])
            .setStyle('DANGER')
            .setEmoji('❔')
        )
        .addComponents(
            new MessageButton()
            .setURL(config.discordInvate)
            .setLabel({en: 'Server link', ru: 'Ссылка на сервер'}[lang])
            .setStyle('LINK')
        )

        const consoleStats = params?.ss?.console || false
        const buttonsLine_2 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('stats' + (consoleStats ? '_console' : ''))
            .setLabel({en: 'Account stats', ru: 'Статистика аккаунта'}[lang])
            .setStyle('SECONDARY')
            .setEmoji('<:stats:943819417131839501>')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('current')
            .setLabel({en: 'Current', ru: 'Статус в игре'}[lang])
            .setStyle('SECONDARY')
            .setEmoji('<:current:943440471680753694>')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('history')
            .setLabel({en: 'History', ru: 'История'}[lang])
            .setStyle('SECONDARY')
            .setEmoji('<:history:943818397009985597>')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('last')
            .setLabel({en: 'Last match', ru: 'Последний матч'}[lang])
            .setStyle('SECONDARY')
            .setEmoji('<:match:943925118286069781>')
        )

        const buttonsLine_3 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('champions')
            .setLabel({en: 'Champions', ru: 'Чемпионы'}[lang])
            .setStyle('SECONDARY')
            .setEmoji('<:champions:943447650647310356>')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('champion')
            .setLabel({en: 'Select champion', ru: 'Выбрать чемпиона'}[lang])
            .setStyle('SECONDARY')
            .setEmoji('<:champion:943440471601061888>')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('random')
            .setLabel({en: 'Random champion', ru: 'Случайный чемпион'}[lang])
            .setStyle('SECONDARY')
            .setDisabled(true)
        )

        const buttonsLine_4 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('friends')
            .setLabel({en: 'Friends', ru: 'Друзья'}[lang])
            .setStyle('SECONDARY')
            .setEmoji('<:friends:943449946428960798>')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('deck')
            .setLabel({en: 'Decks', ru: 'Колоды'}[lang])
            .setStyle('SECONDARY')
            .setEmoji('<:cards:943453491907661845>')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('progress')
            .setLabel({en: 'Progress', ru: 'Прогресс'}[lang])
            .setStyle('SECONDARY')
        )

        return {
            content: `${news}\n${steamInfo[lang]}`,
            components: [buttonsLine_1, buttonsLine_2, buttonsLine_3, buttonsLine_4],
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
        console.log(JSON.stringify(err))
        return '-err-'
    }
}