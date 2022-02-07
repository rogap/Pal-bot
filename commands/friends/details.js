/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes
 
 
module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comSf = command.possibly[0]
    const comMe = commands.getByName('me').possibly[0]
    const expleName = config.example.name
    const expleId = config.example.id

    const details = new Details(command)
    .setDescription({
        ru: `[${comSf} ?"Ник/id", ^?"Поиск", *^?"Страница"]`,
        en: `[${comSf} ?"Nickname/id", ^?"Search", ^?"Page"]`
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
            ru: 'Поиск',
            en: 'Search'
        },
        value: {
            ru: [
                `Позволяет отфильтровать по указанному слову;`,
                `1. [Часть слова для поиска]: "xxx", "text";`
            ],
            en: [
                `Allows you to filter by the specified word;`,
                `1. [Part of the search word]: "xxx", "text";`
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
    .setExample(`${prefix + comSf}`, `${prefix + comSf} ${expleId}`, `${prefix + comSf} ${expleName} 3`, `${prefix + comSf} ${expleName} ex`)

    return details
}