/**
 * функция обрабатывающая команду (устаревшие)
 */


const _local = process._local
const {config} = _local


module.exports = async (message, settings, command, contentParams) => {
    try {
        const {lang, commands} = settings
        const chType = message.channel.type
        const toPM = chType == 'DM' || chType == 'unknown' || chType == 'GROUP_DM'

        if (contentParams) {
            // проверяем есть ли такая команда
            // если есть параметры то вызываем функцию details указанной команды
            const com = commands.get(contentParams)
            if (!com) throw {
                err_msg: {
                    ru: 'Указанная команда не найдена.',
                    en: 'The specified command was not found.'
                }
            }

            const details = com.details(settings, com)[lang]
            await message.author.send(details)

            if (!toPM) {
                await message.sendCheckIn({
                    ru: 'Сообщение было отправлено вам в ЛС.',
                    en: 'A message has been sent to PM.'
                }[lang])
            }
        } else {
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

            details.ru.embeds[0].description = `Префикс: **${settings.prefix}**`
            details.en.embeds[0].description = `Prefix: **${settings.prefix}**`

            const contentRep = {
                ru: `Есть вопросы?, предложения? или хотите быть в курсе событий? - присоединяйтесь к серверу бота: ${config.discordInvate}`,
                en: `Any questions ?, suggestions? or want to keep abreast of events? - join the bot server: ${config.discordInvate}`
            }
            details.ru.content = `${config.news.ru}${contentRep.ru}`
            details.en.content = `${config.news.en}${contentRep.en}`

            await message.author.send(details[lang])

            if (!toPM) {
                await message.sendCheckIn({
                    ru: 'Сообщение было отправлено вам в ЛС.',
                    en: 'A message has been sent to PM.'
                }[lang])
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
            log_msg: 'hh.command'
        }
    }
}


class Details { // временный фикс, потом перенесу, навреное
    constructor() {
        for (let lang in config.langs) {
            this[lang] = {
                embeds: [{
                    title: '',
                    fields: [],
                    footer: {
                        icon_url: config.emptyIcon,
                        text: config.copyText
                    }
                }]
            }
        }
    }

    setTitle(lang, title) {
        this[lang].embeds[0].title = title
        return this
    }

    setFields(lang, field) {
        field.value = `\`\`\`cs\n${field.value}\`\`\``
        this[lang].embeds[0].fields.push(field)
        return this
    }
}