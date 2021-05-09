/**
 * Скрипт который только рисует указанную инфу в canvas и возвращает ее или ошибку
 */


const _local = process._local
const {config, classes} = _local
const {translate} = config
const {createCanvas } = require('canvas')
const {red, white, blue, black, purple, orange, green, yellow} = config.colors


/**
 * 
 * @param {*} body - 
 * @param {Object} prop - 
 */
module.exports = function(champion, prop, last_update) {
    try {
        const {lang, timezone, backgrounds} = prop
        const width = 600
        const height = 290
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        ctx.font = 'bold 16px GothamSSm_Bold'

        const imgNum = Math.floor(Math.random() * backgrounds.length)
        const img = config.img.backgrounds[backgrounds[imgNum]] // случайный фон
        if ( img ) ctx.drawImage(img, 0, 0, width, height - 30) // рисуем

        ctx.fillStyle = black
        ctx.fillRect(0, height - 30, width, 30)
        const lastUpdate = last_update.updateToDate(timezone).toText()
        const nextUpdate = last_update.getNextUpdate('getchampionranks', timezone)
        const champText = `${translate.Champions[lang]}: ${lastUpdate} | ${translate.Update[lang]}: ${nextUpdate}`
        ctx.fillStyle = red
        ctx.fillText(champText, 10, height - 10)

        ctx.fillStyle = white
        ctx.fillText(`${translate.Role[lang]}: ${champion.role[lang]}`, 200, 230)
        ctx.fillText(`${translate.Title[lang]}: ${champion.title[lang]}`, 200, 250)
        const lastPlayed = new Date(champion.LastPlayed).addHours(timezone).toText()
        ctx.fillText(`${{ru: 'Последняя игра', en: 'Last game'}[lang]}: ${lastPlayed}`, 200, 40 + 5)
        ctx.fillText(`${{ru: 'Сыграно минут', en: 'Played for about minutes'}[lang]}: ${champion.Minutes}`, 200, 60 + 5)

        const icon = champion.icon
        if (icon) ctx.drawImage(icon, 10, 30, 180, 180)
        ctx.fillStyle = green
        ctx.fillText(`${translate.Health[lang]}: ${champion.health}`, 10, 230)
        ctx.fillText(`${translate.Kills[lang]}: ${champion.Kills}`, 200, 120 + 5)
        ctx.fillText(`${translate.Wins[lang]}: ${champion.Wins}`, 400, 120 + 5)
        ctx.fillText(`${translate.Level[lang]}: ${champion.exp.lvl}`, 200, 80 + 5)

        ctx.fillStyle = blue
        ctx.fillText(`${translate.Speed[lang]}: ${champion.speed}`, 10, 250)
        ctx.fillText(`${translate.Assists[lang]}: ${champion.Assists}`, 200, 160 + 5)
        ctx.fillText(`${translate.Winrate[lang]}: ${champion.winrate}%`, 400, 160 + 5)

        ctx.fillStyle = red
        ctx.fillText(`${translate.Deaths[lang]}: ${champion.Deaths}`, 200, 140 + 5)
        ctx.fillText(`${translate.Loss[lang]}: ${champion.Losses}`, 400, 140 + 5)

        ctx.fillStyle = orange
        ctx.textAlign = "center"
        ctx.fillText(champion.name[lang], 100, 20)
        ctx.textAlign = "start"
        // ctx.fillText(`ID игрока: ${playerId}`, 250, 20)
        ctx.fillText(`KDA: ${champion.kda}`, 200, 180 + 5)

        return {
            status: true,
            canvas
        }
    } catch(err) {
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        throw {
            status: false,
            err,
            err_msg: {
                ru: '',
                en: ''
            },
            log_msg: 'Ошибка функции "sc.draw"'
        }
    }
}