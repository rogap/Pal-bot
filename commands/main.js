/**
 * отвечает за загрузку всех дефолтных настроек команд
 */


const _local = process._local
const path = require('path')


module.exports = {
    console: {
        name: 'console',
        video: true,
        possibly: ['console', 'con'],
        permissions: [],
        owner: true,
        path: path.join(_local.path, 'commands', 'console'),
        files: ['command'] // список файлов которые нужно будет загрузить для команды
    },
    menu: {
        name: 'menu',
        video: true,
        slashName: 'menu',
        possibly: ['menu', 'pal', 'меню', 'pal-bot', 'palbot'],
        permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'menu'),
        params: {
            ru: ['?"Ник/id"'],
            en: ['?"Nickname/id"']
        },
        info: {
            ru: 'Меню команд',
            en: 'Command menu'
        },
        files: ['execute', 'details', 'command', 'button', 'slash', 'getSlash'],
        emoji: '<:menu:943824092635758632>'
    },
    setting: {
        name: 'setting',
        video: true,
        slashName: 'setting',
        possibly: ['setting', 'set', 'установить'],
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'setting'),
        params: {
            ru: ['^"me/server id"', '^"Тип"', '^"Значение"'],
            en: ['^"me/server id"', '^"Type"', '^"Value"']
        },
        info: {
            ru: 'Меняет настройки языка и часового пояса.',
            en: 'Changes the settings of the language and the time zone.'
        },
        files: ['execute', 'details', 'setData', 'button', 'slash', 'getSlash', 'command'],
        emoji: '🛠️'
    },
    help: {
        name: 'help',
        possibly: ['help', 'помощь', 'hh'],
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'help'),
        canAll: true, // могут нажимать ан кнопки все (кроме меню)
        params: {
            ru: [''],
            en: ['']
        },
        info: {
            ru: 'Возвращает информацию о командах.',
            en: 'Returns information about commands.'
        },
        files: ['details', 'command', 'execute', 'button'],
        emoji: '❔'
    },
    me: {
        name: 'me',
        video: true,
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
    search: {
        name: 'search',
        video: true,
        slashName: 'search',
        possibly: ['search', 'поиск', 'se'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'search'),
        params: {
            ru: ['"Ник/id"'],
            en: ['"Nickname/id"']
        },
        info: {
            ru: `Поиск аккаунтов консолей и других платформ.`,
            en: `Search for accounts of consoles and other platforms.`
        },
        files: ['details', 'getStats', 'execute', 'button', 'slash', 'command', 'getSlash'],
        emoji: '<:search:943934321968951397>'
    },
    stats: {
        name: 'stats',
        video: true,
        slashName: 'stats',
        possibly: ['stats', 'стата', 'ss'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'stats'),
        params: {
            ru: ['?"Ник/id"'],
            en: ['?"Nickname/id"']
        },
        info: {
            ru: `Выводит общую статистику аккаунта.`,
            en: `Displays general account statistics.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'button', 'slash', 'command', 'getSlash'],
        emoji: '<:stats:943819417131839501>'
    },
    progress: {
        name: 'progress',
        slashName: 'progress',
        possibly: ['progress', 'прогресс', 'pr'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'progress'),
        params: {
            ru: ['?"Ник/id"'],
            en: ['?"Nickname/id"']
        },
        info: {
            ru: `Сравнивает текущую статистику игрока с сохраненной.`,
            en: `Compares the player's current statistics with the saved ones.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'button', 'command', 'slash', 'getSlash']
    },
    history: {
        name: 'history',
        video: true,
        slashName: 'history',
        possibly: ['history', 'история', 'sh'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'history'),
        params: {
            ru: ['?"Ник/id"', '^?"Фильтр"', '^?"Страница"', '^?"Тип"'],
            en: ['?"Nickname/id"', '^?"Filter"', '^?"Page"', '^?"Type"']
        },
        info: {
            ru: `Выводит историю матчей указанного игрока.`,
            en: `Displays the match history of the specified player.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'button', 'command', 'slash', 'getSlash'],
        emoji: '<:history:943818397009985597>'
    },
    last: {
        name: 'last',
        video: true,
        slashName: 'last',
        possibly: ['last', 'sm', 'матч', 'match'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'last'),
        params: {
            ru: ['^?"id матча/Ник/id"', '^?"Матч по счету"'],
            en: ['^?"match id/Nickname/id"', '^?"Match count"']
        },
        info: {
            ru: `Выводит детали для указанного матча или последнего матча игрока.`,
            en: `Displays details for the specified match or the last match of a player.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'button', 'command', 'slash', 'getSlash'],
        emoji: '<:match:943925118286069781>'
    },
    current: {
        name: 'current',
        video: true,
        slashName: 'current',
        possibly: ['current', 'sp', 'сталкер', 'live'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'current'),
        params: {
            ru: ['^?"Ник/id"', '^?"Тип"'],
            en: ['^?"Nickname/id"', '^?"Type"']
        },
        info: {
            ru: `Возвращает статус игрока в реальном времени.`,
            en: `Returns the player status in real time.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'button', 'command', 'slash', 'getSlash'],
        emoji: '<:current:943440471680753694>'
    },
    champions: {
        name: 'champions',
        video: true,
        slashName: 'champions',
        possibly: ['champions', 'st', 'топ', 'top'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'champions'),
        params: {
            ru: ['"Ник/id"', '"Тип сортировки"'],
            en: ['"Nickname/id"', '"Sorting type"']
        },
        info: {
            ru: `Выводит топ чемпионов с возможностью сортировки.`,
            en: `Displays top champions with sorting options.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'command', 'slash', 'getSlash', 'button'],
        emoji: '<:champions:943447650647310356>'
    },
    deck: {
        name: 'deck',
        video: true,
        slashName: 'lodouts',
        possibly: ['deck', 'колода', 'sl'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'deck'),
        params: {
            ru: ['?"Ник/id"', '*^"Чемпион"', '*^?"Номер колоды"'],
            en: ['?"Nickname/id"', '*^"Champion"', '*^?"Deck number"']
        },
        info: {
            ru: `Выводит колоды игрока указанного чемпиона.`,
            en: `Displays the player decks of the specified champion.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'button', 'command', 'slash', 'getSlash'],
        emoji: '<:cards:943453491907661845>'
    },
    champion: {
        name: 'champion',
        video: true,
        slashName: 'champion',
        possibly: ['champion', 'чемпион', 'sc'],
        permissions: ['SEND_MESSAGES', 'ATTACH_FILES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'champion'),
        params: {
            ru: ['"Ник/id"', '*"Чемпион"'],
            en: ['"Nickname/id"', '*"Champion"']
        },
        info: {
            ru: `Выводит подробную статистику указанного чемпиона.`,
            en: `Displays detailed statistics for the specified champion.`
        },
        files: ['details', 'draw', 'getStats', 'execute', 'command', 'slash', 'getSlash', 'button'],
        emoji: '<:champion:943440471601061888>'
    },
    friends: {
        name: 'friends',
        video: true,
        slashName: 'friends',
        possibly: ['friends', 'друзья', 'friend', 'sf'],
        permissions: ['SEND_MESSAGES'],
        owner: false,
        path: path.join(_local.path, 'commands', 'friends'),
        params: {
            ru: ['?"Ник/id"', '^?"Поиск"', '*^?"Страница"'],
            en: ['?"Nickname/id"', '^?"Search"', '*^?"Page"']
        },
        info: {
            ru: `Выводит список друзей в игре.`,
            en: `Displays a list of friends in the game.`
        },
        files: ['details', 'getStats', 'execute', 'command', 'button', 'slash', 'getSlash'],
        emoji: '<:friends:943449946428960798>'
    }
}