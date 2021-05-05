/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes
 
 
module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comSp = prefix + command.possibly[0]
    const comMe = commands.getByName('me').possibly[0]
    const expleName = config.example.name
    const expleId = config.example.id

    const details = new Details()
    .setTitle('ru', `\`${command.name}\` - ${command.info.ru}\nПримеры:`)
    .setFields('ru', {
        name: `${comSp}`,
        value: `Использует ваш сохраненный никнейм.\n[Если вы его записывали командой "${comMe}"]`
    })
    .setFields('ru', {
        name: `${comSp} me`,
        value: `[Работает аналогично "${comSp}". Можно комбинировать и менять местами]`
    })
    .setFields('ru', {
        name: `${comSp} ${expleName}`,
        value: `Возвращает статус игрока указанного никнейма.\n[Только ПК. Можно комбинировать и менять местами]`
    })
    .setFields('ru', {
        name: `${comSp} @DiscordUser`,
        value: `Использует сохраненный никнейм того кого вы упомянули.\n[Если он записывал свой никнейм командой "${comMe}". Можно комбинировать и менять местами]`
    })
    .setFields('ru', {
        name: `${comSp} ${expleId}`,
        value: `Возвращает статус игрока указанного Id игрока.\n[Лучший способ. Можно комбинировать и менять местами]`
    })
    .setFields('ru', {
        name: `${comSp} me -f`,
        value: `Позволяет вывести дополнительную информацию.\n[Можно комбинировать и менять местами]`
    })
    .setTitle('en', `\`${command.name}\` - ${command.info.en}\nExamples:`)
    .setFields('en', {
        name: `${comSp}`,
        value: `Uses your saved nickname.\n[If you recorded it with the command "${comMe}"]`
    })
    .setFields('en', {
        name: `${comSp} me`,
        value: `[Works similarly "${comSp}". Can be combined and swapped]`
    })
    .setFields('en', {
        name: `${comSp} ${expleName}`,
        value: `Returns the player's status for the specified nickname.\n[PC only. Can be combined and swapped]`
    })
    .setFields('en', {
        name: `${comSp} @DiscordUser`,
        value: `Uses the saved nickname of the one you mentioned.\n[Если он записывал свой никнейм командой "${comMe}". Can be combined and swapped]`
    })
    .setFields('en', {
        name: `${comSp} ${expleId}`,
        value: `Returns the player status of the specified player Id.\n[The best way. Can be combined and swapped]`
    })
    .setFields('en', {
        name: `${comSp} me -f`,
        value: `Allows to display additional information.\n[Can be combined and swapped]`
    })

    return details
}