/**
 * отвечает за загрузку всех дефолтных настроек команд
 */


const path = require('path')


module.exports = {
    console: {
        name: 'console',
        possibly: ['console', 'con'],
        order: 0,
        permissions: [],
        owner: true,
        path: path.join(__dirname, 'console'),
        files: ['execute']
    },
    ss: {
        name: 'ss',
        possibly: ['ss', 'стата'],
        order: 5,
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(__dirname, 'ss'),
        params: {
            ru: ['?Ник/id'],
            en: ['?Nickname/id']
        },
        info: {
            ru: `Выводит общую статистику аккаунта.`,
            en: `Displays general account statistics.`
        },
        files: ['details', 'draw', 'getStats', 'execute'] // список файлов которые нужно будет загрузить для команды
    }
}