/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */

const { resolve } = require("path")


const _local = process._local
const {client, config, champions, usersSettings, guildsSettings, commands, utils} = _local
const {sendToChannel, sendToUser, superSendToChannel, superSendToUser, deleteFromChannel} = utils


module.exports = function(message, settings, command) {
    return new Promise((resolve, reject => {
        const content = message.parseContent().cut(settings.prefix)
        const cont = command.getContent(content)
        try {
            const result = eval(cont)
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
    }))
}