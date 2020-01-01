const {Client} = require('discord.js')
const client = new Client()
const request = require('request')
const { createCanvas, loadImage } = require('canvas')
const Config = require('./configs.js')
const config = Config.exports || Config
const moment = require("moment")
const md5 = require("md5")
config.timeStart = +new Date()
config.usedComands = 0

let championsCard = null // инфа будет загруженна с сайта
let LegendarChampions = {} // тут будет обьект с ключами id легендарок персонажей
let cardFrames = null // тут будет массив фреймов карт (загруженные картинки)
let imgBackground = null // тут будут "случайные" фоны для статы
let differentImg = {} // разные изображения
let rankedImage = null // тут будут картинки ранга



function checkNewNameComand(name) { // првоеряет есть ли такая команда (список команд)
	if (!name.fort) name = [name] // делаем массивом если не массив -_-

	for (let comandName in comands) {
		const comand = comands[comandName]
		for (let i = 0; i < name.length; i++) {
			const newName = name[i]
			const index = comand.comands.indexOf(newName)
			if (index != -1) return true
		}
	}
	return false
}
const comands = { // будет загружаться для каждого сервера свой, как и настройки к функциям
	"!hh": {
		comands: ["!hh"],
		//info: "Выводит список команд, если указан параметр то выводит подробную инструкцию.",
		info: "Выводит список команд.",
		func: showInfoComands
		//params: ["Команда"]
	},
	"!recomand": {
		comands: ["!recomand"],
		info: "__(только админам)__ Изменяет название указанной команды (__с префиксом__ можно указать несколько, через запятую). __**В РАЗРАБОТКЕ**__.",
		func: function(mess, oldName, newName) {
			return mess.reply("Команда находится в разработке.")
			// проверяем правильность команды
			//if ( !comands[oldName] ) return mess.reply(`Команда **${oldName}** не найдена.`)

			// проверяем занята ли такая команда
			//if ( checkNewNameComand(newName) ) return mess.reply(`Команда **${newName}** уже существует.`)

			// применяем новое название к команде
			// sendSite({
			// 	method: 'POST',
			// 	url: config.url_site,
			// 	form: {
			// 		token: config.dbToken,
			// 		type: 'comands'
			// 	}
			// })

			// sendSite({
			// 	method: 'POST',
			// 	url: config.url_site,
			// 	form: {
			// 		token: config.dbToken,
			// 		type: 'update_comands',
			// 		guild_id: '352352',
			// 		comands: JSON.stringify({
			// 			"!me": {
			// 				names: ["!me", "!меня"],
			// 				func: "functionMe"
			// 			}
			// 		})
			// 	}
			// })

			// .then(res => {
			// 	const guildComands = JSON.parse(res.body)
			// 	console.log(guildComands)
			// })
		},
		params: ["Текущее имя команды", "Новое имя команды"]
	},
	"!me": {
		comands: ["!me"],
		info: "Позволяет запомнить и использовать указанный никнейм для команд бота (можно будет писать просто !ss)",
		func: meNickName,
		params: ["Ник"]
	},
	"!ss": {
		comands: ["!ss", "!стата"],
		info: "Выводит сокращенную статистику указанного аккаунта (hi-rez api).",
		func: getPlaypaladinsSS,
		params: ["Ник"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!sh": {
		comands: ["!sh", "!история"],
		info: "Выводит рейтинговою статистику указанного аккаунта (hi-rez api).",
		func: getPlaypaladinsSH,
		params: ["Ник"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!sl": {
		comands: ["!sl", "!колода"],
		info: ["Выводит колоды игрока указанного чемпиона"],
		func: getPaladinsSL,
		params: ["Ник", "имя чемпиона", "номер колоды"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!st": {
		comands: ["!st", "!лидеры"],
		info: ["Выводит топ 10 лидеров указанного чемпиона"],
		func: getPaladinsLeaderboard,
		params: ["имя чемпиона"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!sm": {
		comands: ["!sm", "!матч"],
		info: ["Выводит подробности матча по id матча или по нику игрока"],
		func: getPaladinsMatchdetails,
		params: ["id или Ник", "Порядок матча, если указан ник"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!sp": {
		comands: ["!sp"],
		info: ["Проверяет онлайн статус игрока и выводит матч, если он в матче"],
		func: getPaladinsPlayerStatus,
		params: ["Ник"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!sg": {
		comands: ["!sg"],
		info: "Выводит сокращенную статистику указанного аккаунта (guru).",
		func: getGuruSG,
		params: ["Ник"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!sf": {
		comands: ["!sf"],
		info: "Выводит полную статистику указанного аккаунта (guru).",
		func: getGuruSF,
		params: ["Ник"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!sr": {
		comands: ["!sr"],
		info: "Выводит рейтинговою статистику указанного аккаунта (guru).",
		func: getGuruSR,
		params: ["Ник"],
		permission: "ATTACH_FILES",
		errPerm: "Нет прав на прикрепления файлов (скриншот/картинка)."
	},
	"!инфо": {
		comands: ["!инфо"],
		info: "Выводит способ связи с создателем (в ЛС, убедитесь что у вас он не закрыт)",
		func: function(mess) {
			const text = "Группа бота: https://discord.gg/RG9WQtP"
			const id = mess.author.id
			const user = client.users.find((user => {
				if ( user.id == id ) return user
			}))
			user.send(text)
		}
	},
	"!онлайн": {
		comands: ["!онлайн"],
		info: "выводит статистику пользователей по онлайну и играм",
		func: showOnlineInServer
	},
	"!всего": {
		comands: ["!всего"],
		info: "Выводит сколько всего серверов, людей и людей онлайн в данный момент",
		func: showAllServersInfo
	}
	// "!аватар": {
	// 	comands: ["!аватар"],
	// 	info: "Выводит ссылку на аватарку указанного пользователя",
	// 	func: showUsersAvatar,
	// 	params: ["Id или никнейм+тег пользователя (упомянуть)"]
	// },
	// "!вики": {
	// 	comands: ["!вики"],
	// 	info: "Осуществляет поиск в **Википедии**",
	// 	func: getVikiTextRU,
	// 	params: ["Текст"]
	// },
	// "!viki": {
	// 	comands: ["!viki"],
	// 	info: "Performs a search on **Wikipedia**",
	// 	func: getVikiTextEN,
	// 	params: ["Text"]
	// },
	// "!смс": {
	// 	comands: ["!смс"],
	// 	info: "отправляет сообщение в вк указанному id",
	// 	func: sendMessToVK,
	// 	params: ["id", "сообщение"]
	// },
	// "!переписка": {
	// 	comands: ["!переписка"],
	// 	info: "выводит 10 последних сообщений из вк (сколько влезит, если длинные)",
	// 	func: get_vk_messages
	// }
}



// ---> !hh --->
function showInfoComands(mess) {
	let text = ``
	for (let key in comands) {
		const comand = comands[key]
		const params = comand.params ? ` **[${comand.params.join("]**, **[")}]**` : ""
		let info = `**${key}**${params} - ${comand.info}`
		if (comand.comands.length > 1) info += ` (Можно **${comand.comands.join("**, **")}**).`
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
			mess.channel.send(`${mess.author}`, {file: buffer, name: "stats.png"})
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
			const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
			mess.channel.send(`${mess.author}`, {file: buffer, name: "stats.png"})
		})
	}
}
// <--- !sh <---



// ---> !sl --->
function getPaladinsSL(mess, name, championName, num) {
	if (!championsIds[championName]) {
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
			mess.channel.send(`${mess.author}`, {file: buffer, name: "stats.png"})
		})
	}
}
// <--- !sl <---



// ---> !st --->
function getPaladinsLeaderboard(mess, championName) {
	if (!championName) return mess.reply(`Введите корректное имя чемпиона`)
	const champ = championsIds[championName]
	if (!champ) return mess.reply(`Введите корректное имя чемпиона`)
	const champId = champ.id
	if (!champId) return mess.reply(`Введите корректное имя чемпиона`)
	hiRezFunc("getchampionleaderboard", champId, 428)
	.then(top => {
		let text = `__Топ 10 **${championName}**:__`
		
		for (let i = 0; i < 10; i++) {
			text += `\r\n${i + 1}. **${top[i].player_name || '-скрытый профиль-'}** Винрейт: **${top[i].wins}/${top[i].losses}**.`
		}
		mess.reply(text)
	})
}
// <--- !st <---



// ---> !sm --->
function getPaladinsMatchdetails(mess, matchIdOrName, matchNum=1) {
	//if (!matchIdOrName) return mess.reply(`Введите корректный Ник игрока или id матча`)

	function getMatchForId(matchId) {
		hiRezFunc("getmatchdetails", matchId)
		.then(match => {
			if (!match[0].name) return mess.reply(`Матч не найден`)

			const res = drawMatchdetails(mess, match)
			if (res.err) return false // ничего не делает если была ошибка (уже сделали)
			console.log("Отправляем")
			const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
			mess.channel.send(`${mess.author}`, {file: buffer, name: "stats.png"})
		})
	}

	if ( !isNaN(parseInt(matchIdOrName)) ) { // если id матча
		getMatchForId(matchIdOrName)
	} else { // если ник игрока
		// делаем запрос на матчи игрока, получаем id последней катки или указанной
		prefStatsGuru(mess, matchIdOrName, getStats)

		function getStats(name) {
			name = name.replace(/(?:[0-9]*-)/g, '').trim() // удаляем id с ника, если есть (это для гуру)

			hiRezFunc('getplayeridbyname', name)
			.then(player => {
				if (!player[0]) return mess.reply("Игрок не найден или у него скрыт профиль.")
				hiRezFunc('getmatchhistory', player[0].player_id)
				.then(matches => {
					const match = matches[matchNum - 1] // берем указанный матч
					if (!match || !match.Match) return mess.reply("Указанный матч не найден")
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

		hiRezFunc("getplayeridbyname", name) // получаем id игрока по нику
		.then(player => {
			if (!player[0]) return mess.reply("Игрок не найден или у него скрыт профиль.")
			hiRezFunc("getplayerstatus", player[0].player_id)
			.then(retranslator)
			.then(res => {
				if (res.err) return mess.reply(res.err)
				const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
				mess.channel.send(`${mess.author}`, {file: buffer, name: "stats.png"})
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



// ---> !sg --->
function getGuruSG(mess, name) {
	prefStatsGuru(mess, name, getStats)

	function getStats(name) {
		if (/^[0-9]+-[^!@#\$\%\^\&\*()\-_+=\\\/'"`;:\.,?<>\[\]\{\}\~ ]+/i.test(name)) {
			// если передан ник с id
			guruSummary(mess, {name}) // парсим инфу
			.then(drawStatsSmall) // рисуем
			.then(res => {
				const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
				mess.channel.send(`${mess.author}`, {file: buffer, name: "stats.png"})
			})
		} else if (!name.match(/^[0-9]|[!@#\$\%\^\&\*()\-_+=\\\/'"`;:\.,?<>\[\]\{\}\~ ]+/i)) {
			// если просто ник
			searchAccauntsGuru(name) // поиск аккаунта
			.then( verifyAccauntGuru.bind(null, mess) ) // проверяем сколько их нашлось
			.then( guruSummary.bind(null, mess) ) // парсим инфу
			.then(drawStatsSmall) // рисуем
			.then(res => {
				const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
				mess.channel.send(`${mess.author}`, {file: buffer, name: "stats.png"})
			})
		} else {
			mess.reply(`Неизвестная ошибка при поиске имени **${name}**. Попробуйте снова или обратитесь в ТП бота.`)
		}
	}
}
// <--- !sg <---



// ---> !sf --->
function getGuruSF(mess, name) {
	prefStatsGuru(mess, name, getStats)

	function getStats(name) {
		if (/^[0-9]+-[^!@#\$\%\^\&\*()\-_+=\\\/'"`;:\.,?<>\[\]\{\}\~ ]+/i.test(name)) {
			// если передан ник с id
			guruSummary(mess, {name}) // парсим инфу
			.then(drawStatsFull) // рисуем
			.then(res => {
				const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
				mess.channel.send(`${mess.author}`, {file: buffer, name: "stats.png"})
			})
		} else if (!name.match(/^[0-9]|[!@#\$\%\^\&\*()\-_+=\\\/'"`;:\.,?<>\[\]\{\}\~ ]+/i)) {
			// если просто ник
			searchAccauntsGuru(name) // поиск аккаунта
			.then( verifyAccauntGuru.bind(null, mess) ) // проверяем сколько их нашлось
			.then( guruSummary.bind(null, mess) ) // парсим инфу
			.then(drawStatsFull) // рисуем
			.then(res => {
				const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
				mess.channel.send(`${mess.author}`, {file: buffer, name: "stats.png"})
			})
		} else {
			mess.reply(`Неизвестная ошибка при поиске имени **${name}**. Попробуйте снова или обратитесь в ТП бота.`)
		}
	}
}
// <--- !sf <---



// ---> !sr --->
function getGuruSR(mess, name) {
	prefStatsGuru(mess, name, getStats)

	function getStats(name) {
		if (/^[0-9]+-[^!@#\$\%\^\&\*()\-_+=\\\/'"`;:\.,?<>\[\]\{\}\~ ]+/i.test(name)) {
			// если передан ник с id
			guruRanked(mess, {name}) // парсим инфу
			.then(drawStatsRanked) // рисуем
			.then(res => {
				const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
				mess.channel.send(`${mess.author}`, {file: buffer, name: "stats.png"})
			})
		} else if (!name.match(/^[0-9]|[!@#\$\%\^\&\*()\-_+=\\\/'"`;:\.,?<>\[\]\{\}\~ ]+/i)) {
			// если просто ник
			searchAccauntsGuru(name) // поиск аккаунта
			.then( verifyAccauntGuru.bind(null, mess) ) // проверяем сколько их нашлось
			.then( guruRanked.bind(null, mess) ) // парсим инфу
			.then(drawStatsRanked) // рисуем
			.then(res => {
				const buffer = res.ctx.canvas.toBuffer('image/png') // buffer image
				mess.channel.send(`${mess.author}`, {file: buffer, name: "stats.png"})
			})
		} else {
			mess.reply(`Неизвестная ошибка при поиске имени **${name}**. Попробуйте снова или обратитесь в ТП бота.`)
		}
	}
}
// <--- !sr <---



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
		const img = imgBackground[ Math.floor(Math.random() * 3) ] // случайный фон
		const main = json.main
		const kda = getKDABP(json.champions)
		let championList = []
		for (let i = 0; i < kda.best.length; i ++) {
			const champion = kda.best[i].champion
			championList.push( championsIds[fixChampion(champion)].img )
		}

		ctx.drawImage(img, 0, 0, 760, 300)
		drawItemsPlaypaladinsSS(ctx, main, kda) // рисуем эллементы не нужнающиеся в промисах

		if (!championList.length) resolve({ctx, main, kda}) // если чемпионов нет

		drawChampionsPlaypaladinsSS(ctx, championList) // рисуем загруженных чемпионов

		// data загружаемой картинки ранга
		const rankNum = main.Tier_RankedKBM
		const rankUrl = rankNum ? `divisions/${rankNum}.png` : 'no-rank.png'
		const rankImgWidth = 192
		const rankImgHeight = rankNum == 0 ? 224 : rankNum == 27 ? 241 : rankNum == 26 ? 221 : 192

		loadImage(rankUrl) // загружаем картинку ранга
		.then(img => {
			ctx.drawImage(img, 0, 10, rankImgWidth / 2, rankImgHeight / 2)
			resolve({ctx, main, kda})
		})
	})
}

function drawItemsPlaypaladinsSS(ctx, main, kda) {
	const RankedKBM = main.RankedKBM
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
	ctx.fillText(`Информация взята с paladins.com / !hh показать список команд`, 380, 320)
	ctx.font = 'bold 16px Georgia'
	ctx.fillStyle = "#dddddd"
	ctx.textAlign = "start"

	// рисуем инфу
	ctx.fillText(`${main.hz_player_name} (${main.Region})`, 10 + width / 2, 20)
	ctx.fillText(`Steam: ${main.Name}`, 10 + width / 2, 40)
	ctx.fillText(`Уровень: ${main.Level}`, 10 + width / 2, 60)
	ctx.fillText(`Создан: ${getDateStats(main.Created_Datetime)}`, 10 + width / 2, 80)
	ctx.fillText(`Сыграно ${main.HoursPlayed} часов`, 10 + width / 2, 100)
	ctx.fillText(`Последний вход: ${getDateStats(main.Last_Login_Datetime)}`, 10 + width / 2, 120)
	ctx.fillText(`KDA: ${( (kda.kills + kda.assists / 2) / (kda.deaths + 1)).toFixed(2)}`, 10 + width / 2, 140)

	ctx.fillText(`ВСЕГО:`, 50, 170)
	ctx.fillText(`Убийств: ${kda.kills}`, 10, 190)
	ctx.fillText(`Смертей: ${kda.deaths}`, 10, 210)
	ctx.fillText(`Ассистов: ${kda.assists}`, 10, 230)
	ctx.fillText(`Побед: ${main.Wins}`, 10, 250)
	ctx.fillText(`Поражений: ${main.Losses}`, 10, 270)
	ctx.fillText(`Винрейт: ${fixNaN((main.Wins / (main.Wins + main.Losses) * 100).toFixed(0))}%`, 10, 290)

	ctx.fillText(`РАНКЕД:`, 250, 170)
	ctx.fillText(`Побед: ${RankedKBM.Wins}`, 200, 190)
	ctx.fillText(`Поражений: ${RankedKBM.Losses}`, 200, 210)
	ctx.fillText(`Ранг: ${getRank(main.Tier_RankedKBM)}`, 200, 230)
	ctx.fillText(`ОТ: ${RankedKBM.Points}`, 200, 250)
	if (RankedKBM.Rank) ctx.fillText(`Позиция: ${RankedKBM.Rank}`, 200, 270)

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
		// загружаем случайный глобальный фон для статы
		const img = imgBackground[ Math.floor(Math.random() * 3) ] // случайный фон
		ctx.drawImage(img, 0, 30, imgWidth, 530)
		drawItemsPlaypaladinsSH(ctx, matches) // рисуем эллементы не нужнающиеся в промисах

		// получаем до 10 картинок персонажей с истории
		let champList = []
		matches.forEach(item => {
			const champion = item.Champion
			champList.push( championsIds[fixChampion(champion)].img )
		})

		drawChampionsPlaypaladinsSH(ctx, champList) // рисуем загруженных чемпионов
		resolve({ctx})
	})
}

function drawItemsPlaypaladinsSH(ctx, matches) {
	const pos = [70, 235, 345, 425, 550, 655, 705, 805, 885, 975, 1085]
	ctx.textAlign = "center"
	ctx.font = 'bold 14px Georgia' // Franklin Gothic Medium
	ctx.fillStyle = "#00CCFF"
	ctx.fillText(`Информация взята с paladins.com / !hh показать список команд`, 545, 580)
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
		hiRezFunc("getplayeridbyname", name)
		.then((player => {
			if (!player[0]) return resolve({err: true}) // если скрыт профиль

			const playerId = player[0].player_id
			hiRezFunc("getplayerloadouts", playerId, 11)
			.then(loadouts => {
				const champId = championsIds[championName].id
				
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

	const background = imgBackground[ Math.floor(Math.random() * 3) ] // случайный фон
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
				loadList.push( loadImage(card.url) )
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

				ctx.drawImage(img, i * (10 + 314) + 48, 150, 256, 196) // рисуем картинки карт
				// теперь нужно нарисовать фреймы для карт
				const points = properties.points
				const imgFrames = cardFrames[points - 1] // получаем картинку фрейма карты
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
	const champCards = championsCard[idChamp]

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
	const matchArr = text.match(/\{scale=([0-9\.]+)\|([0-9\.]+)\}/i)
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


const championsIds = {
	"Androxus": {id: "2205"},
    "Cassie": {id: "2092"},
    "Drogoz": {id: "2277"},
    "Kinessa": {id: "2249"},
    "Lian": {id: "2417"},
    "Maeve": {id: "2338"},
	"Bomb King": {id: "2281"},
	"Sha Lin": {id: "2307"},
    "Strix": {id: "2438"},
    "Koga": {id: "2493"},
    "Buck": {id: "2147"},
    "Pip": {id: "2056"},
    "Moji": {id: "2481"},
    "Evie": {id: "2094"},
    "Makoa": {id: "2288"},
    "Zhin": {id: "2420"},
    "Viktor": {id: "2285"},
    "Willo": {id: "2393"},
    "Dredge": {id: "2495"},
    "Lex": {id: "2362"},
    "Tyra": {id: "2314"},
    "Ruckus": {id: "2149"},
    "Grohk": {id: "2093"},
    "Talus": {id: "2472"},
    "Skye": {id: "2057"},
	"Mal'Damba": {id: "2303"},
    "Imani": {id: "2509"},
    "Grover": {id: "2254"},
    "Furia": {id: "2491"},
    "Khan": {id: "2479"},
    "Io": {id: "2517"},
    "Barik": {id: "2073"},
    "Jenos": {id: "2431"},
    "Vivian": {id: "2480"},
    "Fernando": {id: "2071"},
    "Atlas": {id: "2512"},
    "Ying": {id: "2267"},
    "Ash": {id: "2404"},
    "Inara": {id: "2348"},
    "Raum": {id: "2528"},
    "Seris": {id: "2372"},
    "Torvald": {id: "2322"},
    "Terminus": {id: "2477"}
}

function fixChampion(text) {
	while (true) {
		const sh = text.indexOf('\'')
		if (sh != -1) text = text.slice(0, sh) + '' + text.slice(sh + 1)
		const space = text.indexOf(' ')
		if (space == -1) break
		text = text.slice(0, space) + '' + text.slice(space + 1)
		const defis = text.indexOf('-')
		if (defis == -1) break
		text = text.slice(0, defis) + '' + text.slice(defis + 1)
		const bottomDefis = text.indexOf('_')
		if (bottomDefis == -1) break
		text = text.slice(0, bottomDefis) + '' + text.slice(bottomDefis + 1)
	}
	return text.toLowerCase()
}

const paladinsItems = {
	'blast-shields': null,
	'bulldozer': null,
	'cauterize': null,
	'chronos': null,
	'deft-hands': null,
	'haven': null,
	'illuminate': null,
	'kill-to-heal': null,
	'life-rip': null,
	'master-riding': null,
	'morale-boost': null,
	'nimble': null,
	'rejuvenate': null,
	'resilience': null,
	'veteran': null,
	'wrecker': null
}
// <--- draw playpaladins history <---



// ---> draw !sm stats match id --->
function drawMatchdetails(mess, matchDetails) { // рисует
	const imgWidth = 1180
	const imgHeight = 795
	const canvas = createCanvas(imgWidth, imgHeight)
	const ctx = canvas.getContext('2d')
	ctx.font = 'bold 15px Georgia'
	ctx.fillStyle = "#ffffff"
	try {
		const background = imgBackground[ Math.floor(Math.random() * 3) ] // случайный фон
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
		ctx.drawImage(differentImg.vs, imgWidth / 2 + 40 + centerGoRight, 386, 50, 50)

		ctx.textAlign = "start"
		ctx.fillStyle = '#CC6600'
		if (typeMatch == 'Ranked') ctx.fillText(`Баны:`, 885, 420)
		ctx.fillStyle = "#ffffff"
		ctx.font = 'bold 15px Georgia'
		if (matchOne.Ban_1)ctx.drawImage(championsIds[fixText(matchOne.Ban_1)].img, 980, 360, 50, 50)
		if (matchOne.Ban_2)ctx.drawImage(championsIds[fixText(matchOne.Ban_2)].img, 1040, 360, 50, 50)
		if (matchOne.Ban_3)ctx.drawImage(championsIds[fixText(matchOne.Ban_3)].img, 980, 420, 50, 50)
		if (matchOne.Ban_4)ctx.drawImage(championsIds[fixText(matchOne.Ban_4)].img, 1040, 420, 50, 50)

		// рисуем таблицу
		ctx.fillStyle = "#000000"
		ctx.fillRect(0, 0, imgWidth, 32)
		ctx.fillStyle = "#1199cc"
		ctx.fillText('Чемпион', 10, 20)
		ctx.fillText('Игрок', 140, 20)
		ctx.fillText('Пати', 300, 20)
		ctx.fillText('Кредиты', 350, 20)
		ctx.fillText('K/D/A', 440, 20)
		ctx.fillText('Урон', 520, 20)
		ctx.fillText('Защита', 610, 20)
		ctx.fillText('Исцеление', 710, 20)
		ctx.fillText('Получено', 810, 20)
		ctx.fillText('У цели', 910, 20)
		ctx.fillText('Закуп', 980, 20)
		ctx.fillStyle = "#ffffff"

		const party = {}
		let partyNumber = 1
		const partyColors = ['#00FFFF', '#006400', '#F08080', '#FFFF00', '#FF0000', '#4682B4', '#C71585', '#FF4500', '#7FFF00'].sort(function() {
			return Math.random() - 0.5 // рандомизируем цвета каждый раз
		})

		for (let i = 0; i < matchDetails.length; i++) {
			const players = matchDetails[i]
			const champName = championsCard[players.ChampionId][0].champion_name
			
			const img = championsIds[fixText(champName)].img
			let nextTeam = i >= 5 ? 245 : 40
			ctx.drawImage(img, 10, 55 * i + nextTeam, 50, 50) // рисуем иконки чемпионов

			const imgLegendary = LegendarChampions[players.ItemId6]
			if (imgLegendary) ctx.drawImage(imgLegendary, 70, 55 * i + nextTeam, 50, 50) // рисуем легендарки

			// рисуем закуп
			const item1 = players.Item_Active_1
			if (item1) {
				ctx.drawImage(paladinsItems[fixText(item1)], 980, 55 * i + nextTeam, 40, 40)
				drawLevelItem(ctx, players.ActiveLevel1, 980, 55 * i + nextTeam + 43, 10, 3)
			}
			const item2 = players.Item_Active_2
			if (item2) {
				ctx.drawImage(paladinsItems[fixText(item2)], 1030, 55 * i + nextTeam, 40, 40)
				drawLevelItem(ctx, players.ActiveLevel2, 1030, 55 * i + nextTeam + 43, 10, 3)
			}
			const item3 = players.Item_Active_3
			if (item3) {
				ctx.drawImage(paladinsItems[fixText(item3)], 1080, 55 * i + nextTeam, 40, 40)
				drawLevelItem(ctx, players.ActiveLevel3, 1080, 55 * i + nextTeam + 43, 10, 3)
			}
			const item4 = players.Item_Active_4
			if (item4) {
				ctx.drawImage(paladinsItems[fixText(item4)], 1130, 55 * i + nextTeam, 40, 40)
				drawLevelItem(ctx, players.ActiveLevel4, 1130, 55 * i + nextTeam + 43, 10, 3)
			}

			const partyId = players.PartyId
			let partyNum = party[partyId]
			if (!partyNum) {
				party[partyId] = partyNum = partyNumber
				partyNumber++
			}

			ctx.fillText(players.playerName, 140, 55 * i + nextTeam + 15)
			ctx.fillStyle = "#CC6600"
			ctx.fillText(`lvl: ${players.Account_Level}`, 140, 55 * i + nextTeam + 40)

			nextTeam += 25

			ctx.fillStyle = partyColors[partyNum - 1]
			ctx.beginPath()
			ctx.arc(320, 55 * i + nextTeam - 2, 15, 0, 2*Math.PI, false) // круг пати
			ctx.fill()
			ctx.fillStyle = "#000000"
			ctx.fillText(partyNum, 316, 55 * i + nextTeam) // цифра пати
			ctx.fillStyle = "#ffffff"
			ctx.fillText(players.Gold_Earned, 350, 55 * i + nextTeam)
			ctx.fillStyle = "#CC6600"
			ctx.fillText(`${players.Kills_Player}/${players.Deaths}/${players.Assists}`, 440, 55 * i + nextTeam)
			ctx.fillStyle = "#ffffff"
			ctx.fillText(players.Damage_Player, 520, 55 * i + nextTeam)
			ctx.fillText(players.Damage_Mitigated, 610, 55 * i + nextTeam)
			ctx.fillText(players.Healing, 710, 55 * i + nextTeam)
			ctx.fillText(players.Damage_Taken, 810, 55 * i + nextTeam)
			ctx.fillText(players.Objective_Assists, 910, 55 * i + nextTeam)
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
			hiRezFunc("getmatchplayerdetails", matchId) // просмотр матча в реальном времени
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
					const img = championsIds[fixChampion(item.ChampionName)].img
					playerIdsList.push(item.playerId) // добавляем их в список
					if (i < 5) {
						ctx.drawImage(img, 70, 90 * i + 50, 50, 50)
						ctx.fillText(item.playerName, 130, 90 * i + 65)
						ctx.fillText(item.Account_Level, 130, 90 * i + 90)
						ctx.textAlign = 'center'
						ctx.fillText(item.ChampionLevel, 95, 90 * i + 120)
						ctx.textAlign = 'start'
					} else {
						ctx.drawImage(img, imgWidth - 120, 90 * (i - 5) + 50, 50, 50)
						ctx.textAlign = 'end'
						ctx.fillText(item.playerName, imgWidth - 130, 90 * (i - 5) + 65)
						ctx.fillText(item.Account_Level, imgWidth - 130, 90 * (i - 5) + 90)
						ctx.textAlign = 'center'
						ctx.fillText(item.ChampionLevel, imgWidth - 95, 90 * (i - 5) + 120)
					}
				}

				const vs = differentImg.vs
				ctx.drawImage(vs, imgWidth / 2 - 70, imgHeight / 2 - 70, 140, 140)

				hiRezFunc("getplayerbatch", playerIdsList)
				.then(list => {
					// перебираем list и playerIdsList проверяя на id и рисуя по позиции i от playerIdsList
					for (let i = 0; i < playerIdsList.length; i++) { // рисуем ранги
						if (championList[i].taskForce == 2 && i < 5) continue // фикс бага со скрытым игроком

						const id = playerIdsList[i]
						const acc = getAccForId(list, id)

						// если acc найден то рисуем
						const tier = acc.Tier_RankedKBM
						if (tier == undefined) continue
						const imgRank = rankedImage[tier] // получаем картинку ранга
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
	name = name.trim()
	// если начинается как пользователь, то тупо вырезаем все числа
	//if (name.indexOf("<@") == 0 || name.indexOf("@") == 0) name = name.replace(/[^0-9]+/ig, "")
	if ( name.match(/<@![0-9]+>/i) ) name = name.slice(3).slice(0, -1) // убираем еще хрень...
	if (name.indexOf("<@") == 0) name = name.slice(2).slice(0, -1) // убираем еще хрень...
	if (name.indexOf("@") == 0) name = name.slice(1) // если поставили @ то убираем ее
	//if (!name || name === "me") name = mess.author.id // если не указан, то это автор
	//if ( isNaN(+name) ) name = searchUser(name).id // ищем пользователя, его id

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
}



function searchAccauntsGuru(name) { // осуществляет поиск всех профилей на странице
	return new Promise((resolve) => {
		sendSite({url: `https://paladins.guru/search?term=${name}&type=Player`})
		.then((response) => {
			let html = response.body
			const result = []

			while (true) {
				const parse = html.match(/(?:\s*?<[^<>]+>\s*?){6}<a href="\/profile\/(?<name>[0-9]+-[^"]+)[^>]*?>[^>]*?>(?:\s*?<[^<>]+>\s*?){12}(?<region>[a-z ]+<\/span>\s*?[- a-z0-9_]+)(?:\s*?<[^<>]+>\s*?){3}\s*?.*?<div class="stat-row">\s*?<[^<>]+?>[a-z ]*?<[^<>]+?>\s*?<[^<>]+?>(?<last>[0-9a-z ]+?)<[^<>]+?>\s*?<\/div>\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]*?<[^<>]+?>\s*?<[^<>]+?>(?<playtime>[0-9 a-z,-]+?)<\/div>/i)
				if (parse === null) break
				parse.groups.region = parse.groups.region.replace("</span>", "")
				result.push(parse.groups)
				html = html.slice(parse.index + parse[0].length) // подолжать поиск
			}
			resolve(result)
		})
	})
}


// проверяет собранные аккаунты и возвращает результат проверки
function verifyAccauntGuru(mess, accList) { // mess, accList, будет через bind
	if (accList.length == 0) {
		// будет выводить сообщение о том что аккаунт не найден
		mess.reply(`Аккаунт не найден.`)
		return new Promise(() => {})
	}
	if (accList.length > 1) {
		// будет выводить сообщение со списком найденных аккаунтов, если их больше 10, то давать ссылку
		const url = `https://paladins.guru/${accList[0].name.replace(/[0-9]+-/i, "")}`
		let text = `Найдено ${accList.length} аккаунтов. Выбирите один из:`

		for (let i = 0; i < accList.length; i++) {
			const item = accList[i]
			text += `\r\n${i+1}) *name*: **${decodeURI(item.name)}**, *region*: **${item.region}**, *playtime*: **${item.playtime}**;`
		}
		text += `\r\nДля выбора аккаунта используйте эту же команду, только впишите одно из указанных выше имен, которые больше всего подходят на ваш взгляд под искомый вами аккаунт.`

		if (text.length >= 1900) text = `Найдено ${accList.length} аккаунтов. Смотрите аккаунт на сайте или же сохраните его командой **!me** (или укажите вместе с id), найдя его id на сайте: <${url}>.`
		mess.reply(text)
		return new Promise(() => {})
	}
	return accList[0]
}


function guruSummary(mess, accaunt) { // парсит страницу "Summary" и возвращает результат
	return new Promise((resolve) => {
		sendSite({url: `https://paladins.guru/profile/${accaunt.name}`})
		.then(response => {
			if (!response || !response.body) { // если пусто
				mess.reply(`Страница не найдена или пуста, возможно ошибка парсинга или проблемы с сайтом paladins.guru.`)
				return new Promise(() => {})
			}
			const html = response.body
																										//																																																																																																																																																																																																																																																																																																																																																																																																																																																																			// Player Stats END																																																												(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)																																																																																																																																																																																																																																																																																																																																																																																																																																								// хуита для урона																																									  8 до контейтера + колонки																						  credits																													CPM																											  KDA																												 Kills																												 Deaths																													Assists																													 Damage																													DPM																											  Weapon																													 Taken																												 Shielding																														Healing																													 SelfHealing																														  Jbjective Time																															 Wins																												  Losses																													 Ratio																		// хуита для фланга																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																		// хуита для танка																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																 // хуита для саппорта																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																												
			const parse = html.match(/profile-header__level">(?<lvl>[0-9]+)<\/div>.*?profile-header__region">\s*(?<region>[a-z0-9 -]+).*?Updated (?<updated>[a-z0-9 ]+).*?Matches<\/div>\s*?<[^<>]+?>\s*?(?:\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?)<[^<>]+?>(?<played>[0-9 ,]+)<[^<>]+?>(?:\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?)<[^<>]+?>(?<won>[0-9 ,]+)<[^<>]+?>(?:\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<lost>[0-9 ,]+)<.*?Player Kills<\/div>(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<kda>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<kills>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?)<[^<>]+?>(?<deaths>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?)<[^<>]+?>(?<assists>[0-9 \.,]+).*?Objectives<\/div>(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<cpm>[0-9]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<credits>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<objectiveTime>[0-9a-z,\. ]+)<.*?Damage<\/div>(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<player>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<teamHealing>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<selfHealing>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<weapon>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<shielding>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<taken>[0-9 \.,]+).*?(?:mpc__body">)?(?:(?:\s*?<[^<>]+?>){5}(?<name1>[a-z '-]+?)(?:\s*?<[^<>]+?>){2}[a-z ]+(?:\s*?<[^<>]+?>){5}(?<kda1>[0-9\.]+) KDA(?:\s*?<[^<>]+?>){2}\s*(?<kda11>[0-9 \.,\/]+)(?:\s*?<[^<>]+?>){4}(?<match1>[0-9 ()\%,-]+)(?:\s*?<[^<>]+?>){2}(?<time1>[0-9a-z,\. ]+)(?:\s*?<[^<>]+?>){3})?(?:(?:\s*?<[^<>]+?>){5}(?<name2>[a-z '-]+?)(?:\s*?<[^<>]+?>){2}[a-z ]+(?:\s*?<[^<>]+?>){5}(?<kda2>[0-9\.]+) KDA(?:\s*?<[^<>]+?>){2}\s*(?<kda22>[0-9 \.,\/]+)(?:\s*?<[^<>]+?>){4}(?<match2>[0-9 ()\%,-]+)(?:\s*?<[^<>]+?>){2}(?<time2>[0-9a-z,\. ]+)(?:\s*?<[^<>]+?>){3})?(?:(?:\s*?<[^<>]+?>){5}(?<name3>[a-z '-]+?)(?:\s*?<[^<>]+?>){2}[a-z ]+(?:\s*?<[^<>]+?>){5}(?<kda3>[0-9\.]+) KDA(?:\s*?<[^<>]+?>){2}\s*(?<kda33>[0-9 \.,\/]+)(?:\s*?<[^<>]+?>){4}(?<match3>[0-9 ()\%,-]+)(?:\s*?<[^<>]+?>){2}(?<time3>[0-9a-z,\. ]+)(?:\s*?<[^<>]+?>){3})?(?:(?:\s*?<[^<>]+?>){5}(?<name4>[a-z '-]+?)(?:\s*?<[^<>]+?>){2}[a-z ]+(?:\s*?<[^<>]+?>){5}(?<kda4>[0-9\.]+) KDA(?:\s*?<[^<>]+?>){2}\s*(?<kda44>[0-9 \.,\/]+)(?:\s*?<[^<>]+?>){4}(?<match4>[0-9 ()\%,-]+)(?:\s*?<[^<>]+?>){2}(?<time4>[0-9a-z,\. ]+)(?:\s*?<[^<>]+?>){3})?(?:(?:\s*?<[^<>]+?>){5}(?<name5>[a-z '-]+?)(?:\s*?<[^<>]+?>){2}[a-z ]+(?:\s*?<[^<>]+?>){5}(?<kda5>[0-9\.]+) KDA(?:\s*?<[^<>]+?>){2}\s*(?<kda55>[0-9 \.,\/]+)(?:\s*?<[^<>]+?>){4}(?<match5>[0-9 ()\%,-]+)(?:\s*?<[^<>]+?>){2}(?<time5>[0-9a-z,\. ]+)(?:\s*?<[^<>]+?>){3}).*?<div class="ptw__val"[^>]*?>(?<allTime>[a-z0-9 ,]+?)<\/div>.*?Casual\s*?<\/div>\s*?<[^<>]+?>(?<casualTime>[0-9a-z ,]+?)\s*?<\/div>.+?Ranked<\/div>\s*?<[^<>]+?>(?<rankedTime>[a-z0-9 ,]+?)<\/div>.*?(?:Stats by Class)?.*?(?:Damage(?:\s*?<[^<>]+?>){2}(?<damageGames>[0-9]+)[ a-z]+(?:\s*?<[^<>]+?>){8}(?<damageWinS>[0-9]+)(?:\s*?<[^<>]+?>){3}[a-z]+(?:\s*?<[^<>]+?>){8}(?:(?:\s*?<[^<>]+?>){4}\s*(?<damagePlaytime>[0-9a-z,\. ]+).*?playtime\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageCredits>[0-9a-z ,\.\%]+).*?credits\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageCpm>[0-9a-z ,\.\%]+).*?cpm\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageKda>[0-9a-z ,\.\%]+).*?kda\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageKills>[0-9a-z ,\.\%]+).*?kills\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageDeaths>[0-9a-z ,\.\%]+).*?deaths\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageAssists>[0-9a-z ,\.\%]+).*?assists\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageDamage>[0-9a-z ,\.\%]+).*?damage\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageDpm>[0-9a-z ,\.\%]+).*?dpm\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageWeapon>[0-9a-z ,\.\%]+).*?weapon\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageTaken>[0-9a-z ,\.\%]+).*?taken\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageShielding>[0-9a-z ,\.\%]+).*?shielding\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageHealing>[0-9a-z ,\.\%]+).*?healing\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageSelfHealing>[0-9a-z ,\.\%]+).*?self healing\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageObjectiveTime>[0-9a-z ,\.\%]+).*?objective time\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageWins>[0-9a-z ,\.\%]+).*?wins\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageLosses>[0-9a-z ,\.\%]+).*?losses\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<damageRatio>[0-9a-z ,\.\%]+)))?\s*<div class="percentile-stat__bar.*?(?:Flanker(?:\s*?<[^<>]+?>){2}(?<flankerGames>[0-9]+)[ a-z]+(?:\s*?<[^<>]+?>){8}(?<flankerWinS>[0-9]+)(?:\s*?<[^<>]+?>){3}[a-z]+(?:\s*?<[^<>]+?>){8}(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerPlaytime>[0-9a-z,\. ]+).*?playtime\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerCredits>[0-9a-z ,\.\%]+).*?credits\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerCpm>[0-9a-z ,\.\%]+).*?cpm\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerKda>[0-9a-z ,\.\%]+).*?kda\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerKills>[0-9a-z ,\.\%]+).*?kills\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerDeaths>[0-9a-z ,\.\%]+).*?deaths\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerAssists>[0-9a-z ,\.\%]+).*?assists\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerDamage>[0-9a-z ,\.\%]+).*?damage\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerDpm>[0-9a-z ,\.\%]+).*?dpm\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerWeapon>[0-9a-z ,\.\%]+).*?weapon\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerTaken>[0-9a-z ,\.\%]+).*?taken\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerShielding>[0-9a-z ,\.\%]+).*?shielding\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerHealing>[0-9a-z ,\.\%]+).*?healing\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerSelfHealing>[0-9a-z ,\.\%]+).*?self healing\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerObjectiveTime>[0-9a-z ,\.\%]+).*?objective time\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerWins>[0-9a-z ,\.\%]+).*?wins\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerLosses>[0-9a-z ,\.\%]+).*?losses\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<flankerRatio>[0-9a-z ,\.\%]+)))?\s*<div class="percentile-stat__bar.*?(?:Front Line(?:\s*?<[^<>]+?>){2}(?<frontlineGames>[0-9]+)[ a-z]+(?:\s*?<[^<>]+?>){8}(?<frontlineWinS>[0-9]+)(?:\s*?<[^<>]+?>){3}[a-z]+(?:\s*?<[^<>]+?>){8}(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlinePlaytime>[0-9a-z,\. ]+).*?playtime\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineCredits>[0-9a-z ,\.\%]+).*?credits\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineCpm>[0-9a-z ,\.\%]+).*?cpm\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineKda>[0-9a-z ,\.\%]+).*?kda\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineKills>[0-9a-z ,\.\%]+).*?kills\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineDeaths>[0-9a-z ,\.\%]+).*?deaths\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineAssists>[0-9a-z ,\.\%]+).*?assists\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineDamage>[0-9a-z ,\.\%]+).*?damage\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineDpm>[0-9a-z ,\.\%]+).*?dpm\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineWeapon>[0-9a-z ,\.\%]+).*?weapon\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineTaken>[0-9a-z ,\.\%]+).*?taken\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineShielding>[0-9a-z ,\.\%]+).*?shielding\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineHealing>[0-9a-z ,\.\%]+).*?healing\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineSelfHealing>[0-9a-z ,\.\%]+).*?self healing\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineObjectiveTime>[0-9a-z ,\.\%]+).*?objective time\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineWins>[0-9a-z ,\.\%]+).*?wins\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineLosses>[0-9a-z ,\.\%]+).*?losses\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<frontlineRatio>[0-9a-z ,\.\%]+)))?\s*<div class="percentile-stat__bar.*?(?:Support(?:\s*?<[^<>]+?>){2}(?<supportGames>[0-9]+)[ a-z]+(?:\s*?<[^<>]+?>){8}(?<supportWinS>[0-9]+)(?:\s*?<[^<>]+?>){3}[a-z]+(?:\s*?<[^<>]+?>){8}(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportPlaytime>[0-9a-z,\. ]+).*?playtime\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportCredits>[0-9a-z ,\.\%]+).*?credits\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportCpm>[0-9a-z ,\.\%]+).*?cpm\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportKda>[0-9a-z ,\.\%]+).*?kda\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportKills>[0-9a-z ,\.\%]+).*?kills\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportDeaths>[0-9a-z ,\.\%]+).*?deaths\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportAssists>[0-9a-z ,\.\%]+).*?assists\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportDamage>[0-9a-z ,\.\%]+).*?damage\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportDpm>[0-9a-z ,\.\%]+).*?dpm\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportWeapon>[0-9a-z ,\.\%]+).*?weapon\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportTaken>[0-9a-z ,\.\%]+).*?taken\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportShielding>[0-9a-z ,\.\%]+).*?shielding\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportHealing>[0-9a-z ,\.\%]+).*?healing\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportSelfHealing>[0-9a-z ,\.\%]+).*?self healing\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportObjectiveTime>[0-9a-z ,\.\%]+).*?objective time\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportWins>[0-9a-z ,\.\%]+).*?wins\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportLosses>[0-9a-z ,\.\%]+).*?losses\s*?(?:\s*?<[^<>]+?>){4})(?:(?:\s*?<[^<>]+?>){4}\s*(?<supportRatio>[0-9a-z ,\.\%]+)))?\s*<div class="percentile-stat__bar/is)
																										//																																																																																																																																																																																																																																																																																																																																																																																																																																																																																			имя персонажа																																																																							 end1																																																																																						end2																																																																																					  end3																																																																																					 end4																																																																																								 end5																																																																				// хуита для урона																																										 playtime																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																															
			if (!parse) { // если не найденно (пусто или ошибка)
				mess.reply(`Страница не найдена или пуста, возможно ошибка парсинга или проблемы с сайтом paladins.guru.`)
				return new Promise(() => {})
			}
			resolve({groups: parse.groups, accaunt})
		})
	})
}


