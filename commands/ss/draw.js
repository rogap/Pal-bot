/**
 * Скрипт который только рисует указанную инфу в canvas и возвращает ее или ошибку
 */


const _local = process._local
const {config, classes} = _local
const {ChampionsStats} = classes
const {translate} = config
const {createCanvas } = require('canvas')
const {red, white, blue, black, purple, orange, green, yellow} = config.colors


/**
 * 
 * @param {*} body - 
 * @param {Object} prop - 
 */
module.exports = function(body, prop) {
    // console.log(body, prop)
    try {
        const {getplayer, getchampionranks} = body
        const playerLastUpdate = getplayer.last_update
        const championsLastUpdate = getchampionranks.last_update
        const player = getplayer.json[0]
        const champions = new ChampionsStats(getchampionranks.json)

        const width = 790
        const height = 375
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        prop.width = width
        prop.height = height

        // рисуем дефолтные
        const resDefault = drawDefault(ctx, playerLastUpdate, championsLastUpdate, prop)
        if (!resDefault.status) throw resDefault

        // рисуем данные игрока
        const resPlayer = drawPlayer(ctx, player, champions, prop)
        if (!resPlayer.status) throw resPlayer

        // рисуем чемпионов
        if (!champions.error) { // если все корректно
            const resChampions = drawChampions(ctx, champions, prop)
            if (!resChampions.status) throw resChampions
        }

        return {
            status: true,
            canvas,
            id: player.Id, // ActivePlayerId
            name: player.hz_player_name || player.hz_gamer_tag
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
            log_msg: 'Ошибка функции "ss.draw"'
        }
    }
}


function drawDefault(ctx, playerLastUpdate, championsLastUpdate, prop) {
    try {
        const {lang, timezone, backgrounds, width, height} = prop
        const imgNum = Math.floor(Math.random() * backgrounds.length)
        const img = config.img.backgrounds[backgrounds[imgNum]] // случайный фон
        if ( img ) ctx.drawImage(img, 0, 0, width, height - 50) // рисуем

        // рисуем черную полосу снизу
        ctx.fillStyle = black
        ctx.fillRect(0, height - 50, width, 50)

        ctx.textAlign = 'end'
        ctx.font = 'bold 16px GothamSSm_Bold'
        ctx.fillStyle = red

        const propsText = ctx.measureText(`${translate.Timezone[lang]}: ${timezone}`)
        ctx.fillText(`${translate.Timezone[lang]}: ${timezone}`, width - 20, height - 44)

        ctx.fillStyle = white
        ctx.fillRect(10, height - 50, width - propsText.width - 40, 1)
        ctx.fillRect(width - propsText.width - 31, height - 64, 1, 14) // полоса вверх
        ctx.fillRect(width - propsText.width - 31, height - 49, 1, 14) // полоса вниз
        ctx.fillRect(width - propsText.width - 30, height - 64, propsText.width + 20, 1) // продолжение полосы сверху
        ctx.fillRect(width - propsText.width - 30, height - 36, propsText.width + 20, 1) // продолжение полосы снизу
        ctx.textAlign = 'start'
        ctx.fillStyle = red

        if (playerLastUpdate) {
            const lastUpdatePlayer = playerLastUpdate.updateToDate(timezone).toText()
            const nextUpdateAcc = playerLastUpdate.getNextUpdate('getplayer', timezone)
            const accText = `${translate.Accaunt[lang]}: ${lastUpdatePlayer} | ${translate.Update[lang]}: ${nextUpdateAcc}`
            ctx.fillText(accText, 20,  height - 30)
        }

        if (championsLastUpdate) {
            const lastUpdateChamp = championsLastUpdate.updateToDate(timezone).toText()
            const nextUpdateChamp = championsLastUpdate.getNextUpdate('getchampionranks', timezone)
            const champText = `${translate.Champions[lang]}: ${lastUpdateChamp} | ${translate.Update[lang]}: ${nextUpdateChamp}`
            ctx.fillText(champText, 20,  height - 10)
        }

        return {status: true}
    } catch(err) {
        throw {
            status: false,
            err,
            err_msg: {
                ru: '',
                en: ''
            },
            log_msg: 'Ошибка функции "drawDefault" во время рисования статы (ss)'
        }
    }
}


