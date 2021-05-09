/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes
 
 
module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comSl = command.possibly[0]
    const expleName = config.example.name
    const expleId = config.example.id

    const details = new Details(command)
    .setDescription({
        ru: `[${comSl} ?"Пользователь", *^"Чемпион", *^?"Номер колоды"]`,
        en: `[${comSl} ?"User", *^"Champion", *^?"Deck number"]`
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
            ru: 'Чемпион',
            en: 'Champion'
        },
        value: {
            ru: [
                `Чемпион, статистику которого требуется показать;`,
                `1. [Чемпион]: "androxus", "lex", "maeve"`
            ],
            en: [
                `The champion whose statistics you want to show;`,
                `1. [Чемпион]: "androxus", "lex", "maeve"`
            ]
        }
    })
    .setFields({
        name: {
            ru: 'Номер колоды',
            en: 'Deck number'
        },
        value: {
            ru: [
                `Выбирает колоду;`,
                `[Номер колоды]: "1", "4";`
            ],
            en: [
                `Selects a deck;`,
                `[Deck number]: "1", "4";`
            ]
        }
    })
    .setExample(`${prefix + comSl} androxus`, `${prefix + comSl} me lex`, `${prefix + comSl} ${expleName} maeve 3`)

    return details
}