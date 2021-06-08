/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes


module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comPal = prefix + command.possibly[0]
    const expleName = config.example.name
    const expleId = config.example.id

    const details = new Details(command)
    .setDescription({
        ru: `[${comPal} ?"Пользователь"]`,
        en: `[${comPal} ?"User"]`
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
    .setExample(`${prefix + comPal}`, `${prefix + comPal} me`, `${prefix + comPal} ${expleName}`)

    return details
}