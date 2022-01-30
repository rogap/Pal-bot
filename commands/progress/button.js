/**
 * функция которая выполняет комнаду и отправляет результат пользователю (кнопки)
 */


const _local = process._local
const {Discord, client, config, stegcloak} = _local
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (interaction, settings, command, hideObjInfo, branches, values) => {
    try {
        const userId = interaction.user.id
        const userNameOrId = hideObjInfo.params
        const typeValue = branches[0]

        const exe =  await command.execute(userId, settings, command, userNameOrId, typeValue)
        const iter =  await interaction.editReply(exe)

        return {
            status: 1,
            name: 'pr',
            interaction: iter
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
            log_msg: 'sh.button'
        }
    }
}