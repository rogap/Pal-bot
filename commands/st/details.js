/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes
 
 
module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comSt = prefix + command.possibly[0]
    const comMe = commands.getByName('me').possibly[0]
    const expleName = config.example.name
    const expleId = config.example.id

    const details = new Details()
    .setTitle('ru', `\`${command.name}\` - ${command.info.ru}\nПримеры:`)
    .setFields('ru', {
        name: `${comSt}`,
        value: `Использует ваш сохраненный никнейм.\n[Если вы его записывали командой "${comMe}"]`
    })
    .setFields('ru', {
        name: `${comSt} me`,
        value: `[Работает аналогично "${comSt}"]`
    })
    .setFields('ru', {
        name: `${comSt} ${expleName}`,
        value: `Выводит статистику чемпионов указанного никнейма.\n[Только ПК]`
    })
    .setFields('ru', {
        name: `${comSt} @DiscordUser`,
        value: `Использует сохраненный никнейм того кого вы упомянули.\n[Если он записывал свой никнейм командой "${comMe}"]`
    })
    .setFields('ru', {
        name: `${comSt} ${expleId}`,
        value: `Выводит статистику чемпионов указанного Id игрока.\n[Лучший способ]`
    })
    .setFields('ru', {
        name: `${comSt} me winrate`,
        value: `Сортирует чемпионов перед выводом по указанному параметру.\n[Доступные параметры: "winrate", "lvl", "time", "kda"]`
    })
    .setTitle('en', `\`${command.name}\` - ${command.info.en}\nExamples:`)
    .setFields('en', {
        name: `${comSt}`,
        value: `Uses your saved nickname.\n[If you recorded it with the command "${comMe}"]`
    })
    .setFields('en', {
        name: `${comSt} me`,
        value: `[Works similarly "${comSt}"]`
    })
    .setFields('en', {
        name: `${comSt} ${expleName}`,
        value: `Displays statistics for the champions of the specified nickname.\n[PC only]`
    })
    .setFields('en', {
        name: `${comSt} @DiscordUser`,
        value: `Uses the saved nickname of the one you mentioned.\n[If he wrote down his nickname with the command "${comMe}"]`
    })
    .setFields('en', {
        name: `${comSt} ${expleId}`,
        value: `Displays the statistics of the champions of the specified Player Id.\n[The best way]`
    })
    .setFields('en', {
        name: `${comSt} me winrate`,
        value: `Sorts champions before displaying by the specified parameter.\n[The available options are: "winrate", "lvl", "time", "kda"]`
    })

    return details
}