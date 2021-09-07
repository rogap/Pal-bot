/**
 * функция возвращающая обьект слеш-команды
 */


const _local = process._local


module.exports = () => {
    return {
        name: 'history',
        description: 'display match history',
        options: [
            {
                name: 'nickname',
                description: 'nickname or id',
                type: 3
            },
            {
                name: 'queue',
                description: 'select to filter game queue',
                type: 3,
                choices: [
                    {
                        name: 'all',
                        value: 'all'
                    },
                    {
                        name: 'ranked',
                        value: 'ranked'
                    },
                    {
                        name: 'siege',
                        value: 'siege'
                    },
                    {
                        name: 'deathmatch',
                        value: 'deathmatch'
                    },
                    {
                        name: 'onslaught',
                        value: 'onslaught'
                    }
                ]
            },
            {
                name: 'role',
                description: 'filter in the champions role',
                type: 3,
                choices: [
                    {
                        name: 'all',
                        value: 'all'
                    },
                    {
                        name: 'damage',
                        value: 'damage'
                    },
                    {
                        name: 'support',
                        value: 'support'
                    },
                    {
                        name: 'frontline',
                        value: 'frontline'
                    },
                    {
                        name: 'flank',
                        value: 'flanker'
                    }
                ]
            },
            {
                name: 'page',
                description: 'select page stats',
                type: 3,
                choices: [
                    {
                        name: '1',
                        value: '1'
                    },
                    {
                        name: '2',
                        value: '2'
                    },
                    {
                        name: '3',
                        value: '3'
                    },
                    {
                        name: '4',
                        value: '4'
                    },
                    {
                        name: '5',
                        value: '5'
                    }
                ]
            },
            {
                name: 'fullinfo',
                description: 'show full info',
                type: 3,
                choices: [
                    {
                        name: 'True',
                        value: 'yes'
                    },
                    {
                        name: 'False',
                        value: 'no'
                    }
                ]
            }
        ]
    }
}