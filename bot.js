const {Client, Attachment, RichEmbed} = require('discord.js');
const client = new Client();
const request = require('request');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

let global_func = {}; // готовимся к импорту, после загрузки настроек

const { url_site, dbToken, tokenDiscord, vkToken } = (require('./configs.js')).cfg;

let ALL_SETTINGS; // переменная где будут лежать все глобальные настройки
let BOT_STARTED = false; // разрешает и блокирует обработку сообщений



/* ---> вспомогательные функции общего назначения ---> */



function isNumeric(n) { // првоерка на число
  return !isNaN(parseFloat(n)) && isFinite(n);
}



/**
 * Помогает склонять исчесляемое слово и возвращает нужное окончание
 * params@num - число к котому будет "склоняться"
 * params@dec1 - окончание отвечающее на 1
 * params@dec2 - окончание отвечающее на от 2 до 5
 * params@dec3 - окончание отвечющее на остальное
 **/
function declension(num, dec1, dec2, dec3) {
	if (num >= 5 && num < 20) return dec3
	let n = (num + '').slice(-1) * 1 // берем последнюю цифру
	if (n == 1) {
		return dec1
	} else if (n > 1 && n < 5) {
		return dec2
	} else {
		return dec3
	}
}



function timeoutInterval(func, time) { // альтернатива setInterval
   let timeout = setTimeout( () => {
      func(); // выполняем функцию
      timeout = timeoutInterval(func, time); // запускаем заново
   }, time);
   return timeout;
}



function getRandomItemArry(arr) { // возвращает случайное содержимое из массива
	const rand = Math.floor(Math.random() * arr.length);
	return arr[rand];
}



function isAdmin(user_id, guild_id=[]) { // проверка на админку в боте
	const adminListId = ALL_SETTINGS.admins
	if (!adminListId[user_id]) return false; // если его нет в записи то выход
	if (adminListId[user_id].type == 0) return false; // если админка выключенна

	if (!adminListId[user_id].guilds) return adminListId[user_id].type; // если глобальная админка
	if (adminListId[user_id].guilds.indexOf(guild_id) == -1) return false; // если в списке нет гильдии
	return adminListId[user_id].type; // если же есть то значит админ и возвращаем его тип
}



// делает запросы на сайт
function getSite(params, callback=()=>{}, func_err=()=>{}) {
   params.url = encodeURI(params.url); // кодируем в url
   const sendData = params.method == "POST" ? request.post : request.get;
   sendData(params, function (error, response, body) {
      if (error) {
         func_err(error, params);
      } else {
         callback(response, body);
      }
   });
}



function getDateStats(d) {
	return new Date(d).toLocaleString("ru", {year: 'numeric', month: 'numeric', day: 'numeric', 
		hour: 'numeric', minute: 'numeric', timeZone: "UTC", hour12: false})
}



// проверяем права пользователя на указаном канале
function checkPermission(clannel, permission="ADMINISTRATOR", user=client.user) {
	return client.channels.get(clannel).permissionsFor(user).has(permission);
	// ATTACH_FILES SEND_MESSAGES EMBED_LINKS
	// https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
	// проверка прав перед отправкой сообщения
}


const default_comands = { // стандартные команды для всех каналов
	list: ['!hh', '!вики', '!viki', '!аватар', '!инфо', '!me', '!стата', '!ss', '!es', '!история', 
		'!history', '!онлайн', '!всего', '!смс', '!переписка'], // для проверки в сообщении
	comands: ['!hh', '!вики', '!viki', '!аватар', '!инфо', '!me', '!стата', '!es', '!история', '!history', 
		'!онлайн', '!всего', '!смс', '!переписка'], // для вывода в !хелп
	'!hh': {
		func: DC_help,
		info: "Выводит список команд.",
		comand: '!hh'
	},
	'!вики': {
		func: DC_viki_ru,
		info: "Осуществляет поиск в **Википедии**",
		comand: '!вики',
		params: ['текст']
	},
	'!viki': {
		func: DC_viki_en,
		info: "Performs a search on **Wikipedia**",
		comand: '!viki',
		params: ['text']
	},
	'!аватар': {
		func: DC_getAvatar,
		info: "Выводит ссылку на аватарку указанного пользователя",
		comand: '!аватар',
		params: ['id или никнейм+тег пользователя']
	},
	'!me': {
		func: DC_me,
		info: "Позволяет запомнить и использовать указанный никнейм для команд бота (можно писать просто !ss)",
		comand: '!me',
		params: ['имя']
	},
	'!стата': {
		func: DC_stats,
		info: "выводит статистику указанного аккаунта, можно **!ss**",
		comand: '!стата',
		params: ['имя']
	},
	'!es': {
		func: DC_stats,
		info: "displays statistics specified account in English only",
		comand: '!es',
		params: ['name']
	},
	'!история': {
		func: DC_history,
		info: "отображает последние 10 матчей из истории указанного игрока",
		comand: '!история',
		params: ['имя']
	},
	'!history': {
		func: DC_history,
		info: "displays the last 10 matches from the history of the specified player",
		comand: '!history',
		params: ['имя']
	},
	'!онлайн': {
		func: DC_online,
		info: "выводит статистику пользователей по онлайну и играм",
		comand: '!онлайн'
	},
	'!всего': {
		func: DC_all,
		info: "Выводит сколько всего серверов, людей и людей онлайн в данный момент",
		comand: '!всего'
	},
	'!смс': {
		func: DC_sms,
		info: "отправляет сообщение в вк указанному id",
		comand: '!смс',
		params: ['id', 'сообщение']
	},
	'!переписка': {
		func: get_vk_messages,
		info: "выводит 10 последних сообщений из вк (сколько влезит, если длинные)",
		comand: '!переписка'
	},
	'!инфо': {
		func: (m) => {
			const text = 'Группа бота: https://discord.gg/RG9WQtP';
			m.reply(text)
		},
		info: "Выводит способ связи с создателем",
		comand: '!инфо'
	}
}
default_comands['!ss'] = default_comands['!стата'];



/* ---> !помощь ---> */

