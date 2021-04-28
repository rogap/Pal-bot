/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes


module.exports = function(message, settings, command, contentParams) {
    return new Promise((resolve, reject) => {
        // должно отправлять в лс ембед сообщение с командами и их описанием
        // если написано не в лс то должно еще отправить сообщение о том что инфа в лс была отправлена
        const {lang, commands} = settings
        const chType = message.channel.type
        const toDM = chType == 'text' || chType == 'unknown' || chType == 'category'

        if (contentParams) {
            // проверяем есть ли такая команда
            // если есть параметры то вызываем функцию details указанной команды
            const com = commands.get(contentParams)
            if (!com) {
                message.channel.send(`Команда не найдена`)
                return resolve()
            }

            const details = com.details(settings, com)[lang]
            message.author.send(details)
            .then(mess => {
                if (toDM) {
                    message.sendCheckIn({
                        ru: 'Сообщение было отправлено вам в ЛС.',
                        en: 'A message has been sent to DM.'
                    }[lang])
                    .catch(err => {
                        // эту ошибку пробрасывать не нужно
                        console.log(err)
                    })
                }
                return resolve(mess)
            })
            .catch(err => {
                return reject({
                    err,
                    err_msg: {
                        ru: 'Ошибка отправки сообщения вам в ЛС.\nОткройте ЛС или напишите данную команду в ЛС.',
                        en: 'Error sending a message to you in DM.\nOpen DM or write this command in DM.'
                    }
                })
            })
        } else {
            // отправляем в лс
            let guildName = ''
            if (settings.type == 'guilds') guildName = `: ${message.guild.name}` // тут омжет быть ошибка - исправить
            const details = new Details()
            .setTitle('ru', `Список команд (${settings.type}${guildName}):`)
            .setTitle('en', `Commands list (${settings.type}${guildName}):`)

            commands.each(com => {
                if (com.owner) return; // пропускаем команды админа
                details.setFields('ru', {
                    name: `${com.possibly[0]}:`,
                    value: `${com.info.ru}\n[Синонимы команды: "${com.possibly.join('" "')}"]\n[Параметры: "${com.params.ru.join('" "')}"]`
                })
                .setFields('en', {
                    name: `${com.possibly[0]}:`,
                    value: `${com.info.en}\n[Synonyms commands: "${com.possibly.join('" "')}"]\n[Parameters: "${com.params.en.join('" "')}"]`
                })
            })

            details.ru.embed.description = `Префикс: **${settings.prefix}**`
            details.en.embed.description = `Prefix: **${settings.prefix}**`

            details.ru.content = config.news.ru
            details.en.content = config.news.en

            message.author.send(details[lang])
            .then(mess => {
                if (toDM) {
                    message.sendCheckIn({
                        ru: 'Сообщение было отправлено вам в ЛС.',
                        en: 'A message has been sent to DM.'
                    }[lang])
                    .catch(err => {
                        // эту ошибку пробрасывать не нужно
                        console.log(err)
                    })
                }
                return resolve(mess)
            })
            .catch(err => {
                return reject({
                    err,
                    err_msg: {
                        ru: 'Ошибка отправки сообщения вам в ЛС.\nОткройте ЛС или напишите данную команду в ЛС.',
                        en: 'Error sending a message to you in DM.\nOpen DM or write this command in DM.'
                    },
                    log_msg: 'Ошибка отправки....'
                })
            })
        }
    })
}