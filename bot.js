const {Client, Attachment, RichEmbed} = require('discord.js');
const client = new Client();
const request = require('request');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

let global_func = {}; // готовимся к импорту, после загрузки настроек

const { url_site, dbToken, tokenDiscord, vkToken } = (require('./configs.js')).cfg;
const require_stats = (require('./stats.js')).stats(client, dbToken, url_site); // статистика

let ALL_SETTINGS; // переменная где будут лежать все глобальные настройки
let BOT_STARTED = false; // разрешает и блокирует обработку сообщений


// делает запросы на сайт
function getSite(params, callback, func_err) {
   params.url = encodeURI(params.url); // кодируем в url
   const sendData = params.method == "POST" ? request.post : request.get;
   sendData(params, function (error, response, body){
      if (error) {
         func_err(error, params);
      } else {
         callback(response, body);
      }
   });
}


// проверяем права пользователя на указаном канале
function checkPermission(clannel, permission="ADMINISTRATOR", user=client.user) {
	return client.channels.get(clannel).permissionsFor(user).has(permission);
	// ATTACH_FILES SEND_MESSAGES EMBED_LINKS
	// проверка прав перед отправкой сообщения
}


const default_comands = { // стандартные команды для всех каналов
	list: ['!помощь', '!хелпа', '!хелп', '!инфо', '!стата', '!ss', '!игры', '!песа, дай лапку', '!онлайн', 
		'!очистить', '!смс', '!переписка'], // для проверки в сообщении
	comands: ['!помощь', '!инфо', '!стата', '!игры', '!песа, дай лапку', '!онлайн', '!очистить', '!смс', 
		'!переписка'], // для вывода в !хелп
	'!помощь': {
		func: DC_help,
		info: "выводит этот список (так же можно **!хелп** или **!хелпа**)",
		comand: '!помощь'
	},
	'!стата': {
		func: DC_stats,
		info: "выводит статистику указанного аккаунта, можно **!ss**",
		comand: '!стата',
		params: ['имя']
	},
	'!игры': {
		func: DC_game,
		info: "выводит последнюю ИЛИ указанную по счету ЧИСЛО игру (0 - последняя игра, максимум 9)",
		comand: '!игры',
		params: ['имя', 'id']
	},
	'!песа, дай лапку': {
		func: DC_dog_says,
		info: "рандомно дает лапку или посылает куда по дальше (раз в минуту)",
		comand: '!песа, дай лапку'
	},
	'!онлайн': {
		func: DC_online,
		info: "выводит статистику пользователей по онлайну и играм",
		comand: '!онлайн'
	},
	'!очистить': {
		func: function(m) {
			global_func.delleteBotMess(m.channel.guild.id, botMess); // удаляем сообщения бота
		},
		info: "удаляет все сообщения бота (за его последний запуск)",
		comand: '!очистить'
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
			const embed = new RichEmbed()
			.setColor(0x6D44BA)
			.setDescription("**discord:** https://discord.gg/nM9Xr6D");
			global_func.addBotMess(m.channel.send(embed), m.channel.guild.id, botMess);
		},
		info: "Выводит способ связи с создателем",
		comand: '!инфо'
	}
}
default_comands['!хелпа'] = default_comands['!хелп'] = default_comands['!помощь']; // клонируем
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
	const embed = new RichEmbed()
	.setColor(0x86C539)
	.setDescription(helps_text);
	global_func.addBotMess(m.channel.send(embed), m.channel.guild.id, botMess);
}

/* <--- !помощь <--- */



/* ---> !стата ---> */

