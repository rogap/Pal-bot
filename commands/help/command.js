/**
 * функция обрабатывающая команду (устаревшие)
 */


// const _local = process._local


module.exports = async (message, settings, command, contentParams) => {
    try {
        const userId = message.author.id
        const exe = await command.execute(userId, settings, contentParams)
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
            log_msg: 'hh.command'
        }
    }
}