/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes
 
 
module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comSh = prefix + command.possibly[0]
    const comMe = commands.getByName('me').possibly[0]
    const expleName = config.example.name
    const expleId = config.example.id

    const details = new Details()
    .setTitle('ru', `\`${command.name}\` - ${command.info.ru}\nПримеры:`)
    .setFields('ru', {
        name: `${comSh}`,
        value: `Использует ваш сохраненный никнейм.\n[Если вы его записывали командой "${comMe}"]`
    })
    .setFields('ru', {
        name: `${comSh} me`,
        value: `[Работает аналогично "${comSh}"]`
    })
    .setFields('ru', {
        name: `${comSh} ${expleName}`,
        value: `Выводит историю матчей указанного никнейма.\n[Только ПК]`
    })
    .setFields('ru', {
        name: `${comSh} @DiscordUser`,
        value: `Использует сохраненный никнейм того кого вы упомянули.\n[Если он записывал свой никнейм командой "${comMe}"]`
    })
    .setFields('ru', {
        name: `${comSh} ${expleId}`,
        value: `Выводит историю матчей указанного Id игрока.\n[Лучший способ]`
    })
    .setFields('ru', {
        name: `${comSh} me flank`,
        value: `Фильтрует историю по указанной роли.\n[Можно комбинировать и менять местами]`
    })
    .setFields('ru', {
        name: `${comSh} me androxus`,
        value: `Фильтрует историю по указанному чемпиону.\n[Можно комбинировать и менять местами]`
    })
    .setFields('ru', {
        name: `${comSh} me ranked`,
        value: `Фильтрует историю по типу поиска игры.\n[Можно комбинировать и менять местами]`
    })
    .setFields('ru', {
        name: `${comSh} me -f`,
        value: `Позволяет вывести дополнительную информацию.\n[Можно комбинировать и менять местами]`
    })
    .setTitle('en', `\`${command.name}\` - ${command.info.en}\nExamples:`)
    .setFields('en', {
        name: `${comSh}`,
        value: `Uses your saved nickname.\n[If you recorded it with the command "${comMe}"]`
    })
    .setFields('en', {
        name: `${comSh} me`,
        value: `[Works similarly "${comSh}"]`
    })
    .setFields('en', {
        name: `${comSh} ${expleName}`,
        value: `Displays the history of matches for the specified nickname.\n[PC only]`
    })
    .setFields('en', {
        name: `${comSh} @DiscordUser`,
        value: `Uses the saved nickname of the one you mentioned.\n[If he wrote down his nickname with the command "${comMe}"]`
    })
    .setFields('en', {
        name: `${comSh} ${expleId}`,
        value: `Displays the match history of the specified Player Id.\n[The best way]`
    })
    .setFields('en', {
        name: `${comSh} me flank`,
        value: `Filters history by the specified role.\n[Can be combined and swapped]`
    })
    .setFields('en', {
        name: `${comSh} me androxus`,
        value: `Filters the story by the specified champion.\n[Can be combined and swapped]`
    })
    .setFields('en', {
        name: `${comSh} me ranked`,
        value: `Filters history by game search type.\n[Can be combined and swapped]`
    })
    .setFields('en', {
        name: `${comSh} me -f`,
        value: `Allows to display additional information.\n[Can be combined and swapped]`
    })

    return details
}