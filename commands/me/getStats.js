/**
 * функция которая получает данные статистик и обрабатывает возможные ошибки связанные с этим
 */


const _local = process._local
const {utils} = _local
const {formHiRezFunc, sendSite} = utils


module.exports = function(userId, ...params) {
    return new Promise((resolve, reject) => {
        const form = formHiRezFunc('me', userId, ...params)
        sendSite(form)
        .then(response => {
            const body = response.body
            console.log(body)
            if (!body.status) return reject(body)
            return resolve(body) // {discord_id, hz_player_name, paladins_id}
        })
        .catch(err => {
            return reject(err)
        })
    })
}