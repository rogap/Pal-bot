/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */




module.exports = async (message, settings, command, contentParams) => {
    try {
        const _local = process._local
        const {client, config, champions, usersSettings, guildsSettings, commands, utils} = _local
        const {sendToChannel, sendToUser, superSendToChannel, superSendToUser, deleteFromChannel} = utils

        return eval(contentParams)
    } catch(err) {
        console.log(`\nCONSOLE Ошибка выполнения CONSOLE:\n\n${contentParams}\n\nEND\n`)
        console.log(err)
    }
}