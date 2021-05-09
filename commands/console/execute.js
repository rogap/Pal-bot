/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */




module.exports = function(message, settings, command, contentParams) {
    return new Promise((resolve, reject) => {
        try {
            const _local = process._local
            const {client, config, champions, usersSettings, guildsSettings, commands, utils} = _local
            const {sendToChannel, sendToUser, superSendToChannel, superSendToUser, deleteFromChannel} = utils

            const result = eval(contentParams)
            if ( result !== null && result !== undefined && result.constructor === Promise ) {
                result.then(some => {
                    return resolve(some)
                })
                .catch(err => {
                    return reject({
                        err
                    })
                })
            }

            return resolve(result)
        } catch(err) {
            return reject({
                err
            })
        }
    })
}