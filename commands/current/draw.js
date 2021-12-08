/**
 * Скрипт который только рисует указанную инфу в canvas и возвращает ее или ошибку
 */


const _local = process._local
const {config, classes} = _local
const {translate} = config
const {createCanvas, loadImage } = require('canvas')
const {red, white, blue, black, purple, orange, green, yellow} = config.colors


/**
 * 
 * @param {*} body - 
 * @param {Object} prop - 
 */
module.exports = async (match, prop, last_update) => {
    try {
        const width = 952
        const height = 535
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        prop.width = width
        prop.height = height

        const resDefault = await drawDefault(ctx, match, prop, last_update)
        if (!resDefault.status) throw resDefault

        return {
            status: true,
            canvas,
            matchId: match[0].Match
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
            log_msg: 'Ошибка функции "sp.draw"'
        }
    }
}


async function getMap(mapGame) {
    try {
        let mapName = ''
        let pathToImg = config.defaultPathToImg

        for (let mapName in config.img.maps) {
            const reg = new RegExp(`${mapName}`, 'i')
            const exp = mapGame ? mapGame.replace(/'/,'').match(reg) : false
            if (exp) {
                pathToImg = config.img.maps[mapName]
                break
            }
        }

        const res = await loadImage(pathToImg).catch(console.log)
        return {img: res, name: mapName}
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
            log_msg: 'Ошибка функции "sp.getMap"'
        }
    }
}


async function drawDefault(ctx, match, prop, last_update) {
    try {
        const {champions} = _local
        const {lang, timezone, backgrounds, width, height} = prop
        const matchOne = match[0]
        // const maps = config.img.maps

        // let mapImg = null // узнаем карту, получаем ее картинку
        const getMapMatch = await getMap(matchOne.mapGame)
        const mapImg = getMapMatch.img
        const mapName = mapImg ? getMapMatch.name : '-'

        if (mapImg) ctx.drawImage(mapImg, 0, 0, width, height)

        // затемняющий прозрачный фон
        ctx.fillStyle = "#0000004a"
        ctx.fillRect(0, 0, width, height)

        ctx.fillStyle = black
        ctx.fillRect(0, 0, width, 40)
        ctx.fillRect(0, height - 40, width, height)

        ctx.font = 'bold 16px GothamSSm_Bold'
        ctx.fillStyle = blue
        ctx.fillText(`${translate.Team[lang]} 1`, 35, 25)
        ctx.textAlign = 'end'
        ctx.fillText(`${translate.Team[lang]} 2`, width - 35, 25)
        ctx.fillText(`${translate.Map[lang]}: `, width / 4, height - 15)
        ctx.fillText(`${translate.Region[lang]}: `, width / 4 + width / 2, height - 15)
        ctx.fillText(`${translate.Match_id[lang]}: `, width / 2, 25)
        ctx.textAlign = 'start'
        ctx.fillStyle = orange
        ctx.fillText(` ${mapName}`, width / 4, height - 15)
        ctx.fillText(` ${matchOne.playerRegion}`, width / 4 + width / 2, height - 15)
        ctx.fillText(` ${matchOne.Match}`, width / 2, 25)
        ctx.fillStyle = white

        let countTeam1 = 0
        match.sort((p1, p2) => p1.taskForce - p2.taskForce) // сортируем по возрастанию
        // перебираем игроков матча и рисуем их инфу
        for (let i = 0; i < match.length; i++) {
            const player = match[i]
            const champName = player.ChampionName
            // if (!champName) {
                // console.log(player, matchOne.Match) // показываем игрока и id матча
                // сообщить на канале об ошибке
                // _local.utils.sendToChannel(config.chLog, 'Не найдено имя чемпиона у команды SP.').catch(console.log)
            // }
            const champion = champName ? champions.getByName(champName) : {}
            const champImgSrc = champion ? champion.icon : undefined
            const champImg = await loadImage(champImgSrc).catch(console.log)
            const tier = player.Tier
            const winrate = (player.tierWins / (player.tierWins + player.tierLosses) * 100).toFixed(2) || '-'

            // просто рисуем команду 1, а когда понимаем что началась команда 2 то делаем принудительно
            // i=5 и какие там другие еще переменные

            if (player.taskForce == 1) {
                countTeam1++
                if (champImg) ctx.drawImage(champImg, 70, 90 * i + 50, 50, 50)
                ctx.fillText(`${translate.Nickname[lang]}: ${player.playerName}`, 130, 90 * i + 65)
                if (player.Queue == 486) ctx.fillText(`${translate.Winrate[lang]}: ${winrate}%`, 130, 90 * i + 88)
                ctx.fillText(`Lvl: ${player.Account_Level}`, 130, 90 * i + 110)
                ctx.textAlign = 'center'
                ctx.fillText(player.ChampionLevel, 95, 90 * i + 120)
                ctx.textAlign = 'start'

                if (player.Queue != 486) continue
                const rankImgWidth = tier == 26 ? 264 : tier == 27 ? 264 : 256
                const rankImgHeight = tier == 26 ? 304 : tier == 27 ? 332 : 256
                // const imgPaddingY = tier == 26 ? -15 : tier == 27 ? -20 : 0
                const imgPaddingY = 0
                const divisionImgSrc = config.img.divisions[tier]
                const divisionImg = await loadImage(divisionImgSrc).catch(console.log)
                ctx.drawImage(divisionImg, 0, 90 * i + 45 + imgPaddingY, rankImgWidth / 3.7, rankImgHeight / 3.7)
            } else if (player.taskForce == 2) {
                if (champImg) ctx.drawImage(champImg, width - 120, 90 * (i - countTeam1) + 50, 50, 50)
                ctx.textAlign = 'end'
                ctx.fillText(`${translate.Nickname[lang]}: ${player.playerName}`, width - 130, 90 * (i - countTeam1) + 65)
                // рисуем винрейт только в рейте, так как он доступен только там
                if (player.Queue == 486) ctx.fillText(`${translate.Winrate[lang]}: ${winrate}%`, width - 130, 90 * (i - countTeam1) + 88)
                ctx.fillText(`Lvl: ${player.Account_Level}`, width - 130, 90 * (i - countTeam1) + 110)
                ctx.textAlign = 'center'
                ctx.fillText(player.ChampionLevel, width - 95, 90 * (i - countTeam1) + 120)

                if (player.Queue != 486) continue
                const rankImgWidth = tier == 26 ? 264 : tier == 27 ? 264 : 256
                const rankImgHeight = tier == 26 ? 304 : tier == 27 ? 332 : 256
                // const imgPaddingY = tier == 26 ? -15 : tier == 27 ? -20 : 0
                const imgPaddingY = 0
                const divisionImgSrc = config.img.divisions[tier]
                const divisionImg = await loadImage(divisionImgSrc).catch(console.log)
                ctx.drawImage(divisionImg, width - 70, 90 * (i - countTeam1) + 45 + imgPaddingY, rankImgWidth / 3.7, rankImgHeight / 3.7)
            }
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
            log_msg: 'Ошибка функции "sp.drawDefault"'
        }
    }
}