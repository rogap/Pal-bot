/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes
 
 
module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comSt = command.possibly[0]
    const comMe = commands.getByName('me').possibly[0]
    const expleName = config.example.name
    const expleId = config.example.id

    const details = new Details(command)
    .setDescription({
        ru: `[${comSt} ?"Пользователь", ?"Фильтр"]`,
        en: `[${comSt} ?"User", ?"Filter"]`
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
                `1. [Уровень]: "lvl", "level", "лвл", "уровень";`,
                `2. [Винрейт]: "winrate", "винрейт";`,
                `3. [Длительность игры]: "time", "время";`,
                `4. [KDA]: "kda", "кда";`
            ],
            en: [
                `Filters by the specified type;`,
                `1. [Level]: "lvl", "level", "лвл", "уровень";`,
                `2. [Winrate]: "winrate", "винрейт";`,
                `3. [Duration of the game]: "time", "время";`,
                `4. [KDA]: "kda", "кда";`
            ]
        }
    })
    .setExample(`${prefix + comSt}`, `${prefix + comSt} me lvl`, `${prefix + comSt} ${expleName} winrate`)

    return details
}