/**
 * дополняют работу функций дискорда
 */


const _local = process._local
const {Discord, client, config} = _local


module.exports = {
    sendChannel,
    sendUser,
    superSendChannel,
    superSendUser
}


/**
 * отправляет сообщение на указанный канал
 */
 function sendChannel(channelId, mess) {
	return new Promise(resolve => {
		client.channels.fetch(channelId)
		.then(ch => {
			ch.send(mess)
			.then(() => {
				return resolve({
					status: true,
					channel: ch
				})
			})
			.catch(err => {
				console.log(err)
				return resolve({status: false, err})
			})
		})
	})
}


/**
 * отправляет сообщение пользователю
 */
 function sendUser(userId, mess) {
	return new Promise(resolve => {
		client.users.fetch(userId)
		.then(ch => {
			ch.send(mess)
			.then(() => {
				return resolve(true)
			})
			.catch(e => {
				console.log(e)
				return resolve(false)
			})
		})
	})
}


/**
 * выполняет указанную команду и параметры от имени указанного пользователя отправляя результат на указанный канал
 * (что-то типо ручного ответа если вдруг первый раз оно выдало ошибку)
 */
function superSendChannel() {}


/**
 * выполняет указанную команду и параметры от имени указанного пользователя отправляя результат ему же или другому пользователю
 * (что-то типо ручного ответа если вдруг первый раз оно выдало ошибку)
 */
function superSendUser() {}


/**
 * проверяет, является ли пользователь владельцем бота
 * @returns {Boolean}
 */
Discord.Message.prototype.isOwner = function() {
	const userId = this.author.id
	return config.owners.some(id => id == userId)
}


/**
 * првоеряет, достаточно ли прав у бота в этом канале
 * @param {Array || String} perm - права которые нужны боту
 * @returns {Boolean}
 */
Discord.Message.prototype.hasPerm = function(perm) {
	if ( !this.channel.permissionsFor ) return true // для DM - true
	return this.channel.permissionsFor(client.user).has(perm)
}



/**
 * выполняет базовый парсинг контента из сообщения возвращая текст
 * @returns {String}
 */
Discord.Message.prototype.parseContent = function () {
	return this.content.replace(/^[\\]+/, "").replace(/[\n\r]+/g, " ").trim()
}