function drawPlayer(ctx, player, champions, prop) {
    try {
        const {lang, timezone} = prop

        const RankedKBM = player.RankedKBM || {}
        const Tier_RankedKBM = player.Tier_RankedKBM
        const rankNum = Tier_RankedKBM == 26 && RankedKBM.Rank <= 100 && RankedKBM.Rank > 0 ? 27 : Tier_RankedKBM
        const rankImgWidth = rankNum == 26 ? 264 : rankNum == 27 ? 264 : 256
        const rankImgHeight = rankNum == 26 ? 304 : rankNum == 27 ? 332 : 256
        const imgPaddingY = rankNum == 26 ? -15 : rankNum == 27 ? -20 : 0

        // рисуем картинку ранга
        const divisionImg = config.img.divisions[rankNum]
        if (divisionImg) ctx.drawImage(divisionImg, 5, 200 + imgPaddingY, rankImgWidth / 2.6, rankImgHeight / 2.6)

        // рисуем аватарку
        const avatarId = player.AvatarId
        const avatarImg = config.img.avatars[avatarId] || config.img.avatars[0]
        if (avatarImg) {
            ctx.drawImage(avatarImg, 5, 10, 95, 95)
        } else {
            // если аватрка не найдена то сообщим в логи
            sendToChannel(config.chLog, `Аватарка не найдена: ${avatarId}`).catch(console.log)
        }

        // рисуем инфу
        ctx.textAlign = 'start'
        ctx.fillStyle = white
        ctx.font = 'bold 16px GothamSSm_Bold'
        const widthInfo = 200
        ctx.fillStyle = red
        ctx.fillText(`${player.hz_player_name || player.hz_gamer_tag} (${player.Region})`, 10 + widthInfo / 2, 20)
        ctx.fillStyle = green
        const getParseExp = champions.parseExp(player.Total_XP)
        ctx.fillText(`${translate.Level[lang]}: ${getParseExp.lvl}`, 10 + widthInfo / 2, 40)
        ctx.fillStyle = white
        const dateCreate = new Date(player.Created_Datetime).addHours(timezone).toText()
        ctx.fillText(`${translate.Created[lang]}: ${dateCreate}`, 10 + widthInfo / 2, 60)
        ctx.fillText(`${translate.Played[lang]}: ${player.HoursPlayed} часов`, 10 + widthInfo / 2, 80)
        const dateLastLogin = new Date(player.Last_Login_Datetime).addHours(timezone).toText()
        ctx.fillText(`${translate.Last_login[lang]}: ${dateLastLogin}`, 10 + widthInfo / 2, 100)
        ctx.fillStyle = orange
        if (!champions.error) {
            ctx.fillText(`KDA: ${champions.kda}`, 10 + widthInfo / 2, 120)
        }
        ctx.fillStyle = white
        ctx.fillText(`${translate.Client[lang]}: ${player.Platform} - ${player.Name}`, 10, 140)
        const title = player.Title
        if ( title ) ctx.fillText(`${translate.Title[lang]}: ${player.Title}`, 10, 160)
        
        const padLeftNew = 100
        ctx.fillStyle = red
        ctx.fillText(`${translate.TOTAL[lang]}:`, 35 + padLeftNew, 190)
        if (!champions.error) {
            ctx.fillStyle = white
            ctx.fillText(`${translate.Kills[lang]}: ${champions.kills}`, 10 + padLeftNew, 210)
            ctx.fillText(`${translate.Deaths[lang]}: ${champions.deaths}`, 10 + padLeftNew, 230)
            ctx.fillText(`${translate.Assists[lang]}: ${champions.assists}`, 10 + padLeftNew, 250)
            ctx.fillText(`${translate.Wins[lang]}: ${player.Wins || champions.wins}`, 10 + padLeftNew, 270)
            ctx.fillText(`${translate.Losses[lang]}: ${player.Losses || champions.losses}`, 10 + padLeftNew, 290)
            ctx.fillStyle = blue
            ctx.fillText(`${translate.Winrate[lang]}: ${champions.winrate}%`, 10 + padLeftNew, 310)
        }
        
        ctx.fillStyle = red
        ctx.fillText(`${translate.RANKED[lang]}:`, 225 + padLeftNew, 190)
        ctx.fillStyle = white
        ctx.fillText(`${translate.Wins[lang]}: ${RankedKBM.Wins}`, 200 + padLeftNew, 210)
        ctx.fillText(`${translate.Losses[lang]}: ${RankedKBM.Losses}`, 200 + padLeftNew, 230)
        const winrateNumRanked = (RankedKBM.Wins / (RankedKBM.Wins + RankedKBM.Losses) * 100).toFixed(0)
        ctx.fillStyle = blue
        ctx.fillText(`${translate.Winrate[lang]}: ${winrateNumRanked}%`, 200 + padLeftNew, 250)
        ctx.fillStyle = white
        ctx.fillText(`${translate.Rank[lang]}: ${config.ranks[lang][rankNum]}`, 200 + padLeftNew, 270)
        ctx.fillText(`${translate.TP[lang]}: ${RankedKBM.Points}`, 200 + padLeftNew, 290)
        if (RankedKBM.Rank) ctx.fillText(`${translate.Position[lang]}: ${ RankedKBM.Rank }`, 200 + padLeftNew, 310)

        return {status: true}
    } catch (err) {
        throw {
            status: false,
            err,
            err_msg: {
                ru: '',
                en: ''
            },
            log_msg: 'Ошибка функции "drawPlayer" во время рисования статы (ss)'
        }
    }
}


