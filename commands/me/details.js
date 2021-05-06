/**
 * функция возвращающая текст полного описания команды с примерами их работы
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes


module.exports = function(settings, command) {
    const {commands, prefix} = settings
    const comMe = prefix + command.possibly[0]
    const expleName = config.example.name
    const expleId = config.example.id

    const details = new Details()
    .setTitle('ru', `\`${command.name}\` - ${command.info.ru}\nПримеры:`)
    .setFields('ru', {
        name: `${comMe}`,
        value: `Выведет ваш сохраненный никнейм/id.`
    })
    .setFields('ru', {
        name: `${comMe} ${expleName}`,
        value: `Сохранит ваш никнейм для показа статистик.\n[Аналогично "${comMe} ${expleId}"]`
    })
    .setFields('ru', {
        name: `${comMe} ${expleId}`,
        value: `Сохранит ваш id для показа статистик.\n[Аналогично "${comMe} ${expleName}"]`
    })
    .setTitle('en', `\`${command.name}\` - ${command.info.en}\nExamples`)
    .setFields('en', {
        name: `${comMe}`,
        value: `Will display your saved nickname/id.`
    })
    .setFields('en', {
        name: `${comMe} ${expleName}`,
        value: `Save your nickname for showing statistics.\n[Likewise "${comMe} ${expleId}"]`
    })
    .setFields('en', {
        name: `${comMe} ${expleId}`,
        value: `Save your id for showing statistics.\n[Likewise "${comMe} ${expleName}"]`
    })

    return details
}