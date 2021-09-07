/**
 * функция которая получает данные статистик и обрабатывает возможные ошибки связанные с этим
 */


const _local = process._local


module.exports = async (userId, nameOrId) => {
    try {
        const fetchSearchplayers = await _local.hirez.searchplayers(nameOrId)
        if (!fetchSearchplayers.status) throw fetchSearchplayers
        const searchplayers = fetchSearchplayers.data // если данных нет то ничего страшного

        return {
            searchplayers: {
                lastUpdate: fetchSearchplayers.lastUpdate,
                data: searchplayers,
                old: fetchSearchplayers.old
            },
            status: true
        }
    } catch(err) {
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'se.getStats'
        }
    }
}