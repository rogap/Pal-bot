/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes
 
 
module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comSm = command.possibly[0]
    const expleName = config.example.name
    const expleId = config.example.id

    const details = new Details(command)
    .setDescription({
        ru: `[${comSm} ^?"Пользователь", ^?"Матч по счету", ^?"Тип"]`,
        en: `[${comSm} ^?"User", ^?"Match by score", ^?"Type"]`
    })
    .setFields({
        name: {
            ru: 'Пользователь',
            en: 'User'
        },
        value: {
            ru: [
                `Получает статистику указанным способом;`,
                `1. [Подставить ваш сохраненнчй ник]: "me";`,
                `2. [Никнейм в игре]: "${expleName}";`,
                `3. [ID игрока]: "${expleId}";`,
                `4. [ID дискорда]: "510112915907543042";`,
                `5. [Упоминание дискорда]: "@DiscordUser";`,
                `6. [ID матча]: "1234567890";`
            ],
            en: [
                `Gets statistics in the specified way;`,
                `1. [Substitute your saved nickname]: "me";`,
                `2. [Nickname in the game]: "${expleName}";`,
                `3. [Player ID]: "${expleId}";`,
                `4. [Discord ID]: "510112915907543042";`,
                `5. [Discord mention]: "@DiscordUser";`,
                `6. [Match ID]: "1234567890";`
            ]
        }
    })
    .setFields({
        name: {
            ru: 'Матч по счету',
            en: 'Match by score'
        },
        value: {
            ru: [
                `Позволяет выбрать матч из истории матчей указав какой он по счету;`,
                `1. [Номер матча]: "2", "30";`
            ],
            en: [
                `Allows you to select a match from the match history by specifying what it is in the score;`,
                `1. [Match Number]: "2", "30";`
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
                `Позволяет вывести дополнительную информацию;`,
                `1. [Тип выдачи]: "-f";`
            ],
            en: [
                `Allows you to display additional information;`,
                `1. [Issue type]: "-f";`
            ]
        }
    })
    .setExample(`${prefix + comSm}`, `${prefix + comSm} 2 -f`, `${prefix + comSm} ${expleName} 15`)

    return details
}