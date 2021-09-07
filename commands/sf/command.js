/**
 * функция обрабатывающая команду (устаревшие)
 */


const _local = process._local
const {config} = _local


module.exports = async (message, settings, command, contentParams) => {
    try {
        const userId = message.author.id
        const {lang} = settings

        const params = contentParams.split(' ')
        const [firstParam, secondParam, thirdParam] = params

        /**
         * если есть thirdParam то firstParam полюбому должен указывать на пользователя с которого получить инфу нужно
         * 
         * если secondParam является числом то это указание страницы, firstParam в таком случае будет указывать на пользователя
         * 
         * если secondParam не число то page=1 и повторяем ситуацию 1
         * 
         * если secondParam не указан то получаем инфу самого пользователя и page=1
         * 
         * 
         * если 3 параметра:
         *      первый это пользователь
         *      второй или третий это search
         * 
         * если 2 параметра:
         *      первые это пользователь
         *      второй это page, если его нет то search
         * 
         * если 1 параметр:
         *      может быть page, тогда пользователь = me, в рпотивном случае пользователь = первому параметру
         */

        const page = thirdParam ? thirdParam : secondParam && isFinite(secondParam) && secondParam <= 50 ? secondParam : 
            firstParam && isFinite(firstParam) && firstParam <= 50 ? firstParam : false
        const pageShow = Math.floor(page) || 1

        const nameOrId = !secondParam && page ? 'me' : firstParam
        const search = thirdParam && page === thirdParam ? secondParam :
            thirdParam && page === secondParam ? thirdParam :
            secondParam && !page ? secondParam : false

        const exe = await command.execute(userId, settings, command, nameOrId, pageShow, search)
        return await message.reply(exe)
    } catch(err) {
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'sf.command'
        }
    }
}