// load-guild-and-comand.js - содержит специальные команды для каналов (на заказ)
// каждая функция должна принимать вторым параметром messObj - обьект содержащий все сохраненные смс



const global_func = require('./global-func.js'); // импортируем глобальные функции



exports.guild_comand = { // список каналов
	'365821017957859329': { // список уникальных команд для канала
		'!кися, муркай': { // информацию о команде и саму функцию
			func: function(m, messObj) {
				// prefixUrl - повторяющаяся часть url
				const prefixUrl = 'https://media.discordapp.net/attachments/365821017957859331/';
				const says = global_func.getRandomItemArry(catSays);
				let url = '';

				if (m.author.id == '359335650484289546') {
					url = '545959673598312449/1550221168538.jpg';
				} else {
					switch (says) {
						case 'жри мою жопу!': url = prefixUrl + '545959595533795340/20190215_192816.jpg';break;
						case 'иди убирай мое гавно!': url = prefixUrl + '545958870858727435/20190212_174437.jpg';break;
						case 'мне похуй, я сплю...': url = prefixUrl + global_func.getRandomItemArry(catSays_sleep);break;
						case 'я спрятался :see_no_evil:': url = prefixUrl + '545962071469326357/20181121_194105.jpg';break;
						case 'мур, люблю :3': url = prefixUrl + '545962620432416768/20181120_173010.jpg';break;
						default: url = prefixUrl + '545961975914692619/20181229_151337.jpg';
					}
				}

				global_func.addBotMess(m.reply(says, {
						embed: {
							thumbnail: {
						     	url: url
						   }
						}
					}), m.channel.guild.id, messObj);
			},
			info: "кися рандомно отвечает",
			comand: '!кися, муркай',
			params: false // не имеет параметров
		},
		id: '365821017957859329',
		list: ['!кися, муркай']
	},
	list: ['365821017957859329']
}



/* приложения !кися, муркай! ---> */

const catSays = ['мур, люблю :3', 'жри мою жопу!', 'иди убирай мое гавно!', 'мур мур мур :3', 
	'мне похуй, я сплю...', 'я спрятался :see_no_evil:'];
const catSays_sleep = ['545962962448416768/20181127_202015.jpg', '545962962448416769/20181124_202651.jpg',
	'545961430407708694/20190119_223647.jpg'];

/* приложения !кися, муркай! <--- */





