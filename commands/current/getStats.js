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
    return 'unknown'
}


module.exports = async (userId, nameOrId) => {
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

        const fetchGetplayerstatus = await _local.hirez.getplayerstatus(playerId)
        if (!fetchGetplayerstatus.status) throw fetchGetplayerstatus

        const getplayerstatus = fetchGetplayerstatus.data
        const matchId = getplayerstatus[0].Match
        if (matchId) {
            const fetchGetmatchplayerdetails = await _local.hirez.getmatchplayerdetails(matchId)
            if (!fetchGetmatchplayerdetails.status) throw fetchGetmatchplayerdetails
            const getmatchplayerdetails = fetchGetmatchplayerdetails.data

            return {
                getplayerstatus: {
                    lastUpdate: getplayerstatus.lastUpdate,
                    json: getplayerstatus
                },
                getmatchplayerdetails: {
                    lastUpdate: getplayerstatus.lastUpdate,
                    json: getmatchplayerdetails
                },
                playerId,
                playerName,
                status: true
            }
        }

        return {
            getplayerstatus: {
                lastUpdate: getplayerstatus.lastUpdate,
                json: getplayerstatus
            },
            playerId,
            playerName,
            status: true
        }
    } catch(err) {
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'sp.getStats'
        }
    }
}