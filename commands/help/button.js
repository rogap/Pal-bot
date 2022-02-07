/**
 * функция которая выполняет комнаду и отправляет результат пользователю (кнопки)
 */


const _local = process._local
const path = require('path')


module.exports = async (interaction, settings, command, hideObjInfo, branches, values) => {
    try {
        const userId = interaction.user.id
        const prop = settings.getProp()
        const {lang} = prop
        const userNameOrId = hideObjInfo.params
        const commandNameForHelp = values ? values[0] : null

        if (!commandNameForHelp) {
            // то просто вызываем список команд
            const exe = await command.execute(userId, settings, userNameOrId)
            const iter = await interaction.editReply(exe)

            return {
                status: 1,
                name: 'help',
                interaction: iter
            }
        }
        // иначе это получение помощи по команде
        const com = settings.commands.get(commandNameForHelp)

        if (!com) {
            // неизвестная команда
        }

        const iter = await interaction.reply({
            ...com.details(settings, com)[lang],
            ephemeral: true,
            files: [path.join(_local.path, 'video', `${com.name}.mp4`)]
        })

        return {
            status: 1,
            name: 'help',
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
            log_msg: 'help.button'
        }
    }
}