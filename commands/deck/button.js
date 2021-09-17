/**
 * функция которая выполняет комнаду и отправляет результат пользователю (кнопки)
 */


const _local = process._local
const {client, config, classes, utils} = _local
const {Button, ButtonsManager} = classes
const {sendToChannel} = utils


module.exports = async (interaction, settings, command, hideObjInfo, branches, values=[]) => {
    try {
        const {champions} = _local
        const userId = interaction.user.id
        const prop = settings.getProp()
        const {lang, params} = prop
        const userNameOrId = hideObjInfo.params
        const typeValue = new Set(branches)

        // const championOpt = typeValue.has('champion')
        const championName = values[0]
        const cardOpt = typeValue.has('card')
        const championId = cardOpt ? branches[2] : undefined
        const cardNum = cardOpt ? branches[1] : undefined

        const champion = cardOpt ? champions.getById(championId || '') : champions.getByName(championName || '')

        const exe = await command.execute(userId, settings, command, userNameOrId, champion, cardNum)
        const iter =  await interaction.editReply(exe)
        return {
            status: 1,
            name: 'sl',
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
            log_msg: 'sl.button'
        }
    }
}