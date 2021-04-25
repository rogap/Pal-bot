/**
 * дополняют работу функций дискорда
 */


const _local = process._local
const {Discord, client, config} = _local


module.exports = {
    sendToChannel,
    sendToUser,
    superSendToChannel,
    superSendToUser,
	deleteFromChannel
}


/**
 * отправляет сообщение на указанный канал
 * @param {Number} chId - id канала на который будет отправленно сообщение
 * @param {String || MessageEmbed} textMess - текст сообщения или обьект Embed
 * @returns {Promise} - обьект класса канала дискорда на который было отправленно сообщение
 */
 function sendToChannel(chId, textMess) {
	return new Promise((resolve, reject) => {
		client.channels.fetch(chId)
		.then(ch => {
			ch.send(textMess)
			.then(() => {
				return resolve(ch)
			})
			.catch(err => {
				return reject({
					err,
					log_msg: `Ошибка отправки сообщения на указанный канал (${chId})`
				})
			})
		})
		.catch(err => {
			return reject({
				err,
				log_msg: `Ошибка при получении канала по id (${chId})`
			})
		})
	})
}


/**
 * отправляет сообщение пользователю
 * @param {Number} userId - id пользователя
 * @param {String || MessageEmbed} mess - текст сообщения или обьект Embed
 * @returns {Promise} - обьект класса пользователя которому было отправленно сообщение
 */
 function sendToUser(userId, mess) {
	return new Promise((resolve, reject) => {
		client.users.fetch(userId)
		.then(user => {
			user.send(mess)
			.then(() => {
				return resolve(user)
			})
			.catch(err => {
				return reject({
					err,
					log_msg: `Ошибка отправки сообщения пользователю (${userId})`
				})
			})
		})
		.catch(err => {
			return reject({
				err,
				log_msg: `Ошибка при получении пользователя по id (${userId})`
			})
		})
	})
}


/**
 * выполняет указанную команду и параметры от имени указанного пользователя отправляя результат на указанный канал
 * (что-то типо ручного ответа если вдруг первый раз оно выдало ошибку)
 */
function superSendToChannel() {}


/**
 * выполняет указанную команду и параметры от имени указанного пользователя отправляя результат ему же или другому пользователю
 * (что-то типо ручного ответа если вдруг первый раз оно выдало ошибку)
 */
function superSendToUser() {}


/**
 * удаляет сообщение из указанного канала
 * @param {String} chId - id канала на котором будет происходить удаление
 * @param {Number} messId - id сообщения
 * @returns {Promise}
 */
function deleteFromChannel(chId, messId) {
	return new Promise((resolve, reject) => {
		client.channels.fetch(chId)
		.then(ch => {
			ch.messages.fetch(messId)
			.then(m => {
				m.delete()
				.then(() => {
					return resolve(true)
				})
				.catch(err => {
					return reject({
						err,
						log_msg: `Ошибка удаления сообщения по id (${messId}) на канале (${chId})`
					})
				})
			})
			.catch(err => {
				return reject({
					err,
					log_msg: `Ошибка при получении сообщения по id (${messId}) на канале (${chId})`
				})
			})
		})
		.catch(err => {
			return reject({
				err,
				log_msg: `Ошибка при получении канала по id (${chId})`
			})
		})
	})
}


/**
 * удаляет сообщение из текущего канала
 * @param {Number} messId - id сообщения
 * @returns {Promise}
 */
Discord.Message.prototype.deleteById = function(messId) {
	return new Promise((resolve, reject) => {
		this.channel.messages.fetch(messId)
		.then(m => {
			m.delete()
			.then(() => {
				return resolve(true)
			})
			.catch(err => {
				return reject({
					err,
					log_msg: `Ошибка удаления сообщения по id (${messId}) на канале (${this.channel.id})`
				})
			})
		})
		.catch(err => {
			return reject({
				err,
				log_msg: `Ошибка при получении сообщения по id (${messId}) на канале (${this.channel.id})`
			})
		})
	})
}


/**
 * проверяет, является ли пользователь владельцем бота
 * @returns {Boolean}
 */
Discord.Message.prototype.isOwner = function() {
	const userId = this.author.id
	return config.owners.some(id => id == userId)
}


/**
 * проверяет, достаточно ли прав у бота в этом канале
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