function DC_stats(m) { // !стата
	const indexSpace = m.content.indexOf(' '); // ищем где заканчивается команда
	const name = m.content.slice(indexSpace).trim();
	//if (name != name.replace( /[^A-zА-я0-9]/, '' ) || name.length < 4) {
	if (name != name.replace(/[ "\[\]<>?\\|+@.,\/#!$%\^&\*;:{}=\-_`~()]/g,"") || 
			name.length > 20 || name.length < 4) {
		return global_func.addBotMess(m.reply('Ошибка в имени.'), m.channel.guild.id, botMess);
	}

	// проверяем права
	if (!checkPermission(m.channel.id, ['ATTACH_FILES', 'SEND_MESSAGES']))
		return global_func.addBotMess(m.reply('Нет прав на отправку файлов/скриншотов.'), 
			m.channel.guild.id, botMess);

	getSite({url: `http://www.playpaladins.online/api/profile/pc/${name}`, json: true}, (r) => {
		const json = r.body;
		const main = json.main;

		if (json.message == 'OK') return global_func.addBotMess(m.reply(`Ошибка, игрок "${name}" не найден`), 
			m.channel.guild.id, botMess);
		if (!json.champions || !json.main) return global_func.addBotMess(m.reply(`Ошибка, возможно у игрока \
"${name}" скрыт профиль`), m.channel.guild.id, botMess);

		const kda = getKDABP(json.champions);
		const totalTime = kda.dmg + kda.flank + kda.tank + kda.heal;
		const dmgDeg = 360 * (kda.dmg / totalTime);
		const flankDeg = 360 * (kda.flank / totalTime);
		const tankDeg = 360 * (kda.tank / totalTime);
		const healDeg = 360 * (kda.heal / totalTime);
		const ranckNum = main.Tier_RankedKBM;
		const RankedKBM = main.RankedKBM;

		// data загружаемой картинки ранга
		const imgUrl = `https://playpaladins.online/images/Divisions/${ranckNum}.png`;
		const imgWidth = 192;
		const imgHeight = ranckNum == 27 ? 241 : ranckNum == 26 ? 221 : 192;

		// canvas...
		const canvas = createCanvas(750, 310);
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, 750, 310);
		ctx.font = 'bold 16px Georgia'; // Franklin Gothic Medium

		// рисуем инфу ->
		ctx.fillStyle = "#000000";
		ctx.fillText(`${main.Name} (${main.Region})`, 10 + imgWidth / 2, 20);
		ctx.fillText(`Уровень: ${main.Level}`, 10 + imgWidth / 2, 40);
		ctx.fillText(`Создан: ${main.Created_Datetime}`, 10 + imgWidth / 2, 60);
		ctx.fillText(`Сыграно ${main.HoursPlayed} часов`, 10 + imgWidth / 2, 80);
		ctx.fillText(`Последний вход: ${main.Last_Login_Datetime}`, 10 + imgWidth / 2, 100);
		ctx.fillText(`KDA: ${((kda.k+kda.a/2)/kda.d).toFixed(2)}`, 10 + imgWidth / 2, 120);
		//
		ctx.fillText(`ВСЕГО:`, 50, 150);
		ctx.fillText(`Убийства: ${kda.k}`, 10, 170);
		ctx.fillText(`Смерти: ${kda.d}`, 10, 190);
		ctx.fillText(`Ассисты: ${kda.a}`, 10, 210);
		ctx.fillText(`Победы: ${main.Wins}`, 10, 230);
		ctx.fillText(`Поражения: ${main.Losses}`, 10, 250);
		ctx.fillText(`Винрейт: ${(main.Wins / (main.Wins + main.Losses) * 100).toFixed(0)}%`, 10, 270);
		//
		ctx.fillText(`РАНКЕД:`, 250, 150);
		ctx.fillText(`Побед: ${RankedKBM.Wins}`, 200, 170);
		ctx.fillText(`Поражений: ${RankedKBM.Losses}`, 200, 190);
		ctx.fillText(`Ранг: ${getRanck(main.Tier_RankedKBM)}`, 200, 210);
		ctx.fillText(`ОТ: ${RankedKBM.Points}`, 200, 230);
		if (RankedKBM.Rank) ctx.fillText(`Позиция: ${RankedKBM.Rank}`, 200, 250);
		//
		ctx.fillStyle = "#00CCFF";
		ctx.font = 'bold 14px Georgia';
		ctx.fillText(`Информация взята с playpaladins.online`, 30, 300);
		ctx.font = 'bold 16px Georgia';

		// рисуем диаграмму ->
		const second = tankDeg + dmgDeg;
		const third = flankDeg + dmgDeg + tankDeg;
		ctx.fillStyle = "#000000";
		ctx.fillText("Роли:", 540, 20);
		ctx.fillText(`Урон - ${(kda.dmg / totalTime * 100).toFixed(2)}%`, 600, 54);
		ctx.fillText(`Танк - ${(kda.tank / totalTime * 100).toFixed(2)}%`, 600, 76);
		ctx.fillText(`Фланг - ${(kda.flank / totalTime * 100).toFixed(2)}%`, 600, 98);
		ctx.fillText(`Хилл - ${(kda.heal / totalTime * 100).toFixed(2)}%`, 600, 120);
		if (0 < dmgDeg) drawPieSlice(ctx, 510, 80, 50, 0, dmgDeg, "#9966FF");
		if (dmgDeg < second) drawPieSlice(ctx, 510, 80, 50, dmgDeg, tankDeg + dmgDeg, "#3399CC");
		if (second < third) drawPieSlice(ctx, 510, 80, 50, tankDeg + dmgDeg, flankDeg + dmgDeg + tankDeg, "#FF6600");
		if (third < 360) drawPieSlice(ctx, 510, 80, 50, flankDeg + dmgDeg + tankDeg, 360, "#33CC00");
		ctx.fillStyle = "#9966FF";
		ctx.fillRect(580, 40, 15, 15);
		ctx.fillStyle = "#3399CC";
		ctx.fillRect(580, 62, 15, 15);
		ctx.fillStyle = "#FF6600";
		ctx.fillRect(580, 84, 15, 15);
		ctx.fillStyle = "#33CC00";
		ctx.fillRect(580, 106, 15, 15);
			

		// любимые чемпионы ->
		ctx.fillStyle = "#000000";
		ctx.fillText("ЛЮБИМЫЕ ЧЕМПИОНЫ:", 480, 160);
		//
		ctx.fillStyle = "#006600";
		if (kda.b[0]) ctx.fillText(kda.b[0].Rank, 439, 250);
		if (kda.b[1]) ctx.fillText(kda.b[1].Rank, 499, 250);
		if (kda.b[2]) ctx.fillText(kda.b[2].Rank, 559, 250);
		if (kda.b[3]) ctx.fillText(kda.b[3].Rank, 619, 250);
		if (kda.b[4]) ctx.fillText(kda.b[4].Rank, 679, 250);
		//
		ctx.fillStyle = "#CC6600";
		if (kda.b[0]) ctx.fillText(fixNaN(((kda.b[0].Kills + kda.b[0].Assists / 2) / kda.b[0].Deaths).toFixed(2)), 437, 270);
		if (kda.b[1]) ctx.fillText(fixNaN(((kda.b[1].Kills + kda.b[1].Assists / 2) / kda.b[1].Deaths).toFixed(2)), 497, 270);
		if (kda.b[2]) ctx.fillText(fixNaN(((kda.b[2].Kills + kda.b[2].Assists / 2) / kda.b[2].Deaths).toFixed(2)), 557, 270);
		if (kda.b[3]) ctx.fillText(fixNaN(((kda.b[3].Kills + kda.b[3].Assists / 2) / kda.b[3].Deaths).toFixed(2)), 617, 270);
		if (kda.b[4]) ctx.fillText(fixNaN(((kda.b[4].Kills + kda.b[4].Assists / 2) / kda.b[4].Deaths).toFixed(2)), 677, 270);
		//
		ctx.fillStyle = "#003399";
		if (kda.b[0]) ctx.fillText(`${getWinrate(kda.b[0].Wins, kda.b[0].Losses)}%`, 437, 290);
		if (kda.b[1]) ctx.fillText(`${getWinrate(kda.b[1].Wins, kda.b[1].Losses)}%`, 497, 290);
		if (kda.b[2]) ctx.fillText(`${getWinrate(kda.b[2].Wins, kda.b[2].Losses)}%`, 557, 290);
		if (kda.b[3]) ctx.fillText(`${getWinrate(kda.b[3].Wins, kda.b[3].Losses)}%`, 617, 290);
		if (kda.b[4]) ctx.fillText(`${getWinrate(kda.b[4].Wins, kda.b[4].Losses)}%`, 677, 290);

		let uCount = 0;
		let urlChampWidth = 430;
		let urlChamp = `champions/${fixText(kda.b[uCount].champion)}.jpg`;
		loadImage(urlChamp)
		.then(LoadBestChamp);

		function LoadBestChamp(img) { // загружаем картинку
			ctx.drawImage(img, urlChampWidth, 180, 50, 50);
			if (++uCount > 4) { // конец
				// загружаем рамку звания ->
				return endFunc();
			} // иначе
			urlChampWidth += 60;
			if (!kda.b[uCount]) return endFunc();
			const championsName = fixText(kda.b[uCount].champion);
			urlChamp = `champions/${championsName}.jpg`;
			loadImage(urlChamp)
			.then(LoadBestChamp);
		}

		function endFunc() {
			loadImage(imgUrl)
			.then((img) => { // изображение загрузилось - рисуем
				ctx.drawImage(img, 0, 0, imgWidth / 2, imgHeight / 2);
				endLoadImg(canvas);
			}).catch((err) => { // изображение не загрузилось (возможно он без ранга)
				endLoadImg(canvas);
			});
		}

		function endLoadImg(canvas) { // после удачной или не удачной загрузки
			const imgName = name + (Math.random() * 1000000 ^ 0);
			saveCanvas(canvas, `${imgName}.png`, (name) => {
				console.log(`File ${name} was created.`);
				m.channel.send({ // отправляем картинку
					files: [{
						attachment: name,
						name
					}]
				}).then(() => { // удаляем локальный файл по окончанию отправки
					console.log('отправилось, удаляем локальный файл...');
					fs.unlink(name, (err) => {
						if (err) return console.log(`Ошибка удаления файла ${name}.\r\n${err}`);
						console.log(`Лоакальный файл ${name} удален.`);
					});
				}); // записываем историю смс
			});
		}
		//
	});
}

// приложения ->

function secToMin(s) { // секунды в минуты или минуты в часы, принцип тот же
	let min = (s / 60).toFixed(2) + '';
	if (min.indexOf('.') != -1) { // если дробное
		let sec = (min.slice(min.indexOf('.') + 1) * 6 / 10).toFixed(0);
		min = `${min.slice(0, min.indexOf('.'))}.${sec}`;
	}
	return min;
}

function getRanck(n) { // переводит цифры в ранг
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
	let heals = ["Mal'Damba", "Ying", "Grover", "Jenos", "Grohk", "Pip", "Seris", "Furia", ],
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



/* ---> !игры ---> */

function DC_game(m) { // !игры
	let text = m.content.slice(6).trim();
	let too = text.indexOf(' ');
	if (too == -1) too = text.length;
	const name = text.slice(0, too).trim();
	if (name != name.replace( /[^A-zА-я0-9]/, '' )) {
		return global_func.addBotMess(m.reply('Ошибка в имени.'), m.channel.guild.id, botMess);
	}
	let text2 = text.slice(text.indexOf(' ') + 1).trim();
	let to = text2.indexOf(' ');
	if (to == -1) to = text2.length;
	let matchNum = Math.floor(text2.slice().trim()) || 0;
	if (matchNum < 0) matchNum = 0;
	if (isNaN(matchNum)) { // должен быть числом
		return global_func.addBotMess(m.reply('Не корректный запрос'), m.channel.guild.id, botMess);
	}
	getSite({url: `http://playpaladins.online/api/profile/pc/${name}/matches?page=1`, json: true}, (r) => {
		const matches = r.body.matches;
		if (!matches) return global_func.addBotMess(m.reply(`Ошибка, матчи "${name}" не найденыю`), 
			m.channel.guild.id, botMess);

		if (matchNum > matches.length - 1) matchNum = matches.length - 1; // что бы не брать больше 10 и того что есть

		const embed = new RichEmbed()
		.setAuthor('Больше информации', m.author.avatarURL, `http://playpaladins.online/#/search/profile/${name}?page=1`)
		.setFooter('Информация взята с сайта playpaladins.online', 
			'https://pbs.twimg.com/profile_images/817813239308414977/sWUcji8Y_80x80.jpg')
		.setTitle(`Матч ${matches[matchNum].playerName} сыгран: ${matches[matchNum].Match_Time}`)
		.setColor(0x0Bd2d2);

		embed.addField(`Килы`, matches[matchNum].Kills, true)
		.addField(`Смерти`, matches[matchNum].Deaths, true)
		.addField(`Ассисты`, matches[matchNum].Assists, true)
		.addField(`Тип`, matches[matchNum].Queue, true)
		//.addField(`Время минуты`, matches[matchNum].Minutes, true)
		.addField(`Минут`, secToMin(matches[matchNum].Time_In_Match_Seconds), true)
		.addField(`Статус`, matches[matchNum].Win_Status, true)
		.addField(`Персонаж`, matches[matchNum].Champion, true)
		.addField(`Карта`, matches[matchNum].Map_Game, true)
		.addField(`Кредиты`, matches[matchNum].Gold, true)
		.addField(`Время у цели`, matches[matchNum].Objective_Assists, true)
		.addField(`id матча`, matches[matchNum].Match, true)
		.addField(`Урон`, matches[matchNum].Damage, true);
		if (matches[matchNum].Damage_Mitigated) embed.addField(`Защита`, matches[matchNum].Damage_Mitigated, true);
		if (matches[matchNum].Healing) embed.addField(`Исцеление`, matches[matchNum].Healing, true);
		global_func.addBotMess(m.channel.send(embed), m.channel.guild.id, botMess);
	});
}

/* <--- !игры <--- */



/* <--- !песа, дай лапку <--- */

function DC_dog_says(m) { // !песа, дай лапку
	if (dogsSaysWaitMembers.find(function(el){return el == m.author.id;})) { // проверяем вышло ли время
		// если время не вышло то предупреждаем
		return global_func.addBotMess(m.reply('Песа устал, ему нужно минутку отдохнуть...'), m.channel.guild.id, botMess);
	}
	const says = global_func.getRandomItemArry(dogsSays);
	const embed = new RichEmbed()
	.setDescription(`${m.author.username}, ${says}`)
	.setColor(0xC846A0);

	if (says == 'Держи ^^' || says == 'милашке даю лапку') {
		embed.setThumbnail('https://st.depositphotos.com/1766930/4697/i/950/depositphotos_46971905-stock-photo-dogs-paw-and-mans-hand.jpg');
		global_func.addBotMess(m.channel.send(embed), m.channel.guild.id, botMess);
	} else {
		global_func.addBotMess(m.channel.send(embed), m.channel.guild.id, botMess);
	}
	dogsSaysWaitMembers.push(m.author.id); // добавляем во временный бан (ожидание)
	const timer = (global_func.isAdmin(m.author.id, m.channel.guild.id)) ? 1000 * 3 : 1000 * 60; // время ожидания (мне 10 сек)
	setTimeout(() => { // через минуту удаляем пользователя из бана
		dogsSaysWaitMembers.find((el, i, arr) => {
			if (el == m.author.id) arr.splice(i, 1);
		});
	}, timer);
}
const dogsSaysWaitMembers = []; // список id людей которые ожидают, не разрешено писать команду
const dogsSays = ['Держи ^^', 'eng pls', 'хуяпку', 'Hello?', 'По ебалу тебе лапкой', 'милашке даю лапку'];

/* <--- !песа, дай лапку <--- */



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
	const says = `**Всего: ${membersArr.length - bot}** ${getTextUsers(membersArr.length - bot)} ` + 
		`и **${bot}** ${getTextBots(bot)}. **Оффлайн: ${offline}**, **Онлайн: ${dnd + idle + online}**, из них **` + 
		`${online} В сети, ${idle} Не активен, ${dnd} Не беспокоить.**${listGame(game)}`;
	const embed = new RichEmbed()
	.setDescription(says)
	.setColor(0xF4771A);
	global_func.addBotMess(m.channel.send(embed), m.channel.guild.id, botMess);
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



/* ---> !смс ---> */

function DC_sms(m) { // !смс
	if (sendVkListMembers.find(function(el){return el == m.author.id;})) { // проверяем вышло ли время
		// если время не вышло то предупреждаем
		return global_func.addBotMess(m.reply('Возможно отправлять только 1 сообщение в минуту.'), 
			m.channel.guild.id, botMess);
	}
	let text = m.content.slice(5).trim();
	let to = text.indexOf(' ');
	if (to == -1) too = text.length;
	let id = Math.floor(text.slice(0, to).trim()); // приводим в норм вид

	const type_id = (id > -99999 && id < 0) ? "chat_id" : "user_id"; // позволяет отправлять сообщение в группы
	if (id < 0) id *= -1; // делаем id правильным
	id += ''; // для replace
	if (id != id.replace( /[^0-9]/, '' )) return global_func.addBotMess(m.reply('Не корректный id.'), 
		m.channel.guild.id, botMess);

	let text2 = repText(text.slice(text.indexOf(' ') + 1)).trim();
	if (!validMessVk(text2)) return global_func.addBotMess(m.reply('Недопустимые слова в сообщении.'), 
		m.channel.guild.id, botMess);
	if (text == text2) return global_func.addBotMess(m.reply('Не задан текст сообщения.'), m.channel.guild.id, botMess);
	if (text2.length == 0 || text2.length >= 500) return global_func.addBotMess(m.reply('Сообщение пустое или \
		слишком длинное.'), m.channel.guild.id, botMess);

	if (!addListLastMess(text2)) return global_func.addBotMess(m.reply('Такое сообщение уже было отправленно.'), 
		m.channel.guild.id, botMess);

	const randomIDVK = (Math.random() * 1000000000000).toFixed(0);
	const url = `https://api.vk.com/method/messages.send?random_id=${randomIDVK}&${type_id}=${id}&message=${text2}&v=5.92&access_token=`;

	sendVkListMembers.push(m.author.id); // добавляем в список временно забаненых
	const timer = (global_func.isAdmin(m.author.id, m.channel.guild.id)) ? 1000 * 3 : 1000 * 60; // время ожидания (мне 3 сек)
	setTimeout(() => { // через минуту удаляем пользователя из бана
		sendVkListMembers.find((el, i, arr) => {
			if (el == m.author.id) arr.splice(i, 1);
		});
	}, timer);

	getSite({url: `${url + vkToken}`, json: true}, (r) => {
		if (r.body.error != undefined && r.body.response == undefined) { // если ошибка
			return global_func.addBotMess(m.reply('Ошибка, возможно не корректный id или закрыт лс (чс).'), 
				m.channel.guild.id, botMess);
		} else if (r.body.response != undefined && r.body.error == undefined) { // если отправилось
			return global_func.addBotMess(m.reply('Сообщение успешно отправленно.'), m.channel.guild.id, botMess);
		} else { // непонятно че
			return global_func.addBotMess(m.reply('Неизвестная ошибка, поидее это никак не может выполнится.'), 
				m.channel.guild.id, botMess);
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
		return global_func.addBotMess(m.reply('Возможно делать запросы только 1 раз в минуту.'), m.channel.guild.id, botMess);
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
				return global_func.addBotMess(m.reply('Похоже сообщений нет...'), m.channel.guild.id, botMess);
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
						answerText += `(${getDate(vk.date)}) **${fromTo} - ${obj_groups[(vk.peer_id + '').slice(1)].name} ` + 
							`:** ${dellHppt(vk.text)}\n`;
					} else {
						if (vk.action != undefined) { // события в группах
							answerText += `(${getDate(vk.date)}) Событие: **${vk.action.type}** для: ${vk.from_id}\n`;
						} else {
							let fromTo = vk.from_id == vk.peer_id ? "От" : "Кому";

							if ((vk.peer_id + '').indexOf('200000000') != -1) fromTo = `[Группа ${(vk.peer_id + '').slice(9)}]`;
							const vkID = (vk.peer_id + '').indexOf('200000000') != -1 ? vk.from_id : vk.peer_id;

							answerText += `(${getDate(vk.date)}) **${fromTo} - ${obj_profiles[vkID].first_name} ` + 
								`${obj_profiles[vkID].last_name}:** ${dellHppt(vk.text)}\n`;
						}
					}
					if (answerText.length >= 2000) {answerText = lastAnswerText; break;} // у дискорда лимит в 2000
					lastAnswerText = answerText; // сохраняем
				}
				answerText.slice(0, -2); // удаляем перенос строки
				return global_func.addBotMess(m.reply(answerText), m.channel.guild.id, botMess);
			} else { // непонятно че
				return global_func.addBotMess(m.reply('Неизвестная ошибка, поидее это никак не может выполнится.'), 
					m.channel.guild.id, botMess);
			}
		});
	}
	checkVkListMembers.push(m.author.id); // добавляем в список временно забаненых
	const timer = (global_func.isAdmin(m.author.id, m.channel.guild.id)) ? 1000 * 3 : 1000 * 60; // время ожидания (мне 3 сек)
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

