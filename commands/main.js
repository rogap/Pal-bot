/**
 * отвечает за загрузку всех дефолтных настроек команд
 */


const path = require('path')


module.exports = {
    console: {
        name: 'console',
        possibly: ['console', 'con'],
        permissions: [],
        owner: true,
        path: path.join(__dirname, 'console'),
        files: ['execute'] // список файлов которые нужно будет загрузить для команды
    },
    pal: {
        name: 'pal',
        possibly: ['pal', 'menu'],
        permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'],
        owner: false,
        path: path.join(__dirname, 'pal'),
        params: {
            ru: ['?"Ник/id"'],
            en: ['?"Nickname/id"']
        },
        info: {
            ru: 'Меню команд',
            en: 'Command menu'
        },
        files: ['execute', 'details', 'buttonExecute', 'mainMenu']
    },
    set: {
        name: 'set',
        possibly: ['set', 'установить'],
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(__dirname, 'set'),
        params: {
            ru: ['^"me/server id"', '^"Тип"', '^"Значение"'],
            en: ['^"me/server id"', '^"Type"', '^"Value"']
        },
        info: {
            ru: 'Меняет настройки языка и часового пояса.',
            en: 'Changes the settings of the language and the time zone.'
        },
        files: ['execute', 'details', 'setData', 'buttonExecute']
    },
    hh: {
        name: 'hh',
        possibly: ['hh', 'помощь', 'help'],
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(__dirname, 'hh'),
        params: {
            ru: ['?"команда"'],
            en: ['?"command"']
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
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(__dirname, 'me'),
        params: {
            ru: ['?"Ник/id"'],
            en: ['?"Nickname/id"']
        },
        info: {
            ru: `Сохраняет ваш никнейм для автоматической подстановки его в другие команды.`,
            en: `Saves your nickname for automatic substitution in other commands.`
        },
        files: ['details', 'getStats', 'execute']
    },
    ss: {
        name: 'ss',
        possibly: ['ss', 'стата', 'stats'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(__dirname, 'ss'),
        params: {
            ru: ['?"Ник/id"'],
            en: ['?"Nickname/id"']
        },
        info: {
            ru: `Выводит общую статистику аккаунта.`,
            en: `Displays general account statistics.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'buttonExecute']
    },
    sh: {
        name: 'sh',
        possibly: ['sh', 'история', 'history'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(__dirname, 'sh'),
        params: {
            ru: ['?"Ник/id"', '^?"Фильтр"', '^?"Страница"', '^?"Тип"'],
            en: ['?"Nickname/id"', '^?"Filter"', '^?"Page"', '^?"Type"']
        },
        info: {
            ru: `Выводит историю матчей указанного игрока.`,
            en: `Displays the match history of the specified player.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'buttonExecute']
    },
    sm: {
        name: 'sm',
        possibly: ['sm', 'матч', 'match'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(__dirname, 'sm'),
        params: {
            ru: ['^?"id матча/Ник/id"', '^?"Матч по счету"', '^?"Тип"'],
            en: ['^?"match id/Nickname/id"', '^?"Match count"', '^?"Type"']
        },
        info: {
            ru: `Выводит детали для указанного матча или последнего матча игрока.`,
            en: `Displays details for the specified match or the last match of a player.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'buttonExecute']
    },
    sp: {
        name: 'sp',
        possibly: ['sp', 'сталкер', 'live'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(__dirname, 'sp'),
        params: {
            ru: ['^?"Ник/id"', '^?"Тип"'],
            en: ['^?"Nickname/id"', '^?"Type"']
        },
        info: {
            ru: `Возвращает статус игрока в реальном времени.`,
            en: `Returns the player status in real time.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'buttonExecute']
    },
    st: {
        name: 'st',
        possibly: ['st', 'топ', 'top'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(__dirname, 'st'),
        params: {
            ru: ['"Ник/id"', '"Тип сортировки"'],
            en: ['"Nickname/id"', '"Sorting type"']
        },
        info: {
            ru: `Выводит топ чемпионов с возможностью сортировки.`,
            en: `Displays top champions with sorting options.`
        },
        files: ['details', 'draw', 'getStats', 'execute']
    },
    sl: {
        name: 'sl',
        possibly: ['sl', 'колода', 'deck'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(__dirname, 'sl'),
        params: {
            ru: ['?"Ник/id"', '*^"Чемпион"', '*^?"Номер колоды"'],
            en: ['?"Nickname/id"', '*^"Champion"', '*^?"Deck number"']
        },
        info: {
            ru: `Выводит колоды игрока указанного чемпиона.`,
            en: `Displays the player decks of the specified champion.`
        },
        files: ['details', 'draw', 'getStats', 'execute']
    },
    sc: {
        name: 'sc',
        possibly: ['sc', 'чемпион', 'champion'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(__dirname, 'sc'),
        params: {
            ru: ['"Ник/id"', '*"Чемпион"'],
            en: ['"Nickname/id"', '*"Champion"']
        },
        info: {
            ru: `Выводит подробную статистику указанного чемпиона.`,
            en: `Displays detailed statistics for the specified champion.`
        },
        files: ['details', 'draw', 'getStats', 'execute']
    },
    sf: {
        name: 'sf',
        possibly: ['sf', 'дрезья', 'friends', 'friend'],
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(__dirname, 'sf'),
        params: {
            ru: ['?"Ник/id"', '^?"Поиск"', '*^?"Страница"'],
            en: ['?"Nickname/id"', '^?"Search"', '*^?"Page"']
        },
        info: {
            ru: `Выводит список друзей в игре.`,
            en: `Displays a list of friends in the game.`
        },
        files: ['details', 'getStats', 'execute']
    },
    sb: {
        name: 'sb',
        possibly: ['sb', 'blocks', 'block'],
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(__dirname, 'sb'),
        params: {
            ru: ['"Ник/id"', '"Страница"'],
            en: ['"Nickname/id"', '"Page"']
        },
        info: {
            ru: `Выводит список заблокированных игроков указанного аккаунта.`,
            en: `Displays a list of blocked players for the specified account.`
        },
        files: ['details', 'getStats', 'execute']
    },
    online: {
        name: 'online',
        possibly: ['online', 'онлайн'],
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(__dirname, 'online'),
        params: {
            ru: [],
            en: []
        },
        info: {
            ru: `Показывает количество игроков онлайн в стим.`,
            en: `Shows the number of players online in steam.`
        },
        files: ['execute', 'details']
    }
}