/**
 * функция возвращающая обьект слеш-команды
 */


const _local = process._local


module.exports = () => {
    return {
        name: 'progress',
        description: `compares the player's current statistics with the saved ones.`,
        options: [{
            name: 'nickname',
            description: 'nickname or id players',
            type: 3
        }]
    }
}