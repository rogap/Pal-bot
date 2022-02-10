/**
 * 
 */


const _local = process._local
const {client, config, utils} = _local
const {sendSite} = utils
const randomUseragent = require('random-useragent')
const steamKey = config.steamKey
const steamAPIUrl = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?format=json&appid=444090&key=${steamKey}`


client.on('ready', async () => {
    try {
        _local.launched = true // разрешаем работу слушателей
        // client.user.setActivity('!hh - get help', { type: 'WATCHING' })
        ;nextTimerActivity(0);

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


function nextTimerActivity(randomMinutes=1) {
    setTimeout(async () => { // данные на сервере (запись в имя голосовых каналов)
        const randomMinutes = 1 + Math.random() * 3
        try {
            randomAction()
            nextTimerActivity(randomMinutes)
        } catch(err) {
            console.log(err)
            nextTimerActivity(randomMinutes)
        }
    }, 1000 * 60 * randomMinutes)
}


async function randomAction() {
    try {
        const actions = ['streaming', 'steam', 'help', 'used']
        const randNum = Math.ceil(Math.random() * actions.length) - 1
        const trandType = actions[randNum]
        console.log(`set activity: ${trandType}`)

        if (trandType == 'streaming') {
            client.user.setPresence({
                activities: [{
                    name: 'Bot commands',
                    type: 'STREAMING',
                    url: 'https://www.youtube.com/watch?v=y6ibbpGXjSQ'
                }],
                status: 'online'
            })
        } else if (trandType == 'steam') {
            const steamCountPlayers = await getSteamData()

            client.user.setPresence({
                activities: [{
                    name: `Steam: ${steamCountPlayers} players.`,
                    type: 'PLAYING'
                }],
                status: 'online'
            })
        } else if (trandType == 'help') {
            client.user.setPresence({
                activities: [{
                    name: '!help - get help',
                    type: 'WATCHING'
                }],
                status: 'online'
            })
        } else if (trandType == 'used') {
            const find = await _local.models.commandsStats.find()
            const data = find[find.length - 1]

            client.user.setPresence({
                activities: [{
                    name: `Servers: ${data.servers} | Command used: ${data.usedCommands}`,
                    type: 'WATCHING'
                }],
                status: 'online'
            })
        }
    } catch(err) {
        console.log(err)
    }
}


async function getSteamData() {
    try {
        const steamData = await sendSite({
            url: steamAPIUrl,
            method: 'GET',
            json: true,
            headers: {
                'User-Agent': randomUseragent.getRandom()
            }
        })
        const body = steamData.body
        const count = body.response.player_count

        return count
    } catch(err) {
        console.log(JSON.stringify(err))
        return '-err-'
    }
}