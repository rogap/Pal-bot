/**
 * отвечает за загрузку всех дефолтных настроек команд
 */


const _local = process._local
const path = require('path')


module.exports = {
    console: {
        name: 'console',
        possibly: ['console', 'con'],
        permissions: [],
        owner: true,
        path: path.join(_local.path, 'commands', 'console'),
        files: ['command'] // список файлов которые нужно будет загрузить для команды
    },
    pal: {
        name: 'pal',
        slashName: 'menu',
        possibly: ['pal', 'menu'],
        permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'pal'),
        params: {
            ru: ['?"Ник/id"'],
            en: ['?"Nickname/id"']
        },
        info: {
            ru: 'Меню команд',
            en: 'Command menu'
        },
        files: ['execute', 'details', 'command', 'button', 'slash', 'getSlash']
    },
    set: {
        name: 'set',
        slashName: 'setting',
        possibly: ['set', 'установить'],
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'set'),
        params: {
            ru: ['^"me/server id"', '^"Тип"', '^"Значение"'],
            en: ['^"me/server id"', '^"Type"', '^"Value"']
        },
        info: {
            ru: 'Меняет настройки языка и часового пояса.',
            en: 'Changes the settings of the language and the time zone.'
        },
        files: ['execute', 'details', 'setData', 'button', 'slash', 'getSlash', 'command']
    },
    hh: {
        name: 'hh',
        possibly: ['hh', 'помощь', 'help'],
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'hh'),
        params: {
            ru: ['?"команда"'],
            en: ['?"command"']
        },
        info: {
            ru: 'Возвращает информацию о командах.',
            en: 'Returns information about commands.'
        },
        files: ['details', 'command']
    },
    me: {
        name: 'me',
        slashName: 'me',
        possibly: ['me'],
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'me'),
        params: {
            ru: ['?"Ник/id"'],
            en: ['?"Nickname/id"']
        },
        info: {
            ru: `Сохраняет ваш никнейм для автоматической подстановки его в другие команды.`,
            en: `Saves your nickname for automatic substitution in other commands.`
        },
        files: ['details', 'getStats', 'execute', 'saveStats', 'command', 'slash', 'getSlash']
    },
    se: {
        name: 'se',
        slashName: 'search',
        possibly: ['se', 'поиск', 'search'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'se'),
        params: {
            ru: ['"Ник/id"'],
            en: ['"Nickname/id"']
        },
        info: {
            ru: `Поиск аккаунтов консолей и других платформ.`,
            en: `Search for accounts of consoles and other platforms.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'button', 'slash', 'command', 'getSlash']
    },
    ss: {
        name: 'ss',
        slashName: 'stats',
        // slashSub: new Set(['pc', 'player', 'steam']),
        possibly: ['ss', 'стата', 'stats'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'ss'),
        params: {
            ru: ['?"Ник/id"'],
            en: ['?"Nickname/id"']
        },
        info: {
            ru: `Выводит общую статистику аккаунта.`,
            en: `Displays general account statistics.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'button', 'slash', 'command', 'getSlash']
    },
    sh: {
        name: 'sh',
        slashName: 'history',
        possibly: ['sh', 'история', 'history'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'sh'),
        params: {
            ru: ['?"Ник/id"', '^?"Фильтр"', '^?"Страница"', '^?"Тип"'],
            en: ['?"Nickname/id"', '^?"Filter"', '^?"Page"', '^?"Type"']
        },
        info: {
            ru: `Выводит историю матчей указанного игрока.`,
            en: `Displays the match history of the specified player.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'button', 'command', 'slash', 'getSlash']
    },
    sm: {
        name: 'sm',
        slashName: 'last',
        possibly: ['sm', 'матч', 'match'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'sm'),
        params: {
            ru: ['^?"id матча/Ник/id"', '^?"Матч по счету"', '^?"Тип"'],
            en: ['^?"match id/Nickname/id"', '^?"Match count"', '^?"Type"']
        },
        info: {
            ru: `Выводит детали для указанного матча или последнего матча игрока.`,
            en: `Displays details for the specified match or the last match of a player.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'button', 'command', 'slash', 'getSlash']
    },
    sp: {
        name: 'sp',
        slashName: 'current',
        possibly: ['sp', 'сталкер', 'live'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'sp'),
        params: {
            ru: ['^?"Ник/id"', '^?"Тип"'],
            en: ['^?"Nickname/id"', '^?"Type"']
        },
        info: {
            ru: `Возвращает статус игрока в реальном времени.`,
            en: `Returns the player status in real time.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'button', 'command', 'slash', 'getSlash']
    },
    st: {
        name: 'st',
        slashName: 'champions',
        possibly: ['st', 'топ', 'top'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'st'),
        params: {
            ru: ['"Ник/id"', '"Тип сортировки"'],
            en: ['"Nickname/id"', '"Sorting type"']
        },
        info: {
            ru: `Выводит топ чемпионов с возможностью сортировки.`,
            en: `Displays top champions with sorting options.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'command', 'slash', 'getSlash', 'button']
    },
    sl: {
        name: 'sl',
        slashName: 'lodouts',
        possibly: ['sl', 'колода', 'deck'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'sl'),
        params: {
            ru: ['?"Ник/id"', '*^"Чемпион"', '*^?"Номер колоды"'],
            en: ['?"Nickname/id"', '*^"Champion"', '*^?"Deck number"']
        },
        info: {
            ru: `Выводит колоды игрока указанного чемпиона.`,
            en: `Displays the player decks of the specified champion.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'button', 'command', 'slash', 'getSlash']
    },
    sc: {
        name: 'sc',
        slashName: 'champion',
        possibly: ['sc', 'чемпион', 'champion'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'sc'),
        params: {
            ru: ['"Ник/id"', '*"Чемпион"'],
            en: ['"Nickname/id"', '*"Champion"']
        },
        info: {
            ru: `Выводит подробную статистику указанного чемпиона.`,
            en: `Displays detailed statistics for the specified champion.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'command', 'slash', 'getSlash', 'button']
    },
    sf: {
        name: 'sf',
        slashName: 'friends',
        possibly: ['sf', 'друзья', 'friends', 'friend'],
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'sf'),
        params: {
            ru: ['?"Ник/id"', '^?"Поиск"', '*^?"Страница"'],
            en: ['?"Nickname/id"', '^?"Search"', '*^?"Page"']
        },
        info: {
            ru: `Выводит список друзей в игре.`,
            en: `Displays a list of friends in the game.`
        },
        files: ['details', 'getStats', 'execute', 'command', 'button', 'slash', 'getSlash']
    }
}