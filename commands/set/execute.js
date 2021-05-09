/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {client, config} = _local


module.exports = async function(message, settings, command, contentParams) {
    return new Promise(async (resolve, reject) => {
        try {
            const userId = message.author.id
            const prop = settings.getProp()
            const {lang} = prop

            const [firstParam, secondParam, thirdParam] = contentParams.split(' ')
            const types = {
                lang: ['lang', 'язык'],
                timezone: ['timezone', 'time', 'время']
            }

            const guildId = firstParam && firstParam.length > 17 && firstParam.length < 21 ? firstParam :
                secondParam && secondParam.length > 17 && secondParam.length < 21 ? secondParam :
                thirdParam && thirdParam.length > 17 && thirdParam.length < 21 ? thirdParam : undefined

            const setId = guildId ? guildId : userId

            const setFor = guildId === undefined ? 'user' : // если не указан guildId то автоматом считает что настройки для себя
                firstParam === 'me' ? 'user' : secondParam === 'me' ? 'user' : thirdParam === 'me' ? 'user' : 'guild'

            const typeValue = types.find((typeName, typeList) => {
                return typeList.find(type => type === firstParam || type === secondParam || type === thirdParam) ? typeName : false
            })

            const setValue = typeValue === 'lang' ?
                    firstParam && firstParam.length === 2 && !isFinite(firstParam) && firstParam !== 'me' ? firstParam :
                    secondParam && secondParam.length === 2 && !isFinite(secondParam) && secondParam !== 'me' ? secondParam :
                    thirdParam && thirdParam.length === 2 && !isFinite(thirdParam) && thirdParam !== 'me' ? thirdParam : false :
                typeValue === 'timezone' ?
                    isFinite(firstParam) && firstParam <= 14 && firstParam >= -12 ? (+firstParam).toFixed(1) :
                    isFinite(secondParam) && secondParam <= 14 && secondParam >= -12 ? (+secondParam).toFixed(1) :
                    isFinite(thirdParam) && thirdParam <= 14 && thirdParam >= -12 ? (+thirdParam).toFixed(1) : false : false

            // проверяем корректность данных
            const checkSetValue = typeValue === 'lang' ? config.langs.find(lang => lang == setValue) :
                typeValue === 'timezone' ? setValue >= -12 && setValue <= 14 : false

            console.log(`setFor: ${setFor}; guildId: ${guildId}; typeValue: ${typeValue}; setValue: ${setValue}; setId: ${setId}`)

            // если не указан тип то выводим ошибку
            if (!typeValue) return reject({
                err_msg: {
                    ru: `Должен быть указан "тип". Параметры команды: [${command.params.ru.join(', ')}]`,
                    en: `"Type" must be specified. Command parameters: [${command.params.ru.join(', ')}]`
                }
            })

            // если не указано (не найдено) значение типа то выводим ошибку
            if (!setValue) return reject({
                err_msg: {
                    ru: `Должно быть корректно указано "значение типа". Параметры команды: [${command.params.ru.join(', ')}]`,
                    en: `The "type value" must be correctly specified. Command parameters: [${command.params.ru.join(', ')}]`
                }
            })

            if (!checkSetValue) return reject({
                err_msg: {
                    ru: `Введены некорректные данные. Параметры команды: [${command.params.ru.join(', ')}]`,
                    en: `Incorrect data entered. Command parameters: [${command.params.ru.join(', ')}]`
                }
            })

            // если для сервера то проверяем является ли пользователь владельцем указанного сервера
            await checkOwnerServer(setFor, userId, setId) // проверяем (если нет то будет ошибка)

            // user or guild
            // user_id or guild_id
            // type set (lang or timezone)
            // value
            const body = await command.setData(userId, {
                typeFor: setFor,
                id: setId,
                typeValue,
                value: setValue
            })

            // console.log('body:', body)
            if (!body.status) return reject(body)

            // применяем изменения локально
            const SETTINGS = setFor === 'guild' ? _local.guildsSettings : _local.usersSettings
            const getSettings = SETTINGS.get(setId) // получаем настройки сервера или пользователя

            // если их нет то создаем
            if (!getSettings) {
                const newSettingsData = { // создаем обьект с дефолтными настройками
                    id: setId,
                    lang: config.lang,
                    timezone: config.timezone,
                    prefix: config.prefix,
                    backgrounds: config.backgrounds
                }
                newSettingsData[typeValue] = setValue // применяем новые
                SETTINGS.add(newSettingsData) // записываем в менеджер
            } else {
                // иначе применяем новые
                getSettings[typeValue] = setValue
            }
            settings = SETTINGS.get(setId) // поулчаем новые настройки, что бы сразу ответить на измененном языке

            // отправляем сообщение об успешности операции
            const sendResult = await message.sendCheckIn({
                ru: 'Настройки были успешно применены.',
                en: 'The settings have been applied successfully.'
            }[settings.lang])
            return resolve(sendResult)
        } catch(err) {
            if (err.err_msg !== undefined) return reject(err)
            // иначе другая ошибка, но поидее такой не должно быть
            throw err
        }
    })
}


async function checkOwnerServer(setFor, userId, guildId) {
    return new Promise((resolve, reject) => {
        if (setFor !== 'guild') return resolve(true)
        client.guilds.fetch(guildId)
        .then(guild => {
            if (!guild.ownerID == userId) {
                // ошибка, не является владельцем
                return reject({
                    err_msg: {
                        ru: `Вы не являетесь владельцем сервера ${guildId}. Только владелец сервера может изменять его настройки.`,
                        en: `You are not the owner of the server ${guildId}. Only the owner of the server can change its settings.`
                    }
                })
            } else {
                return resolve(true)
            }
        })
        .catch(err => {
            return reject({
                err,
                err_msg: {
                    ru: `Ошибка, сервер ${guildId} не найден.\nЕсли вы уверены что все указали верно то сообщите об этом на официальном сервере бота.`,
                    en: `Error, server ${guildId} was not found.\nIf you are sure that everything is correct, then report it on the official server of the bot.`
                }
            })
        })
    })
}