// команды которые используются не в 1 файле



function getRandomItemArry(arr) { // возвращает случайное содержимое из массива
	const rand = Math.floor(Math.random() * arr.length);
	return arr[rand];
}



function isAdmin(user_id, guild_id=[]) { // проверка на админку в боте
	if (!adminListId[user_id]) return false; // если его нет в записи то выход
	if (adminListId[user_id].type == 0) return false; // если админка выключенна

	if (!adminListId[user_id].guilds) return adminListId[user_id].type; // если глобальная админка
	if (adminListId[user_id].guilds.indexOf(guild_id) == -1) return false; // если в списке нет гильдии
	return adminListId[user_id].type; // если же есть то значит админ и возвращаем его тип
}
let adminListId = {};



/* addBotMess - добавляет промисы-сообщения в массив
 * @promiseMess - промис, который возвращается после отправки сообщения
 * @id - id канала, что бы записать сообщение в его список
 * @messObj - обьект с сообщениями бота
 */
function addBotMess(promiseMess, id, messObj) { // добавляет промисы-сообщения в массив
	if (!messObj[id]) messObj[id] = [];
	messObj[id].push(promiseMess);
}



/* delleteBotMess - удаляет все сообщения бота на указанном канале
 * @id - id канала на котором удалить сообщения
 * @messObj - обьект с сообщениями бота
 */
function delleteBotMess(id, messObj) { // удаляет все сообщения бота на канале
	if (!messObj[id]) return messObj[id] = [];
	for (let i = 0; i < messObj[id].length; i++) {
		messObj[id][i].then( (e) => {e.delete(50)});
	}
	messObj[id] = []; // очищаем массив
}




function setGlobald(admLs) {
	adminListId = admLs; // устанавливаем список админов
	return {
		delleteBotMess,
		addBotMess,
		isAdmin,
		getRandomItemArry
	}
}

exports.setGlobald = setGlobald;

