/**
 * функция которая получает данные статистик и обрабатывает возможные ошибки связанные с этим
 */


const _local = process._local


function parse(nameOrId) {
    if ( !nameOrId ) return false
    nameOrId = nameOrId += ''
    if ( nameOrId == 'me' ) return 'me'
    if ( !isFinite(nameOrId) ) return 'name'
    if ( nameOrId.length == 18 ) return 'discord'
    if ( nameOrId.length < 10 ) return 'player'
    if ( nameOrId.length > 9 ) return 'match'
    return 'unknown'
}


module.exports = async (userId, nameOrId, modifier) => {
    try {
        const typeData = parse(nameOrId) // тип данных
        let userSavedData = null // сохраненыне данные из БД

        if (!typeData || typeData == 'discord') { // получаем сохраненные данные с БД
            const model = _local.models.usersNicknames
            userSavedData = ( await model.find({id: nameOrId || userId}) )[0]
        }

        if (typeData == 'me') {
            const model = _local.models.usersNicknames
            userSavedData = ( await model.find({id: userId}) )[0]
        }

        let playerId = userSavedData?.playerId || (typeData == 'player' ? nameOrId : null)
        const playerName = userSavedData?.name || (typeData == 'name' ? nameOrId : null)

        if (!playerId && !playerName) throw {
            status: false,
            err_msg: {
                ru: `У пользователя нет сохраненного никнейма.\n=\nИспользуйте команду "!me ТвойНик" (без кавычек) что бы сохранить свой никнейм.`,
                en: `The user does not have a saved nickname.\n=\nUse the command "!me YourNickname" (without quotes) to save your nickname.`
            }
        }

        const fetchGetplayer = await _local.hirez.getplayer(playerId || playerName)
        if (!fetchGetplayer.status) throw fetchGetplayer

        const getplayer = fetchGetplayer.data[0]
        playerId = getplayer?.Id
        if (!getplayer || !playerId) throw {
            status: false,
            err_msg: {
                ru: 'Аккаунт скрыт.',
                en: 'The account is hidden.'
            }
        }

        const fetchGetchampionranks = await _local.hirez.getchampionranks(playerId)
        if (!fetchGetchampionranks.status) throw fetchGetchampionranks

        const getchampionranks = fetchGetchampionranks.data // если данных нет то ничего страшного

        return {
            getplayer: {
                lastUpdate: fetchGetplayer.lastUpdate,
                data: getplayer,
                old: fetchGetplayer.old
            },
            getchampionranks: {
                lastUpdate: fetchGetchampionranks.lastUpdate,
                data: getchampionranks,
                old: getchampionranks.old
            },
            status: true
        }
    } catch(err) {
        console.log(JSON.stringify(err))
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'ss.getStats'
        }
    }
}