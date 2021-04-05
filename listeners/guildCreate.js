/**
 * событие при добавлении бота на сервер
 */

const _local = process._local
const { client, config } = _local


client.on("guildCreate", guild => {
    guild.members.fetch(guild.ownerID)
    .then(owner => {
        owner.send(123)
    })

    const text = ` + add; name: ${guild.name}; id: ${guild.id}; countMember: ${guild.memberCount};`
    console.log(text)
    client.channels.fetch(config.chNot)
    .then(channel => {
        if (channel) channel.send(text)
        .catch(() => { console.log("Ошибка отправки сообщения при добавлении бота на сервер.") })
    })
})