function guruRanked(mess, accaunt) { // парсит страницу "Ranked"
	return new Promise((resolve) => {
		sendSite({url: `https://paladins.guru/profile/${accaunt.name}/ranked`})
		.then(response => {
			if (!response || !response.body) { // если пусто
				mess.reply(`Страница не найдена или пуста, возможно ошибка парсинга или проблемы с сайтом paladins.guru.`)
				return new Promise(() => {})
			}
			const html = response.body
			const parse = html.match(/profile-header__level">(?<lvl>[0-9]+)<\/div>.*?profile-header__region">\s*(?<region>[a-z0-9 -]+).*?Updated (?<updated>[a-z0-9 ]+).*?mpc__body">(?:(?:\s*?<[^<>]+?>){5}(?<name1>[a-z '-]+?)(?:\s*?<[^<>]+?>){2}[a-z ]+(?:\s*?<[^<>]+?>){5}(?<kda1>[0-9\.]+) KDA(?:\s*?<[^<>]+?>){2}\s*(?<kda11>[0-9 \.,\/]+)(?:\s*?<[^<>]+?>){4}(?<match1>[0-9 ()\%,-]+)(?:\s*?<[^<>]+?>){2}(?<time1>[0-9a-z,\. ]+)(?:\s*?<[^<>]+?>){3})(?:(?:\s*?<[^<>]+?>){5}(?<name2>[a-z '-]+?)(?:\s*?<[^<>]+?>){2}[a-z ]+(?:\s*?<[^<>]+?>){5}(?<kda2>[0-9\.]+) KDA(?:\s*?<[^<>]+?>){2}\s*(?<kda22>[0-9 \.,\/]+)(?:\s*?<[^<>]+?>){4}(?<match2>[0-9 ()\%,-]+)(?:\s*?<[^<>]+?>){2}(?<time2>[0-9a-z,\. ]+)(?:\s*?<[^<>]+?>){3})(?:(?:\s*?<[^<>]+?>){5}(?<name3>[a-z '-]+?)(?:\s*?<[^<>]+?>){2}[a-z ]+(?:\s*?<[^<>]+?>){5}(?<kda3>[0-9\.]+) KDA(?:\s*?<[^<>]+?>){2}\s*(?<kda33>[0-9 \.,\/]+)(?:\s*?<[^<>]+?>){4}(?<match3>[0-9 ()\%,-]+)(?:\s*?<[^<>]+?>){2}(?<time3>[0-9a-z,\. ]+)(?:\s*?<[^<>]+?>){3})(?:(?:\s*?<[^<>]+?>){5}(?<name4>[a-z '-]+?)(?:\s*?<[^<>]+?>){2}[a-z ]+(?:\s*?<[^<>]+?>){5}(?<kda4>[0-9\.]+) KDA(?:\s*?<[^<>]+?>){2}\s*(?<kda44>[0-9 \.,\/]+)(?:\s*?<[^<>]+?>){4}(?<match4>[0-9 ()\%,-]+)(?:\s*?<[^<>]+?>){2}(?<time4>[0-9a-z,\. ]+)(?:\s*?<[^<>]+?>){3})(?:(?:\s*?<[^<>]+?>){5}(?<name5>[a-z '-]+?)(?:\s*?<[^<>]+?>){2}[a-z ]+(?:\s*?<[^<>]+?>){5}(?<kda5>[0-9\.]+) KDA(?:\s*?<[^<>]+?>){2}\s*(?<kda55>[0-9 \.,\/]+)(?:\s*?<[^<>]+?>){4}(?<match5>[0-9 ()\%,-]+)(?:\s*?<[^<>]+?>){2}(?<time5>[0-9a-z,\. ]+)(?:\s*?<[^<>]+?>){3}).*?Matches<\/div>\s*?<[^<>]+?>\s*?(?:\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?)<[^<>]+?>(?<played>[0-9 ,]+)<[^<>]+?>(?:\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?)<[^<>]+?>(?<won>[0-9 ,]+)<[^<>]+?>(?:\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<lost>[0-9 ,]+)<.*?Player Kills<\/div>(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<kda>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<kills>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?)<[^<>]+?>(?<deaths>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?)<[^<>]+?>(?<assists>[0-9 \.,]+).*?Objectives<\/div>(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<cpm>[0-9]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<credits>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<objectiveTime>[0-9a-z,\. ]+)<.*?Damage<\/div>(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<player>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<teamHealing>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<selfHealing>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<weapon>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<shielding>[0-9 \.,]+)(?:\s*?<[^<>]+?>\s*?<[^<>]+?>[a-z ]+<[^<>]+?>\s*?<[^<>]+?>)(?<taken>[0-9 \.,]+).*?queue-widget__rating[^<>]+?>(?:\s*?<[^<>]+?>){2}\s*(?<elo>[0-8 ,\.]+).*?<img alt="(?<rank>[a-z ]+)".*?(?<tp>\d+(?= \/ 100))[^<]+?(?:\s*?<[^<>]+?>){13}\s*(?<playtime>[a-z0-9 ]+)/is)
			// dpm не парсил ибо далеко и влом

			if (!parse) { // если не найденно (пусто или ошибка)
				mess.reply(`Страница не найдена или пуста, возможно ошибка парсинга или проблемы с сайтом paladins.guru.`)
				return new Promise(() => {})
			}
			resolve({groups: parse.groups, accaunt})
		})
	})
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

function getRankGuru(rank) {
	switch (rank) {
		case "Qualifying": return 0
		case "Bronze V": return 1
		case "Bronze IV": return 2
		case "Bronze III": return 3
		case "Bronze II": return 4
		case "Bronze I": return 5
		case "Silver V": return 6
		case "Silver IV": return 7
		case "Silver III": return 8
		case "Silver II": return 9
		case "Silver I": return 10
		case "Gold V": return 11
		case "Gold IV": return 12
		case "Gold III": return 13
		case "Gold II": return 14
		case "Gold I": return 15
		case "Platinum V": return 16
		case "Platinum IV": return 17
		case "Platinum III": return 18
		case "Platinum II": return 19
		case "Platinum I": return 20
		case "Diamond V": return 21
		case "Diamond IV": return 22
		case "Diamond III": return 23
		case "Diamond II": return 24
		case "Diamond I": return 25
		case "Masters": return 26
		case "Grandmasters": return 27
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
	let heals = ["Mal'Damba", "Ying", "Grover", "Jenos", "Grohk", "Pip", "Seris", "Furia", "Io"],
		dmgs = ["Lian", "Cassie", "Drogoz", "Strix", "Viktor", "Sha Lin", "Bomb King", "Kinessa", "Tyra", "Vivian", "Willo", "Dredge", "Imani"],
		flanks = ["Androxus", "Buck", "Zhin", "Evie", "Koga", "Talus", "Maeve", "Skye", "Lex", "Moji"],
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


function fixText(text) { // фиксит текст под правильный запрос для картинки чемпиона
	while (true) {
		const sh = text.indexOf('\'')
		if (sh != -1) text = text.slice(0, sh) + '-' + text.slice(sh + 1)
		const space = text.indexOf(' ')
		if (space == -1) break
		text = text.slice(0, space) + '-' + text.slice(space + 1)
	}
	return text.toLowerCase()
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

// удаляет все точки и запятые из строки
function repStatsDot(str) {
	if (!str) return '-'
	return str.replace(/[\.,]/g, "")
}

function getStatsHours(str) {
	if (!str) return '-'
	const index = str.indexOf("h")
	return index == -1 ? "0ч" : str.slice(0, index) + "ч"
}

function getStatsProcent(str) {
	if (!str) return '-'
	return str.match(/[0-9]+\%/g)
}
// <--- PALADINS STATS default function <---



// ---> smal stats --->
function drawStatsSmall(params) {
	const statsWidth = params.statsWidth = 830
	const canvas = createCanvas(statsWidth, 360)
	const ctx = canvas.getContext('2d')
	ctx.font = 'bold 16px Georgia'

	return new Promise((resolve) => {
		// загружаем случайный глобальный фон для статы
		const img = imgBackground[ Math.floor(Math.random() * 3) ] // случайный фон
		const par = params.groups
		ctx.drawImage(img, 0, 0, statsWidth, 330)
		drawItemsStatsSmall(ctx, params) // рисуем эллементы не нужнающиеся в промисах
		
		const championList = []
		for (let i = 1; i < 6; i++) {
			const champion = par[`name${i}`]
			if (!champion) break
			championList.push( championsIds[fixChampion(champion)].img )
		}

		if (!championList.length) resolve({ctx, ...params}) // если чемпионов нет
		drawChampionsStatsSmall(ctx, championList) // рисуем загруженных чемпионов
		resolve({ctx, ...params})
	})
}


function drawChampionsStatsSmall(ctx, imgList) {
	let positionX = 490
	for (let i = 0; i < imgList.length; i++) {
		const img = imgList[i]
		const x = positionX + 60 * i
		ctx.drawImage(img, x, 180, 50, 50)
	}
}


function drawItemsStatsSmall(ctx, params) { // для smallStats
	const par = params.groups
	const name = decodeURI(params.accaunt.name).replace(/[0-9]+-/, "")
	const region = par.region.replace(/[a-z ]+- /i, "")
	const totalMatches = repStatsDot(par.played)

	// рисуем инфу ->
	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Обновлено: ${par.updated || "-"}`, 10, 20)
	ctx.fillStyle = "#FF6600"
	ctx.fillText(`${name} (${region || "-"})`, 10, 40)
	ctx.fillStyle = "#33CC00"
	ctx.fillText(`lvl: ${par.lvl}`, 10, 60)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Матчей`, 40, 100)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`Всего: ${par.played || 0}`, 10, 120)
	ctx.fillText(`Проиграно: ${par.lost || 0}`, 10, 140)
	ctx.fillText(`Выиграно: ${par.won || 0}`, 10, 160)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Урон`, 40, 200)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`Игрокам: ${par.player || 0}`, 10, 220)
	ctx.fillText(`Исцеления: ${par.teamHealing || 0}`, 10, 240)
	ctx.fillText(`Самохилл: ${par.selfHealing || 0}`, 10, 260)
	ctx.fillText(`Оружием: ${par.weapon || 0}`, 10, 280)
	ctx.fillText(`Защита: ${par.shielding || 0}`, 10, 300)
	ctx.fillText(`Получено: ${par.taken || 0}`, 10, 320)

	// колона 2
	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Времени`, 300, 20)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`Всего: ${par.allTime || 0}`, 270, 40)
	ctx.fillText(`Казуал: ${par.casualTime || 0}`, 270, 60)
	ctx.fillText(`Ранкед: ${par.rankedTime || 0}`, 270, 80)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Цели`, 300, 120)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`CPM: ${par.cpm || 0}`, 270, 140)
	ctx.fillText(`Кредиты: ${par.credits || 0}`, 270, 160)
	ctx.fillText(`У цели: ${par.objectiveTime || 0}`, 270, 180)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Убийства`, 300, 220)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`KDA: ${par.kda || 0}`, 270, 240)
	ctx.fillText(`Убийств: ${par.kills || 0}`, 270, 260)
	ctx.fillText(`Смертей: ${par.deaths || 0}`, 270, 280)
	ctx.fillText(`Помощи: ${par.assists || 0}`, 270, 300)

	// рисуем диаграмму ->
	const dmgDeg = 360 * (repStatsDot(par.damageGames) / totalMatches)
	const flankDeg = 360 * (repStatsDot(par.flankerGames) / totalMatches)
	const tankDeg = 360 * (repStatsDot(par.frontlineGames) / totalMatches)

	const second = tankDeg + dmgDeg
	const third = flankDeg + dmgDeg + tankDeg
	if (0 < dmgDeg) drawPieSlice(ctx, 550, 80, 50, 0, dmgDeg, "#9966FF")
	if (dmgDeg < second) drawPieSlice(ctx, 550, 80, 50, dmgDeg, tankDeg + dmgDeg, "#3399CC")
	if (second < third) drawPieSlice(ctx, 550, 80, 50, tankDeg + dmgDeg, flankDeg + dmgDeg + tankDeg, "#FF6600")
	if (third < 360) drawPieSlice(ctx, 550, 80, 50, flankDeg + dmgDeg + tankDeg, 360, "#33CC00")
	ctx.fillStyle = "#9966FF"
	ctx.fillRect(620, 40, 15, 15)
	ctx.fillStyle = "#3399CC"
	ctx.fillRect(620, 62, 15, 15)
	ctx.fillStyle = "#FF6600"
	ctx.fillRect(620, 84, 15, 15)
	ctx.fillStyle = "#33CC00"
	ctx.fillRect(620, 106, 15, 15)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText("Роли:", 580, 20)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`Урон - ${fixNaN((par.damageGames / totalMatches * 100).toFixed(2))}%`, 640, 54)
	ctx.fillText(`Танк - ${fixNaN((par.frontlineGames / totalMatches * 100).toFixed(2))}%`, 640, 76)
	ctx.fillText(`Фланг - ${fixNaN((par.flankerGames / totalMatches * 100).toFixed(2))}%`, 640, 98)
	ctx.fillText(`Саппорт - ${fixNaN((par.supportGames / totalMatches * 100).toFixed(2))}%`, 640, 120)

	// любимые чемпионы ->
	ctx.textAlign = "center"
	ctx.fillStyle = "#DBDB00"
	ctx.fillText("ПОПУЛЯРНЫЕ ЧЕМПИОНЫ:", 635, 160)

	ctx.fillStyle = "#009900"
	ctx.fillText(getStatsHours(par.time1), 515, 250)
	ctx.fillText(getStatsHours(par.time2), 575, 250)
	ctx.fillText(getStatsHours(par.time3), 635, 250)
	ctx.fillText(getStatsHours(par.time4), 695, 250)
	ctx.fillText(getStatsHours(par.time5), 755, 250)

	ctx.fillStyle = "#CC6600"
	ctx.fillText(par.kda1 || "-", 515, 270)
	ctx.fillText(par.kda2 || "-", 575, 270)
	ctx.fillText(par.kda3 || "-", 635, 270)
	ctx.fillText(par.kda4 || "-", 695, 270)
	ctx.fillText(par.kda5 || "-", 755, 270)

	ctx.fillStyle = "#0088bb"
	ctx.fillText(getStatsProcent(par.match1), 515, 290)
	ctx.fillText(getStatsProcent(par.match2), 575, 290)
	ctx.fillText(getStatsProcent(par.match3), 635, 290)
	ctx.fillText(getStatsProcent(par.match4), 695, 290)
	ctx.fillText(getStatsProcent(par.match5), 755, 290)

	// текст снизу
	ctx.fillStyle = "#000000"
	ctx.fillRect(0, 330, params.statsWidth, 360) // черный прямоугольник снизу
	ctx.font = 'bold 14px Georgia' // Franklin Gothic Medium
	ctx.fillStyle = "#00CCFF"
	ctx.fillText(`Информация взята с paladins.guru / !hh показать список команд`, params.statsWidth / 2, 350)
}
// <--- smal stats <---



