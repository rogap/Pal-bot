/**
 * функция которая получает данные статистик и обрабатывает возможные ошибки связанные с этим
 */


const _local = process._local
const {utils} = _local
const {formHiRezFunc, sendSite} = utils


module.exports = function(userId, ...prams) {
    return new Promise((resolve, reject) => {
        const form = formHiRezFunc('ss', userId, ...prams)
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
                prams
            })

            if (!body.status) return reject(body)

            const {getplayer, getchampionranks} = body
            // console.log(getplayer)
            // console.log(getchampionranks)

            if ( !getplayer.status ) return reject(getplayer)
            if ( !getchampionranks.status ) return reject(getchampionranks) // возможно стоит пропустить эту проверку
            return resolve(body)
        })
        .catch(err => {
            return reject(err)
        })
    })
}