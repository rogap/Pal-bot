/**
 * Скрипт который только рисует указанную инфу в canvas и возвращает ее или ошибку
 */


const _local = process._local
const {config} = _local
const {translate} = config
const {createCanvas, loadImage} = require('canvas')
const {red, white, blue, black, purple, orange, green, yellow} = config.colors


/**
 * 
 * @param {*} body - 
 * @param {Object} prop - 
 */
module.exports = async (matches, prop, last_update) => {
    try {
        const width = 980
        const height = 580
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        prop.width = width
        prop.height = height

        // рисуем дефолтные
        const resDefault = await drawDefault(ctx, last_update, prop)
        if (!resDefault.status) throw resDefault

        const resTdable = await drawTable(ctx, matches, prop)
        if (!resTdable.status) throw resTdable

        return {
            status: true,
            canvas,
            name: matches[0].playerName,
            id: matches[0].playerId
        }
    } catch(err) {
        console.log(JSON.stringify(err))
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        throw {
            status: false,
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'Ошибка функции "sh.draw"'
        }
    }
}


async function drawDefault(ctx, last_update, prop) {
    try {
        const {lang, timezone, backgrounds, width, height} = prop
        const imgNum = Math.floor(Math.random() * backgrounds.length)
        const imgSrc = config.img.backgrounds[backgrounds[imgNum]] // случайный фон
        const img = await loadImage(imgSrc).catch(console.log)
        if ( img ) ctx.drawImage(img, 0, 30, width, height - 50) // рисуем

        ctx.fillStyle = black
        ctx.fillRect(0, 0, width, 30) // прямоугольник сверху
        ctx.fillRect(0, height - 30, width, 30) // прямоугольник снизу

        ctx.textAlign = 'end'
        ctx.font = 'bold 16px GothamSSm_Bold'
        ctx.fillStyle = red

        const propsText = ctx.measureText(`${translate.Timezone[lang]}: ${timezone}`)
        ctx.fillText(`${translate.Timezone[lang]}: ${timezone}`, width - 20, height - 24)

        ctx.fillStyle = white
        ctx.fillRect(10, height - 30, width - propsText.width - 40, 1)
        ctx.fillRect(width - propsText.width - 31, height - 44, 1, 14) // полоса вверх
        ctx.fillRect(width - propsText.width - 31, height - 29, 1, 14) // полоса вниз
        ctx.fillRect(width - propsText.width - 30, height - 44, propsText.width + 20, 1) // продолжение полосы сверху
        ctx.fillRect(width - propsText.width - 30, height - 16, propsText.width + 20, 1) // продолжение полосы снизу
        ctx.textAlign = 'start'
        ctx.fillStyle = red

        // const lastUpdateMatches = last_update.updateToDate(timezone).toText()
        // const nextUpdateMatches = last_update.getNextUpdate('getmatchhistory', timezone)
        // const matchesText = `${translate.Matchhistory[lang]}: ${lastUpdateMatches} | ${translate.Update[lang]}: ${nextUpdateMatches}`
        // ctx.fillText(matchesText, 20,  height - 10)

        return {status: true}
    } catch(err) {
        console.log(JSON.stringify(err))
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        throw {
            status: false,
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'Ошибка функции "sh.drawDefault"'
        }
    }
}


