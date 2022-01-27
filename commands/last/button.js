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
        const matchDate = values[0] ? values[0] : ''
        const [matchId, num] = matchDate.split('_')
        const userNameOrId = hideObjInfo.params

        const [type, val] = branches
        const nextNum = val || num
        // console.log(nextNum)
        const matchNumber = (type == 'next' ? +nextNum + 1 : type == 'prev' ? nextNum - 1 : nextNum) || 1
        // const matchNumber = (type == 'next' ? +num + 1 : num - 1) || 1
        // console.log(branches, values)

        const exe =  await command.execute(userId, settings, command, userNameOrId, matchId, matchNumber)
        const iter =  await interaction.editReply(exe)

        return {
            status: 1,
            name: 'sm',
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
            log_msg: 'sm.button'
        }
    }
}