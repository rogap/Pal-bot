/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {classes} = _local
const {Details} = classes


module.exports = function(settings, command) {
    const {prefix} = settings
    const comSet = prefix + command.possibly[0]

    const details = new Details()
    .setTitle('ru', `\`${command.name}\` - ${command.info.ru}\nПримеры:`)
    .setFields('ru', {
        name: `${comSet} lang en`,
        value: `Установит английский язык для вас.\n[Параметры можно менять местами]`
    })
    .setFields('ru', {
        name: `${comSet} 605378869691940889 lang en`,
        value: `Установит английский язык для указанного сервера (его id).\n[Параметры можно менять местами]`
    })
    .setFields('ru', {
        name: `${comSet} me timezone -6`,
        value: `Установит временную зону для вас на "-6".\n[Параметры можно менять местами]`
    })
    .setFields('ru', {
        name: `${comSet} timezone 3.5 605378869691940889`,
        value: `Установит временную зону для указанного сервера (по id) на "3.5".\n[Параметры можно менять местами]`
    })
    .setTitle('en', `\`${command.name}\` - ${command.info.en}\nExamples:`)
    .setFields('en', {
        name: `${comSet} lang en:`,
        value: `Installs English for you.\n[Parameters can be swapped]`
    })
    .setFields('en', {
        name: `${comSet} 605378869691940889 lang en`,
        value: `Sets the English language for the specified server (its id).\n[Parameters can be swapped]`
    })
    .setFields('en', {
        name: `${comSet} me timezone -6`,
        value: `Will set the time zone for you to "-6".\n[Parameters can be swapped]`
    })
    .setFields('en', {
        name: `${comSet} timezone 3.5 605378869691940889`,
        value: `Set the time zone for the specified server (by id) to "3.5".\n[Parameters can be swapped]`
    })

    return details
}