function DC_help(m) { // !помощь
	let helps_text = `***Список команд:***`;
	default_comands.comands.forEach((el) => { // перебираем все дефолтные команды
		let params = ``;
		if (default_comands[el].params) default_comands[el].params.forEach((el) => { // перебираем параметры
			params += ` [${el}]`;
		});
		helps_text += `\n**${el + params}** - ${default_comands[el].info};`;
	});
	m.reply(helps_text)
}

/* <--- !помощь <--- */



/* ---> !вики ---> */

function DC_viki_ru(m) {
	const indexSpace = m.content.indexOf(' '); // ищем где заканчивается команда
	const text = m.content.slice(indexSpace).trim()
	const url = `https://ru.wikipedia.org/w/api.php?action=opensearch&search=${text}&prop=info&format=json&limit=2`

	if (text != text.replace(/[<>\\|@\/\^;{}~]/g,"") || 
			text.length > 50 || text.length == 0) {
		return m.reply('Ошибка в тексте запроса.')
	}

	// проверяем права
	if (!checkPermission(m.channel.id, 'SEND_MESSAGES')) return; // нет возможности написать смс

	getSite({url, json: true}, (r) => {
		const respText = r.body[2][0]
		const restUrl = r.body[3][0]

		if (!respText && !restUrl) return m.reply('Ошибка в тексте запроса. (^2)')
		const returnText = `\r\n>>> ${respText}\r\n**Подробнее: <${restUrl}>**`
		m.reply(returnText)
	})
}

function DC_viki_en(m) {
	const indexSpace = m.content.indexOf(' ') // ищем где заканчивается команда
	const text = m.content.slice(indexSpace).trim()
	const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${text}&prop=info&format=json&limit=2`

	if (text != text.replace(/[<>\\|@\/\^;{}~]/g,"") || 
			text.length > 50 || text.length == 0) {
		return m.reply('Error in request text.')
	}

	// проверяем права
	if (!checkPermission(m.channel.id, 'SEND_MESSAGES')) return; // нет возможности написать смс

	getSite({url, json: true}, (r) => {
		const respText = r.body[2][0]
		const restUrl = r.body[3][0]
		
		if (!respText && !restUrl) return m.reply('Error in request text (^2).')
		const returnText = `\r\n>>> ${respText}\r\n**More: <${restUrl}>**`
		m.reply(returnText)
	})
}

/* <--- !вики <--- */



/* ---> !аватар ---> */

function DC_getAvatar(m) {
	const content = m.content

	// ищем где заканчивается команда
	const indexEnd = content.indexOf(' ') == -1 ? content.length : content.indexOf(' ')

	// получаем название команды
	const comand = content.slice(1, indexEnd)

	// получаем параметр команды
	let name = content.slice(indexEnd).trim()

	if (name.indexOf("@") == 0) name = name.slice(1) // если поставили @ то убираем ее
	if (name.indexOf("<@") == 0) name = name.slice(2).slice(0, -1) // убираем еще хрень...

	if (!isNumeric(name)) { // если не id то ищем id по тегу
		const tempName = m.guild.members.findKey((val) => {
			if (val.user.tag == name) return val.user.id
		})
		if (tempName) name = tempName
	}

	if (name.indexOf('!') == 0) name = name.slice(1) // удаляем ! у ботов
	const user = client.users.get(name)
	if (!user) return m.reply(`Не верно указан пользователь **${name}** или он не найден.`)
	const avatar = user.avatarURL || `У пользователя нет аватара.`
	if (isNumeric(name)) return m.reply(avatar)
	return m.reply(`Ошибка! Пользователь **${name}** не найден.`)
}

/* <--- !аватар <--- */



/* ---> !me ---> */

function DC_me(m) {
	const content = m.content

	// ищем где заканчивается команда
	const indexEnd = content.indexOf(' ') == -1 ? content.length : content.indexOf(' ')

	// полeчаем название команды
	const comand = content.slice(1, indexEnd)

	// получаем параметр команды
	let name = content.slice(indexEnd).trim()


	if (!name) return showMyName(m) // показываем имя или сообщаем что оно не записано


	// проверяем на валидность
	if (name != name.replace(/[ "\[\]<>?\\|+@.,\/#!$%\^&\*;:{}=\-_`~()]/g,"") || 
			name.length > 20 || name.length < 4) {
		const errText = "Ошибка в имени. / Error in the name."
		return m.reply(errText)
	}


	// записываем никнейм
	const params = paramsBotMe(m.author.id, name)
	getSite(params, (res) => {
      const answerMe = JSON.parse(res.body)

      if (answerMe.status == "OK") {
         console.log('set_bot_me успешно записан.\n')
         const text = `Ваш ник успешно записан!`
         return m.reply(text)
      } else {
         console.log(answerMe)
         console.log(`Неудачная загрузка set_bot_me для ${name}`)
         const text = `Произошла ошибка, попробуйте снова и сообщите боту в личку об этом.`
         return m.reply(text)
      }
   })
}


/**
 * Выводит в чат сохраненный ник командой !me
 */
function showMyName(m) {
	const params = paramsBotMe(m.author.id)
	getSite(params, (res) => {
	   const answerMe = JSON.parse(res.body)

	   if (answerMe.status == "OK") {
	      console.log('get_bot_me успешно выдан.\n')
	      const paladinsName = answerMe.paladins_name

	      if (!paladinsName) { // если ник не назначен
	      	const text = `У вас не назначен ник. Воспользуйтесь командой **!me [ваш ник]**`
	      	return m.reply(text)
	      }

	      //const getsName = Buffer.from(paladinsName, 'base64').toString('UTF-8')
	      const text = `Ваш сохраненный ник: **"${paladinsName}"**`
	      m.reply(text)
	   } else {
	      console.log(answerMe)
	      console.log(`Неудачная загрузка get_bot_me для ${name}`)
	      const text = `Произошла ошибка, попробуйте снова и сообщите боту в личку об этом.`
	      m.reply(text)
	   }
	})
}

function paramsBotMe(id, name) { // бытро формирует обьект с парамметрами
	const obj = {
		method: "POST", 
		url: url_site, 
		form: {
			token: dbToken, 
			type: name ? 'set_bot_me' : 'get_bot_me', 
			user_id: id
		}
	}
	if (name) obj.form.username = name
	return obj
}

/* <--- !me <--- */



/* ---> !стата ---> */

