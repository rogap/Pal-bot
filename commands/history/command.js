/**
 * функция обрабатывающая команду (устаревшие)
 */


const _local = process._local
const {config} = _local


module.exports = async (message, settings, command, contentParams) => {
    try {
        const {champions} = _local
        const userId = message.author.id
        const prop = settings.getProp()
        const {lang} = prop
        const params = contentParams.split(' ')
        const [firstParam, secondParam, thirdParam, fourthParam] = params
        const modifierList = ['-f'] // список доступных модификаторов

        // Queue	"Team Deathmatch" | Queue	"Onslaught"
        const gameModeTypes = {
            ranked: ['ranked', 'ранкед'],
            siege: ['siege', 'казуал', 'обычка', 'осада'],
            deathmatch: ['tdm', 'тдм', 'deathmatch'],
            onslaught: ['onslaught', 'натиск']
        }
        const championRoles = {
            support: ['support', 'поддержка', 'sup', 'heal', 'хил', 'healer'],
            flanker: ['flanker', 'фланг', 'flank'],
            frontline: ['frontline', 'танк', 'tank'],
            damage: ['damage', 'урон', 'dmg']
        }

        // страница которую будем отображать
        const page = isFinite(firstParam) && firstParam > 0 && firstParam < 6 ? firstParam :
        isFinite(secondParam) && secondParam > 0 && secondParam < 6 ? secondParam :
        isFinite(thirdParam) && thirdParam > 0 && thirdParam < 6 ? thirdParam :
        isFinite(fourthParam) && fourthParam > 0 && fourthParam < 6 ? fourthParam : false

        const pageShow = prop.page = Math.floor(page) || 1

        // получаем модификатор
        const modifier = modifierList.find(mod => mod === firstParam || mod === secondParam || mod === thirdParam || mod === fourthParam) || false

        const errParams = {
            ru: `Не верно указаны параметры команды. Смотрите ${'!'}${'hh'} ${'sh'} - для получения детальной информации.`,
            en: `The command parameters are specified incorrectly. See ${'!'}${'hh'} ${'sh'} - for more detailed information.`
        }
        let userNameOrId, filterData

        if (fourthParam) {
            // если указано 4 параметра то первый параметр это пользователь, а ДРУГОЙ это тип фильтра

            userNameOrId = firstParam
            if (modifier === fourthParam) {
                if (page === thirdParam) {
                    filterData = secondParam
                } else if (page === secondParam) {
                    filterData = thirdParam
                } else {
                    // ERR
                    throw errParams
                }
            } else if (modifier === thirdParam) {
                if (page === fourthParam) {
                    filterData = secondParam
                } else if (page === secondParam) {
                    filterData = fourthParam
                } else {
                    // ERR
                    throw errParams
                }
            } else if (modifier === secondParam) {
                if (page === fourthParam) {
                    filterData = thirdParam
                } else if (page === thirdParam) {
                    filterData = fourthParam
                } else {
                    // ERR
                    throw errParams
                }
            } else {
                // ERR
                throw errParams
            }
        } else if (thirdParam) {
            /**
             * если указано 3 параметра:
             *      если указан page и modifier то ДРУГОЙ (первый) параметр это пользователь
             *      если указан page или modifier то первый параметр это пользователь, а ДРУГОЙ это тип фильтра
             */

            if (page && modifier) {
                userNameOrId = firstParam
            } else if (page || modifier) {
                userNameOrId = firstParam
                if (page === thirdParam || modifier === thirdParam) {
                    filterData = secondParam
                } else {
                    filterData = thirdParam
                }
            } else {
                // ERR
                throw errParams
            }
        } else if (secondParam) {
            /**
             * если указано 2 параметра:
             *      если есть page и modifier то пользователь равен ME
             *      если есть page или modifier то пользователь равен ДРУГОМУ
             *      если нет page и modifier то первый параметр это пользователь, а второй это тип фильтра
             */

            if (page && modifier) {
                userNameOrId = 'me'
            } else if (page || modifier) {
                userNameOrId = firstParam
            } else {
                userNameOrId = firstParam
                filterData = secondParam
            }
        } else if (firstParam) {
            /**
             * если указан 1 параметр:
             *      если это page или modifier то пользователь равен ME
             *      иначе пользователь равен этому параметру
             */

            if (page || modifier) {
                userNameOrId = 'me'
            } else {
                userNameOrId = firstParam
            }
        }

        // тип матча
        const modeType = filterData ? gameModeTypes.find((modeName, mode) => {
            return mode.find(type => type === filterData.toLowerCase()) ? modeName : false
        }) : false

        // имя чемпиона
        const championType = champions.getByAliases(filterData || '')

        // роль чемпиона
        const championRole = championRoles.find((roleName, roles) => {
            return roles.find(role => role === filterData) ? roleName : false
        })

        const exe = await command.execute(userId, settings, command, userNameOrId, pageShow, championType, championRole, modeType, modifier)
        return await message.reply(exe)
    } catch(err) {
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'sh.command'
        }
    }
}