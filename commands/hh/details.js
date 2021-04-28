/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes
 
 
module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comHh = prefix + command.possibly[0]
    const comMe = commands.getByName('me').possibly[0]

    const details = new Details()
    .setTitle('ru', `\`${command.name}\` - ${command.info.ru}\nПримеры:`)
    .setFields('ru', {
        name: `${comHh}:`,
        value: command.info.ru
    })
    .setFields('ru', {
        name: `${comHh} ${comMe}:`,
        value: `Возвращает подробное описание для указанной команды.\n[Это сообщение как пример]`
    })
    .setTitle('en', `\`${command.name}\` - ${command.info.en}\nExamples:`)
    .setFields('en', {
        name: `${comHh}:`,
        value: command.info.en
    })
    .setFields('en', {
        name: `${comHh} ${comMe}:`,
        value: `Returns a detailed description for the specified command.[This message is an example]`
    })

    return details
}