/**
 * функция возвращающая обьект слеш-команды
 */


const _local = process._local


module.exports = () => {
    return {
        name: 'friends',
        description: 'display friends players on game',
        options: [
            {
                name: 'nickname',
                description: 'nickname or id',
                type: 3
            },
            {
                name: 'page',
                description: 'go to the specified page (number 1-50)',
                type: 3
            },
            {
                name: 'search',
                description: 'enter the part of the nickname for the filter',
                type: 3
            }
        ]
    }
}