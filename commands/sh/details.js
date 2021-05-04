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
        name: `${comSh} 510112915907543042`,
        value: `Использует сохраненный никнейм того чей Discord Id вы указали.\n[Если он записывал свой никнейм командой "${comMe}"]`
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

    return details
}