/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, classes} = _local
// const {Details} = classes


module.exports = function(message, settings, command, contentParams) {
    return new Promise((resolve, reject) => {
        // должно отправлять в лс ембед сообщение с командами и их описанием
        // если написано не в лс то должно еще отправить сообщение о том что инфа в лс была отправлена
        const {lang, commands} = settings
        const chType = message.channel.type
        const toPM = chType == 'text' || chType == 'unknown' || chType == 'category'

        if (contentParams) {
            // проверяем есть ли такая команда
            // если есть параметры то вызываем функцию details указанной команды
            const com = commands.get(contentParams)
            if (!com) return reject({
                err_msg: {
                    ru: 'Указанная команда не найдена.',
                    en: 'The specified command was not found.'
                }
            })

            const details = com.details(settings, com)[lang]
            message.author.send(details)
            .then(mess => {
                if (toPM) {
                    message.sendCheckIn({
                        ru: 'Сообщение было отправлено вам в ЛС.',
                        en: 'A message has been sent to PM.'
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
                        en: 'Error sending a message to you in PM.\nOpen PM or write this command in PM.'
                    }
                })
            })
        } else {
            // отправляем в лс
            let guildName = ''
            if (settings.type == 'guilds') guildName = `: ${message.guild.name}` // тут может быть ошибка - исправить
            const details = new Details()
            .setTitle('ru', `Список команд (${settings.type}${guildName}):`)
            .setTitle('en', `Commands list (${settings.type}${guildName}):`)

            commands.each(com => {
                if (com.owner) return; // пропускаем команды админа
                details.setFields('ru', {
                    name: `${com.possibly[0]}:`,
                    value: `${com.info.ru}\n[Синонимы команды: "${com.possibly.join('", "')}"]\n[Параметры: ${com.params.ru.join(', ')}]`
                })
                .setFields('en', {
                    name: `${com.possibly[0]}:`,
                    value: `${com.info.en}\n[Synonyms commands: "${com.possibly.join('", "')}"]\n[Parameters: ${com.params.en.join(', ')}]`
                })
            })

            details.ru.embed.description = `Префикс: **${settings.prefix}**`
            details.en.embed.description = `Prefix: **${settings.prefix}**`

            const contentRep = {
                ru: `Есть вопросы?, предложения? или хотите быть в курсе событий? - присоединяйтесь к серверу бота: ${config.discordInvate}`,
                en: `Any questions ?, suggestions? or want to keep abreast of events? - join the bot server: ${config.discordInvate}`
            }
            details.ru.content = `${config.news.ru}${contentRep.ru}`
            details.en.content = `${config.news.en}${contentRep.en}`

            message.author.send(details[lang])
            .then(mess => {
                if (toPM) {
                    message.sendCheckIn({
                        ru: 'Сообщение было отправлено вам в ЛС.',
                        en: 'A message has been sent to PM.'
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
                        en: 'Error sending a message to you in PM.\nOpen PM or write this command in PM.'
                    },
                    log_msg: `Ошибка отправки сообщения в лс ${message.author.id}`,
                    content: message.content
                })
            })
        }
    })
}

class Details { // временный фикс, потом перенесу, навреное
    constructor() {
        for (let lang in config.langs) {
            this[lang] = {
                embed: {
                    title: '',
                    fields: [],
                    footer: {
                        icon_url: config.emptyIcon,
                        text: config.copyText
                    }
                }
            }
        }
    }

    setTitle(lang, title) {
        this[lang].embed.title = title
        return this
    }

    setFields(lang, field) {
        field.value = `\`\`\`cs\n${field.value}\`\`\``
        this[lang].embed.fields.push(field)
        return this
    }
}