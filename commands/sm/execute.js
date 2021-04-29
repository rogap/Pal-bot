/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes


module.exports = function(message, settings, command, contentParams) {
    return new Promise((resolve, reject) => {
        const userId = message.author.id
        const {lang} = settings

        return reject({
            err_msg: {
                ru: 'Команда в разработке.',
                en: 'The team is in development.'
            }
        })

        const params = contentParams.split(' ')
        const {nameOrId, page} = params

        command.getStats(userId, nameOrId)
    })
}