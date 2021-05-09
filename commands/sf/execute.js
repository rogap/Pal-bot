/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes


module.exports = function(message, settings, command, contentParams) {
    return new Promise((resolve, reject) => {
        const userId = message.author.id
        const {lang} = settings

        return reject({
            err_msg: {
                ru: 'Команда в разработке.',
                en: 'The team is in development.'
            }
        })

        const params = contentParams.split(' ')
        const [nameOrId, pageOrFilter, page] = params
        if (pageOrFilter) {
            // хрень эта написана тут что бы если че сразу послать ошибку о не верно указаном параметре

            // если указана страница то она должна быть от 1 до 50
            // еще может быть так что передан ник (часть ника) для фильтра или же id для точной проверки
            // так же может быть третий параметр "page" в том случае если поиск по части ника выводит много страниц
        }
        command.getStats(userId, nameOrId)
    })
}