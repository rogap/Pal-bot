/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {classes} = _local
const {Details} = classes


module.exports = function(settings, command) {
    const {prefix} = settings
    const comSet = command.possibly[0]

    const details = new Details(command)
    .setDescription({
        ru: `[${comSet} ^"me/server id", ^?"Тип", ^?"Значение"]`,
        en: `[${comSet} ^"me/server id", ^?"Type", ^?"Value"]`
    })
    .setFields({
        name: {
            ru: 'me/server id',
            en: 'me/server id'
        },
        value: {
            ru: [
                `Указывает для кого будут применены настройки (для сервера или для вас);`,
                `1. [Сервер]: "605378869691940889";`,
                `2. [Себя]: "me";`
            ],
            en: [
                `Specifies for whom the settings will be applied (for the server or for you);`,
                `1. [Server]: "605378869691940889";`,
                `2. [Self]: "me";`
            ]
        }
    })
    .setFields({
        name: {
            ru: 'Тип',
            en: 'Type'
        },
        value: {
            ru: [
                `Указывает на то какий тип данных будет изменен;`,
                `1. [Язык]: "lang", "язык";`,
                `2. [Часовой пояс]: "timezone", "time", "время";`
            ],
            en: [
                `Indicates which data type will be changed;`,
                `1. [Language]: "lang";`,
                `2. [Time zone]: "timezone", "time";`
            ]
        }
    })
    .setFields({
        name: {
            ru: 'Значение',
            en: 'Value'
        },
        value: {
            ru: [
                `Значение которое будет подставленно для указанного типа;`,
                `1. [Язык]: "ru", "en";`,
                `2. [Часовой пояс]: "0", "-6", "3";`
            ],
            en: [
                `The value that will be substituted for the specified type;;`,
                `1. [Language]: "ru", "en";`,
                `2. [Time zone]: "0", "-6", "3";`
            ]
        }
    })
    .setExample(`${prefix + comSet} lang en`, `${prefix + comSet} me timezone -6`, `${prefix + comSet} 605378869691940889 lang ru`)

    return details
}