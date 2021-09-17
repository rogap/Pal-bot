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


module.exports = async function(userId, nameOrId, matchId, matchNumber=1) {
    try {
        if (matchId) {
            const fetchGetmatchdetails = await _local.hirez.getmatchdetails(matchId)
            if (!fetchGetmatchdetails.status) throw fetchGetmatchdetails
            const getmatchdetails = fetchGetmatchdetails.data // если данных нет то ничего страшного

            return {
                getmatchdetails: {
                    lastUpdate: fetchGetmatchdetails.lastUpdate,
                    data: getmatchdetails,
                    old: fetchGetmatchdetails.old
                },
                status: true
            }
        }

        const typeData = parse(nameOrId) // тип данных
        let userSavedData = null // сохраненыне данные из БД

        if (typeData == 'me') {
            const model = _local.models.usersNicknames
            userSavedData = ( await model.find({id: userId}) )[0]
        }

        if (typeData == 'match') { // если есть id матча то сразу поулчаем его
            const fetchGetmatchdetails = await _local.hirez.getmatchdetails(nameOrId)
            if (!fetchGetmatchdetails.status) throw fetchGetmatchdetails

            const getmatchdetails = fetchGetmatchdetails.data // если данных нет то ничего страшного

            return {
                getmatchdetails: {
                    lastUpdate: fetchGetmatchdetails.lastUpdate,
                    data: getmatchdetails
                },
                playerId: 'me',
                playerName: 'me',
                status: true
            }
        }

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
                ru: `У пользователя нет сохраненного никнейма.`,
                en: `The user does not have a saved nickname.`
            }
        }

        if (!playerId) { // если нет id то делаем запрос для получения id
            const fetchGetplayer = await _local.hirez.getplayer(playerName)
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
        }

        const fetchGetmatchhistory = await _local.hirez.getmatchhistory(playerId)
        if (!fetchGetmatchhistory.status) throw fetchGetmatchhistory

        const getmatchhistory = fetchGetmatchhistory.data // если данных нет то ничего страшного
        const match = getmatchhistory[matchNumber-1]

        if (!match) throw {
            status: false,
            err_msg: {
                ru: `Матч ${matchNumber} не найден, всего ${getmatchhistory.length} матчей`,
                en: `Match ${matchNumber} not found, total ${getmatchhistory.length} matches`
            }
        }

        matchId = match.Match
        const fetchGetmatchdetails = await _local.hirez.getmatchdetails(matchId)
        if (!fetchGetmatchdetails.status) throw fetchGetmatchdetails
        const getmatchdetails = fetchGetmatchdetails.data // если данных нет то ничего страшного

        return {
            getmatchdetails: {
                lastUpdate: fetchGetmatchdetails.lastUpdate,
                data: getmatchdetails,
                old: fetchGetmatchdetails.old
            },
            playerId,
            playerName,
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
            log_msg: 'sm.getStats'
        }
    }
}