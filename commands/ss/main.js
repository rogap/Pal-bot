/**
 * Основной файл-скрипт команды собирающий всю команду воедино
 */


const _local = process._local
const Command = _local.classes.Command


module.exports = new Command({
    name: 'ss', // базовое название команды (техначеское - невозможно изменить)
    commands: ['ss', 'стата'], // другие имена команды (дефолтные)
    params(_prop) { // возвращает массив нужных мараметров для команды
        const {lang} = _prop
        return {
            ru: ["?Ник/id"],
            en: ["?Nickname/id"]
        }[lang]
    },
    info(_prop) { // возвращает базовую инфу о команде (для функции вывода всех команд)
        const {lang} = _prop
        return {
            ru: `Выводит общую статистику аккаунта.`,
            en: `Displays general account statistics.`
        }[lang]
    },
    detail: require('./detail.js'), // функция возвращает обьект с данными (делальное описание команды), принимает _prop
    draw: require('./draw.js'), // функция рисования на холсте - возвращает обьект с данными
    owner: false, // для админа?
    permissions: ["SEND_MESSAGES", "ATTACH_FILES"], // права
    order: 5 // порядок в показе (help)
})

// возможно стоит будет забиндить this для функций info, detail, draw, params (или там лучше сделать стрелочные функции)