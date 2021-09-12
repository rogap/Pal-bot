/**
 * функция возвращающая обьект слеш-команды
 */


const _local = process._local


module.exports = () => {
    return {
        name: 'menu',
        description: 'bot menu',
        options: [{
            name: 'for',
            description: 'user or player nickname/id',
            type: 3
        }]
    }
}