/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes
 
 
module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comHh = command.possibly[0]
    const comMe = commands.getByName('me').possibly[0]

    const details = new Details(command)
    .setDescription({
        ru: `[${comHh}]`,
        en: `[${comHh}]`
    })
    .setFields({
        name: {
            ru: 'Команда',
            en: 'Command'
        },
        value: {
            ru: [
                `Выводит подробное описание команды (в ЛС);`
            ],
            en: [
                `Displays a detailed description of the command (in PM);`
            ]
        }
    })
    .setExample(`${prefix + comHh}`, `${prefix + comHh} ${comMe}`)

    return details
}