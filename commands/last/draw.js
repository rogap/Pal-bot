/**
 * Скрипт который только рисует указанную инфу в canvas и возвращает ее или ошибку
 */


const _local = process._local
const {config, classes} = _local
const {ChampionsStats} = classes
const {translate} = config
const {createCanvas, loadImage} = require('canvas')
const {red, white, blue, black, purple, orange, green, yellow} = config.colors


/**
 * 
 * @param {*} body - 
 * @param {Object} prop - 
 */
module.exports = async function(body, prop) {
    try {
        const {getmatchdetails} = body
        const match = getmatchdetails.data
        const width = 1225
        const height = 795
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')
        prop.width = width
        prop.height = height

        // рисуем дефолтные
        const resDefault = await drawDefault(ctx, match, prop)
        if (!resDefault.status) throw resDefault

        // рисуем таблицу
        const resTable = await drawTable(ctx, match, prop)
        if (!resTable.status) throw resTable

        return {
            status: true,
            canvas,
            matchId: match[0].Match
            // name: , // нужно добавить эти данные в php, хотя бы id (но потом)
            // id: 
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
            log_msg: 'Ошибка функции "sm.draw"'
        }
    }
}


async function getMap(mapGame) {
    try {
        let mapNameScope = ''
        let pathToImg = config.defaultPathToImg

        for (let mapName in config.img.maps) {
            const reg = new RegExp(`${mapName}`, 'i')
            const exp = mapGame ? mapGame.replace(/'/,'').match(reg) : false
            if (exp) {
                pathToImg = config.img.maps[mapName]
                mapNameScope = mapName
                break
            }
        }

        const res = await loadImage(pathToImg).catch(console.log)
        return {img: res, name: mapNameScope}
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
            log_msg: 'Ошибка функции "sm.getMap"'
        }
    }
}


