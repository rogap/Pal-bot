/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


module.exports = function(message, settings, command) {
    const content = message.parseContent().cut(settings.prefix)
    console.log(content)
    console.log( command.getContent(content) )
}