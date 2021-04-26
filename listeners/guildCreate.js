/**
 * событие при добавлении бота на сервер
 */


const _local = process._local
const {client, config} = _local


client.on('guildCreate', guild => {
    guild.members.fetch(guild.ownerID)
    .then(owner => {
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
                        '**:warning: ВНИМАНИЕ :bangbang:** **__установленный__ язык бота**: :flag_ru:\n' +
                        '**Для __смены языка__ используйте команду:** ```md\n' +
                        '#Изменить настройки языка для своих команд\n' +
                        '1. [!setlang](en)\n' +
                        '2. [!setlang](me ru)\n\n' +
                        '#Изменить настройки языка для сервера\n' +
                        '1. [!setlang](605378869691940889 ru)\n' +
                        '2. [!setlang](guild)\n' +
                        '> Во втором случае вам выведет список серверов для которых вы явзляетесь админом и на которых есть бот, что бы вы могли выбрать нужный сервер и скопировав его id.\n\n' +
                        '#Пример:\n' +
                        '!setlang me en\n' +
                        '!setlang 605378869691940889 ru```\n' +
                        'Приятного пользования.'
                    },
                    {
                        name: ':flag_us: ENGLISH:',
                        value: 'Thanks for using the bot :heart:\ \n' +
                            `Have a question ?, a suggestion? or do you want to be always up to date? - go to the [bot server](${config.discordInvate}).\n` +
                            '**:warning: WARNING :bangbang:** **__installed__ bot language**: :flag_ru:\n' +
                            '**To __change the language__, use the command:** ```md\n' +
                            '#Change language settings for your commands\n' +
                            '1. [!setlang](en)\n' +
                            '2. [!setlang](me ru)\n\n' +
                            '#Change the language settings for the server\n' +
                            '1. [!setlang](605378869691940889 en)\n' +
                            '2. [!setlang](guild)\n' +
                            '> In the second case, you will be shown a list of servers for which you are an administrator and on which there is a bot, so that you can select the desired server and copy its id.\n\n' +
                            '#Example:\n' +
                            '!setlang me en\n' +
                            '!setlang 605378869691940889 ru```\n' +
                            'Enjoy your use.'
                    }
                ]
            }
        })
    })
    .catch(err => {
        // ошибка отправки сообщения
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
            console.log('Ошибка отправки сообщения при добавлении бота на сервер.')
        })
    })
})

// сделать изменение дефолтных настроек если на сервере указана локализация не RU и не EU (регион)
// возможно для EU лучше тоже сделать англ
// (preferredLocale?) потом проверять не регион (так как их уже убрали), а "предпочитаемый язык" - он есть только в сообществах