// ---> full stats --->
function drawStatsFull(params) {
	const statsWidth = params.statsWidth = 1010
	const canvas = createCanvas(statsWidth, 590)
	const ctx = canvas.getContext('2d')
	ctx.font = 'bold 16px Georgia'

	return new Promise((resolve) => {
		// загружаем случайный глобальный фон для статы
		const img = imgBackground[ Math.floor(Math.random() * 3) ] // случайный фон
		const par = params.groups
		ctx.drawImage(img, 0, 0, statsWidth, 600)
		drawItemsStatsFull(ctx, params) // рисуем эллементы не нужнающиеся в промисах
		
		const championList = []
		for (let i = 1; i < 6; i++) {
			const champion = par[`name${i}`]
			if (!champion) break
			championList.push( championsIds[fixChampion(champion)].img )
		}

		if (!championList.length) resolve({ctx, ...params}) // если чемпионов нет

		drawChampionsStatsFull(ctx, championList) // рисуем загруженных чемпионов
		resolve({ctx, ...params})
	})
}


function drawItemsStatsFull(ctx, params) {
	const par = params.groups
	const name = decodeURI(params.accaunt.name).replace(/[0-9]+-/, "")
	const region = par.region.replace(/[a-z ]+- /i, "")
	const totalMatches = repStatsDot(par.played)

	// рисуем инфу ->
	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Обновлено:`, 10, 20)
	ctx.fillStyle = "#FF6600"
	ctx.fillText(par.updated || "-", 30, 40)
	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`name:`, 10, 60)
	ctx.fillStyle = "#FF6600"
	ctx.fillText(`${name}`, 30, 80)
	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`region:`, 10, 100)
	ctx.fillStyle = "#FF6600"
	ctx.fillText(`${region || "-"}`, 30, 120)
	ctx.fillStyle = "#33CC00"
	ctx.fillText(`lvl: ${par.lvl}`, 10, 140)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Матчи`, 235, 20)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`Всего: ${par.played || 0}`, 205, 40)
	ctx.fillText(`Проиграно: ${par.lost || 0}`, 205, 60)
	ctx.fillText(`Выиграно: ${par.won || 0}`, 205, 80)
	ctx.fillText(`CPM: ${par.cpm || 0}`, 205, 100)
	ctx.fillText(`Кредиты: ${par.credits || 0}`, 205, 120)
	ctx.fillText(`У цели: ${par.objectiveTime || 0}`, 205, 140)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Времени`, 450, 20)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`Всего: ${par.allTime || 0}`, 430, 40)
	ctx.fillText(`Казуал: ${par.casualTime || 0}`, 430, 60)
	ctx.fillText(`Ранкед: ${par.rankedTime || 0}`, 430, 80)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Убийства`, 650, 20)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`KDA: ${par.kda || 0}`, 620, 40)
	ctx.fillText(`Убийств: ${par.kills || 0}`, 620, 60)
	ctx.fillText(`Смертей: ${par.deaths || 0}`, 620, 80)
	ctx.fillText(`Помощи: ${par.assists || 0}`, 620, 100)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Урон`, 820, 20)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`Игрокам: ${par.player || 0}`, 790, 40)
	ctx.fillText(`Исцеления: ${par.teamHealing || 0}`, 790, 60)
	ctx.fillText(`Самохилл: ${par.selfHealing || 0}`, 790, 80)
	ctx.fillText(`Оружием: ${par.weapon || 0}`, 790, 100)
	ctx.fillText(`Защита: ${par.shielding || 0}`, 790, 120)
	ctx.fillText(`Получено: ${par.taken || 0}`, 790, 140)

	// заголовки таблицы
	ctx.textAlign = "center"
	ctx.fillStyle = "#9966FF"
	ctx.fillText(`Урон`, 200, 180)
	ctx.fillStyle = "#FF6600"
	ctx.fillText(`Фланг`, 320, 180)
	ctx.fillStyle = "#3399CC"
	ctx.fillText(`Танк`, 440, 180)
	ctx.fillStyle = "#33CC00"
	ctx.fillText(`Саппорт`, 560, 180)
	ctx.fillStyle = "#ffffff"

	// заполнение таблицы
	drawTableSF(ctx, params.groups)

	// рисуем диаграмму ->
	const dmgDeg = 360 * (repStatsDot(par.damageGames) / totalMatches)
	const flankDeg = 360 * (repStatsDot(par.flankerGames) / totalMatches)
	const tankDeg = 360 * (repStatsDot(par.frontlineGames) / totalMatches)
	const second = tankDeg + dmgDeg
	const third = flankDeg + dmgDeg + tankDeg

	if (0 < dmgDeg) drawPieSlice(ctx, 700, 250, 50, 0, dmgDeg, "#9966FF")
	if (dmgDeg < second) drawPieSlice(ctx, 700, 250, 50, dmgDeg, tankDeg + dmgDeg, "#3399CC")
	if (second < third) drawPieSlice(ctx, 700, 250, 50, tankDeg + dmgDeg, flankDeg + dmgDeg + tankDeg, "#FF6600")
	if (third < 360) drawPieSlice(ctx, 700, 250, 50, flankDeg + dmgDeg + tankDeg, 360, "#33CC00")
	ctx.fillStyle = "#9966FF"
	ctx.fillRect(770, 210, 15, 15)
	ctx.fillStyle = "#3399CC"
	ctx.fillRect(770, 232, 15, 15)
	ctx.fillStyle = "#FF6600"
	ctx.fillRect(770, 254, 15, 15)
	ctx.fillStyle = "#33CC00"
	ctx.fillRect(770, 276, 15, 15)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText("Роли:", 730, 190)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`Урон - ${fixNaN((par.damageGames / totalMatches * 100).toFixed(2))}%`, 790, 224)
	ctx.fillText(`Танк - ${fixNaN((par.frontlineGames / totalMatches * 100).toFixed(2))}%`, 790, 246)
	ctx.fillText(`Фланг - ${fixNaN((par.flankerGames / totalMatches * 100).toFixed(2))}%`, 790, 268)
	ctx.fillText(`Саппорт - ${fixNaN((par.supportGames / totalMatches * 100).toFixed(2))}%`, 790, 290)

	// любимые чемпионы ->
	ctx.textAlign = "center"
	ctx.fillStyle = "#DBDB00"
	ctx.fillText("ПОПУЛЯРНЫЕ ЧЕМПИОНЫ:", 785, 360)

	ctx.fillStyle = "#009900"
	ctx.fillText(getStatsHours(par.time1), 665, 450)
	ctx.fillText(getStatsHours(par.time2), 725, 450)
	ctx.fillText(getStatsHours(par.time3), 785, 450)
	ctx.fillText(getStatsHours(par.time4), 845, 450)
	ctx.fillText(getStatsHours(par.time5), 905, 450)

	ctx.fillStyle = "#CC6600"
	ctx.fillText(par.kda1 || "-", 665, 470)
	ctx.fillText(par.kda2 || "-", 725, 470)
	ctx.fillText(par.kda3 || "-", 785, 470)
	ctx.fillText(par.kda4 || "-", 845, 470)
	ctx.fillText(par.kda5 || "-", 905, 470)

	ctx.fillStyle = "#0088bb"
	ctx.fillText(getStatsProcent(par.match1), 665, 490)
	ctx.fillText(getStatsProcent(par.match2), 725, 490)
	ctx.fillText(getStatsProcent(par.match3), 785, 490)
	ctx.fillText(getStatsProcent(par.match4), 845, 490)
	ctx.fillText(getStatsProcent(par.match5), 905, 490)

	// текст снизу
	ctx.fillStyle = "#000000"
	ctx.fillRect(0, 560, params.statsWidth, 590) // черный прямоугольник снизу
	ctx.font = 'bold 14px Georgia' // Franklin Gothic Medium
	ctx.fillStyle = "#00CCFF"
	ctx.fillText(`Информация взята с paladins.guru / !hh показать список команд`, params.statsWidth / 2, 580)
}


function drawTableSF(ctx, params) {
	const role = ["damage", "flanker", "frontline", "support"]
	const table = ["Playtime", "Credits", "Cpm", "Kda", "Kills", "Deaths", "Assists", "Damage", "Dpm", 
		"Weapon", "Taken", "Shielding", "Healing", "SelfHealing", "ObjectiveTime", "Wins", "Losses", "Ratio"]

	let x = 200
	for (let i = 0; i < role.length; i++) {
		let y = 200
		for (let k = 0; k < table.length; k++) {
			const par = role[i] + table[k]
			const text = params[par] || 0
			ctx.textAlign = "center"
			ctx.fillStyle = "#ffffff"
			ctx.fillText(text, x, y)
			ctx.textAlign = "start"
			ctx.fillStyle = "#DBDB00"
			ctx.fillText(table[k], 10, y) // .toLocaleLowerCase()
			y += 20
		}
		x += 120
	}
}


function drawChampionsStatsFull(ctx, imgList) {
	let positionX = 640
	for (let i = 0; i < imgList.length; i++) {
		const img = imgList[i]
		const x = positionX + 60 * i
		ctx.drawImage(img, x, 380, 50, 50)
	}
}
// <--- full stats <---



// ---> ranked stats --->
function drawStatsRanked(params) {
	const statsWidth = params.statsWidth = 800
	const canvas = createCanvas(statsWidth, 340)
	const ctx = canvas.getContext('2d')
	ctx.font = 'bold 16px Georgia'
	const rank = getRankGuru(params.groups.rank)

	return new Promise((resolve) => {
		// загружаем случайный глобальный фон для статы
		const img = imgBackground[ Math.floor(Math.random() * 3) ] // случайный фон
		const par = params.groups
		ctx.drawImage(img, 0, 0, statsWidth, 310)
		drawItemsRanked(ctx, params) // рисуем эллементы не нужнающиеся в промисах
		
		const championList = []
		for (let i = 1; i < 6; i++) {
			const champion = par[`name${i}`]
			if (!champion) break
			championList.push( championsIds[fixChampion(champion)].img )
		}

		const rankUrl = rank ? `divisions/${rank}.png` : 'no-rank.png'
		loadImage(rankUrl) // загружаем картинку ранга
		.then((img) => {
			const coefficient = rank == 27 ? 1.257 : rank == 26 ? 1.151 : 1
			// рисуем картинку ранга
			ctx.drawImage(img, 2, 12, 120, 120 * coefficient)

			if (!championList.length) resolve({ctx, ...params}) // если чемпионов нет

			drawChampionsRanked(ctx, championList) // рисуем загруженных чемпионов
			resolve({ctx, ...params})
		})
	})
}


function drawItemsRanked(ctx, params) {
	const par = params.groups
	const name = decodeURI(params.accaunt.name).replace(/[0-9]+-/, "")
	const region = par.region.replace(/[a-z ]+- /i, "")
	const totalMatches = repStatsDot(par.played)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Обновлено: ${par.updated || "-"}`, 130, 20)
	ctx.fillStyle = "#FF6600"
	ctx.fillText(`${name} (${region || "-"})`, 130, 40)
	ctx.fillStyle = "#33CC00"
	ctx.fillText(`Lvl: ${par.lvl}`, 130, 60)
	ctx.fillStyle = "#9966FF"
	ctx.fillText(`Elo: ${par.elo || 0}`, 130, 80)
	ctx.fillStyle = "#3399CC"
	ctx.fillText(`Ранг: ${par.rank}`, 130, 100)
	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`ОТ: ${par.tp}`, 130, 120)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Урон`, 40, 170)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`Игрокам: ${par.player || 0}`, 10, 190)
	ctx.fillText(`Исцеления: ${par.teamHealing || 0}`, 10, 210)
	ctx.fillText(`Самохилл: ${par.selfHealing || 0}`, 10, 230)
	ctx.fillText(`Оружием: ${par.weapon || 0}`, 10, 250)
	ctx.fillText(`Защита: ${par.shielding || 0}`, 10, 270)
	ctx.fillText(`Получено: ${par.taken || 0}`, 10, 290)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Убийства`, 280, 170)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`KDA: ${par.kda || 0}`, 250, 190)
	ctx.fillText(`Убийств: ${par.kills || 0}`, 250, 210)
	ctx.fillText(`Смертей: ${par.deaths || 0}`, 250, 230)
	ctx.fillText(`Помощи: ${par.assists || 0}`, 250, 250)
	ctx.fillText(`CPM: ${par.cpm || 0}`, 250, 270)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Матчи`, 420, 20)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`Всего: ${par.played || 0}`, 390, 40)
	ctx.fillText(`Проиграно: ${par.lost || 0}`, 390, 60)
	ctx.fillText(`Выиграно: ${par.won || 0}`, 390, 80)
	ctx.fillText(`Винрейт: ${fixNaN((par.won / par.played * 100).toFixed(2))}%`, 390, 100)

	ctx.fillStyle = "#DBDB00"
	ctx.fillText(`Разное`, 600, 20)
	ctx.fillStyle = "#ffffff"
	ctx.fillText(`Сыграно: ${par.playtime || 0}`, 570, 40)
	ctx.fillText(`Кредитов: ${par.credits || 0}`, 570, 60)
	ctx.fillText(`Время цели: ${par.objectiveTime || 0}`, 570, 80)

	// любимые чемпионы ->
	ctx.textAlign = "center"
	ctx.fillStyle = "#DBDB00"
	ctx.fillText("ПОПУЛЯРНЫЕ ЧЕМПИОНЫ:", 615, 160)

	ctx.fillStyle = "#009900"
	ctx.fillText(getStatsHours(par.time1), 495, 250)
	ctx.fillText(getStatsHours(par.time2), 555, 250)
	ctx.fillText(getStatsHours(par.time3), 615, 250)
	ctx.fillText(getStatsHours(par.time4), 675, 250)
	ctx.fillText(getStatsHours(par.time5), 735, 250)

	ctx.fillStyle = "#CC6600"
	ctx.fillText(par.kda1 || "-", 495, 270)
	ctx.fillText(par.kda2 || "-", 555, 270)
	ctx.fillText(par.kda3 || "-", 615, 270)
	ctx.fillText(par.kda4 || "-", 675, 270)
	ctx.fillText(par.kda5 || "-", 735, 270)

	ctx.fillStyle = "#0088bb"
	ctx.fillText(getStatsProcent(par.match1), 495, 290)
	ctx.fillText(getStatsProcent(par.match2), 555, 290)
	ctx.fillText(getStatsProcent(par.match3), 615, 290)
	ctx.fillText(getStatsProcent(par.match4), 675, 290)
	ctx.fillText(getStatsProcent(par.match5), 735, 290)

	// текст снизу
	ctx.fillStyle = "#000000"
	ctx.fillRect(0, 310, params.statsWidth, 340) // черный прямоугольник снизу
	ctx.font = 'bold 14px Georgia' // Franklin Gothic Medium
	ctx.fillStyle = "#00CCFF"
	ctx.fillText(`Информация взята с paladins.guru / !hh показать список команд`, params.statsWidth / 2, 330)
}


function drawChampionsRanked(ctx, imgList) {
	let positionX = 470
	for (let i = 0; i < imgList.length; i++) {
		const img = imgList[i]
		const x = positionX + 60 * i
		ctx.drawImage(img, x, 180, 50, 50)
	}
}
// <--- ranked stats <---



/* ---> !онлайн ---> */

function showOnlineInServer(mess) { // !онлайн
	if (mess.channel.type == 'dm') { // не только dm но и группа dm
		// в dm нет онлайна
		return mess.reply("В личных сообщениях команда **!онлайн** не работает.")
	}
	let membersArr = mess.guild.members.array(),
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
	const text = `Бот установлен на **${allUsers.guilds}** ${dec}. Общее кол-во людей: **${allUsers.all}**. Выполнено команд:** ${config.usedComands}**. Время работы: **${(new Date() - config.timeStart) / 60000 ^ 0}**.`
	return mess.reply(text)
}

function startCounterUsers() {
	// можно выводить статистику еще по регионам серверов
	let all = 0
	client.guilds.forEach((guild) => {all += guild.memberCount})
	return {all, guilds: client.guilds.size}
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



/* ---> !вики ---> */

function getVikiTextRU(mess, text) {
	const url = `https://ru.wikipedia.org/w/api.php?action=opensearch&search=${text}&prop=info&format=json&limit=2`

	if (text != text.replace(/[<>\\|@\/\^;{}~]/g,"") || 
			text.length > 50 || text.length == 0) {
		return mess.reply('Ошибка в тексте запроса.')
	}

	sendSite({url, json: true})
	.then(response => {
		const body = response.body
		const respText = body[2][0]
		const restUrl = body[3][0]

		if (!respText && !restUrl) return mess.reply('Ошибка в тексте запроса. (^2)')
		const returnText = `\r\n>>> ${respText}\r\n**Подробнее: <${restUrl}>**`
		mess.reply(returnText)
	})
}

