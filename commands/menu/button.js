/**
 * функция обрабатывающая кнопки команды
 */


const _local = process._local


module.exports = async (interaction, settings, command, hideObjInfo, branches, values) => {
    try {
        const [commandName, commandBranch] = interaction.customId.split('_')
        const {lang} = settings
        const {owner, params} = hideObjInfo

        const exe = await command.execute(owner, settings, params)
        const iter = await interaction.editReply(exe)
        return {
            interaction: iter,
            status: 1,
            name: 'pal'
        }
    } catch(err) {
        console.log(JSON.stringify(err))
        if (err && (err.err_msg !== undefined || err.log_msg !== undefined)) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'pal.buttonExecute'
        }
    }
}