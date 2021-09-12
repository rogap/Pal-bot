/**
 * функция возвращающая обьект слеш-команды
 */


const _local = process._local


module.exports = () => {
    return {
        name: 'champions', // st
        description: 'top champions',
        type: 1,
        options: [
            {
                name: 'nickname',
                description: 'nickname or id',
                type: 3
            },
            {
                name: 'sorted',
                description: 'sorted by...',
                type: 3,
                choices: [
                    {
                        name: 'lvl',
                        value: 'lvl'
                    },
                    {
                        name: 'winrate',
                        value: 'winrate'
                    },
                    {
                        name: 'time',
                        value: 'time'
                    },
                    {
                        name: 'kda',
                        value: 'kda'
                    }
                ]
            }
        ]
    }
}