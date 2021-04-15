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
        files: ['detail', 'draw'] // список файлов которые нужно будет загрузить для команды
        // возможно files стоит убрать и сделать просто загрузку всех файлов что там есть
        // правда в таком случае создание команды будет асинхронным что нам не нужно
    }
}