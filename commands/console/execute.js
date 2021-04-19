/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {client, config, champions, usersSettings, guildsSettings, commands, utils} = _local
const {sendUser, sendChannel} = utils


module.exports = function(message, settings, command) {
    const content = message.parseContent().cut(settings.prefix)
    const cont = command.getContent(content)
    try {
        eval(cont)
    } catch(e) {
        console.log(e)
    }
}