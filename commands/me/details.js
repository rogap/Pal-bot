/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes


module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comMe = command.possibly[0]
    const comSh = prefix + commands.getByName('sh').possibly[0]
    const expleName = config.example.name
    const expleId = config.example.id

    const details = new Details(command)
    .setDescription({
        ru: `[${comMe} ?"Игрок"]`,
        en: `[${comMe} ?"Player"]`
    })
    .setFields({
        name: {
            ru: 'Игрок',
            en: 'Player'
        },
        value: {
            ru: [
                `Записывает указанные данные в базу и будет подставлять их в вашей статистике;`,
                `Это позволит пропускать ввод "никнейма / id" при запросе статистик других команд;`,
                `Если же ввод "никнейма / id" требуется обязательно в команде то вы можете вместо этого указать ключевое слово "me";`,
                `1. [Никнейм в игре]: "${expleName}";`,
                `2. [ID игрока]: "${expleId}";`
            ],
            en: [
                `Writes the specified data to the database and will substitute them in your statistics;`,
                `This will allow you to skip entering "nickname / id" when requesting statistics from other teams;`,
                `If entering "nickname / id" is required in the command, then you can specify the keyword "me" instead;`,
                `1. [Nickname in the game]: "${expleName}";`,
                `2. [Player ID]: "${expleId}";`
            ]
        }
    })
    .setExample(`${prefix + comMe}`, `${prefix + comMe} ${expleName}`, `${prefix + comMe} ${expleId}`, `=`, `${comSh}`, `${comSh} me siege`)

    return details
}