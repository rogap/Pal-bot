/**
 * вспомогательные функции для запросов на сайт
 */


const request = require("request")
const randomUseragent = require("random-useragent")
const _local = process._local
const {config} = _local


module.exports = {
    sendSite,
    formHiRezFunc
}


/**
 * делает запрос на url с параметрами и возвращает промис с результатом
 * @param {Object} params 
 */
 function sendSite(params) {
	if (!params.strictSSL) params.strictSSL = false
	params.url = encodeURI(params.url)
	const send = params.method == "POST" ? request.post : request.get

    return new Promise((resolve, reject) => {
        send(params, function (error, response) {
            if (error) return reject(error)
            return resolve(response)
        })
    })
}


/**
 * облегчаем формирование запросов к БД
 * @param {String} command - имя вызываемой функции
 * @param {Number} discord_id - id дискорда пользователя написавшего особщение (для поиска сохраненного никнейма)
 * @param {Array} params - параметры для функции
 */
 function formHiRezFunc(command, discord_id=null, ...params) {
	return {
		url: config.urlApi,
		method: "POST",
		json: true,
		form: {
			token: config.dbToken,
			command,
			discord_id,
			params
		},
		headers: {
			"User-Agent": randomUseragent.getRandom()
		}
	}
}