function getVikiTextEN(mess, text) {
	const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${text}&prop=info&format=json&limit=2`

	if (text != text.replace(/[<>\\|@\/\^;{}~]/g,"") || 
			text.length > 50 || text.length == 0) {
		return mess.reply('Error in request text.')
	}

	sendSite({url, json: true})
	.then(response => {
		const body = response.body
		const respText = body[2][0]
		const restUrl = body[3][0]

		if (!respText && !restUrl) return mess.reply('Error in request text (^2).')
		const returnText = `\r\n>>> ${respText}\r\n**More: <${restUrl}>**`
		mess.reply(returnText)
	})
}

/* <--- !вики <--- */



/* ---> !смс ---> */

function sendMessToVK(mess, id, ...text) { // !смс
	text = repText( text.join(" ") )
	if (sendVkListMembers.find(function(el){return el == mess.author.id;})) { // проверяем вышло ли время
		// если время не вышло то предупреждаем
		return mess.reply('Возможно отправлять только 1 сообщение в минуту.')
	}

	const type_id = (id > -99999 && id < 0) ? "chat_id" : "user_id"; // позволяет отправлять сообщение в группы
	if (id < 0) id *= -1; // делаем id правильным
	id += ''; // для replace
	if (id != id.replace( /[^0-9]/, '' )) return mess.reply('Не корректный id.')

	if (!validMessVk(text)) return mess.reply('Недопустимые слова в сообщении.')
	if (text.length == 0 || text.length >= 500) return mess.reply('Сообщение пустое или слишком длинное.')

	if (!addListLastMess(text)) return mess.reply('Такое сообщение уже было отправленно.')

	const randomIDVK = (Math.random() * 1000000000000).toFixed(0);
	const url = `https://api.vk.com/method/messages.send?random_id=${randomIDVK}&${type_id}=${id}&message=${text}&v=5.92&access_token=`;

	sendVkListMembers.push(mess.author.id); // добавляем в список временно забаненых
	const guildId = mess.channel.guild ? mess.channel.guild.id : undefined // избегаем ошибок в личках
	const timer = (isAdmin(mess.author.id, guildId)) ? 1000 * 3 : 1000 * 60; // время ожидания (мне 3 сек)
	setTimeout(() => { // через минуту удаляем пользователя из бана
		sendVkListMembers.find((el, i, arr) => {
			if (el == mess.author.id) arr.splice(i, 1);
		});
	}, timer);

	sendSite({url: `${url + config.vkToken}`, json: true})
	.then((r) => {
		if (r.body.error != undefined && r.body.response == undefined) { // если ошибка
			return mess.reply('Ошибка, возможно не корректный id или закрыт лс (чс).')
		} else if (r.body.response != undefined && r.body.error == undefined) { // если отправилось
			return mess.reply('Сообщение успешно отправленно.')
		} else { // непонятно че
			return mess.reply('Неизвестная ошибка, поидее это никак не может выполнится.')
		}
	})
}

