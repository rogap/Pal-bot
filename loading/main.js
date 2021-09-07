/**
 * основной файл-скрипт для загрузки всех в этой папке:
 * загружает все картинки, шрифты, данные с сайта
 */


const _local = process._local
const path = require('path')
const pathToFont = path.join(__dirname, '..', 'font', 'GothamSSm-Bold.otf')
const {registerFont} = require('canvas')
registerFont(pathToFont, { family: 'GothamSSm_Bold' }) // регистрируем шрифт


module.exports = (async () => {
    try {
    const avatars = await require('./avatars.js')
    if (!avatars.status) throw avatars

    const backgrounds = await require('./backgrounds.js')
    if (!backgrounds.status) throw backgrounds

    const cardFrames = await require('./cardFrames.js')
    if (!cardFrames.status) throw cardFrames

    const divisions = await require('./divisions.js')
    if (!divisions.status) throw divisions

    const items = await require('./items.js')
    if (!items.status) throw items

    const maps = await require('./maps.js')
    if (!maps.status) throw maps

    const champions = await require('./champions.js')
    if (!champions.status) throw champions

    const championCards = await require('./championCards.js')
    if (!championCards.status) throw championCards
    
    const settings = await require('./settings.js')
    if (!settings.status) throw settings

    // загрузка данных из json-файла --->

    // const imp1 = await _local.classes.SettingsManager.import(path.join(_local.path, 'config', 'json', 'user_setting.json'), 'user')
    // console.log(imp1)

    // const imp2 = await _local.classes.SettingsManager.import(path.join(_local.path, 'config', 'json', 'guild_setting.json'), 'guild')
    // console.log(imp2)

    // const botMe = await require('fs').readFileSync(path.join(_local.path, 'config', 'json', 'bot_me.json'))
    // const botMeData = JSON.parse(botMe)
    // for (const userID in botMeData) {
    //     const data = botMeData[userID]
    //     const newData = {id: userID}
    //     if (data.name) newData.name = data.name
    //     if (data.id) newData.playerId = +data.id

    //     const save = await new _local.models.usersNicknames(newData)
    //     await save.save()
    // }
    // console.log(111)
    return {status: true}
    } catch(err) {
        console.log('\n ~ Ошибка загрузки данных ~\n')
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        return {
            status: false,
            err
        }
    }
})();