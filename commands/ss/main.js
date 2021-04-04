/**
 * Основной скрипт команды
 */


const _local = process._local
const Command = _local.classes.Command


module.exports = new Command({
    name: 'ss',
    commands: ['ss', 'стата'],
    params: {
        ru: ["?Ник/id"],
        en: ["?Nickname/id"]
    },
    info: require('./info.js'),
    detail: require('./detail.js'),
    draw: require('./draw.js'),
    owner: false,
    permissions: ["SEND_MESSAGES", "ATTACH_FILES"],
    order: 5
})