/**
 * функция возвращающая обьект слеш-команды
 */


const _local = process._local


module.exports = () => {
    return {
        name: 'last',
        description: 'display last match',
        options: [
            {
                name: 'nickname',
                description: 'nickname or id',
                type: 3
            },
            {
                name: 'match',
                description: 'get match statistics by match id',
                type: 3
            },
            {
                name: 'count',
                description: 'specify which match in the history you want to get by the score',
                type: 3
            }
        ]
    }
}