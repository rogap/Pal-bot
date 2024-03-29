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
			.then((mess) => {
				return resolve(mess)
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


Discord.Message.prototype.deleteByIdList = function(...messIdList) {
	console.log('list: ', messIdList)
	return new Promise(async (resolve, reject) => {
		for (let i = 0; i < messIdList.length; i ++) {
			const messId = messIdList[i]
			await this.deleteById(messId)
			.catch(err => {
				console.log(err)
			})
		}
		return resolve(true)
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
 * проверяет, достаточно ли прав у бота в этом канале
 * @param {Array || String} perm - права которые нужны боту
 * @returns {Boolean}
 */
 Discord.Message.prototype.hasPermUser = function(perm) {
	if ( !this.channel.permissionsFor ) return true // для DM - true
	return this.channel.permissionsFor(this.member).has(perm)
}


/**
 * выполняет базовый парсинг контента из сообщения возвращая текст
 * @returns {String}
 */
 Discord.Message.prototype.getContent = function() {
	return this.content.replace(/^[\\]+/, '').replace(/[\n\r]+/g, ' ').trim()
}


/**
 * Отвечает автору на канале указанным текстом в формате "check in"
 * @param {String} text - текст который будет отправлен
 * @returns {Discord.Message}
 */
Discord.Message.prototype.sendCheckIn = async function(text) {
	return new Promise(async resolve => {
		this.channel.send(`:white_check_mark::white_check_mark::white_check_mark: \`\`\`yaml\n${text}\`\`\``)
		.then(message => {
			return resolve({
				status: true,
				message
			})
		})
		.catch(err => {
			return resolve({
				status: false,
				err
			})
		})
	})
}


Discord.Message.prototype.sendWarning = function(text, objectMessage) {
	const content = `:warning::warning::warning: \`\`\`fix\n${text}\`\`\``
	if (objectMessage) {
		objectMessage.content = content
		return this.reply(objectMessage)
	}
	return this.reply(content)
	// return this.channel.send(content)
}


Discord.Message.prototype.sendError = function(text) {}



/**
 * получает настройки и команды которые доступны (подходят) пользователю
 * @returns {Object} - setting {}
 */
Discord.Message.prototype.getSettings = function(id) { // unify
    const authorId = id || this.author.id
    const userSettings = _local.userSettings.get(authorId)
	// console.log(userSettings)

    // если есть настройки пользователя и включен приоритет
    if (userSettings && userSettings.only == 1) return userSettings.addDefault()

    const guild = this.guild
    if (guild) {
        const guildSettings = _local.guildSettings.get(guild.id)
        // если есть настройки сервера
        if (guildSettings) {
            // console.log(guildSettings)
            // если пользователь изменял себе другие параметры (не команды) то вернем их тут перекрыв серверные настройки
            if (userSettings) {
                if (userSettings.lang) guildSettings.lang = userSettings.lang
                if (userSettings.timezone !== undefined) guildSettings.timezone = userSettings.timezone
                // if (userSettings.backgrounds && userSettings.backgrounds.length) guildSettings.backgrounds = [...userSettings.backgrounds]
            }

			// console.log(guildSettings)
            // добавляем дефолтные настройки если нет установленных
            guildSettings.addDefault()
			guildSettings.params = userSettings.params
			return guildSettings
        }
    }

    // если есть настройки пользователя и не включен приоритет
    if (userSettings) return userSettings.addDefault()

	const {classes} = _local
	const {Settings} = classes

    return new Settings({ // дефолтный обьект настроек для пользователя
        id: authorId,
        type: 'default', // users
        lang: config.lang,
        timezone: config.timezone,
        prefix: config.prefix,
        only: null,
        commands: _local.commands,
		params: userSettings.params || {}
        // backgrounds: config.backgrounds
    })
}



client.__defer = async function(data, ephemeral=true) {
	return this.api.interactions(data.id, data.token).callback.post({
		data: {
			type: 6, // defer: 6; think: 5; 
			data: {
				flags: ephemeral ? 1 << 6 : null, // че это я пока не понял
			},
		},
	})
}



client.__think = async function(data, ephemeral=false) {
	return this.api.interactions(data.id, data.token).callback.post({
		data: {
			type: 5, // defer: 6; think: 5; 
			data: {
				flags: ephemeral ? 1 << 6 : null, // че это я пока не понял
			},
		},
	})
}