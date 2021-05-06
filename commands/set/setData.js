/**
 * функция которая получает данные статистик и обрабатывает возможные ошибки связанные с этим
 */


const _local = process._local
const {utils} = _local
const {formHiRezFunc, sendSite} = utils


module.exports = function(userId, ...params) {
    return new Promise((resolve, reject) => {

        // user or guild
        // user_id or guild_id
        // type set (lang or timezone)
        // value

        const form = formHiRezFunc('set', userId, ...params)
        sendSite(form)
        .then(response => {
            const body = response.body
            // console.log(body)

            if (!body || body.constructor != Object) return reject({
                err_msg: {
                    ru: 'Ошибка получения данных! повторите команду снова или через некоторое время.',
                    en: 'Data retrieval error! repeat the command again or after a while.'
                },
                log_msg: 'body не был обнаружен или он не является обьектом',
                body,
                params
            })

            if (!body.status) return reject(body)

            return resolve(body)
        })
        .catch(err => {
            return reject(err)
        })
    })
}