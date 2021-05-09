/**
 * 
 */


const _local = process._local
const {client, config} = _local


client.on('ready', () => {
    _local.launched = true // разрешаем работу слушателей
    client.user.setActivity('!hh - get help', { type: 'WATCHING' })

    client.channels.fetch(config.chNot)
    .then(channel => {
        // if (channel) channel.send('Я запустился!') // временно уберу что бы не спамить в тестах
        // .catch((err) => {
        //     // ошибку в логи на серве вывести
        //     console.log('Ошибка отправки сообщения о запуске бота.')
        // })
    })
    // хз нужен ли тут catch блок

    console.log(` - Бот полностью запущен. (${new Date() - _local.timeStart}ms)`)
})