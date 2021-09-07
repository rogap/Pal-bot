/**
 * функция возвращающая обьект слеш-команды
 */


const _local = process._local


module.exports = () => {
    return {
        name: 'search',
        description: 'search all players (console and computer)',
        options: [
            {
                name: 'nickname',
                description: 'nickname or id',
                type: 3,
                required: true
            }
        ]
    }
}