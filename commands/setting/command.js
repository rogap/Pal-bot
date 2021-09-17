/**
 * функция обрабатывающая команду (устаревшие)
 */


const _local = process._local
const {config} = _local


module.exports = async (message, settings, command, contentParams) => {
    try {
        const userId = message.author.id
        const guild = message.guild
        const guildId_real = guild ? guild.id : false

        const [firstParam, secondParam, thirdParam] = contentParams.split(' ')
        const types = {
            lang: ['lang', 'язык'],
            timezone: ['timezone', 'time', 'время']
        }
        const langValues = { // сокращения языков
            ru: ['ru', 'rus', 'russian', 'русский', 'ру', 'рус'],
            en: ['en', 'eng', 'english']
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
                firstParam && langValues.find((langName, langList) => {
                    return langList.find(lang => lang === firstParam) ? langName : false
                }) ? langValues.find((langName, langList) => {
                    return langList.find(lang => lang === firstParam) ? langName : false
                }) :
                secondParam && langValues.find((langName, langList) => {
                    return langList.find(lang => lang === secondParam) ? langName : false
                }) ? langValues.find((langName, langList) => {
                    return langList.find(lang => lang === secondParam) ? langName : false
                }) :
                thirdParam && langValues.find((langName, langList) => {
                    return langList.find(lang => lang === thirdParam) ? langName : false
                }) ? langValues.find((langName, langList) => {
                    return langList.find(lang => lang === thirdParam) ? langName : false
                }) : false :
            typeValue === 'timezone' ?
                isFinite(firstParam) && firstParam <= 14 && firstParam >= -12 ? (+firstParam).toFixed(1) :
                isFinite(secondParam) && secondParam <= 14 && secondParam >= -12 ? (+secondParam).toFixed(1) :
                isFinite(thirdParam) && thirdParam <= 14 && thirdParam >= -12 ? (+thirdParam).toFixed(1) : false : false

        // проверяем корректность данных
        console.log(`setValue: ${setValue}`)
        const checkSetValue = typeValue === 'lang' ? config.langs.find(lang => lang == setValue) :
            typeValue === 'timezone' ? setValue >= -12 && setValue <= 14 : false

        console.log(`setFor: ${setFor}; guildId: ${guildId}; typeValue: ${typeValue}; setValue: ${setValue}; setId: ${setId}`)

        // если не указан тип то выводим ошибку
        if (!typeValue) throw {
            err_msg: {
                ru: `Должен быть указан "тип". Параметры команды: [${command.params.ru.join(', ')}]`,
                en: `"Type" must be specified. Command parameters: [${command.params.ru.join(', ')}]`
            }
        }

        // если не указано (не найдено) значение типа то выводим ошибку
        if (!setValue) throw {
            err_msg: {
                ru: `Должно быть корректно указано "значение типа". Параметры команды: [${command.params.ru.join(', ')}]`,
                en: `The "type value" must be correctly specified. Command parameters: [${command.params.ru.join(', ')}]`
            }
        }

        if (!checkSetValue) throw {
            err_msg: {
                ru: `Введены некорректные данные. Параметры команды: [${command.params.ru.join(', ')}]`,
                en: `Incorrect data entered. Command parameters: [${command.params.ru.join(', ')}]`
            }
        }

        const optLang = typeValue == 'lang' ? setValue : null
        const optTimezone = typeValue == 'timezone' ? setValue : null

        const exe = await command.execute(userId, guildId_real, settings, setFor, setId, optLang, optTimezone)
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
            log_msg: 'set.command'
        }
    }
}