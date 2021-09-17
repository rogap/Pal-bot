/**
 * функция обрабатывающая команду (устаревшие)
 */


const _local = process._local
const {config} = _local


module.exports = async (message, settings, command, contentParams) => {
    try {
        const userId = message.author.id
        const prop = settings.getProp()
        const {lang} = prop
        const [userNameOrId, typeSort] = contentParams.split(' ')

        const typeSortList = { // виды сортировок
            lvl: ['lvl', 'level', 'лвл', 'уровень'],
            winrate: ['winrate', 'винрейт'],
            time: ['time', 'время'],
            kda: ['kda', 'кда'],
            // match: ['match', 'matches', 'game', 'games', 'матч', 'матчи', 'игра', 'игры']
        }

        const getTypeSort = typeSort === undefined || typeSort === '' ? 'lvl' :
            typeSortList.find((typeName, typeList) => {
            return typeList.find(type => type === typeSort) ? typeName : false
        })

        if (!getTypeSort) throw {
            err_msg: {
                ru: 'Указан неверный тип сортировки.',
                en: 'Invalid sort type specified.'
            }
        }

        const exe = await command.execute(userId, settings, command, userNameOrId, getTypeSort)
        return await message.reply(exe)
    } catch(err) {
        console.log(JSON.stringify(err))
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'st.command'
        }
    }
}