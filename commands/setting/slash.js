/**
 * функция обрабатывающая слеш-команду
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes


module.exports = async (interaction, settings, command) => {
    try {
        const userId = interaction.user.id
        const guild = interaction.guild
        const guildId = guild ? guild.id : false
        const {lang} = settings

        const optFor = interaction.options.getString('for')
        const optLang = interaction.options.getString('lang')
        const optTimezone = interaction.options.getString('timezone')

        const setFor = optFor == 'user' ? 'user' : 'server'
        const setId = setFor == 'server' && guild ? guild.id : userId
        // const typeValue = optType
        // const setValue = optValue

        // if ( (typeValue == 'lang' && (setValue != 'ru' && setValue != 'en')) ||
        //     (typeValue == 'timezone' && !isFinite(setValue))) throw {
        //     err_msg: {
        //         ru: 'Не верно указаны значения данных.',
        //         en: 'The data values are specified incorrectly.'
        //     }
        // }

        const exe = await command.execute(userId, guildId, settings, setFor, setId, optLang, optTimezone)
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
            log_msg: 'pal.slash'
        }
    }
}