// приложения ->

function repText(text) { // удаляем & из строки
	while (true) {
		let k = text.indexOf('&');
		if (k == -1) break
		text = text.slice(0, k) + text.slice(k+1);
	}
	while (true) {
		let k = text.indexOf('#');
		if (k == -1) break
		text = text.slice(0, k) + text.slice(k+1);
	}
	return text
}

const sendVkListMembers = []; // список id людей которые отправили уже смс в вк

const listLastMess = []; // список последних смс для проверки спама
function addListLastMess(mess) {
	if (listLastMess.indexOf(mess) != -1) return false;
	if (listLastMess.length >= 10) listLastMess = listLastMess.slice(1); // храним максимум 10 последних сообщений
	listLastMess.push(mess);
	return true;
}

function validMessVk(text) { // проверяет сообщение на запрещенные фразы
	for (let i = 0; i < listInvalidMess.length; i++) {
		if (text.indexOf(listInvalidMess[i]) != -1) return false;
	}
	return true;
}
const listInvalidMess = ["электронных стимуляций", "заработал на автомобиль", "ежедневный доход", "blogspot", 
"оплатa при пoлyчении закaзa", "переходи по ссылке", "зарабатывать", "в вашу группу", "Обязанности", "jebber.ru", 
"координатор", "свободного времени", "подробности здесь", "с пометкой", "удалённая работа", "личные сообщени", 
"для молодых мам", "Эффективное средство", "ПOДРOБНОCТИ У CОТРУДHИKА", "феромон", "желание зарабатывать", 
"по этой ссылке", "ПОДРОБHАЯ ИНФOPMAЦИЯ", "Работа на дому", "рассылка", "wheelbike.ru", "узнaть бoлeе подpобнo", 
"у меня на страничке", "MLM", "bks-design.ru", "наложенным платеж", "web-vk.ru", "по почте", "мышиные хвостики", 
"вот этот", "администратора в группу", "sertak.ru", "Подробности на стене", "онлайн работа", "в любой город", 
"krasnayenitb.win", "ПО МОСКВЕ", "Работа дома", "doref.site", "nadommebel.com", "по Украине", "набирает сотрудников", 
"goodlook-spb.ru", "Не косметика", "lidetdaw.ru", "kosmetologshop.ru", "Зарабoток в интернете", "выплаты ежедневные", 
"greilands.ru", "komarroff.ru", "dreamofwood", "Выплаты ежедневно", "миллиoнеpшa", "ЗAPАБATЫBАЙ", 
"позволит зарабатывать", "Доход от", "pmibar.ru", "свободного времени", "стройную фигуру", "vtope", "втопе", 
"vto pe", "vto.pe", "цп в лс", "порно", "порн", " дп ", "синий кит", "куратор кита", "купить голоса"];

