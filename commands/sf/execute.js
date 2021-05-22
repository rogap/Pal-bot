/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes


module.exports = function(message, settings, command, contentParams) {
    return new Promise(async (resolve, reject) => {
        try {
            const userId = message.author.id
            const prop = settings.getProp()
            const {lang, timezone} = prop

            const params = contentParams.split(' ')
            const [firstParam, secondParam, thirdParam] = params

            /**
             * если есть thirdParam то firstParam полюбому должен указывать на пользователя с которого получить инфу нужно
             * 
             * если secondParam является числом то это указание страницы, firstParam в таком случае будет указывать на пользователя
             * 
             * если secondParam не число то page=1 и повторяем ситуацию 1
             * 
             * если secondParam не указан то получаем инфу самого пользователя и page=1
             * 
             * 
             * если 3 параметра:
             *      первый это пользователь
             *      второй или третий это search
             * 
             * если 2 параметра:
             *      первые это пользователь
             *      второй это page, если его нет то search
             * 
             * если 1 параметр:
             *      может быть page, тогда пользователь = me, в рпотивном случае пользователь = первому параметру
             */


            const page = thirdParam ? thirdParam : secondParam && isFinite(secondParam) && secondParam <= 50 ? secondParam : 
                firstParam && isFinite(firstParam) && firstParam <= 50 ? firstParam : false
            const pageShow = Math.floor(page) || 1

            const nameOrId = !secondParam && page ? 'me' : firstParam
            const search = thirdParam && page === thirdParam ? secondParam :
                thirdParam && page === secondParam ? thirdParam :
                secondParam && !page ? secondParam : false


            // const nameOrId = thirdParam || secondParam ? firstParam : isFinite(firstParam) && firstParam > 9999 ? firstParam : 'me'
            // const page = thirdParam ? thirdParam : secondParam && isFinite(secondParam) && secondParam <= 50 ? 
            //     secondParam : firstParam && isFinite(firstParam) && firstParam <= 50 ? firstParam : 1
            // const search = secondParam && !isFinite(secondParam) ? secondParam : false
            console.log(`nameOrId: ${nameOrId}; search: ${search}; pageShow: ${pageShow}`)

            const body = await command.getStats(userId, nameOrId)
            // console.log(body, body.getfriends.json.length)
            const {getfriends} = body
            const accaunts = getfriends.json || []
            // console.log(accaunts.length, accaunts)
            const friends = accaunts.filter(user => {
                const name = user.name || ''
                const id = user.player_id || ''
                // с учетом сортировки, если есть
                const reg = new RegExp(`${search}`, 'i')
                if (search) return user.status === 'Friend' && (name.match(reg) || (id+'').match(search))
                return user.status === 'Friend' // без учета сортирвоки
            })

            if (!friends.length) return reject({
                err_msg: {
                    ru: `Друзья не найдены.`,
                    en: `No friends found.`
                }
            })

            const pageCount = Math.ceil( friends.length / 20 )
            if ( pageCount < pageShow ) return reject({
                err_msg: {
                    ru: `У пользователя ${pageCount} страниц.`,
                    en: `The user has ${pageCount} pages.`
                }
            })

            let answerText = {
                ru: `\`\`\`md\n# Всего ${friends.length} друзей (${pageCount} страниц)\n[id](name)<portal flag>\n> >\n`,
                en: `\`\`\`md\n# Total ${friends.length} friends (${pageCount} pages)\n[id](name)<portal flag>\n> >\n`
            }[lang]
            for (let i = 0 + (pageShow - 1) * 20; friends.length > i && i < 20 * pageShow; i++) {
                const user = friends[i]
                const portal = config.platforms[user.portal_id] || user.portal_id
                const flag = user.friend_flags == 1 ? {ru: 'в друзьях', en: 'in friends'}[lang] :
                    user.friend_flags == 2 ? {ru: 'исходящая заявка', en: 'outgoing request'}[lang] : user.friend_flags

                answerText += `${i + 1}. [${user.player_id}](${user.name})<${portal} ${flag}>\n`
            }

            if (friends.length > 20) {
                answerText += {
                    ru: `> >\n# Показаны не все друзья. Страница ${pageShow} из ${pageCount}\n`,
                    en: `> >\n# Not all friends are shown. Page ${pageShow} of ${pageCount}\n`
                }[lang]
            }
            const time = getfriends.last_update.updateToDate(timezone).toText()
            const timeUpdate = getfriends.last_update.getNextUpdate('getfriends', timezone)
            answerText += {
                ru: `> >\r\n* Друзья: ${time} | Обновится: ${timeUpdate} | timezone: ${timezone}`,
                en: `> >\r\n* Friends: ${time} | Updated: ${timeUpdate} | timezone: ${timezone}`
            }[lang]
            answerText += '```'

            const sendResult = await message.channel.send(`${message.author}${answerText}`)
            return resolve(sendResult)
        } catch(err) {
            if (err && err.err_msg !== undefined) return reject(err)
            return reject({
                err,
                err_msg: {
                    ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                    en: 'Something went wrong... Try again or report this error to the bot creator.'
                },
                log_msg: 'sf.execute'
            })
        }
    })
}