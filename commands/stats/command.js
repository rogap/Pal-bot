/**
 * функция обрабатывающая команду (устаревшие)
 */


const _local = process._local
const {config} = _local


module.exports = async (message, settings, command, contentParams) => {
    try {
        const userId = message.author.id
        const params = contentParams.split(' ')
        const [nameOrId, modifierParam] = params
        const modifierList = ['-pc', '-steam'] // список доступных модификаторов
        const modifier = modifierList.find(mod => mod == modifierParam) || '-pc'

        const exe = await command.execute(userId, settings, command, nameOrId, modifier)
        return await message.reply(exe)
    } catch(err) {
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'ss.command'
        }
    }
}