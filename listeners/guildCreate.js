/**
 * событие при добавлении бота на сервер
 */


const _local = process._local
const {client, config} = _local


client.on('guildCreate', guild => {
    guild.members.fetch(guild.ownerID)
    .then(owner => {
        const guildSettings = _local.guildsSettings.get(guild.id) // получаем настройки сервера
        const settings = guildSettings ? guildSettings : {
            lang: config.lang,
            prefix: config.prefix
        }

        const {lang, prefix} = settings
        const instaledLang = lang == 'ru' ? ':flag_ru:' : ':flag_us:'

        // отправляет приветственное сообщение с информацией создателю сервера (нужно предупредить об этом)
        owner.send({
            embed: {
                description: `**Server name:** ${guild.name}\ \n**Server id:** ${guild.id}`,
                thumbnail: {
                    url: guild.iconURL()
                },
                color: '#22BE2D',
                footer: {
                    icon_url: config.emptyIcon,
                    text: config.copyText
                },
                fields: [
                    {
                        name: ':flag_ru: RUSSIAN:',
                        value: 'Спасибо что используете бота :heart:\ \n' +
                        `Есть вопрос?, предложение? или хочешь быть всегда в курсе событий? - заходи на [сервер бота](${config.discordInvate}).\n` +
                        `**:warning: ВНИМАНИЕ :bangbang:** **__установленный__ язык бота**: ${instaledLang}\n` +
                        '**Для __смены языка__ используйте команду:** ```md\n' +
                        '#Изменить настройки языка для своих команд\n' +
                        `1. [${prefix}](set lang en)\n` +
                        `2. [${prefix}](set lang me ru)\n\n` +
                        '#Изменить настройки языка для сервера\n' +
                        `1. [${prefix}](set lang 605378869691940889 ru)\n` +
                        '#Пример:\n' +
                        `${prefix}set lang me en\n` +
                        `${prefix}set lang 605378869691940889 ru\`\`\`\n` +
                        'Приятного пользования.'
                    },
                    {
                        name: ':flag_us: ENGLISH:',
                        value: 'Thanks for using the bot :heart:\ \n' +
                            `Have a question ?, a suggestion? or do you want to be always up to date? - go to the [bot server](${config.discordInvate}).\n` +
                            `**:warning: WARNING :bangbang:** **__installed__ bot language**: ${instaledLang}\n` +
                            '**To __change the language__, use the command:** ```md\n' +
                            '#Change language settings for your commands\n' +
                            `1. [${prefix}](set lang en)\n` +
                            `2. [${prefix}](set lang me en)\n\n` +
                            '#Change the language settings for the server\n' +
                            `1. [${prefix}](set lang 605378869691940889 en)\n` +
                            '#Example:\n' +
                            `${prefix}set lang me en\n` +
                            `${prefix}set lang 605378869691940889 en\`\`\`\n` +
                            'Enjoy your use.'
                    }
                ]
            }
        })
    })
    .catch(err => {
        // ошибка отправки сообщения
        console.log(err)
    })

    client.channels.fetch(config.chNot)
    .then(channel => {
        if (channel) channel.send({
            embed: {
                title: `${guild.name} (${guild.id})`,
                description: '__добавлен__',
                color: '#22BE2D',
                thumbnail: {
                    url: guild.iconURL()
                },
                fields: [
                    {
                        name: 'Region',
                        value: guild.region,
                        inline: true
                    },
                    {
                        name: 'member count',
                        value: guild.memberCount,
                        inline: true
                    }
                ]
            }
        })
        .catch((err) => {
            // сделать вывод в логи на сервере
            console.log(err)
            console.log('Ошибка отправки сообщения при добавлении бота на сервер.')
        })
    })
})

// сделать изменение дефолтных настроек если на сервере указана локализация не RU и не EU (регион)
// возможно для EU лучше тоже сделать англ
// (preferredLocale?) потом проверять не регион (так как их уже убрали), а "предпочитаемый язык" - он есть только в сообществах