async function drawDefault(ctx, match, prop) {
    try {
        const {champions} = _local
        const {lang, timezone, backgrounds, width, height} = prop
        const maps = config.img.maps
        const imgNum = Math.floor(Math.random() * backgrounds.length)
        const imgSrc = config.img.backgrounds[backgrounds[imgNum]] // случайный фон
        const img = await loadImage(imgSrc)
        if ( img ) ctx.drawImage(img, 0, 30, width, height - 30) // рисуем

        ctx.fillStyle = black
        ctx.fillRect(0, 0, width, 30) // прямоугольник сверху

        const matchOne = match[0]
        // инфа по центру
        const getMapMatch = await getMap(matchOne.Map_Game)
        const mapImg = getMapMatch.img
        const mapName = mapImg ? getMapMatch.name : '-'

        if (mapImg) ctx.drawImage(mapImg, 10, 315, 356, 200) // рисуем карту
        ctx.font = 'bold 20px GothamSSm_Bold'
        ctx.fillStyle = white
        ctx.fillText(new Date(matchOne.Entry_Datetime).addHours(timezone).toText(), 20, 502)

        const typeMatch = matchOne.name
        ctx.fillStyle = yellow
        ctx.fillText(`${matchOne.Minutes} ${translate.Minutes[lang]}`, 376, 375)
        ctx.fillText(`${translate.Region[lang]}: ${matchOne.Region}`, 376, 405)
        ctx.fillText(typeMatch, 376, 435)
        const hasReplay = matchOne.hasReplay != 'n'
        const replayText = hasReplay ? {ru: 'есть', en: 'has'} : {ru: 'нету', en: 'no'}
        ctx.fillStyle = hasReplay ? green : red
        ctx.fillText(`Replay: ${replayText[lang]}`, 376, 465)
        ctx.textAlign = "center"
        ctx.fillStyle = yellow
        ctx.fillText(mapName, 376 - 213, 465 - 130)

        const winStatus = matchOne.Win_Status == 'Winner'
        const centerGoRight = typeMatch == 'Ranked' ? 0 : 190

        ctx.fillStyle = green
		ctx.fillText(translate.Win[lang], width / 2 + 70 + centerGoRight, 341)
		ctx.fillStyle = red
		ctx.fillText(translate.Loss[lang], width / 2 + 70 + centerGoRight, 497)

        // зеленоватый и красноватый прозрачный фон
		ctx.fillStyle = 'rgba(50,205,50,0.06)'
		ctx.fillRect(0, 30, width, 285)
		ctx.fillStyle = 'rgba(187,17,17,0.1)'
		ctx.fillRect(0, 515, width, 285)

        ctx.fillStyle = white
        ctx.fillText(`${translate.Team[lang]} 1 ${translate.Score[lang]}: ${matchOne.Team1Score}`, width / 2 + 70 + centerGoRight, 383)
        ctx.fillText(`${translate.Team[lang]} 2 ${translate.Score[lang]}: ${matchOne.Team2Score}`, width / 2 + 70 + centerGoRight, 456)
        // ctx.drawImage(config.differentImg.vs, width / 2 + 40 + centerGoRight, 386, 50, 50)

        ctx.textAlign = "start"
        ctx.fillStyle = yellow
        if (typeMatch == 'Ranked') ctx.fillText(`${translate.Bans[lang]}:`, 885, 420)
        ctx.fillStyle = white
        ctx.font = 'bold 16px GothamSSm_Bold'
        if (winStatus && matchOne.TaskForce == 2) {
            if (matchOne.Ban_2) {
                const imgChamp = await loadImage(champions.getByName(matchOne.Ban_2).icon).catch(console.log)
                ctx.drawImage(imgChamp, 980, 360, 50, 50)
            }
            if (matchOne.Ban_4) {
                const imgChamp = await loadImage(champions.getByName(matchOne.Ban_4).icon).catch(console.log)
                ctx.drawImage(imgChamp, 1040, 360, 50, 50)
            }
            if (matchOne.Ban_5) {
                const imgChamp = await loadImage(champions.getByName(matchOne.Ban_5).icon).catch(console.log)
                ctx.drawImage(imgChamp, 1100, 360, 50, 50)
            }

            if (matchOne.Ban_1) {
                const imgChamp = await loadImage(champions.getByName(matchOne.Ban_1).icon).catch(console.log)
                ctx.drawImage(imgChamp, 980, 420, 50, 50)
            }
            if (matchOne.Ban_3) {
                const imgChamp = await loadImage(champions.getByName(matchOne.Ban_3).icon).catch(console.log)
                ctx.drawImage(imgChamp, 1040, 420, 50, 50)
            }
            if (matchOne.Ban_6) {
                const imgChamp = await loadImage(champions.getByName(matchOne.Ban_6).icon).catch(console.log)
                ctx.drawImage(imgChamp, 1100, 420, 50, 50)
            }
        } else {
            if (matchOne.Ban_1) {
                const imgChamp = await loadImage(champions.getByName(matchOne.Ban_1).icon).catch(console.log)
                ctx.drawImage(imgChamp, 980, 360, 50, 50)
            }
            if (matchOne.Ban_3) {
                const imgChamp = await loadImage(champions.getByName(matchOne.Ban_3).icon).catch(console.log)
                ctx.drawImage(imgChamp, 1040, 360, 50, 50)
            }
            if (matchOne.Ban_6) {
                const imgChamp = await loadImage(champions.getByName(matchOne.Ban_6).icon).catch(console.log)
                ctx.drawImage(imgChamp, 1100, 360, 50, 50)
            }

            if (matchOne.Ban_2) {
                const imgChamp = await loadImage(champions.getByName(matchOne.Ban_2).icon).catch(console.log)
                ctx.drawImage(imgChamp, 980, 420, 50, 50)
            }
            if (matchOne.Ban_4) {
                const imgChamp = await loadImage(champions.getByName(matchOne.Ban_4).icon).catch(console.log)
                ctx.drawImage(imgChamp, 1040, 420, 50, 50)
            }
            if (matchOne.Ban_5) {
                const imgChamp = await loadImage(champions.getByName(matchOne.Ban_5).icon).catch(console.log)
                ctx.drawImage(imgChamp, 1100, 420, 50, 50)
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
            log_msg: 'Ошибка функции "sm.drawDefault"'
        }
    }
}


async function drawTable(ctx, match, prop) {
    try {
        const {champions} = _local
        const {lang, timezone, backgrounds, width, height} = prop

        // ctx.fillStyle = black
        // ctx.fillRect(0, 0, imgWidth, 32)
        ctx.fillStyle = blue
        ctx.fillText(translate.Champion[lang], 10, 20)
        ctx.fillText(`${translate.Rank[lang]} / ${translate.TP[lang]} / ${translate.Player[lang]}`, 140, 20)
        ctx.fillText(translate.Party[lang], 365, 20)
        ctx.fillText(translate.Credits[lang], 420, 20)
        ctx.fillText(translate.K_D_A[lang], 505, 20)
        ctx.fillText(translate.Damage[lang], 585, 20)
        ctx.fillText(translate.Defense[lang], 670, 20)
        ctx.fillText(translate.Healing[lang], 765, 20)
        ctx.fillText(translate.Dmg_taken[lang], 860, 20)
        ctx.fillText(translate.Obj_assist[lang], 960, 20)
        ctx.fillText(translate.Items[lang], 1025, 20)
        ctx.fillStyle = white

        const party = {}
        let partyNumber = 1
        const partyColors = ['#00FFFF', '#006400', '#F08080', '#FFFF00', '#FF0000', '#4682B4', '#C71585', '#FF4500', '#7FFF00'].sort(function() {
            return Math.random() - 0.5 // рандомизируем цвета каждый раз
        })

        for (let i = 0; i < match.length; i++) {
            const players = match[i]
            const champName = players.Reference_Name

            const cnampion = champions.getByName(champName)
            let nextTeam = i >= 5 ? 245 : 40
            if (cnampion) { // если есть чемпион то рисуем
                const imgSrc = cnampion.icon
                const img = await loadImage(imgSrc).catch(console.log)
                if (img) ctx.drawImage(img, 10, 55 * i + nextTeam, 50, 50) // рисуем иконки чемпионов
            }

            // console.log(`${cnampion.Name.en} - ${players.ItemId6}`, _local.cards.get(players.ItemId6), '\n')
            if (cnampion) {
                const legendary = _local.cards.get(players.ItemId6)
                if (legendary) {
                    const legendaryImg =  await loadImage(legendary.img).catch(console.log)
                    if (legendaryImg) ctx.drawImage(legendaryImg, 65, 55 * i + nextTeam, 50, 50) // рисуем легендарки
                }
            }

            const imgDivisionSrc = config.img.divisions[players.League_Tier]
            const imgDivision = await loadImage(imgDivisionSrc)
            if (players.name == 'Ranked') ctx.drawImage(imgDivision, 115, 55 * i + nextTeam, 50, 50) // рисуем ранг только в рейте

            // рисуем закуп
            const item1 = players.Item_Active_1
            if (item1) {
                const img = await loadImage( config.img.items[item1.toLowerCase()] ).catch(console.log)
                ctx.drawImage(img, 1025, 55 * i + nextTeam, 40, 40)
                drawLevelItem(ctx, players.ActiveLevel1, 1025, 55 * i + nextTeam + 43, 10, 3)
            }
            const item2 = players.Item_Active_2
            if (item2) {
                const img = await loadImage( config.img.items[item2.toLowerCase()] ).catch(console.log)
                ctx.drawImage(img, 1075, 55 * i + nextTeam, 40, 40)
                drawLevelItem(ctx, players.ActiveLevel2, 1075, 55 * i + nextTeam + 43, 10, 3)
            }
            const item3 = players.Item_Active_3
            if (item3) {
                const img = await loadImage( config.img.items[item3.toLowerCase()] ).catch(console.log)
                ctx.drawImage(img, 1125, 55 * i + nextTeam, 40, 40)
                drawLevelItem(ctx, players.ActiveLevel3, 1125, 55 * i + nextTeam + 43, 10, 3)
            }
            const item4 = players.Item_Active_4
            if (item4) {
                const img = await loadImage( config.img.items[item4.toLowerCase()] ).catch(console.log)
                ctx.drawImage(img, 1175, 55 * i + nextTeam, 40, 40)
                drawLevelItem(ctx, players.ActiveLevel4, 1175, 55 * i + nextTeam + 43, 10, 3)
            }

            const partyId = players.PartyId
            let partyNum = party[partyId]
            if (!partyNum) {
                party[partyId] = partyNum = partyNumber
                partyNumber++
            }

            // ОТ ЛВЛ и ник
            ctx.fillText(players.League_Points || '', 170, 55 * i + nextTeam + 27)
            ctx.fillText(players.playerName, 205, 55 * i + nextTeam + 15)
            ctx.fillStyle = orange
            ctx.fillText(`Lvl: ${players.Account_Level}`, 205, 55 * i + nextTeam + 40)

            nextTeam += 25

            ctx.fillStyle = partyColors[partyNum - 1]
            ctx.beginPath()
            ctx.arc(385, 55 * i + nextTeam - 2, 15, 0, 2*Math.PI, false) // круг пати
            ctx.fill()
            ctx.fillStyle = black
            ctx.fillText(partyNum, 381, 55 * i + nextTeam) // цифра пати
            ctx.fillStyle = white
            ctx.fillText(players.Gold_Earned, 420, 55 * i + nextTeam)
            ctx.fillStyle = orange
            ctx.fillText(`${players.Kills_Player}/${players.Deaths}/${players.Assists}`, 505, 55 * i + nextTeam)
            ctx.fillStyle = white
            ctx.fillText(players.Damage_Player, 585, 55 * i + nextTeam)
            ctx.fillText(players.Damage_Mitigated, 670, 55 * i + nextTeam)
            ctx.fillText(players.Healing, 765, 55 * i + nextTeam)
            ctx.fillText(players.Damage_Taken, 860, 55 * i + nextTeam)
            ctx.fillText(players.Objective_Assists, 960, 55 * i + nextTeam)
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
            log_msg: 'Ошибка функции "sm.drawTable"'
        }
    }
}


function drawLevelItem(ctx, lvl, x, y) { // рисует полоски под закупом (их лвл)
	for (let i = 0; i <= lvl; i++) {
		ctx.fillRect(x + 14 * i, y, 10, 3)
	}
}