function getDate(d) { // получаем нужный вид даты
	d *= 1000;
	return new Date(d).toLocaleString("ru", {month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'});
}

// <- приложения

/* <--- !переписка <--- */



const botMess = {}; // храним сообщения тут (по их id)

client.on('message', (mess) => { // проверяем сообщения на команды
	if (!BOT_STARTED) return; // если бот не зaпустился
	if (mess.author.id == "510112915907543042" && mess.content == "!update") setUpdateSettings();
	if (!mess.guild) return; // если смс в лс то выход
	const chId = mess.channel.guild.id; // id канала

	const cont = mess.content.trim();
	default_comands.list.forEach((el) => { // проверяем все дефолтные команды
		if ( (mess.content == el && !default_comands[el].params) || // нет параметров и сообщение целиком равно нужному
			(cont.indexOf(el) == 0 && default_comands[el].params) ) { // команда в начале и есть параметры
			return default_comands[el].func(mess); // выполняем функцию если найдена команда
		}
	});
	const exportsComands = require('./guild-and-comand.js').guild_comand; // загружаем уникальные команды серверов
	if (exportsComands[chId]) { // если есть команды для этого канала
		exportsComands[chId].list.forEach((el) => { // идем и првоеряем команды на совпадения
			if ( (mess.content == el && !exportsComands[chId][el].params) || 
				(cont.indexOf(el) == 0 && exportsComands[chId][el].params) ) {
				return exportsComands[chId][el].func(mess, botMess); // выполняем функцию если найдена команда
			}
		});
	}
});



function updateSettings(callback, firstCallback) { // функция обновления настроек
	if (firstCallback) firstCallback(); // если есть то выполняется первичный callback
	getSite({method: "POST", url: url_site, form: {token: dbToken, type: 'settings'}}, (res) => {
		const answerSettings = JSON.parse(res.body);

		if (answerSettings.status == "OK") {
			ALL_SETTINGS = answerSettings; // применяем настройки
			if (callback) callback(); // если есть то запускаем
		} else {
			console.log(status.error);
         console.log('Повторная загрузка настроек через 500мс...');
         setTimeout(() => {
         	updateSettings(callback);
         }, 1000);
		}
	});
}



// специальная функция для выполнения из чата !!! не работает! - криво ! не удаляет прошлое !
function setUpdateSettings() { // перезапускает функции сбора инфы и сообщений, обновив нaстройки
	updateSettings(() => { // запускает стату с уже обновленными настройками
		require_stats.startMessageStats(ALL_SETTINGS.guildsTrack); // сбор смс статистики
   	require_stats.startUsersStats(ALL_SETTINGS.guildsTrack); // запуск сбора информации о юзерах
   	console.log('Запуск с обновленными настройками УДАЛСЯ!');
	}, () => { // первичный callback - останавливает стату
		require_stats.stopMessageStats();
		require_stats.stopUsersStats();
	});
}



function startBot() { // старт бота (делается 1 раз при запуске)
	if (BOT_STARTED) return; // нельзя повторно стартовать
   require_stats.startGuildUpdate();
   require_stats.startUserUpdate();
   require_stats.startMessageStats(ALL_SETTINGS.guildsTrack); // сбор смс статистики
   require_stats.startUsersStats(ALL_SETTINGS.guildsTrack); // запуск сбора информации о юзерах
   require_stats.startUsersHidden(ALL_SETTINGS.guildsTrack);

   BOT_STARTED = true; // разрешаем обрабатывать сообщения
}



client.on('ready', () => {
	console.log('I am ready!');
	client.channels.get('553489897944645647').send('Я запустился!');
	client.user.setActivity('!помощь', { type: 'WATCHING' });


	// поулчаем настройки и запускаем основные функции бота
	getSite({method: "POST", url: url_site, form: {token: dbToken, type: 'settings'}}, (res) => {
      const answerSettings = JSON.parse(res.body);
      if (answerSettings.status == "OK") {
      	ALL_SETTINGS = answerSettings; // применяем настройки
         console.log('Настройки успешно загружены.\n');
         // поидее все действия нужно начинать после загрузки настроек
         // импортируем глобальные функции ->
			global_func = (require('./global-func.js')).setGlobald(ALL_SETTINGS.admins);
         startBot(); // запуск основных функций бота (обязателен для работы)
      } else {
         console.log(answerSettings.status.error);
         console.log('Повторная загрузка настроек через 1сек...');
         setTimeout(() => {
         	updateSettings(startBot);
         }, 1000);
      }
   });
});



client.login(tokenDiscord);


