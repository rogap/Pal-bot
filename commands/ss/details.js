/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config} = _local
const {Details} = classes


module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comSs = prefix + command.possibly[0]
    const comMe = prefix + commands.getByName('me').possibly[0]
    const expleName = config.example.name
    const expleId = config.example.id

    const details = new Details()
    .setTitle('ru', `\`${command.name}\` - ${command.info.ru}\nПримеры:`)
    .setFields('ru', {
        name: `${comSs}:`,
        value: `Использует ваш сохраненный никнейм.\n[Если вы его записывали командой "${comMe}"]`
    })
    .setFields('ru', {
        name: `${comSs} me:`,
        value: `[Работает аналогично "${comSs}"]`
    })
    .setFields('ru', {
        name: `${comSs} ${expleName}:`,
        value: `Выводит статистику указанного никнейма.\n[Только ПК]`
    })
    .setFields('ru', {
        name: `${comSs} @DiscordUser:`,
        value: `Использует сохраненный никнейм того кого вы упомянули.\n[Если он записывал свой никнейм командой "${comMe}"]`
    })
    .setFields('ru', {
        name: `${comSs} 510112915907543042:`,
        value: `Использует сохраненный никнейм того чей Discord Id вы указали.\n[Если он записывал свой никнейм командой "${comMe}"]`
    })
    .setFields('ru', {
        name: `${comSs} ${expleId}:`,
        value: `Выводит статистику указанного Id игрока.\n[Лучший способ]`
    })
    .setTitle('en', `\`${command.name}\` - ${command.info.en}\nExamples:`)
    .setFields('en', {
        name: `${comSs}:`,
        value: `Uses your saved nickname.\n[If you recorded it with the command "${comMe}"]`
    })
    .setFields('en', {
        name: `${comSs} me:`,
        value: `[Works similarly "${comSs}"]`
    })
    .setFields('en', {
        name: `${comSs} ${expleName}:`,
        value: `Displays statistics for the specified nickname.\n[PC only]`
    })
    .setFields('en', {
        name: `${comSs} @DiscordUser:`,
        value: `Uses the saved nickname of the one you mentioned.\n[If he wrote down his nickname with the command "${comMe}"]`
    })
    .setFields('en', {
        name: `${comSs} 510112915907543042:`,
        value: `Uses the saved nickname of the one whose Discord Id you specified.\n[If he wrote down his nickname with the command "${comMe}"]`
    })
    .setFields('en', {
        name: `${comSs} ${expleId}:`,
        value: `Displays statistics for the specified player Id.\n[The best way]`
    })

    return details
}