/**
 * функция которая выполняет комнаду и отправляет результат пользователю (кнопки)
 */


const _local = process._local
const {client, config, classes, stegcloak, utils} = _local
const {Button, ButtonsManager} = classes
const {sendToChannel} = utils


module.exports = async (interaction, settings, command, hideObjInfo, branches, values=[]) => {
    try {
        const userId = interaction.user.id
        const prop = settings.getProp()
        const {lang, params} = prop
        const nameOrId = hideObjInfo.params
        const typeValue = new Set(branches)
        const pageShow = typeValue.has('page') ? values[0] : 1

        const exe =  await command.execute(userId, settings, command, nameOrId, pageShow)
        const iter =  await interaction.editReply(exe)

        return {
            status: 1,
            name: 'se',
            interaction: iter
        }
    } catch(err) {
        if (err && (err.err_msg !== undefined || err.log_msg !== undefined)) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'se.button'
        }
    }
}