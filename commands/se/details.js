/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes


module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comSe = prefix + command.possibly[0]
    const expleName = config.example.name

    const details = new Details(command)
    .setDescription({
        ru: `[${comSe} "Пользователь"]`,
        en: `[${comSe} "User"]`
    })
    .setFields({
        name: {
            ru: 'Пользователь',
            en: 'User'
        },
        value: {
            ru: [
                `Делает поиск игроков по указанному нику;`
            ],
            en: [
                `Makes a search for players by the specified nickname;`
            ]
        }
    })
    .setExample(`${prefix + comSe} ${expleName}`)

    return details
}