// <- приложения

/* <--- !смс <--- */



/* ---> !переписка ---> */

function get_vk_messages(m) { // пиздец какая дерьмовая функция...
	if (checkVkListMembers.find(function(el){return el == m.author.id;})) { // проверяем вышло ли время
		// если время не вышло то предупреждаем
		return m.reply('Возможно делать запросы только 1 раз в минуту.')
	}
	function getLactMessId(callback) { // получает id последнего сообщения вк, передавая его в callback
		//const url = `https://api.vk.com/method/messages.searchConversations?count=1&v=5.92&access_token=`;
		const url = `https://api.vk.com/method/messages.getConversations?count=1&filter=all&v=5.92&access_token=`;
		sendSite({url: `${url + config.vkToken}`, json: true})
		.then((r) => {
			callback(r.body.response.items[0].last_message.id);
		});
	}
	function lastMessVK(messID) {
		massMessID = [];
		for (let i = 0; i < 10; i++ ) {massMessID.push(messID - i);}
		const url = `https://api.vk.com/method/messages.getById?message_ids=${massMessID + ''}&extended=1&v=5.92&access_token=`;
		sendSite({url: `${url + config.vkToken}`, json: true})
		.then((r) => {
			if (r.body.error != undefined && r.body.response == undefined) { // если ошибка
				return m.reply('Похоже сообщений нет...')
			} else if (r.body.response != undefined && r.body.error == undefined) { // если ошибки нет
				const vk_messages = r.body.response.items;
				const vk_profiles = r.body.response.profiles;
				const vk_groop = r.body.response.groups; // для групп
				const obj_profiles = {};
				const obj_groups = {};
				for (let i = 0; i < vk_profiles.length; i++) {
					if (obj_profiles[vk_profiles[i].id] == undefined) obj_profiles[vk_profiles[i].id] = {};
					obj_profiles[vk_profiles[i].id].id = vk_profiles[i].id;
					obj_profiles[vk_profiles[i].id].first_name = vk_profiles[i].first_name;
					obj_profiles[vk_profiles[i].id].last_name = vk_profiles[i].last_name;
					obj_profiles[vk_profiles[i].id].sex = vk_profiles[i].sex;
					obj_profiles[vk_profiles[i].id].online = vk_profiles[i].online;
				}
				if (vk_groop) { // для групп
					for (let i = 0; i < vk_groop.length; i++) {
						if (obj_groups[vk_groop[i].id] == undefined) obj_groups[vk_groop[i].id] = {};
						obj_groups[vk_groop[i].id].id = vk_groop[i].id;
						obj_groups[vk_groop[i].id].name = vk_groop[i].name;
						obj_groups[vk_groop[i].id].type = vk_groop[i].type;
						obj_groups[vk_groop[i].id].screen_name = vk_groop[i].screen_name; // ссылка
					}
				}
				let answerText = ``;
				let lastAnswerText = answerText;
				for (let i = 0; i < vk_messages.length; i++) {
					const vk = vk_messages[i];
					if (vk.peer_id < 0) { // если диалог с группой (не беседа)
						let fromTo = vk.from_id == vk.peer_id ? "От" : "Кому";
						answerText += `(${getDateVK(vk.date)}) **${fromTo} - ${obj_groups[(vk.peer_id + '').slice(1)].name} ` + 
							`:** ${dellHppt(vk.text)}\n`;
					} else {
						if (vk.action != undefined) { // события в группах
							answerText += `(${getDateVK(vk.date)}) Событие: **${vk.action.type}** для: ${vk.from_id}\n`;
						} else {
							let fromTo = vk.from_id == vk.peer_id ? "От" : "Кому";

							if ((vk.peer_id + '').indexOf('200000000') != -1) fromTo = `[Группа ${(vk.peer_id + '').slice(9)}]`;
							const vkID = (vk.peer_id + '').indexOf('200000000') != -1 ? vk.from_id : vk.peer_id;

							answerText += `(${getDateVK(vk.date)}) **${fromTo} - ${obj_profiles[vkID].first_name} ` + 
								`${obj_profiles[vkID].last_name}:** ${dellHppt(vk.text)}\n`;
						}
					}
					if (answerText.length >= 2000) {answerText = lastAnswerText; break;} // у дискорда лимит в 2000
					lastAnswerText = answerText; // сохраняем
				}
				answerText.slice(0, -2); // удаляем перенос строки
				return m.reply(answerText)
			} else { // непонятно че
				return m.reply('Неизвестная ошибка, поидее это никак не может выполнится.')
			}
		});
	}
	checkVkListMembers.push(m.author.id); // добавляем в список временно забаненых
	const guildId = m.channel.guild ? m.channel.guild.id : undefined // избегаем ошибок в личках
	const timer = (isAdmin(m.author.id, guildId)) ? 1000 * 3 : 1000 * 60; // время ожидания (мне 3 сек)
	setTimeout(() => { // через минуту удаляем пользователя из бана
		checkVkListMembers.find((el, i, arr) => {
			if (el == m.author.id) arr.splice(i, 1);
		});
	}, timer);
	getLactMessId(lastMessVK);
}

