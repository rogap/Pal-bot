/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, utils} = _local
const {sendSite} = utils
const {translate} = config


module.exports = async function(message, settings, command, contentParams) {
    return new Promise(async (resolve, reject) => {
        try {
            const {lang} = settings
            const randomUseragent = require('random-useragent')
            const key = config.steamKey
            const url = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?format=json&appid=444090&key=${key}`
            const response = await sendSite({
                url,
                method: 'GET',
                json: true,
                headers: {
                    'User-Agent': randomUseragent.getRandom()
                }
            })

            const body = response.body
            const count = body.response.player_count

            const sendResult = await message.channel.send({
                ru: `\`\`\`yaml\nОнлайн Steam игроков: ${count}.\`\`\``,
                en: `\`\`\`yaml\nOnline Steam Players: ${count}.\`\`\``
            }[lang])
            return resolve(sendResult)
        } catch(err) {
            if (err && err.err_msg !== undefined) return reject(err)
            return reject({
                err,
                err_msg: {
                    ru: 'Ошибка во время получения статистики стима.',
                    en: 'Error while getting steam statistics.'
                },
                log_msg: 'Ошибка во время получения статистики стима.'
            })
        }
    })
}