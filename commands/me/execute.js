/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local


module.exports = async (userId, settings, command, contentParams='') => {
    try {
        const {lang} = settings

        if ( /[\-\_]/.test(contentParams) ) throw {
            err: 'Попытка смотреть консольный ак',
            status: false,
            err_msg: {
                ru: `Консольные аккаунты доступны только по ID.\n=\nИспользуйте команду !search для поиска нужного аккаунта.`,
                en: `Console accounts are available only by ID.\n=\nUse the command !search to find the desired account.`
            }
        }

        if ( /[\`\~\!\@\#\$\%\^\&\*\(\)\=\+\[\]\{\}\;\:\'\"\\\|\?\/\.\>\,\< ]/.test(contentParams) ) throw {
            err: 'Введен не корректный ник',
            status: false,
            err_msg: {
                ru: `Введите корректный Ник или id аккаунта Paladins.`,
                en: `Enter the correct Nickname or Paladins account id.`
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
                    ru: 'У вас еще нет сохраненного ID.\n=\n' +
                        `Для сохранения ID воспользуйтесь командой !me 000000\nДля поиска ID воспользуйтесь командой !ss СвойНикВИгре`,
                    en: `You don't have a saved ID yet.\n=\n` +
                        `To save the ID, use the command !me 123456\nTo search for an ID, use the command !ss YourNicknameInGame`
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
        console.log(JSON.stringify(err))
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