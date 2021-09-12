/**
 * функция которая выполняет комнаду и отправляет результат пользователю (кнопки)
 */


const _local = process._local
const {client, config, classes, stegcloak, utils} = _local


module.exports = async (interaction, settings, command, hideObjInfo, branches=[], values=[]) => {
    try {
        const userId = interaction.user.id
        const guild = interaction.guild
        const guildId = guild ? guild.id : false
        const [typeValue, setFor, setValue=values[0]] = branches
        const setId = setFor == 'server' && guild ? guild.id : userId
        const nameOrId = hideObjInfo.params
        const optLang = typeValue == 'lang' ? setValue : null
        const optTimezone = typeValue == 'timezone' ? setValue : null

        const exe =  await command.execute(userId, guildId, settings, nameOrId, setFor, setId, optLang, optTimezone)
        const iter =  await interaction.editReply(exe)

        return {status: 1, name: 'set', interaction: iter}
    } catch(err) {
        if (err && (err.err_msg !== undefined || err.log_msg !== undefined)) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'set.buttonExecute'
        }
    }
}