function drawChampions(ctx, champions, prop) {
    try {
        const {lang} = prop
        const {timePlayRole} = champions

        const champSort = champions.sort().slice(0, 5)
        // рисуем загруженых чемпионов
        let positionX = 470
        for (let i = 0; i < champSort.length; i++) {
            const img = champSort[i].icon
            const x = positionX + 60 * i
            ctx.drawImage(img, x, 180, 50, 50)
        }

        // данные для диаграммы
        const totalTime = timePlayRole.damage + timePlayRole.flanker + timePlayRole.frontline + timePlayRole.support
        const damageDeg = 360 * (timePlayRole.damage / totalTime)
        const flankerDeg = 360 * (timePlayRole.flanker / totalTime)
        const frontlineDeg = 360 * (timePlayRole.frontline / totalTime)

        // рисуем диаграмму ->
        const second = frontlineDeg + damageDeg
        const third = flankerDeg + damageDeg + frontlineDeg
        if (0 < damageDeg) drawPieSlice(ctx, 550, 80, 50, 0, damageDeg, purple)
        if (damageDeg < second) drawPieSlice(ctx, 550, 80, 50, damageDeg, frontlineDeg + damageDeg, blue)
        if (second < third) drawPieSlice(ctx, 550, 80, 50, frontlineDeg + damageDeg, flankerDeg + damageDeg + frontlineDeg, orange)
        if (third < 360) drawPieSlice(ctx, 550, 80, 50, flankerDeg + damageDeg + frontlineDeg, 360, green)
        ctx.fillStyle = purple
        ctx.fillRect(620, 40, 15, 15)
        ctx.fillStyle = blue
        ctx.fillRect(620, 62, 15, 15)
        ctx.fillStyle = orange
        ctx.fillRect(620, 84, 15, 15)
        ctx.fillStyle = green
        ctx.fillRect(620, 106, 15, 15)

        ctx.textAlign = "start"
        // любимые чемпионы ->
        ctx.fillStyle = red
        ctx.fillText(`${translate.FAVORITE_CHAMPIONS[lang]}:`, 520, 160)
        ctx.fillText(`${translate.Roles[lang]}:`, 540, 20)
        ctx.fillStyle = white
        ctx.fillText(`${translate.Damage[lang]} - ${(timePlayRole.damage / totalTime * 100).toFixed(2)}%`, 640, 54)
        ctx.fillText(`${translate.Tank[lang]} - ${(timePlayRole.frontline / totalTime * 100).toFixed(2)}%`, 640, 76)
        ctx.fillText(`${translate.Flank[lang]} - ${(timePlayRole.flanker / totalTime * 100).toFixed(2)}%`, 640, 98)
        ctx.fillText(`${translate.Support[lang]} - ${(timePlayRole.support / totalTime * 100).toFixed(2)}%`, 640, 120)

        ctx.fillStyle = green
        ctx.textAlign = "center"
        if (champSort[0]) ctx.fillText(champSort[0].Rank, 497, 250)
        if (champSort[1]) ctx.fillText(champSort[1].Rank, 557, 250)
        if (champSort[2]) ctx.fillText(champSort[2].Rank, 617, 250)
        if (champSort[3]) ctx.fillText(champSort[3].Rank, 677, 250)
        if (champSort[4]) ctx.fillText(champSort[4].Rank, 737, 250)

        ctx.fillStyle = orange
        if (champSort[0]) ctx.fillText(champSort[0].kda, 497, 270)
        if (champSort[1]) ctx.fillText(champSort[1].kda, 557, 270)
        if (champSort[2]) ctx.fillText(champSort[2].kda, 617, 270)
        if (champSort[3]) ctx.fillText(champSort[3].kda, 677, 270)
        if (champSort[4]) ctx.fillText(champSort[4].kda, 737, 270)

        ctx.fillStyle = blue
        if (champSort[0]) ctx.fillText(`${champSort[0].winrate}%`, 497, 290)
        if (champSort[1]) ctx.fillText(`${champSort[1].winrate}%`, 557, 290)
        if (champSort[2]) ctx.fillText(`${champSort[2].winrate}%`, 617, 290)
        if (champSort[3]) ctx.fillText(`${champSort[3].winrate}%`, 677, 290)
        if (champSort[4]) ctx.fillText(`${champSort[4].winrate}%`, 737, 290)

        return {status: true}
    } catch (err) {
        throw {
            status: false,
            err,
            err_msg: {
                ru: '',
                en: ''
            },
            log_msg: 'Ошибка функции "drawChampions" во время рисования статы (ss)'
        }
    }
}


function drawPieSlice(ctx, centerX, centerY, radius, startAngle, endAngle, color) {
	ctx.fillStyle = color
	ctx.beginPath()
	ctx.moveTo(centerX, centerY)
	ctx.arc(centerX, centerY, radius, getRadians(startAngle), getRadians(endAngle))
	ctx.closePath()
	ctx.fill()
}


function getRadians(degrees) {return (Math.PI / 180) * degrees}