// приложения ->

function dellHppt(text) { // вырезает все http:// и https://
	let text2 = text.replace(/(https:\/\/)/, '');
	if (text == text2) {
		text2 = text.replace(/(http:\/\/)/, '');
		return text == text2 ? text2 : dellHppt(text2);
	}
	return dellHppt(text2);
}

const checkVkListMembers = []; // список id людей которые отправили уже смс в вк

function getDateVK(d) { // получаем нужный вид даты
	d *= 1000;
	return new Date(d).toLocaleString("ru", {month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'});
}

// <- приложения

/* <--- !переписка <--- */



// ---> hi-rez functions --->

/**
 * Создает сессию и возвращает промис, session_id
 * @return {Promise} session_id
 */
function createSession() {
	// return new Promise(resolve => { // временная хуйня
	// 	const session = "007DA9620A03481890986987E9A6C780"
	// 	config.session = session
	// 	config.timeStartSession = +new Date()
	// 	resolve(session)
	// })

	console.log("createSession")
    return new Promise((resolve, reject) => {
        const timestamp = moment().utc().format("YYYYMMDDHHmmss")
        const signature = md5( config.devId + "createsession" + config.authKey + timestamp )
        const urlCreateSession = `http://api.paladins.com/paladinsapi.svc/createsessionJson/${config.devId}/${signature}/${timestamp}`
        sendSite({url: urlCreateSession, json: true})
        .then(response => {
            const body =  response.body
            const ret_msg = body.ret_msg
			if (ret_msg !== "Approved") reject(ret_msg)
			const session = body.session_id
			config.session = session
			config.timeStartSession = +new Date()
			//console.log(session)
            resolve(session)
        })
    })
}


/**
 * getdataused - возвращает лимиты использования API
 * gethirezserverstatus - возвращает статусы основных серверов hi-rez
 * getchampions - возвращает много инфы о всех чемпионах [11]
 * getchampioncards - возвращает все карты указанного чемпиона [id, 11]
 * getchampionleaderboard - таблица лидеров по чемпионам [id, 428]
 * getplayer - возвращает статистику аккаунта [name, portalId]
 * getplayer - возвращает статистику аккаунта [name]
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
 * getqueuestats - история но с очередью какой-то
 * searchplayers - поискк игроков по нику как на гуру
 * getmatchdetails - история указанного матча [id]
 * getmatchplayerdetails - история матча в реальном времени
 * @param {String} format - тип запроса
 * @param  {...any} params - параметры которые будут переданы в конец url
 */
function hiRezFunc(format, ...params) {
	console.log(`hiRezFunc: ${format}`)
    return new Promise((resolve, reject) => {
		if (!format) reject(false)

		const testing = format !== "testsession" ? testSession : () => {return new Promise(resolve => {resolve()})}
		testing()
		.then((res) => {
			const timestamp = moment().utc().format("YYYYMMDDHHmmss")
			const signature = md5( config.devId + format + config.authKey + timestamp )
			const strParams = params.length > 0 ? `/${params.join("/")}` : ''
			const url = `http://api.paladins.com/paladinsapi.svc/${format}Json/${config.devId}/${signature}/${config.session}/${timestamp}${strParams}`
			sendSite({url, json:true})
			.then(res => {
				config.timeStartSession = +new Date()
				resolve(res.body)
			})
		})
    })
}


function testSession() { // проверяет валидность сессии, если не валидна то создает новую
    return new Promise(resolve => {

		const checkTime = new Date() - 900000 < config.timeStartSession
		console.log(`Минут с последнего теста сессии: ${(new Date() - config.timeStartSession) / 60000}`)
		if (checkTime) return resolve({result: true, msg: "все норм, время не вышло"})
		console.log("время вышло, мы проверим валидность сессии и если она 'не катит' то создадим новую")

        hiRezFunc("testsession") // поидее тестить не нужно, а просто создавать новую сессию и время навсяк сделать не 15, а 14 минут
        .then(res => {
			const result = res.indexOf('Invalid') === -1 && res.indexOf('successful') !== -1
			if (!result) { // если сессия не подходит
				createSession()
				.then(session => {
					return resolve({result, session, msg: "создали новую сессию"})
				})
			} else {
				return resolve({result, msg: "сессия рабочая"})
			}
        })
    })
}


function searchPaladinsPlayer(name) { // функция эмулирующая API playpaladins
	return new Promise((resolve, reject) => {
		hiRezFunc("getplayer", name) // поиск игрока
		.then(response => {
			const main = response[0]
			if (!main) return reject({msg: "Игрок не найден"})
			
			hiRezFunc("getgodranks", main.Id) // поиск его чемпионов
			.then(champions => {
				if (!champions) return reject({msg: "Чемпионы игрока не найдены"})
				resolve({main, champions, name})
			})
		})
	})
}


function searchPaladinsMatch(name) { // функция эмулирующая API playapaladins
	return new Promise((resolve, reject) => {
		hiRezFunc("getplayeridbyname", name)
		.then(response => {
			const body = response[0]
			if (!body) reject({msg: "Пользователь не найден"})
			const id = body.player_id

			hiRezFunc("getmatchhistory", id)
			.then(matches => {
				if (!matches[0]) reject({msg: "Матчи не найденны"})
				resolve(matches)
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
	const user = client.users.find(user => {
		let locName = nameOrId
		if (user.bot) locName = locName.slice(1)
		if (user.id == nameOrId || user.tag == nameOrId) return user
	})
	return user
}


function searchGuild(guildId) { // ищет гильдию по id
	const guild = client.guilds.find(guild => {
		if (guild.id == guildId) return guild
	})
	return guild
}

// <--- Вспомогательные функции <---







// старт бота и загрузка настроек
Promise.all([
	client.login(config.tokenDiscord), 
	getSetting(), 
	getChampionsCard(), 
	getCardFrames(),
	getImgBackground(),
	getImgChampions(),
	getImgItems(),
	getPaladinsMaps(),
	getDifferentImg(),
	getRankedImage()
]).then(response => {
	for (let i = 1; i < response.length; i++) {
		if (response[i] !== true) throw new Error(`Ошибка [${i}] во время старта бота и загрузки стартовых функций.`)
	}

	console.log("Бот запущен и настройки загруженны!")

	client.channels.get('612875033651707905').send('Я запустился!')
	client.user.setActivity('!hh - вывести команды бота', { type: 'WATCHING' })
	client.on("message", startListenMess)
})


function startListenMess(message) { // обработака всех сообщений // message.channel.type // text dm
	if (message.author.id == "510112915907543042" && message.content.indexOf("!console ") == 0) {
		eval( message.content.slice(9) )
	}
	
	//if (message.author.id != "510112915907543042") return false // testing ON
	// перебираем все команды
	for (key in comands) {
		// если в начале сообщения стоит команда (ищем команду)
		const value = comands[key]
		let keyLen = null
		const searchesComand = value.comands.some((element) => {
			keyLen = element.length + 1 // сохраняем, +1 что бы зацепить обязательный пробел после команды
			return element == message.content.slice(0, keyLen).trim()
		})

		if (!searchesComand) continue // если команда не найдена, пропускаем ее
		const type = message.channel.type // тип чата, где полученно смс с командой

		if (type != 'dm' && type != 'group') { // в личке проверять права не нужно
			const permission = message.channel.permissionsFor(client.user).has('SEND_MESSAGES')
			if (!permission) return // если нельзя писать сообщения то выход

			// проверяем права которые нужны для исполнения команды
			const comandPerm = value.permission || 'SEND_MESSAGES'
			const checkPerm = message.channel.permissionsFor(client.user).has(comandPerm)
			if (!checkPerm) return message.reply( value.errPerm || 'Ошибка прав.' )
		}

		const valParams = value.params || [] // убираем ошибку, если нет параметров
		const params = mySplit( message.content.slice(keyLen), valParams.length - 1)
		value.func(message, ...params) // вызываем функцию команды передав параметры как строки
		config.usedComands++ // увеличиваем кол-во использованных команд
		break // завершить поиск
	}
}

function mySplit(text, count) {
	// делает то же что и [].split, но определенное кол-во раз, а остальное возвращает как есть
	const params = []
	let indexPref = 0
	while (count) {
		const index = text.indexOf(" ", indexPref) + 1
		if (index == 0) break // это может быть ошибкой, а может быть с автоподстановкой Ника
		params.push( text.slice(indexPref, index).trim() )
		indexPref = index
		count--
	}
	params.push( text.slice(indexPref).trim() )
	return params
}




// ---> Необходимые, глобальные функции --->


function isAdmin(user_id, guild_id=[]) { // очень кривая проверка, но пока сойдет и такая (админ 1)
	const adminListId = config.setting.admins
	if (!adminListId[user_id]) return false; // если его нет в записи то выход
	if (adminListId[user_id].type == 0) return false; // если админка выключенна

	if (!adminListId[user_id].guilds) return adminListId[user_id].type; // если глобальная админка
	if (adminListId[user_id].guilds.indexOf(guild_id) == -1) return false; // если в списке нет гильдии
	return adminListId[user_id].type; // если же есть то значит админ и возвращаем его тип
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


// получаем настройки с сайта, вернет промис, когда загрузит настройки -> true or error -> false
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
		const url = config.url_site.replace(/[a-z_]+\.[a-z]{1,4}$/i, '') + "pal-bot/championsCard.json"
		sendSite({url, json: true})
		.then(response => {
			const body = response.body
			championsCard = body

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
						LegendarChampions[item.card_id2] = imgList[k]
						k++
					}
				}
				console.log("Карты и легендарки чемпионов загруженны.")
				resolve(true)
			})
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
			cardFrames = imgList
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
			imgBackground = imgList
			console.log("Фоны для статы загруженны.")
			resolve(true)
		})
	})
}



function getImgChampions() {
	return new Promise(resolve => {
		const list = []
		for (let champion in championsIds) {
			const champ = fixText(champion)
			list.push( loadImage(`champions/${champ}.jpg`) )
		}

		Promise.all(list)
		.then(imgList => {
			let i = 0
			for (let champion in championsIds) {
				championsIds[champion].img = imgList[i]
				i++
			}

			for (let champion in championsIds) { // делаем возможность обращения и в нижнем регистре
				championsIds[fixChampion(champion)] = championsIds[champion]
				// const tempChampion = champion.replace(/ /i, '')
				// championsIds[tempChampion.toLocaleLowerCase()] = championsIds[champion]
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
			list.push( loadImage(`items/${fixText(item)}.jpg`) )
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
			differentImg['vs'] = imgList[0]
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
			rankedImage = imgList
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

	client.guilds.forEach(guild => {
		servers++
		users += guild.memberCount
	})

	sendSite({method: "POST", url, form: {
		token, type: 'stats', servers, users, usedComands: config.usedComands, timeWork
	}}).then (res => {
		console.log(res.body) // успешно отправленно
		// можно так же получать в ответ изменившиеся настройки команд для серверов (экономим запросы)
	})
}



/* - Что бы сделать боту сообщения "Embed", нужно будет дать возможность выбора оформления функции
 * - Все функции которые отправляют сообщения должны всегда проверять права перед отправкой, а иногда и
 * перед формированием ответа (иногда можно и наоборот)
 */
