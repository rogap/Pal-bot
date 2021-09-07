/**
 * функция возвращающая обьект слеш-команды
 */


const _local = process._local


module.exports = () => {
    return {
        name: 'current',
        description: 'current match',
        options: [
            {
                name: 'player',
                description: 'nickname or id',
                type: 3
            }
        ]
    }
}