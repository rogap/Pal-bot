/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes
 
 
module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comSm = prefix + command.possibly[0]
    const comMe = commands.getByName('me').possibly[0]
    const expleName = config.example.name
    const expleId = config.example.id

    const details = new Details()
    .setTitle('ru', `\`${command.name}\` - ${command.info.ru}\nПримеры:`)
    .setFields('ru', {
        name: `${comSm}`,
        value: `Использует ваш сохраненный никнейм.\n[Если вы его записывали командой "${comMe}"]`
    })
    .setFields('ru', {
        name: `${comSm} me`,
        value: `[Работает аналогично "${comSm}". Можно комбинировать и менять местами]`
    })
    .setFields('ru', {
        name: `${comSm} ${expleName}`,
        value: `Выводит статистику последнего матча указанного никнейма.\n[Только ПК. Можно комбинировать и менять местами]`
    })
    .setFields('ru', {
        name: `${comSm} @DiscordUser`,
        value: `Использует сохраненный никнейм того кого вы упомянули.\n[Если он записывал свой никнейм командой "${comMe}". Можно комбинировать и менять местами]`
    })
    .setFields('ru', {
        name: `${comSm} ${expleId}`,
        value: `Выводит статистику последнего матча указанного Id игрока.\n[Лучший способ. Можно комбинировать и менять местами]`
    })
    .setFields('ru', {
        name: `${comSm} 1234567890`,
        value: `Выводит статистику указанного id матча.\n[Лучший способ. Можно комбинировать и менять местами]`
    })
    .setFields('ru', {
        name: `${comSm} me -f`,
        value: `Позволяет вывести дополнительную информацию.\n[Можно комбинировать и менять местами]`
    })
    .setTitle('en', `\`${command.name}\` - ${command.info.en}\nExamples:`)
    .setFields('en', {
        name: `${comSm}`,
        value: `Uses your saved nickname.\n[If you recorded it with the command "${comMe}". Can be combined and swapped]`
    })
    .setFields('en', {
        name: `${comSm} me`,
        value: `[Works similarly "${comSm}". Can be combined and swapped]`
    })
    .setFields('en', {
        name: `${comSm} ${expleName}`,
        value: `Displays statistics for the last match of the specified nickname.\n[Только ПК. Can be combined and swapped]`
    })
    .setFields('en', {
        name: `${comSm} @DiscordUser`,
        value: `Uses the saved nickname of the one you mentioned.\n[Если он записывал свой никнейм командой "${comMe}". Can be combined and swapped]`
    })
    .setFields('en', {
        name: `${comSm} ${expleId}`,
        value: `Displays the statistics of the last match of the specified Player Id.\n[The best way. Can be combined and swapped]`
    })
    .setFields('en', {
        name: `${comSm} 1234567890`,
        value: `Displays statistics for the specified match id.\n[The best way. Can be combined and swapped]`
    })
    .setFields('en', {
        name: `${comSm} me -f`,
        value: `Allows to display additional information.\n[Can be combined and swapped]`
    })

    return details
}