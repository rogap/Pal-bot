const {Client} = require('discord.js')
const client = new Client()
const request = require('request')
const { createCanvas, loadImage } = require('canvas')
const Config = require('./configs.js') // будет ли подставленна туда инфа от хероку?
const config = Config.exports || Config

config.timeStart = +new Date()
config.usedCommands = 0
config.usedCommandsNow = 0
config.championsId = {}
config.championsName = {}
config.differentImg = []
config.LegendarChampions = {}




const commands = { // будет загружаться для каждого сервера свой, как и настройки к функциям
	"!hh": {
		commands: ["!hh", "инфо"],
		//info: "Выводит список команд, если указан параметр то выводит подробную инструкцию.",
		info: "Выводит список команд.",
		func: showInfoCommands
		//params: ["Команда"]
	},
	"!me": {
		commands: ["!me"],
		info: "Сохраняет ваш никнейм для автоматической подстановки его в другие команды (можно будет писать просто !ss или !ss me).",
		func: meNickName,
		params: ["Ник"]
	},
	"!ss": {
		commands: ["!ss", "!стата"],
		info: "Выводит общую статистику аккаунта.",
		func: getPlaypaladinsSS,
		params: ["Ник"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!sh": {
		commands: ["!sh", "!история"],
		info: "Выводит последние 10 матчей указанного игрока.",
		func: getPlaypaladinsSH,
		params: ["Ник"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!sl": {
		commands: ["!sl", "!колода"],
		info: ["Выводит колоды игрока указанного чемпиона."],
		func: getPaladinsSL,
		params: ["Ник", "имя чемпиона", "номер колоды"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!sm": {
		commands: ["!sm", "!матч"],
		info: ["Выводит подробности матча по id матча или по нику игрока."],
		func: getPaladinsMatchdetails,
		params: ["id или Ник", "Порядок матча, если указан ник"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!sp": {
		commands: ["!sp"],
		info: ["Проверяет онлайн статус игрока и выводит матч, если он в матче."],
		func: getPaladinsPlayerStatus,
		params: ["Ник"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!sc": {
		commands: ["!sc", "!чемпион"],
		info: ["Выводит статистику указанного чемпиона."],
		func: getChampionStats,
		params: ["Ник", "Чемпион"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	// "!st": {
	// 	commands: ["!st", "!топ"],
	// 	info: ["Выводит топ чемпионов"],
	// 	func: getChampionTop,
	// 	params: ["Ник"],
	// 	permission: "ATTACH_FILES",
	// 	errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	// },
	"!сервер": {
		commands: ["!сервер"],
		info: "Отправляет в ЛС ссылку на сервер бота",
		func: function(mess) {
			const text = "Группа бота: https://discord.gg/RG9WQtP"
			const id = mess.author.id
			const user = client.users.cache.find((user => {
				if ( user.id == id ) return user
			}))
			user.send(text)
		}
	},
	"!онлайн": {
		commands: ["!онлайн"],
		info: "выводит статистику пользователей по онлайну и играм",
		func: showOnlineInServer
	},
	"!всего": {
		commands: ["!всего"],
		info: "Выводит статистику бота по серверам, командам и время работы бота",
		func: showAllServersInfo
	}
	// "!аватар": {
	// 	commands: ["!аватар"],
	// 	info: "Выводит ссылку на аватарку указанного пользователя",
	// 	func: showUsersAvatar,
	// 	params: ["Id или никнейм+тег пользователя (упомянуть)"]
	// }
}



// ---> !hh --->
function showInfoCommands(mess) {
	let text = ``
	for (let key in commands) {
		const command = commands[key]
		const params = command.params ? ` **[${command.params.join("]**, **[")}]**` : ""
		let info = `**${key}**${params} - ${command.info}`
		if (command.commands.length > 1) info += ` (Можно **${command.commands.join("**, **")}**).`
		text += `\r\n${info}`
	}
	mess.reply(text) // нет проверки на 2000 символов в сообщение (можно отправлять другим методом)
}
// <--- !hh <---



// ---> !me --->
function meNickName(mess, name) {
	if (name) { // если передан name
		name = name.replace(/\\/g, '').trim() // удаляем слеши, а то они чет не чекаются в test
		const test = /^(?:[0-9]*-)?[^ "\[\]<>?\\|+@.,\/#!$%\^&\*;:{}=\-_`~()]+$/ig.test(name)
		if (!test) return mess.reply("Ник содержит недопустимые символы.")

		return sendSite( getFormsParams(mess.author.id, name) ) // записываем ник в БД
		.then(response => {
			const res = JSON.parse(response.body)
			if (res.status == "OK") return mess.reply("Ваш ник успешно записан!")

			console.log(`Неудачная загрузка set_bot_me для ${name}`)
			const errText = "Ошибка! Попробуйте еще раз или обратитесь в группу бота за помощью (**!hh**)."
			mess.reply(errText)
		})
	}

	// Получаем ник с БД, если есть и выводим
	return sendSite( getFormsParams(mess.author.id) )
	.then(response => {
		const res = JSON.parse(response.body)
		const paladinsName = res.paladins_name

		if (!paladinsName) return mess.reply(`У вас нет сохраненного никнейма.`)
		mess.reply(`Ваш сохраненный никнейм: **${paladinsName}**`)
	})
}
// <--- !me <---



// ---> !ss --->
function getPlaypaladinsSS(mess, name) {
	prefStatsGuru(mess, name, getStats) // он проверяет никнейм, получает с сервера если нужно

	function getStats(name) {
		name = name.replace(/(?:[0-9]*-)/g, '').trim() // удаляем id с ника, если есть

		playpaladinsSS(mess, name) // получаем инфу
		.then(drawPlaypaladinsSS) // рисуем
		.then(res => { // отправляем
			const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
			mess.channel.send(`${mess.author}`, {files: [buffer]})
		})
	}
}
// <--- !ss <---



// ---> !sh --->
function getPlaypaladinsSH(mess, name) {
	prefStatsGuru(mess, name, getStats)

	function getStats(name) {
		name = name.replace(/(?:[0-9]*-)/g, '').trim() // удаляем id с ника, если есть

		playpaladinsSH(mess, name) // получаем инфу
		.then(drawPlaypaladinsSH) // рисуем
		.then(res => { // отправляем
			if (res.ret_msg) return mess.channel.send(res.ret_msg) // если была ошибка
			const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
			mess.channel.send(`${mess.author}`, {files: [buffer]})
		})
	}
}
// <--- !sh <---



// ---> !sl --->
function getPaladinsSL(mess, name, championName, num) {
	if (!config.championsName[championName]) {
		return mess.reply("Введите корректное имя чемпиона")
	}

	// проверка num нужна
	if (num !== undefined) {
		if (parseInt(num) != num || num < 1) return mess.reply("Введите корректное число колоды")
	}

	prefStatsGuru(mess, name, getStats)

	function getStats(name) {
		name = name.replace(/(?:[0-9]*-)/g, '').trim() // удаляем id с ника, если есть (хз зачем это)

		paladinsSL(mess, name, championName, num) // получаем инфу
		.then(drawPaladinsSL) // рисуем
		.then(res => { // отправляем
			if (res.err) return false // ничего не делает если была ошибка (уже сделали)
			console.log("Отправляем")
			const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
			mess.channel.send(`${mess.author}`, {files: [buffer]})
		})
	}
}
// <--- !sl <---



// ---> !sm --->
function getPaladinsMatchdetails(mess, matchIdOrName, matchNum=1) {
	//if (!matchIdOrName) return mess.reply(`Введите корректный Ник игрока или id матча`)

	function getMatchForId(matchId) {
		hiRezFunc("getmatchdetails", {id: matchId})
		.then(match => {
			if (!match[0].name) return mess.reply(`Матч не найден`)

			const res = drawMatchdetails(mess, match)
			if (res.err) return false // ничего не делает если была ошибка (уже сделали)
			console.log("Отправляем")
			const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
			mess.channel.send(`${mess.author}`, {files: [buffer]})
		})
	}

	if ( !isNaN(parseInt(matchIdOrName)) && matchIdOrName.length < 15 && matchIdOrName.length > 8 ) { // если id матча
		getMatchForId(matchIdOrName)
	} else { // если ник игрока
		// делаем запрос на матчи игрока, получаем id последней катки или указанной
		prefStatsGuru(mess, matchIdOrName, getStats)

		function getStats(name) {
			name = name.replace(/(?:[0-9]*-)/g, '').trim() // удаляем id с ника, если есть (это для гуру)

			hiRezFunc('searchplayers', {name})
			.then(function(res){
				return new Promise(resolve => {
					return resolve( getSearchplayers(res, true) )
				})
			})
			.then(player => {
				if (!player) return mess.reply("Игрок не найден или у него скрыт профиль.")
				// if (player.privacy_flag == "y") return mess.reply(`У игрока скрытый аккаунт.`) // фикс новой API
				hiRezFunc('getmatchhistory', {id: player.player_id})
				.then(matches => {
					if (!matches[0] || matches[0].ret_msg) return mess.reply(`Ошибка, возможно у игрока **${player.player_id}** скрытый аккаунт или нет матчей.`)
					const match = matches[matchNum - 1] // берем указанный матч
					if (!match || !match.Match) return mess.reply("Указанный матч не найден.")
					getMatchForId(match.Match)
				})
			})
		}
	}
}
// <--- !sm <---



// ---> !sp --->
function getPaladinsPlayerStatus(mess, name) {
	prefStatsGuru(mess, name, getStats)

	function getStats(name) {
		name = name.replace(/(?:[0-9]*-)/g, '').trim() // удаляем id с ника, если есть (это для гуру)

		hiRezFunc("searchplayers", {name}) // получаем id игрока по нику
		.then(function(res){ // ретранслятор -_-
			return new Promise(resolve => {
				return resolve( getSearchplayers(res, true) )
			})
		})
		.then(player => {
			if (!player) return mess.reply(`Игрок **${name}** не найден или у него скрыт профиль.`)
			if (player.ret_msg) return mess.reply(`Ошибка: **${player.ret_msg}**.`) // фикс новой API
			hiRezFunc("getplayerstatus", {id: player.player_id})
			.then(retranslator)
			.then(res => {
				if (res.err) return mess.reply(res.err)
				const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
				mess.channel.send(`${mess.author}`, {files: [buffer]})
			})

			function retranslator(status) { // что бы передавать name
				return new Promise(resolve => {
					return resolve( drawPaladinsPlayerStatus(status, name) )
				})
			}
		})
	}
}
// <--- !sp <---



// ---> !sc --->
function getChampionStats(mess, name, champName) {
	if (!name || !champName) return mess.reply(`Укажите правильно команду. Пример: **!sc [имя игрока] [имя чемпиона]**`)
	prefStatsGuru(mess, name, getStats)

	function getStats(name) {
		hiRezFunc("searchplayers", {name}) // получаем id игрока по нику
		.then(function(res){ // ретранслятор -_-
			return new Promise(resolve => {
				return resolve( getSearchplayers(res, true) )
			})
		})
		.then(player => {
			if (!player) return mess.reply("Игрок не найден или у него скрыт профиль.")
			if (player.ret_msg) return mess.reply(`Ошибка: ${player.ret_msg}`) // фикс новой API
			hiRezFunc("getchampionranks", {id: player.player_id}) // получаем чемпионов
			.then(champions => {
				if (!champions || !champions[0]) return mess.reply(`У игрока **${name}** не найдены чемпионы.`)
				const champion = searchChampion(champions, champName)
				if (!champion) return mess.reply(`У **${name}** нет игр на "${champName}".`)
				const file = drawChampionStats(champion, name)
				if (!file) return mess.reply(`Ошибка при рисовании статистики чемпиона.`)
				const buffer = file.toBuffer('image/png') // buffer image
				mess.channel.send(`${mess.author}`, {files: [buffer]})
			})
		})
	}
}
function searchChampion(list, name) {
	console.log(name)
	name = name.replace(/[ ']/i,'').toLowerCase()
	return list.find(champion => {
		const ch = config.championsName[name]
		if (!ch) return false
		const enName = ch.Name_English
		if (!enName) return false
		return champion.champion == enName
	}) || false
}
function drawChampionStats(champion, playername) {
	try {
		const fullInfoChampion = config.championsId[ champion.champion_id ]

		const imgWidth = 600
		const imgHeight = 260
		const canvas = createCanvas(imgWidth, imgHeight)
		const ctx = canvas.getContext('2d')
		ctx.font = 'bold 16px Georgia'
		ctx.fillStyle = "#ffffff"

		const background = config.imgBackground[ Math.floor(Math.random() * 3) ] // случайный фон
		ctx.drawImage(background, 0, 0, imgWidth, imgHeight)

		ctx.fillText(`Роль: ${fullInfoChampion.Roles}`, 200, 230)
		ctx.fillText(`Титул: ${fullInfoChampion.Title}`, 200, 250)
		ctx.fillText(`Последняя игра: ${champion.LastPlayed}`, 200, 40 + 5)
		ctx.fillText(`Сыграно минут: ${champion.Minutes}`, 200, 60 + 5)

		const img = config.championsName[ champion.champion ].loadedImg
		ctx.drawImage(img, 10, 30, 180, 180)
		ctx.fillStyle = '#32CD32' // зеленый
		ctx.fillText(`Жизни: ${fullInfoChampion.Health}`, 10, 230)
		const kills = champion.Kills
		ctx.fillText(`Убийства: ${kills}`, 200, 120 + 5)
		ctx.fillText(`Победы: ${champion.Wins}`, 400, 120 + 5)

		ctx.fillStyle = "#1199cc" // голубой
		ctx.fillText(`Скорость: ${fullInfoChampion.Speed}`, 10, 250)
		const assists = champion.Assists
		ctx.fillText(`Помощи: ${assists}`, 200, 160 + 5)

		const deaths = champion.Deaths
		ctx.fillStyle = '#BB1111' // красный
		ctx.fillText(`Смерти: ${deaths}`, 200, 140 + 5)
		ctx.fillText(`Поражения: ${champion.Losses}`, 400, 140 + 5)

		const kda = ((kills + assists / 2) / (deaths + 1)).toFixed(2)
		const winrate = fixNaN((champion.Wins / (champion.Wins + champion.Losses) * 100).toFixed(0))

		ctx.fillStyle = '#CC6600' // оранжевый
		ctx.textAlign = "center"
		ctx.fillText(fullInfoChampion.Name, 100, 20)
		ctx.textAlign = "start"
		ctx.fillText(playername, 250, 20)
		ctx.fillText(`Уровень: ${champion.Rank}`, 200, 80 + 5)
		ctx.fillText(`КДА: ${kda}`, 200, 180 + 5)
		ctx.fillText(`Винрейт: ${winrate}%`, 400, 160 + 5)

		return canvas
	} catch(e) {
		console.log("Ошибка рисования статистики чемпионов:")
		console.log(e)
		return false
	}
}
// <--- !sc <---



// <--- !st <---
function getChampionTop(mess, name) {
	if (!name) return mess.reply(`Укажите правильно команду. Пример: **!sc [имя игрока] [имя чемпиона]**`)
	prefStatsGuru(mess, name, getStats)

	function getStats(name) {
		hiRezFunc("searchplayers", {name}) // получаем id игрока по нику
		.then(res => {
			console.log(res)
		})
	}
}
// <--- !st <---



// ---> draw playpaladins small stats --->
function playpaladinsSS(mess, name) {
	return new Promise(resolve => {
		searchPaladinsPlayer(name)
		.then(resolve)
		.catch(err => {
			mess.reply(`Ошибка, игрок **"${name}"** не найден или у него скрыт профиль.`)
		})
	})
}

function drawPlaypaladinsSS(json) {
	const canvas = createCanvas(760, 330)
	const ctx = canvas.getContext('2d')
	ctx.font = 'bold 16px Georgia'

	return new Promise(resolve => {
		// загружаем случайный глобальный фон для статы
		const img = config.imgBackground[ Math.floor(Math.random() * 3) ] // случайный фон
		const main = json.main
		const kda = getKDABP(json.champions)
		let championList = []
		for (let i = 0; i < kda.best.length; i ++) {
			const champion = kda.best[i].champion
			championList.push( config.championsName[champion].loadedImg )
		}

		ctx.drawImage(img, 0, 0, 760, 300)
		drawItemsPlaypaladinsSS(ctx, main, kda) // рисуем эллементы не нужнающиеся в промисах

		if (!championList.length) resolve({ctx, main, kda}) // если чемпионов нет

		drawChampionsPlaypaladinsSS(ctx, championList) // рисуем загруженных чемпионов

		// data загружаемой картинки ранга
		const RankedKBM = main.RankedKBM || {}
		const Tier_RankedKBM = main.Tier_RankedKBM
		const rankNum = Tier_RankedKBM == 26 && RankedKBM.Rank <= 100 && RankedKBM.Rank > 0 ? 27 : Tier_RankedKBM
		const rankUrl = rankNum ? `divisions/${rankNum}.png` : 'no-rank.png'
		const rankImgWidth = 192
		const rankImgHeight = rankNum == 0 ? 224 : rankNum == 27 ? 241 : rankNum == 26 ? 221 : 192

		loadImage(rankUrl) // загружаем картинку ранга
		.then(img => {
			ctx.drawImage(img, 5, 10, rankImgWidth / 2, rankImgHeight / 2)
			resolve({ctx, main, kda})
		})
	})
}

function drawItemsPlaypaladinsSS(ctx, main, kda) {
	const RankedKBM = main.RankedKBM || {}
	const totalTime = kda.dmg + kda.flank + kda.tank + kda.heal
	const width = 200 // отступ от картинки ранга
	const dmgDeg = 360 * (kda.dmg / totalTime)
	const flankDeg = 360 * (kda.flank / totalTime)
	const tankDeg = 360 * (kda.tank / totalTime)
	//const healDeg = 360 * (kda.heal / totalTime)

	ctx.fillStyle = "#000000"
	ctx.fillRect(0, 300, 760, 330)

	ctx.textAlign = "center"
	ctx.font = 'bold 14px Georgia' // Franklin Gothic Medium
	ctx.fillStyle = "#00CCFF"
	ctx.fillText(`Информацию и помощь можно найти в группе бота / !hh - список команд`, 380, 320)
	ctx.font = 'bold 16px Georgia'
	ctx.fillStyle = "#dddddd"
	ctx.textAlign = "start"

	// рисуем инфу
	ctx.fillText(`${main.hz_player_name || main.hz_gamer_tag} (${main.Region})`, 10 + width / 2, 20)
	// ctx.fillText(`Клиент: ${main.Platform} - ${main.Name}`, 10 + width / 2, 40)
	ctx.fillText(`Уровень: ${main.Level}`, 10 + width / 2, 40)
	ctx.fillText(`Создан: ${getDateStats(main.Created_Datetime)}`, 10 + width / 2, 60)
	ctx.fillText(`Сыграно ${main.HoursPlayed} часов`, 10 + width / 2, 80)
	ctx.fillText(`Последний вход: ${getDateStats(main.Last_Login_Datetime)}`, 10 + width / 2, 100)
	ctx.fillText(`KDA: ${( (kda.kills + kda.assists / 2) / (kda.deaths + 1)).toFixed(2)}`, 10 + width / 2, 120)
	ctx.fillText(`Клиент: ${main.Platform} - ${main.Name}`, 10, 140)

	ctx.fillText(`ВСЕГО:`, 50, 170)
	ctx.fillText(`Убийств: ${kda.kills}`, 10, 190)
	ctx.fillText(`Смертей: ${kda.deaths}`, 10, 210)
	ctx.fillText(`Ассистов: ${kda.assists}`, 10, 230)
	ctx.fillText(`Побед: ${main.Wins}`, 10, 250)
	ctx.fillText(`Поражений: ${main.Losses}`, 10, 270)
	ctx.fillText(`Винрейт: ${fixNaN((main.Wins / (main.Wins + main.Losses) * 100).toFixed(0))}%`, 10, 290)

	ctx.fillText(`РАНКЕД:`, 250, 170)
	ctx.fillText(`Побед: ${ fixNaN(RankedKBM.Wins) }`, 200, 190)
	ctx.fillText(`Поражений: ${ fixNaN(RankedKBM.Losses) }`, 200, 210)
	const Tier_RankedKBM = main.Tier_RankedKBM
	const rankNum = Tier_RankedKBM == 26 && RankedKBM.Rank <= 100 && RankedKBM.Rank > 0 ? 27 : Tier_RankedKBM
	ctx.fillText(`Ранг: ${getRank(rankNum)}`, 200, 230)
	ctx.fillText(`ОТ: ${ fixNaN(RankedKBM.Points) }`, 200, 250)
	if (RankedKBM.Rank) ctx.fillText(`Позиция: ${ fixNaN(RankedKBM.Rank) }`, 200, 270)

	ctx.fillText("ЛЮБИМЫЕ ЧЕМПИОНЫ:", 480, 160)

	ctx.fillText("Роли:", 540, 20)
	ctx.fillText(`Урон - ${fixNaN((kda.dmg / totalTime * 100).toFixed(2))}%`, 600, 54)
	ctx.fillText(`Танк - ${fixNaN((kda.tank / totalTime * 100).toFixed(2))}%`, 600, 76)
	ctx.fillText(`Фланг - ${fixNaN((kda.flank / totalTime * 100).toFixed(2))}%`, 600, 98)
	ctx.fillText(`Хилл - ${fixNaN((kda.heal / totalTime * 100).toFixed(2))}%`, 600, 120)

	// рисуем диаграмму ->
	const second = tankDeg + dmgDeg
	const third = flankDeg + dmgDeg + tankDeg
	if (0 < dmgDeg) drawPieSlice(ctx, 510, 80, 50, 0, dmgDeg, "#9966FF")
	if (dmgDeg < second) drawPieSlice(ctx, 510, 80, 50, dmgDeg, tankDeg + dmgDeg, "#3399CC")
	if (second < third) drawPieSlice(ctx, 510, 80, 50, tankDeg + dmgDeg, flankDeg + dmgDeg + tankDeg, "#FF6600")
	if (third < 360) drawPieSlice(ctx, 510, 80, 50, flankDeg + dmgDeg + tankDeg, 360, "#33CC00")
	ctx.fillStyle = "#9966FF"
	ctx.fillRect(580, 40, 15, 15)
	ctx.fillStyle = "#3399CC"
	ctx.fillRect(580, 62, 15, 15)
	ctx.fillStyle = "#FF6600"
	ctx.fillRect(580, 84, 15, 15)
	ctx.fillStyle = "#33CC00"
	ctx.fillRect(580, 106, 15, 15)

	// любимые чемпионы ->
	ctx.fillStyle = "#009900"
	const best = kda.best
	if (best[0]) ctx.fillText(best[0].Rank, 439, 250)
	if (best[1]) ctx.fillText(best[1].Rank, 499, 250)
	if (best[2]) ctx.fillText(best[2].Rank, 559, 250)
	if (best[3]) ctx.fillText(best[3].Rank, 619, 250)
	if (best[4]) ctx.fillText(best[4].Rank, 679, 250)

	ctx.fillStyle = "#CC6600"
	if (best[0]) ctx.fillText(fixNaN(((best[0].Kills + best[0].Assists / 2) / (best[0].Deaths + 1)).toFixed(2)), 437, 270)
	if (best[1]) ctx.fillText(fixNaN(((best[1].Kills + best[1].Assists / 2) / (best[1].Deaths + 1)).toFixed(2)), 497, 270)
	if (best[2]) ctx.fillText(fixNaN(((best[2].Kills + best[2].Assists / 2) / (best[2].Deaths + 1)).toFixed(2)), 557, 270)
	if (best[3]) ctx.fillText(fixNaN(((best[3].Kills + best[3].Assists / 2) / (best[3].Deaths + 1)).toFixed(2)), 617, 270)
	if (best[4]) ctx.fillText(fixNaN(((best[4].Kills + best[4].Assists / 2) / (best[4].Deaths + 1)).toFixed(2)), 677, 270)

	ctx.fillStyle = "#0088bb"
	if (best[0]) ctx.fillText(`${getWinrate(best[0].Wins, best[0].Losses)}%`, 437, 290)
	if (best[1]) ctx.fillText(`${getWinrate(best[1].Wins, best[1].Losses)}%`, 497, 290)
	if (best[2]) ctx.fillText(`${getWinrate(best[2].Wins, best[2].Losses)}%`, 557, 290)
	if (best[3]) ctx.fillText(`${getWinrate(best[3].Wins, best[3].Losses)}%`, 617, 290)
	if (best[4]) ctx.fillText(`${getWinrate(best[4].Wins, best[4].Losses)}%`, 677, 290)
}

function drawChampionsPlaypaladinsSS(ctx, imgList) {
	let positionX = 430
	for (let i = 0; i < imgList.length; i++) {
		const img = imgList[i]
		const x = positionX + 60 * i
		ctx.drawImage(img, x, 180, 50, 50)
	}
}
// <--- draw playpaladins small stats <---



// ---> draw playpaladins history --->
function playpaladinsSH(mess, name) {
	return new Promise(resolve => {
		searchPaladinsMatch(name)
		.then(resolve)
		.catch(err => {
			mess.reply(`Ошибка, игрок не найден или у игрока "${name}" скрыт профиль.`)
		})
	})
}

function drawPlaypaladinsSH(matches) {
	if (matches.length > 10) matches.length = 10 // убираем не нужные матчи
	const imgWidth = 1175
	const canvas = createCanvas(imgWidth, 590)
	const ctx = canvas.getContext('2d')
	ctx.font = 'bold 15px Georgia'

	ctx.fillStyle = "#000000"
	ctx.fillRect(0, 0, imgWidth, 30)
	ctx.fillRect(0, 560, imgWidth, 590)
	ctx.fillStyle = "#dddddd"

	return new Promise(resolve => {
		if (matches[0].ret_msg) {
			console.log( matches[0].ret_msg )
			return resolve({ctx, ret_msg: "Матчи не найдены или профиль скрыт"})
		}

		// загружаем случайный глобальный фон для статы
		const img = config.imgBackground[ Math.floor(Math.random() * 3) ] // случайный фон
		ctx.drawImage(img, 0, 30, imgWidth, 530)
		drawItemsPlaypaladinsSH(ctx, matches) // рисуем эллементы не нужнающиеся в промисах

		// получаем до 10 картинок персонажей с истории
		try {
			let champList = []
			matches.forEach(item => {
				const champion = item.Champion
				champList.push( config.championsName[champion].loadedImg )
			})

			drawChampionsPlaypaladinsSH(ctx, champList) // рисуем загруженных чемпионов
			return resolve({ctx})
		} catch(e) {
			console.log(e)
			return resolve({ctx, ret_msg: "Ошибка загрузки чемпиона. Сообщите об этом разработчику."})
		}
	})
}

function drawItemsPlaypaladinsSH(ctx, matches) {
	const pos = [70, 235, 345, 425, 550, 655, 705, 805, 885, 975, 1085]
	ctx.textAlign = "center"
	ctx.font = 'bold 14px Georgia' // Franklin Gothic Medium
	ctx.fillStyle = "#00CCFF"
	ctx.fillText(`Информацию и помощь можно найти в группе бота / !hh - список команд`, 545, 580)
	ctx.font = 'bold 15px Georgia'
	ctx.fillStyle = "#dddddd"
	ctx.textAlign = "start"

	// рисуем таблицу для инфы
	ctx.fillText(`Дата`, pos[0], 20)
	ctx.fillText(`Статус`, pos[1], 20)
	ctx.fillText(`Время`, pos[2], 20)
	ctx.fillText(`Режим`, pos[3], 20)
	ctx.fillText(`id матча`, pos[4], 20)
	ctx.fillText(`КДА`, pos[5], 20)
	ctx.fillText(`Детально`, pos[6], 20)
	ctx.fillText(`Урон`, pos[7], 20)
	ctx.fillText(`Защита`, pos[8], 20)
	ctx.fillText(`Исцеление`, pos[9], 20)
	ctx.fillText(`Кредиты`, pos[10], 20)

	const len = matches.length
	// цикл с писаниной о инфе
	for (let i = 0; i < len; i++) {
		const item = matches[i]
		const kda = ((item.Kills + item.Assists / 2) / (item.Deaths + 1)).toFixed(2)

		ctx.fillStyle = "#dddddd"
		ctx.fillText(`${ getDateStats(item.Match_Time) }`, pos[0], 52 * i + 60)
		// сатус пропускаем pos[1]
		ctx.fillStyle = "#0088bb"
		ctx.fillText(`${ secToMin(item.Time_In_Match_Seconds) }`, pos[2], 52 * i + 60)
		ctx.fillStyle = "#dddddd"
		// тип пропускаем pos[3]
		ctx.fillText(`${item.Match}`, pos[4], 52 * i + 60) // id
		ctx.fillStyle = "#CC6600"
		ctx.fillText(`${kda}`, pos[5], 52 * i + 60)
		ctx.fillStyle = "#9966FF"
		ctx.fillText(`${item.Kills}/${item.Deaths}/${item.Assists}`, pos[6], 52 * i + 60)
		ctx.fillStyle = "#dddddd"
		ctx.fillText(`${item.Damage}`, pos[7], 52 * i + 60)
		ctx.fillText(`${item.Damage_Mitigated}`, pos[8], 52 * i + 60)
		ctx.fillText(`${item.Healing}`, pos[9], 52 * i + 60)
		ctx.fillStyle = "#CC6600"
		ctx.fillText(`${item.Gold}`, pos[10], 52 * i + 60)

		const getStats = item.Win_Status
		const status = getStats == "Win" ? "Победа" : getStats == "Loss" ? "Поражение" : "-"
		const statusColor = status == "Победа" ? "#00bb00" : "#bb0000"

		const getQueue = item.Queue
		const queue = getQueue == "Siege" ? "Осада" : 
			getQueue == "Siege Training" ? "Осада (Б)" : 
			getQueue == "Ranked" ? "Ранкед" : 
			getQueue == "Onslaught" ? "Натиск" : 
			getQueue == "Onslaught Training" ? "Натиск (Б)" : 
			getQueue == "Team Deathmatch" ? "Насмерть" : 
			getQueue == "Team Deathmatch Training" ? "Насмерть (Б)" : 
			getQueue == "Test Maps" ? "Тестовые" : getQueue

		ctx.fillStyle = statusColor
		ctx.fillText(`${status}`, pos[1], 52 * i + 60) // сатус
		ctx.fillStyle = "#dddddd"
		ctx.fillText(`${queue}`, pos[3], 52 * i + 60) // Режим
	}
}

function drawChampionsPlaypaladinsSH(ctx, imgList) { // рисуем чемпионов в истории
	const positiony = 30
	for (let i = 0; i < imgList.length; i++) {
		const img = imgList[i]
		const y = positiony + 52 * i
		ctx.drawImage(img, 10, y, 50, 50)
	}
}
// <--- draw playpaladins history <---



// ---> draw playpaladins history --->
function paladinsSL(mess, name, championName, num) {
	return new Promise((resolve) => {
		searchPaladinsLoadouts(name, championName, num)
		.then((obj) => {
			if (obj.err) resolve(obj) // если нужно прекратить команду

			const listLoadouts = obj.listLoadouts
			const listLoadoutsLen = listLoadouts.length

			if (!listLoadoutsLen) {
				mess.reply(`Игрок не имеет колод для **${championName}**.`)
				obj.err = true
				return resolve(obj)
			}

			if (num > listLoadoutsLen) {
				mess.reply(`Игрок не имеет столько колод, у него **${listLoadoutsLen}** колод.`)
				resolve({err: true}) // ничего больше не делаем, завершаем
			} else if (!num && listLoadoutsLen > 1) {
				let text = ``

				for (let i = 0; i < listLoadoutsLen; i++) {
					const deck = listLoadouts[i]
					text += `\r\n№ **${i + 1}**; Имя колоды: **${deck.DeckName}**.`
				}

				mess.reply(`**Выберите одну из колод, повторив команду и вписав нужную цифру в конце:**${text}`)
				resolve({err: true}) // ничего больше не делаем, завершаем
			}
			resolve(obj)
		})
		.catch(err => {
			mess.reply(`Ошибка, игрок не найден или у игрока "${name}" скрыт профиль.`)
		})
	})
}

function searchPaladinsLoadouts(name, championName, num) { // возвращает массив колод указанного персонажа
	return new Promise(resolve => {
		hiRezFunc("searchplayers", {name})
		.then(function(res){ // ретранслятор
			return new Promise(resolve => {
				return resolve( getSearchplayers(res, true) )
			})
		})
		.then((player => {
			if (!player || player.ret_msg) return resolve({err: true}) // если скрыт профиль

			const playerId = player.player_id
			hiRezFunc("getplayerloadouts", {id: playerId, lang: "11"})
			.then(loadouts => {
				const champId = config.championsName[championName].id

				const filterLoadouts = loadouts.filter(item => { // сортируем по указанному чемпиону
					return item.ChampionId == champId
				})
				resolve({listLoadouts: filterLoadouts, num}) // array
			})
		}))
	})
}


function drawPaladinsSL({listLoadouts, num, err}) { // num это какую колоду брать (num не меньше 1 и целое!)
	num = num || 1
	if (err) return new Promise(resolve => {resolve({err})}) // если была ошибка

	const imgWidth = 1648
	const imgHeight = 600
	const canvas = createCanvas(imgWidth, imgHeight)
	const ctx = canvas.getContext('2d')
	ctx.font = 'bold 15px Georgia'
	ctx.fillStyle = "#ffffff"
	ctx.textAlign = "center"

	const background = config.imgBackground[ Math.floor(Math.random() * 3) ] // случайный фон
	ctx.drawImage(background, 0, 0, imgWidth, imgHeight)

	return new Promise(resolve => {
		let loadList = [] // тут будет картинки
		let listDeck = [] // тут будут свойства для картинки
		let listDescription = [] // тут будут описания карт

		listLoadouts.forEach(loadouts => { // перебор колод
			const deckName = loadouts.DeckName
			const champId = loadouts.ChampionId
			loadouts.LoadoutItems.forEach(items => { // перебор карт в колоде
				const points = items.Points
				const cardId = items.ItemId
				const card = getPaladinsCard(cardId, champId)

				listDeck.push( {deckName, points} )
				// загружаем картинки карт
				loadList.push( loadImage(card.url).catch(console.log) )
				// тут можно добавить setPaladinsCard что бы брать уже загруженные ранее карты и не грузить их дважды
				listDescription.push(card.description)
			})
		})

		loadList = loadList.slice((num - 1) * 5, num * 5) // обрезаем
		listDeck = listDeck.slice((num - 1) * 5, num * 5)
		listDescription = listDescription.slice((num - 1) * 5, num * 5)

		Promise.all(loadList)
		.then(imgListLoad => {
			for (let i = 0; i < imgListLoad.length; i++) { // перебор загруженных картинок
				const img = imgListLoad[i] // загруженная картинка карты
				const properties = listDeck[i] // свойства картинки (имя и на скок вкачано)

				if (img) ctx.drawImage(img, i * (10 + 314) + 48, 150, 256, 196) // рисуем картинки карт
				// теперь нужно нарисовать фреймы для карт
				const points = properties.points
				const imgFrames = config.cardFrames[points - 1] // получаем картинку фрейма карты
				ctx.drawImage(imgFrames, i * (10 + 314) + 20, 100, 314, 479)

				// рисуем название колоды
				ctx.font = 'bold 50px Georgia'
				ctx.fillStyle = "#ffffff"
				ctx.fillText(properties.deckName, imgWidth / 2, 70)

				// рисуем описание карты
				fillDescriptionCard(ctx, listDescription[i], i, points)
			}

			resolve({ctx})
		})
	})
}


// возвращает url и описание карты по id чемпиона и id карты
function getPaladinsCard(idCard, idChamp) {
	const champCards = config.championsCard[idChamp]

	for (let i = 0; i < champCards.length; i++) {
		const card = champCards[i]
		if (card.card_id2 == idCard) return {
			url: card.championCard_URL,
			description: card.card_description,
			name: card.card_name
		}
	}
}


function fillDescriptionCard(ctx, text, position, points) { // рисует описание карты
	ctx.font = 'bold 16px Georgia'
	ctx.fillStyle = '#000000'

	text = text.replace(/^\[[а-я -]+\] /i, '') // убираем принадлежность (то что в [...])

	// убираем "scale" и считаем нужную цифру подставляя в текст
	const matchArr = text.match(/\{scale ?= ?([0-9\.]+)\|([0-9\.]+)\}/i)
	const scaleText = (matchArr[1] * points).toFixed(1)
	text = text.replace(/\{scale=[0-9\.]+\|[0-9\.]+\}/i, scaleText)

	// сначала разбиваем текст строки на нужное кол-во строк и узнаем сколько это строк
	const textArr = formProposals(text, 23)
	for (let i = 0; i < textArr.length; i++) {
		ctx.fillText(textArr[i], position * (10 + 314) + 178, 20 * i + 410)
	}
}


function formProposals(text, maxLen) { // возвращает массив, разделяет строку на части
	if (text.length <= 25) return [text]
	let newText = []
	let tempLen = maxLen
	let lastIndex = 0

	while (true) {
		const letter = text.slice(tempLen - 1, tempLen)
		if (!letter) {
			// если пусто, то вставляем оставшееся
			const g = text.slice(lastIndex, tempLen)
			if (g) newText.push( g )
			return newText
		} else if (letter !== ' ') { // если не пустая строка то пропускаем
			tempLen-- // сдвигаем влево поиск
			// если слово 25 символов?
		} else { // если пустая строка то нужно будет разбивать
			newText.push( text.slice(lastIndex, tempLen).trim() )
			lastIndex = tempLen
			tempLen += maxLen // продолжим поиски с того места где закончили + максимальная длина
		}
	}
}


// const championsIds = {
// 	"Androxus": {id: "2205"},
//     "Cassie": {id: "2092"},
//     "Drogoz": {id: "2277"},
//     "Kinessa": {id: "2249"},
//     "Lian": {id: "2417"},
//     "Maeve": {id: "2338"},
// 	"Bomb King": {id: "2281"},
// 	"Sha Lin": {id: "2307"},
//     "Strix": {id: "2438"},
//     "Koga": {id: "2493"},
//     "Buck": {id: "2147"},
//     "Pip": {id: "2056"},
//     "Moji": {id: "2481"},
//     "Evie": {id: "2094"},
//     "Makoa": {id: "2288"},
//     "Zhin": {id: "2420"},
//     "Viktor": {id: "2285"},
//     "Willo": {id: "2393"},
//     "Dredge": {id: "2495"},
//     "Lex": {id: "2362"},
//     "Tyra": {id: "2314"},
//     "Ruckus": {id: "2149"},
//     "Grohk": {id: "2093"},
//     "Talus": {id: "2472"},
//     "Skye": {id: "2057"},
// 	"Mal'Damba": {id: "2303"},
//     "Imani": {id: "2509"},
//     "Grover": {id: "2254"},
//     "Furia": {id: "2491"},
//     "Khan": {id: "2479"},
//     "Io": {id: "2517"},
//     "Barik": {id: "2073"},
//     "Jenos": {id: "2431"},
//     "Vivian": {id: "2480"},
//     "Fernando": {id: "2071"},
//     "Atlas": {id: "2512"},
//     "Ying": {id: "2267"},
//     "Ash": {id: "2404"},
//     "Inara": {id: "2348"},
//     "Raum": {id: "2528"},
//     "Seris": {id: "2372"},
//     "Torvald": {id: "2322"},
// 	"Terminus": {id: "2477"},
// 	"Tiberius": {id: "2529"}
// }

// function fixChampion(text) {
// 	while (true) {
// 		const sh = text.indexOf('\'')
// 		if (sh != -1) text = text.slice(0, sh) + '' + text.slice(sh + 1)
// 		const space = text.indexOf(' ')
// 		if (space == -1) break
// 		text = text.slice(0, space) + '' + text.slice(space + 1)
// 		const defis = text.indexOf('-')
// 		if (defis == -1) break
// 		text = text.slice(0, defis) + '' + text.slice(defis + 1)
// 		const bottomDefis = text.indexOf('_')
// 		if (bottomDefis == -1) break
// 		text = text.slice(0, bottomDefis) + '' + text.slice(bottomDefis + 1)
// 	}
// 	return text.toLowerCase()
// }

const paladinsItems = {
	'blast shields': null,
	'bulldozer': null,
	'cauterize': null,
	'chronos': null,
	'deft hands': null,
	'haven': null,
	'illuminate': null,
	'kill to heal': null,
	'life rip': null,
	'master riding': null,
	'morale boost': null,
	'nimble': null,
	'rejuvenate': null,
	'resilience': null,
	'veteran': null,
	'wrecker': null
}
// <--- draw playpaladins history <---



// ---> draw !sm stats match id --->
function drawMatchdetails(mess, matchDetails) { // рисует
	const imgWidth = 1240
	const imgHeight = 795
	const canvas = createCanvas(imgWidth, imgHeight)
	const ctx = canvas.getContext('2d')
	ctx.font = 'bold 15px Georgia'
	ctx.fillStyle = "#ffffff"
	try {
		const background = config.imgBackground[ Math.floor(Math.random() * 3) ] // случайный фон
		ctx.drawImage(background, 0, 0, imgWidth, imgHeight)
		const matchOne = matchDetails[0] // просто выбранный первый человек в матче для получения статы самого матча

		// инфа по центру
		let mapImg = null // узнаем карту, поулчаем ее картинку
		let mapName = ''
		for (let map in paladinsMaps) {
			const reg = new RegExp(`${map}`, 'i')
			const res = matchOne.Map_Game.replace(/'/,'').match(reg)
			if (res) {
				mapImg = paladinsMaps[map]
				mapName = res[0]
				break
			}
		}
		if (!mapName) {
			mapName = matchOne.Map_Game || 'test'
			mapImg = paladinsMaps['test maps']
		}
		if (mapImg) ctx.drawImage(mapImg, 10, 315, 356, 200) // рисуем карту
		ctx.font = 'bold 20px Georgia'
		ctx.fillText(matchOne.Entry_Datetime, 20, 502)

		const typeMatch = matchOne.name
		ctx.fillStyle = "#cccc11"
		ctx.fillText(`${matchOne.Minutes} минут`, 376, 375)
		ctx.fillText(`Регион: ${matchOne.Region}`, 376, 405)
		ctx.fillText(typeMatch, 376, 435)
		ctx.fillText(mapName, 376, 465)

		ctx.textAlign = "center"
		const winStatus = matchOne.Win_Status == 'Winner'
		const centerGoRight = typeMatch == 'Ranked' ? 0 : 190
		if (winStatus) {
			ctx.fillStyle = '#32CD32'
			ctx.fillText('Победа', imgWidth / 2 + 70 + centerGoRight, 341)
			ctx.fillStyle = '#BB1111'
			ctx.fillText('Поражение', imgWidth / 2 + 70 + centerGoRight, 497)

			ctx.fillStyle = 'rgba(50,205,50,0.06)'
			ctx.fillRect(0, 30, imgWidth, 285)
			ctx.fillStyle = 'rgba(187,17,17,0.1)'
			ctx.fillRect(0, 515, imgWidth, 285)
		} else { // эта часть не нужна походу так как победителя всегда перемещаются вверх
			ctx.fillStyle = '#BB1111'
			ctx.fillText('Поражение', imgWidth / 2 + 70 + centerGoRight, 341)
			ctx.fillStyle = '#32CD32'
			ctx.fillText('Победа', imgWidth / 2 + 70 + centerGoRight, 497)

			ctx.fillStyle = 'rgba(187,17,17,0.1)'
			ctx.fillRect(0, 30, imgWidth, 285)
			ctx.fillStyle = 'rgba(50,205,50,0.06)'
			ctx.fillRect(0, 515, imgWidth, 285)
		}

		ctx.fillStyle = "#ffffff"
		ctx.fillText(`Команда 1 Счет: ${matchOne.Team1Score}`, imgWidth / 2 + 70 + centerGoRight, 383)
		ctx.fillText(`Команда 2 Счет: ${matchOne.Team2Score}`, imgWidth / 2 + 70 + centerGoRight, 456)
		ctx.drawImage(config.differentImg.vs, imgWidth / 2 + 40 + centerGoRight, 386, 50, 50)

		ctx.textAlign = "start"
		ctx.fillStyle = '#CC6600'
		if (typeMatch == 'Ranked') ctx.fillText(`Баны:`, 885, 420)
		ctx.fillStyle = "#ffffff"
		ctx.font = 'bold 15px Georgia'
		if (matchOne.Ban_1)ctx.drawImage(config.championsName[matchOne.Ban_1].loadedImg, 980, 360, 50, 50)
		if (matchOne.Ban_2)ctx.drawImage(config.championsName[matchOne.Ban_2].loadedImg, 1040, 360, 50, 50)
		if (matchOne.Ban_3)ctx.drawImage(config.championsName[matchOne.Ban_3].loadedImg, 980, 420, 50, 50)
		if (matchOne.Ban_4)ctx.drawImage(config.championsName[matchOne.Ban_4].loadedImg, 1040, 420, 50, 50)

		// рисуем таблицу
		ctx.fillStyle = "#000000"
		ctx.fillRect(0, 0, imgWidth, 32)
		ctx.fillStyle = "#1199cc"
		ctx.fillText('Чемпион', 10, 20)
		ctx.fillText('Игрок', 140, 20)
		ctx.fillText('Пати', 360, 20)
		ctx.fillText('Кредиты', 410, 20)
		ctx.fillText('K/D/A', 500, 20)
		ctx.fillText('Урон', 580, 20)
		ctx.fillText('Защита', 670, 20)
		ctx.fillText('Исцеление', 770, 20)
		ctx.fillText('Получено', 870, 20)
		ctx.fillText('У цели', 970, 20)
		ctx.fillText('Закуп', 1040, 20)
		ctx.fillStyle = "#ffffff"

		const party = {}
		let partyNumber = 1
		const partyColors = ['#00FFFF', '#006400', '#F08080', '#FFFF00', '#FF0000', '#4682B4', '#C71585', '#FF4500', '#7FFF00'].sort(function() {
			return Math.random() - 0.5 // рандомизируем цвета каждый раз
		})

		for (let i = 0; i < matchDetails.length; i++) {
			const players = matchDetails[i]
			//const champName = config.championsCard[players.ChampionId][0].champion_name
			const champName = players.Reference_Name

			const img = config.championsName[champName].loadedImg
			let nextTeam = i >= 5 ? 245 : 40
			ctx.drawImage(img, 10, 55 * i + nextTeam, 50, 50) // рисуем иконки чемпионов

			const imgLegendary = config.LegendarChampions[players.ItemId6]
			if (imgLegendary) ctx.drawImage(imgLegendary, 70, 55 * i + nextTeam, 50, 50) // рисуем легендарки

			ctx.drawImage(config.rankedImage[players.League_Tier], 130, 55 * i + nextTeam, 50, 50) // рисуем ранг

			// рисуем закуп
			const item1 = players.Item_Active_1
			if (item1) {
				ctx.drawImage(paladinsItems[item1.toLowerCase()], 1040, 55 * i + nextTeam, 40, 40)
				drawLevelItem(ctx, players.ActiveLevel1, 1040, 55 * i + nextTeam + 43, 10, 3)
			}
			const item2 = players.Item_Active_2
			if (item2) {
				ctx.drawImage(paladinsItems[item2.toLowerCase()], 1090, 55 * i + nextTeam, 40, 40)
				drawLevelItem(ctx, players.ActiveLevel2, 1090, 55 * i + nextTeam + 43, 10, 3)
			}
			const item3 = players.Item_Active_3
			if (item3) {
				ctx.drawImage(paladinsItems[item3.toLowerCase()], 1140, 55 * i + nextTeam, 40, 40)
				drawLevelItem(ctx, players.ActiveLevel3, 1140, 55 * i + nextTeam + 43, 10, 3)
			}
			const item4 = players.Item_Active_4
			if (item4) {
				ctx.drawImage(paladinsItems[item4.toLowerCase()], 1190, 55 * i + nextTeam, 40, 40)
				drawLevelItem(ctx, players.ActiveLevel4, 1190, 55 * i + nextTeam + 43, 10, 3)
			}

			const partyId = players.PartyId
			let partyNum = party[partyId]
			if (!partyNum) {
				party[partyId] = partyNum = partyNumber
				partyNumber++
			}

			ctx.fillText(players.playerName, 200, 55 * i + nextTeam + 15)
			ctx.fillStyle = "#CC6600"
			ctx.fillText(`lvl: ${players.Account_Level}`, 200, 55 * i + nextTeam + 40)

			nextTeam += 25

			ctx.fillStyle = partyColors[partyNum - 1]
			ctx.beginPath()
			ctx.arc(380, 55 * i + nextTeam - 2, 15, 0, 2*Math.PI, false) // круг пати
			ctx.fill()
			ctx.fillStyle = "#000000"
			ctx.fillText(partyNum, 376, 55 * i + nextTeam) // цифра пати
			ctx.fillStyle = "#ffffff"
			ctx.fillText(players.Gold_Earned, 410, 55 * i + nextTeam)
			ctx.fillStyle = "#CC6600"
			ctx.fillText(`${players.Kills_Player}/${players.Deaths}/${players.Assists}`, 500, 55 * i + nextTeam)
			ctx.fillStyle = "#ffffff"
			ctx.fillText(players.Damage_Player, 580, 55 * i + nextTeam)
			ctx.fillText(players.Damage_Mitigated, 670, 55 * i + nextTeam)
			ctx.fillText(players.Healing, 770, 55 * i + nextTeam)
			ctx.fillText(players.Damage_Taken, 870, 55 * i + nextTeam)
			ctx.fillText(players.Objective_Assists, 970, 55 * i + nextTeam)
		}
		return {ctx}
	} catch(e) {
		console.log("\r\nОшибка в drawMatchdetails:")
		console.log(e)
		mess.reply(`Возникла непредвиденная ошибка, сообщите о ней разработчикам бота.`)
		return {err: true}
	}
}

function drawLevelItem(ctx, lvl, x, y) { // рисует полоски под закупом (их лвл)
	for (let i = 0; i <= lvl; i++) {
		ctx.fillRect(x + 14 * i, y, 10, 3)
	}
}

let paladinsMaps = {
	'abyss': null,
	'abyss spire': null,
	'ascension peak': null,
	'bazaar': null,
	'brightmarsh': null,
	'dragon arena': null,
	'dragon call': null,
	'fish market': null,
	'foremans rise': null,
	'frog isle': null,
	'frozen guard': null,
	'ice mines': null,
	'jaguar falls': null,
	'magistrates archives': null,
	'marauders port': null,
	'primal court': null,
	'serpent beach': null,
	'shattered desert': null,
	'shooting range': null,
	'snowfall junction': null,
	'splitstone quarry': null,
	'stone keep': null,
	'test maps': null,
	'timber mill': null,
	'trade district': null,
	'warders gate': null
}
// <--- draw !sm stats match id <---



// ---> рисует !sp статистику матча в реальном времени (или отсылает текст) --->
function drawPaladinsPlayerStatus(status, name) {
	return new Promise(resolve => {
		const ss = status[0]
		const statusText = [
			"Оффлайн",
			"В лобби (например меню)",
			"Выбирает чемпиона (бывает баг после стрельбища)",
			"В матче (может загружаться)",
			"Онлайн (хз как это получилось, у меня не вышло получить такой статус)",
			false
		]

		const statusMess = statusText[ss.status]
		if (!statusMess) resolve({err: "У игрока скрыт профиль, но это сообщение не должно выводится, теоретически -_-"}) // если не найден

		const matchId = ss.Match
		if (matchId) {
			hiRezFunc("getmatchplayerdetails", {id: matchId}) // просмотр матча в реальном времени
			.then(championList => {
				if ( typeof(championList[0].ret_msg) == "string") return resolve({err: `Игрок **${name}** играет с ботами или в пользовательском режиме.`})
				championList.sort((a, b) => {return a.taskForce - b.taskForce}) // сортируем по командам

				const imgWidth = 952
				const imgHeight = 535
				const canvas = createCanvas(imgWidth, imgHeight)
				const ctx = canvas.getContext('2d')
				ctx.font = 'bold 16px Georgia'

				const game = championList[0]
				const mapName = game.mapGame || 'Test Maps'
				try {
					const tempMapName = mapName.replace(/live/i, '').replace(/'/i, '').replace(/\(KOTH\)/i, '').replace(/ranked/i, '').replace(/\(TDM\)/i, '').replace(/Local/i, '').trim()
					if (tempMapName.toLowerCase() == 'shooting range') return resolve({err: `Игрок **${name}** находится в стрельбище.`})
					const background = paladinsMaps[tempMapName.toLowerCase()]
					ctx.drawImage(background, 0, 0, imgWidth, imgHeight)
				} catch(e) {
					console.log(`\r\nКарта ${mapName} не найдена. Ошибка:`)
					console.log(e)
					return resolve({err: 'Ошибка загрузка карты.'})
				}

				ctx.fillRect(0, 0, imgWidth, 40)
				ctx.fillRect(0, imgHeight - 40, imgWidth, imgHeight)

				ctx.fillStyle = "#0088bb"
				ctx.fillText('Команда 1', 35, 25)
				ctx.textAlign = 'end'
				ctx.fillText('Команда 2', imgWidth - 35, 25)
				ctx.fillText(`Карта: `, imgWidth / 4, imgHeight - 15)
				ctx.fillText(`Регион: `, imgWidth / 4 + imgWidth / 2, imgHeight - 15)
				ctx.fillText(`id матча: `, imgWidth / 2, 25)
				ctx.textAlign = 'start'
				ctx.fillStyle = "#CC6600"
				ctx.fillText(` ${mapName}`, imgWidth / 4, imgHeight - 15)
				ctx.fillText(` ${game.playerRegion}`, imgWidth / 4 + imgWidth / 2, imgHeight - 15)
				ctx.fillText(` ${matchId}`, imgWidth / 2, 25)
				ctx.fillStyle = '#ffffff'

				const playerIdsList = [] // список id игроков
				for (let i = 0; i < championList.length; i++) {
					const item = championList[i]
					const img = config.championsName[item.ChampionName].loadedImg
					playerIdsList.push(item.playerId) // добавляем их в список
					if (item.taskForce == 1) {
						ctx.drawImage(img, 70, 90 * i + 50, 50, 50)
						ctx.fillText(item.playerName, 130, 90 * i + 65)
						ctx.fillText(item.Account_Level, 130, 90 * i + 90)
						ctx.textAlign = 'center'
						ctx.fillText(item.ChampionLevel, 95, 90 * i + 120)
						ctx.textAlign = 'start'
					} else if (item.taskForce == 2) {
						ctx.drawImage(img, imgWidth - 120, 90 * (i - 5) + 50, 50, 50)
						ctx.textAlign = 'end'
						ctx.fillText(item.playerName, imgWidth - 130, 90 * (i - 5) + 65)
						ctx.fillText(item.Account_Level, imgWidth - 130, 90 * (i - 5) + 90)
						ctx.textAlign = 'center'
						ctx.fillText(item.ChampionLevel, imgWidth - 95, 90 * (i - 5) + 120)
					}
				}

				const vs = config.differentImg.vs
				ctx.drawImage(vs, imgWidth / 2 - 70, imgHeight / 2 - 70, 140, 140)

				hiRezFunc("getplayerbatch", playerIdsList)
				.then(list => {
					// перебираем list и playerIdsList проверяя на id и рисуя по позиции i от playerIdsList
					for (let i = 0; i < playerIdsList.length; i++) { // рисуем ранги
						// if (championList[i].taskForce == 2 && i < 5) continue // фикс бага со скрытым игроком

						const id = playerIdsList[i]
						const acc = getAccForId(list, id)

						// если acc найден то рисуем
						const tier = acc.Tier_RankedKBM
						if (tier == undefined) continue
						const imgRank = config.rankedImage[tier] // получаем картинку ранга
						const coefficient = tier == 27 ? 1.257 : tier == 26 ? 1.151 : tier == 0 ? 1.2 :1
						if (i < 5) {
							ctx.drawImage(imgRank, 10, 90 * i + 50, 50, 50 * coefficient)
						} else {
							ctx.drawImage(imgRank, imgWidth - 60, 90 * (i - 5) + 50, 50, 50 * coefficient)
						}
					}

					return resolve({ctx})
				})
			})
		} else {
			return resolve({err: `Игрок **${name}** ${statusMess}.`})
		}
	})
}

function getAccForId(list, id) {
	for (let i = 0; i < list.length; i++) {
		const acc = list[i]
		if (acc.Id == id) return acc
	}
	return false
}
// <--- рисует !sp статистику матча в реальном времени (или отсылает текст) <---



// ---> functions for GURU --->
// обрабатывает параметры до вызова основной функции поиска на гуру (поиск по сохраненным никам)
function prefStatsGuru(mess, name, getStats) {
	try {
		if (name) {
			name = name.trim()
			// если начинается как пользователь, то тупо вырезаем все числа
			//if (name.indexOf("<@") == 0 || name.indexOf("@") == 0) name = name.replace(/[^0-9]+/ig, "")
			if ( name.match(/<@![0-9]+>/i) ) name = name.slice(3).slice(0, -1) // убираем еще хрень...
			if (name.indexOf("<@") == 0) name = name.slice(2).slice(0, -1) // убираем еще хрень...
			if (name.indexOf("@") == 0) name = name.slice(1) // если поставили @ то убираем ее
			//if (!name || name === "me") name = mess.author.id // если не указан, то это автор
			//if ( isNaN(+name) ) name = searchUser(name).id // ищем пользователя, его id
		}

		if (!name || name === "me") { // если имеется в виду свой ник
			console.log("1")
			sendSite( getFormsParams(mess.author.id) ) // получаем свой ник
			.then(response => {
				const res = JSON.parse(response.body)
				const userName = res.paladins_name
				if (!userName) return mess.reply(`У вас нет сохраненного ника. Используйте команду **!me ВАШ НИК** что бы сохранить ваш ник.`)
				getStats( userName.replace(/[\\!@#$%^&*()\[\]\=\+]+/, '') )
			})
		} else if (/#[0-9]{4}$/i.test(name)) { // если указан чужой ник
			console.log("2")
			const user = searchUser(name) // ищем id указанного юзера
			if (!user) return mess.reply(`Пользователь **${name}** не найден.`)
			const userId = user.id

			sendSite( getFormsParams(userId) ) // получаем чужой ник
			.then(response => {
				const res = JSON.parse(response.body)
				const userName = res.paladins_name
				if (!userName) return mess.reply(`Пользователь **${name}** не имеет сохраненного ника.`)
				getStats( userName.replace(/[\\!@#$%^&*()\[\]\=\+]+/, '') )
			})
		} else if (/^[0-9]+$/i.test(name)) { // если только цифры - id пользователя которого посмотреть стату
			console.log("3")
			sendSite( getFormsParams(name) ) // получаем чужой ник
			.then(response => {
				const res = JSON.parse(response.body)
				const userName = res.paladins_name
				if (!userName) return mess.reply(`Пользователь **${name}** не имеет сохраненного ника.`)
				getStats( userName.replace(/[\\!@#$%^&*()\[\]\=\+]+/, '') )
			})
		} else {
			console.log("4")
			getStats( name.replace(/[\\!@#$%^&*()\[\]\=\+]+/, '') ) // replace вроде как нужен...
		}
	} catch(e) {
		console.log(e)
		return mess.reply(`Неизвестная ошибка, сообщите о ней разработчику. Параметры: ${name}`)
	}
}

// <--- functions for GURU <---



// ---> PALADINS STATS default function --->
function getRank(n) { // переводит цифры в ранг
	switch (n) {
		case 1: return 'Бронза 5'
		case 2: return 'Бронза 4'
		case 3: return 'Бронза 3'
		case 4: return 'Бронза 2'
		case 5: return 'Бронза 1'
		case 6: return 'Сильвер 5'
		case 7: return 'Сильвер 4'
		case 8: return 'Сильвер 3'
		case 9: return 'Сильвер 2'
		case 10: return 'Сильвер 1'
		case 11: return 'Золото 5'
		case 12: return 'Золото 4'
		case 13: return 'Золото 3'
		case 14: return 'Золото 2'
		case 15: return 'Золото 1'
		case 16: return 'Платина 5'
		case 17: return 'Платина 4'
		case 18: return 'Платина 3'
		case 19: return 'Платина 2'
		case 20: return 'Платина 1'
		case 21: return 'Алмаз 5'
		case 22: return 'Алмаз 4'
		case 23: return 'Алмаз 3'
		case 24: return 'Алмаз 2'
		case 25: return 'Алмаз 1'
		case 26: return 'Мастер'
		case 27: return 'ГМ'
		default: return 'Калибровка'
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

function getWinrate(wins, loses) {
	if (!wins) return 0;
	if (!loses) return 100;
	return (wins / (loses + wins) * 100).toFixed(0);
}

function getDateStats(d) {
	return new Date(d).toLocaleString("ru", {year: 'numeric', month: 'numeric', day: 'numeric', 
		hour: 'numeric', minute: 'numeric', timeZone: "UTC", hour12: false})
}

function getKDABP(champions) { // kill, death, assist, больеш всего времени - чемпион, больше всего времени - роль
	let kills = 0, assists = 0, deaths = 0, heal = 0, dmg = 0, tank = 0, flank = 0

	for (let i = 0; i < champions.length; i++) {
		kills += champions[i].Kills
		assists += champions[i].Assists
		deaths += champions[i].Deaths

		champions.sort( (a, b) => b.Minutes - a.Minutes ) // сортируем

		switch ( getRole(champions[i].champion) ) {
			case 'dmg': dmg += champions[i].Minutes;break
			case 'flank': flank += champions[i].Minutes;break
			case 'heal': heal += champions[i].Minutes;break
			case 'tank': tank += champions[i].Minutes;break
		}
	}

	return {kills, deaths, assists, best: champions.slice(0, 5), dmg, flank, heal, tank}
}

function getRole(name) { // основываясь на имени персонажа возвращает его роль
	let heals = ["Mal'Damba", "Ying", "Grover", "Jenos", "Grohk", "Pip", "Seris", "Furia", "Io", "Corvus"],
		dmgs = ["Lian", "Cassie", "Drogoz", "Strix", "Viktor", "Sha Lin", "Bomb King", "Kinessa", "Tyra", "Vivian", "Willo", "Dredge", "Imani"],
		flanks = ["Androxus", "Buck", "Zhin", "Evie", "Koga", "Talus", "Maeve", "Skye", "Lex", "Moji", "Tiberius"],
		tanks = ["Makoa", "Fernando", "Ruckus", "Barik", "Ash", "Khan", "Torvald", "Inara", "Terminus", "Atlas", "Raum"]

	return heals.indexOf(name) != -1 ? 'heal' : 
		dmgs.indexOf(name) != -1 ? 'dmg' : 
		flanks.indexOf(name) != -1 ? 'flank' : 
		tanks.indexOf(name) != -1 ? 'tank' : false
}

function drawPieSlice(ctx, centerX, centerY, radius, startAngle, endAngle, color) {
	ctx.fillStyle = color
	ctx.beginPath()
	ctx.moveTo(centerX, centerY)
	ctx.arc(centerX, centerY, radius, getRadians(startAngle), getRadians(endAngle))
	ctx.closePath()
	ctx.fill()
}


function getFormsParams(id, name=false) { // бытро формирует обьект с парамметрами
	return {
		method: "POST", 
		url: config.url_site, 
		form: {
			token: config.dbToken, 
			type: name ? 'set_bot_me' : 'get_bot_me', 
			user_id: id,
			username: name
		}
	}
	//if (name) obj.form.username = name
	//return obj
}

function fixNaN(num) {
	if (isNaN(num)) return 0
	return num
}

function getRadians(degrees) {return (Math.PI / 180) * degrees}


function getSearchplayers(players, needId=false) { // возвращает нужного игрока - промис, либо false либо обьект с ошибкой
	return new Promise(resolve => {
		if (!players || !players[0]) resolve(false) // если пусто
		if (players.length == 1) {
			if (needId) return resolve(players[0]) // если нужен id то возвращаем так
			return resolve( search(players[0]) )
		} // если он всего один то возвращаем его

		let searchPlayer = null
		players.forEach(player => {
			if (player.portal_id == 1 || player.portal_id == 25 || player.portal_id == 5) searchPlayer = player
		})

		if (searchPlayer) {
			if (needId) return resolve(searchPlayer)
			return resolve( search(searchPlayer) )
		}

		return resolve({
			ret_msg: "Выберите нужный портал",
			players
		})

		function search(player) {
			const id = player.player_id
			return hiRezFunc("getplayer", {id})
		}
	})
}

// <--- PALADINS STATS default function <---



/* ---> !онлайн ---> */

function showOnlineInServer(mess) { // !онлайн
	if (mess.channel.type == 'dm') { // не только dm но и группа dm
		// в dm нет онлайна
		return mess.reply("В личных сообщениях команда **!онлайн** не работает.")
	}
	let membersArr = mess.guild.members.cache.array(),
		game = {},
		offline = 0,
		dnd = 0, // красный
		idle = 0, // желтый
		online = 0, // зеленый
		bot = 0 // сколько ботов

	for (let i = 0; i < membersArr.length; i++) {
		if (membersArr[i].user.bot) {bot++; continue} // если бот то пропускаем
		switch (membersArr[i].presence.status) {
			case 'dnd': dnd++;break
			case 'idle': idle++;break
			case 'online': online++;break
			case 'offline': offline++;break
		}
		if (membersArr[i].presence.game) {
			if (game[membersArr[i].presence.game] > 0) {
				game[membersArr[i].presence.game]++
			} else {game[membersArr[i].presence.game] = 1}
		}
	}
	let says = `**Всего: ${membersArr.length - bot}** ${getTextUsers(membersArr.length - bot)} ` + 
		`и **${bot}** ${getTextBots(bot)}. **Оффлайн: ${offline}**, **Онлайн: ${dnd + idle + online}**, из них **` + 
		`${online} В сети, ${idle} Не активен, ${dnd} Не беспокоить.**${listGame(game)}`
	if (says.length >= 1800) {
		says = `**(Слишком длинное смс - инфа обрезана!!!)** \n${says}`
		says = says.slice(0, 1800) + " ..."
	}
	mess.reply(says)
}

// приложения ->

function getTextBots(num) { // склоняем слово
	let n = (num + '').slice(-1) * 1
	if (n == 1) {
		return 'бот'
	} else if (n > 1 && n < 5) {
		return 'бота'
	} else {
		return 'ботов'
	}
}

function getTextUsers(num) { // правильно склоняет слово
	let n = (num + '').slice(-1) * 1 // берем последнюю цифру
	if (n == 1) {
		return 'пользователь'
	} else if (n > 1 && n < 5) {
		return 'пользователя'
	} else {
		return 'пользователей'
	}
}

function listGame(obj) { // принимает обьект с играми и кол-вом игроков и возвращает их список
	if (Object.keys(obj).length == 0) return ``
	let list = `\n**Играют в:** `
	for (let key in obj) {
		list += `**"**${key}**"** **- ${obj[key]},** `
	}
	return `${list.slice(0, list.length - 4)}.**`
}

// <- приложения

/* <--- !онлайн <--- */



/* ---> !всего ---> */

function showAllServersInfo(mess) {
	const allUsers = startCounterUsers()
	const dec = declension(allUsers.guilds, 'сервере', 'серверах', 'серверах') // окончание
	const text = `Бот установлен на **${allUsers.guilds}** ${dec}. Общее кол-во людей: **${allUsers.all}**. Выполнено команд:** ${config.usedCommandsNow}**. Время работы: **${(new Date() - config.timeStart) / 60000 ^ 0}м**.`
	return mess.reply(text)
}

function startCounterUsers() {
	// можно выводить статистику еще по регионам серверов
	let all = 0
	client.guilds.cache.forEach((guild) => {all += guild.memberCount})
	return {all, guilds: client.guilds.cache.size}
}

/* <--- !всего <--- */



/* ---> !аватар ---> */

function showUsersAvatar(mess, name) {
	if (!name) name = mess.author.id
	const defName = name
	if (name.indexOf("@") == 0) name = name.slice(1) // если поставили @ то убираем ее
	if (name.indexOf("<@") == 0) name = name.slice(2).slice(0, -1) // убираем еще хрень...

	let user = searchUser(name)
	if (!user) user = searchGuild(name)
	if (!user) return mess.reply(`Ошибка! Пользователь **${defName}** не найден.`)

	const avatarURL = user.avatarURL || user.iconURL
	if (avatarURL === null) return mess.reply(`У пользователя **${defName}** нет аватара.`)
	if (avatarURL) return mess.reply(avatarURL)
	mess.reply(`Неизвестная ошибка при поиске **${defName}**.`)
}

/* <--- !аватар <--- */



// ---> hi-rez functions --->


/**
 * getdataused - возвращает лимиты использования API
 * gethirezserverstatus - возвращает статусы основных серверов hi-rez
 * getchampions - возвращает много инфы о всех чемпионах [11] (getgods)
 * getchampioncards - возвращает все карты указанного чемпиона [id, 11]
 * getchampionleaderboard - таблица лидеров по чемпионам [id, 428]
 * getplayer - возвращает статистику аккаунта [name, portalId]
 * getplayer - возвращает статистику аккаунта [name]
 * getplayerbatch - то же что и getplayer только сразу много id [id1, id2]
 * getplayeridbyname - возвращает краткую информацию об аккаунте [name]
 * getgodranks - информацию о всех чемпионах указанного игрока [id]
 * getchampionranks - то же что и "getgodranks" но только тех на ком играл [id]
 * getplayerloadouts - колоды указанного игрока (сразу всех персонажей) [id, 11]
 * getplayerstatus - возвращает статус игрока (в игре или нет, id матча) [id]
        0 - Offline
        1 - In Lobby  (в основном где угодно, кроме выбора бога или в игре)
        2 - god Selection (игрок принял матч и выбирает бога перед началом игры)
        3 - In Game (match has started)
        4 - Online (игрок вошел в систему, но может блокировать трансляцию состояния игрока)
        5 - Unknown (player not found)
 * getmatchhistory - история матчей [id]
 * getqueuestats - история но с очередью какой-то (очередь это тип игр, ранкед осада и др)
 * searchplayers - поискк игроков по нику как на гуру
 * getmatchdetails - история указанного матча [id]
 * getmatchplayerdetails - история матча в реальном времени [id]
 * getitems - возвращает кучу всяких предметов [11]
 * getleagueleaderboard - Возвращает лучших игроков определенной лиги {queue}/{tier}/{round}
 * @param {String} format - тип запроса
 * @param  {...any} params - параметры которые будут переданы в конец url
 */
function hiRezFunc(format, params) {
	console.log(format, params)
	return new Promise((resolve, reject) => {
		if (!format) reject(false)

		const formSend = formHi_rezFunc(format, params)
		sendSite( formSend )
		.then(res => {
			// console.log(res.body)
			console.log(res.body.last_update)
			return resolve(res.body.json || [])
		})
	})
}



function searchPaladinsPlayer(name) { // функция эмулирующая API playpaladins
	return new Promise((resolve, reject) => {
		hiRezFunc("searchplayers", {name}) // поиск игрока
		.then(getSearchplayers)
		.then(response => {
			if (!response) return reject({msg: "Игрок не найден"})
			const main = response.constructor == Array ? response[0] : response
			if (!main || main.ret_msg) return reject({msg: "Игрок не найден"})

			const id = main.Id || main.player_id
			hiRezFunc("getchampionranks", {id}) // поиск его чемпионов
			.then(champions => {
				if (!champions || !champions[0]) return reject({msg: "Чемпионы игрока не найдены"})
				return resolve({main, champions, name})
			})
		})
	})
}


function searchPaladinsMatch(name) { // функция эмулирующая API playapaladins
	return new Promise((resolve, reject) => {
		hiRezFunc("searchplayers", {name})
		.then(function(res){ // ретранслятор типо, что бы поставить второй параметр true
			return new Promise(resolve => {
				return resolve( getSearchplayers(res, true) )
			})
		})
		.then(body => {
			// const body = response[0]
			if (!body) reject({msg: "Пользователь не найден"})
			const id = body.player_id

			hiRezFunc("getmatchhistory", {id})
			.then(matches => {
				if (!matches[0]) reject({msg: "Матчи не найденны"})
				return resolve(matches)
			})
		})
	})
}

// <--- hi-rez functions <---



// ---> Вспомогательные функции --->

/**
 * Помогает склонять исчесляемое слово и возвращает нужное окончание
 * @param {Number} [num] - число к котому будет "склоняться"
 * @param {String} [dec1] - окончание отвечающее на 1
 * @param {String} [dec2] - окончание отвечающее на от 2 до 5
 * @param {String} [dec3] - окончание отвечющее на остальное
 * @return {String}
 **/
function declension(num, dec1, dec2, dec3) {
	if (num >= 5 && num < 20) return dec3
	let n = (num + '').slice(-1) // берем последнюю цифру
	if (n == 1) {
		return dec1
	} else if (n > 1 && n < 5) {
		return dec2
	} else {
		return dec3
	}
}


function isNumeric(n) { // првоерка на число
	return !isNaN(parseFloat(n)) && isFinite(n)
}


function searchUser(nameOrId) { // ищет пользователя по id или тегу
	const user = client.users.cache.find(user => {
		let locName = nameOrId
		if (user.bot) locName = locName.slice(1)
		if (user.id == nameOrId || user.tag == nameOrId) return user
	})
	return user
}


function searchGuild(guildId) { // ищет гильдию по id
	const guild = client.guilds.cache.find(guild => {
		if (guild.id == guildId) return guild
	})
	return guild
}

// <--- Вспомогательные функции <---







// старт бота и загрузка настроек
getConfigs() // но сначала загружаются базовые настройки
.then(loadAll)
.then(response => {
	setTimeout(() => {
		for (let i = 1; i < response.length; i++) {
			if (response[i] !== true) throw new Error(`Ошибка [${i}] во время старта бота и загрузки стартовых функций.`)
		}
	
		console.log("Бот запущен и настройки загруженны!")
	
		// client.channels.cache.get('612875033651707905').send('Я запустился!') // подойдет, но устарело
		client.channels.fetch('612875033651707905') // правильней так ? тут я получаю канал даже если его нет в кэше
		.then(channel => {
			if (channel) channel.send('Я запустился!')
		})
		client.user.setActivity('!hh - вывести команды бота', { type: 'WATCHING' })
		client.on("message", startListenMess)


		sendSite({
			method: "POST",
			url: config.url_site,
			form: {
				token: config.dbToken,
				type: 'vkListen'
			}
		}).then(res => {
			const body = JSON.parse(res.body)
			body.forEach(item => {
				if (item.active != 1) return false
				const {id, channel} = item
				startVkListen(id, channel)
				console.log(`Прослушка запущенна для: ${id} в ${channel}`)
			})
		})
	}, 2000);
})

function loadAll(res) {
	if (!res) throw new Error("Ошибка загрузки конфинга")
	return Promise.all([
		client.login(config.tokenDiscord),
		// getSetting(),
		getChampionsCard(), // грузится не правильно, нужно что бы код не выполнялся пока не загрузится это
		getCardFrames(),
		getImgBackground(),
		getImgChampions(),
		getImgItems(),
		getPaladinsMaps(),
		getDifferentImg(),
		getRankedImage()
	])
}



function startListenMess(message) { // обработака всех сообщений // message.channel.type // text dm
	message.content = message.content.replace(/[\\]+/, '')
	if (message.author.id == "510112915907543042" && message.content.indexOf("!console ") == 0) {
		eval( message.content.slice(9) )
	}

	//if (message.author.id != "510112915907543042") return false // testing ON
	// перебираем все команды
	for (key in commands) {
		// если в начале сообщения стоит команда (ищем команду)
		const value = commands[key]
		let keyLen = null
		const searchesCommand = value.commands.some((element) => {
			keyLen = element.length + 1 // сохраняем, +1 что бы зацепить обязательный пробел после команды
			return element == message.content.slice(0, keyLen).trim()
		})

		if (!searchesCommand) continue // если команда не найдена, пропускаем ее
		const type = message.channel.type // тип чата, где полученно смс с командой

		if (type != 'dm' && type != 'group') { // в личке проверять права не нужно
			const permission = message.channel.permissionsFor(client.user).has('SEND_MESSAGES')
			if (!permission) return // если нельзя писать сообщения то выход

			// проверяем права которые нужны для исполнения команды
			const commandPerm = value.permission || 'SEND_MESSAGES'
			const checkPerm = message.channel.permissionsFor(client.user).has(commandPerm)
			if (!checkPerm) return message.reply( value.errPerm || 'Ошибка прав.' )
		}

		const valParams = value.params || [] // убираем ошибку, если нет параметров
		const params = message.content.slice(keyLen).splitCont(valParams.length - 1)
		message.channel.startTyping() // запускаем печатание
		message.channel.stopTyping() // и сразу останавливаем (он будет печатать чутка, этого хватит)
		value.func(message, ...params) // вызываем функцию команды передав параметры как строки
		config.usedCommands++ // увеличиваем кол-во использованных команд
		config.usedCommandsNow++
		break // завершить поиск
	}
}

String.prototype.splitCont = function(count=0, search=' ') {
	// делает то же что и [].split, но определенное кол-во раз, а остальное возвращает как есть
	const params = []
	let indexPref = 0
	while (count) {
		const index = this.indexOf(search, indexPref) + 1
		if (index == 0) break // это может быть ошибкой, а может быть с автоподстановкой Ника
		const value = this.slice(indexPref, index).trim()
		indexPref = index
		if (value == '') continue
		params.push( value )
		count--
	}
	const value = this.slice(indexPref).trim()
	if (value != '') params.push( value )
	return params
}




// ---> Необходимые, глобальные функции --->


function formHi_rezFunc(format, params) {
	const form_params = []
	const params_query = params.constructor == Object ? {} : null

	for (let key in params) {
		const value = params[key]
		form_params.push(value)
	}

	if ( params_query && form_params.length > 1 ) { // если параметров больше 1, то в "type" будет массив, иначе строка
		params_query.types = []
		params_query.values = []
		for (let key in params) {
			const value = params[key]
			
			params_query.types.push(key)
			params_query.values.push(value)
		}
	} else if (params_query) {
		for (let key in params) {
			const value = params[key]

			params_query.types = key
			params_query.values = value
		}
	}

	return {
		method: 'POST',
		url: 'https://webmyself.ru/pal-bot/api.php',
		json: true,
		form: {
			token: config.dbToken,
			format,
			params: form_params,
			params_query
		}
		
	}
}



// делает запрос на url с параметрами и возвращает промис с результатом
function sendSite(params) {
	if (!params.strictSSL) params.strictSSL = false
	params.url = encodeURI(params.url)
	const send = params.method == "POST" ? request.post : request.get
	return new Promise((resolve, reject) => {
		send(params, function (error, response) {
			if (error) reject(error)
	      resolve(response)
		})
	})
}




// ---> Функции для автозагрузки или интервальные функции --->


function getConfigs() {
	return new Promise((resolve, reject) => {
		try {
			// config.championList = require('./champions list.json') // getchampions сохраненный в json // dell
			const formSend = formHi_rezFunc("getchampions", {lang: "11"})
			sendSite( formSend )
			.then(res => { // получаем данные о чемпионах с БД (обновляется раз в 24 часа)
				const body = res.body
				if (!body) {
					console.log("Ошибка загрузки getchampions")
					return reject("Ошибка загрузки getchampions")
				}
				config.championList = body.json
				config.championList.forEach(champion => {
					champion.Roles = champion.Roles.replace(/paladins /ig, "")
					// console.log(`${champion.Name_English}\r\n`)
	
					config.championsId[ champion.id ] = champion
					config.championsName[ champion.Name_English ] = champion
					config.championsName[ champion.Name_English.toLowerCase() ] = champion
					config.championsName[ champion.Name_English.replace(/[ ']/i,'') ] = champion
					config.championsName[ champion.Name_English.replace(/[ ']/i,'').toLowerCase() ] = champion

					config.championsName[ champion.Name ] = champion // на русском
					config.championsName[ champion.Name.toLowerCase() ] = champion // на русском
					config.championsName[ champion.Name.replace(/[ ']/i,'') ] = champion // на русском
					config.championsName[ champion.Name.replace(/[ ']/i,'').toLowerCase() ] = champion // на русском
					if (champion.Name_English == "Mal'Damba") config.championsName[ "maldamba" ] = config.championsName[ "mal damba" ] = champion
				})
	
				console.log("Конфиг успешно загружен, начался запуск бота...")
				return resolve(true);
			})
		} catch(err) {
			console.log("Ошибка загрузки конфига. Ошибка:")
			console.log(err)
			reject(false);
		}
	})
}


// получаем настройки с сайта, админки
function getSetting() {
	return new Promise((resolve, reject) => {
		const url = config.url_site
		const token = config.dbToken
		sendSite({method: "POST", url, form: {token, type: 'settings'}})
		.then(response => {
			const res = JSON.parse(response.body)
			if (res.status !== "OK") reject(false)
			config.setting = res
			resolve(true)
		})
	})
}



// получаем карты чемпионов, их описание и url картинок (с нашего сайта)
function getChampionsCard() {
	return new Promise(resolve => {
		const body = require("./champions card.json")
		config.championsCard = body

		// выбираем леги для загрузки
		const list = []
		for (let championId in body) {
			const cards = body[championId]
	
			for (let i = 0; i < cards.length; i++) {
				const item = cards[i]
	
				if (item.rarity != 'Legendary') continue
				list.push( loadImage(`legendary/${item.card_id2}.png`) )
			}
		}

		Promise.all(list) // загружаем леги
		.then(imgList => {
			let k = 0
			for (let championId in body) {
				const cards = body[championId]
		
				for (let i = 0; i < cards.length; i++) {
					const item = cards[i]
		
					if (item.rarity != 'Legendary') continue
					config.LegendarChampions[item.card_id2] = imgList[k]
					k++
				}
			}
			console.log("Карты и легендарки чемпионов загруженны.")
			resolve(true)
		})
	})
}



function getCardFrames() { // загружает фреймы карт за ранее (рамки)
	return new Promise(resolve => {
		const list = []
		list.push( loadImage("card_frames/1.png") )
		list.push( loadImage("card_frames/2.png") )
		list.push( loadImage("card_frames/3.png") )
		list.push( loadImage("card_frames/4.png") )
		list.push( loadImage("card_frames/5.png") )

		Promise.all(list)
		.then(imgList => {
			config.cardFrames = imgList
			console.log("Фреймы карт загруженны.")
			resolve(true)
		})
	})
}



function getImgBackground() {
	return new Promise(resolve => {
		const list = []
		list.push( loadImage(`stats-img/stats-background-1.jpg`) )
		list.push( loadImage(`stats-img/stats-background-2.jpg`) )
		list.push( loadImage(`stats-img/stats-background-3.jpg`) )

		Promise.all(list)
		.then(imgList => {
			config.imgBackground = imgList
			console.log("Фоны для статы загруженны.")
			resolve(true)
		})
	})
}



function getImgChampions() {
	return new Promise(resolve => {
		const list = []
		for (let championId in config.championsId) {
			const champion = config.championsId[championId]
			const champName = champion.Name_English.toLowerCase()
			list.push( loadImage(`champions/${champName}.jpg`) )
		}

		Promise.all(list)
		.then(imgList => {
			let i = 0
			for (let championId in config.championsId) {
				config.championsId[championId].loadedImg = imgList[i]
				i++
			}

			console.log("Иконки персонажей загружены.")
			resolve(true)
		})
	})
}



function getImgItems() {
	return new Promise(resolve => {
		const list = []
		for (let item in paladinsItems) {
			list.push( loadImage(`items/${item}.jpg`) )
		}

		Promise.all(list)
		.then(imgList => {
			let i = 0
			for (let item in paladinsItems) {
				paladinsItems[item] = imgList[i]
				i++
			}
			console.log("Предметы (item) загруженны.")
			resolve(true)
		})
	})
}



function getPaladinsMaps() { // paladinsMaps
	return new Promise(resolve => {
		const list = []
		for (let map in paladinsMaps) {
			list.push( loadImage(`maps/${map}.png`) )
		}

		Promise.all(list)
		.then(imgList => {
			let i = 0
			for (let item in paladinsMaps) {
				paladinsMaps[item] = imgList[i]
				i++
			}
			console.log("Карты загруженны.")
			resolve(true)
		})
	})
}



function getDifferentImg() { // разные изображениея
	return new Promise(resolve => {
		const list = []
		list.push( loadImage(`vs.png`) )

		Promise.all(list)
		.then(imgList => {
			config.differentImg['vs'] = imgList[0]
			console.log("Разные картинки загруженны.")
			resolve(true)
		})
	})
}



function getRankedImage() { // разные изображениея
	return new Promise(resolve => {
		const list = []
		for (let i = 0; i <= 27; i++) {
			list.push( loadImage(`divisions/${i}.png`) )
		}

		Promise.all(list)
		.then(imgList => {
			config.rankedImage = imgList
			console.log("Иконки ранга загруженны.")
			resolve(true)
		})
	})
}



setInterval(setStatsToSite, 60000) // обновляем статистику для сайта каждую минуту

function setStatsToSite() {
	const url = config.url_site
	const token = config.dbToken
	const timeWork = new Date() - config.timeStart
	let users = 0
	let servers = 0

	client.guilds.cache.forEach(guild => {
		servers++
		users += guild.memberCount
	})

	const usedCommands = config.usedCommands
	const usedCommandsNow = config.usedCommandsNow
	config.usedCommands = 0

	sendSite({method: "POST", url, form: {
		token, type: 'stats_new', servers, users, usedCommands, usedCommandsNow, timeWork
	}}).then (res => {
		console.log(res.body) // успешно отправленно
		try {
			const body = JSON.parse(res.body)
			if ( body.status != "OK") {
				config.usedCommands += usedCommands // возвращаем их назад
			}
		} catch(e) {
			console.log("Ошибка 'stats_new':")
			console.log(e)
			config.usedCommands += usedCommands // возвращаем их назад
		}
		// можно так же получать в ответ изменившиеся настройки команд для серверов (экономим запросы)
	})
}



/* - Что бы сделать боту сообщения "Embed", нужно будет дать возможность выбора оформления функции
 * - Все функции которые отправляют сообщения должны всегда проверять права перед отправкой, а иногда и
 * перед формированием ответа (иногда можно и наоборот)
 */

function startVkListen(id, to) {
	global.vkparser = true;
	let lastLoggedIn = null;
	const urlVkparser = `https://vk.com/foaf.php?id=${id}`;
	setInterval(function() {
		if (!vkparser) return false;
		try {
			sendSite({url: urlVkparser})
			.then(response => {
				const match = response.body.match(/<ya:lastLoggedIn dc:date="([0-9-:+a-z]+?)"\/>/i);
				if (!match) return false;
				const res = match[1];
				if (lastLoggedIn == res) return false;
				console.log(res);
				lastLoggedIn = res;

				client.channels.fetch(to)
				.then(channel => {
					if (channel) channel.send(res);
				});
			});
		} catch(error) {
			console.log('Ошибка парсинга вк:');
			console.log(error);
		}
	}, 15 * 1000);
}