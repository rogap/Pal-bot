/**
 * функция которая получает данные статистик и обрабатывает возможные ошибки связанные с этим
 */


const _local = process._local
const {utils, config} = _local
const fs = require('fs')


module.exports = async function(userId, params) {
    try {
        const typeSetting = params.typeFor == 'user' ? 'user_setting.json' : 'guild_setting.json'
        const pathToSettings = path.join(_local.pathMain, 'config', 'json', typeSetting)

        const getSettings = JSON.parse( await fs.readFileSync(pathToSettings) )
        const findSetting = getSettings.find(item => item.id == params.id)
        const setSetting = findSetting || {
            id: params.id,
            lang: config.lang,
            timezone: config.timezone,
            prefix: config.prefix,
            backgrounds: config.backgrounds
        }

        if (params.typeFor == 'user') setSetting.only = setSetting.only || null

        // применяем настройки
        setSetting[params.typeValue] = params.value

        // записываем в файл (сохраняем)
        await fs.writeFileSync(pathToSettings, JSON.stringify(setSetting))

        return {status: true}
    } catch(err) {
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'set.setData'
        }
    }
}