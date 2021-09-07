/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local


module.exports = async (userId, settings, command, contentParams='') => {
    try {
        const {lang, prefix} = settings
        const comHH = settings.commands.getByName('hh').possibly[0]
        const comME = command.possibly[0]

        if ( /[\`\~\!\@\#\$\%\^\&\*\(\)\=\+\[\]\{\}\;\:\'\"\\\|\?\/\.\>\,\< ]/.test(contentParams) 
            || (contentParams && isFinite(contentParams)) ) throw {
            err_msg: {
                ru: `Введите корректный Ник или id аккаунта Paladins.\n` +
                    `=Вы можете получить помощь на сервере бота, командой ${prefix}${comHH} или ${prefix}${comHH} ${comME}`,
                en: `Enter the correct Nickname or Paladins account id.\n` +
                    `=You can get help on the bot's server, by command ${prefix}${comHH} or ${prefix}${comHH} ${comME}`
            }
        }

        if (contentParams) {
            // делаем запрос статы проверяя есть ли такие данные и записываем если есть
            await command.saveStats(userId, contentParams)
            return {
                content: `:white_check_mark::white_check_mark::white_check_mark: \`\`\`yaml\n${{
                    ru: 'Ваш никнейм успешно записан!',
                    en: 'Your nickname has been successfully registered!'
                }[lang]}\`\`\``
            }
        } else {
            // получаем сохраненный ник и показываем его, если он есть
            const response = await command.getStats(userId)

            if (response.length > 1) console.log(`В БД usersNicknames ДАННЫХ БОЛЬШЕ ЧЕМ 1 - ${userId}`)

            const data = response[0]
            if (!data) throw { // если данных нет
                err_msg: {
                    ru: 'Ошибка получения - вы еще не сохранили свой никнейм.\n' +
                        `=Вы можете получить помощь на сервере бота, командой ${prefix}${comHH} или ${prefix}${comHH} ${comME}`,
                    en: `Receiving error - you haven't saved your nickname yet.\n` +
                        `=You can get help on the bot's server, by command ${prefix}${comHH} or ${prefix}${comHH} ${comME}`
                }
            }

            // если данные есть
            const replyText = {ru: `#Ваши сохраненные данные:\n`, en: `#Your saved data:\n`}
            if (data.name) (replyText.ru += `[Никнейм](${data.name}); `) && (replyText.en += `[Nicname](${data.name}); `)
            if (data.playerId) (replyText.ru += `[playerId](${data.playerId}); `) && (replyText.en += `[playerId](${data.playerId}); `)

            return {
                content: `\`\`\`md\n${replyText[lang]}\`\`\``
            }
        }
    } catch(err) {
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'me.execute'
        }
    }
}