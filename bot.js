
const { Client, Attachment, RichEmbed, snekfetch } = require('discord.js');
const client = new Client();

client.on('ready', () => {
	console.log('I am ready!');
	// client.channels.get('505374650730283010').sendMessage('Юля кукареку!');
	// message.member.setMute(true, 'It needed to be done');
});



client.on('message', (mess) => {
	if (mess.content.indexOf('!стата ') == 0) {
		const name = mess.content.slice(7).trim();
		if (name != name.replace( /[^A-zА-я0-9]/, '' )) {
			return addBotMess(mess.reply('Ошибка в имени.'), mess.channel.guild.id);
		}
		const fetch = require('snekfetch');
		fetch.get(encodeURI(`http://www.playpaladins.online/api/profile/pc/${name}`))
		.then((r) => {
			const json = r.body;

			if (json.message == 'OK') return addBotMess(mess.reply(`Ошибка, игрок "${name}" не найден`), mess.channel.guild.id);
			const kda = getKDABP(json.champions);

			const embed = new RichEmbed()
			.setTitle(`Стата для: ${json.main.Name}`)
			.setColor(0xFF0000)
			.setDescription(`**Роль:** ${kda.p}, **Персонаж:** ${kda.b}, **КДА:** ${((kda.k+kda.a/2)/kda.d).toFixed(2)}`)
			.addField(`Часы на уронах`, secToMin(kda.dmg), true)
			.addField(`Часы на хилах`, secToMin(kda.heal), true)
			.addField(`Часы на флангах`, secToMin(kda.flank), true)
			.addField(`Часы на танках`, secToMin(kda.tank), true)
			.addField(`Всего килов`, kda.k, true)
			.addField(`Всего смертей`, kda.d, true)
			.addField(`Всего ассистов`, kda.a, true)
			.addField(`Всего побед`, json.main.Wins, true)
			.addField(`Всего поражений`, json.main.Losses, true)
			.addField(`lvl`, json.main.Level, true)
			.addField(`Создан`, json.main.Created_Datetime, true)
			.addField(`Сыграно часов`, json.main.HoursPlayed, true)
			.addField(`Ранк`, getRanck(json.main.Tier_RankedKBM), true)
			.addField(`OT`, json.main.RankedKBM.Points, true)
			.addField(`Побед`, json.main.RankedKBM.Wins, true)
			.addField(`Поражений`, json.main.RankedKBM.Losses, true);
			//.addBlankField(false) // делает тип новую строку
			//.setDescription(info);
			addBotMess(mess.channel.send(embed), mess.channel.guild.id);
		});
	} else if (mess.content.indexOf('!игры ') == 0) {
		let text = mess.content.slice(6).trim();
		let too = text.indexOf(' ');
		if (too == -1) too = text.length;
		const name = text.slice(0, too).trim();
		if (name != name.replace( /[^A-zА-я0-9]/, '' )) {
			return addBotMess(mess.reply('Ошибка в имени.'), mess.channel.guild.id);
		}
		let text2 = text.slice(text.indexOf(' ') + 1).trim();
		//if (text == text2) return addBotMess(mess.reply('Ошибка text.'), mess.channel.guild.id);
		let to = text2.indexOf(' ');
		if (to == -1) to = text2.length;
		let matchNum = Math.floor(text2.slice().trim()) || 0;
		if (matchNum < 0) matchNum = 0;
		if (isNaN(matchNum)) { // должен быть числом
			return addBotMess(mess.reply('Не корректный запрос'), mess.channel.guild.id);
		}
		const fetch = require('snekfetch');
		fetch.get(encodeURI(`http://playpaladins.online/api/profile/pc/${name}/matches?page=1`))
		.then((r) => {
			const matches = r.body.matches;

			const embed = new RichEmbed()
			.setTitle(`Матчи ${matches[0].playerName}:`)
			.setColor(0xFF0000);

			if (matchNum > matches.length - 1) matchNum = matches.length - 1; // что бы не брать больше 10 и того что есть
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
			.addField(`id матча`, matches[matchNum].Match, true)
			.addField(`Урон`, matches[matchNum].Damage, true);
			if (matches[matchNum].Damage_Mitigated) embed.addField(`Защита`, matches[matchNum].Damage_Mitigated, true);
			if (matches[matchNum].Healing) embed.addField(`Исцеление`, matches[matchNum].Healing, true);
			addBotMess(mess.channel.send(embed), mess.channel.guild.id);
		});
	} else if (mess.content == '!хелп' || mess.content == '!хелпа' || mess.content == '!помощь') {
		let kateChanelInfo = '';
		if (mess.channel.guild.id == '365821017957859329') kateChanelInfo = '\n**!кися, муркай** - рандомно отвечает );';
		addBotMess(mess.reply(`***Список команд:***
**!помощь** - выводит этот список (так же можно **!хелп** или **!хелпа**);
**!стата [имя]** - для получения статистики аккаунта;
**!игры [имя] [id]** - получает последнюю ИЛИ указанную по счету ID игру (0 - последняя игра, максимум 9);
**!песа, дай лапку** - рандомно дает лапку или посылает куда по дальше);${kateChanelInfo}
**!онлайн** - выводит статистику пользователей по онлайну и играм;
**!очистить** - удаляет все сообщения бота (за его последний запуск);
**!смс [id] [сообщение]** - позволяет отправить сообщение в вк указанному id;
**!переписка** - выводит 10 последних сообщений из вк (сколько влезит, если длинные);
***\`\`\`P.S. Создатель бота daniil#4337, все вопросы, пожелания и предложения в лс.
Код ужасный, влом переписывать... gitHub: https://github.com/rogap/pubo\`\`\`***`), mess.channel.guild.id);
	} else if (mess.content == '!очистить' || mess.content == '!чистить') {
		delleteBotMess(mess.channel.guild.id); // удаляем сообщения бота
	}
});


