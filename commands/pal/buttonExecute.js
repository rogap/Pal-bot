/**
 * функция которая выполняет комнаду и отправляет результат пользователю (кнопки)
 */


const _local = process._local
const {client, config, stegcloak, utils} = _local
const {sendSite} = utils
const randomUseragent = require('random-useragent')
const steamKey = config.steamKey
const steamAPIUrl = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?format=json&appid=444090&key=${steamKey}`


module.exports = function(message, hideObjInfo, customIdList, settings, command, data) {
    return new Promise(async (resolve, reject) => {
        try {
            const {owner, params} = hideObjInfo
            const prop = settings.getProp()
            const {lang} = prop

            const buttonList = command.mainMenu(lang)
            const news = config.news[lang]
            const hideInfo = stegcloak.hide(JSON.stringify(hideObjInfo), config.stegPass, config.stegText)

            const getSteamCountPlayers = await getSteamData()
            const steamCountPlayers = isFinite(getSteamCountPlayers) ? parseInt(getSteamCountPlayers) : '-no data-'
            const steamInfo = {
                ru: `Онлайн Steam игроков: ${steamCountPlayers}.`,
                en: `Online Steam Players: ${steamCountPlayers}.`
            }

            const sendResult = await message.edit({
                content: `${news}<@${owner}>\n${steamInfo[lang]}`,
                components: buttonList.get(),
                embed: {
                    description: `||${hideInfo}||`,
                    color: '2F3136'
                }
            })
            return resolve({status: 1, name: 'pal', message: sendResult})
        } catch(err) {
            if (err && (err.err_msg !== undefined || err.log_msg !== undefined)) return reject(err)
            return reject({
                err,
                err_msg: {
                    ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                    en: 'Something went wrong... Try again or report this error to the bot creator.'
                },
                log_msg: 'pal.buttonExecute'
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