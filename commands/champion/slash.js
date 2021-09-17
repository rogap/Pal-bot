/**
 * функция обрабатывающая слеш-команду
 */


const _local = process._local
const {config, classes} = _local


module.exports = async (interaction, settings, command) => {
    try {
        const {champions} = _local
        const {lang} = settings
        const userId = interaction.user.id
        const nameOrId = interaction.options.getString('nickname')
        const supportOpt = interaction.options.getString('support')
        const frontlineOpt = interaction.options.getString('frontline')
        const flankOpt = interaction.options.getString('flank')
        const damageOpt = interaction.options.getString('damage')
        
        const countParams = [supportOpt, frontlineOpt, flankOpt, damageOpt].filter(el => !!el)
        if (countParams.length > 1) return await interaction.editReply({
            ru: 'Вы должны выбрать только одного чемпиона.',
            en: 'You have to choose only one champion.'
        }[lang])

        const championName = supportOpt || frontlineOpt || flankOpt || damageOpt
        const champion = championName ? champions.getByAliases(championName) : null

        const exe = await command.execute(userId, settings, command, nameOrId, champion)
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