function DC_stats(m) { // !стата !ss !es
	const content = m.content

	// ищем где заканчивается команда
	const indexEnd = content.indexOf(' ') == -1 ? content.length : content.indexOf(' ')

	// полeчаем название команды
	const comand = content.slice(1, indexEnd)

	// определяем нужный язык для статистики
	const lang = comand == "es" ? "en" : comand == "стата" ? "ru" : comand == "ss" ? "ru" : ""

	// проверяем права на отправку сообщений и скринов
	if (!checkPermission(m.channel.id, ['ATTACH_FILES'])) {
		// если нельзя отправлять смс то просто выходим
		if (!checkPermission(m.channel.id, ['SEND_MESSAGES'])) return
		const errText = lang == "ru" ? 
			"Нет прав на отправку файлов/скриншотов." : "No rights to send files / screenshots."
		return m.reply(errText)
	}


	let settings = {} // настройки показа и скрытия статы аккаунта
	// получаем параметр команды
	let name = content.slice(indexEnd).trim()
	if (!name || name == "me") { // если имя не указано то пробуем загрузить
		const params = paramsBotMe(m.author.id)
		getSite(params, (res) => {
			const answerMe = JSON.parse(res.body)

	   	if (answerMe.status == "OK") { // применяем настройки и имя
	   		name = answerMe.paladins_name
	   		settings.hidden_name = answerMe.hidden_name
	   		settings.hidden_steam = answerMe.hidden_steam
	   		settings.hidden_rank = answerMe.hidden_rank
	   	}
	   	// если имя все равно пустое то берем имя пользователя с канала
	   	if (!name) name = (m.member.nickname || '').trim()

	   	nextStep()
		})
	} else {
		nextStep()
	}


	function nextStep() {
		// проверяем на валидность
		if (name != name.replace(/[ "\[\]<>?\\|+@.,\/#!$%\^&\*;:{}=\-_`~()]/g,"") || 
				name.length > 20 || name.length < 4) {
			const errText = lang == "ru" ? "Ошибка в имени." : "Error in the name."
			return m.reply(errText)
		}

		// привязываем параметры к функции
		const funcGetStats = getStats.bind(null, lang, m, name, settings)
		// отправляем запрос на статистику
		getSite({url: `http://www.playpaladins.online/api/profile/pc/${name}`, json: true}, funcGetStats)
	}
}


function getStats(lang, m, name, settings, r) {
	const json = r.body
	const main = json.main
	//const name = main.hz_player_name


	// у плейпаладинса так...
	const playerNotFound = lang == "ru" ? 
		`Ошибка, игрок "${name}" не найден` : `Error, player "${name}" not found`
	if (json.message) return m.reply(playerNotFound)

	// если нет данных вообще, то профиль скрыт либо хз
	const playerHidden = lang == "ru" ? `Ошибка, возможно у игрока "${name}" скрыт профиль` : 
		`Error, maybe player "${name}" has profile hidden`
	if (!json.champions || !json.main) return m.reply(playerHidden)


	// получаем кда и данные для диаграммы
	const kda = getKDABP(json.champions)
	const totalTime = kda.dmg + kda.flank + kda.tank + kda.heal
	const rankNum = main.Tier_RankedKBM

	// data загружаемой картинки ранга
	const rankImgUrl = rankNum ? `https://playpaladins.online/images/Divisions/${rankNum}.png` : 'no-rank.png'
	const rankImgWidth = 192
	const rankImgHeight = rankNum == 0 ? 224 : rankNum == 27 ? 241 : rankNum == 26 ? 221 : 192

	// canvas...
	const canvas = createCanvas(760, 330)
	const ctx = canvas.getContext('2d')
	ctx.font = 'bold 16px Georgia'

	// загружаем случайный глобальный фон для статы
	const randBackground = Math.floor(Math.random() * 3) + 1 // случайный фон от 1 до 3 включительно
	loadImage(`stats-img/stats-background-${randBackground}.jpg`)
	.then((img) => {
		ctx.drawImage(img, 0, 0, 760, 300)
			// рисуем эллементы (неизменные) и диаграмму
			drawItems(ctx, kda, totalTime)

			// получаем функцию нужного текста и рисуем текст
			const drawText = lang == "ru" ? textRu : textEn
			drawText(ctx, main, kda, rankImgWidth, totalTime)
	}).catch((e) => {
		console.log(`Ошибка загрузки фона...\r\n${e}`)
	})

	// получаем список первых 5-ти чемпионов
	let champList = []
	kda.b.forEach((item, index) => {
		if (!item) return false
		champList.push( fixText(item.champion) )
		if (index >= 4) return
	})

	// загружаем картинки 5-ти лучших персонажей
	loadChampions(ctx, champList)
	.then(() => {
		// загружаем картинку ранга
		loadImage(rankImgUrl)
		.then((img) => {
			// рисуем картинку ранга
			ctx.drawImage(img, 0, 10, rankImgWidth / 2, rankImgHeight / 2)
			// отправляем картинку на сервер
			sendStats(canvas, name, m, lang)
		}).catch((err) => {
			console.log(`Ошибка в загрузке картинки ранга:\r\n${e}`)
			// отправляем картинку на сервер с дополнительным сообщением
			const content = "Выполнено с ошибкой! Сообщите о ней мне, что бы я мог улучшить бота."
			sendStats(canvas, name, m, lang, content)
		});
	})
}


function loadChampions(ctx, list) {
	let positionX = 430

	for (let i = 0;; i++) {
		const name = list[i]
		const urlChamp = `champions/${name}.jpg`

		const load = loadImage(urlChamp)
		const endLoad = load.then((img) => {
			const x = positionX + 60 * i
			ctx.drawImage(img, x, 180, 50, 50)
		}).catch((e) => {
			console.log(`Ошибка загрузки лучших персонажей:\r\n${e}`)
		})

		if (i >= list.length - 1) return endLoad

	}
}


function sendStats(canvas, name, m, lang, content="") { // после удачной или не удачной загрузки
	const imgName = name + (Math.random() * 1000000 ^ 0)
	saveCanvas(canvas, `${imgName}.png`, (name) => {
		console.log(`[${lang}] File ${name} was created.`)
		m.channel.send(content, { // отправляем картинку
			files: [{
				attachment: name,
				name
			}]
		}).then(() => { // удаляем локальный файл по окончанию отправки
			console.log(`[${lang}] отправилось, удаляем локальный файл...`)
			fs.unlink(name, (err) => {
				if (err) return console.log(`Ошибка удаления файла ${name}.\r\n${err}`)
				console.log(`[${lang}] Лоакальный файл ${name} удален, гильдия: ${m.channel.guild.name}`)
			})
		}) // записываем историю смс
	})
}


function textEn(ctx, main, kda, width, totalTime) {
	const RankedKBM = main.RankedKBM

	ctx.textAlign = "center"
	ctx.font = 'bold 14px Georgia' // Franklin Gothic Medium
	ctx.fillStyle = "#00CCFF"
	ctx.fillText(`Info taken from playpaladins.online`, 380, 320)
	ctx.font = 'bold 16px Georgia'
	ctx.fillStyle = "#dddddd"
	ctx.textAlign = "start"

	// рисуем инфу ->
	ctx.fillText(`${main.hz_player_name} (${main.Region})`, 10 + width / 2, 20)
	ctx.fillText(`Steam: ${main.Name}`, 10 + width / 2, 40)
	ctx.fillText(`Lvl: ${main.Level}`, 10 + width / 2, 60)
	ctx.fillText(`Created: ${getDateStats(main.Created_Datetime)}`, 10 + width / 2, 80)
	ctx.fillText(`Played ${main.HoursPlayed} hours`, 10 + width / 2, 100)
	ctx.fillText(`Last login: ${getDateStats(main.Last_Login_Datetime)}`, 10 + width / 2, 120)
	ctx.fillText(`KDA: ${((kda.k + kda.a / 2) / (kda.d + 1)).toFixed(2)}`, 10 + width / 2, 140)

	ctx.fillText(`TOTAL:`, 50, 170)
	ctx.fillText(`Kills: ${kda.k}`, 10, 190)
	ctx.fillText(`Deaths: ${kda.d}`, 10, 210)
	ctx.fillText(`Assists: ${kda.a}`, 10, 230)
	ctx.fillText(`Wins: ${main.Wins}`, 10, 250)
	ctx.fillText(`Losses: ${main.Losses}`, 10, 270)
	ctx.fillText(`Winrate: ${fixNaN((main.Wins / (main.Wins + main.Losses) * 100).toFixed(0))}%`, 10, 290)

	ctx.fillText(`RANKED:`, 250, 170)
	ctx.fillText(`Wins: ${RankedKBM.Wins}`, 200, 190)
	ctx.fillText(`Losses: ${RankedKBM.Losses}`, 200, 210)
	let myRank = getRank(main.Tier_RankedKBM)
	myRank = myRank == 'Калибровка' ? 'Qualification' : myRank
	ctx.fillText(`Rank: ${myRank}`, 200, 230)
	ctx.fillText(`TP: ${RankedKBM.Points}`, 200, 250)
	if (RankedKBM.Rank) ctx.fillText(`Position: ${RankedKBM.Rank}`, 200, 270)

	ctx.fillText("FAVORITE CHAMPIONS:", 480, 160)

	ctx.fillText("Roles:", 540, 20)
	ctx.fillText(`Damage - ${fixNaN((kda.dmg / totalTime * 100).toFixed(2))}%`, 600, 54)
	ctx.fillText(`Tank - ${fixNaN((kda.tank / totalTime * 100).toFixed(2))}%`, 600, 76)
	ctx.fillText(`flank - ${fixNaN((kda.flank / totalTime * 100).toFixed(2))}%`, 600, 98)
	ctx.fillText(`Heal - ${fixNaN((kda.heal / totalTime * 100).toFixed(2))}%`, 600, 120)
}


function textRu(ctx, main, kda, width, totalTime) {
	const RankedKBM = main.RankedKBM

	ctx.textAlign = "center"
	ctx.font = 'bold 14px Georgia' // Franklin Gothic Medium
	ctx.fillStyle = "#00CCFF"
	ctx.fillText(`Информация взята с playpaladins.online`, 380, 320)
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
	ctx.fillText(`KDA: ${( (kda.k + kda.a / 2) / (kda.d + 1)).toFixed(2)}`, 10 + width / 2, 140)

	ctx.fillText(`ВСЕГО:`, 50, 170)
	ctx.fillText(`Убийств: ${kda.k}`, 10, 190)
	ctx.fillText(`Смертей: ${kda.d}`, 10, 210)
	ctx.fillText(`Ассистов: ${kda.a}`, 10, 230)
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
}


// приложения ->


function drawItems(ctx, kda, totalTime) { // рисуем диаграмму и некоторые эллементы
	const dmgDeg = 360 * (kda.dmg / totalTime)
	const flankDeg = 360 * (kda.flank / totalTime)
	const tankDeg = 360 * (kda.tank / totalTime)
	//const healDeg = 360 * (kda.heal / totalTime)

	ctx.fillStyle = "#000000"
	ctx.fillRect(0, 300, 760, 330)

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
	ctx.fillStyle = "#009900";
	if (kda.b[0]) ctx.fillText(kda.b[0].Rank, 439, 250)
	if (kda.b[1]) ctx.fillText(kda.b[1].Rank, 499, 250)
	if (kda.b[2]) ctx.fillText(kda.b[2].Rank, 559, 250)
	if (kda.b[3]) ctx.fillText(kda.b[3].Rank, 619, 250)
	if (kda.b[4]) ctx.fillText(kda.b[4].Rank, 679, 250)

	ctx.fillStyle = "#CC6600";
	if (kda.b[0]) ctx.fillText(fixNaN(((kda.b[0].Kills + kda.b[0].Assists / 2) / (kda.b[0].Deaths + 1)).toFixed(2)), 437, 270)
	if (kda.b[1]) ctx.fillText(fixNaN(((kda.b[1].Kills + kda.b[1].Assists / 2) / (kda.b[1].Deaths + 1)).toFixed(2)), 497, 270)
	if (kda.b[2]) ctx.fillText(fixNaN(((kda.b[2].Kills + kda.b[2].Assists / 2) / (kda.b[2].Deaths + 1)).toFixed(2)), 557, 270)
	if (kda.b[3]) ctx.fillText(fixNaN(((kda.b[3].Kills + kda.b[3].Assists / 2) / (kda.b[3].Deaths + 1)).toFixed(2)), 617, 270)
	if (kda.b[4]) ctx.fillText(fixNaN(((kda.b[4].Kills + kda.b[4].Assists / 2) / (kda.b[4].Deaths + 1)).toFixed(2)), 677, 270)

	ctx.fillStyle = "#0088bb";
	if (kda.b[0]) ctx.fillText(`${getWinrate(kda.b[0].Wins, kda.b[0].Losses)}%`, 437, 290)
	if (kda.b[1]) ctx.fillText(`${getWinrate(kda.b[1].Wins, kda.b[1].Losses)}%`, 497, 290)
	if (kda.b[2]) ctx.fillText(`${getWinrate(kda.b[2].Wins, kda.b[2].Losses)}%`, 557, 290)
	if (kda.b[3]) ctx.fillText(`${getWinrate(kda.b[3].Wins, kda.b[3].Losses)}%`, 617, 290)
	if (kda.b[4]) ctx.fillText(`${getWinrate(kda.b[4].Wins, kda.b[4].Losses)}%`, 677, 290)
}


function secToMin(s) { // секунды в минуты или минуты в часы, принцип тот же
	let min = (s / 60).toFixed(2) + '';
	if (min.indexOf('.') != -1) { // если дробное
		let sec = (min.slice(min.indexOf('.') + 1) * 6 / 10).toFixed(0);
		min = `${min.slice(0, min.indexOf('.'))}.${sec}`;
	}
	return min;
}

function getRank(n) { // переводит цифры в ранг
	switch (n) {
		case 1: return 'Бронза 5';break;
		case 2: return 'Бронза 4';break;
		case 3: return 'Бронза 3';break;
		case 4: return 'Бронза 2';break;
		case 5: return 'Бронза 1';break;
		case 6: return 'Сильвер 5';break;
		case 7: return 'Сильвер 4';break;
		case 8: return 'Сильвер 3';break;
		case 9: return 'Сильвер 2';break;
		case 10: return 'Сильвер 1';break;
		case 11: return 'Золото 5';break;
		case 12: return 'Золото 4';break;
		case 13: return 'Золото 3';break;
		case 14: return 'Золото 2';break;
		case 15: return 'Золото 1';break;
		case 16: return 'Платина 5';break;
		case 17: return 'Платина 4';break;
		case 18: return 'Платина 3';break;
		case 19: return 'Платина 2';break;
		case 20: return 'Платина 1';break;
		case 21: return 'Алмаз 5';break;
		case 22: return 'Алмаз 4';break;
		case 23: return 'Алмаз 3';break;
		case 24: return 'Алмаз 2';break;
		case 25: return 'Алмаз 1';break;
		case 26: return 'Мастер';break;
		case 27: return 'ГМ';break;
		default: return 'Калибровка';
	}
}

function fixNaN(num) {
	if (isNaN(num)) return 0;
	return num;
}

function getWinrate(wins, loses) {
	if (!wins) return 0;
	if (!loses) return 100;
	return (wins / (loses + wins) * 100).toFixed(0);
}

function getRadians(degrees) {
	return (Math.PI / 180) * degrees;
}

function drawPieSlice(ctx, centerX, centerY, radius, startAngle, endAngle, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(centerX, centerY);
	ctx.arc(centerX, centerY, radius, getRadians(startAngle), getRadians(endAngle));
	ctx.closePath();
	ctx.fill();
}

function saveCanvas(canvas, name, callback) {
	const out = fs.createWriteStream(name);
	const stream = canvas.createPNGStream();
	stream.pipe(out);
	out.on('finish', () => {
		callback(name);
	});
}

function fixText(text) { // фиксит текст под правильный запрос для картинки чемпиона
	while (true) {
		const sh = text.indexOf('\'');
		if (sh != -1) text = text.slice(0, sh) + '-' + text.slice(sh + 1);
		const space = text.indexOf(' ');
		if (space == -1) break;
		text = text.slice(0, space) + '-' + text.slice(space + 1);
	}
	return text.toLowerCase();
}

function getKDABP(champions) { // kill, death, assist, больеш всего времени - чемпион, больше всего времени - роль
	let kills = 0,
		assists = 0,
		deaths = 0,
		//best = '',
		bestMinutes = 0,
		role = {
			heal: 0,
			dmg: 0,
			tank: 0,
			flank: 0
		};

	for (let i = 0; i < champions.length; i++) {
		kills += champions[i].Kills;
		assists += champions[i].Assists;
		deaths += champions[i].Deaths;
		champions.sort((a, b) => b.Minutes - a.Minutes); // сортируем
		switch (getRole(champions[i].champion)) {
			case 'dmg': role.dmg += champions[i].Minutes;break;
			case 'flank': role.flank += champions[i].Minutes;break;
			case 'heal': role.heal += champions[i].Minutes;break;
			case 'tank': role.tank += champions[i].Minutes;break;
		}
	}
	const best = [champions[0], champions[1], champions[2], champions[3], champions[4]]; // 5 лучших
	return {k: kills, d: deaths, a: assists, b: best, //p: bigsRole, 
		dmg: role.dmg, flank: role.flank, heal: role.heal, tank: role.tank}
}

function getRole(name) { // основываясь на имени персонажа возвращает его роль
	let heals = ["Mal'Damba", "Ying", "Grover", "Jenos", "Grohk", "Pip", "Seris", "Furia", "io"],
		dmgs = ["Lian", "Cassie", "Drogoz", "Strix", "Viktor", "Sha Lin", "Bomb King", "Kinessa", "Tyra", "Vivian", "Willo", "Dredge", "Imani"],
		flanks = ["Androxus", "Buck", "Zhin", "Evie", "Koga", "Talus", "Maeve", "Skye", "Lex", "Moji"],
		tanks = ["Makoa", "Fernando", "Ruckus", "Barik", "Ash", "Khan", "Torvald", "Inara", "Terminus", "Atlas"];

	if (heals.find(function(e) {if (e == name) return true;})) return 'heal';
	if (dmgs.find(function(e) {if (e == name) return true;})) return 'dmg';
	if (flanks.find(function(e) {if (e == name) return true;})) return 'flank';
	if (tanks.find(function(e) {if (e == name) return true;})) return 'tank';
}

// <- приложения

/* <--- !стата <--- */



/* ---> !история ---> */

function DC_history(m) { // !история
	const content = m.content

	// ищем где заканчивается команда
	const indexEnd = content.indexOf(' ') == -1 ? content.length : content.indexOf(' ')

	// полeчаем название команды
	const comand = content.slice(1, indexEnd)

	// определяем нужный язык для статистики
	const lang = comand == "history" ? "en" : comand == "история" ? "ru" : ""

	// проверяем права на отправку сообщений и скринов
	if (!checkPermission(m.channel.id, ['ATTACH_FILES'])) {
		// если нельзя отправлять смс то просто выходим
		if (!checkPermission(m.channel.id, ['SEND_MESSAGES'])) return
		const errText = lang == "ru" ? 
			"Нет прав на отправку файлов/скриншотов." : "No rights to send files / screenshots."
		return m.reply(errText)
	}


	// получаем параметр команды
	let name = content.slice(indexEnd).trim()
	if (!name || name == "me") { // если имя не указано то пробуем загрузить
		const params = paramsBotMe(m.author.id)
		getSite(params, (res) => {
			const answerMe = JSON.parse(res.body)

	   	if (answerMe.status == "OK") name = answerMe.paladins_name
	   	// если имя все равно пустое то берем имя пользователя с канала
	   	if (!name) name = (m.member.nickname || '').trim()

	   	nextStep()
		})
	} else {
		nextStep()
	}


	function nextStep() {
		// проверяем на валидность
		if (name != name.replace(/[ "\[\]<>?\\|+@.,\/#!$%\^&\*;:{}=\-_`~()]/g,"") || 
				name.length > 20 || name.length < 4) {
			const errText = lang == "ru" ? "Ошибка в имени." : "Error in the name."
			return m.reply(errText)
		}

		// привязываем параметры к функции
		const funcGetHistory = getHistory.bind(null, lang, m, name)
		// отправляем запрос на статистику
		getSite({url: `http://playpaladins.online/api/profile/pc/${name}/matches?page=1`, 
			json: true}, funcGetHistory)
	}
}


function getHistory(lang, m, name, r) {
	const json = r.body
	//const main = json.matches // main больше нет
	const matches = r.body.matches


	// если нет данных вообще, то профиль скрыт либо хз
	const playerHidden = lang == "ru" ? `Ошибка, игрок не найден или у игрока "${name}" скрыт профиль` : 
		`Error, player not found or player "${name}" has a profile hidden`
	if (!matches && !json.totalMatches) return m.reply(playerHidden)


	if (!matches) return m.reply(`Ошибка, матчи "${name}" не найденыю`) // исправить... !!!!!!!!!!!


	// canvas...
	const imgWidth = 1160
	const canvas = createCanvas(imgWidth, 590)
	const ctx = canvas.getContext('2d')
	ctx.font = 'bold 15px Georgia'

	// точки Х начала рисования меню и его эллементов
	const positionMenu = [70, 220, 330, 410, 540, 640, 690, 790, 870, 960, 1070]

	ctx.fillStyle = "#000000"
	ctx.fillRect(0, 0, imgWidth, 30)
	ctx.fillRect(0, 560, imgWidth, 590)
	ctx.fillStyle = "#dddddd"

	// загружаем случайный глобальный фон для статы
	const randBackground = Math.floor(Math.random() * 3) + 1 // случайный фон от 1 до 3 включительно
	loadImage(`stats-img/stats-background-${randBackground}.jpg`)
	.then((img) => {
		ctx.drawImage(img, 0, 30, imgWidth, 530)
		// рисуем эллементы (то что неизменно от языка)
		drawItemsHistory(ctx, matches, positionMenu)

		// получаем функцию нужного текста и рисуем текст
		const drawText = lang == "ru" ? textHistoryRu : textHistoryEn
		drawText(ctx, matches, positionMenu)
	}).catch((e) => {
		console.log(`Ошибка загрузки фона...\r\n${e}`)
	})

	// получаем до 10 картинок персонажей с истории
	let champList = []
	matches.forEach((item, index) => {
		champList.push( fixText(item.Champion) )
	})

	// загружаем картинки полученных персонажей
	loadChampionsHistory(ctx, champList)
	.then(() => {
		// отправляем картинку на сервер (смс)
		sendStatsHistory(canvas, name, m, lang)
	})
}


function drawItemsHistory(ctx, matches, pos) {
	const len = matches.length
	for (let i = 0; i < len; i++) {
		const item = matches[i]
		const kda = ((item.Kills + item.Assists / 2) / (item.Deaths || 1)).toFixed(2)

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
	}
}


function textHistoryRu(ctx, matches, pos) {
	ctx.textAlign = "center"
	ctx.font = 'bold 14px Georgia' // Franklin Gothic Medium
	ctx.fillStyle = "#00CCFF"
	ctx.fillText(`Информация взята с playpaladins.online`, 545, 580)
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

	// цикл с писаниной о инфе
	const len = matches.length
	for (let i = 0; i < len; i++) {
		const item = matches[i]

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


function textHistoryEn(ctx, matches, pos) {
	ctx.textAlign = "center"
	ctx.font = 'bold 14px Georgia' // Franklin Gothic Medium
	ctx.fillStyle = "#00CCFF"
	ctx.fillText(`Info taken from playpaladins.online`, 545, 580)
	ctx.font = 'bold 15px Georgia'
	ctx.fillStyle = "#dddddd"
	ctx.textAlign = "start"

	// рисуем таблицу для инфы
	ctx.fillText(`Date`, pos[0], 20)
	ctx.fillText(`Status`, pos[1], 20)
	ctx.fillText(`Time`, pos[2], 20)
	ctx.fillText(`Mode`, pos[3], 20)
	ctx.fillText(`Match id`, pos[4], 20)
	ctx.fillText(`KDA`, pos[5], 20)
	ctx.fillText(`Detailed`, pos[6], 20)
	ctx.fillText(`Damage`, pos[7], 20)
	ctx.fillText(`Shielding`, pos[8], 20)
	ctx.fillText(`Healing`, pos[9], 20)
	ctx.fillText(`Credits`, pos[10], 20)

	// цикл с писаниной о инфе
	const len = matches.length
	for (let i = 0; i < len; i++) {
		const item = matches[i]

		const getStats = item.Win_Status
		const statusColor = getStats == "Win" ? "#00bb00" : "#bb0000"

		const getQueue = item.Queue
		const queue = getQueue == "Siege Training" ? "Siege (B)" : 
			getQueue == "Onslaught Training" ? "Onslaught (B)" : 
			getQueue == "Team Deathmatch" ? "Deathmatch" : 
			getQueue == "Team Deathmatch Training" ? "Deathmatch (B)" : getQueue

		ctx.fillStyle = statusColor
		ctx.fillText(`${item.Win_Status}`, pos[1], 52 * i + 60) // сатус
		ctx.fillStyle = "#dddddd"
		ctx.fillText(`${queue}`, pos[3], 52 * i + 60) // тип
	}
}


function loadChampionsHistory(ctx, list) {
	let positiony = 30

	for (let i = 0;; i++) {
		const name = list[i]
		const urlChamp = `champions/${name}.jpg`

		const load = loadImage(urlChamp)
		const endLoad = load.then((img) => {
			const y = positiony + 52 * i
			ctx.drawImage(img, 10, y, 50, 50)
		}).catch((e) => {
			console.log(`Ошибка загрузки лучших персонажей:\r\n${e}`)
		})

		if (i >= list.length - 1) return endLoad

	}
}


function sendStatsHistory(canvas, name, m, lang, content="") { // после удачной или не удачной загрузки
	const imgName = name + (Math.random() * 1000000 ^ 0)
	saveCanvas(canvas, `${imgName}.png`, (name) => {
		console.log(`[${lang}] File ${name} was created.`)
		m.channel.send(content, { // отправляем картинку
			files: [{
				attachment: name,
				name
			}]
		}).then(() => { // удаляем локальный файл по окончанию отправки
			console.log(`[${lang}] отправилось, удаляем локальный файл...`)
			fs.unlink(name, (err) => {
				if (err) return console.log(`Ошибка удаления файла ${name}.\r\n${err}`)
				console.log(`[${lang}] Лоакальный файл ${name} удален, гильдия: ${m.channel.guild.name}`)
			})
		}) // записываем историю смс
	})
}


/* <--- !история <--- */



/* ---> !онлайн ---> */

function DC_online(m) { // !онлайн
	let membersArr = m.guild.members.array(),
	game = {},
	offline = 0,
	dnd = 0, // красный
	idle = 0, // желтый
	online = 0, // зеленый
	bot = 0; // сколько ботов
	for (let i = 0; i < membersArr.length; i++) {
		if (membersArr[i].user.bot) {bot++; continue;} // если бот то пропускаем
		switch (membersArr[i].presence.status) {
			case 'dnd': dnd++;break;
			case 'idle': idle++;break;
			case 'online': online++;break;
			case 'offline': offline++;break;
		}
		if (membersArr[i].presence.game) {
			if (game[membersArr[i].presence.game] > 0) {
				game[membersArr[i].presence.game]++;
			} else {game[membersArr[i].presence.game] = 1;}
		}
	}
	let says = `**Всего: ${membersArr.length - bot}** ${getTextUsers(membersArr.length - bot)} ` + 
		`и **${bot}** ${getTextBots(bot)}. **Оффлайн: ${offline}**, **Онлайн: ${dnd + idle + online}**, из них **` + 
		`${online} В сети, ${idle} Не активен, ${dnd} Не беспокоить.**${listGame(game)}`;
	if (says.length >= 1800) {
		says = `**(Слишком длинное смс - инфа обрезана!!!)** \n${says}`;
		says = says.slice(0, 1800) + " ...";
	}
	m.reply(says)
}

// приложения ->

function getTextBots(num) { // склоняем слово
	let n = (num + '').slice(-1) * 1;
	if (n == 1) {
		return 'бот';
	} else if (n > 1 && n < 5) {
		return 'бота';
	} else {
		return 'ботов';
	}
}

function getTextUsers(num) { // правильно склоняет слово
	let n = (num + '').slice(-1) * 1; // берем последнюю цифру
	if (n == 1) {
		return 'пользователь';
	} else if (n > 1 && n < 5) {
		return 'пользователя';
	} else {
		return 'пользователей';
	}
}

function listGame(obj) { // принимает обьект с играми и кол-вом игроков и возвращает их список
	if (Object.keys(obj).length == 0) return ``;
	let list = `\n**Играют в:** `;
	for (let key in obj) {
		list += `**"**${key}**"** **- ${obj[key]},** `;
	}
	return `${list.slice(0, list.length - 4)}.**`;
}

// <- приложения

/* <--- !онлайн <--- */



/* ---> !всего ---> */

function DC_all(m) {
	const dec = declension(allUsers.guilds, 'сервере', 'серверах', 'серверах') // окончание
	const text = `Бот установлен на **${allUsers.guilds}** ${dec}. Общее кол-во людей: **${allUsers.all}` + 
	`**, из них онлайн: **${allUsers.online}**.`
	return m.reply(text)
}


const allUsers = {all: null, online: null, guilds: null}
function startCounterUsers() {
	// добавить счетчик регионов серверов? и сделать англ команду?
	let all = 0
	let online = 0
	let count = 0

	client.guilds.forEach((guild) => {
		count++
		all += guild.memberCount
		online += guild.members.size
	})

	allUsers.all = all
	allUsers.online = online
	allUsers.guilds = count
}

/* <--- !всего <--- */



/* ---> !смс ---> */

function DC_sms(m) { // !смс
	if (sendVkListMembers.find(function(el){return el == m.author.id;})) { // проверяем вышло ли время
		// если время не вышло то предупреждаем
		return m.reply('Возможно отправлять только 1 сообщение в минуту.')
	}
	let text = m.content.slice(5).trim();
	let to = text.indexOf(' ');
	if (to == -1) too = text.length;
	let id = Math.floor(text.slice(0, to).trim()); // приводим в норм вид

	const type_id = (id > -99999 && id < 0) ? "chat_id" : "user_id"; // позволяет отправлять сообщение в группы
	if (id < 0) id *= -1; // делаем id правильным
	id += ''; // для replace
	if (id != id.replace( /[^0-9]/, '' )) return m.reply('Не корректный id.')

	let text2 = repText(text.slice(text.indexOf(' ') + 1)).trim();
	if (!validMessVk(text2)) return m.reply('Недопустимые слова в сообщении.')
	if (text == text2) return m.reply('Не задан текст сообщения.')
	if (text2.length == 0 || text2.length >= 500) return m.reply('Сообщение пустое или слишком длинное.')

	if (!addListLastMess(text2)) return m.reply('Такое сообщение уже было отправленно.')

	const randomIDVK = (Math.random() * 1000000000000).toFixed(0);
	const url = `https://api.vk.com/method/messages.send?random_id=${randomIDVK}&${type_id}=${id}&message=${text2}&v=5.92&access_token=`;

	sendVkListMembers.push(m.author.id); // добавляем в список временно забаненых
	const timer = (isAdmin(m.author.id, m.channel.guild.id)) ? 1000 * 3 : 1000 * 60; // время ожидания (мне 3 сек)
	setTimeout(() => { // через минуту удаляем пользователя из бана
		sendVkListMembers.find((el, i, arr) => {
			if (el == m.author.id) arr.splice(i, 1);
		});
	}, timer);

	getSite({url: `${url + vkToken}`, json: true}, (r) => {
		if (r.body.error != undefined && r.body.response == undefined) { // если ошибка
			return m.reply('Ошибка, возможно не корректный id или закрыт лс (чс).')
		} else if (r.body.response != undefined && r.body.error == undefined) { // если отправилось
			return m.reply('Сообщение успешно отправленно.')
		} else { // непонятно че
			return m.reply('Неизвестная ошибка, поидее это никак не может выполнится.')
		}
	});
}

// приложения ->

function repText(text) { // удаляем & из строки
	for (let i = 0; i < text.length; i++) {
		let k = text.indexOf('&');
		if (k == -1) return text;
		text = text.slice(0, k) + text.slice(k+1);
	}
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
listInvalidMess = ["электронных стимуляций", "заработал на автомобиль", "ежедневный доход", "blogspot", 
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

function get_vk_messages(m) { // !переписка
	if (checkVkListMembers.find(function(el){return el == m.author.id;})) { // проверяем вышло ли время
		// если время не вышло то предупреждаем
		return m.reply('Возможно делать запросы только 1 раз в минуту.')
	}
	function getLactMessId(callback) { // получает id последнего сообщения вк, передавая его в callback
		//const url = `https://api.vk.com/method/messages.searchConversations?count=1&v=5.92&access_token=`;
		const url = `https://api.vk.com/method/messages.getConversations?count=1&filter=all&v=5.92&access_token=`;
		getSite({url: `${url + vkToken}`, json: true}, (r) => {
			callback(r.body.response.items[0].last_message.id);
		});
	}
	function lastMessVK(messID) {
		massMessID = [];
		for (let i = 0; i < 10; i++ ) {massMessID.push(messID - i);}
		const url = `https://api.vk.com/method/messages.getById?message_ids=${massMessID + ''}&extended=1&v=5.92&access_token=`;
		getSite({url: `${url + vkToken}`, json: true}, (r) => {
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
	const timer = (isAdmin(m.author.id, m.channel.guild.id)) ? 1000 * 3 : 1000 * 60; // время ожидания (мне 3 сек)
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



client.on('message', (mess) => { // проверяем сообщения на команды
	if (!BOT_STARTED) return; // если бот не зaпустился
	if (!mess.guild) return; // если смс в лс то выход
	if (!checkPermission(mess.channel.id, 'SEND_MESSAGES')) return; // смс писать нельзя - выходим
	if (mess.author.id == "510112915907543042" && mess.content == "!update") getSettings()

	const guildId = mess.channel.guild.id // id канала
	const cont = mess.content.trim()

	default_comands.list.forEach((el) => { // проверяем все дефолтные команды
		if ( (mess.content == el && !default_comands[el].params) || // нет параметров и сообщение целиком равно нужному
			(cont.indexOf(el) == 0 && default_comands[el].params) ) { // команда в начале и есть параметры
			return default_comands[el].func(mess) // выполняем функцию если найдена команда
		}
	})
})



function getSettings() {
	console.log(`Запрашиваем настройки...`)
	getSite({method: "POST", url: url_site, form: {token: dbToken, type: 'settings'}}, (res) => {
      const answerSettings = JSON.parse(res.body)

      if (answerSettings.status == "OK") {
      	ALL_SETTINGS = answerSettings; // применяем настройки
         console.log('Настройки успешно загружены.\n')
         // поидее все действия нужно начинать после загрузки настроек
         BOT_STARTED = true // разрешаем обрабатывать сообщения
      } else {
         console.log(answerSettings)
         console.log('Повторная загрузка настроек через 3сек...')
         setTimeout(() => {
         	getSettings(startBot)
         }, 3000)
      }
   })
}



client.on('ready', () => {
	console.log('I am ready!')
	client.channels.get('612875033651707905').send('Я запустился!')
	client.user.setActivity('!hh', { type: 'WATCHING' })

	getSettings()// получаем настройки и запускаем основные функции бота
	timeoutInterval(startCounterUsers, 60000) // запускаем счетчик
});



function sendChannel(cl, id, text="test") { // отправляет сообщение на указанный id канала
	if (!isNumeric(id)) return false
	const channel = cl.channels.get(id)
	if (!channel) return false
	return channel.send(text)
}

// записываем удаленные смс из лички
client.on('messageDelete', (message) => { // messageDeleteBulk массовое удаление смс
	if (message.channel.type != "dm") return false
	const textMessage = message.content ? `\r\n*Текст сообщения:*\r\n${message.content}` : ''
	const atmFirst = message.attachments.first()
	const attachments = atmFirst ? `\r\nURL: <${atmFirst.proxyURL}>` : ''
	const text = `Сообщение от **${message.author.tag} (${message.author.id})** было удалено` + 
		textMessage + attachments
	sendChannel(client, '614678700373573641', text)
})
client.on('messageUpdate', (message) => {
	if (message.channel.type != "dm") return false
	const text = `Сообщение от **${message.author.tag} (${message.author.id})** было отредактированно\r\n` + 
		`*Старый текст сообщения:*\r\n${message.content}`
	sendChannel(client, '614678700373573641', text)
})


client.login(tokenDiscord);