async function drawTable(ctx, matches, prop) {
    try {
        const {champions} = _local
        const {lang, timezone, page} = prop
        // получаем картинки чемпионов с истории и рисуем
        const positionY = 30
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i]
            const champion = champions.getByName(match.Champion)
            if (champion) {
                const imgSrc = champion.icon
                const img = await loadImage(imgSrc).catch(console.log)
                const y = positionY + 52 * i
                if (img) ctx.drawImage(img, 40, y, 50, 50)
            }
        }

        const pos = [10, 100, 280, 355, 450, 530, 620, 710, 800, 890]
        ctx.fillStyle = blue

        const tableNames = {
            ru: ['№', 'Дата/Статус', 'Время', 'Режим', 'У цели', 'К/Д/А', 'Урон', 'Защита', 'Лечение', 'Кредиты'],
            en: ['№', 'Date/Status', 'Time', 'Queue', 'Obj assist', 'K/D/A', 'Damage', 'Defence', 'Healing', 'Credits']
        }
        // рисуем таблицу для инфы
        ctx.fillText(tableNames[lang][0], pos[0], 20)
        ctx.fillText(tableNames[lang][1], pos[1], 20)
        ctx.fillText(tableNames[lang][2], pos[2], 20)
        ctx.fillText(tableNames[lang][3], pos[3], 20)
        ctx.fillText(tableNames[lang][4], pos[4], 20)
        ctx.fillText(tableNames[lang][5], pos[5], 20)
        ctx.fillText(tableNames[lang][6], pos[6], 20)
        ctx.fillText(tableNames[lang][7], pos[7], 20)
        ctx.fillText(tableNames[lang][8], pos[8], 20)
        ctx.fillText(tableNames[lang][9], pos[9], 20)

        for (let i = 0; i < matches.length; i++) {
            const match = matches[i]

            ctx.fillStyle = white
            ctx.fillText(`${ i + 1 + (page-1) * 10 }.`, pos[0], 52 * i + 60)
            ctx.fillText(`${ new Date(match.Match_Time).addHours(timezone).toText() }`, pos[1], 52 * i + 48)
            ctx.fillStyle = blue
            ctx.fillText(`${ secToMin(match.Time_In_Match_Seconds) }`, pos[2], 52 * i + 60)
            ctx.fillStyle = white
            ctx.fillText(`${match.Objective_Assists}`, pos[4], 52 * i + 60) // У цели
            ctx.fillStyle = orange
            ctx.fillText(`${match.Kills}/${match.Deaths}/${match.Assists}`, pos[5], 52 * i + 60)
            ctx.fillStyle = red
            ctx.fillText(`${match.Damage}`, pos[6], 52 * i + 60)
            ctx.fillStyle = yellow
            ctx.fillText(`${match.Damage_Mitigated}`, pos[7], 52 * i + 60)
            ctx.fillStyle = green
            ctx.fillText(`${match.Healing}`, pos[8], 52 * i + 60)
            ctx.fillStyle = white
            ctx.fillText(`${match.Gold}`, pos[9], 52 * i + 60)

            const getStats = match.Win_Status
            const status = getStats == 'Win' ? {ru: 'Победа', en: 'Win'} : {ru: 'Поражение', en: 'Loss'}
            const statusColor = getStats == 'Win' ? green : red

            const getQueue = match.Queue
            const queue = getQueue == 'Siege' ? {ru: 'Осада', en: 'Siege'} :
                getQueue == 'Siege Training' ? {ru: '*Осада', en: '*Siege'} :
                getQueue == 'Ranked' ? {ru: 'Ранкед', en: 'Ranked'} :
                getQueue == 'Onslaught' ? {ru: 'Натиск', en: 'Onslaught'} :
                getQueue == 'Onslaught Training' ? {ru: '*Натиск', en: '*Onslaught'} :
                getQueue == 'Team Deathmatch' ? {ru: 'Насмерть', en: 'Deathmatch'} :
                getQueue == 'Team Deathmatch Training' ? {ru: '*Насмерть', en: '*Deathmatch'} :
                getQueue == 'Test Maps' ? {ru: 'Тестовые', en: 'Test Maps'} : {ru: getQueue, en: getQueue}

            ctx.fillStyle = statusColor
            ctx.fillText(`${status[lang]}`, pos[1], 52 * i + 72) // сатус
            ctx.fillStyle = white
            ctx.fillText(`${queue[lang]}`, pos[3], 52 * i + 60) // Режим
        }

        return {status: true}
    } catch(err) {
        console.log(JSON.stringify(err))
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        throw {
            status: false,
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'Ошибка функции "sh.drawTable"'
        }
    }
}


function secToMin(s) { // секунды в минуты или минуты в часы, принцип тот же
	let min = (s / 60).toFixed(2) + ''
	if (min.indexOf('.') != -1) { // если дробное
		let sec = (min.slice(min.indexOf('.') + 1) * 6 / 10).toFixed(0)
		min = `${min.slice(0, min.indexOf('.'))}.${sec}`
	}
	return min
}