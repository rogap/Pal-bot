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
    hh: {
        name: 'hh',
        possibly: ['hh'],
        order: 1,
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(__dirname, 'hh'),
        params: {
            ru: ['команда'],
            en: ['command']
        },
        info: {
            ru: 'Возвращает информацию о командах.',
            en: 'Returns information about commands.'
        },
        files: ['execute', 'details']
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
    },
    sf: {
        name: 'sf',
        possibly: ['sf'],
        order: 9,
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(__dirname, 'sf'),
        params: {
            ru: ['Ник/id', 'Страница'],
            en: ['Nickname/id', 'Page']
        },
        info: {
            ru: `Выводит список друзей в игре.`,
            en: `Displays a list of friends in the game.`
        },
        files: ['details', 'getStats', 'execute']
    },
    sb: {
        name: 'sb',
        possibly: ['sb'],
        order: 9,
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(__dirname, 'sb'),
        params: {
            ru: ['Ник/id', 'Страница'],
            en: ['Nickname/id', 'Page']
        },
        info: {
            ru: `Выводит список заблокированный игроков указанного аккаунта`,
            en: `Displays a list of blocked players for the specified account.`
        },
        files: ['details', 'getStats', 'execute']
    }
}