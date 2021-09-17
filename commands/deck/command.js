/**
 * функция обрабатывающая команду (устаревшие)
 */


const _local = process._local
const {config} = _local


module.exports = async (message, settings, command, contentParams) => {
    try {
        const {champions} = _local
        const userId = message.author.id
        const prop = settings.getProp()
        const {lang} = prop
        const params = contentParams.split(' ')
        // const [firstParam, secondParam, thirdParam,] = params
        const [nameOrId, championOfParam, number,] = params

        /**
         * если нет третьего параметра то:
         *  1. не указан ник, но указан чемпион и номер
         *  2. не указан номер но указан ник и чемпион
         *      если номер не найден среди параметров, то занчит первый параметр это ник, а второй это чемпион
         *      если номер найден, то вторым параметром из известных будет имя чемпиона
         * 
         * если есть только 1 параметр, то это полюбому должен быть чемпион
         * 
         * если указано 3 параметра то первым полюбому будет ник/id/me, а остальные 2 -> сначала найдем число
         */

        // const number = isFinite(firstParam) && firstParam > 0 && firstParam < 7 ? firstParam :
        // isFinite(secondParam) && secondParam > 0 && secondParam < 7 ? secondParam :
        // isFinite(thirdParam) && thirdParam > 0 && thirdParam < 7 ? thirdParam : undefined

        // const nameOrId = thirdParam !== undefined && thirdParam !== '' ? firstParam : // если есть все 3 параметра то первый 100% ник
        //     secondParam === undefined || secondParam === '' ? 'me' : // если есть только 1 параметр то он полюбому должен быть чемпионом
        //     number ? 'me' : firstParam

        // const championOfParam = firstParam !== number && firstParam !== nameOrId ? firstParam :
        //     secondParam !== number && secondParam !== nameOrId ? secondParam :
        //     thirdParam !== number && thirdParam !== nameOrId ? thirdParam : undefined

        // console.log(`nameOrId: ${nameOrId}; championOfParam: ${championOfParam}; number: ${number}`)
        const champion = championOfParam ? champions.getByAliases(championOfParam) : null

        const exe = await command.execute(userId, settings, command, nameOrId, champion, number)
        return await message.reply(exe)
    } catch(err) {
        console.log(JSON.stringify(err))
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'sl.command'
        }
    }
}