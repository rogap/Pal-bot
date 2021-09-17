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
        const [firstParam, secondParam, thirdParam] = params

        //
        const userNameOrIdParam = (isFinite(firstParam) && firstParam.length > 6) || firstParam === 'me' || (/^[^0-9\-]/i.test(firstParam) && firstParam !== undefined) ? firstParam :
        (isFinite(secondParam) && secondParam.length > 6) || secondParam === 'me' || (/^[^0-9\-]/i.test(secondParam) && secondParam !== undefined) ? secondParam :
        (isFinite(thirdParam) && thirdParam.length > 6) || thirdParam === 'me' || (/^[^0-9\-]/i.test(thirdParam) && thirdParam !== undefined) ? thirdParam : 'me'

        const matchId = isFinite(userNameOrIdParam) && (userNameOrIdParam + '').length > 9 && (userNameOrIdParam + '').length < 15 ? userNameOrIdParam : null
        const userNameOrId = matchId ? 'me' : userNameOrIdParam

        // матч по счету в итории матчей (не всегда нужен будет)
        const matchNumber = isFinite(firstParam) && firstParam > 1 && firstParam < 51 ? Math.floor(firstParam) :
            isFinite(secondParam) && secondParam > 1 && secondParam < 51 ? Math.floor(secondParam) :
            isFinite(thirdParam) && thirdParam > 1 && thirdParam < 51 ? Math.floor(thirdParam) : 1

        const exe = await command.execute(userId, settings, command, userNameOrId, matchId, matchNumber)
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
            log_msg: 'sm.command'
        }
    }
}