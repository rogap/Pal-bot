/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, stegcloak, utils} = _local
const {sendSite} = utils
const randomUseragent = require('random-useragent')
const steamKey = config.steamKey
const steamAPIUrl = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?format=json&appid=444090&key=${steamKey}`


module.exports = function(message, settings, command, contentParams) {
    return new Promise(async (resolve, reject) => {
        try {
            const userId = message.author.id
            const {lang} = settings

            /**
             * contentParams может быть упоминанием друго-го пользователя и тогда там должны будут подставляться его данные
             * но будет записан ID того пользователя! что бы каждый раз получать "свежие" данные
             */

            const nameOrId = contentParams || message.author.id

            const buttonList = command.mainMenu(lang)
            const news = config.news[lang]

            const hideObjInfo = {
                owner: message.author.id,
                params: nameOrId
            }
            const hideInfo = stegcloak.hide(JSON.stringify(hideObjInfo), config.stegPass, config.stegText)

            const getSteamCountPlayers = await getSteamData()
            const steamCountPlayers = isFinite(getSteamCountPlayers) ? parseInt(getSteamCountPlayers) : '-no data-'
            const steamInfo = {
                ru: `Онлайн Steam игроков: ${steamCountPlayers}.`,
                en: `Online Steam Players: ${steamCountPlayers}.`
            }

            const sendResult = await message.channel.send({
                content: `${news}${message.author}\n${steamInfo[lang]}`,
                components: buttonList.get(),
                embed: {
                    description: `||${hideInfo}||`,
                    color: '2F3136'
                }
            })
            return resolve(sendResult)
        } catch(err) {
            if (err && err.err_msg !== undefined) return reject(err)
            return reject({
                err,
                err_msg: {
                    ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                    en: 'Something went wrong... Try again or report this error to the bot creator.'
                },
                log_msg: 'pal.execute'
            })
        }
    })
}


function getSteamData() {
    return new Promise(async (resolve, reject) => {
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

            return resolve(count)
        } catch(err) {
            console.log(err)
            return resolve(err)
        }
    })
}