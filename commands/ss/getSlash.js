/**
 * функция возвращающая обьект слеш-команды
 */


const _local = process._local


module.exports = () => {
    return {
        name: 'stats',
        description: 'get player stats',
        options: [{
            name: 'nickname',
            description: 'nickname or id players',
            type: 3
        }]
    }
}