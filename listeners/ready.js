/**
 * 
 */


const _local = process._local
const {client, config} = _local


client.on('ready', async () => {
    try {
        _local.launched = true // разрешаем работу слушателей
        client.user.setActivity('!hh - get help', { type: 'WATCHING' })

        const channelNot = await client.channels.fetch(config.chNot)
        channelNot.send('Я запустился!')
        .catch((err) => {
            console.log('Ошибка отправки сообщения о запуске бота.')
        })

        console.log(` - Бот полностью запущен. (${new Date() - _local.timeStart}ms)`)
    } catch(err) {
        console.log('ОШИБКА В READY:')
        console.log(err)
    }
})