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
module.exports = function(champions, prop, last_update) {
    try {
        const {lang, timezone, backgrounds} = prop
        const width = 980
        const len = champions.size
        const height = 22 * len / 2 + 85
        const paddingLeft = width / 2 // отступ до второй колонки
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        ctx.font = 'bold 16px GothamSSm_Bold'

        const imgNum = Math.floor(Math.random() * backgrounds.length)
        const img = config.img.backgrounds[backgrounds[imgNum]] // случайный фон
        if ( img ) ctx.drawImage(img, 0, 30, width, height - 30) // рисуем

        // черные полосы сверху и снизу
        ctx.fillStyle = black
        ctx.fillRect(0, 0, width, 30)
        ctx.fillRect(0, height - 30, width, 30)

        ctx.fillStyle = blue
        ctx.fillRect(paddingLeft - 2, 30, 2, height - 60)
        const lastUpdate = last_update.updateToDate(timezone).toText()
        const nextUpdate = last_update.getNextUpdate('getplayer', timezone)
        const champText = `${translate.Champions[lang]}: ${lastUpdate} | ${translate.Update[lang]}: ${nextUpdate}`
        ctx.fillStyle = red
        ctx.fillText(champText, 20, height - 10)

        // рисуем заголовки таблицы
        ctx.fillStyle = blue
        for (let i = 0; i < 2; i++) {
            ctx.fillText(`№`, 10 + paddingLeft * i, 20)
            ctx.fillText(translate.Champion[lang], 45 + paddingLeft * i, 20)
            ctx.fillText(`Lvl`, 160 + paddingLeft * i, 20)
            ctx.fillText(translate.Minutes[lang], 210 + paddingLeft * i, 20)
            ctx.fillText(translate.Winrate[lang], 300 + paddingLeft * i, 20) // дать больше места ..!!!!!!
            ctx.fillText(`KDA`, 440 + paddingLeft * i, 20)
        }

        // рисуем стату персонажей
        champions.each((champion, i) => {
            const j =  Math.round(len / 2) // половина len в большую сторону
            const jj = Math.floor(len / 2) // половина len в меньшую сторону
            const padding = jj < i ? paddingLeft : 0 // распределение лево-право
            const k = jj < i ? i - j : i
            const paddingTop = 22 * k + 50

            ctx.fillStyle = white
            ctx.fillText(champion.name.en, 45 + padding, paddingTop)
            ctx.fillStyle = green
            const exp = champions.parseExp(champion.Worshippers)
            ctx.fillText(exp.lvl, 160 + padding, paddingTop)
            ctx.fillStyle = yellow
            ctx.fillText(champion.Minutes, 210 + padding, paddingTop)
            ctx.fillStyle = blue
            ctx.fillText(`${champion.winrate}%`, 300 + padding, paddingTop)
            ctx.fillStyle = red
            ctx.fillText(`${champion.Wins}/${champion.Losses}`, 345 + padding, paddingTop)
            ctx.fillStyle = orange
            ctx.fillText(champion.kda, 440 + padding, paddingTop)
            ctx.fillText(`${i + 1}.`, 10 + padding, paddingTop)
        })

        return {
            status: true,
            canvas,
            // name: matches[0].playerName,
            // id: matches[0].playerId
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
            log_msg: 'Ошибка функции "st.draw"'
        }
    }
}