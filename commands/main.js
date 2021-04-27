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
        files: ['execute'] // список файлов которые нужно будет загрузить для команды
    },
    me: {
        name: 'me',
        possibly: ['me'],
        order: 2,
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(__dirname, 'me'),
        params: {
            ru: ['Ник/id'],
            en: ['Nickname/id']
        },
        info: {
            ru: `Сохраняет ваш никнейм для автоматической подстановки его в другие команды.`,
            en: `Saves your nickname for automatic substitution in other commands.`
        },
        files: ['details', 'getStats', 'execute']
    },
    ss: {
        name: 'ss',
        possibly: ['ss', 'стата'],
        order: 3,
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(__dirname, 'ss'),
        params: {
            ru: ['Ник/id'],
            en: ['Nickname/id']
        },
        info: {
            ru: `Выводит общую статистику аккаунта.`,
            en: `Displays general account statistics.`
        },
        files: ['details', 'draw', 'getStats', 'execute']
    }
}