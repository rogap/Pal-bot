/**
 * отвечает за загрузку всех дефолтных настроек команд
 */


const path = require('path')


module.exports = {
    ss: {
        name: 'ss',
        possibly: ['ss', 'стата'],
        order: 5,
        permissions: ["SEND_MESSAGES", "ATTACH_FILES"],
        owner: false,
        path: path.join(__dirname, 'ss'),
        params(_prop) { // возвращает массив нужных параметров для команды
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
        files: ['detail', 'draw'] // список файлов которые нужно будет загрузить для команды
        // возможно files стоит убрать и сделать просто загрузку всех файлов что там есть
        // правда в таком случае создание команды будет асинхронным что нам не нужно
    }
}