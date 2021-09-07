/**
 * функция которая получает данные статистик и обрабатывает возможные ошибки связанные с этим
 */


const _local = process._local


module.exports = async function(userId) {
    try {
        const model = _local.models.usersNicknames
        return await model.find({id: userId})
    } catch(err) {
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'me.getStats'
        }
    }
}