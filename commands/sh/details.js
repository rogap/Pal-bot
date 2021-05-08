/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes
 
 
module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comSh = command.possibly[0]
    const expleName = config.example.name
    const expleId = config.example.id

    const details = new Details(command)
    .setDescription({
        ru: `[${comSh} ?"Пользователь", ^?"Фильтр", ^?"Страница", ^?"Тип"]`,
        en: `[${comSh} ?"User", ^?"Filter", ^?"Page", ^?"Type"]`
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
                `5. [Упоминание дискорда]: "@DiscordUser";`
            ],
            en: [
                `Gets statistics in the specified way;`,
                `1. [Substitute your saved nickname]: "me";`,
                `2. [Nickname in the game]: "${expleName}";`,
                `3. [Player ID]: "${expleId}";`,
                `4. [Discord ID]: "510112915907543042";`,
                `5. [Discord mention]: "@DiscordUser";`
            ]
        }
    })
    .setFields({
        name: {
            ru: 'Фильтр',
            en: 'Filter'
        },
        value: {
            ru: [
                `Фильтрует по указанному типу;`,
                `1. [Режим игры]: "ranked", "siege", "deathmatch", "onslaught";`,
                `2. [Роли чемпионов]: "support", "flanker", "frontline", "damage";`,
                `3. [Конкретного чемпиона]: "Androxus", "Lex";`
            ],
            en: [
                `Filters by the specified type;`,
                `1. [Game mode]: "ranked", "siege", "deathmatch", "onslaught";`,
                `2. [Champion Roles]: "support", "flanker", "frontline", "damage";`,
                `3. [A specific champion]: "Androxus", "Lex";`
            ]
        }
    })
    .setFields({
        name: {
            ru: 'Страница',
            en: 'Page'
        },
        value: {
            ru: [
                `Позволяет показывать статистику другой страницы;`,
                `1. [Номер страницы]: "1", "5";`
            ],
            en: [
                `Allows to show statistics of another page;`,
                `1. [Номер страницы]: "1", "5";`
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
                `Allows to display additional information;`,
                `1. [Issue type]: "-f";`
            ]
        }
    })
    .setExample(`${prefix + comSh}`, `${prefix + comSh} me siege -f`, `${prefix + comSh} ${expleName} flanker ranked 2`)

    return details
}