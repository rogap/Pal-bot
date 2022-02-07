/**
 * функция обрабатывающая слеш-команду
 */


const _local = process._local
const {config, classes} = _local


module.exports = async (interaction, settings, command) => {
    try {
        const userId = interaction.user.id
        const nameOrId = interaction.options.getString('nickname')
        const pageOpt = interaction.options.getString('page') || 1
        const roleOpt = interaction.options.getString('role')
        const queueOpt = interaction.options.getString('queue')
        const fullinfoOpt = interaction.options.getString('fullinfo')
        const fullinfo = fullinfoOpt == 'yes' ? '-f' : null

        const exe = await command.execute(userId, settings, command, nameOrId, pageOpt, null, roleOpt, queueOpt, fullinfo)
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
            log_msg: 'sh.slash'
        }
    }
}