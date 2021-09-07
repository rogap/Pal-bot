/**
 * функция возвращающая обьект слеш-команды
 */


const _local = process._local


module.exports = () => {
    return {
        name: 'me',
        description: 'save or show a nickname in the game',
        options: [{
            name: 'save',
            description: 'nickname or id',
            type: 3
        }]
    }
}