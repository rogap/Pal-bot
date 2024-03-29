'use strict';
/**
 * запуск бота
 */


const Discord = require('discord.js')
// const { Intents, Client } = require('discord.js')
const Intents = Discord.Intents
const client = new Discord.Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING
], partials: ["CHANNEL"] })

const path = require('path')
const config = require(path.join(__dirname, 'config', 'main.js'))

// обьект бота, в начале launched = false (все обработчики на паузе)
const _local = {
    Discord,
    client,
    config,
    launched: false,
    timeStart: new Date(),
    path: __dirname,
    models: {}
}
// champions, usersSettings, guildsSettings, commands
process._local = _local // для передачи данных между скриптами


_local.config.defaultPathToImg = path.join(__dirname, 'img', 'maps', 'test maps.jpg') // ????????


_local.utils = require(path.join(__dirname, 'utils', 'main.js'))
_local.classes = require(path.join(__dirname, 'classes', 'main.js'))


const {CommandsManager} = _local.classes
_local.commands = new CommandsManager() // добавляем дефолтные команды в быстрый доступ
// console.log(_local.commands)


;(async () => {
    try {
        const timeStart = new Date() // время старта загрузки

        console.log('> Подключение к БД...')
        const database = await require(path.join(__dirname, 'connections', 'mongoose.js'))
        if (!database.status) throw database

        // забираем сессию с БД
        const session = await _local.models.session.find()
        if (session.length > 1) console.log('ИМЕЕТ БОЛЕЕ 1 СОХРАНЕННОЙ СЕССИИ!!!')
        _local.session = session[0] || {}
        // console.log('session', _local.session)

        // добавляем API хайрезов
        _local.hirez = new _local.classes.API(config.devId, config.authKey)
        // const test = await _local.hirez.getchampions(11)
        // console.log(test)

        console.log('> Загрузка данных...')
        const loadData = await require(path.join(__dirname, 'loading', 'main.js'))
        if (!loadData.status) throw loadData
        console.log(`> Данные успешно загружены (${new Date - timeStart}ms)`)

        // загружаем обработчики
        const listeners = require(path.join(__dirname, 'listeners', 'main.js'))
        if (!listeners) return; // если ошибка загрузки

        console.log(' # Начинаю запуск клиента бота...')
        client.login(config.discordToken)
    } catch(err) {
        console.log('try/catch')
        console.log(err)
    }
})();


setInterval(async () => { // очистка кэша
    try {
        const child_process = require('child_process')
        await child_process.execSync('sudo -i')
        await child_process.execSync('sync; echo 1 > /proc/sys/vm/drop_caches')
        await child_process.execSync('sync; echo 2 > /proc/sys/vm/drop_caches')
        await child_process.execSync('sync; echo 3 > /proc/sys/vm/drop_caches')
    } catch(err) {
        console.log(err)
    }
}, 1000 * 60 * 60) // каждый час


function nextTimerUser(randomMinutes=1) {
    setTimeout(async () => { // данные на сервере (запись в имя голосовых каналов)
        const randomMinutes = 3 + Math.random() * 2
        try {
            const find = await _local.models.commandsStats.find()
            const data = find[find.length - 1]
            const chUsers = await client.channels.fetch(config.chShowUsers)
            await chUsers.setName(`Users: ${data.users}`)
            nextTimerUser(randomMinutes)
        } catch(err) {
            console.log(err)
            nextTimerUser(randomMinutes)
        }
    }, 1000 * 60 * randomMinutes)
}
;nextTimerUser(1);

function nextTimerServers(randomMinutes=1) {
    setTimeout(async () => { // данные на сервере (запись в имя голосовых каналов)
        const randomMinutes = 3 + Math.random() * 2
        try {
            const find = await _local.models.commandsStats.find()
            const data = find[find.length - 1]
            const chServers = await client.channels.fetch(config.chShowServers)
            await chServers.setName(`Servers: ${data.servers}`)
            nextTimerServers(randomMinutes)
        } catch(err) {
            console.log(err)
            nextTimerServers(randomMinutes)
        }
    }, 1000 * 60 * randomMinutes)
}
;nextTimerServers(2);

function nextTimerUsed(randomMinutes=1) {
    setTimeout(async () => { // данные на сервере (запись в имя голосовых каналов)
        const randomMinutes = 3 + Math.random() * 2
        try {
            const find = await _local.models.commandsStats.find()
            const data = find[find.length - 1]
            const chCommands = await client.channels.fetch(config.chShowCommands)
            await chCommands.setName(`Used: ${data.usedCommands}`)
            nextTimerUsed(randomMinutes)
        } catch(err) {
            console.log(err)
            nextTimerUsed(randomMinutes)
        }
    }, 1000 * 60 * randomMinutes)
}
;nextTimerUsed(3);



// const memory = []
// const bytesToMb = bytes => Math.round(bytes / 1000, 2) / 1000
// const { memoryUsage } = require('process')
// setInterval(() => {
//     // if (memory.length >= 10) memory.shift()
//     console.clear()
//     const usage = process.memoryUsage()
//     const row = {
//         rss: bytesToMb(usage.rss),
//         heapTotal: bytesToMb(usage.heapTotal),
//         heapUsed: bytesToMb(usage.heapUsed),
//         external: bytesToMb(usage.external), // c++
//         stack: bytesToMb(usage.rss - usage.heapTotal)
//     }

//     memory.push(row)
//     console.table(memory)
// }, 1000)