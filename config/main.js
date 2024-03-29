/**
 * основной файл-скрипт для загрузки всех файлов в этой папке (переделать под ЭТО)
 * файл-конфиг
 */


try {
	require('dotenv').config()
} catch {
	// не грузим если нет модуля
}
const translate = require('./lang')
const env = process.env

module.exports = {
	discordToken: env.DISCORDTOKEN,
	steamKey: env.STEAMKEY,
	devId: env.DEVID,
	authKey: env.AUTHKEY,
	database: {
		name: env.DBNAME,
		host: env.DBHOST,
		port: env.DBPORT
	},
	translate,
	siteUrl: 'https://webmyself.ru/pal-bot/',
	discordInvate: 'https://discord.gg/C2phgzTxH9',
	// siteSupport: 'https://webmyself.ru/pal-bot/',
	botIcon: 'https://cdn.discordapp.com/icons/605378869691940889/c52df036ebee94381bcc325b20cb7b90.png?size=128',
	emptyIcon: 'https://raw.githubusercontent.com/rogap/Pal-bot/new/img/empty.png',
	copyText: '© 2019 Pal-Bot', // текст копирайта
	requestLimit: 1000,
	news: { // то что будет писатсья вместе с каждым сообщением бота (в его начале)
		ru: '```md\n#Используйте !hh для получения помощи.```',
		en: '```md\n#Use !hh for get help.```'
	},
	colors: { // цвета используемые в canvas
		red: '#CC0000',
		white: '#FFFFFF',
		blue: '#0088bb',
		// lightBlue: '#3399CC',
		black: '#000000',
		purple: '#9966FF',
		orange: '#EE5500',
		// lightGreen : '#33CC00',
		green: '#36BF09',
		yellow: '#F2EE13'
	},
	platforms: {
		1: 'Hi-Rez',
		5: 'Steam',
		9: 'PS4',
		10: 'Xbox',
		13: 'Google',
		22: 'Switch',
		25: 'Discord',
		28: 'Epic Games'
	},
	ranks: {
		ru: [
			'Калибровка', 'Бронза 5', 'Бронза 4', 'Бронза 3', 'Бронза 2', 'Бронза 1',
			'Сильвер 5', 'Сильвер 4', 'Сильвер 3', 'Сильвер 2', 'Сильвер 1',
			'Золото 5', 'Золото 4', 'Золото 3', 'Золото 2', 'Золото 1',
			'Платина 5', 'Платина 4', 'Платина 3', 'Платина 2', 'Платина 1',
			'Алмаз 5', 'Алмаз 4', 'Алмаз 3', 'Алмаз 2', 'Алмаз 1', 'Мастер', 'ГМ'
		],
		en: [
			'Unranked', 'Bronze 5', 'Bronze 4', 'Bronze 3', 'Bronze 2', 'Bronze 1',
			'Silver 5', 'Silver 4', 'Silver 3', 'Silver 2', 'Silver 1',
			'Gold 5', 'Gold 4', 'Gold 3', 'Gold 2', 'Gold 1',
			'Platinum 5', 'Platinum 4', 'Platinum 3', 'Platinum 2', 'Platinum 1',
			'Diamond 5', 'Diamond 4', 'Diamond 3', 'Diamond 2', 'Diamond 1', 'Master', 'GM'
		]
	},
	img: {
		items: {},
		maps: {},
		avatars: {},
		divisions: [],
		backgrounds: {},
		cardFrames: []
	},
	chLog: '696604376034181140', // logs - все виды ошибок в том числе не найденные картинки
	chNot: '612875033651707905', // notification - старт бота, добавление и удаление серверов
	chImg: '850723677355769887', // канал для хранения картинок (из-за тупости работы дискорда вынужен делать так)
	// и не я один: https://support.discord.com/hc/en-us/community/posts/360041728292-Edit-sent-files
	chShowUsers: '893477314552270908', // канал показа сколько всего пользователей
	chShowServers: '893477760016723978', // канал показа сколько всего серверов
	chShowCommands: '893477861460148224', // канал показа сколько было использовано команд
	prefix: '!',
	testing: false,
	lang: 'en', // язык по умолчанию
	timezone: 0,
	backgrounds: ['1'], // дефолтный фон
	langs: { // для перевода языка в числовой вид
		'ru': 11,
		'en': 1
	},
	langsNum: { // для перевода языка в буквенный вид
		1: 'en',
		11: 'ru'
	},
	owners: ['510112915907543042'],
	example: { // id и ник который будет использован в примерах
		name: 'YourNickname',
		id: 3368378
	},
	timeLimit: {
		getdataused: 0,
		gethirezserverstatus: 1000 * 60 * 10,
		searchplayers: 1000 * 60 * 5,
		getchampions: 1000 * 60 * 60 * 24 * 3650,
		getchampioncards: 1000 * 60 * 60 * 24 * 3650,
		getplayer: 1000 * 60 * 3,
		getitems: 1000 * 60 * 60 * 24 * 3650,
		getchampionranks: 1000 * 60 * 5,
		getplayerloadouts: 1000 * 60 * 10,
		getplayerstatus: 1000 * 10,
		getmatchhistory: 1000 * 60,
		getmatchdetails: 1000 * 60 * 60 * 24 * 3650,
		getmatchplayerdetails: 1000 * 30,
		getfriends: 1000 * 60 * 5
	}
}