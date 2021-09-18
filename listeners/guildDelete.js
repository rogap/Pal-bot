/**
 * событие при удалении бота с сервера
 */


const _local = process._local
const {client, config} = _local


client.on('guildDelete', async guild => {
    try {
        const channel = await client.channels.fetch(config.chNot)
        await channel.send({
            embeds: [{
                title: `${guild.name} (${guild.id})`,
                description: '__удален__',
                color: '#C71F1D',
                timestamp: guild.joinedAt,
                footer: {
                    icon_url: config.emptyIcon,
                    text: 'Был добавлен'
                },
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
            }]
        })
    } catch(err) {
        console.log('Ошибка отправки сообщения при удаленни бота с сервера:')
        console.log(err)
    }
})