function secToMin(s) { // секунды в минуты или минуты в часы, принцип тот же
	let min = (s / 60).toFixed(2) + '';
	if (min.indexOf('.') != -1) { // если дробное
		let sec = (min.slice(min.indexOf('.') + 1) * 6 / 10).toFixed(0);
		min = `${min.slice(0, min.indexOf('.'))}.${sec}`;
	}
	return min;
}

function getRanck(n) {
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

function getKDABP(champions) {
	let kills = 0,
		assists = 0,
		deaths = 0,
		best = '',
		bestMinutes = 0,
		role = {
			heal: 0,
			dmg: 0,
			tank: 0,
			flank: 0
		},
		bigs = 0,
		bigsRole = '';

	for (let i = 0; i < champions.length; i++) {
		kills += champions[i].Kills;
		assists += champions[i].Assists;
		deaths += champions[i].Deaths;
		if (bestMinutes < champions[i].Minutes) {
			best = champions[i].champion;
			bestMinutes = champions[i].Minutes;
		}
		switch (getRole(champions[i].champion)) {
			case 'dmg': role.dmg += champions[i].Minutes;break;
			case 'flank': role.flank += champions[i].Minutes;break;
			case 'heal': role.heal += champions[i].Minutes;break;
			case 'tank': role.tank += champions[i].Minutes;break;
		}
	}
	for (let key in role) {
		if (role[key] > bigs) {bigs = role[key]; bigsRole = key;}
	}
	return {k: kills, d: deaths, a: assists, b: best, p: bigsRole, 
		dmg: role.dmg, flank: role.flank, heal: role.heal, tank: role.tank}
}

function getRole(name) {
	let heals = ["Mal'Damba", "Ying", "Grover", "Jenos", "Grohk", "Pip", "Seris", "Furia", ],
		dmgs = ["Lian", "Cassie", "Drogoz", "Strix", "Viktor", "Sha Lin", "Bomb King", "Kinessa", "Tyra", "Vivian", "Willo", "Dredge"],
		flanks = ["Androxus", "Buck", "Zhin", "Evie", "Koga", "Talus", "Maeve", "Skye", "Lex", ],
		tanks = ["Makoa", "Fernando", "Ruckus", "Barik", "Ash", "Khan", "Torvald", "Inara", "Terminus", "Moji"];

	if (heals.find(function(e) {if (e == name) return true;})) return 'heal';
	if (dmgs.find(function(e) {if (e == name) return true;})) return 'dmg';
	if (flanks.find(function(e) {if (e == name) return true;})) return 'flank';
	if (tanks.find(function(e) {if (e == name) return true;})) return 'tank';
}



client.on('message', mess => {
	if (mess.content == '!песа, дай лапку') {
		if (dogsSaysWaitMembers.find(function(el){return el == mess.author.id;})) { // проверяем вышло ли время
			// если время не вышло то предупреждаем
			return addBotMess(mess.reply('Песа устал, ему нужно минутку отдохнуть...'), mess.channel.guild.id);
		}
		const says = getRandomItemArry(dogsSays);
		if (says == 'Держи ^^' || says == 'милашке даю лапку') {
			addBotMess(mess.reply(says, {
				embed: {
					thumbnail: {
			      	url: 'https://st.depositphotos.com/1766930/4697/i/950/depositphotos_46971905-stock-photo-dogs-paw-and-mans-hand.jpg'
			      }
			   }
			}), mess.channel.guild.id);
		} else {
			addBotMess(mess.reply(says), mess.channel.guild.id);
		}
		dogsSaysWaitMembers.push(mess.author.id); // добавляем во временный бан (ожидание)
		const timer = (isAdminBot(mess.author.id)) ? 1000 * 10 : 1000 * 60; // время ожидания (мне 10 сек)
		setTimeout(() => { // через минуту удаляем пользователя из бана
			dogsSaysWaitMembers.find((el, i, arr) => {
				if (el == mess.author.id) arr.splice(i, 1);
			});
		}, timer);
	} else if (mess.content == '!кися, муркай' && mess.channel.guild.id == '365821017957859329') {
		const says = getRandomItemArry(catSays);
		let url = '';

		if (mess.author.id == '359335650484289546') {
			url = 'https://media.discordapp.net/attachments/365821017957859331/545959673598312449/1550221168538.jpg';
		} else {
			switch (says) {
				case 'жри мою жопу!': url = 'https://media.discordapp.net/attachments/365821017957859331/545959595533795340/20190215_192816.jpg';break;
				case 'иди убирай мое гавно!': url = 'https://media.discordapp.net/attachments/365821017957859331/545958870858727435/20190212_174437.jpg';break;
				case 'мне похуй, я сплю...': url = getRandomItemArry(catSays_sleep);break;
				case 'я спрятался :see_no_evil:': url = 'https://media.discordapp.net/attachments/365821017957859331/545962071469326357/20181121_194105.jpg';break;
				case 'мур, люблю :3': url = 'https://media.discordapp.net/attachments/365821017957859331/545962620432416768/20181120_173010.jpg';break;
				default: url = 'https://media.discordapp.net/attachments/365821017957859331/545961975914692619/20181229_151337.jpg';
			}
		}

		addBotMess(mess.reply(says, {
					embed: {
						thumbnail: {
					     	url: url
					   }
					}
				}), mess.channel.guild.id);
	} else if (mess.content == '!онлайн') {
		let membersArr = mess.guild.members.array(),
			game = {},
			offline = 0,
			dnd = 0, // красный
			idle = 0, // желтый
			online = 0; // зеленый
		for (let i = 0; i < membersArr.length; i++) {
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
		addBotMess(mess.reply(`**Всего: ${membersArr.length}** ${getTextUsers(membersArr.length)}, **Оффлайн: ${offline}**, **Онлайн: ` + 
			`${dnd + idle + online}**, из них **${online} В сети, ${idle} Не активен, ${dnd} Не беспокоить.**` + 
			`${listGame(game)}`), mess.channel.guild.id);
	} else if (mess.content == '!угадай') {
		addBotMess(mess.reply(`Псевдо рандом: **${pseudoRandom()}**, *коэффициенты:* ${getObjToText(PRCounts)} **(будущий, измененный).**`), mess.channel.guild.id);
	} else if (mess.content.indexOf('!смс ') == 0) {
		if (sendVkListMembers.find(function(el){return el == mess.author.id;})) { // проверяем вышло ли время
			// если время не вышло то предупреждаем
			return addBotMess(mess.reply('Возможно отправлять только 1 сообщение в минуту.'), mess.channel.guild.id);
		}
		let text = mess.content.slice(5).trim();
		let to = text.indexOf(' ');
		if (to == -1) too = text.length;
		let id = Math.floor(text.slice(0, to).trim()); // приводим в норм вид

		const type_id = id < 0 ? "chat_id" : "user_id"; // позволяет отправлять сообщение в группы
		if (id < 0) id *= -1; // делаем id правильным
		id += ''; // для replace
		if (id != id.replace( /[^0-9]/, '' )) return addBotMess(mess.reply('Не корректный id.'), mess.channel.guild.id);

		let text2 = repText(text.slice(text.indexOf(' ') + 1)).trim();
		if (!validMessVk(text2)) return addBotMess(mess.reply('Недопустимые слова в сообщении.'), mess.channel.guild.id);
		if (text == text2) return addBotMess(mess.reply('Не задан текст сообщения.'), mess.channel.guild.id);
		if (text2.length == 0 || text2.length >= 500) return addBotMess(mess.reply('Сообщение пустое или слишком длинное.'), mess.channel.guild.id);

		if (!addListLastMess(text2)) return addBotMess(mess.reply('Такое сообщение уже было отправленно.'), mess.channel.guild.id);

		const randomIDVK = (Math.random() * 1000000000000).toFixed(0);
		const url = `https://api.vk.com/method/messages.send?random_id=${randomIDVK}&${type_id}=${id}&message=${text2}&v=5.92&access_token=`;
		const fetch = require('snekfetch');

		sendVkListMembers.push(mess.author.id); // добавляем в список временно забаненых
		const timer = (isAdminBot(mess.author.id)) ? 1000 * 3 : 1000 * 60; // время ожидания (мне 3 сек)
		setTimeout(() => { // через минуту удаляем пользователя из бана
			sendVkListMembers.find((el, i, arr) => {
				if (el == mess.author.id) arr.splice(i, 1);
			});
		}, timer);

		fetch.get(encodeURI(`${url + vkToken}`))
		.then((r) => {
			if (r.body.error != undefined && r.body.response == undefined) { // если ошибка
				return addBotMess(mess.reply('Ошибка, возможно не корректный id или закрыт лс (чс).'), mess.channel.guild.id);
			} else if (r.body.response != undefined && r.body.error == undefined) { // если отправилось
				return addBotMess(mess.reply('Сообщение успешно отправленно.'), mess.channel.guild.id);
			} else { // непонятно че
				return addBotMess(mess.reply('Неизвестная ошибка, поидее это никак не может выполнится.'), mess.channel.guild.id);
			}
		});
	} else if (mess.content == '!переписка') {
		if (checkVkListMembers.find(function(el){return el == mess.author.id;})) { // проверяем вышло ли время
			// если время не вышло то предупреждаем
			return addBotMess(mess.reply('Возможно делать запросы только 1 раз в минуту.'), mess.channel.guild.id);
		}
		function getLactMessId(callback) { // получает id последнего сообщения вк, передавая его в callback
			const url = `https://api.vk.com/method/messages.searchConversations?count=1&v=5.92&access_token=`;
			const fetch = require('snekfetch');
			fetch.get(encodeURI(`${url + vkToken}`))
			.then((r) => {
				callback(r.body.response.items[0].last_message_id);
			});
		}
		function lastMessVK(messID) {
			massMessID = [];
			for (let i = 0; i < 10; i++ ) {massMessID.push(messID - i);}
			const url = `https://api.vk.com/method/messages.getById?message_ids=${massMessID + ''}&extended=1&v=5.92&access_token=`;
			const fetch = require('snekfetch');
			fetch.get(encodeURI(`${url + vkToken}`))
			.then((r) => {
				if (r.body.error != undefined && r.body.response == undefined) { // если ошибка
					return addBotMess(mess.reply('Похоже сообщений нет...'), mess.channel.guild.id);
				} else if (r.body.response != undefined && r.body.error == undefined) { // если ошибки нет
					const vk_messages = r.body.response.items;
					const vk_profiles = r.body.response.profiles;
					const obj_profiles = {};
					for (let i = 0; i < vk_profiles.length; i++) {
						if (obj_profiles[vk_profiles[i].id] == undefined) obj_profiles[vk_profiles[i].id] = {};
						obj_profiles[vk_profiles[i].id].id = vk_profiles[i].id;
						obj_profiles[vk_profiles[i].id].first_name = vk_profiles[i].first_name;
						obj_profiles[vk_profiles[i].id].last_name = vk_profiles[i].last_name;
						obj_profiles[vk_profiles[i].id].sex = vk_profiles[i].sex;
						obj_profiles[vk_profiles[i].id].online = vk_profiles[i].online;
					}
					vk_messages[0].from_id; // от кого, id
					vk_messages[0].peer_id; // тип с кем диалог
					vk_messages[0].text; // текст сообщения
					let answerText = ``;
					let lastAnswerText = answerText;
					for (let i = 0; i < vk_messages.length; i++) {
						const vk = vk_messages[i];
						if (vk.action != undefined) { // события в группах
							console.log(`(${getDate(vk.date)}) Событие: **${vk.action.type}** для: ${vk.from_id}\n`);
							answerText += `(${getDate(vk.date)}) Событие: **${vk.action.type}** для: ${vk.from_id}\n`;
						} else {
							const fromTo = vk.from_id == vk.peer_id ? "От" : "Кому";
							answerText += `(${getDate(vk.date)}) **${fromTo} - ${obj_profiles[vk.peer_id].first_name} ` + 
								`${obj_profiles[vk.peer_id].last_name}:** ${vk.text}\n`;
						}
						if (answerText.length >= 2000) {answerText = lastAnswerText; break;} // у дискорда лимит в 2000
						lastAnswerText = answerText; // сохраняем
					}
					answerText.slice(0, -2); // удаляем перенос строки
					return addBotMess(mess.reply(answerText), mess.channel.guild.id);
				} else { // непонятно че
					return addBotMess(mess.reply('Неизвестная ошибка, поидее это никак не может выполнится.'), mess.channel.guild.id);
				}
			});
		}
		checkVkListMembers.push(mess.author.id); // добавляем в список временно забаненых
		const timer = (isAdminBot(mess.author.id)) ? 1000 * 3 : 1000 * 60; // время ожидания (мне 3 сек)
		setTimeout(() => { // через минуту удаляем пользователя из бана
			checkVkListMembers.find((el, i, arr) => {
				if (el == mess.author.id) arr.splice(i, 1);
			});
		}, timer);
		getLactMessId(lastMessVK);
	}
});


function repText(text) { // удаляем & из строки
	for (let i = 0; i < text.length; i++) {
		let k = text.indexOf('&');
		if (k == -1) return text;
		text = text.slice(0, k) + text.slice(k+1);
	}
}

function getDate(d) { // получаем нужный вид даты
	d *= 1000;
	return new Date(d).toLocaleString("ru", {month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'});
}

function addListLastMess(mess) {
	if (listLastMess.indexOf(mess) != -1) return false;
	if (listLastMess.length >= 10) listLastMess = listLastMess.slice(1); // храним максимум 10 последних сообщений
	listLastMess.push(mess);
	return true;
}

function validMessVk(text) {
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


function pseudoRandom() {
	let sumKeys = 0; // сумма всех шансов
	for (let key in PRCounts) {
		sumKeys += PRCounts[key];
	}
	const chance = {}; // временный обьект содержащий шансы в %
	let lastKey = 0;
	let length = 0;
	for (let key in PRCounts) {
		chance[key] = (100 / sumKeys * PRCounts[key]).toFixed(3) * 1 + lastKey;
		lastKey = chance[key];
		length++;
	}
	const random = (Math.random() * 100).toFixed(3) * 1; // получаем рандомный %
	let answer = '';
	let stopFor = false;
	for (let key in chance) { // сверяем поулченный рандом с намишей вероятностью
		if (random <= chance[key] && !stopFor) {
			answer = key;
			stopFor = true;
			PRCounts[key] -= length / 2;
		} else {
			PRCounts[key] += .5;
		}
	}
	return answer;
}
const PRCounts = {
	'a': 10,
	'b': 10,
	'c': 10,
	'd': 10
}; // где 1 это шанс получения (шансы в соотношении)


function listGame(obj) { // принимает обьект с играми и кол-вом игроков и возвращает их список
	if (Object.keys(obj).length == 0) return ``;
	let list = `\n**Играют в:** `;
	for (let key in obj) {
		list += `**"**${key}**"** **- ${obj[key]},** `;
	}
	return `${list.slice(0, list.length - 4)}.**`;
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


const dogsSaysWaitMembers = []; // список id людей которые ожидают, не разрешено писать команду
const dogsSays = ['Держи ^^', 'eng plz', 'хуяпку', 'Hello?', 'По ебалу тебе лапкой', 'милашке даю лапку'];
const catSays = ['мур, люблю :3', 'жри мою жопу!', 'иди убирай мое гавно!', 'мур мур мур :3', 'мне похуй, я сплю...', 'я спрятался :see_no_evil:'];
const catSays_sleep = ['https://media.discordapp.net/attachments/365821017957859331/545962962448416768/20181127_202015.jpg',
'https://media.discordapp.net/attachments/365821017957859331/545962962448416769/20181124_202651.jpg',
'https://media.discordapp.net/attachments/365821017957859331/545961430407708694/20190119_223647.jpg'];

function getRandomItemArry(arr) {
	const rand = Math.floor(Math.random() * arr.length);
	return arr[rand];
}



// --- GLOBAL --- //

const sendVkListMembers = []; // список id людей которые отправили уже смс в вк
const checkVkListMembers = []; // список id людей которые отправили уже смс в вк
const listLastMess = []; // список последних смс для проверки спама

const botMess = {};

function addBotMess(promiseMess, id) { // добавляет промисы-сообщения в массив
	if (!botMess[id]) botMess[id] = [];
	botMess[id].push(promiseMess);
}

function delleteBotMess(id) { // удаляет все сообщения бота на канале
	for (let i = 0; i < botMess[id].length; i++) {
		botMess[id][i].then( (e) => {e.delete(50)});
	}
	botMess[id] = []; // очищаем массив
}

function getObjToText(obj) {
	let text = ``;
	for (let key in obj) {
		text += `${key} = ${obj[key]}, `;
	}
	return text.slice(0, -2);
}

function isAdminBot(id) { // проверка на админку в боте
	for (let i = 0; i < adminListId.length; i++) {
		if (adminListId[i].indexOf(id) == 0) return true;
	}
	return false;
}
adminListId = ['510112915907543042', '244114707676397569']; // список id аков с админкой

const vkToken = process.env.VK_TOKEN;

// --- GLOBAL --- //

client.login(process.env.BOT_TOKEN);

