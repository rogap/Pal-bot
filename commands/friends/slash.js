/**
 * функция обрабатывающая слеш-команду
 */


const _local = process._local
const {config, classes} = _local


module.exports = async (interaction, settings, command) => {
    try {
        const userId = interaction.user.id
        const nameOrId = interaction.options.getString('nickname') || 'me'
        const pageOpt = interaction.options.getString('page') || 1
        const searchOpt = interaction.options.getString('search')

        const exe = await command.execute(userId, settings, command, nameOrId, pageOpt, searchOpt)
        return await interaction.editReply(exe)
    } catch(err) {
        console.log(JSON.stringify(err))
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'sf.slash'
        }
    }
}