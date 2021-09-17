/**
 * функция которая сохраняет данные статистик и обрабатывает возможные ошибки связанные с этим
 */


const _local = process._local


module.exports = async function(userId, contentParams) {
    try {
        const responseGetplayer = await _local.hirez.getplayer(contentParams)
        if (!responseGetplayer.status) throw responseGetplayer

        const getplayer = responseGetplayer.data[0]
        if (!getplayer) throw {
            status: false,
            err_msg: {
                ru: 'Аккаунт не найден.',
                en: 'The account was not found.'
            }
        }
        const playerId = getplayer.Id
        const name = getplayer.hz_player_name

        if (!playerId) throw {
            err_msg: {
                ru: 'Аккаунт скрыт.',
                en: 'The account is hidden.'
            }
        }

        const saveData = {id: userId, name, playerId}
        const model = _local.models.usersNicknames
        // проверяем есть ли данные уже в БД
        const oldData = await model.find({id: userId})

        if (oldData[0]) {
            // если данные есть то обновляем
            await model.findByIdAndUpdate(oldData[0]._id, saveData)
        } else {
            // если данных нет то сохраняем
            const save = await new model(saveData)
            await save.save()
        }

        return saveData
    } catch(err) {
        console.log(JSON.stringify(err))
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'me.saveStats'
        }
    }
}