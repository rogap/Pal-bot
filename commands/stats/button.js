/**
 * функция которая выполняет комнаду и отправляет результат пользователю (кнопки)
 */


const _local = process._local
const {client, config, classes, stegcloak, utils} = _local
const {Button, ButtonsManager} = classes
const {sendToChannel} = utils


module.exports = async (interaction, settings, command, hideObjInfo, branches, values) => {
    try {
        const userId = interaction.user.id
        const prop = settings.getProp()
        const {lang, params} = prop

        // const prefConsole = params?.ss?.console || false
        const nowConsole = new Set(branches).has('console')
        // const changeConsole = prefConsole !== nowConsole // есть ли изменения в консоле

        // if (changeConsole) { // если есть изменения
        //     // тут нужно изменить кнопки и обновить данные в БД
        //     // а потом все равно запросить новую стату!

        //     // await settings.setParams('ss', 'console', nowConsole, userId) // обновляем данные локально и в БД
        //     // if (!settings.params.ss) settings.params.ss = {}
        //     // settings.params.ss.console = nowConsole // меняем данные в текущей переменной
        // }

        const nameOrId = hideObjInfo.params
        const exe = await command.execute(userId, settings, command, nameOrId, null, nowConsole)
        const iter = await interaction.editReply(exe)

        return {
            status: 1, // 1, потому что новая стата все равно запрашиваться будет
            name: 'ss',
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
            log_msg: 'ss.buttonExecute'
        }
    }
}