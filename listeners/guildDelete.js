/**
 * событие при удалении бота с сервера
 */

const _local = process._local
const { client, config } = _local


client.on("guildDelete", guild => {
    guild.members.fetch(guild.ownerID)
    .then(owner => {
        owner.send(123)
    })

    const text = ` - remove; name: ${guild.name}; id: ${guild.id}; countMember: ${guild.memberCount};`
    console.log(text)
    client.channels.fetch(config.chNot)
    .then(channel => {
        if (channel) channel.send(text)
        .catch(() => { console.log("Ошибка отправки сообщения при удаленни бота с сервера.") })
    })
})

// guild.joinedTimestamp - время когда бота добавили на сервер
// сделать сообщение embed где указать картинку сервера (icon) и имя сервера (мало ли много серверов у человека)
// а так же сделать изменение дефолтных настроек если на сервере указана локализация не RU и не EU (регион)