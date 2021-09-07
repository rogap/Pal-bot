/**
 * функция которая выполняет комнаду и отправляет результат пользователю (кнопки)
 */


const _local = process._local
const {client, config, classes, stegcloak, utils} = _local
const {Button, ButtonsManager} = classes
const {sendToChannel} = utils


module.exports = async (interaction, settings, command, hideObjInfo, branches, values=[]) => {
    try {
        const {champions} = _local
        const userId = interaction.user.id
        const prop = settings.getProp()
        const {lang, params} = prop
        const userNameOrId = hideObjInfo.params
        const championName = values ? values[0] : ''

        const champion = championName ? champions.getByAliases(championName) : null

        const exe =  await command.execute(userId, settings, command, userNameOrId, champion)
        const iter =  await interaction.editReply(exe)

        return {
            status: 1,
            name: 'sc',
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
            log_msg: 'sc.button'
        }
    }
}