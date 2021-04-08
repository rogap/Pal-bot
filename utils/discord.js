/**
 * дополняют работу функций дискорда
 */


const _local = process._local
const {client} = _local


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